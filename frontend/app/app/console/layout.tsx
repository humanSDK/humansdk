// app/console/layout.tsx
"use client"
import React from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import SessionManager from "@/components/SessionManager";
import { UserProvider } from '@/components/context/UserContext';
import { NotificationProvider } from "@/components/context/NotificationContext";
import { ProjectMemberProvider } from '@/components/context/ProjectMemberContext'; // Add this import

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionManager>
            <UserProvider>
                <NotificationProvider>
                    <ProjectMemberProvider> {/* Add this wrapper */}
                        <div className="flex overflow-x-hidden h-screen ">
                            <Sidebar />
                            {/* Main Content */}
                            <main className="flex-1 overflow-y-scroll">{children}</main>
                        </div>
                    </ProjectMemberProvider>
                </NotificationProvider>
            </UserProvider>
        </SessionManager>
    );
}