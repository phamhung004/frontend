import api from './api';

export interface PdfUploadResult {
  fileUrl: string;
  fileName: string;
  originalFileName: string;
  fileSize: string;
  fileSizeBytes: number;
  pageCount: number;
  fileFormat: string;
}

class FileUploadService {
  /**
   * Upload a PDF file to the server
   */
  async uploadPdf(file: File, onProgress?: (progress: number) => void): Promise<PdfUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<PdfUploadResult>('/files/upload-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  }

  /**
   * Delete a PDF file from the server
   */
  async deletePdf(fileUrl: string): Promise<void> {
    await api.delete('/files/delete-pdf', {
      params: { fileUrl },
    });
  }

  /**
   * Validate PDF file before upload
   */
  validatePdfFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Chỉ chấp nhận file PDF' };
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'Kích thước file không được vượt quá 50MB' };
    }

    return { valid: true };
  }
}

export const fileUploadService = new FileUploadService();
