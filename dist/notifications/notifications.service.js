"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = __importStar(require("firebase-admin"));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    configService;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(configService) {
        this.configService = configService;
        if (!admin.apps.length) {
            try {
                const projectId = this.configService.get('FIREBASE_PROJECT_ID') || 'joinme-f9d79';
                const privateKey = this.configService.get('FIREBASE_PRIVATE_KEY');
                const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');
                this.logger.log(`Attempting to initialize Firebase Admin with project: ${projectId}`);
                this.logger.log(`Private key present: ${!!privateKey}`);
                this.logger.log(`Client email present: ${!!clientEmail}`);
                if (privateKey && clientEmail) {
                    let processedKey = privateKey.trim();
                    if (processedKey.startsWith('"') && processedKey.endsWith('"')) {
                        processedKey = processedKey.slice(1, -1).trim();
                    }
                    processedKey = processedKey.replace(/\\n/g, '\n');
                    processedKey = processedKey.trim();
                    this.logger.log(`Initializing Firebase Admin with project: ${projectId}`);
                    this.logger.log(`Private key length: ${processedKey.length}`);
                    this.logger.log(`Private key starts with: ${processedKey.substring(0, 30)}...`);
                    this.logger.log(`Private key ends with: ...${processedKey.substring(processedKey.length - 30)}`);
                    try {
                        const credential = admin.credential.cert({
                            projectId: projectId,
                            privateKey: processedKey,
                            clientEmail: clientEmail,
                        });
                        this.logger.log(`Credential created for project: ${projectId}`);
                        admin.initializeApp({
                            credential: credential,
                            projectId: projectId,
                        });
                        this.logger.log(`✅ Firebase Admin initialized for project: ${projectId}`);
                        const app = admin.app();
                        this.logger.log(`Firebase App name: ${app.name}`);
                    }
                    catch (initError) {
                        this.logger.error(`❌ Error initializing Firebase Admin: ${initError.message}`);
                        this.logger.error(`Error details: ${JSON.stringify(initError, null, 2)}`);
                        throw initError;
                    }
                }
                else {
                    this.logger.error('❌ Firebase Admin not initialized - missing FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL. ' +
                        `PROJECT_ID will default to: ${projectId} (from GoogleService-Info.plist)`);
                    this.logger.error('Please check your .env file in joinme-backend directory');
                }
            }
            catch (error) {
                this.logger.error('Error initializing Firebase Admin:', error);
            }
        }
        else {
            this.logger.log('Firebase Admin already initialized');
        }
    }
    async sendNotification(fcmToken, title, body, data) {
        if (!admin.apps.length) {
            this.logger.warn('Firebase Admin not initialized, cannot send notification');
            return false;
        }
        if (!fcmToken) {
            this.logger.warn('FCM token is empty, cannot send notification');
            return false;
        }
        try {
            const app = admin.app();
            if (!app) {
                this.logger.error('Firebase Admin app not found');
                return false;
            }
            const message = {
                token: fcmToken,
                notification: {
                    title,
                    body,
                },
                data: data ? this.stringifyData(data) : undefined,
                android: {
                    priority: 'high',
                },
                apns: {
                    headers: {
                        'apns-priority': '10',
                    },
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                            alert: {
                                title: title,
                                body: body,
                            },
                        },
                    },
                },
            };
            this.logger.log(`Sending notification to token: ${fcmToken.substring(0, 20)}...`);
            const apps = admin.apps;
            this.logger.log(`Firebase Admin apps count: ${apps.length}`);
            if (apps.length === 0) {
                this.logger.error('No Firebase Admin apps found');
                return false;
            }
            const defaultApp = admin.app();
            this.logger.log(`Using Firebase App: ${defaultApp.name}`);
            const messagingInstance = admin.messaging(defaultApp);
            const appOptions = defaultApp.options;
            const credential = appOptions?.credential;
            if (!credential) {
                this.logger.error('Firebase App has no credential');
                return false;
            }
            this.logger.log(`Firebase App credential type: ${credential.constructor.name}`);
            this.logger.log(`Firebase App projectId: ${appOptions?.projectId || 'not set'}`);
            try {
                if (typeof credential.getAccessToken === 'function') {
                    const accessToken = await credential.getAccessToken();
                    this.logger.log(`✅ Access token obtained, length: ${accessToken?.length || 0}`);
                }
                else {
                    this.logger.warn('Credential does not have getAccessToken method');
                }
            }
            catch (tokenError) {
                this.logger.error(`❌ Failed to get access token: ${tokenError.message}`);
            }
            const response = await messagingInstance.send(message);
            this.logger.log(`✅ Successfully sent notification: ${response}`);
            return true;
        }
        catch (error) {
            this.logger.error('❌ Error sending notification:', error);
            this.logger.error(`Error code: ${error.code}`);
            this.logger.error(`Error message: ${error.message}`);
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                this.logger.warn(`Invalid FCM token: ${fcmToken.substring(0, 20)}...`);
            }
            return false;
        }
    }
    stringifyData(data) {
        const stringified = {};
        for (const [key, value] of Object.entries(data)) {
            stringified[key] = typeof value === 'string' ? value : JSON.stringify(value);
        }
        return stringified;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map