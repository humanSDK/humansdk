import React, { useState, useCallback, memo, useEffect, useRef, useContext } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProjectMembers } from "@/components/context/ProjectMemberContext";
import { useNotification } from "./context/NotificationContext";
import { CommentSidebar } from "./comment-sidebar";
import { NOTIFICATION_SERVICE_API } from "@/constant";
import { io, Socket } from "socket.io-client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import UserContext from "./context/UserContext";
import { MeetingDialog } from "./MeetingDialog";



const statusOptions = ["Not Started", "In Progress", "Completed"];

const taskColors: any = {
  Feature: "#E6F3FF",
  Bug: "#FFE6E6",
  Deployment: "#E6FFF3",
  Documentation: "#FFF3E6",
  Testing: "#F3E6FF",
  Design: "#FFE6F3",
  Research: "#E6FFFA",
  Optimization: "#FFFDE6",
  Refactoring: "#E6F9FF",
  Meeting: "#F3FFE6",
};

interface TaskData {
  label: string;
  status: string;
  type: string;
  assignees: string[];
  onChange: (id: string, data: Partial<TaskData>) => void;
}


interface Comment {
  id: string;
  taskId: string;
  name: string;
  authorId: string;
  avatar?: string;
  content: string;
  timestamp: string;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
}

interface TaskNodeProps extends NodeProps {
  data: TaskData;
  id: string;
  isConnectable: boolean;
}

