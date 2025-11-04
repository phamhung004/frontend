import api from './api';

export interface DownloadRequest {
  productId: number;
  userId: number;
}

export interface DownloadResponse {
  downloadUrl: string;
  fileName: string;
  fileSize: string;
}

export interface DownloadStats {
  totalDownloads: number;
  uniqueUsers: number;
  recentDownloads: Array<{
    userId: number;
    userName: string;
    downloadedAt: string;
  }>;
}

class PdfProductService {
  /**
   * Download a PDF product (requires authentication)
   */
  async downloadPdf(productId: number, userId: number): Promise<DownloadResponse> {
    const response = await api.post<DownloadResponse>(
      `/products/${productId}/download`,
      null,
      {
        headers: {
          'X-User-Id': userId.toString(),
        },
      }
    );
    return response.data;
  }

  /**
   * Check if user can download (authentication check)
   */
  async canDownload(productId: number): Promise<boolean> {
    try {
      const response = await api.get<{ canDownload: boolean }>(`/products/${productId}/can-download`);
      return response.data.canDownload;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get download statistics for a product (admin only)
   */
  async getDownloadStats(productId: number): Promise<DownloadStats> {
    const response = await api.get<DownloadStats>(`/products/${productId}/download-stats`);
    return response.data;
  }

  /**
   * Get user's download history
   */
  async getUserDownloads(): Promise<Array<{
    productId: number;
    productName: string;
    downloadedAt: string;
  }>> {
    const response = await api.get('/products/my-downloads');
    return response.data;
  }

  /**
   * Track PDF preview view
   */
  async trackPreview(productId: number): Promise<void> {
    await api.post(`/products/${productId}/track-preview`);
  }
}

export const pdfProductService = new PdfProductService();
