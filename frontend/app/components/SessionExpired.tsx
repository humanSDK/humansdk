"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const SessionExpired = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="p-6 bg-white rounded-lg shadow-xl w-full max-w-sm mx-auto" >
                <DialogTitle className="text-xl font-semibold text-center">Session Expired</DialogTitle>
                <DialogDescription className="mt-4 text-center text-sm">
                    Your session has expired. Please log in again to continue.
                </DialogDescription>
                <DialogFooter className="mt-6 flex justify-center">
                    <Button
                        onClick={() => {
                            onClose();
                            // Add redirection to login page
                            localStorage.removeItem('ct_token')
                            localStorage.removeItem('rt_token')
                            window.location.href = "/login"; // This can be replaced with a Next.js router if preferred
                        }}
                        className="w-full"
                    >
                        Log in
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SessionExpired