// Утилиты для тактильной отдачи и вибрации

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

// Проверяем поддержку вибрации
const isVibrationSupported = () => {
  return 'vibrate' in navigator;
};

// Проверяем поддержку Web Vibration API
const canVibrate = () => {
  return isVibrationSupported() && typeof navigator.vibrate === 'function';
};

// Паттерны вибрации для различных типов взаимодействий
const vibrationPatterns = {
  light: [10],           // Короткая легкая вибрация
  medium: [20],          // Средняя вибрация
  heavy: [50],           // Сильная вибрация
  selection: [5],        // Очень легкая для выбора
  success: [10, 50, 10], // Двойная вибрация для успеха
  warning: [30, 30, 30], // Тройная средняя для предупреждения
  error: [100, 50, 100], // Длинная-короткая-длинная для ошибки
  tap: [3],              // Минимальная для tap событий
  longPress: [5, 20],    // Для длинных нажатий
  swipe: [2],            // Для свайпов
  pullRefresh: [8, 5, 8] // Для pull-to-refresh
};

// Основная функция для тактильной отдачи
export const hapticFeedback = (type: HapticType = 'light') => {
  if (!canVibrate()) {
    return;
  }

  const pattern = vibrationPatterns[type];
  if (pattern) {
    navigator.vibrate(pattern);
  }
};

// Специализированные функции для различных действий
export const haptics = {
  // Основные взаимодействия
  tap: () => hapticFeedback('selection'),
  longPress: () => navigator.vibrate && navigator.vibrate(vibrationPatterns.longPress),

  // Кнопки и элементы управления
  buttonPress: () => hapticFeedback('light'),
  toggleSwitch: () => hapticFeedback('medium'),

  // Навигация
  tabChange: () => hapticFeedback('selection'),
  pageTransition: () => hapticFeedback('light'),

  // Действия с данными
  create: () => hapticFeedback('success'),
  update: () => hapticFeedback('medium'),
  delete: () => hapticFeedback('error'),
  duplicate: () => hapticFeedback('medium'),

  // Обратная связь
  success: () => hapticFeedback('success'),
  error: () => hapticFeedback('error'),
  warning: () => hapticFeedback('warning'),

  // Жесты
  swipe: () => navigator.vibrate && navigator.vibrate(vibrationPatterns.swipe),
  pullRefresh: () => navigator.vibrate && navigator.vibrate(vibrationPatterns.pullRefresh),

  // Выбор элементов
  selectItem: () => hapticFeedback('selection'),
  unselectItem: () => hapticFeedback('selection'),

  // Модальные окна
  openModal: () => hapticFeedback('light'),
  closeModal: () => hapticFeedback('light'),

  // Уведомления
  notification: () => hapticFeedback('medium'),

  // Специальные действия
  refresh: () => hapticFeedback('medium'),
  search: () => hapticFeedback('selection'),
  filter: () => hapticFeedback('selection'),

  // Пользовательские паттерны
  custom: (pattern: number[]) => {
    if (canVibrate()) {
      navigator.vibrate(pattern);
    }
  }
};

// Хук для легкого использования в компонентах
export const useHaptics = () => {
  return {
    ...haptics,
    isSupported: canVibrate()
  };
};

// Утилита для добавления вибрации к обработчикам событий
export const withHaptic = (handler: () => void, hapticType: HapticType = 'light') => {
  return () => {
    hapticFeedback(hapticType);
    handler();
  };
};

// Декоратор для автоматического добавления вибрации к функциям
export const addHapticToFunction = (fn: Function, hapticType: HapticType = 'light') => {
  return (...args: any[]) => {
    hapticFeedback(hapticType);
    return fn(...args);
  };
};
