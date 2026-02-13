import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    ping(request: any): {
        status: string;
        message: string;
        timestamp: string;
        clientInfo: {
            ip: any;
            userAgent: any;
        };
    };
    test(request: any): {
        success: boolean;
        method: any;
        timestamp: string;
        headers: any;
        ip: any;
    };
    socketTest(): {
        message: string;
        socketPath: string;
        instructions: string;
        note: string;
        testUrl: string;
        explanation: string;
    };
}
