"use client";

import { useState, useEffect, useRef } from "react";
import { Home, Users, Settings, ChevronLeft, User, Mail, Bell, LogOut, TableOfContents } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Logo from "../Logo";
import { MiniLogo } from "../Logo";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';
import { useUser } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";
export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const sidebarRef = useRef<HTMLElement>(null);
    const pathname = usePathname();
    const { userData } = useUser();
    const { unreadCount } = useNotification();



    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.clientX);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const difference = startX - e.clientX;
        if (Math.abs(difference) > 50) {
            setIsCollapsed(difference > 0);
            setIsDragging(false);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, startX]);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleLogOut = () => {
        localStorage.removeItem("ct_token");
        localStorage.removeItem("rt_token");
        window.location.href = '/login';
    };

    const menuItems = [
        { path: '/console', icon: Home, label: 'Home' },
        { path: '/console/projects', icon: TableOfContents, label: 'Projects' },
        { path: '/console/team-members', icon: Users, label: 'Teams' },
        { path: '/console/notifications', icon: Mail, label: 'Notifications' },
        { path: '/console/settings', icon: Settings, label: 'Settings' },
    ];

    useEffect(() => {
        if (window.location.pathname.includes("/projects/")) {
            setIsCollapsed(true)
        }
    }, [])

    return (
        <aside
            ref={sidebarRef}
            className={cn(
                " sticky h-screen flex flex-col",
                "bg-white dark:bg-gray-900",
                "border-r border-gray-200 dark:border-gray-800",
                "transition-all duration-300 ease-in-out z-30",
                isCollapsed ? "w-[68px]" : "w-64",
            )}
        >
            {/* Logo Section */}
            <div className={cn(
                "flex items-center h-16 px-2",
                "border-b border-gray-200 dark:border-gray-800",
                isCollapsed ? "justify-center" : "justify-between"
            )}>
                {isCollapsed ? (
                    <button
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={toggleCollapse}
                    >
                        <div className="flex items-center">
                            <MiniLogo className="w-8 h-8" />

                        </div>
                    </button>
                ) : (
                    <>
                        <div className="pl-4">
                            <Logo />
                        </div>
                        <button
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            onClick={toggleCollapse}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link href={item.path}>
                                    <span className={cn(
                                        "relative flex items-center gap-4 px-4 py-3 rounded-lg",
                                        "transition-all duration-200",
                                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                                        "group relative",
                                        isActive && "bg-primary/10 text-primary font-medium",
                                        isCollapsed && "justify-center px-0" // Update 1
                                    )}>
                                        <item.icon
                                            size={20}
                                            className={cn(
                                                "transition-transform duration-200",
                                                isActive ? "text-primary" : "text-gray-500",
                                                isCollapsed && "mx-auto justify-center w-5 h-5" // Update 2
                                            )}
                                        />
                                        {
                                            unreadCount > 0 && item.label == "Notifications" &&
                                            <div className={`absolute ${isCollapsed ? '-top-0' : 'right-3 '}`}>
                                                <span className="bg-red-500 text-white px-2 py-1 text-[10px] rounded-full">{unreadCount}</span>
                                            </div>
                                        }
                                        <span className={cn(
                                            "transition-all duration-200",
                                            isCollapsed ? "opacity-0 w-0" : "opacity-100",
                                        )}>
                                            {item.label}
                                        </span>
                                        {isCollapsed && (
                                            <div className="absolute left-14 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                {item.label}
                                            </div>
                                        )}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Drag Handle */}
            <div
                className={cn(
                    "absolute top-1/2 -right-3 transform -translate-y-1/2",
                    "w-6 h-24 flex items-center justify-center",
                    "cursor-ew-resize opacity-0 hover:opacity-100",
                    "transition-opacity duration-200"
                )}
                onMouseDown={handleMouseDown}
            >
                <div className="w-1 h-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>

            {/* User Profile Section - Fixed at Bottom */}
            <div className={cn(
                "border-t border-gray-200 dark:border-gray-800",
                "p-4 mt-auto",
                isCollapsed ? "flex justify-center" : ""
            )}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={cn(
                            "flex items-center gap-3 w-full p-2 rounded-lg",
                            "hover:bg-gray-100 dark:hover:bg-gray-800",
                            "transition-colors duration-200",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        )}>
                            <div className="relative">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={userData.user.avatar || "https://via.placeholder.com/40"} alt="User Avatar" />
                                    <AvatarFallback>{userData.user.email.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {userData.preferences?.status === 'active' && (
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                                )}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium truncate">{userData.user.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userData.user.email}</p>
                                </div>
                            )}
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-64"
                    >
                        <div className="px-2 py-2 border-b">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={userData.user.avatar || "https://via.placeholder.com/40"} alt="User Avatar" />
                                    <AvatarFallback>{userData.user.email.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{userData.user.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userData.user.email}</p>
                                </div>
                            </div>
                        </div>
                        <Link href="/console/settings">
                            <DropdownMenuItem className="flex items-center gap-2">
                                <User size={18} /> Profile
                            </DropdownMenuItem>
                        </Link>
                        <Link href="/console/settings">
                            <DropdownMenuItem className="flex items-center gap-2">
                                <Bell size={18} /> Notifications
                            </DropdownMenuItem>
                        </Link>
                        <Link href="/console/settings">
                            <DropdownMenuItem className="flex items-center gap-2">
                                <Settings size={18} /> Settings
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                            className="flex items-center gap-2 text-red-600 focus:text-red-600"
                            onClick={handleLogOut}
                        >
                            <LogOut size={18} /> Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    );
}
