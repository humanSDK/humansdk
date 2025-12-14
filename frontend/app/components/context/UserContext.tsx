"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import axiosInstances from '@/utils/axiosInstance';
// Define types for user data structure
interface UserPreferences {
    description: string;
    localTime: string;
    status: string;
}

interface UserData {
    user: {
        email: string;
        name: string;
        avatar: string;
        usageType: string;
        _id?: string;
    };
    preferences: UserPreferences;
}

// Define the context value type
interface UserContextType {
    userData: UserData;
    updateUserData: (newData: Partial<UserData>) => void;
    fetchUserData: () => Promise<void>;
    updateUserStatus: (newStatus: string) => Promise<void>;
    updateUserProfile: (profileData: Partial<UserData>) => Promise<void>;
    isLoading: boolean;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Initial state for user data
const initialUserData: UserData = {
    user: {
        email: '',
        name: '',
        avatar: '',
        usageType: '',
    },
    preferences: {
        description: '',
        localTime: '',
        status: ''
    }
};

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
    const [userData, setUserData] = useState<UserData>(initialUserData);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // Fetch user data from API
    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('ct_token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axiosInstances.UserService.get(`/users/getUserById`);

            setUserData(response.data.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            setIsLoading(false);
        }
    };

    // Update user data
    const updateUserData = (newData: Partial<UserData>) => {
        setUserData(prev => ({
            ...prev,
            ...newData
        }));
    };

    // Update user status
    const updateUserStatus = async (newStatus: string) => {
        try {
            await axiosInstances.UserService.put(
                `/users/status`,
                { status: newStatus },
            );

            // Update local state
            setUserData(prev => ({
                ...prev,
                preferences: {
                    ...prev.preferences,
                    status: newStatus
                }
            }));

            toast({
                title: "Success",
                description: "Status updated successfully"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update status"
            });
            throw error;
        }
    };

    // Update user profile
    const updateUserProfile = async (profileData: Partial<UserData>) => {
        try {
            await axiosInstances.UserService.put(
                `/users/profile`,
                profileData,
            );

            // Update local state
            setUserData(prev => ({
                ...prev,
                ...profileData
            }));

            toast({
                title: "Success",
                description: "Profile updated successfully"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update profile"
            });
            throw error;
        }
    };

    // Fetch user data on mount
    useEffect(() => {
        fetchUserData();
    }, []);

    // Context value
    const value = {
        userData,
        updateUserData,
        fetchUserData,
        updateUserStatus,
        updateUserProfile,
        isLoading
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

// Custom hook to use the user context
export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

export default UserContext;