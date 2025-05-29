import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { VacanciesTab } from "@/components/vacancies/VacanciesTab";
import { ApplicationsTab } from "@/components/applications/ApplicationsTab";
import { CompaniesTab } from "@/components/companies/CompaniesTab";
import { SettingsTab } from "@/components/settings/SettingsTab";

export function Dashboard() {
  const [currentTab, setCurrentTab] = useState("vacancies");

  const renderTabContent = () => {
    switch (currentTab) {
      case "vacancies":
        return <VacanciesTab />;
      case "applications":
        return <ApplicationsTab />;
      case "companies":
        return <CompaniesTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <VacanciesTab />;
    }
  };

  return (
    <div className="min-h-screen app-gradient-bg mobile-optimized no-bounce">
      <Header currentTab={currentTab} onTabChange={setCurrentTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mobile-safe touch-scrolling scroll-container">
        {renderTabContent()}
      </main>
    </div>
  );
}