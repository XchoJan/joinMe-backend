import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Создаем временную директорию
          const tempDir = 'temp';
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          cb(null, tempDir);
        },
        filename: (req, file, cb) => {
          // Генерируем уникальное имя файла
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        // Разрешаем только изображения
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body('oldPhotoUrl') oldPhotoUrl?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Перемещаем файл в правильную директорию (год/месяц/дата)
    const finalPath = this.uploadService.getStoragePath(file.filename);
    const tempPath = file.path;

    // Перемещаем файл
    fs.renameSync(tempPath, finalPath);

    // Удаляем старый аватар, если он был указан
    if (oldPhotoUrl) {
      this.uploadService.deleteOldAvatar(oldPhotoUrl);
    }

    // Возвращаем URL для доступа к файлу
    const fileUrl = this.uploadService.getFileUrl(finalPath);

    return {
      url: fileUrl,
      filename: file.filename,
    };
  }
}

