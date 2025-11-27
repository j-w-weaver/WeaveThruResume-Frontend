// ============================================
// AUTH TYPES
// ============================================

/**
 * Represents a user in the system.
 * Matches the User entity from your backend.
 */
export interface User {
  id: number;
  email: string;
  name: string;
}

/**
 * Request payload for user login.
 * Sent to POST /api/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Request payload for user registration.
 * Sent to POST /api/auth/register
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Response from login/register endpoints.
 * Contains JWT token and user info.
 */
export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

// ============================================
// RESUME TYPES
// ============================================

/**
 * Represents a resume document.
 * Matches your Resume entity from backend.
 */
export interface Resume {
  id: number;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  parsedContentPreview: string;
}

/**
 * Response after uploading a resume.
 * Returned from POST /api/resume/upload
 */
export interface ResumeUploadResponse {
  id: number;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

// ============================================
// JOB TYPES
// ============================================

/**
 * Represents a job application/description.
 * Matches your JobApplication entity.
 */
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

/**
 * Request to create a new job description.
 * Sent to POST /api/jobs
 */
export interface CreateJobRequest {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  jobUrl?: string;
}

// ============================================
// ANALYSIS TYPES
// ============================================

/**
 * Represents a gap between resume and job requirements.
 */
export interface Gap {
  category: string;
  gap: string;
  importance: string;
}

/**
 * Represents an AI-generated recommendation.
 */
export interface Recommendation {
  section: string;
  instruction: string;
  suggestedText: string;
  selected: boolean;
}

/**
 * Full analysis result with gaps and recommendations.
 * Returned from POST /api/analysis
 */
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

/**
 * Summary view of an analysis (for list views).
 * Returned from GET /api/analysis/my-analyses
 */
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

/**
 * Request to create a new analysis.
 * Sent to POST /api/analysis
 */
export interface CreateAnalysisRequest {
  resumeId: number;
  jobApplicationId: number;
  industry: string;
  specialization?: string;
}

/**
 * Request to update selected recommendations.
 * Sent to PUT /api/analysis/{id}/recommendations
 */
export interface UpdateRecommendationsRequest {
  selectedIndices: number[];
}

// ============================================
// API ERROR TYPES
// ============================================

/**
 * Standard error response from the API.
 * Matches ASP.NET Core ProblemDetails format.
 */
export interface ApiError {
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
