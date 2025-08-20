export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  avatar?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  rating?: number;
  feedback?: string;
}

export interface Competency {
  id: string;
  title: string;
  description: string;
  rating?: number;
  feedback?: string;
}

export interface AppraisalData {
  employeeId: string;
  goals: Goal[];
  competencies: Competency[];
  overallRating?: number;
  status: 'draft' | 'with_second_appraiser' | 'awaiting_employee' | 'complete';
  phase?: 'goal_setting' | 'self_assessment' | 'manager_review' | 'calibration' | 'finalization' | 'acknowledgment' | 'complete';
  version?: number;
  parent_appraisal_id?: string;
  amendment_reason?: string;
  locked_for_amendment?: boolean;
  signatures: {
    appraiser?: string;
    secondAppraiser?: string;
    employee?: string;
  };
  timestamps: {
    created: Date;
    lastModified: Date;
    submitted?: Date;
    completed?: Date;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  details: string;
}

export interface Step {
  id: number;
  title: string;
  description: string;
}