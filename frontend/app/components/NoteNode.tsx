import React, { useState, useCallback, memo } from 'react'
import { NodeProps } from 'reactflow'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Palette } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useUser } from "@/components/context/UserContext"
import { useProjectMembers } from '@/components/context/ProjectMemberContext'

const colors = ['#ffffff', '#ffcccb', '#ffffe0', '#90ee90', '#add8e6', '#d8bfd8']

const NoteNode = ({ data, id }: NodeProps) => {
  const { userData } = useUser();
  const { members } = useProjectMembers();

  const [isEditing, setIsEditing] = useState(false)
  const [noteText, setNoteText] = useState(data.text)

  // Function to handle text area height adjustment
  const adjustTextAreaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  const handleNoteChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteText(event.target.value)
    adjustTextAreaHeight(event.target)
  }, [])

  const handleNoteBlur = useCallback(() => {
    setIsEditing(false)
    // Store the text with \n for line breaks
    data.onChange(id, {
      text: noteText,
      lastChangedBy: userData.user.email
    })
  }, [id, noteText, data])

  const handleColorChange = useCallback((color: string) => {
    data.onChange(id, { color, lastChangedBy: userData.user.email })
  }, [id, data])

  const lastChangedByMember = members.find(
    member => member.email === data.lastChangedBy
  );

  // Function to render text with line breaks
  const renderTextWithLineBreaks = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <Card className="w-48" style={{ backgroundColor: data.color }}>
      <CardHeader className='py-2 my-0 pl-2 flex flex-row'>
        {lastChangedByMember && (
          <div className="flex items-center">
            <Avatar className="h-12 w-12 border-2 border-white">
              <AvatarImage src={lastChangedByMember.avatar} alt="Last Changed By Avatar" />
              <AvatarFallback>
                {lastChangedByMember.userName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              className="absolute top-0 right-0 bg-transparent hover:bg-neutral-200 text-black"
            >
              <Palette className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-32">
            <div className="flex flex-wrap gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="p-2">
        {isEditing ? (
          <Textarea
            value={noteText}
            onChange={handleNoteChange}
            onBlur={handleNoteBlur}
            className="w-full text-sm border rounded resize-y min-h-[60px] h-auto"
            onFocus={(e) => adjustTextAreaHeight(e.target)}
            autoFocus
          />
        ) : (
          <div
            className="text-sm cursor-pointer whitespace-pre-wrap min-h-[60px]"
            onClick={() => setIsEditing(true)}
          >
            {renderTextWithLineBreaks(data.text)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default memo(NoteNode)