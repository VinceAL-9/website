import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../services/api';

// User type based on API response
interface User {
    id: number;
    email: string;
    name: string | null;
    role: 'MEMBER' | 'ADMIN';
    studentId: string | null;
}

interface UserAuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
    name: string;
    studentId: string;
    email: string;
    password: string;
}

const USER_TOKEN_KEY = 'user_access_token';

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

interface UserAuthProviderProps {
    children: ReactNode;
}

export const UserAuthProvider = ({ children }: UserAuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem(USER_TOKEN_KEY);
            if (token) {
                try {
                    // Fetch user profile to validate token and get user data
                    const userProfile = await authApi.getProfile(token);
                    setUser(userProfile);
                } catch (error) {
                    // Token is invalid, clear it
                    console.error('Failed to restore user session:', error);
                    localStorage.removeItem(USER_TOKEN_KEY);
                }
            }
            setIsLoading(false);
        };

        restoreSession();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        localStorage.setItem(USER_TOKEN_KEY, response.access_token);

        // Fetch user profile after login
        const userProfile = await authApi.getProfile(response.access_token);
        setUser(userProfile);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(USER_TOKEN_KEY);
        setUser(null);
    }, []);

    const register = useCallback(async (data: RegisterData) => {
        await authApi.register(data);
        // After registration, user needs to login separately
    }, []);

    const value: UserAuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
    };

    return (
        <UserAuthContext.Provider value={value}>
            {children}
        </UserAuthContext.Provider>
    );
};

export const useUserAuth = (): UserAuthContextType => {
    const context = useContext(UserAuthContext);
    if (context === undefined) {
        throw new Error('useUserAuth must be used within a UserAuthProvider');
    }
    return context;
};
