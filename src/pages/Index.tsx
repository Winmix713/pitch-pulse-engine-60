import { useState, useEffect } from "react";
import { ApiSetup } from "@/components/dashboard/api-setup";
import { SoccerDashboard } from "@/components/dashboard/soccer-dashboard";

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const savedApiKey = localStorage.getItem("sportradar_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
  };

  const handleLogout = () => {
    setApiKey(null);
  };

  if (!apiKey) {
    return <ApiSetup onApiKeySubmit={handleApiKeySubmit} />;
  }

  return <SoccerDashboard apiKey={apiKey} onLogout={handleLogout} />;
};

export default Index;