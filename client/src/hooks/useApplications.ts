import { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  getDoc,
  addDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Application } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    vacancyId: "all",
    period: "all",
    search: ""
  });
  const [stats, setStats] = useState({
    newApplications: 0,
    processingApplications: 0,
    contactedApplications: 0,
    rejectedApplications: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log("useApplications: Starting to fetch applications");
    const applicationsRef = collection(db, "applications");
    let q = query(applicationsRef, orderBy("createdAt", "desc"));

    // Применяем фильтры
    if (filters.status && filters.status !== "all") {
      q = query(q, where("status", "==", filters.status));
    }
    if (filters.vacancyId && filters.vacancyId !== "all") {
      q = query(q, where("vacancyId", "==", filters.vacancyId));
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log("useApplications: Received snapshot with", snapshot.docs.length, "applications");

      try {
      const applicationsData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const applicationData = { id: docSnapshot.id, ...docSnapshot.data() } as Application;

          // Получаем информацию о вакансии
          try {
            const vacancyDoc = await getDoc(doc(db, "vacancies", applicationData.vacancyId));
            if (vacancyDoc.exists()) {
              const vacancyData = vacancyDoc.data();
              applicationData.vacancyTitle = vacancyData.title;
              applicationData.companyName = vacancyData.company;
            }
          } catch (error) {
            console.error("Ошибка получения данных вакансии:", error);
          }

          return applicationData;
        })
      );

      // Применяем фильтры поиска на клиенте
      let filteredApplications = applicationsData;

      if (filters.search) {
        filteredApplications = filteredApplications.filter(app =>
          app.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          app.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          app.phone.includes(filters.search) ||
          (app.vacancyTitle && app.vacancyTitle.toLowerCase().includes(filters.search.toLowerCase()))
        );
      }

      // Применяем фильтр по периоду
      if (filters.period && filters.period !== "all") {
        const now = new Date();
        let startDate = new Date();

        switch (filters.period) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          default:
            startDate = new Date(0); // Показать все
            break;
        }

        filteredApplications = filteredApplications.filter(app =>
          app.createdAt.toDate() >= startDate
        );
      }

      setApplications(filteredApplications);
      console.log("useApplications: Set", filteredApplications.length, "filtered applications");

      // Вычисляем статистику
      const newStats = {
        newApplications: applicationsData.filter(app => app.status === "new").length,
        processingApplications: applicationsData.filter(app => app.status === "viewed").length,
        contactedApplications: applicationsData.filter(app => app.status === "contacted").length,
        rejectedApplications: applicationsData.filter(app => app.status === "rejected").length,
      };
      setStats(newStats);
      console.log("useApplications: Stats calculated", newStats);

      setLoading(false);
      } catch (error) {
        console.error("useApplications: Error processing applications:", error);
        setApplications([]);
        setLoading(false);
      }
    }, (error) => {
      console.error("useApplications: Firestore snapshot error:", error);
      setApplications([]);
      setLoading(false);
    });

    return unsubscribe;
  }, [filters]);

  const updateApplicationStatus = async (id: string, status: Application["status"]) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "applications", id), {
        status,
        updatedAt: serverTimestamp(),
      });

      const statusMessages = {
        viewed: "отмечена как просмотренная",
        contacted: "отмечена как обработанная",
        rejected: "отклонена",
        new: "возвращена в новые"
      };

      toast({
        title: "Статус обновлен",
        description: `Заявка ${statusMessages[status]}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка обновления",
        description: error.message || "Не удалось обновить статус заявки",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = (id: string) => updateApplicationStatus(id, "viewed");
  const markAsContacted = (id: string) => updateApplicationStatus(id, "contacted");
  const rejectApplication = (id: string) => updateApplicationStatus(id, "rejected");

  const deleteAllApplications = async () => {
    try {
      setLoading(true);
      const applicationsRef = collection(db, "applications");
      const querySnapshot = await getDocs(applicationsRef);

      const deletePromises = querySnapshot.docs.map(doc =>
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);

      toast({
        title: "Все отклики удалены",
        description: "Все отклики были успешно удалены из базы данных",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: error.message || "Не удалось удалить все отклики",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addTestApplications = async () => {
    try {
      setLoading(true);

      // Сначала создадим тестовую вакансию если ее нет
      const testVacancy = {
        title: "Разработчик React",
        company: "Тестовая компания",
        location: "Москва",
        salary: { min: 150000, max: 250000, currency: "RUB" },
        experience: "От 1 года",
        employment_type: "Полная занятость",
        description: "Ищем React разработчика в нашу команду",
        requirements: ["React", "TypeScript", "JavaScript"],
        benefits: ["ДМС", "Удаленная работа"],
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const vacancyDoc = await addDoc(collection(db, "vacancies"), testVacancy);

      // Создаем тестовые заявки с разными датами
      const now = new Date();
      const today = Timestamp.fromDate(now);
      const yesterday = Timestamp.fromDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));
      const thisWeek = Timestamp.fromDate(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000));
      const earlier = Timestamp.fromDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000));

      const testApplications = [
        // Сегодня
        {
          vacancyId: vacancyDoc.id,
          name: "Иван Петров",
          phone: "+7 (999) 123-45-67",
          email: "ivan.petrov@example.com",
          message: "Очень заинтересован в данной позиции. Имею 2 года опыта работы с React.",
          status: "new",
          createdAt: today
        },
        {
          vacancyId: vacancyDoc.id,
          name: "Елена Васильева",
          phone: "+7 (999) 888-99-00",
          email: "elena.vasileva@example.com",
          message: "Добрый день! Хочу подать заявку на должность React разработчика.",
          status: "new",
          createdAt: today
        },
        // Вчера
        {
          vacancyId: vacancyDoc.id,
          name: "Анна Сидорова",
          phone: "+7 (999) 765-43-21",
          email: "anna.sidorova@example.com",
          message: "Привет! Хочу присоединиться к вашей команде разработчиков.",
          status: "viewed",
          createdAt: yesterday
        },
        // На этой неделе
        {
          vacancyId: vacancyDoc.id,
          name: "Михаил Козлов",
          phone: "+7 (999) 555-66-77",
          email: "mikhail.kozlov@example.com",
          message: "Здравствуйте! Отправляю резюме на позицию React разработчика.",
          status: "contacted",
          createdAt: thisWeek
        },
        {
          vacancyId: vacancyDoc.id,
          name: "Дмитрий Смирнов",
          phone: "+7 (999) 111-22-33",
          email: "dmitry.smirnov@example.com",
          message: "Заинтересован в вашей вакансии. Готов к собеседованию.",
          status: "viewed",
          createdAt: thisWeek
        },
        // Ранее
        {
          vacancyId: vacancyDoc.id,
          name: "Ольга Иванова",
          phone: "+7 (999) 444-55-66",
          email: "olga.ivanova@example.com",
          message: "Здравствуйте! Рассматриваю возможность работы в вашей компании.",
          status: "rejected",
          createdAt: earlier
        }
      ];

      const promises = testApplications.map(app =>
        addDoc(collection(db, "applications"), app)
      );

      await Promise.all(promises);

      toast({
        title: "Тестовые данные созданы",
        description: "Добавлено 6 тестовых заявок и 1 вакансия",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка создания данных",
        description: error.message || "Не удалось создать тестовые данные",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    applications,
    loading,
    filters,
    setFilters,
    stats,
    markAsViewed,
    markAsContacted,
    rejectApplication,
    updateApplicationStatus,
    deleteAllApplications,
    addTestApplications,
  };
};
