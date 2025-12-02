import api from "../utils/api";
import type {
  Analysis,
  AnalysisSummary,
  CreateAnalysisRequest,
  UpdateRecommendationsRequest,
} from "../types";

class AnalysisService {
  /**
   * Create a new analysis
   */
  async create(data: CreateAnalysisRequest): Promise<Analysis> {
    const response = await api.post<Analysis>("/analysis", data);
    return response.data;
  }

  /**
   * Get all analyses for current user (summaries)
   */
  async getMyAnalyses(): Promise<AnalysisSummary[]> {
    const response = await api.get<AnalysisSummary[]>("/analysis/my-analyses");
    return response.data;
  }

  /**
   * Get a specific analysis by ID (full details)
   */
  async getById(id: number): Promise<Analysis> {
    const response = await api.get<Analysis>(`/analysis/${id}`);
    return response.data;
  }

  /**
   * Update selected recommendations
   */
  async updateRecommendations(
    id: number,
    data: UpdateRecommendationsRequest
  ): Promise<Analysis> {
    const response = await api.put<Analysis>(
      `/analysis/${id}/recommendations`,
      data
    );
    return response.data;
  }

  /**
   * Delete an analysis
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/analysis/${id}`);
  }

  async exportResume(analysisId: number): Promise<Blob> {
    const response = await api.get(`/analysis/${analysisId}/export`, {
      responseType: "blob",
    });
    return response.data;
  }
}

export default new AnalysisService();
