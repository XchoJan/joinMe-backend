import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Создаем директорию uploads, если её нет
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Создает путь для сохранения файла в структуре: год/месяц/дата
   */
  getStoragePath(filename: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const dateDir = path.join(this.uploadsDir, String(year), month, day);
    
    // Создаем директории, если их нет
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
    }

    return path.join(dateDir, filename);
  }

  /**
   * Возвращает относительный URL для доступа к файлу
   */
  getFileUrl(storagePath: string): string {
    const relativePath = path.relative(this.uploadsDir, storagePath);
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
  }

  /**
   * Удаляет файл
   */
  deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Игнорируем ошибки при удалении
    }
  }

  /**
   * Удаляет старый аватар пользователя, если он существует
   */
  deleteOldAvatar(oldPhotoUrl: string): void {
    if (!oldPhotoUrl) return;

    try {
      // Извлекаем путь из URL (убираем /uploads/)
      const relativePath = oldPhotoUrl.replace('/uploads/', '');
      const fullPath = path.join(this.uploadsDir, relativePath);
      this.deleteFile(fullPath);
    } catch (error) {
      // Игнорируем ошибки
    }
  }
}

