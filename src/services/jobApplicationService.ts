import api from "../utils/api";
import type {
  JobApplication,
  ApplicationStats,
  ApplyToJobRequest,
  UpdateApplicationStatusRequest,
} from "../types";

class JobApplicationService {
  /**
   * Mark a job as applied
   */
  async applyToJob(request: ApplyToJobRequest): Promise<JobApplication> {
    const response = await api.post<JobApplication>(
      "/jobapplication/apply",
      request
    );
    return response.data;
  }

  /**
   * Get all applications for current user
   */
  async getMyApplications(status?: string): Promise<JobApplication[]> {
    const params = status ? { status } : {};
    const response = await api.get<JobApplication[]>("/jobapplication", {
      params,
    });
    return response.data;
  }

  /**
   * Get application statistics
   */
  async getStats(): Promise<ApplicationStats> {
    const response = await api.get<ApplicationStats>("/jobapplication/stats");
    return response.data;
  }

  /**
   * Update application status
   */
  async updateStatus(
    id: number,
    request: UpdateApplicationStatusRequest
  ): Promise<JobApplication> {
    const response = await api.put<JobApplication>(
      `/jobapplication/${id}/status`,
      request
    );
    return response.data;
  }

  /**
   * Delete an application
   */
  async deleteApplication(id: number): Promise<void> {
    await api.delete(`/jobapplication/${id}`);
  }
}

export default new JobApplicationService();
