"use client";

import axiosInstances from "@/utils/axiosInstance";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, ChevronLeft, ChevronRight, Trash2, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotification } from "@/components/context/NotificationContext";
interface Notification {
    _id: string;
    source: {
        _id: string;
        email: string;
        name: string;
        avatar: string;
    };
    destination: string;
    title: string;
    message: string;
    link: string;
    markAsRead: boolean;
    createdAt: string;
    updatedAt: string;
}

const NotificationsPage = () => {
    const { getUnreadCount } = useNotification();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(false);

    const fetchNotifications = async (page: number) => {
        try {
            setLoading(true);
            const response = await axiosInstances.CoreService.get(`/notifications`, {
                params: { page, limit: 5 },
            });
            if (response.status === 200) {
                setNotifications(response.data.notifications);
                setTotalPages(response.data.pages);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        }
    };

    const handleMarkAsRead = async () => {
        try {
            await axiosInstances.CoreService.put(
                `/notifications`,
                { ids: selectedNotifications }
            );
            setSelectedNotifications([]);
            fetchNotifications(page);
            getUnreadCount();
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    const handleDeleteNotifications = async () => {
        try {
            await axiosInstances.CoreService.delete(`/notifications`, {
                data: { ids: selectedNotifications },
            });
            setSelectedNotifications([]);
            fetchNotifications(page);
            getUnreadCount();
        } catch (error) {
            console.error("Error deleting notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications(page);
    }, [page]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const toggleSelectAll = () => {
        setSelectAll(!selectAll);
        setSelectedNotifications(!selectAll ? notifications.map((n) => n._id) : []);
    };

    const toggleNotificationSelection = (id: string) => {
        setSelectedNotifications((prev) =>
            prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id]
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading your Notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <Bell className="w-6 h-6" /> Notifications
                </h1>
                <div className="flex space-x-2">
                    <button
                        onClick={handleMarkAsRead}
                        disabled={selectedNotifications.length === 0}
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg border bg-primary text-white disabled:opacity-50"
                    >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark as Read</span>
                    </button>
                    <button
                        onClick={handleDeleteNotifications}
                        disabled={selectedNotifications.length === 0}
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg border bg-red-500 text-white disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="w-4 h-4"
                />
                <label>Select All</label>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
            >
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <motion.div
                            key={notification._id}
                            className={`flex items-center p-4 border rounded-lg shadow-sm ${notification.markAsRead ? 'opacity-60' : ''} ${selectedNotifications.includes(notification._id)
                                ? "bg-gray-100"
                                : ""
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedNotifications.includes(notification._id)}
                                onChange={() => toggleNotificationSelection(notification._id)}
                                className="w-4 h-4 mr-4"
                            />
                            <Avatar className="mr-4">
                                <AvatarImage src={notification.source.avatar} alt={notification.source.name} />
                                <AvatarFallback>
                                    {notification.source.name[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <h2 className="text-lg font-medium">{notification.title}</h2>
                                <p className="text-sm text-gray-600">{notification.message}</p>
                                <a
                                    href={notification.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-blue-500 hover:underline text-sm mt-1"
                                >
                                    Open Task
                                </a>
                            </div>

                            <span className="text-xs text-gray-500">
                                {new Date(notification.createdAt).toLocaleString()}
                            </span>
                        </motion.div>
                    ))
                ) : (
                    <div className="min-h-screen flex flex-col justify-center items-center">
                        <p className="text-center text-gray-500">
                            You don&apos;t have new notifications available.
                        </p>
                    </div>
                )}
            </motion.div>

            <div className="flex justify-end items-center mt-4 space-x-2">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex items-center justify-center w-8 h-8 rounded-full border hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`flex items-center justify-center w-8 h-8 rounded-full border ${page === pageNumber
                            ? "bg-primary text-white"
                            : "hover:bg-gray-100 text-gray-600"
                            }`}
                    >
                        {pageNumber}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center justify-center w-8 h-8 rounded-full border hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default NotificationsPage;
