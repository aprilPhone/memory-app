"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useTranslations } from "@/hooks/use-translations";

interface Memory {
  id: string;
  title: string;
  content: string;
  type: string;
  fileUrl?: string;
  originalFileName?: string;
  url?: string;
  isFavorite: boolean;
  createdAt: string;
  categoryId: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

export default function MemoryDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const memoryId = params?.id as string;
  const { t } = useTranslations();

  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchMemory();
  }, [session, status, router, memoryId]);

  const fetchMemory = async () => {
    try {
      const response = await fetch("/api/memories");
      if (response.ok) {
        const memories = await response.json();
        const foundMemory = memories.find((m: Memory) => m.id === memoryId);

        if (foundMemory) {
          setMemory(foundMemory);
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Failed to fetch memory:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMemory = async () => {
    if (!memory) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/memories?id=${memory.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete memory");
      }
    } catch (error) {
      console.error("Error deleting memory:", error);
      alert("Failed to delete memory");
    } finally {
      setDeleting(false);
    }
  };

  const renderFileViewer = () => {
    if (!memory?.fileUrl) return null;

    const fileExtension = memory.fileUrl.split(".").pop()?.toLowerCase();
    const fileName =
      memory.originalFileName ||
      memory.fileUrl.split("/").pop() ||
      "Unknown file";
    const isImage =
      memory.type === "image" ||
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
        fileExtension || ""
      );
    const isPDF = memory.type === "document" && fileExtension === "pdf";

    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-6 text-foreground">
          {t("memory.attachedFile")}
        </h3>
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {isImage ? (
            <div className="space-y-0">
              <div className="p-6">
                <img
                  src={memory.fileUrl}
                  alt={memory.title}
                  className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                  style={{ maxHeight: "600px" }}
                />
              </div>
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        Image • {memory.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={memory.fileUrl}
                        download={fileName}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={memory.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : isPDF ? (
            <div className="space-y-0">
              <div className="h-96">
                <iframe
                  src={memory.fileUrl}
                  className="w-full h-full"
                  title={memory.title}
                />
              </div>
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        PDF • {memory.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={memory.fileUrl}
                        download={fileName}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={memory.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      Document • {memory.type}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={memory.fileUrl}
                      download={fileName}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={memory.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (status === "loading" || loading) {
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

  if (!memory) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Memory not found
              </h2>
              <Button asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("common.back")}
                </Link>
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span
                  className="text-2xl p-3 rounded-lg"
                  style={{ backgroundColor: `${memory.category.color}20` }}
                >
                  {memory.category.icon}
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {memory.category.name}
                  </p>
                  <h1 className="text-3xl font-bold text-foreground">
                    {memory.title}
                  </h1>
                  <p className="text-muted-foreground">
                    {new Date(memory.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/memories/${memory.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t("memory.edit")}
                  </Link>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("memory.delete")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("memory.deleteConfirm")}</DialogTitle>
                      <DialogDescription>
                        {t("memory.deleteMessage").replace(
                          "{title}",
                          memory.title
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogTrigger asChild>
                        <Button variant="outline">{t("memory.cancel")}</Button>
                      </DialogTrigger>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteMemory}
                        disabled={deleting}
                      >
                        {deleting
                          ? t("common.loading")
                          : t("memory.confirmDelete")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Content */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <div className="prose prose-lg max-w-none text-foreground">
                <div className="whitespace-pre-wrap text-foreground/90">
                  {memory.content}
                </div>
              </div>
            </div>

            {/* URL Link */}
            {memory.url && (
              <div className="mt-6 bg-card border border-border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate max-w-xs">
                      {memory.url}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={memory.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t("common.open")}
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* File Attachment */}
            {renderFileViewer()}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
