
import { Employee, Goal, Competency, AuditLogEntry } from './types';

export const mockEmployees: Employee[] = [
  { id: "1", name: "Sarah Johnson", department: "Engineering", position: "Senior Developer", avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=faces" },
  { id: "2", name: "Michael Chen", department: "Marketing", position: "Marketing Manager", avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=faces" },
  { id: "3", name: "Emily Rodriguez", department: "Sales", position: "Sales Representative", avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=faces" },
  { id: "4", name: "David Thompson", department: "HR", position: "HR Specialist", avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=faces" },
  { id: "5", name: "Lisa Wang", department: "Finance", position: "Financial Analyst", avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=faces" }
];

export const mockGoals: Goal[] = [
  { id: "g1", title: "Increase Team Productivity", description: "Lead initiatives to improve team efficiency by 20% through process optimization and tool implementation." },
  { id: "g2", title: "Complete Professional Development", description: "Attend 3 industry conferences and obtain relevant certification to enhance technical skills." },
  { id: "g3", title: "Mentor Junior Staff", description: "Provide guidance and support to 2 junior team members throughout the year." },
  { id: "g4", title: "Client Satisfaction Improvement", description: "Achieve 95% client satisfaction rating through improved communication and service delivery." }
];

export const mockCompetencies: Competency[] = [
  { id: "c1", title: "Communication", description: "Effectively communicates ideas, listens actively, and adapts communication style to audience." },
  { id: "c2", title: "Problem Solving", description: "Identifies issues, analyzes root causes, and develops creative solutions." },
  { id: "c3", title: "Leadership", description: "Inspires and motivates others, delegates effectively, and takes accountability." },
  { id: "c4", title: "Adaptability", description: "Embraces change, learns quickly, and maintains effectiveness in dynamic environments." },
  { id: "c5", title: "Collaboration", description: "Works effectively with others, builds relationships, and contributes to team success." }
];

export const mockAuditLog: AuditLogEntry[] = [
  { id: "1", timestamp: new Date(Date.now() - 86400000), action: "Appraisal Created", user: "John Manager", details: "New appraisal created for Sarah Johnson" },
  { id: "2", timestamp: new Date(Date.now() - 43200000), action: "Goals Rated", user: "John Manager", details: "Performance goals completed and rated" },
  { id: "3", timestamp: new Date(Date.now() - 21600000), action: "Draft Saved", user: "John Manager", details: "Appraisal saved as draft" }
];

export const steps = [
  { id: 1, title: "Goals", description: "Grade Performance Goals" },
  { id: 2, title: "Competencies", description: "Grade Core Competencies" },
  { id: 3, title: "Review & Sign-Off", description: "Calculate & Review Overall Rating" }
];
