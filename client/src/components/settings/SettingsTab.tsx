import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { 
  Trash2, 
  AlertTriangle, 
  Database, 
  Briefcase, 
  FileText, 
  Building,
  Settings
} from "lucide-react";
import { useVacancies } from "@/hooks/useVacancies";
import { useApplications } from "@/hooks/useApplications";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/hooks/use-toast";

export function SettingsTab() {
  const [loading, setLoading] = useState(false);
  const { deleteAllVacancies } = useVacancies();
  const { deleteAllApplications } = useApplications();
  const { deleteAllCompanies } = useCompanies();
  const { toast } = useToast();

  const handleDeleteAllVacancies = async () => {
    try {
      setLoading(true);
      await deleteAllVacancies();
      toast({
        title: "Все вакансии удалены",
        description: "Все вакансии были успешно удалены из базы данных",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: error.message || "Не удалось удалить вакансии",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllApplications = async () => {
    try {
      setLoading(true);
      await deleteAllApplications();
      toast({
        title: "Все отклики удалены",
        description: "Все отклики были успешно удалены из базы данных",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: error.message || "Не удалось удалить отклики",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllCompanies = async () => {
    try {
      setLoading(true);
      await deleteAllCompanies();
      toast({
        title: "Все компании удалены",
        description: "Все компании были успешно удалены из базы данных",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: error.message || "Не удалось удалить компании",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        deleteAllVacancies(),
        deleteAllApplications(),
        deleteAllCompanies()
      ]);
      toast({
        title: "Все данные удалены",
        description: "Вся информация была успешно удалена из базы данных",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: error.message || "Не удалось удалить все данные",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-safe-area-inset-bottom">
      {/* Заголовок */}
      <div className="flex flex-col mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Настройки системы</h2>
          <p className="text-sm md:text-base text-muted-foreground">Управление данными и настройками приложения</p>
        </div>
      </div>

      {/* Управление данными */}
      <Card className="mb-4 md:mb-6">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center text-lg md:text-xl">
            <Database className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Управление данными
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* Удалить все вакансии */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-3 md:p-4 touch-target"
                  disabled={loading}
                >
                  <div className="flex items-center w-full">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                      <Briefcase className="text-blue-400 w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="font-medium text-sm md:text-base truncate">Удалить все вакансии</p>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">Удалить все существующие вакансии</p>
                    </div>
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
                    Удалить все вакансии?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Все вакансии будут безвозвратно удалены из базы данных.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllVacancies}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={loading}
                  >
                    Удалить все вакансии
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Удалить все отклики */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-3 md:p-4 touch-target"
                  disabled={loading}
                >
                  <div className="flex items-center w-full">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                      <FileText className="text-green-400 w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="font-medium text-sm md:text-base truncate">Удалить все отклики</p>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">Удалить все заявки от соискателей</p>
                    </div>
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
                    Удалить все отклики?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Все отклики и заявки от соискателей будут безвозвратно удалены.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllApplications}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={loading}
                  >
                    Удалить все отклики
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Удалить все компании */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-3 md:p-4 touch-target"
                  disabled={loading}
                >
                  <div className="flex items-center w-full">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                      <Building className="text-purple-400 w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="font-medium text-sm md:text-base truncate">Удалить все компании</p>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">Удалить все зарегистрированные компании</p>
                    </div>
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
                    Удалить все компании?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Все компании будут безвозвратно удалены из базы данных.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllCompanies}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={loading}
                  >
                    Удалить все компании
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Удалить ВСЕ данные */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start h-auto p-3 md:p-4 sm:col-span-2 touch-target"
                  disabled={loading}
                >
                  <div className="flex items-center w-full">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/20 rounded-xl flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                      <Trash2 className="text-red-400 w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="font-medium text-sm md:text-base truncate">Удалить ВСЕ данные из БД</p>
                      <p className="text-xs md:text-sm text-destructive-foreground/80 line-clamp-2">
                        ВНИМАНИЕ! Полная очистка базы данных
                      </p>
                    </div>
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center text-destructive">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    ПОЛНАЯ ОЧИСТКА БАЗЫ ДАННЫХ
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p className="font-medium text-destructive">
                      ⚠️ КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ ⚠️
                    </p>
                    <p>
                      Это действие удалит АБСОЛЮТНО ВСЕ данные из базы:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Все вакансии</li>
                      <li>Все отклики от соискателей</li>
                      <li>Все компании</li>
                      <li>Всю связанную информацию</li>
                    </ul>
                    <p className="font-medium text-destructive">
                      Данное действие НЕОБРАТИМО!
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={loading}
                  >
                    Да, удалить ВСЕ данные
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Дополнительная информация */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center text-lg md:text-xl">
            <Settings className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Информация о системе
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
            <div className="p-3 md:p-4 bg-muted/30 rounded-lg">
              <p className="font-medium mb-1 text-foreground">Версия приложения</p>
              <p className="text-muted-foreground">v1.0.0</p>
            </div>
            <div className="p-3 md:p-4 bg-muted/30 rounded-lg">
              <p className="font-medium mb-1 text-foreground">База данных</p>
              <p className="text-muted-foreground">Firebase Firestore</p>
            </div>
            <div className="p-3 md:p-4 bg-muted/30 rounded-lg">
              <p className="font-medium mb-1 text-foreground">Последнее обновление</p>
              <p className="text-muted-foreground">{new Date().toLocaleDateString('ru-RU')}</p>
            </div>
            <div className="p-3 md:p-4 bg-muted/30 rounded-lg">
              <p className="font-medium mb-1 text-foreground">Статус системы</p>
              <p className="text-green-400 font-medium">Активна</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}