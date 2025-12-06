import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaIdCard, FaEnvelope, FaLock, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { useUserAuth } from '../../context';

interface RegisterFormData {
    name: string;
    studentId: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export const UserRegister = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated, isLoading: authLoading } = useUserAuth();
    const [formData, setFormData] = useState<RegisterFormData>({
        name: '',
        studentId: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Redirect to home if already logged in
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const validateForm = (): string | null => {
        if (!formData.name.trim()) {
            return 'Name is required';
        }
        if (!formData.studentId.trim()) {
            return 'Student ID is required';
        }
        if (!formData.email.trim()) {
            return 'Email is required';
        }
        // Check for @cpu.edu.ph domain
        if (!formData.email.endsWith('@cpu.edu.ph')) {
            return 'Only @cpu.edu.ph email addresses are allowed';
        }
        if (formData.password.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        if (formData.password !== formData.confirmPassword) {
            return 'Passwords do not match';
        }
        return null;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            await register({
                name: formData.name,
                studentId: formData.studentId,
                email: formData.email,
                password: formData.password,
            });

            setIsSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/user/login');
            }, 2000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || 'Registration failed. Please try again.');
            } else if (typeof err === 'object' && err !== null && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string | string[] } } };
                const responseMessage = axiosError.response?.data?.message;

                if (Array.isArray(responseMessage)) {
                    setError(responseMessage.join(', '));
                } else if (typeof responseMessage === 'string') {
                    setError(responseMessage);
                } else {
                    setError('Registration failed. Please try again.');
                }
            } else {
                setError('Registration failed. Please try again.');
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

    // Success state
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-psse-primary to-psse-dark">
                <div className="w-full max-w-md px-6">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                        <div className="mb-6">
                            <FaCheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
                        <p className="text-gray-600 mb-4">Your account has been created successfully.</p>
                        <p className="text-sm text-gray-500">Redirecting to login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-psse-primary to-psse-dark py-12">
            <div className="w-full max-w-md px-6">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-psse-primary">Member Registration</h1>
                        <p className="text-gray-600 mt-2">Create your PSSE member account</p>
                    </div>

                    {/* Info Banner */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-700 text-sm">
                            <strong>Note:</strong> Only @cpu.edu.ph email addresses are accepted for registration.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent transition-all duration-200 outline-none"
                                    placeholder="Juan Dela Cruz"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Student ID Field */}
                        <div>
                            <label
                                htmlFor="studentId"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Student ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaIdCard className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="studentId"
                                    name="studentId"
                                    type="text"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    required
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent transition-all duration-200 outline-none"
                                    placeholder="2021-00001"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                School Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent transition-all duration-200 outline-none"
                                    placeholder="yourname@cpu.edu.ph"
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Must be a valid @cpu.edu.ph email</p>
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
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent transition-all duration-200 outline-none"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
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
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Already have an account?{' '}
                            <Link
                                to="/user/login"
                                className="text-psse-accent hover:text-blue-600 font-medium transition-colors"
                            >
                                Sign in here
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
