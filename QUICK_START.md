# Быстрый старт с PostgreSQL

## 1. Установите PostgreSQL

### macOS:
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows:
Скачайте с [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)

## 2. Создайте базу данных

```bash
# Войдите в PostgreSQL
sudo -u postgres psql

# Создайте базу данных
CREATE DATABASE joinme;

# Выйдите
\q
```

## 3. Настройте переменные окружения

```bash
# Скопируйте пример файла
cp .env.example .env

# Отредактируйте .env и укажите ваши данные:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=ваш_пароль
# DB_NAME=joinme
```

## 4. Установите зависимости

```bash
npm install
```

## 5. Запустите приложение

```bash
npm run start:dev
```

При первом запуске TypeORM автоматически создаст все таблицы в базе данных (в development режиме).

## Готово! 🎉

Сервер запустится на `http://localhost:3000`

## Проверка работы

Откройте в браузере: `http://localhost:3000/api/users` - должен вернуть пустой массив `[]`

## Проблемы?

### Ошибка подключения к БД
- Убедитесь, что PostgreSQL запущен: `pg_isready`
- Проверьте параметры в `.env`
- Проверьте, что база данных `joinme` существует

### Ошибка прав доступа
```bash
# Дайте права пользователю postgres
psql -U postgres
ALTER USER postgres WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE joinme TO postgres;
```

### Порт занят
Измените `PORT` в `.env` или остановите процесс, использующий порт 3000.
