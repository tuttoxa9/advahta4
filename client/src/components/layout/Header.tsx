// Instructions: Добавить вкладку "Настройки" в навигацию

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, Building, LogOut, User, Settings, Star } from "lucide-react";
import { useHaptics } from "@/lib/haptics";

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ currentTab, onTabChange }: HeaderProps) {
  const { user, logout } = useAuth();
  const haptics = useHaptics();

  const tabs = [
    { id: "vacancies", label: "Вакансии", icon: Briefcase },
    { id: "applications", label: "Заявки", icon: FileText },
    { id: "companies", label: "Компании", icon: Building },
    { id: "reviews", label: "Отзывы", icon: Star },
    { id: "settings", label: "Настройки", icon: Settings },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Лого и название */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Briefcase className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Вахта CRM</h1>
              <p className="text-xs text-muted-foreground">Управление вакансиями</p>
            </div>
          </div>

          {/* Навигация - десктоп */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    haptics.tabChange();
                    onTabChange(tab.id);
                  }}
                  className={`text-sm font-medium transition-all duration-200 relative ${
                    currentTab === tab.id
                      ? 'text-foreground bg-muted/60'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </nav>

          {/* Пользователь */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                haptics.buttonPress();
                logout();
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Навигация - мобильная */}
      <div className="md:hidden border-t border-border/30">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  haptics.tabChange();
                  onTabChange(tab.id);
                }}
                className={`
                  flex-1 py-3 text-center text-sm font-medium flex-col h-auto touch-target
                  transition-all duration-300 ease-out
                  ${currentTab === tab.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-5 h-5 mb-1" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
