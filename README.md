# ☀️ Интерактивная Солнечная система

Интерактивная обучающая демонстрация Солнечной системы, созданная на React + Vite + Tailwind CSS.

![Solar System](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)

## 🚀 Возможности

- 🪐 Анимированное орбитальное движение всех 8 планет
- 🖱️ Клик по планете — информация (размер, расстояние, период)
- ▶️ Управление воспроизведением (Play / Pause)
- ⚡ Регулировка скорости анимации (0.1x — 10x)
- 🌟 Звёздный фон и эффекты свечения
- 📱 Адаптивный дизайн

## 📦 Установка и запуск

```bash
# Установить зависимости
npm install

# Запустить в режиме разработки
npm run dev

# Собрать для продакшена
npm run build

# Предпросмотр собранной версии
npm run preview
```

## 🌍 Деплой на GitHub Pages

### 1. Создайте репозиторий на GitHub

1. Зайдите на [github.com/new](https://github.com/new)
2. Укажите имя репозитория (например, `solar-system`)
3. Выберите **Public**
4. Нажмите **Create repository**

### 2. Загрузите код

```bash
# Инициализируем git в папке проекта
git init

# Добавляем все файлы
git add .

# Первый коммит
git commit -m "Initial commit: Solar System demo"

# Подключаем удалённый репозиторий (замените USERNAME на ваш логин)
git remote add origin https://github.com/USERNAME/solar-system.git

# Переименовываем ветку в main
git branch -M main

# Отправляем код на GitHub
git push -u origin main
```

### 3. Включите GitHub Pages

1. Откройте ваш репозиторий на GitHub
2. Перейдите в **Settings → Pages**
3. В разделе **Build and deployment**:
   - **Source**: выберите **GitHub Actions**
4. Создайте файл `.github/workflows/deploy.yml` (см. ниже)
5. После пуша workflow автоматически развернёт сайт

### 4. Файл workflow для GitHub Pages

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - uses: actions/deploy-pages@v4
```

После этого ваш сайт будет доступен по адресу:
`https://USERNAME.github.io/solar-system/`

## 🛠️ Технологии

- **React 18** — UI-библиотека
- **Vite** — сборщик
- **Tailwind CSS** — стили
- **Canvas API** — рендеринг анимации

## 📄 Лицензия

MIT
