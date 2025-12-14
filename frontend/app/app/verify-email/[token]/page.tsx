"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CustomLogo } from '@/components/Logo';
import { USER_SERVICE_API } from '../../../constant'; // Make sure to import the correct path

const EmailVerificationPage = ({ params }: { params: { token: string } }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean | null>(null);

    const verifyEmail = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${USER_SERVICE_API}/auth/verify-email/${params.token}`);
            if (response.status === 200) {
                setSuccess(true);
                if (response.data && response.data.error == false) {
                    setTimeout(() => {
                        window.location.href = response.data.redirectUrl + `?rt=${params.token}`
                    }, 1000);
                }
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifyEmail();
    }, [params.token]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-6 space-y-4 bg-white rounded-lg shadow-md">
                <div className='flex justify-center items-center'>
                    <CustomLogo className="w-20 h-20" />
                </div>
                <h2 className="text-xl font-semibold text-center text-gray-700">Email Verification</h2>

                {loading && (
                    <div className="flex justify-center">
                        <div className="loader">
                            <p>We are verifying your email...</p>
                        </div>
                    </div>
                )}

                {success && !loading && (
                    <div className="bg-green-100 text-green-800 p-4 rounded-md border border-green-300">
                        <p className="text-center">
                            Your email has been successfully verified! Redirecting...
                        </p>
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-100 text-red-800 p-4 rounded-md border border-red-300">
                        <p className="text-center">{error}</p>
                    </div>
                )}

                {!loading && !success && !error && (
                    <button
                        className="w-full py-2 px-4 mt-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                        onClick={() => verifyEmail()}
                    >
                        Retry Verification
                    </button>
                )}
            </div>
        </div>
    );

};

export default EmailVerificationPage;
