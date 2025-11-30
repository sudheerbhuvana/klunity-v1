import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { storyAPI, aiAPI } from "@/lib/api"
import { logger } from "@/lib/logger"
import { toast } from "sonner"
import { ImagePlus, X, Loader2, Bold, Italic, Link as LinkIcon, FileText, Video, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export function CreateStoryPage() {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [filePreviews, setFilePreviews] = useState<{ url: string, type: string, name: string }[]>([])

    // AI State
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)
    const [aiPrompt, setAiPrompt] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedText, setGeneratedText] = useState("")

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        excerpt: "",
        category: "Student Life",
        tags: ""
    })

    const insertFormatting = (prefix: string, suffix: string) => {
        if (!textareaRef.current) return

        const start = textareaRef.current.selectionStart
        const end = textareaRef.current.selectionEnd
        const text = formData.content
        const before = text.substring(0, start)
        const selection = text.substring(start, end)
        const after = text.substring(end)

        const newText = `${before}${prefix}${selection}${suffix}${after}`
        setFormData(prev => ({ ...prev, content: newText }))

        // Restore focus and selection
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus()
                textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length)
            }
        }, 0)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)

            // Validate file size (50MB limit)
            const validFiles = newFiles.filter(file => {
                if (file.size > 50 * 1024 * 1024) {
                    toast.error(`File ${file.name} is too large (max 50MB)`)
                    return false
                }
                return true
            })

            setFiles(prev => [...prev, ...validFiles])

            // Create previews
            const newPreviews = validFiles.map(file => ({
                url: URL.createObjectURL(file),
                type: file.type,
                name: file.name
            }))
            setFilePreviews(prev => [...prev, ...newPreviews])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
        setFilePreviews(prev => {
            URL.revokeObjectURL(prev[index].url)
            return prev.filter((_, i) => i !== index)
        })
    }

    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) return

        setIsGenerating(true)
        setGeneratedText("") // Clear previous
        try {
            const response = await aiAPI.generateContent({
                prompt: aiPrompt,
                context: formData.content // Send current content as context
            })
            setGeneratedText(response.data.text)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to generate content")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleAcceptAI = () => {
        setFormData(prev => ({
            ...prev,
            content: prev.content + (prev.content ? "\n\n" : "") + generatedText
        }))
        setIsAIDialogOpen(false)
        setAiPrompt("")
        setGeneratedText("")
        toast.success("Content added to your story!")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim() || !formData.content.trim()) {
            toast.error("Title and content are required")
            return
        }

        if (formData.content.length < 50) {
            toast.error("Content must be at least 50 characters long")
            return
        }

        setIsLoading(true)
        logger.userAction('CreateStoryPage', 'Submitting story', { title: formData.title })

        try {
            const data = new FormData()
            data.append('title', formData.title)
            data.append('content', formData.content)
            const finalExcerpt = formData.excerpt.trim() || (formData.content.substring(0, 150) + "...")
            data.append('excerpt', finalExcerpt)
            data.append('category', formData.category)
            data.append('tags', formData.tags)

            files.forEach(file => {
                data.append('images', file) // Backend expects 'images' field for all attachments currently
            })

            await storyAPI.createStory(data)

            toast.success("Story published successfully!")
            logger.info('CreateStoryPage', 'Story created successfully')
            navigate('/feed')
        } catch (error: any) {
            logger.error('CreateStoryPage', 'Failed to create story', error)
            toast.error(error.response?.data?.message || "Failed to publish story")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Share Your Story</h1>
                    <p className="text-gray-500">Share your experiences, projects, or thoughts with the community.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <label className="block text-sm font-bold mb-2">Title</label>
                        <Input
                            value={formData.title}
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Give your story a catchy title..."
                            className="text-xl font-bold border-2 border-gray-200 focus:border-black transition-colors"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Content with Rich Text Toolbar */}
                    <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-bold">Content</label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsAIDialogOpen(true)}
                                    className="mr-2 border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                                    title="Refine with AI"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Refine with AI
                                </Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('**', '**')} title="Bold">
                                    <Bold className="w-4 h-4" />
                                </Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('*', '*')} title="Italic">
                                    <Italic className="w-4 h-4" />
                                </Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('[', '](url)')} title="Link">
                                    <LinkIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <Textarea
                            ref={textareaRef}
                            value={formData.content}
                            onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Write your story here... (min 50 characters)"
                            className="min-h-[300px] text-lg border-2 border-gray-200 focus:border-black transition-colors resize-y font-mono"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-400 mt-2 text-right">Markdown supported</p>
                    </div>

                    {/* Attachments */}
                    <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <label className="block text-sm font-bold mb-4">Attachments</label>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {filePreviews.map((preview, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-black group bg-gray-50 flex items-center justify-center">
                                    {preview.type.startsWith('image/') ? (
                                        <img src={preview.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                    ) : preview.type.startsWith('video/') ? (
                                        <Video className="w-10 h-10 text-gray-400" />
                                    ) : (
                                        <div className="text-center p-2">
                                            <FileText className="w-8 h-8 mx-auto text-gray-400 mb-1" />
                                            <p className="text-xs font-bold truncate max-w-full">{preview.name}</p>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {files.length < 10 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black transition-colors bg-gray-50"
                                >
                                    <ImagePlus className="w-8 h-8 mb-2" />
                                    <span className="text-sm font-bold">Add File</span>
                                </button>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
                            multiple
                            className="hidden"
                        />
                        <p className="text-xs text-gray-500 font-medium">
                            Max 10 files, 50MB each. Supported: Images, Videos, PDF, DOC, PPT.
                        </p>
                    </div>

                    {/* Meta Info */}
                    <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full h-10 rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    <option value="Student Life">Student Life</option>
                                    <option value="Academics">Academics</option>
                                    <option value="Career">Career</option>
                                    <option value="Personal Growth">Personal Growth</option>
                                    <option value="Wellness">Wellness</option>
                                    <option value="Experience">Experience</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Tags</label>
                                <Input
                                    value={formData.tags}
                                    onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                                    placeholder="coding, internship, web-dev (comma separated)"
                                    className="border-2 border-gray-200 focus:border-black transition-colors"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-bold mb-2">Excerpt (Optional)</label>
                            <Input
                                value={formData.excerpt}
                                onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                placeholder="A short summary for the feed card..."
                                className="border-2 border-gray-200 focus:border-black transition-colors"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/feed')}
                            className="h-12 px-8 border-2 border-black font-bold hover:bg-gray-100"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-12 px-8 bg-[#6366F1] text-white hover:bg-[#5558DD] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                "Publish Story"
                            )}
                        </Button>
                    </div>
                </form>

                {/* AI Dialog */}
                <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                                <Sparkles className="w-6 h-6 text-purple-600" />
                                Refine with AI
                            </DialogTitle>
                            <DialogDescription>
                                Describe what you want to write about, and let AI help you get started or refine your ideas.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Your Prompt</label>
                                <Textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="e.g., Write an introduction about my internship experience at Google..."
                                    className="min-h-[100px] border-2 border-black rounded-xl"
                                />
                            </div>

                            {generatedText && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Generated Content</label>
                                    <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 max-h-[200px] overflow-y-auto text-sm">
                                        {generatedText}
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setIsAIDialogOpen(false)} className="border-2 border-black font-bold">
                                Cancel
                            </Button>
                            {!generatedText ? (
                                <Button
                                    onClick={handleGenerateAI}
                                    disabled={isGenerating || !aiPrompt.trim()}
                                    className="bg-purple-600 text-white hover:bg-purple-700 border-2 border-black font-bold"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        onClick={handleGenerateAI}
                                        disabled={isGenerating}
                                        className="border-2 border-black font-bold"
                                    >
                                        Try Again
                                    </Button>
                                    <Button
                                        onClick={handleAcceptAI}
                                        className="bg-green-600 text-white hover:bg-green-700 border-2 border-black font-bold"
                                    >
                                        Use This
                                    </Button>
                                </div>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    )
}