const TaskNode = ({ data, id, isConnectable }: TaskNodeProps) => {
  const { toast } = useToast();
  const { members, projectDetails } = useProjectMembers();
  const { sendMessage } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [taskName, setTaskName] = useState(data.label);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Initialize socket connection

  const context=useContext(UserContext);
  
  useEffect(() => {
    const token = localStorage.getItem("ct_token");
    if (!token || !id) return;

    const socket = io(NOTIFICATION_SERVICE_API, {
      transports: ["websocket", "polling"],
      query: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to notification service");
      socket.emit("join_task_room", id);
    });

    socket.on("receive_comment", (comment: Comment) => {
      console.log("Received comment:", comment);
      if (!showComments && comment.taskId === id) {
        console.log("Setting hasNewMessages to true");
        setHasNewMessages(true);
      }
    });

    // Clean up socket connection
    return () => {
      if (socket) {
        socket.emit("leave_task_room", id);
        socket.disconnect();
      }
    };
  }, [id]);


  // Reset hasNewMessages when comments are opened
  useEffect(() => {
    if (showComments) {
      setHasNewMessages(false);
    }
  }, [showComments]);
  const handleOpenComments = useCallback(() => {
    setShowComments(true);
    setHasNewMessages(false);
  }, []);
  const filteredAssignees = members.filter((assignee) =>
    assignee.userName.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Ensure assignees is always an array
  const currentAssignees = Array.isArray(data?.assignees) ? data.assignees : [];

  const handleTaskNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTaskName(event.target.value);
    },
    []
  );

  const handleTaskNameBlur = useCallback(() => {
    setIsEditing(false);
    if (!taskName) {
      setTaskName(data.label);
      return;
    }
    data.onChange(id, { label: taskName });
  }, [id, taskName, data]);

  const handleStatusChange = useCallback(
    (value: string) => {
      data.onChange(id, { status: value });
    },
    [id, data]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleTaskNameBlur();
      }
    },
    [handleTaskNameBlur]
  );

  const handleAssigneeChange = useCallback(
    (assigneeEmail: string) => {
      const updatedAssignees:string[] = currentAssignees.includes(assigneeEmail)
        ? currentAssignees.filter((email: string) => email !== assigneeEmail)
        : [...currentAssignees, assigneeEmail];
      data.onChange(id, { assignees: updatedAssignees });
      if (!currentAssignees.includes(assigneeEmail)) {
        const notificationData = {
          sendTo: assigneeEmail,
          title: `${projectDetails.name} - Workflow`,
          message: `${taskName} has been assigned to you.`,
          link: window.location.href,
        };
        sendMessage(notificationData);
      }
    },
    [id, data, currentAssignees, sendMessage, taskName]
  );

  const meetingsAuthHandler=async()=>{
      axios.post(`${process.env.NEXT_PUBLIC_CORE_SERVICE_API}/meetings/auth`,{user:context?.userData.user}).
      then(async res=>{
        if(res.data.authUrl)
        window.open(res.data.authUrl, "_blank");
        else setIsDialogOpen(true)
      })
      .catch(er=>console.log(er))
  }

  const scheduleMeeting=(meetingDetails:any)=>{
      axios.post(`${process.env.NEXT_PUBLIC_CORE_SERVICE_API}/meetings/add-event`,{user:context?.userData.user,meetingDetails})
      .then(()=>{
        setIsDialogOpen(false)
        toast({
          title: "Meeting scheduled successfully",
          description: `Meeting scheduled for ${meetingDetails.summary}`,
          variant: "default",
      })
      })
      .catch(er=>console.log(er))
  }

  const glowingBorderStyle = `
    @keyframes borderGlow {
      0% { border-color: rgba(96, 165, 250, 0.6); }
      50% { border-color: rgba(96, 165, 250, 1); box-shadow: 0 0 10px rgba(96, 165, 250, 0.7); }
      100% { border-color: rgba(96, 165, 250, 0.6); }
    }
  `;

  return (
    <>
    
    <MeetingDialog open={isDialogOpen} onClose={()=>setIsDialogOpen(false)} onSave={scheduleMeeting} members={members} assignees={data.assignees}/>

      <Card
        className={`
          w-64 
          ${
            data.status === "In Progress" &&
            "border-2 border-blue-400 animate-border-glow transition-all"
          }
        `}
        style={{
          backgroundColor: taskColors[data.type] || "#FFFFFF",
          ...(data.status === "In Progress" && {
            animation: "borderGlow 2s ease-in-out infinite",
            boxShadow: "0 0 5px rgba(96, 165, 250, 0.3)",
          }),
        }}
      >
        <style>{glowingBorderStyle}</style>
        <CardHeader className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
            {data.type && (
              <div className="relative mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={handleOpenComments}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                {hasNewMessages && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>
            )}
            {isEditing ? (
              <input
                type="text"
                value={taskName}
                onChange={handleTaskNameChange}
                onBlur={handleTaskNameBlur}
                onKeyDown={handleKeyDown}
                className="w-full p-1 text-sm border rounded"
                autoFocus
              />
            ) : (
              <CardTitle
                className="text-sm cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {data.label.length > 25
                        ? data.label.slice(0, 25) + "..."
                        : data.label}
                    </TooltipTrigger>
                    {data.label.length > 25 && (
                      <TooltipContent>
                        <p>{data.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            )}
            </div>
          </div>
          
        </CardHeader>
        <CardContent className="p-2">
          <Select
            onValueChange={handleStatusChange}
            value={data.status}
            defaultValue={data.status}
          >
            <SelectTrigger className="w-full mb-2">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-between items-center mt-2">
            <Badge variant={data.type === "Bug" ? "destructive" : "default"}>
              {data.type}
            </Badge>
            
          {data.type === "Meeting"?
          <Button onClick={meetingsAuthHandler} size="sm">Schedule</Button>:
          <div className="relative">
            <div
              className="cursor-pointer flex items-center px-2 py-1 text-xs"
              onClick={() => setPopoverOpen((prev) => !prev)}
            >
              {currentAssignees.length > 0 ? (
                <div className="flex items-center">
                  <div className="flex -space-x-[14px]">
                    {members
                      .filter((member) =>
                        currentAssignees.includes(member.email)
                      )
                      .slice(0, 5)
                      .map((assignee, index) => (
                        <Avatar
                          key={index}
                          className="h-8 w-8 border-2 border-white rounded-full"
                          style={{ zIndex: 5 - index }}
                        >
                          <AvatarImage
                            src={assignee.avatar}
                            alt="User Avatar"
                          />
                          <AvatarFallback>
                            {assignee.userName === "Unknown User"
                              ? assignee.email?.charAt(0).toUpperCase()
                              : assignee.userName?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                  </div>
                  {currentAssignees.length > 5 && (
                    <span className="ml-2 flex items-center justify-center text-xs bg-gray-300 text-gray-700 rounded-full h-6 w-6">
                      +{currentAssignees.length - 5}
                    </span>
                  )}
                </div>
              ) : (
                "No Assignee"
              )}
              <span className="ml-2 text-gray-500">&#9660;</span>
            </div>

            {popoverOpen && (
              <div className="absolute top-full mt-2 w-60 bg-white shadow-lg rounded-md border border-gray-200 p-2 z-10">
                <input
                  type="text"
                  placeholder="Search assignee..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full p-1 mb-2 border rounded outline-none"
                />
                <div className="max-h-40 overflow-y-auto w-56 bg-white">
                  {filteredAssignees.map((assignee) => (
                    <div
                      key={assignee.email}
                      className="flex justify-between items-center p-1 hover:bg-gray-50 cursor-pointer transition duration-200 ease-in-out"
                      onClick={() => handleAssigneeChange(assignee.email)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={assignee.avatar}
                            alt="User Avatar"
                          />
                          <AvatarFallback>
                            {assignee.userName === "Unknown User"
                              ? assignee.email?.charAt(0).toUpperCase()
                              : assignee.userName?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {assignee.userName === "Unknown User"
                            ? assignee.email
                            : assignee.userName}
                        </span>
                      </div>
                      {currentAssignees.includes(assignee.email) && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  ))}
                  {filteredAssignees.length === 0 && (
                    <div className="text-sm text-gray-500 p-3">
                      No assignee found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          }
          </div>
        </CardContent>
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
        />
      </Card>

      <CommentSidebar
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        taskId={id}
        taskName={data.label}
      />
    </>
  );
};

export default memo(TaskNode);
