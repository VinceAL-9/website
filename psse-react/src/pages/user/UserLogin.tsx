import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa';
import { useUserAuth } from '../../context';
import { authApi } from '../../services/api';

export const UserLogin = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, isLoading: authLoading } = useUserAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);

    // Redirect to home if already logged in
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    const handleResendVerification = async () => {
        if (!email) {
            setError('Please enter your email address first');
            return;
        }

        setIsResending(true);
        setResendSuccess(false);
        setError(null);

        try {
            await authApi.resendVerification(email);
            setResendSuccess(true);
            setNeedsVerification(false);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to resend verification email');
            }
        } finally {
            setIsResending(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setResendSuccess(false);
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err: unknown) {
            let errorMsg = 'Invalid credentials. Please try again.';
            
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string | string[] } } };
                const message = axiosError.response?.data?.message;
                if (message) {
                    errorMsg = Array.isArray(message) ? message.join(', ') : message;
                }
            } else if (err instanceof Error) {
                if (!err.message.includes('Request failed with status code')) {
                    errorMsg = err.message;
                }
            }

            setError(errorMsg);
            
            // Check if error is about email verification
            if (errorMsg.toLowerCase().includes('verify')) {
                setNeedsVerification(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-psse-primary to-psse-dark">
                <FaSpinner className="animate-spin h-8 w-8 text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-psse-primary to-psse-dark">
            <div className="w-full max-w-md px-6">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-psse-primary">Member Login</h1>
                        <p className="text-gray-600 mt-2">Sign in to access exclusive features</p>
                    </div>

                    {/* Success Message */}
                    {resendSuccess && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-600 text-sm font-medium">Verification email sent!</p>
                            <p className="text-green-500 text-xs mt-1">
                                Please check your inbox (and spam folder) for the verification link.
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm font-medium mb-1">{error}</p>
                            {needsVerification && (
                                <div className="mt-3">
                                    <p className="text-red-500 text-xs mb-2">
                                        Please check your email inbox (and spam folder) for the verification link.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleResendVerification}
                                        disabled={isResending}
                                        className="text-psse-accent hover:text-blue-600 text-sm font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isResending ? 'Sending...' : 'Resend Verification Email'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent transition-all duration-200 outline-none"
                                    placeholder="you@cpu.edu.ph"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent transition-all duration-200 outline-none"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-psse-accent hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-psse-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <FaSpinner className="animate-spin h-5 w-5" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Don't have an account?{' '}
                            <Link
                                to="/user/register"
                                className="text-psse-accent hover:text-blue-600 font-medium transition-colors"
                            >
                                Register here
                            </Link>
                        </p>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-4 text-center">
                        <Link
                            to="/"
                            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
