'use client'

import React, { useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { motion, AnimatePresence } from "framer-motion"
import { FileUp, Send, X, Trash2, AlertCircle, Loader2, MessageSquare, XCircle, Download, FileText, ImageIcon, Pin } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { NOTIFICATION_SERVICE_API } from "@/constant"
import { getSessionExpiredCallback } from "@/utils/sessionManager"
import axiosInstances from "@/utils/axiosInstance"
import { PinnedMessage } from "@/components/pinned-message"

interface Comment {
  id: string
  name: string
  authorId: string
  avatar?: string
  content: string
  timestamp: string
  isPinned?: boolean
  pinnedBy?: string
  pinnedAt?: string
  attachments?: Array<{
    name: string
    url: string
  }>
}

interface FilePreview {
  file: File
  preview?: string
  type: string
}

interface CommentSidebarProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskName: string
}

interface PreviewFile {
  url: string
  name: string
  type?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;

export function CommentSidebar({ isOpen, onClose, taskId, taskName }: CommentSidebarProps) {
  const [message, setMessage] = React.useState("")
  const [comments, setComments] = React.useState<Comment[]>([])
  const [socket, setSocket] = React.useState<Socket | null>(null)
  const [currentUserId, setCurrentUserId] = React.useState<string>("")
  const [isAlertOpen, setIsAlertOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  const [isConnecting, setIsConnecting] = React.useState(true)
  const [selectedFiles, setSelectedFiles] = React.useState<FilePreview[]>([])
  const [showPinnedSection, setShowPinnedSection] = React.useState(true)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [currentUserAvatar, setCurrentUserAvatar] = React.useState<string>("")
  const [currentUserName, setCurrentUserName] = React.useState<string>("")
  const [previewFile, setPreviewFile] = React.useState<PreviewFile | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const { toast } = useToast()
  console.log("->", currentUserAvatar, currentUserName)

  const handlePinMessage = (commentId: string) => {
    if (!socket) return;
    socket.emit('toggle_pin_message', { commentId, taskId });
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }

  const validateFiles = (files: File[]): boolean => {
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds the 5MB limit`
        });
        return false;
      }
    }

    if (selectedFiles.length + files.length > MAX_FILES) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: `Maximum ${MAX_FILES} files allowed`
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (validateFiles(files)) {
      handleFiles(files);
    }
    event.target.value = '';
  }

  const getFileType = (url: string, name: string) => {
    const extension = name.split('.').pop()?.toLowerCase()

    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
      ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image'
    }

    if (url.match(/\.(pdf)$/i) || extension === 'pdf') {
      return 'pdf'
    }

    if (url.match(/\.(doc|docx)$/i) || ['doc', 'docx'].includes(extension || '')) {
      return 'word'
    }

    return 'other'
  }

  const handleFilePreview = (file: { url: string, name: string }) => {
    setPreviewFile({
      ...file,
      type: getFileType(file.url, file.name)
    })
    setIsPreviewOpen(true)
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.log("error:", error)
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the file. Please try again."
      })
    }
  }

  const FilePreviewModal = ({ file, isOpen, onClose }: any) => {
    if (!file) return null

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate">
              {file.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(file.url, file.name)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0 mt-4">
            {file.type === 'image' ? (
              <div className="h-full flex items-center justify-center bg-muted rounded-lg">
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : file.type === 'pdf' ? (
              <iframe
                src={file.url}
                className="w-full h-full rounded-lg"
                title={file.name}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="h-16 w-16 mb-4" />
                <p>Preview not available</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file.url, file.name)}
                  className="mt-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download to view
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const renderComment = (comment: Comment) => (
    <motion.div
      key={comment.id}
      data-message-id={comment.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isCurrentUser(comment.authorId) ? 'justify-end' : 'justify-start'}`}
    >
      <Card
        className={`p-4 max-w-[80%] relative ${isCurrentUser(comment.authorId)
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted hover:bg-muted/80'
          }`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePinMessage(comment.id)}
          className={`h-6 w-6 absolute ${
            isCurrentUser(comment.authorId) ? 'left-0' : 'right-0'
          } top-0 -translate-y-1/2 ${
            comment.isPinned ? 'text-primary' : 'text-muted-foreground'
          } hover:text-primary transition-colors`}
        >
          <Pin className="h-4 w-4" />
        </Button>

        <div className={`flex items-start gap-4 ${isCurrentUser(comment.authorId) ? 'flex-row-reverse' : 'flex-row'}`}>
          <Avatar className="h-8 w-8 ring-2 ring-background">
            <AvatarImage src={comment.avatar} />
            <AvatarFallback>{comment.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className={`flex items-center gap-2 ${isCurrentUser(comment.authorId) ? 'justify-end' : 'justify-start'}`}>
              <span className="text-sm font-medium">
                {isCurrentUser(comment.authorId) ? 'You' : comment.name}
              </span>
              <span className={`text-xs ${isCurrentUser(comment.authorId)
                ? 'text-primary-foreground/80'
                : 'text-muted-foreground'
                }`}>
                {formatTimestamp(comment.timestamp)}
              </span>
            </div>
            {comment.isPinned && (
              <div className={`text-xs ${isCurrentUser(comment.authorId) ? 'text-primary-foreground/80' : 'text-muted-foreground'} mt-1`}>
                📌 Pinned by {comment.pinnedBy}
              </div>
            )}
            {comment.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}
            {comment.attachments && comment.attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 flex flex-wrap gap-2"
              >
                {comment.attachments.map((file: any, index: any) => {
                  const fileType = getFileType(file.url, file.name)
                  return (
                    <button
                      key={index}
                      onClick={() => handleFilePreview(file)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isCurrentUser(comment.authorId)
                        ? 'bg-primary-foreground/10 hover:bg-primary-foreground/20'
                        : 'bg-background hover:bg-background/80'
                        }`}
                    >
                      {fileType === 'image' ? (
                        <ImageIcon className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <span className="text-xs truncate max-w-[120px]">
                        {file.name}
                      </span>
                    </button>
                  )
                })}
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )

  const handleFiles = (files: File[]) => {
    const newFiles = files.map(file => {
      const preview = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined
      return { file, preview, type: file.type }
    })
    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files = Array.from(items)
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .filter(Boolean) as File[];

    if (files.length > 0 && validateFiles(files)) {
      handleFiles(files);
    }
  }, [selectedFiles.length]);

  React.useEffect(() => {
    textareaRef.current?.addEventListener('paste', handlePaste)
    return () => {
      textareaRef.current?.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const establishSocketConnection = async () => {
    try {
      const token = localStorage.getItem("ct_token")
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Authentication token not found"
        })
        return
      }

      const newSocket = io(NOTIFICATION_SERVICE_API, {
        transports: ["websocket"],
        query: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })

      setSocket(newSocket)

      const payload = JSON.parse(atob(token.split('.')[1]))
      setCurrentUserName(payload.name || 'You')
      setCurrentUserAvatar(payload.avatar || '')

      newSocket.on("connect", () => {
        setIsConnecting(false)
        newSocket.emit('join_task_room', taskId)
        newSocket.emit('get_task_comments', { taskId })
      })

      newSocket.on("reconnect", () => {
        newSocket.emit('join_task_room', taskId)
        newSocket.emit('get_task_comments', { taskId })
      })

      newSocket.on('receive_comment', (comment: Comment) => {
        setComments(prev => [...prev, comment])
        setTimeout(scrollToBottom, 100)
      })

      newSocket.on('task_comments', (response: { comments: Comment[], currentUserId: string }) => {
        const { comments, currentUserId } = response
        setComments(comments)
        setCurrentUserId(currentUserId)
        localStorage.setItem(`comments_${taskId}`, JSON.stringify(comments))
        setTimeout(scrollToBottom, 100)
      })

      newSocket.on('message_pin_updated', (updatedComment: Comment) => {
        setComments(prev => 
          prev.map(comment => 
            comment.id === updatedComment.id ? updatedComment : comment
          )
        );
      });

      newSocket.on('chat_cleared', () => {
        setComments([])
        toast({
          title: "Chat Cleared",
          description: "Your chat history has been cleared."
        })
      })

      newSocket.on('comment_error', (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        })
      })

      newSocket.on("connect_error", async (err) => {
        console.error("Socket connection error:", err.message);
        if (err.message === "Authentication error: Token Expired") {
          try {
            const refreshResponse = await axiosInstances.UserService.get("/auth/new-auth-token", {
              headers: { Authorization: `Bearer ${localStorage.getItem("rt_token")}` },
            });

            const newToken = refreshResponse.data.token;
            localStorage.setItem("ct_token", newToken);
            establishSocketConnection();

          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            const sessionExpiredCallback = getSessionExpiredCallback();
            if (sessionExpiredCallback) {
              sessionExpiredCallback();
            }
          }
        }
      });

      const cachedComments = localStorage.getItem(`comments_${taskId}`)
      if (cachedComments) {
        setComments(JSON.parse(cachedComments))
      }

      return () => {
        newSocket.emit('leave_task_room', taskId)
        newSocket.disconnect()
      }
    } catch (error) {
      console.error('Socket connection error:', error)
    }
  }

  React.useEffect(() => {
    establishSocketConnection()
  }, [taskId])

  React.useEffect(() => {
    scrollToBottom()
  }, [comments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!message.trim() && selectedFiles.length === 0) || !socket || isSending) return

    setIsSending(true)
    if (selectedFiles.length > 0) {
      setIsUploading(true)
    }
    try {
      if (selectedFiles.length > 0) {
        const processedFiles = await Promise.all(
          selectedFiles.map(async ({ file }) => await convertToBuffer(file))
        )

        socket.emit('upload_files', { files: processedFiles })

        socket.once('files_uploaded', (uploadedFiles) => {
          setIsUploading(false)
          socket.emit('send_comment', {
            taskId,
            content: message.trim(),
            attachments: uploadedFiles
          })

          setSelectedFiles([])
          setMessage("")
        })

        socket.once('upload_error', (error) => {
          setIsUploading(false)
          throw new Error(error.message)
        })
      } else {
        socket.emit('send_comment', {
          taskId,
          content: message.trim(),
          attachments: []
        })
        setMessage("")
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message"
      })
    } finally {
      setIsSending(false)
    }
  }

  const FilePreviewComponent = ({ files, onRemove }: any) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {files.map((file: any, index: any) => (
        <div key={index} className="relative group">
          {file.preview ? (
            <img
              src={file.preview}
              alt="preview"
              className="h-20 w-20 object-cover rounded border"
            />
          ) : (
            <div className="h-20 w-20 flex items-center justify-center bg-muted rounded border">
              <FileUp className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <button
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <XCircle className="h-4 w-4" />
          </button>
          <span className="absolute bottom-0 left-0 right-0 text-xs truncate bg-black/50 text-white p-1">
            {file.file.name}
          </span>
        </div>
      ))}
    </div>
  )

  const convertToBuffer = async (file: File): Promise<{ buffer: Buffer, originalname: string, mimetype: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer
        const buffer = Buffer.from(arrayBuffer)
        resolve({
          buffer,
          originalname: file.name,
          mimetype: file.type
        })
      }
      reader.onerror = () => reject(new Error('File reading failed'))
      reader.readAsArrayBuffer(file)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleClearChat = async () => {
    if (!socket) return
    setIsLoading(true)
    try {
      socket.emit('clear_task_comments', { taskId })
      setIsAlertOpen(false)
    } catch (error) {
      console.log("err:;", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear chat history"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isCurrentUser = (authorId: string) => {
    return authorId === currentUserId
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'short'
    }).format(date)
  }

  const pinnedMessages = comments.filter(comment => comment.isPinned);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[95vw] sm:w-[600px] p-0 border-l shadow-2xl transition-transform duration-300">
          <SheetHeader className="p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="truncate">{taskName}</span>
              </SheetTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAlertOpen(true)}
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  disabled={comments.length === 0 || isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {pinnedMessages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPinnedSection(!showPinnedSection)}
                    className={`h-8 w-8 transition-colors ${showPinnedSection ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 hover:bg-background transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100vh-10rem)]">
            {showPinnedSection && pinnedMessages.length > 0 && (
              <div className="border-b bg-muted/30">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Pin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Pinned Messages</span>
                    <span className="text-xs text-muted-foreground">({pinnedMessages.length})</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPinnedSection(!showPinnedSection)}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-h-[30vh] overflow-y-auto">
                  {pinnedMessages.map((message) => (
                    <PinnedMessage
                      key={message.id}
                      message={message}
                      onPinClick={handlePinMessage}
                      onMessageClick={(id) => {
                        // Find the message index
                        const messageIndex = comments.findIndex(m => m.id === id)
                        if (messageIndex > -1) {
                          // Scroll to message
                          const messageElements = scrollAreaRef.current?.querySelectorAll('[data-message-id]')
                          messageElements?.[messageIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <ScrollArea className="flex-1 px-4" ref={scrollAreaRef} style={{ height: `calc(100vh - ${showPinnedSection && pinnedMessages.length > 0 ? '250px' : '180px'})` }}>
              {isConnecting ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-muted-foreground"
                >
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p>Connecting to chat...</p>
                </motion.div>
              ) : comments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-muted-foreground"
                >
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p>No messages yet. Start the conversation!</p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence initial={false}>
                    {comments.map(renderComment)}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>

            <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                />
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[60px] max-h-[200px] resize-none pr-24"
                    disabled={isConnecting || isSending}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isConnecting || isSending || isUploading || selectedFiles.length >= MAX_FILES}
                    >
                      <FileUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="submit"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isConnecting || isSending || (!message.trim() && selectedFiles.length === 0)}
                    >
                      {isSending || isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <FilePreviewComponent
                      files={selectedFiles}
                      onRemove={removeFile}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Files: {selectedFiles.length}/{MAX_FILES}</span>
                      <span>Max size: 5 MB</span>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <FilePreviewModal
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          setPreviewFile(null)
        }}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your chat history for this task. Other users will still see their chat history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearChat}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Clear History'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

