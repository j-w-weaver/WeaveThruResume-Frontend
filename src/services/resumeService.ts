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

  /**
   * Get resume content as HTML for editing
   */
  async getResumeAsHtml(resumeId: number): Promise<string> {
    const response = await api.get<{ html: string }>(
      `/resume/${resumeId}/html`
    );
    return response.data.html;
  }

  /**
   * Export edited resume as DOCX
   */
  async exportEditedResume(resumeId: number, html: string): Promise<Blob> {
    const response = await api.post(
      `/resume/${resumeId}/export`,
      { html },
      { responseType: "blob" }
    );
    return response.data;
  }

  /**
   * Export resume with AI recommendations appended (preserves original formatting)
   */
  async exportResumeWithRecommendations(
    resumeId: number,
    recommendations: Array<{ category: string; suggestion: string }>
  ): Promise<Blob> {
    const response = await api.post(
      `/resume/${resumeId}/export-with-recommendations`,
      { recommendations },
      { responseType: "blob" }
    );
    return response.data;
  }
}

export default new ResumeService();
