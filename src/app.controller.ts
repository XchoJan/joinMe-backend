import { Controller, Get, Req, All } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('ping')
  ping(@Req() request: any) {
    // Логируем информацию о запросе для диагностики
    console.log('Ping request from:', {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      origin: request.headers['origin'],
      referer: request.headers['referer'],
      headers: request.headers,
    });
    
    return {
      status: 'ok',
      message: 'pong',
      timestamp: new Date().toISOString(),
      clientInfo: {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      },
    };
  }

  // Диагностический endpoint для проверки всех типов запросов
  @All('test')
  test(@Req() request: any) {
    console.log('=== TEST REQUEST ===');
    console.log('Method:', request.method);
    console.log('IP:', request.ip);
    console.log('User-Agent:', request.headers['user-agent']);
    console.log('Origin:', request.headers['origin']);
    console.log('Referer:', request.headers['referer']);
    console.log('All headers:', JSON.stringify(request.headers, null, 2));
    console.log('===================');
    
    return {
      success: true,
      method: request.method,
      timestamp: new Date().toISOString(),
      headers: request.headers,
      ip: request.ip,
    };
  }

  @Get('socket-test')
  socketTest() {
    return {
      message: 'Socket.io test endpoint',
      socketPath: '/socket.io/',
      instructions: 'Try connecting to: https://musicialconnect.com/socket.io/',
      note: 'Socket.io should be available at /socket.io/ path (not /api/socket.io/)',
      testUrl: 'https://musicialconnect.com/socket.io/?EIO=4&transport=polling',
      explanation: 'Socket.io requires query parameters: EIO=4&transport=polling or transport=websocket',
    };
  }
}
