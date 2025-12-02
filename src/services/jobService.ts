import api from "../utils/api";
import type { Job, CreateJobRequest } from "../types";

class JobService {
  /**
   * Create a new job application
   */
  async create(data: CreateJobRequest): Promise<Job> {
    const response = await api.post<Job>("/jobs", data);
    return response.data;
  }

  /**
   * Get all job applications for current user
   */
  async getMyJobs(): Promise<Job[]> {
    const response = await api.get<Job[]>("/jobs/my-jobs");
    return response.data;
  }

  /**
   * Get a specific job by ID
   */
  async getById(id: number): Promise<Job> {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  }

  /**
   * Update a job application
   */
  async update(id: number, data: Partial<CreateJobRequest>): Promise<Job> {
    const response = await api.put<Job>(`/jobs/${id}/status`, data);
    return response.data;
  }

  /**
   * Delete a job application
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/jobs/${id}`);
  }
}

export default new JobService();
