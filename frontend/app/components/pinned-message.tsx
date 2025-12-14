import { motion } from "framer-motion"
import { Pin } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PinnedMessageProps {
  message: {
    id: string
    content: string
    name: string
    avatar?: string
    timestamp: string
  }
  onPinClick: (id: string) => void
  onMessageClick: (id: string) => void
}

export function PinnedMessage({ message, onPinClick, onMessageClick }: PinnedMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
      onClick={() => onMessageClick(message.id)}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.avatar} />
        <AvatarFallback>{message.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{message.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onPinClick(message.id)
            }}
          >
            <Pin className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground truncate">{message.content}</p>
      </div>
    </motion.div>
  )
}
