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

export interface Job {
  id: number;
  jobTitle: string;
  companyName: string;
  jobDescriptionPreview: string;
  jobDescriptionLength: number;
  jobUrl?: string;
  status: string;
  createdAt: string;
}

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
