import { useState, useEffect } from 'react';
import { Star, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Review, ReviewFormData } from '@/types';
import { useHaptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewFormData | { id: string; data: Partial<ReviewFormData> }) => void;
  review?: Review | null;
  shiftTypes: string[];
}

const defaultShiftTypes = [
  'Вахтовый метод',
  'Дневная смена',
  'Ночная смена',
  'Сменный график',
  'Гибкий график',
];

// Функция для генерации случайной даты от 2021 года до мая 2025
const generateRandomDate = (): Date => {
  const startDate = new Date(2021, 0, 1); // 1 января 2021
  const endDate = new Date(2025, 4, 31); // 31 мая 2025
  const timeDiff = endDate.getTime() - startDate.getTime();
  const randomTime = Math.random() * timeDiff;
  return new Date(startDate.getTime() + randomTime);
};

export function ReviewModal({ isOpen, onClose, onSubmit, review, shiftTypes }: ReviewModalProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    stars: 5,
    text: '',
    date: new Date(),
    shiftType: 'Вахтовый метод',
    approved: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateInputValue, setDateInputValue] = useState('');
  const haptics = useHaptics();

  // Объединяем типы смен из данных и предопределенные
  const allShiftTypes = Array.from(new Set([...defaultShiftTypes, ...shiftTypes]));

  useEffect(() => {
    if (review) {
      const reviewDate = review.date.toDate ? review.date.toDate() : new Date(review.date);
      setFormData({
        stars: review.stars,
        text: review.text,
        date: reviewDate,
        shiftType: review.shiftType,
        approved: review.approved,
      });
      setDateInputValue(format(reviewDate, 'dd.MM.yyyy'));
    } else {
      // Генерируем случайную дату при создании нового отзыва
      const randomDate = generateRandomDate();
      setFormData({
        stars: 5,
        text: '',
        date: randomDate,
        shiftType: 'Вахтовый метод',
        approved: true,
      });
      setDateInputValue(format(randomDate, 'dd.MM.yyyy'));
    }
    setErrors({});
  }, [review, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.text.trim()) {
      newErrors.text = 'Текст отзыва обязателен';
    } else if (formData.text.trim().length < 10) {
      newErrors.text = 'Текст отзыва должен содержать минимум 10 символов';
    }

    if (!formData.shiftType) {
      newErrors.shiftType = 'Выберите тип смены';
    }

    if (formData.stars < 1 || formData.stars > 5) {
      newErrors.stars = 'Оценка должна быть от 1 до 5 звезд';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.buttonPress();

    if (!validateForm()) {
      return;
    }

    if (review) {
      onSubmit({ id: review.id, data: formData });
    } else {
      onSubmit(formData);
    }

    onClose();
  };

  const handleStarClick = (rating: number) => {
    haptics.buttonPress();
    setFormData(prev => ({ ...prev, stars: rating }));
  };

  const handleDateInputChange = (value: string) => {
    setDateInputValue(value);

    // Пытаемся распарсить дату в формате DD.MM.YYYY
    const dateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    const match = value.match(dateRegex);

    if (match) {
      const [, day, month, year] = match;
      const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      // Проверяем, что дата валидна
      if (!isNaN(parsedDate.getTime()) &&
          parsedDate.getDate() === parseInt(day) &&
          parsedDate.getMonth() === parseInt(month) - 1 &&
          parsedDate.getFullYear() === parseInt(year)) {
        setFormData(prev => ({ ...prev, date: parsedDate }));
      }
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
      setDateInputValue(format(date, 'dd.MM.yyyy'));
      setIsCalendarOpen(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => handleStarClick(i + 1)}
        className="p-1 rounded transition-transform hover:scale-110"
      >
        <Star
          className={`w-8 h-8 transition-colors ${
            i < formData.stars
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-gray-300 hover:text-yellow-400'
          }`}
        />
      </button>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {review ? 'Редактировать отзыв' : 'Добавить отзыв'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Оценка звездами */}
          <div className="space-y-2">
            <Label>Оценка *</Label>
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars()}</div>
              <span className="text-sm text-muted-foreground ml-2">
                {formData.stars} из 5
              </span>
            </div>
            {errors.stars && (
              <p className="text-sm text-destructive">{errors.stars}</p>
            )}
          </div>

          {/* Дата */}
          <div className="space-y-2">
            <Label>Дата смены *</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="ДД.ММ.ГГГГ"
                value={dateInputValue}
                onChange={(e) => handleDateInputChange(e.target.value)}
                className="flex-1"
                maxLength={10}
              />
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-xs text-muted-foreground">
              Введите дату в формате ДД.ММ.ГГГГ или выберите в календаре
            </p>
          </div>

          {/* Тип смены */}
          <div className="space-y-2">
            <Label htmlFor="shiftType">Тип смены *</Label>
            <Select
              value={formData.shiftType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, shiftType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип смены" />
              </SelectTrigger>
              <SelectContent>
                {allShiftTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.shiftType && (
              <p className="text-sm text-destructive">{errors.shiftType}</p>
            )}
          </div>

          {/* Текст отзыва */}
          <div className="space-y-2">
            <Label htmlFor="text">Отзыв *</Label>
            <Textarea
              id="text"
              placeholder="Расскажите о вашем опыте работы..."
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              className="min-h-[120px]"
            />
            <div className="flex justify-between items-center">
              {errors.text && (
                <p className="text-sm text-destructive">{errors.text}</p>
              )}
              <p className="text-sm text-muted-foreground ml-auto">
                {formData.text.length} символов
              </p>
            </div>
          </div>

          {/* Статус одобрения */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="approved">Одобрить отзыв</Label>
              <p className="text-sm text-muted-foreground">
                Одобренные отзывы будут видны публично
              </p>
            </div>
            <Switch
              id="approved"
              checked={formData.approved}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, approved: checked }))}
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              {review ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
