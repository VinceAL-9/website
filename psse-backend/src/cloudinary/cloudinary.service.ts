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
   * @returns Promise with upload result containing secure_url and other metadata
   */
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinaryInstance.uploader.upload_stream(
        {
          folder: 'psse-uploads',
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
}
