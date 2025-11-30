import api from "../utils/api";
import type { Resume, ResumeUploadResponse } from "../types";

class ResumeService {
  /**
   * Upload a resume file
   */
  async upload(file: File): Promise<ResumeUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ResumeUploadResponse>(
      "/resume/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }

  /**
   * Get all resumes for current user
   */
  async getMyResumes(): Promise<Resume[]> {
    const response = await api.get<Resume[]>("/resume/my-resumes");
    return response.data;
  }

  /**
   * Get a specific resume by ID
   */
  async getById(id: number): Promise<Resume> {
    const response = await api.get<Resume>(`/resume/${id}`);
    return response.data;
  }

  /**
   * Delete a resume
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/resume/${id}`);
  }
}

export default new ResumeService();
