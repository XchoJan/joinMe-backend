import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private configService: ConfigService) {
    // Firebase Admin SDK будет инициализирован через переменные окружения
    // или через service account key файл
    if (!admin.apps.length) {
      try {
        // Получаем переменные окружения через ConfigService
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID') || 'joinme-f9d79';
        const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
        const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

        this.logger.log(`Attempting to initialize Firebase Admin with project: ${projectId}`);
        this.logger.log(`Private key present: ${!!privateKey}`);
        this.logger.log(`Client email present: ${!!clientEmail}`);

        if (privateKey && clientEmail) {
          // Обрабатываем приватный ключ: убираем кавычки и заменяем \n на реальные переносы строк
          let processedKey = privateKey.trim();
          // Убираем начальные и конечные кавычки, если есть
          if (processedKey.startsWith('"') && processedKey.endsWith('"')) {
            processedKey = processedKey.slice(1, -1).trim();
          }
          // Заменяем \\n на реальные переносы строк
          processedKey = processedKey.replace(/\\n/g, '\n');
          // Убираем лишние переносы строк в начале и конце
          processedKey = processedKey.trim();
          
          this.logger.log(`Initializing Firebase Admin with project: ${projectId}`);
          this.logger.log(`Private key length: ${processedKey.length}`);
          this.logger.log(`Private key starts with: ${processedKey.substring(0, 30)}...`);
          this.logger.log(`Private key ends with: ...${processedKey.substring(processedKey.length - 30)}`);
          
          try {
            // Инициализируем Firebase Admin с полной конфигурацией
            const credential = admin.credential.cert({
              projectId: projectId,
              privateKey: processedKey,
              clientEmail: clientEmail,
            });
            
            // Проверяем, что credential создан правильно
            this.logger.log(`Credential created for project: ${projectId}`);
            
            admin.initializeApp({
              credential: credential,
              projectId: projectId,
            });
            
            this.logger.log(`✅ Firebase Admin initialized for project: ${projectId}`);
            
            // Проверяем, что приложение доступно
            const app = admin.app();
            this.logger.log(`Firebase App name: ${app.name}`);
          } catch (initError: any) {
            this.logger.error(`❌ Error initializing Firebase Admin: ${initError.message}`);
            this.logger.error(`Error details: ${JSON.stringify(initError, null, 2)}`);
            throw initError;
          }
        } else {
          this.logger.error(
            '❌ Firebase Admin not initialized - missing FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL. ' +
            `PROJECT_ID will default to: ${projectId} (from GoogleService-Info.plist)`
          );
          this.logger.error('Please check your .env file in joinme-backend directory');
        }
      } catch (error) {
        this.logger.error('Error initializing Firebase Admin:', error);
      }
    } else {
      this.logger.log('Firebase Admin already initialized');
    }
  }

  async sendNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<boolean> {
    if (!admin.apps.length) {
      this.logger.warn('Firebase Admin not initialized, cannot send notification');
      return false;
    }

    if (!fcmToken) {
      this.logger.warn('FCM token is empty, cannot send notification');
      return false;
    }

    try {
      // Получаем приложение Firebase Admin
      const app = admin.app();
      if (!app) {
        this.logger.error('Firebase Admin app not found');
        return false;
      }

      // Для тестирования на симуляторе используем упрощенную конфигурацию
      // APNs не требуется для разработки
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: data ? this.stringifyData(data) : undefined,
        // Android настройки
        android: {
          priority: 'high',
          notification: {
            channelId: 'default',
            sound: 'default',
            icon: 'ic_notification', // Иконка уведомлений (должна быть в drawable папках)
            // clickAction не нужен для React Native Firebase - приложение открывается автоматически
          },
        },
        // iOS настройки (упрощенные, без APNs сертификата для тестирования)
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
      
      // Проверяем, что приложение правильно инициализировано
      const apps = admin.apps;
      this.logger.log(`Firebase Admin apps count: ${apps.length}`);
      if (apps.length === 0) {
        this.logger.error('No Firebase Admin apps found');
        return false;
      }
      
      // Используем приложение по умолчанию
      const defaultApp = admin.app();
      this.logger.log(`Using Firebase App: ${defaultApp.name}`);
      
      // Получаем messaging instance
      const messagingInstance = admin.messaging(defaultApp);
      
      // Проверяем credentials
      const appOptions = (defaultApp as any).options;
      const credential = appOptions?.credential;
      if (!credential) {
        this.logger.error('Firebase App has no credential');
        return false;
      }
      this.logger.log(`Firebase App credential type: ${credential.constructor.name}`);
      this.logger.log(`Firebase App projectId: ${appOptions?.projectId || 'not set'}`);
      
      // Пробуем получить access token для проверки аутентификации
      try {
        if (typeof credential.getAccessToken === 'function') {
          const accessToken = await credential.getAccessToken();
          this.logger.log(`✅ Access token obtained, length: ${accessToken?.length || 0}`);
        } else {
          this.logger.warn('Credential does not have getAccessToken method');
        }
      } catch (tokenError: any) {
        this.logger.error(`❌ Failed to get access token: ${tokenError.message}`);
        // Продолжаем попытку отправки
      }
      
      const response = await messagingInstance.send(message);
      this.logger.log(`✅ Successfully sent notification: ${response}`);
      return true;
    } catch (error: any) {
      this.logger.error('❌ Error sending notification:', error);
      this.logger.error(`Error code: ${error.code}`);
      this.logger.error(`Error message: ${error.message}`);
      
      // Если токен невалидный, можно пометить его для удаления
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        this.logger.warn(`Invalid FCM token: ${fcmToken.substring(0, 20)}...`);
      }
      
      return false;
    }
  }

  private stringifyData(data: Record<string, any>): Record<string, string> {
    const stringified: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      stringified[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return stringified;
  }
}

