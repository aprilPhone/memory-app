"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Heart } from "lucide-react";
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
  originalFileName?: string;
  url?: string;
  isFavorite: boolean;
  createdAt: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { t } = useTranslations();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchFavoriteMemories();
  }, [session, status, router]);

  const fetchFavoriteMemories = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setMemories(data);
        setFilteredMemories(data);
      }
    } catch (error) {
      console.error("Failed to fetch favorite memories:", error);
    } finally {
      setLoading(false);
    }
  };

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
        memory.category.name.toLowerCase().includes(query) ||
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
              memory.category.name
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

  const handleToggleFavorite = async (
    memoryId: string,
    isFavorite: boolean
  ) => {
    try {
      const response = await fetch("/api/favorites", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memoryId,
          isFavorite: !isFavorite,
        }),
      });

      if (response.ok) {
        // Remove from favorites list since we're unfavoriting
        const updatedMemories = memories.filter(
          (memory) => memory.id !== memoryId
        );
        setMemories(updatedMemories);
        setFilteredMemories(updatedMemories);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update favorite status");
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      alert("Failed to update favorite status");
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{t("favorites.title")}</h1>
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
              <Link href="/memories/new">
                <Plus className="h-4 w-4 mr-2" />
                {t("home.createMemory")}
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading favorite memories...</p>
            </div>
          ) : filteredMemories.length === 0 && !searchQuery.trim() ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💖</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No favorite memories yet
              </h2>
              <p className="text-gray-600 mb-6">
                Mark memories as favorites to see them here!
              </p>
              <Button asChild>
                <Link href="/">
                  <Heart className="h-4 w-4 mr-2" />
                  Browse all memories
                </Link>
              </Button>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No favorites found
              </h2>
              <p className="text-gray-600 mb-6">
                No favorite memories match your search query &quot;{searchQuery}
                &quot;
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {searchQuery.trim() && (
                <div className="text-sm text-gray-600">
                  Found {filteredMemories.length} favorite memory
                  {filteredMemories.length !== 1 ? "s" : ""} for &quot;
                  {searchQuery}&quot;
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
                          <span className="text-sm text-gray-600">
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
                            onClick={() =>
                              handleToggleFavorite(memory.id, memory.isFavorite)
                            }
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
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
                      <p className="text-gray-700 line-clamp-3">
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
