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
  'Дневная смена',
  'Ночная смена',
  'Вахта 15/15',
  'Вахта 30/30',
  'Сменный график',
  'Гибкий график',
];

export function ReviewModal({ isOpen, onClose, onSubmit, review, shiftTypes }: ReviewModalProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    stars: 5,
    text: '',
    date: new Date(),
    shiftType: '',
    approved: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const haptics = useHaptics();

  // Объединяем типы смен из данных и предопределенные
  const allShiftTypes = Array.from(new Set([...defaultShiftTypes, ...shiftTypes]));

  useEffect(() => {
    if (review) {
      setFormData({
        stars: review.stars,
        text: review.text,
        date: review.date.toDate ? review.date.toDate() : new Date(review.date),
        shiftType: review.shiftType,
        approved: review.approved,
      });
    } else {
      setFormData({
        stars: 5,
        text: '',
        date: new Date(),
        shiftType: '',
        approved: true,
      });
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
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    format(formData.date, "PPP", { locale: ru })
                  ) : (
                    <span>Выберите дату</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => {
                    if (date) {
                      setFormData(prev => ({ ...prev, date }));
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
