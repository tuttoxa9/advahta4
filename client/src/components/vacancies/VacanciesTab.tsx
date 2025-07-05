import { useState } from "react";
import { useVacancies } from "@/hooks/useVacancies";
import { VacancyModal } from "./VacancyModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { LoadingSpinner, ModernLoader } from "@/components/ui/loading-spinner";
import { VacancyCardSkeleton } from "@/components/ui/skeleton-loader";
import {
  Plus,
  Search,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Edit,
  Copy,
  Play,
  Pause,
  Trash2,
  Eye,
  Briefcase
} from "lucide-react";
import { Vacancy } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHaptics } from "@/lib/haptics";

export function VacanciesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "draft" | "deleted">("active");
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const isMobile = useIsMobile();
  const haptics = useHaptics();

  const {
    vacancies,
    loading,
    filters,
    setFilters,
    deleteVacancy,
    duplicateVacancy,
    toggleVacancyStatus,
    incrementViewCount,
    refreshVacancies
  } = useVacancies();

  const handleCreateVacancy = () => {
    haptics.buttonPress();
    setEditingVacancy(null);
    setIsModalOpen(true);
  };

  const handleEditVacancy = (vacancy: Vacancy) => {
    haptics.buttonPress();
    setEditingVacancy(vacancy);
    setIsModalOpen(true);
    incrementViewCount(vacancy.id);
  };

  const handleSelectVacancy = (vacancy: Vacancy) => {
    haptics.selectItem();
    setSelectedVacancy(vacancy);
    incrementViewCount(vacancy.id);
    // Открыть мобильную детальную панель на мобильных устройствах
    if (isMobile) {
      setShowMobileDetail(true);
    }
  };

  // Фильтруем вакансии по активной вкладке
  const filteredVacancies = vacancies.filter(vacancy => {
    if (activeTab === "active") return vacancy.status === "active";
    if (activeTab === "draft") return vacancy.status === "draft";
    if (activeTab === "deleted") return vacancy.status === "deleted";
    return true;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-500/20 text-green-400",
      draft: "bg-yellow-500/20 text-yellow-400",
      deleted: "bg-red-500/20 text-red-400"
    };

    const labels = {
      active: "Активна",
      draft: "Черновик",
      deleted: "Удалена"
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const formatSalary = (salary: { min: number; max: number; currency: string }) => {
    if (salary.min && salary.max) {
      return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}`;
    }
    if (salary.min) {
      return `от ${salary.min.toLocaleString()} ${salary.currency}`;
    }
    if (salary.max) {
      return `до ${salary.max.toLocaleString()} ${salary.currency}`;
    }
    return "По договоренности";
  };

  if (loading && vacancies.length === 0) {
    return (
      <div>
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Управление вакансиями</h2>
            <p className="text-muted-foreground">Создавайте, редактируйте и управляйте вакансиями</p>
          </div>
        </div>

        {/* Skeleton карточки */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <VacancyCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={refreshVacancies} className="touch-scrolling">
      <div className="flex flex-col lg:flex-row h-full gap-6">
        {/* Левая панель - список вакансий */}
        <div className="w-full lg:w-1/2 space-y-4">
          {/* Заголовок и действия */}
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Вакансии</h2>
                <p className="text-sm text-muted-foreground">{filteredVacancies.length} из {vacancies.length} вакансий</p>
              </div>
              <Button onClick={handleCreateVacancy} size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1" />
                Создать
              </Button>
            </div>

            {/* Вкладки статусов */}
            <div className="flex space-x-1 mb-4 bg-muted/50 rounded-lg p-1">
              <Button
                variant={activeTab === "active" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  haptics.tabChange();
                  setActiveTab("active");
                }}
                className="flex-1 text-xs"
              >
                Активные ({vacancies.filter(v => v.status === "active").length})
              </Button>
              <Button
                variant={activeTab === "draft" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  haptics.tabChange();
                  setActiveTab("draft");
                }}
                className="flex-1 text-xs"
              >
                Черновики ({vacancies.filter(v => v.status === "draft").length})
              </Button>
              <Button
                variant={activeTab === "deleted" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  haptics.tabChange();
                  setActiveTab("deleted");
                }}
                className="flex-1 text-xs"
              >
                Удалённые ({vacancies.filter(v => v.status === "deleted").length})
              </Button>
            </div>

            {/* Поиск */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Поиск вакансий..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 bg-muted/50 border-border/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>

            {/* Компактные фильтры */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="h-8 text-xs bg-muted/50 border-border/50">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="draft">Черновики</SelectItem>
                  <SelectItem value="deleted">Удалённые</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.country} onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}>
                <SelectTrigger className="h-8 text-xs bg-muted/50 border-border/50">
                  <SelectValue placeholder="Страна" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все страны</SelectItem>
                  <SelectItem value="belarus">Беларусь</SelectItem>
                  <SelectItem value="russia">Россия</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.experience} onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}>
                <SelectTrigger className="h-8 text-xs bg-muted/50 border-border/50">
                  <SelectValue placeholder="Опыт" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Любой опыт</SelectItem>
                  <SelectItem value="Не требуется">Не требуется</SelectItem>
                  <SelectItem value="От 1 года">От 1 года</SelectItem>
                  <SelectItem value="От 3 лет">От 3 лет</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Компактный список вакансий */}
          <div className="space-y-2 lg:max-h-[calc(100vh-350px)] lg:overflow-y-auto">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <VacancyCardSkeleton key={index} />
                ))}
              </div>
            ) : filteredVacancies.length === 0 ? (
              <Card className="fade-in">
                <CardContent className="p-6 text-center">
                  <div className="text-muted-foreground">
                    {activeTab === "active" && "Нет активных вакансий"}
                    {activeTab === "draft" && "Нет черновиков"}
                    {activeTab === "deleted" && "Нет удалённых вакансий"}
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredVacancies.map((vacancy) => (
                <Card
                  key={vacancy.id}
                  className={`card-hover cursor-pointer transition-all ${
                    selectedVacancy?.id === vacancy.id ? 'ring-2 ring-primary border-primary' : ''
                  }`}
                  onClick={() => handleSelectVacancy(vacancy)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusBadge(vacancy.status)}
                          {vacancy.isFeatured && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                              ⭐
                            </Badge>
                          )}
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Eye className="w-3 h-3" />
                            <span>{vacancy.viewCount}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-foreground truncate">{vacancy.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{vacancy.company}</p>
                        <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{vacancy.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-medium">
                              {vacancy.country === "belarus" ? "🇧🇾 Беларусь" : "🇷🇺 Россия"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>{formatSalary(vacancy.salary)}</span>
                          </div>
                          {vacancy.paymentPeriodDays && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{vacancy.paymentPeriodDays}д</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            haptics.buttonPress();
                            handleEditVacancy(vacancy);
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary touch-target"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            haptics.duplicate();
                            duplicateVacancy(vacancy);
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-green-400 touch-target"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Правая панель - детальный просмотр */}
        <div className="w-full lg:w-1/2 lg:block hidden">
          {loading && !selectedVacancy ? (
            <Card className="h-full sidebar-gradient border-border/50">
              <CardContent className="p-6">
                <div className="space-y-6 animate-pulse">
                  {/* Skeleton для заголовка */}
                  <div className="flex justify-between items-start border-b border-border/50 pb-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex gap-3">
                        <div className="h-6 bg-muted rounded-full w-20"></div>
                        <div className="h-6 bg-muted rounded-full w-24"></div>
                      </div>
                      <div className="h-8 bg-muted rounded-md w-3/4"></div>
                      <div className="h-6 bg-muted/70 rounded-md w-1/2"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded-md w-28"></div>
                      <div className="h-8 bg-muted rounded-md w-24"></div>
                    </div>
                  </div>
                  {/* Skeleton для контента */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded-md"></div>
                        <div className="h-4 bg-muted rounded-md"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded-md"></div>
                        <div className="h-4 bg-muted rounded-md"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded-md w-1/4"></div>
                      <div className="h-4 bg-muted rounded-md"></div>
                      <div className="h-4 bg-muted rounded-md w-3/4"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : selectedVacancy ? (
            <Card className="h-full sidebar-gradient border-border/50">
              <CardContent className="p-6">
                <div className="fade-in">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusBadge(selectedVacancy.status)}
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span>{selectedVacancy.viewCount} просмотров</span>
                        </div>
                      </div>
                      <h1 className="text-2xl font-bold text-foreground mb-2">{selectedVacancy.title}</h1>
                      <p className="text-lg text-muted-foreground">{selectedVacancy.company}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditVacancy(selectedVacancy)}
                        className="border-border/50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateVacancy(selectedVacancy)}
                        className="border-border/50"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Копировать
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Основная информация */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{selectedVacancy.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-foreground font-medium">
                            {selectedVacancy.country === "belarus" ? "🇧🇾 Беларусь" : "🇷🇺 Россия"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{formatSalary(selectedVacancy.salary)}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{selectedVacancy.experience}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {formatDistanceToNow(selectedVacancy.createdAt.toDate(), {
                              addSuffix: true,
                              locale: ru
                            })}
                          </span>
                        </div>
                        {selectedVacancy.paymentPeriodDays && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{selectedVacancy.paymentPeriodDays} дней для заработка</span>
                          </div>
                        )}
                        {selectedVacancy.isFeatured && (
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              ⭐ Особенная вакансия
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Описание */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Описание</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{selectedVacancy.description}</p>
                    </div>

                    {/* Требования */}
                    {selectedVacancy.requirements.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Требования</h3>
                        <ul className="space-y-2">
                          {selectedVacancy.requirements.map((req, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-muted-foreground">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Преимущества */}
                    {selectedVacancy.benefits.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Преимущества</h3>
                        <ul className="space-y-2">
                          {selectedVacancy.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-muted-foreground">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Действия */}
                    <div className="flex space-x-3 pt-4 border-t border-border/50">
                      <Button
                        onClick={() => {
                          haptics.toggleSwitch();
                          toggleVacancyStatus(selectedVacancy.id, selectedVacancy.status);
                        }}
                        variant="outline"
                        className="flex-1 border-border/50"
                      >
                        {selectedVacancy.status === "active" ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {selectedVacancy.status === "active" ? "Деактивировать" : "Активировать"}
                      </Button>
                      <Button
                        onClick={() => {
                          haptics.delete();
                          deleteVacancy(selectedVacancy.id);
                        }}
                        variant="outline"
                        className="text-destructive hover:text-destructive border-border/50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full sidebar-gradient border-border/50">
              <CardContent className="p-6 flex items-center justify-center h-full">
                <div className="text-center">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Выберите вакансию</h3>
                  <p className="text-muted-foreground">Кликните на вакансию слева, чтобы посмотреть детали</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Модальное окно */}
        <VacancyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          vacancy={editingVacancy}
        />

        {/* Мобильная детальная панель */}
        <Sheet open={showMobileDetail} onOpenChange={setShowMobileDetail}>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {selectedVacancy ? selectedVacancy.title : "Детали вакансии"}
              </SheetTitle>
            </SheetHeader>

            {selectedVacancy && (
              <div className="mt-6 space-y-6">
                <div className="fade-in">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusBadge(selectedVacancy.status)}
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span>{selectedVacancy.viewCount} просмотров</span>
                        </div>
                      </div>
                      <h1 className="text-2xl font-bold text-foreground mb-2">{selectedVacancy.title}</h1>
                      <p className="text-lg text-muted-foreground">{selectedVacancy.company}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleEditVacancy(selectedVacancy);
                          setShowMobileDetail(false);
                        }}
                        className="border-border/50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Редактировать
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Основная информация */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{selectedVacancy.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{formatSalary(selectedVacancy.salary)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{selectedVacancy.experience}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {formatDistanceToNow(selectedVacancy.createdAt.toDate(), {
                              addSuffix: true,
                              locale: ru
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Описание */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Описание</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{selectedVacancy.description}</p>
                    </div>

                    {/* Требования */}
                    {selectedVacancy.requirements.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Требования</h3>
                        <ul className="space-y-2">
                          {selectedVacancy.requirements.map((req, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-muted-foreground">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Преимущества */}
                    {selectedVacancy.benefits.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Преимущества</h3>
                        <ul className="space-y-2">
                          {selectedVacancy.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-muted-foreground">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Действия */}
                    <div className="flex flex-col space-y-3 pt-4 border-t border-border/50">
                      <Button
                        onClick={() => {
                          toggleVacancyStatus(selectedVacancy.id, selectedVacancy.status);
                          setShowMobileDetail(false);
                        }}
                        variant="outline"
                        className="w-full border-border/50"
                      >
                        {selectedVacancy.status === "active" ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {selectedVacancy.status === "active" ? "Деактивировать" : "Активировать"}
                      </Button>
                      <Button
                        onClick={() => {
                          duplicateVacancy(selectedVacancy);
                          setShowMobileDetail(false);
                        }}
                        variant="outline"
                        className="w-full border-border/50"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Копировать
                      </Button>
                      <Button
                        onClick={() => {
                          deleteVacancy(selectedVacancy.id);
                          setShowMobileDetail(false);
                        }}
                        variant="outline"
                        className="w-full text-destructive hover:text-destructive border-border/50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </PullToRefresh>
  );
}
