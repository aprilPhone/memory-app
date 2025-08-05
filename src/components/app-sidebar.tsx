"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Plus, LogOut, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

interface Category {
  id: string
  name: string
  color: string
  icon: string
  _count?: {
    memories: number
  }
}

export function AppSidebar() {
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (session?.user) {
      fetchCategories()
    }
  }, [session])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-6">
        <h1 className="text-xl font-semibold">My Memories</h1>
        <p className="text-sm text-muted-foreground">Welcome, {session.user.name}</p>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Categories</h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/categories/new">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center gap-3">
                <span className="text-lg">📋</span>
                <span>All Memories</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {categories.map((category) => (
            <SidebarMenuItem key={category.id}>
              <SidebarMenuButton asChild>
                <Link
                  href={`/categories/${category.id}`}
                  className="flex items-center gap-3"
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="flex-1">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {category._count?.memories || 0}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings" className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              className="flex items-center gap-3 text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}