"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

interface UploadedFile {
  filename: string
  fileUrl: string
  originalName: string
  size: number
  type: string
}

export default function NewMemoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  
  // Form data
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState("text")
  const [categoryId, setCategoryId] = useState("")

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchCategories()
  }, [session, status, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        if (data.length > 0) {
          setCategoryId(data[0].id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const uploadResult = await response.json()
        setUploadedFile(uploadResult)
        
        // Set memory type based on file type
        if (uploadResult.type.startsWith('image/')) {
          setType('image')
        } else if (uploadResult.type === 'application/pdf' || uploadResult.type.includes('document')) {
          setType('document')
        } else if (uploadResult.type.startsWith('audio/')) {
          setType('audio')
        } else {
          setType('document')
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setType('text')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim() || !categoryId) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          type,
          fileUrl: uploadedFile?.fileUrl || null,
          categoryId
        })
      })

      if (response.ok) {
        router.push('/')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create memory')
      }
    } catch (error) {
      console.error('Error creating memory:', error)
      alert('Failed to create memory')
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Memories
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Memory</CardTitle>
            <CardDescription>
              Capture your thoughts, experiences, and important moments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your memory"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-sm text-gray-600">
                    <Link href="/categories/new" className="text-blue-600 hover:underline">
                      Create a category first
                    </Link>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your memory here..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>File Upload (Optional)</Label>
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Choose File'}
                    </label>
                    <p className="mt-2 text-sm text-gray-500">
                      Images, PDFs, documents, or text files (max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{uploadedFile.originalName}</p>
                        <p className="text-sm text-gray-500">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
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
                  disabled={loading || !title.trim() || !content.trim() || !categoryId}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Create Memory"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}