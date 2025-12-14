// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast";
// import { CustomLogo } from "@/components/Logo";
// import { USER_SERVICE_API } from "../../constant";

// const Signup = () => {
//     const { toast } = useToast();
//     const [formData, setFormData] = useState({ email: "" });
//     const [loading, setLoading] = useState(false);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!formData.email.trim()) {
//             toast({
//                 title: "Email Required!",
//                 description: "Please enter your mail to create an account.",
//                 variant: "destructive",
//             });
//             return;
//         }

//         try {
//             setLoading(true);
//             const response = await axios.post(`${USER_SERVICE_API}/auth/signup`, formData);

//             if (response.status === 200 && !response.data.error) {
//                 toast({
//                     title: "Confirmation Email Sent",
//                     description: "Please check your email to verify your account.",
//                 });
//             } else {
//                 toast({
//                     title: response.data?.message,
//                     description: "Failed to create an account.",
//                     variant: "destructive",
//                 });
//             }
//         } catch (error: any) {
//             toast({
//                 title: error.response?.data?.message,
//                 description: "Unable to sign up to cos-theta",
//                 variant: "destructive",

//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const checkTokenValidity = async () => {
//         const token = localStorage.getItem("ct_token");
//         if (token) {
//             try {
//                 const response = await axios.get(`${USER_SERVICE_API}/auth/check-token-validity`, {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 });
//                 if (response.status === 200) {
//                     window.location.href = "/console"
//                 }
//             } catch (error) {
//                 console.error("Token expired. User needs to login again:", error);
//             }
//         }
//     };

//     useEffect(() => {
//         checkTokenValidity();
//     }, [])

//     return (
//         <div className="min-h-screen bg-gray-50 flex justify-center items-center">
//             <Card className="w-full max-w-md">
//                 <CardHeader>
//                     <div className="flex justify-center items-center">
//                         <CustomLogo className="w-16 h-16" />
//                     </div>
//                     <h2 className="text-xl font-semibold text-center">Sign Up</h2>
//                 </CardHeader>
//                 <CardContent>
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div>
//                             <Label htmlFor="email">Email</Label>
//                             <Input
//                                 type="email"
//                                 id="email"
//                                 name="email"
//                                 value={formData.email}
//                                 onChange={handleChange}
//                             />
//                         </div>

//                         <Button type="submit" className="w-full" disabled={loading}>
//                             {loading ? "Signing Up..." : "Sign Up"}
//                         </Button>
//                     </form>
//                 </CardContent>
//                 <CardFooter>
//                     <p className="text-sm text-center">
//                         Already have an account? <a href="/login" className="underline">Log in</a>
//                     </p>
//                 </CardFooter>
//             </Card>
//         </div>
//     );
// };

// export default Signup;
"use client"
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CustomLogo } from "@/components/Logo";
import { USER_SERVICE_API } from "../../constant";
import Image from "next/image";
import Link from "next/link";
import workflow from '@/components/image/hero11.png'
const Signup = () => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({ email: "" });
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");

    const validateEmail = (email: string) => {
        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email.trim()) {
            return "Email is required";
        }
        
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address";
        }
        
        if (email.length > 254) {
            return "Email is too long";
        }
        
        const [localPart] = email.split('@');
        if (localPart.length > 64) {
            return "Email username is too long";
        }
        
        return "";
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        
        // Clear email error when user starts typing
        if (name === 'email') {
            setEmailError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate email before submission
        const error = validateEmail(formData.email);
        if (error) {
            setEmailError(error);
            toast({
                title: "Validation Error",
                description: error,
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${USER_SERVICE_API}/auth/signup`, formData);

            if (response.status === 200 && !response.data.error) {
                toast({
                    title: "Confirmation Email Sent",
                    description: "Please check your email to verify your account.",
                });
            } else {
                toast({
                    title: response.data?.message,
                    description: "Failed to create an account.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: error.response?.data?.message,
                description: "Unable to sign up to cos-theta",
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
            {/* Left Column - Form */}
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
                                Sign up to CosTheta
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Start managing your projects efficiently
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Enter your email to get started
                            </span>
                        </div>
                    </div>

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

                        <Button 
                            type="submit" 
                            className="w-full h-11 text-base"
                            disabled={loading}
                        >
                            {loading ? "Signing Up..." : "Sign Up"}
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-primary hover:underline"
                            >
                                Log in
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
                            src={workflow}
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
                        Streamline Your Workflow
                    </h3>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Join us in revolutionizing project management with our intuitive and powerful platform
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;