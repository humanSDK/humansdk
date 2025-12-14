"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CustomLogo } from "@/components/Logo";
import { USER_SERVICE_API } from "../../constant";
import analytics from '@/components/image/analaytics.png'
const Login = () => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError("Email is required");
            return false;
        }
        if (!email.includes('@')) {
            setEmailError("Email must contain @");
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address");
            return false;
        }
        setEmailError("");
        return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'email') {
            validateEmail(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(formData.email)) {
            return;
        }

        if (!formData.password.trim()) {
            return toast({
                variant: "destructive",
                title: "Missing Field",
                description: "Password is required.",
            });
        }

        setLoading(true);

        try {
            const response = await axios.post(`${USER_SERVICE_API}/auth/login`, formData);

            if (response.status === 200 && !response.data.error) {
                localStorage.setItem("ct_token", response.data.token)
                localStorage.setItem("rt_token", response.data.refreshToken)
                toast({
                    title: "Login Successful",
                    description: "Redirecting to your dashboard...",
                });
                window.location.href = "/console";
            } else {
                toast({
                    title: "Login Failed",
                    description: response.data?.message || "Invalid credentials.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Failed to Login",
                description: error.response?.data?.message || "Unable to log in.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(resetEmail)) {
            return toast({
                variant: "destructive",
                title: "Invalid Email",
                description: "Please enter a valid email address.",
            });
        }

        setLoading(true);

        try {
            await axios.post(`${USER_SERVICE_API}/auth/forgot-password`, {
                email: resetEmail
            });

            toast({
                title: "Reset Link Sent",
                description: "If an account exists with this email, you will receive a password reset link.",
            });
            setIsForgotPassword(false);
            setResetEmail("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to send reset link.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const checkTokenValidity = async () => {
        const token = localStorage.getItem("ct_token");
        if (token) {
            try {
                const response = await axios.get(`${USER_SERVICE_API}/auth/check-token-validity`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.status === 200) {
                    window.location.href = "/console"
                }
            } catch (error) {
                console.error("Token expired. User needs to login again:", error);
            }
        }
    };

    useEffect(() => {
        checkTokenValidity();
    }, []);

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="flex items-center justify-center p-6 md:p-8 lg:p-12 bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[400px] space-y-8"
                >
                    <div className="text-center space-y-6">
                        <CustomLogo className="w-20 h-20 mx-auto" />
                        <div className="space-y-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {isForgotPassword ? "Reset Your Password" : "Log in to CosTheta"}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {isForgotPassword
                                    ? "Enter your email to receive a reset link"
                                    : "Welcome back! Please enter your details"}
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                {isForgotPassword ? "Password Reset" : "Enter your credentials"}
                            </span>
                        </div>
                    </div>

                    {!isForgotPassword ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email address
                                </Label>
                                <Input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    className={`h-11 bg-muted/50 ${emailError ? 'border-red-500' : ''}`}
                                    required
                                />
                                {emailError && (
                                    <p className="text-sm text-red-500 mt-1">{emailError}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </Label>
                                <Input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="h-11 bg-muted/50"
                                    required
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="px-0 text-sm font-medium text-primary"
                                    onClick={() => setIsForgotPassword(true)}
                                >
                                    Forgot password?
                                </Button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-base"
                                disabled={loading}
                            >
                                {loading ? "Logging In..." : "Log In"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="resetEmail" className="text-sm font-medium">
                                    Email address
                                </Label>
                                <Input
                                    type="email"
                                    id="resetEmail"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="h-11 bg-muted/50"
                                    required
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base"
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-11 text-base"
                                    onClick={() => setIsForgotPassword(false)}
                                >
                                    Back to Login
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/signup"
                                className="font-medium text-primary hover:underline"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Right Column - Project Preview */}
            <div className="hidden lg:block relative bg-muted/10 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 bg-dot-pattern bg-muted/[0.15]"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/50 to-background/20" />

                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative h-full flex items-center justify-center p-8 md:p-12"
                >
                    <div className="w-full max-w-4xl mx-auto relative rounded-lg overflow-hidden shadow-2xl" style={{ height: '70vh' }}>
                        <Image
                            src={analytics}
                            alt="CosTheta Project Management Interface"
                            fill
                            className="object-contain"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="absolute bottom-5 inset-x-0 p-12 text-center"
                >
                    <h3 className="text-2xl font-semibold mb-4">
                        Analyze your project effectively & easily
                    </h3>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Track tasks, manage sprints, and monitor team progress with our intuitive sprint board interface
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;