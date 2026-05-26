import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { Button } from '../../components/common';
import { axiosInstance } from '../../lib';

type VerificationState = 'loading' | 'success' | 'error';

export const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [state, setState] = useState<VerificationState>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        let isMounted = true;
        let hasVerified = false; // Track if verification already attempted

        const verifyEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                if (isMounted) {
                    setState('error');
                    setMessage('Invalid verification link. No token provided.');
                }
                return;
            }

            if (isMounted) {
                setState('loading');
            }

            // Prevent duplicate calls
            if (hasVerified) {
                return;
            }
            hasVerified = true;

            try {
                const response = await axiosInstance.get(`/auth/verify?token=${token}`);
                if (isMounted) {
                    setState('success');
                    setMessage(response.data.message || 'Email verified successfully!');
                }
            } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                if (isMounted) {
                    // Check if the error message indicates the email was already verified
                    const errorMsg = error.response?.data?.message || '';
                    
                    // If the token is invalid but might have been used already, show success
                    if (errorMsg.toLowerCase().includes('already verified') || 
                        errorMsg.toLowerCase().includes('verified successfully')) {
                        setState('success');
                        setMessage('Your email has been verified successfully! You can now log in.');
                    } else {
                        setState('error');
                        setMessage(errorMsg || 'Verification failed. The token may be invalid or expired.');
                    }
                }
            }
        };

        verifyEmail();

        return () => {
            isMounted = false;
        };
    }, [searchParams]);

    const handleNavigation = () => {
        if (state === 'success') {
            navigate('/user/login');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-psse-primary to-psse-dark">
            <div className="w-full max-w-md px-6">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Loading State */}
                    {state === 'loading' && (
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <FaSpinner className="animate-spin h-16 w-16 text-psse-accent" />
                            </div>
                            <h1 className="text-2xl font-bold text-psse-primary mb-2">
                                Verifying Your Email
                            </h1>
                            <p className="text-gray-600">
                                Please wait while we verify your email address...
                            </p>
                        </div>
                    )}

                    {/* Success State */}
                    {state === 'success' && (
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <FaCheckCircle className="h-16 w-16 text-green-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-psse-primary mb-2">
                                Email Verified!
                            </h1>
                            <p className="text-gray-600 mb-6">
                                {message}
                            </p>
                            <p className="text-gray-600 mb-8">
                                You can now log in to your account and access all member features.
                            </p>
                            <Button
                                onClick={handleNavigation}
                                variant="primary"
                                size="lg"
                                fullWidth
                            >
                                Go to Login
                            </Button>
                        </div>
                    )}

                    {/* Error State */}
                    {state === 'error' && (
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <FaTimesCircle className="h-16 w-16 text-red-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-red-600 mb-2">
                                Verification Failed
                            </h1>
                            <p className="text-gray-600 mb-8">
                                {message}
                            </p>
                            <Button
                                onClick={handleNavigation}
                                variant="primary"
                                size="lg"
                                fullWidth
                            >
                                Go to Home
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
