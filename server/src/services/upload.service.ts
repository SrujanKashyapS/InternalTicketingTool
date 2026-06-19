import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';
import logger from '../utils/logger';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export class UploadService {
  async uploadFile(
    fileBuffer: Buffer,
    folder: string = 'tickets'
  ): Promise<{ url: string; publicId: string }> {
    // If Cloudinary is not configured, return a mock URL
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey) {
      const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      logger.warn('Cloudinary not configured, returning mock URL');
      return {
        url: `https://via.placeholder.com/400x300?text=Uploaded+File`,
        publicId: mockId,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `ai-ticket-copilot/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              url: result!.secure_url,
              publicId: result!.public_id,
            });
          }
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey) {
      return;
    }

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.error('Cloudinary delete error:', error);
    }
  }
}

export const uploadService = new UploadService();
