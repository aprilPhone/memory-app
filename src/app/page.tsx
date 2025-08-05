"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Memory {
  id: string
  title: string
  content: string
  type: string
  fileUrl?: string
  createdAt: string
  category: {
    name: string
    icon: string
    color: string
  }
}

export default function Home() {
  const { data: session, status } = useSession()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchMemories()
  }, [session, status, router])

  const fetchMemories = async () => {
    try {
      const response = await fetch("/api/memories")
      if (response.ok) {
        const data = await response.json()
        setMemories(data)
      }
    } catch (error) {
      console.error("Failed to fetch memories:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">All Memories</h1>
          </div>
          <Button asChild>
            <Link href="/memories/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Memory
            </Link>
          </Button>
        </header>

        <main className="flex-1 p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading memories...</p>
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No memories yet</h2>
              <p className="text-gray-600 mb-6">Start capturing your thoughts and experiences!</p>
              <Button asChild>
                <Link href="/memories/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first memory
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memories.map((memory) => (
                <Card key={memory.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{memory.category.icon}</span>
                      <span className="text-sm text-gray-600">{memory.category.name}</span>
                    </div>
                    <CardTitle className="line-clamp-2">{memory.title}</CardTitle>
                    <CardDescription>
                      {new Date(memory.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 line-clamp-3">{memory.content}</p>
                    {memory.fileUrl && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {memory.type}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
