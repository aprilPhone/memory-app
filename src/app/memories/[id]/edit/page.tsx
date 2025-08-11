"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useTranslations } from "@/hooks/use-translations";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Memory {
  id: string;
  title: string;
  content: string;
  type: string;
  fileUrl?: string;
  originalFileName?: string;
  url?: string;
  createdAt: string;
  categoryId: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

interface UploadedFile {
  filename: string;
  fileUrl: string;
  originalName: string;
  size: number;
  type: string;
}

export default function EditMemoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const memoryId = params?.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  // Form data
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("text");
  const [categoryId, setCategoryId] = useState("");
  const [url, setUrl] = useState("");
  const { t } = useTranslations();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchMemoryAndCategories();
  }, [session, status, router, memoryId]);

  const fetchMemoryAndCategories = async () => {
    try {
      // Fetch categories and memory data in parallel
      const [categoriesResponse, memoriesResponse] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/memories"),
      ]);

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }

      if (memoriesResponse.ok) {
        const memoriesData = await memoriesResponse.json();
        const foundMemory = memoriesData.find((m: Memory) => m.id === memoryId);

        if (foundMemory) {
          setMemory(foundMemory);
          setTitle(foundMemory.title);
          setContent(foundMemory.content);
          setType(foundMemory.type);
          setCategoryId(foundMemory.categoryId);
          setUrl(foundMemory.url || "");

          // If memory has a file, set it up
          if (foundMemory.fileUrl) {
            // Create a mock uploaded file object for display
            setUploadedFile({
              filename: foundMemory.fileUrl.split("/").pop() || "file",
              fileUrl: foundMemory.fileUrl,
              originalName: foundMemory.fileUrl.split("/").pop() || "file",
              size: 0, // We don't have the original size
              type: foundMemory.type,
            });
          }
        } else {
          // Memory not found, redirect to home
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const uploadResult = await response.json();
        setUploadedFile(uploadResult);

        // Set memory type based on file type
        if (uploadResult.type.startsWith("image/")) {
          setType("image");
        } else if (
          uploadResult.type === "application/pdf" ||
          uploadResult.type.includes("document")
        ) {
          setType("document");
        } else if (uploadResult.type.startsWith("audio/")) {
          setType("audio");
        } else {
          setType("document");
        }
      } else {
        const error = await response.json();
        alert(error.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setType("text");
  };

  const validateUrl = (urlString: string): boolean => {
    if (!urlString.trim()) return true; // Empty URL is valid (optional)
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !categoryId) {
      alert("Please fill in all required fields");
      return;
    }

    if (!validateUrl(url)) {
      alert(t("form.urlInvalid"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/memories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: memoryId,
          title: title.trim(),
          content: content.trim(),
          type,
          fileUrl: uploadedFile?.fileUrl || null,
          originalFileName: uploadedFile?.originalName || null,
          url: url.trim() || null,
          categoryId,
        }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update memory");
      }
    } catch (error) {
      console.error("Error updating memory:", error);
      alert("Failed to update memory");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || initialLoading) {
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

  if (!session || !memory) {
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
                <CardTitle>{t("form.updateMemory")}</CardTitle>
                <CardDescription>Update your memory details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t("form.titleRequired")}</Label>
                    <Input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t("form.titlePlaceholder")}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      {t("form.categoryRequired")}
                    </Label>
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                      required
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">{t("form.contentRequired")}</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={t("form.contentPlaceholder")}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">{t("form.url")}</Label>
                    <Input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder={t("form.urlPlaceholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("form.fileUpload")}</Label>
                    {!uploadedFile ? (
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          accept="image/*,.pdf,.doc,.docx,.txt"
                          className="hidden"
                          id="file-upload"
                          disabled={uploading}
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading
                            ? t("form.uploading")
                            : t("form.chooseFile")}
                        </label>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {t("form.fileDescription")}
                        </p>
                      </div>
                    ) : (
                      <div className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {uploadedFile.originalName}
                            </p>
                            {uploadedFile.size > 0 && (
                              <p className="text-sm text-muted-foreground">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={
                        loading ||
                        !title.trim() ||
                        !content.trim() ||
                        !categoryId
                      }
                      className="flex-1"
                    >
                      {loading ? t("form.updating") : t("form.updateMemory")}
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
