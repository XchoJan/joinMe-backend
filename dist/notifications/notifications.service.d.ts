import { ConfigService } from '@nestjs/config';
export declare class NotificationsService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendNotification(fcmToken: string, title: string, body: string, data?: Record<string, any>): Promise<boolean>;
    private stringifyData;
}
