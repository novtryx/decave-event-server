// src/upload/upload.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService, CloudinaryUploadResult } from '../cloudinary/cloudinary.service';
import { memoryStorage } from 'multer';


interface UploadResponse {
  message: string;
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}


@Controller('upload')
export class UploadController {
    private readonly logger = new Logger(UploadController.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // Single file upload
 @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      // Force memory storage — never write temp files to disk
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async uploadSingle(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpg|jpeg|png|gif|webp)|application\/pdf/ }),
        ],
        errorHttpStatusCode: 422,
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadResponse> {
    try {
      const result: CloudinaryUploadResult =
        await this.cloudinaryService.uploadFile(file);

      return {
        message: 'File uploaded successfully',
        url: result.secureUrl,       // always return HTTPS
        publicId: result.publicId,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      // Re-throw NestJS HTTP exceptions as-is
      if (error?.status) throw error;

      this.logger.error('Unexpected upload error', error);
      throw new InternalServerErrorException('Upload failed. Please try again.');
    }
  }

  // Multiple files upload (up to 5)
  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('No files provided');

    const results = await Promise.all(
      files.map((file) => this.cloudinaryService.uploadFile(file)),
    );

    return {
      message: 'Files uploaded successfully',
      files: results.map((r) => ({ url: r.secureUrl, public_id: r.publicId })),
    };
  }
}