import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { haptics } from '@/lib/haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const TRIGGER_DISTANCE = 80;
  const MAX_DISTANCE = 120;

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing && startY.current > 0) {
      currentY.current = e.touches[0].clientY;
      const diff = currentY.current - startY.current;

      if (diff > 0) {
        e.preventDefault();
        const distance = Math.min(diff * 0.5, MAX_DISTANCE);
        setPullDistance(distance);

        // Вибрация при достижении триггерной дистанции
        if (distance > TRIGGER_DISTANCE && !isPulling) {
          haptics.pullRefresh();
        }

        setIsPulling(distance > 10);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > TRIGGER_DISTANCE && !isRefreshing) {
      haptics.refresh();
      setIsRefreshing(true);
      try {
        await onRefresh();
        haptics.success();
      } catch (error) {
        console.error('Refresh failed:', error);
        haptics.error();
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
    currentY.current = 0;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing]);

  const getIndicatorStyle = () => {
    const opacity = Math.min(pullDistance / TRIGGER_DISTANCE, 1);
    const scale = Math.min(pullDistance / TRIGGER_DISTANCE, 1);
    return {
      transform: `translateY(${pullDistance - 50}px) scale(${scale})`,
      opacity,
    };
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        transform: isRefreshing ? 'translateY(60px)' : `translateY(${Math.min(pullDistance * 0.3, 30)}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {/* Pull-to-refresh индикатор */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none"
        style={getIndicatorStyle()}
      >
        <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full shadow-lg">
          <RefreshCw
            className={`w-5 h-5 text-primary-foreground ${
              isRefreshing ? 'refresh-indicator' : ''
            }`}
            style={{
              transform: pullDistance > TRIGGER_DISTANCE ? 'rotate(180deg)' : `rotate(${pullDistance * 2}deg)`,
              transition: isRefreshing ? 'none' : 'transform 0.1s ease-out',
            }}
          />
        </div>
      </div>

      {/* Контент */}
      <div className={isPulling || isRefreshing ? 'pull-refresh pulling' : 'pull-refresh'}>
        {children}
      </div>
    </div>
  );
}
