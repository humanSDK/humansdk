"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import { NOTIFICATION_SERVICE_API, USER_SERVICE_API } from "@/constant"; // Replace with your socket server URL
import axios from "axios";
import axiosInstances from "@/utils/axiosInstance";
import { getSessionExpiredCallback } from "@/utils/sessionManager";
// Define types for socket data
interface Notification {
    message: string;
    sender: string;
    timestamp: string;
}
interface Activity {
    _id: string;
    projectName: string;
    taskName: string;
    userName: string;
    userEmail: string;
    userAvatar: string;
    action: string;
    timestamp: string;
    projectPath: string;
}

interface SocketContextType {
    sendMessage: (data: { sendTo: string; title: string; message: string; link: string }) => void;
    notifications: Notification[];
    unreadCount: number;
    getUnreadCount: () => void;
    clearNotifications: () => void;
    activities: Activity[];
    refreshActivities: (entityType?: string, entityId?: string) => void;
    logActivity: (data: {
        entityType: string;
        entityId: string;
        action: string;
        changes: any;
    }) => void;
    
}

// Create the context
const NotificationContext = createContext<SocketContextType | undefined>(undefined);

// Provider component
export function NotificationProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const { toast } = useToast();
 
    // Initialize socket connection
    const establishSocketConnection = async () => {
        const newSocket = io(NOTIFICATION_SERVICE_API, {
            transports: ["websocket", "polling"],
            query: {
                token: localStorage.getItem("ct_token"),
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(newSocket);
        newSocket.on('connect', () => {
            newSocket.emit('join_personal_room');
            newSocket.emit('get_recent_activities', {
                limit: 10
            });
        });


        newSocket.on("connect_error", async (err) => {
            console.error("Socket connection error:", err.message);
            if (err.message === "Authentication error: Token Expired") {
                try {
                    const refreshResponse = await await axios.get(`${USER_SERVICE_API}/auth/new-auth-token`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('rt_token')}` },
                    });;

                    const newToken = refreshResponse.data.token;
                    localStorage.setItem("ct_token", newToken);

                    // Retry the socket connection with the new token
                    establishSocketConnection();

                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    // Trigger session expired callback if token refresh fails
                    const sessionExpiredCallback = getSessionExpiredCallback();
                    if (sessionExpiredCallback) {
                        sessionExpiredCallback(); // Call the global session expired handler
                    }
                }
            }
        });
        getUnreadCount();
 // Handle connection errors
//  setupSocketErrorHandling(newSocket)
        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
            newSocket.emit('disconnect_personal_room');
        };
    }

// Function to refresh activities using socket
const refreshActivities = (entityType?: string, entityId?: string) => {
    if (socket) {
        socket.emit('get_recent_activities', {
            entityType,
            entityId,
            limit: 5
        });
    }
};

    useEffect(() => {
        establishSocketConnection()
    }, []);

    // Handle receiving notifications
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (data: any) => {
            const { notification } = data;

            // Destructure the notification fields
            const {
                source: { name, avatar },
                title,
                message,
            } = notification;

            // Display the toast
            toast({
                title: name, // Source name
                description: (
                    <div className="flex items-center">
                        <img
                            src={avatar}
                            alt={name}
                            className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                            <p className="font-bold">{title}</p>
                            <p>{message}</p>
                        </div>
                    </div>
                ),
            });
            getUnreadCount();
        };

        socket.on("receive_new_notification", handleNewNotification);

        return () => {
            socket.off("receive_new_notification", handleNewNotification);
        };
    }, [socket, toast]);

    // Function to send messages
    const sendMessage = (data: { sendTo: string; title: string; message: string; link: string }) => {
        console.log("---->not data", data)
        if (socket) {
            socket.emit("send_notification", data);
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Socket connection is not established",
            });
        }
    };

    //func to get count of unread msgs
    const getUnreadCount = async () => {
        try {
            const response = await axiosInstances.CoreService.get(`/notifications/unread`)
            console.log("UNREAD COUNT: ", response)
            if (response.status == 200 && response.data) {
                setUnreadCount(response.data.unreadCount)
            }
        } catch (error) {
            console.log("failed to get unread count:", error)
        }
    }

    // Clear notifications
    const clearNotifications = () => {
        setNotifications([]);
    };
      // Modified logActivity function
      const logActivity = (data: {
        entityType: string;
        entityId: string;
        action: string;
        changes: any;
    }) => {
        if (socket) {
            socket.emit('log_activity', data);
        }
    };
    useEffect(() => {
        if (!socket) return;
        socket.emit('join_activity_room');
        const handleActivityUpdate = (log: any) => {
            setActivities(prevActivities => {
                const newActivity = {
                    _id: log.id,
                    projectName: log.projectName || '',
                    taskName: log.changes?.taskName || '',
                    userName: log.user.name || '',
                    userEmail: log.user.email || '',
                    userAvatar: log.user.avatar || '',
                    action: log.action,
                    timestamp: log.timestamp,
                    projectPath: log.entityType
                };
                return [newActivity, ...prevActivities.slice(0, 4)];
            });
        };

        socket.on('activity_update', handleActivityUpdate);
   

        return () => {
            socket.off('activity_update', handleActivityUpdate);
            socket.emit('leave_activity_room');
        };
    }, [socket]);

    // Context value
    const value = {
        sendMessage,
        notifications,
        unreadCount,
        getUnreadCount,
        clearNotifications,
        activities,
        refreshActivities,
        logActivity
    };

    return (
        <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
    );
}

// Custom hook to use the socket context
export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotification must be used within a SocketProvider");
    }
    return context;
}

export default NotificationContext;