import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ChatsService } from './chats.service';

@WebSocketGateway({
  path: '/socket.io',
  namespace: '/',
  cors: {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
@Injectable()
export class ChatsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatsService: ChatsService) {}

  afterInit(server: Server) {
    console.log('✅ Socket.io server initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    client.join(`chat_${data.chatId}`);
    return { status: 'joined', chatId: data.chatId };
  }

  @SubscribeMessage('leave_chat')
  async handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    client.leave(`chat_${data.chatId}`);
    return { status: 'left', chatId: data.chatId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; userId: string; text: string },
  ) {
    try {
      const message = await this.chatsService.createMessage(
        data.chatId,
        data.userId,
        data.text,
      );

      // Отправляем сообщение всем участникам чата
      this.server.to(`chat_${data.chatId}`).emit('new_message', {
        chatId: data.chatId,
        message,
      });

      return { status: 'sent', message };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  // Метод для отправки сообщения извне (например, из контроллера)
  broadcastMessage(chatId: string, message: any) {
    this.server.to(`chat_${chatId}`).emit('new_message', {
      chatId,
      message,
    });
  }

  // Метод для уведомления об удалении сообщения
  broadcastMessageDeleted(chatId: string, messageId: string) {
    this.server.to(`chat_${chatId}`).emit('message_deleted', {
      chatId,
      messageId,
    });
  }

  // Метод для уведомления об удалении всех сообщений
  broadcastAllMessagesDeleted(chatId: string) {
    this.server.to(`chat_${chatId}`).emit('all_messages_deleted', {
      chatId,
    });
  }
}

