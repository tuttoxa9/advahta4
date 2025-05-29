import { Button } from "@/components/ui/button";
import { Briefcase, FileText, Building, Settings } from "lucide-react";
import { useHaptics } from "@/lib/haptics";
import { useIsMobile } from "@/hooks/use-mobile";

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ currentTab, onTabChange }: BottomNavigationProps) {
  const haptics = useHaptics();
  const isMobile = useIsMobile();

  const tabs = [
    { id: "vacancies", label: "Вакансии", icon: Briefcase },
    { id: "applications", label: "Заявки", icon: FileText },
    { id: "companies", label: "Компании", icon: Building },
    { id: "settings", label: "Настройки", icon: Settings },
  ];

  const handleTabChange = (tabId: string) => {
    haptics.tabChange();
    onTabChange(tabId);
  };

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ position: 'fixed', bottom: 0 }}>
      {/* Блюр подложка */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-xl border-t border-border/30"></div>

      {/* Безопасная область для устройств с home indicator */}
      <div className="relative px-2 pb-safe-area-inset-bottom">
        <div className="flex items-center justify-around py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex-col h-auto py-2 px-4 min-w-[72px] touch-target relative
                  transition-all duration-300 ease-out
                  hover:bg-transparent group
                  ${isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {/* Иконка */}
                <div className={`
                  transition-all duration-300 ease-out
                  ${isActive
                    ? 'scale-110 -translate-y-1'
                    : 'scale-100 group-hover:scale-105 group-hover:-translate-y-0.5'
                  }
                `}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Текст лейбла */}
                <span className={`
                  text-xs font-medium mt-1 transition-all duration-300
                  ${isActive
                    ? 'text-foreground opacity-100 scale-105 font-semibold'
                    : 'text-muted-foreground opacity-80 group-hover:opacity-100'
                  }
                `}>
                  {tab.label}
                </span>

                {/* Минималистичный индикатор активности */}
                <div className={`
                  absolute bottom-0 left-1/2 transform -translate-x-1/2
                  w-1 h-1 bg-foreground rounded-full
                  transition-all duration-300
                  ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                `}></div>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
