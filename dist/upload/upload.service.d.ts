export declare class UploadService {
    private readonly uploadsDir;
    constructor();
    getStoragePath(filename: string): string;
    getFileUrl(storagePath: string): string;
    deleteFile(filePath: string): void;
    deleteOldAvatar(oldPhotoUrl: string): void;
}
