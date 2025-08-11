"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useSettings } from "@/contexts/settings-context";
import { useTranslations } from "@/hooks/use-translations";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, language, setTheme, setLanguage } = useSettings();
  const { t } = useTranslations();
  const [saveMessage, setSaveMessage] = useState("");

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  const handleSave = () => {
    setSaveMessage(t("settings.saved"));
    setTimeout(() => setSaveMessage(""), 3000);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back")}
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex-1 space-y-4 p-4 pt-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("settings.title")}
            </h1>
            <p className="text-muted-foreground">{t("settings.description")}</p>
          </div>

          {saveMessage && (
            <div className="max-w-2xl">
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
                {saveMessage}
              </div>
            </div>
          )}

          <div className="max-w-2xl space-y-6">
            {/* Language Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <CardTitle>{t("settings.language")}</CardTitle>
                </div>
                <CardDescription>
                  {t("settings.languageDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      language === "en"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => setLanguage("en")}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          language === "en"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      />
                      <Label className="cursor-pointer">
                        {t("settings.english")}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      English
                    </p>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      language === "es"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => setLanguage("es")}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          language === "es"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      />
                      <Label className="cursor-pointer">
                        {t("settings.spanish")}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Español
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {theme === "light" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                  <CardTitle>{t("settings.theme")}</CardTitle>
                </div>
                <CardDescription>
                  {t("settings.themeDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      theme === "light"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => setTheme("light")}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          theme === "light"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      />
                      <Label className="cursor-pointer flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        {t("settings.light")}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Light mode
                    </p>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      theme === "dark"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => setTheme("dark")}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          theme === "dark"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      />
                      <Label className="cursor-pointer flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        {t("settings.dark")}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dark mode
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave}>{t("settings.save")}</Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
