# JoinMe Backend

Backend API для мобильного приложения JoinMe на Nest.js

## Технологии

- Nest.js
- TypeORM
- PostgreSQL (база данных)
- TypeScript
- Socket.io (WebSocket)
- Firebase Admin (push-уведомления)

## Установка

```bash
npm install
```

## Настройка базы данных

1. Установите PostgreSQL (если еще не установлен):
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`
   - Windows: скачайте с [официального сайта](https://www.postgresql.org/download/)

2. Создайте базу данных:
```bash
createdb joinme
# или через psql:
psql -U postgres
CREATE DATABASE joinme;
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

4. Заполните переменные окружения в `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=joinme
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

## Миграции базы данных

При первом запуске миграции выполняются автоматически. Для ручного управления:

```bash
# Создать новую миграцию
npm run migration:create src/migrations/MigrationName

# Сгенерировать миграцию на основе изменений entities
npm run migration:generate src/migrations/MigrationName

# Применить миграции
npm run migration:run

# Откатить последнюю миграцию
npm run migration:revert
```

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

Используется PostgreSQL. Схема базы данных создается автоматически через миграции при первом запуске приложения.

**Важно:** В production окружении `synchronize` отключен. Все изменения схемы должны выполняться через миграции.

## CORS

CORS настроен для работы с React Native приложением.
