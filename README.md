# JoinMe Backend

Backend API для мобильного приложения JoinMe на Nest.js

## Технологии

- Nest.js
- TypeORM
- SQLite (локальная база данных)
- TypeScript

## Установка

```bash
npm install
```

## Запуск

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

Сервер запустится на `http://localhost:3000`

## API Endpoints

### Users

- `POST /users` - Создать пользователя
- `GET /users/:id` - Получить пользователя
- `PUT /users/:id` - Обновить пользователя
- `GET /users` - Получить всех пользователей

### Events

- `POST /events` - Создать событие
- `GET /events?city=Москва` - Получить события (с фильтром по городу)
- `GET /events/:id` - Получить событие по ID
- `GET /events/my/:authorId` - Получить события автора
- `POST /events/:id/requests` - Создать запрос на участие
- `GET /events/:id/requests` - Получить запросы на участие
- `PUT /events/requests/:requestId/approve` - Одобрить запрос
- `PUT /events/requests/:requestId/reject` - Отклонить запрос

### Chats

- `GET /chats/:id` - Получить чат
- `GET /chats/event/:eventId` - Получить чат по событию
- `GET /chats/:id/messages` - Получить сообщения
- `POST /chats/:id/messages` - Отправить сообщение

## База данных

База данных SQLite создается автоматически в файле `joinme.db` при первом запуске.

## CORS

CORS настроен для работы с React Native приложением.
