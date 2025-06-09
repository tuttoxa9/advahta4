import { useState } from 'react';
import {
  Star,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Review } from '@/types';
import { useHaptics } from '@/lib/haptics';

interface ReviewCardProps {
  review: Review;
  onEdit: (review: Review) => void;
  onDelete: (id: string) => void;
  onToggleApproval: (id: string, approved: boolean) => void;
}

export function ReviewCard({ review, onEdit, onDelete, onToggleApproval }: ReviewCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const haptics = useHaptics();

  const handleEdit = () => {
    haptics.buttonPress();
    onEdit(review);
  };

  const handleDelete = () => {
    haptics.buttonPress();
    onDelete(review.id);
    setIsDeleteDialogOpen(false);
  };

  const handleToggleApproval = () => {
    haptics.buttonPress();
    onToggleApproval(review.id, !review.approved);
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Заголовок с рейтингом и меню */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex">{renderStars(review.stars)}</div>
                <span className="text-sm font-medium">{review.stars}/5</span>
                <Badge
                  variant={review.approved ? "default" : "secondary"}
                  className={review.approved ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                >
                  {review.approved ? 'Одобрено' : 'На рассмотрении'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(review.date)}
                </div>
                <Badge variant="outline">{review.shiftType}</Badge>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleApproval}>
                  {review.approved ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Снять одобрение
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Одобрить
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Текст отзыва */}
          <div className="text-foreground">
            <p className="leading-relaxed">{review.text}</p>
          </div>

          {/* Дата создания */}
          <div className="text-xs text-muted-foreground">
            Создано: {formatDate(review.createdAt)}
            {review.updatedAt && review.updatedAt !== review.createdAt && (
              <span> • Обновлено: {formatDate(review.updatedAt)}</span>
            )}
          </div>
        </div>
      </CardContent>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить отзыв?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Отзыв будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
