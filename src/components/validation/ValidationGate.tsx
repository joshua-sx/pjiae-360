import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAsyncOperation, useBatchOperation } from '@/components/performance/LoadingManager';
import { withRetryAndErrorHandling } from '@/lib/enhanced-error-handling';

interface ValidationRule<T> {
  id: string;
  name: string;
  description: string;
  validator: (data: T) => Promise<{ valid: boolean; errors: string[]; warnings: string[] }>;
  critical: boolean;
  dependencies?: string[];
}

interface ValidationResult {
  ruleId: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  duration: number;
}

interface ValidationGateProps<T> {
  data: T;
  rules: ValidationRule<T>[];
  onValidationComplete: (results: ValidationResult[], canProceed: boolean) => void;
  title?: string;
  description?: string;
  autoStart?: boolean;
  showProgress?: boolean;
  allowPartialPass?: boolean;
}

// Comprehensive validation gate component
export function ValidationGate<T>({
  data,
  rules,
  onValidationComplete,
  title = "Validation Check",
  description = "Validating your data before proceeding...",
  autoStart = true,
  showProgress = true,
  allowPartialPass = false
}: ValidationGateProps<T>) {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const { executeOperation } = useAsyncOperation();
  const { executeBatch } = useBatchOperation();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sort rules by dependencies and criticality
  const sortedRules = React.useMemo(() => {
    const ruleMap = new Map(rules.map(rule => [rule.id, rule]));
    const sorted: ValidationRule<T>[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    function visit(ruleId: string) {
      if (visited.has(ruleId)) return;
      if (visiting.has(ruleId)) {
        throw new Error(`Circular dependency detected in validation rules: ${ruleId}`);
      }

      visiting.add(ruleId);
      const rule = ruleMap.get(ruleId);
      if (!rule) return;

      // Visit dependencies first
      rule.dependencies?.forEach(depId => visit(depId));
      
      visiting.delete(ruleId);
      visited.add(ruleId);
      sorted.push(rule);
    }

    // Sort by critical rules first, then by dependencies
    const criticalRules = rules.filter(r => r.critical).map(r => r.id);
    const nonCriticalRules = rules.filter(r => !r.critical).map(r => r.id);
    
    [...criticalRules, ...nonCriticalRules].forEach(id => visit(id));
    
    return sorted;
  }, [rules]);

  const runValidation = useCallback(async () => {
    if (isValidating) return;
    
    setIsValidating(true);
    setResults([]);
    setCurrentRuleIndex(0);
    setCanProceed(false);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    try {
      const validationResults: ValidationResult[] = [];
      
      // Run validations sequentially to handle dependencies
      for (let i = 0; i < sortedRules.length; i++) {
        const rule = sortedRules[i];
        setCurrentRuleIndex(i);

        // Check if validation should be aborted
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        const startTime = Date.now();
        
        try {
          const result = await withRetryAndErrorHandling(
            () => rule.validator(data),
            {
              maxRetries: rule.critical ? 3 : 1,
              context: `Validation rule: ${rule.name}`
            }
          );

          const validationResult: ValidationResult = {
            ruleId: rule.id,
            valid: result.valid,
            errors: result.errors,
            warnings: result.warnings,
            duration: Date.now() - startTime
          };

          validationResults.push(validationResult);
          setResults(prev => [...prev, validationResult]);

          // Stop on critical failure unless partial pass is allowed
          if (!result.valid && rule.critical && !allowPartialPass) {
            break;
          }
        } catch (error) {
          const validationResult: ValidationResult = {
            ruleId: rule.id,
            valid: false,
            errors: [error instanceof Error ? error.message : 'Validation failed'],
            warnings: [],
            duration: Date.now() - startTime
          };

          validationResults.push(validationResult);
          setResults(prev => [...prev, validationResult]);

          // Stop on critical failure
          if (rule.critical && !allowPartialPass) {
            break;
          }
        }
      }

      // Determine if we can proceed
      const criticalFailures = validationResults.filter(r => !r.valid && 
        sortedRules.find(rule => rule.id === r.ruleId)?.critical
      );
      const canPass = criticalFailures.length === 0 || allowPartialPass;
      
      setCanProceed(canPass);
      onValidationComplete(validationResults, canPass);
      
    } catch (error) {
      console.error('Validation process failed:', error);
    } finally {
      setIsValidating(false);
      abortControllerRef.current = null;
    }
  }, [data, sortedRules, allowPartialPass, isValidating, onValidationComplete]);

  const cancelValidation = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsValidating(false);
  }, []);

  // Auto-start validation
  useEffect(() => {
    if (autoStart && sortedRules.length > 0) {
      runValidation();
    }
  }, [autoStart, sortedRules.length, runValidation]);

  const progress = sortedRules.length > 0 ? (currentRuleIndex / sortedRules.length) * 100 : 0;
  const completedRules = results.length;
  const passedRules = results.filter(r => r.valid).length;
  const failedRules = results.filter(r => !r.valid).length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isValidating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="h-5 w-5" />
            </motion.div>
          ) : canProceed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress indicator */}
        {showProgress && sortedRules.length > 0 && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {isValidating ? 'Validating...' : 'Complete'} 
                ({completedRules}/{sortedRules.length})
              </span>
              <span>
                {passedRules} passed, {failedRules} failed
              </span>
            </div>
          </div>
        )}

        {/* Validation results */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {results.map((result, index) => {
              const rule = sortedRules.find(r => r.id === result.ruleId);
              if (!rule) return null;

              return (
                <motion.div
                  key={result.ruleId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border ${
                    result.valid 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                      : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {result.valid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium text-sm">{rule.name}</span>
                        {rule.critical && (
                          <Badge variant="destructive" className="text-xs">
                            Critical
                          </Badge>
                        )}
                      </div>
                      
                      {rule.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {rule.description}
                        </p>
                      )}

                      {/* Errors */}
                      {result.errors.length > 0 && (
                        <ul className="text-xs text-red-600 dark:text-red-400 mt-2 list-disc list-inside">
                          {result.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      )}

                      {/* Warnings */}
                      {result.warnings.length > 0 && (
                        <ul className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 list-disc list-inside">
                          {result.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {result.duration}ms
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {!isValidating && (
            <Button 
              onClick={runValidation}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-validate
            </Button>
          )}
          
          {isValidating && (
            <Button 
              onClick={cancelValidation}
              variant="destructive"
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-built validation rules for common scenarios
export const commonValidationRules = {
  dataPresence: function<T>(field: keyof T, name: string): ValidationRule<T> {
    return {
      id: `presence-${String(field)}`,
      name: `${name} Required`,
      description: `${name} must be provided`,
      critical: true,
      validator: async (data) => {
        const value = data[field];
        const valid = value !== null && value !== undefined && value !== '';
        return {
          valid,
          errors: valid ? [] : [`${name} is required`],
          warnings: []
        };
      }
    };
  },

  emailFormat: function<T>(field: keyof T): ValidationRule<T> {
    return {
      id: `email-${String(field)}`,
      name: 'Email Format',
      description: 'Email must be in valid format',
      critical: false,
      validator: async (data) => {
        const email = data[field] as string;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const valid = !email || emailRegex.test(email);
        return {
          valid,
          errors: valid ? [] : ['Invalid email format'],
          warnings: []
        };
      }
    };
  },

  uniqueness: function<T>(
    field: keyof T,
    checkFunction: (value: any) => Promise<boolean>,
    name: string
  ): ValidationRule<T> {
    return {
      id: `unique-${String(field)}`,
      name: `${name} Uniqueness`,
      description: `${name} must be unique`,
      critical: true,
      validator: async (data) => {
        const value = data[field];
        if (!value) return { valid: true, errors: [], warnings: [] };
        
        const isUnique = await checkFunction(value);
        return {
          valid: isUnique,
          errors: isUnique ? [] : [`${name} already exists`],
          warnings: []
        };
      }
    };
  }
};