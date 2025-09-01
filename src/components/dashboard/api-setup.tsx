import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, ExternalLink } from "lucide-react";

interface ApiSetupProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export const ApiSetup = ({ onApiKeySubmit }: ApiSetupProps) => {
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem("sportradar_api_key", apiKey.trim());
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card shadow-pitch">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-pitch rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Soccer Data Hub
          </CardTitle>
          <p className="text-muted-foreground">
            Enter your Sportradar API key to get started
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>
              Get your free API key from{" "}
              <a
                href="https://developer.sportradar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Sportradar Developer Portal
              </a>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Sportradar API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-pitch hover:shadow-glow transition-all duration-300"
              disabled={!apiKey.trim()}
            >
              Start Exploring Soccer Data
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Your API key will be stored locally in your browser
          </p>
        </CardContent>
      </Card>
    </div>
  );
};