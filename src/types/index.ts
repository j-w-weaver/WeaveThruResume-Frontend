// ============================================
// AUTH TYPES
// ============================================

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

// ============================================
// RESUME TYPES
// ============================================

export interface Resume {
  id: number;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  parsedContentPreview: string;
}

export interface ResumeUploadResponse {
  id: number;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

// ============================================
// JOB TYPES
// ============================================

export interface CreateJobRequest {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  jobUrl?: string;
}

// ============================================
// ANALYSIS TYPES
// ============================================

export interface Gap {
  category: string;
  gap: string;
  importance: string;
}

export interface Recommendation {
  section: string;
  instruction: string;
  suggestedText: string;
  selected: boolean;
}

export interface Analysis {
  id: number;
  resumeId: number;
  jobApplicationId: number;
  industry: string;
  specialization?: string;
  matchScore: number;
  gaps: Gap[];
  recommendations: Recommendation[];
  createdAt: string;
}

export interface AnalysisSummary {
  id: number;
  resumeId: number;
  jobApplicationId: number;
  industry: string;
  specialization?: string;
  matchScore: number;
  gapCount: number;
  recommendationCount: number;
  selectedRecommendationCount: number;
  createdAt: string;
}

export interface CreateAnalysisRequest {
  resumeId: number;
  jobApplicationId: number;
  industry: string;
  specialization?: string;
}

export interface UpdateRecommendationsRequest {
  selectedIndices: number[];
}

// ============================================
// API ERROR TYPES
// ============================================

export interface ApiError {
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

export interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  appliedDate: string;
  applicationMethod?: string;
  contactPerson?: string;
  contactEmail?: string;
  notes?: string;
  interviewDate?: string;
  interviewType?: string;
  followUpDate?: string;
  lastActivityDate: string;
}

export type ApplicationStatus =
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export interface ApplicationStats {
  applied: number;
  interviewing: number;
  offer: number;
  rejected: number;
  withdrawn: number;
  total: number;
}

export interface ApplyToJobRequest {
  jobId: number;
  appliedDate?: string;
  applicationMethod?: string;
  notes?: string;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  interviewDate?: string;
  interviewType?: string;
  notes?: string;
}

// Job Application (Job Tracking)
export interface Job {
  id: number;
  userId: number;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  jobDescriptionPreview: string;
  jobDescriptionLength: number;
  jobUrl?: string;
  status: JobStatus;
  appliedDate?: string;
  applicationMethod?: string;
  contactPerson?: string;
  contactEmail?: string;
  notes?: string;
  interviewDate?: string;
  interviewType?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus =
  | "Interested"
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export interface JobStats {
  interested: number;
  applied: number;
  interviewing: number;
  offer: number;
  rejected: number;
  withdrawn: number;
  total: number;
}
