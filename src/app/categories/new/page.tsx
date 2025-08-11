"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useTranslations } from "@/hooks/use-translations";

const colorOptions = [
  { value: "#3B82F6", name: "Blue", class: "bg-blue-500" },
  { value: "#10B981", name: "Green", class: "bg-green-500" },
  { value: "#F59E0B", name: "Yellow", class: "bg-yellow-500" },
  { value: "#EF4444", name: "Red", class: "bg-red-500" },
  { value: "#8B5CF6", name: "Purple", class: "bg-purple-500" },
  { value: "#06B6D4", name: "Cyan", class: "bg-cyan-500" },
  { value: "#F97316", name: "Orange", class: "bg-orange-500" },
  { value: "#84CC16", name: "Lime", class: "bg-lime-500" },
];

const iconOptions = [
  "📁",
  "📝",
  "💡",
  "🎯",
  "📚",
  "💼",
  "🏠",
  "🎨",
  "🎵",
  "📸",
  "🎮",
  "🍔",
  "✈️",
  "🚗",
  "💰",
  "🏥",
  "📱",
  "💻",
  "🔬",
  "🏃",
  "🎓",
  "❤️",
  "🌟",
  "⚡",
];

export default function NewCategoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form data
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  const [selectedIcon, setSelectedIcon] = useState("📁");
  const { t } = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a category name");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          color: selectedColor,
          icon: selectedIcon,
        }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                {t("common.loading")}
              </p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

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
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{t("categories.create")}</CardTitle>
                <CardDescription>
                  Organize your memories with custom categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("categories.name")}</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("categories.namePlaceholder")}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("categories.icon")}</Label>
                    <div className="grid grid-cols-8 gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setSelectedIcon(icon)}
                          className={`w-10 h-10 text-lg rounded-md border-2 flex items-center justify-center hover:bg-muted ${
                            selectedIcon === icon
                              ? "border-primary bg-primary/10"
                              : "border-border"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("categories.color")}</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setSelectedColor(color.value)}
                          className={`flex items-center gap-2 p-2 rounded-md border-2 hover:bg-muted ${
                            selectedColor === color.value
                              ? "border-primary bg-primary/10"
                              : "border-border"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full ${color.class}`}
                          ></div>
                          <span className="text-sm text-foreground">
                            {color.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="flex items-center gap-3 p-3 border border-border rounded-md bg-card">
                      <span className="text-lg">{selectedIcon}</span>
                      <span className="font-medium text-foreground">
                        {name || t("categories.name")}
                      </span>
                      <div
                        className="w-3 h-3 rounded-full ml-auto"
                        style={{ backgroundColor: selectedColor }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={loading || !name.trim()}
                      className="flex-1"
                    >
                      {loading ? t("form.creating") : t("categories.create")}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link href="/">{t("common.cancel")}</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
