import api from "../utils/api";
import type { Job, CreateJobRequest, JobStats } from "../types";

class JobService {
  /**
   * Create a new job application
   */
  async create(data: CreateJobRequest): Promise<Job> {
    const response = await api.post<Job>("/job", data);
    return response.data;
  }

  /**
   * Get all job applications for current user
   */
  async getMyJobs(): Promise<Job[]> {
    const response = await api.get<Job[]>("/job/my-jobs");
    return response.data;
  }

  /**
   * Get a specific job by ID
   */
  async getById(id: number): Promise<Job> {
    const response = await api.get<Job>(`/job/${id}`);
    return response.data;
  }

  /**
   * Update a job application
   */
  async update(id: number, data: Partial<CreateJobRequest>): Promise<Job> {
    const response = await api.put<Job>(`/job/${id}/status`, data);
    return response.data;
  }

  /**
   * Delete a job application
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/job/${id}`);
  }

  async updateStatus(
    id: number,
    status: string,
    interviewDate?: string,
    interviewType?: string,
    notes?: string,
    applicationMethod?: string
  ): Promise<Job> {
    const response = await api.put<Job>(`/job/${id}/status`, {
      status,
      interviewDate,
      interviewType,
      notes,
      applicationMethod,
    });
    return response.data;
  }

  async getStats(): Promise<JobStats> {
    const response = await api.get<JobStats>("/job/stats");
    return response.data;
  }

  async markAsApplied(
    id: number,
    appliedDate?: string,
    applicationMethod?: string,
    notes?: string
  ): Promise<Job> {
    const response = await api.post<Job>(`/job/${id}/apply`, {
      appliedDate,
      applicationMethod,
      notes,
    });
    return response.data;
  }
}

export default new JobService();
