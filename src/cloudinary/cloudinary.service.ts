import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      // ✅ Increase connection timeout at SDK level
      timeout: 120000, // 2 minutes
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      // ✅ Upload directly from buffer — no Readable stream needed
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'auto',
            // ✅ Remove transformation from upload — apply later on delivery URL
            // Transformations during upload cause Cloudinary to process before
            // acknowledging, which triggers the 499 timeout on slow connections
            timeout: 120000,
          },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error) {
              this.logger.error('Cloudinary upload failed', error);
              return reject(
                new InternalServerErrorException(
                  `Upload failed: ${error.message ?? 'Unknown Cloudinary error'}`,
                ),
              );
            }
            if (!result) {
              return reject(
                new InternalServerErrorException(
                  'Cloudinary returned an empty response',
                ),
              );
            }
            resolve({
              url: result.url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
            });
          },
        )
        // ✅ Write buffer directly — fastest possible way, no pipe/stream chain
        .end(file.buffer);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result !== 'ok') {
        throw new Error(`Unexpected Cloudinary response: ${result.result}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${publicId}`, error);
      throw new InternalServerErrorException(
        'Failed to delete file from Cloudinary',
      );
    }
  }
}