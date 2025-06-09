import { useState } from 'react';
import { Plus, Star, Calendar, CheckCircle, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { useReviews } from '@/hooks/useReviews';
import { ReviewModal } from './ReviewModal';
import { ReviewCard } from './ReviewCard';
import { useHaptics } from '@/lib/haptics';

export function ReviewsTab() {
  const {
    reviews,
    loading,
    error,
    stats,
    shiftTypes,
    statusFilter,
    setStatusFilter,
    shiftTypeFilter,
    setShiftTypeFilter,
    starsFilter,
    setStarsFilter,
    addReview,
    updateReview,
    deleteReview,
    toggleApproval,
  } = useReviews();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const haptics = useHaptics();

  const handleOpenModal = () => {
    haptics.buttonPress();
    setEditingReview(null);
    setIsModalOpen(true);
  };

  const handleEditReview = (review: any) => {
    haptics.buttonPress();
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'text-yellow-500 fill-yellow-500'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading && reviews.length === 0) {
    return <SkeletonLoader count={3} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка добавления */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Отзывы</h1>
          <p className="text-muted-foreground">Управление отзывами сотрудников</p>
        </div>
        <Button
          onClick={handleOpenModal}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground touch-target"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить отзыв
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего отзывов</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Одобрено</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">На рассмотрении</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Средняя оценка</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.averageRating}</p>
                  <div className="flex">{renderStars(Math.round(parseFloat(stats.averageRating)))}</div>
                </div>
              </div>
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Статус
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все отзывы</SelectItem>
                  <SelectItem value="approved">Одобренные</SelectItem>
                  <SelectItem value="pending">На рассмотрении</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Тип смены
              </label>
              <Select value={shiftTypeFilter} onValueChange={setShiftTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип смены" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  {shiftTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Оценка
              </label>
              <Select value={starsFilter} onValueChange={setStarsFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите оценку" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все оценки</SelectItem>
                  <SelectItem value="5">5 звезд</SelectItem>
                  <SelectItem value="4">4 звезды</SelectItem>
                  <SelectItem value="3">3 звезды</SelectItem>
                  <SelectItem value="2">2 звезды</SelectItem>
                  <SelectItem value="1">1 звезда</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список отзывов */}
      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Отзывов пока нет"
          description="Добавьте первый отзыв, нажав кнопку выше"
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleEditReview}
              onDelete={deleteReview}
              onToggleApproval={toggleApproval}
            />
          ))}
        </div>
      )}

      {/* Модальное окно */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingReview ? updateReview : addReview}
        review={editingReview}
        shiftTypes={shiftTypes}
      />
    </div>
  );
}
