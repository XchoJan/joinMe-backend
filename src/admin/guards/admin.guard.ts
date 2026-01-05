import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    // Простая проверка токена из переменных окружения
    const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-token-change-in-production';

    if (!token || token !== adminToken) {
      throw new UnauthorizedException('Invalid admin token');
    }

    return true;
  }
}

