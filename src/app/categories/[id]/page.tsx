"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/hooks/use-translations";

interface Memory {
  id: string;
  title: string;
  content: string;
  type: string;
  fileUrl?: string;
  url?: string;
  createdAt: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function CategoryPage() {
  const { data: session, status } = useSession();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;
  const { t } = useTranslations();

  const fetchCategoryAndMemories = useCallback(async () => {
    try {
      // Fetch memories for the specific category
      const response = await fetch(`/api/categories/${categoryId}/memories`);

      if (response.ok) {
        const data = await response.json();
        setCategory(data.category);
        setMemories(data.memories);
        setFilteredMemories(data.memories);
      } else if (response.status === 404) {
        // Category not found, redirect to home
        router.push("/");
        return;
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch category data:", errorData);
        alert(`Error: ${errorData.error || "Failed to load category"}`);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Failed to connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [categoryId, router]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchCategoryAndMemories();
  }, [session, status, router, categoryId, fetchCategoryAndMemories]);

  // Search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMemories(memories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = memories.filter(
      (memory) =>
        memory.title.toLowerCase().includes(query) ||
        memory.content.toLowerCase().includes(query) ||
        memory.type.toLowerCase().includes(query)
    );
    setFilteredMemories(filtered);
  }, [searchQuery, memories]);

  const handleDeleteMemory = async (memoryId: string) => {
    setDeleting(memoryId);
    try {
      const response = await fetch(`/api/memories?id=${memoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove memory from state
        const updatedMemories = memories.filter(
          (memory) => memory.id !== memoryId
        );
        setMemories(updatedMemories);
        setFilteredMemories(
          updatedMemories.filter(
            (memory) =>
              !searchQuery.trim() ||
              memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              memory.content
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              memory.type.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete memory");
      }
    } catch (error) {
      console.error("Error deleting memory:", error);
      alert("Failed to delete memory");
    } finally {
      setDeleting(null);
    }
  };

  if (status === "loading" || !session) {
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

  if (!category) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center gap-3">
            <span className="text-2xl">{category.icon}</span>
            <h1 className="text-2xl font-semibold">{category.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder={t("home.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button asChild>
              <Link href={`/memories/new?category=${categoryId}`}>
                <Plus className="h-4 w-4 mr-2" />
                {t("home.createMemory")}
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                {t("common.loading")}
              </p>
            </div>
          ) : filteredMemories.length === 0 && !searchQuery.trim() ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{category.icon}</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {t("home.noMemories")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("home.noMemoriesDesc")}
              </p>
              <Button asChild>
                <Link href={`/memories/new?category=${categoryId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("home.createMemory")}
                </Link>
              </Button>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {t("home.noMemories")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("favorites.noFavoritesDesc")} &quot;
                {searchQuery}&quot;
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                {t("home.clearSearch")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {searchQuery.trim() && (
                <div className="text-sm text-muted-foreground">
                  {t("home.found")} {filteredMemories.length} memory
                  {filteredMemories.length !== 1 ? "s" : ""}{" "}
                  {t("home.memoriesFor")} &quot;
                  {searchQuery}&quot; in {category.name}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMemories.map((memory) => (
                  <Card
                    key={memory.id}
                    className="hover:shadow-md transition-shadow relative cursor-pointer group"
                    onClick={() => router.push(`/memories/${memory.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {memory.category.icon}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {memory.category.name}
                          </span>
                        </div>
                        <div
                          className="flex gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <Link href={`/memories/${memory.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {t("memory.deleteConfirm")}
                                </DialogTitle>
                                <DialogDescription>
                                  {t("memory.deleteMessage").replace(
                                    "{title}",
                                    memory.title
                                  )}
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogTrigger asChild>
                                  <Button variant="outline">
                                    {t("memory.cancel")}
                                  </Button>
                                </DialogTrigger>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDeleteMemory(memory.id)}
                                  disabled={deleting === memory.id}
                                >
                                  {deleting === memory.id
                                    ? t("common.loading")
                                    : t("memory.confirmDelete")}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2">
                        {memory.title}
                      </CardTitle>
                      <CardDescription>
                        {new Date(memory.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground/80 line-clamp-3">
                        {memory.content}
                      </p>
                      {memory.fileUrl && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {memory.type}
                          </span>
                        </div>
                      )}
                      {memory.url && (
                        <div className="mt-2">
                          <a
                            href={memory.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                          >
                            🔗 {t("common.open")}
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
