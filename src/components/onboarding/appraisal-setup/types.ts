export interface Competency {
  name: string;
  description: string;
  optional?: boolean;
  applicable?: boolean;
}

export interface CycleData {
  frequency: "annual" | "bi-annual";
  cycleName: string;
  startDate: string;
  goalSettingWindows: Array<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  }>;
  reviewPeriods: Array<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    goalWindowId: string;
  }>;
  competencyCriteria: {
    enabled: boolean;
    model: string;
    customCriteria: string[];
    scoringSystem: string;
    competencies?: Competency[];
  };
  notifications: {
    enabled: boolean;
    email: boolean;
    emailAddress: string;
    reminders: boolean;
    deadlines: boolean;
  };
}

export const defaultCycleData: CycleData = {
  frequency: "annual",
  cycleName: "2024 Annual Performance Review",
  startDate: new Date().toISOString().split('T')[0],
  goalSettingWindows: [{
    id: "gsw-1",
    name: "Q1 Goal Setting",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31")
  }],
  reviewPeriods: [{
    id: "rp-1",
    name: "Mid-Year Review",
    startDate: new Date("2024-06-01"),
    endDate: new Date("2024-06-30"),
    goalWindowId: "gsw-1"
  }, {
    id: "rp-2",
    name: "Year-End Review",
    startDate: new Date("2024-12-01"),
    endDate: new Date("2024-12-31"),
    goalWindowId: "gsw-1"
  }],
  competencyCriteria: {
    enabled: true,
    model: "pjiae",
    customCriteria: [],
    scoringSystem: "5-point-scale",
    competencies: [{
      name: "Job Knowledge",
      description: "Understanding of responsibilities, procedures, and required skills."
    }, {
      name: "Quality of Work",
      description: "Accuracy, thoroughness, and attention to detail in tasks."
    }, {
      name: "Productivity",
      description: "Amount of work completed efficiently and effectively."
    }, {
      name: "Initiative",
      description: "Willingness to take on responsibilities, show independence, and go beyond expectations."
    }, {
      name: "Communication Skills",
      description: "Ability to clearly convey information both verbally and in writing."
    }, {
      name: "Teamwork",
      description: "Willingness to cooperate, support team efforts, and contribute to group objectives."
    }, {
      name: "Adaptability/Flexibility",
      description: "Openness to change and ability to adjust to new challenges."
    }, {
      name: "Dependability",
      description: "Reliability in attendance, meeting deadlines, and following through on commitments."
    }]
  },
  notifications: {
    enabled: true,
    email: true,
    emailAddress: "hr@company.com",
    reminders: true,
    deadlines: true
  }
};