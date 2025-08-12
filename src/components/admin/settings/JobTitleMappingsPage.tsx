import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { Plus, Search, Zap } from 'lucide-react';
import { useJobTitleMappings } from '@/hooks/useJobTitleMappings';
import { useRoleInference } from '@/hooks/useRoleInference';
import { JobTitleMappingDialog } from './JobTitleMappingDialog';
import { createJobTitleMappingColumns } from './job-title-mapping-columns';
import type { JobTitleMapping } from '@/hooks/useJobTitleMappings';

export default function JobTitleMappingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<JobTitleMapping | null>(null);

  const { 
    mappings, 
    isLoading, 
    createMapping, 
    updateMapping, 
    deleteMapping,
    isCreating,
    isUpdating,
    isDeleting
  } = useJobTitleMappings();

  const { applyBulkInference, isBulkInferenceLoading } = useRoleInference();

  const filteredMappings = mappings.filter(mapping =>
    mapping.normalized_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.synonyms.some(synonym => 
      synonym.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleCreateMapping = () => {
    setSelectedMapping(null);
    setShowMappingDialog(true);
  };

  const handleEditMapping = (mapping: JobTitleMapping) => {
    setSelectedMapping(mapping);
    setShowMappingDialog(true);
  };

  const handleDeleteMapping = (mapping: JobTitleMapping) => {
    if (confirm(`Are you sure you want to delete the mapping for "${mapping.normalized_title}"?`)) {
      deleteMapping(mapping.id);
    }
  };

  const handleMappingSubmit = (mappingData: Partial<JobTitleMapping>) => {
    if (selectedMapping) {
      updateMapping({ id: selectedMapping.id, ...mappingData });
    } else {
      createMapping(mappingData as Omit<JobTitleMapping, 'id' | 'created_at' | 'organization_id'>);
    }
    setShowMappingDialog(false);
  };

  const columns = createJobTitleMappingColumns({
    onEdit: handleEditMapping,
    onDelete: handleDeleteMapping,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Title Mappings"
        description="Configure how job titles are mapped to roles for automatic role assignment"
      >
        <div className="flex gap-2">
          <Button 
            onClick={() => applyBulkInference()}
            disabled={isBulkInferenceLoading}
            variant="outline"
          >
            <Zap className="mr-2 h-4 w-4" />
            {isBulkInferenceLoading ? 'Applying...' : 'Reapply All Roles'}
          </Button>
          <Button onClick={handleCreateMapping}>
            <Plus className="mr-2 h-4 w-4" />
            Add Mapping
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Job Title to Role Mappings</CardTitle>
          <CardDescription>
            Define how job titles should be automatically mapped to organizational roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mappings by job title, role, or synonyms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <DataTable
              columns={columns}
              data={filteredMappings}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <JobTitleMappingDialog
        open={showMappingDialog}
        onOpenChange={setShowMappingDialog}
        mapping={selectedMapping}
        onSubmit={handleMappingSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}