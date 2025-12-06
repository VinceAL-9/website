import { Inject, Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY)
    private readonly cloudinaryInstance: typeof cloudinary,
  ) {}

  /**
   * Uploads an image file to Cloudinary
   * @param file Express Multer file object with buffer
   * @param folder Optional folder name for organizing uploads (defaults to 'psse-uploads')
   * @returns Promise with upload result containing secure_url and other metadata
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'psse-uploads',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinaryInstance.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Deletes an image from Cloudinary
   * @param imageUrl Full Cloudinary URL or public_id
   * @returns Promise with deletion result
   */
  async deleteImage(imageUrl: string): Promise<any> {
    try {
      // Extract public_id from URL if full URL is provided
      const publicId = this.extractPublicId(imageUrl);
      
      if (!publicId) {
        throw new Error('Invalid Cloudinary URL or public_id');
      }

      return await this.cloudinaryInstance.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Extracts the public_id from a Cloudinary URL
   * @param url Cloudinary image URL
   * @returns public_id including folder path
   */
  private extractPublicId(url: string): string | null {
    try {
      // If it's already a public_id (no http/https), return as is
      if (!url.startsWith('http')) {
        return url;
      }

      // Extract public_id from Cloudinary URL
      // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{version}/{public_id}.{format}
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex === -1) {
        return null;
      }

      // Get everything after 'upload/' and before the file extension
      const publicIdParts = urlParts.slice(uploadIndex + 1);
      // Skip version number if present (starts with 'v' followed by numbers)
      const startIndex = publicIdParts[0].match(/^v\d+$/) ? 1 : 0;
      
      // Join the remaining parts and remove file extension
      const publicIdWithExt = publicIdParts.slice(startIndex).join('/');
      const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
      
      return publicId;
    } catch (error) {
      console.error('Error extracting public_id:', error);
      return null;
    }
  }
}
