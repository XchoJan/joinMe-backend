# Быстрый старт JoinMe Backend

## Запуск бэкенда

```bash
cd joinme-backend
npm install
npm run start:dev
```

Сервер запустится на `http://localhost:3000`

## Проверка работы

Откройте в браузере: `http://localhost:3000/users` - должен вернуть пустой массив `[]`

## Для React Native

### iOS Simulator
- Используйте `http://localhost:3000` (уже настроено)

### Android Emulator  
- Замените в `JoinMe/src/services/api.ts`:
  ```typescript
  const API_BASE_URL = 'http://10.0.2.2:3000';
  ```

### Физическое устройство
- Узнайте IP адрес вашего компьютера: `ifconfig` (Mac/Linux) или `ipconfig` (Windows)
- Замените в `JoinMe/src/services/api.ts`:
  ```typescript
  const API_BASE_URL = 'http://YOUR_IP:3000';
  ```

## API Endpoints

- `GET /events` - получить все события
- `POST /events` - создать событие
- `GET /users/:id` - получить пользователя
- `POST /users` - создать пользователя
- И другие...

Полный список в `README.md`

