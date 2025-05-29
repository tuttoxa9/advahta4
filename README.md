# Вахта CRM - Система Управления Вакансиями

Современная CRM-система для управления вакансиями с Firebase аутентификацией и Firestore интеграцией.

## 🚀 Деплой на Netlify

### Подготовка к деплою

1. **Создайте Firebase проект:**
   - Перейдите в [Firebase Console](https://console.firebase.google.com/)
   - Создайте новый проект
   - Включите Authentication (Email/Password)
   - Настройте Firestore Database

2. **Получите Firebase конфигурацию:**
   В настройках проекта найдите:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID` 
   - `VITE_FIREBASE_APP_ID`

### Деплой

1. **Форкните репозиторий** на GitHub/GitLab

2. **Подключите к Netlify:**
   - Зайдите в [Netlify](https://netlify.com)
   - Нажмите "Add new site"
   - Выберите ваш репозиторий

3. **Настройте переменные окружения:**
   В Netlify Dashboard → Site settings → Environment variables добавьте:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Настройки сборки:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

### Конфигурация Firebase

После деплоя добавьте домен Netlify в Firebase:
- Authentication → Settings → Authorized domains
- Добавьте `your-app.netlify.app`

## 🛠 Технологии

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Firebase/Firestore
- **Authentication:** Firebase Auth
- **UI Components:** Radix UI, Shadcn/ui
- **State Management:** TanStack Query
- **Routing:** Wouter

## 📱 Функции

- ✅ Аутентификация через email
- ✅ Управление вакансиями (создание, редактирование, удаление)
- ✅ Категоризация: активные, черновики, удалённые
- ✅ Система заявок от кандидатов
- ✅ Управление компаниями
- ✅ Тёмная тема
- ✅ Адаптивный дизайн
- ✅ Состояния загрузки и skeleton-анимации

## 🔧 Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## 🌐 Переменные окружения

Создайте файл `.env` с:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📞 Поддержка

При возникновении вопросов создайте issue в репозитории.