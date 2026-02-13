import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadAvatar(file: Express.Multer.File, oldPhotoUrl?: string): Promise<{
        url: string;
        filename: string;
    }>;
}
