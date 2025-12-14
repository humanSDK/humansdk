"use client";
import React, { useState, useEffect } from "react";
import { setSessionExpiredCallback } from "@/utils/sessionManager";
import SessionExpired from "@/components/SessionExpired";

interface SessionManagerProps {
    children: React.ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
    const [isSessionExpired, setIsSessionExpired] = useState(false);

    useEffect(() => {
        setSessionExpiredCallback(() => {
            console.log("Session expired callback triggered");
            setIsSessionExpired(true);
        });
    }, []);

    const handleClose = () => {
        setIsSessionExpired(false);
        localStorage.removeItem('ct_token')
        localStorage.removeItem('rt_token')
        window.location.href = "/login";
    };

    return (
        <>
            {children}
            <SessionExpired isOpen={isSessionExpired} onClose={handleClose} />
        </>
    );
};

export default SessionManager;

