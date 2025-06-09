import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Review, ReviewFormData } from '@/types';
import { useToast } from './use-toast';

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Фильтры
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [shiftTypeFilter, setShiftTypeFilter] = useState<'all' | string>('all');
  const [starsFilter, setStarsFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');

  useEffect(() => {
    let q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));

    // Применяем фильтры
    if (statusFilter === 'approved') {
      q = query(collection(db, 'reviews'), where('approved', '==', true), orderBy('createdAt', 'desc'));
    } else if (statusFilter === 'pending') {
      q = query(collection(db, 'reviews'), where('approved', '==', false), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));

      // Применяем фильтры на клиенте для более сложных условий
      if (shiftTypeFilter !== 'all') {
        reviewsData = reviewsData.filter(review => review.shiftType === shiftTypeFilter);
      }

      if (starsFilter !== 'all') {
        reviewsData = reviewsData.filter(review => review.stars === parseInt(starsFilter));
      }

      setReviews(reviewsData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Error fetching reviews:', err);
      setError('Ошибка загрузки отзывов');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [statusFilter, shiftTypeFilter, starsFilter]);

  const addReview = async (data: ReviewFormData) => {
    try {
      setLoading(true);
      const now = Timestamp.now();

      await addDoc(collection(db, 'reviews'), {
        ...data,
        date: Timestamp.fromDate(data.date),
        createdAt: now,
        updatedAt: now,
      });

      toast({
        title: "Успешно",
        description: "Отзыв добавлен",
      });
    } catch (err) {
      console.error('Error adding review:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить отзыв",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (id: string, data: Partial<ReviewFormData>) => {
    try {
      setLoading(true);
      const reviewRef = doc(db, 'reviews', id);

      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      if (data.date) {
        updateData.date = Timestamp.fromDate(data.date);
      }

      await updateDoc(reviewRef, updateData);

      toast({
        title: "Успешно",
        description: "Отзыв обновлен",
      });
    } catch (err) {
      console.error('Error updating review:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить отзыв",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'reviews', id));

      toast({
        title: "Успешно",
        description: "Отзыв удален",
      });
    } catch (err) {
      console.error('Error deleting review:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить отзыв",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, approved: boolean) => {
    try {
      const reviewRef = doc(db, 'reviews', id);
      await updateDoc(reviewRef, {
        approved,
        updatedAt: Timestamp.now()
      });

      toast({
        title: "Успешно",
        description: approved ? "Отзыв одобрен" : "Одобрение отозвано",
      });
    } catch (err) {
      console.error('Error toggling approval:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус отзыва",
        variant: "destructive",
      });
    }
  };

  // Получаем уникальные типы смен для фильтра
  const shiftTypes = Array.from(new Set(reviews.map(review => review.shiftType)));

  // Статистика
  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.approved).length,
    pending: reviews.filter(r => !r.approved).length,
    averageRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
      : '0',
  };

  return {
    reviews,
    loading,
    error,
    stats,
    shiftTypes,
    // Фильтры
    statusFilter,
    setStatusFilter,
    shiftTypeFilter,
    setShiftTypeFilter,
    starsFilter,
    setStarsFilter,
    // Операции
    addReview,
    updateReview,
    deleteReview,
    toggleApproval,
  };
}
