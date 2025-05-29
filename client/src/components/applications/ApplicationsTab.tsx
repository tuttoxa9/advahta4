import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  MessageSquare,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  TrendingUp,
  Users
} from "lucide-react";
import { useApplications } from "@/hooks/useApplications";
import { Application } from "@/types";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function ApplicationsTab() {
  const {
    applications,
    loading,
    filters,
    setFilters,
    stats,
    markAsViewed,
    markAsContacted,
    rejectApplication,
    addTestApplications
  } = useApplications();

  // Группировка откликов по датам
  const groupApplicationsByDate = (applications: Application[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups = {
      today: [] as Application[],
      yesterday: [] as Application[],
      thisWeek: [] as Application[],
      earlier: [] as Application[]
    };

    applications.forEach(app => {
      const appDate = app.createdAt.toDate();
      const appDateOnly = new Date(appDate.getFullYear(), appDate.getMonth(), appDate.getDate());

      if (appDateOnly.getTime() === today.getTime()) {
        groups.today.push(app);
      } else if (appDateOnly.getTime() === yesterday.getTime()) {
        groups.yesterday.push(app);
      } else if (appDate >= weekAgo) {
        groups.thisWeek.push(app);
      } else {
        groups.earlier.push(app);
      }
    });

    return groups;
  };

  const groupedApplications = groupApplicationsByDate(applications);

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "new": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "viewed": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "contacted": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusText = (status: Application["status"]) => {
    switch (status) {
      case "new": return "Новый";
      case "viewed": return "Просмотрено";
      case "contacted": return "Обработано";
      case "rejected": return "Отклонено";
      default: return status;
    }
  };

  const formatDate = (timestamp: any) => {
    return timestamp.toDate().toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground">{application.name}</h3>
              <Badge className={getStatusColor(application.status)}>
                {getStatusText(application.status)}
              </Badge>
            </div>
            {application.vacancyTitle && (
              <p className="text-sm text-muted-foreground mb-1">
                Вакансия: {application.vacancyTitle}
              </p>
            )}
            {application.companyName && (
              <p className="text-sm text-muted-foreground">
                Компания: {application.companyName}
              </p>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            <Clock className="w-3 h-3 inline mr-1" />
            {formatDate(application.createdAt)}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="w-4 h-4 mr-2" />
            {application.phone}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="w-4 h-4 mr-2" />
            {application.email}
          </div>
          {application.message && (
            <div className="flex items-start text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4 mr-2 mt-0.5" />
              <span className="line-clamp-2">{application.message}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {application.status === "new" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAsViewed(application.id)}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Просмотрено
            </Button>
          )}
          {(application.status === "new" || application.status === "viewed") && (
            <Button
              variant="default"
              size="sm"
              onClick={() => markAsContacted(application.id)}
              className="text-xs"
            >
              <UserCheck className="w-3 h-3 mr-1" />
              Обработано
            </Button>
          )}
          {application.status !== "rejected" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => rejectApplication(application.id)}
              className="text-xs"
            >
              <UserX className="w-3 h-3 mr-1" />
              Отклонить
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const DateGroup = ({ title, applications, icon }: {
    title: string;
    applications: Application[];
    icon: React.ReactNode;
  }) => {
    if (applications.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <Badge variant="outline" className="ml-auto">
            {applications.length}
          </Badge>
        </div>
        <div className="space-y-3">
          {applications.map(app => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Отклики соискателей</h2>
          <p className="text-muted-foreground">Управление заявками от кандидатов</p>
        </div>
        {applications.length === 0 && !loading && (
          <Button
            onClick={addTestApplications}
            className="mt-4 sm:mt-0"
          >
            <FileText className="w-4 h-4 mr-2" />
            Создать тестовые данные
          </Button>
        )}
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                <FileText className="text-blue-400 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.newApplications}</p>
                <p className="text-sm text-muted-foreground">Новые отклики</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-4">
                <Eye className="text-yellow-400 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.processingApplications}</p>
                <p className="text-sm text-muted-foreground">Просмотренные</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-4">
                <UserCheck className="text-green-400 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.contactedApplications}</p>
                <p className="text-sm text-muted-foreground">Обработанные</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mr-4">
                <UserX className="text-red-400 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.rejectedApplications}</p>
                <p className="text-sm text-muted-foreground">Отклоненные</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, email, телефону..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status || "all"}
              onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Фильтр по статусу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="new">Новые</SelectItem>
                <SelectItem value="viewed">Просмотренные</SelectItem>
                <SelectItem value="contacted">Обработанные</SelectItem>
                <SelectItem value="rejected">Отклоненные</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.period || "all"}
              onValueChange={(value) => setFilters({ ...filters, period: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все время</SelectItem>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="week">За неделю</SelectItem>
                <SelectItem value="month">За месяц</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Отклики, сгруппированные по датам */}
      {applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Нет откликов"
          description="Пока нет откликов от соискателей на ваши вакансии"
        />
      ) : (
        <div>
          <DateGroup
            title="Сегодня"
            applications={groupedApplications.today}
            icon={<Calendar className="w-5 h-5 text-blue-400" />}
          />

          <DateGroup
            title="Вчера"
            applications={groupedApplications.yesterday}
            icon={<Calendar className="w-5 h-5 text-yellow-400" />}
          />

          <DateGroup
            title="На этой неделе"
            applications={groupedApplications.thisWeek}
            icon={<Calendar className="w-5 h-5 text-green-400" />}
          />

          <DateGroup
            title="Ранее"
            applications={groupedApplications.earlier}
            icon={<Calendar className="w-5 h-5 text-gray-400" />}
          />
        </div>
      )}
    </div>
  );
}
