import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../services/api';

// User type based on API response
interface User {
    id: string;
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

// eslint-disable-next-line react-refresh/only-export-components
export const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

interface UserAuthProviderProps {
    children: ReactNode;
}

export const UserAuthProvider = ({ children }: UserAuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isInitialized = useRef(false);

    // Restore session on mount
    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        const restoreSession = async () => {
            const token = localStorage.getItem(USER_TOKEN_KEY);
            if (token) {
                try {
                    // Fetch user profile to validate token and get user data
                    const userProfile = await authApi.getProfile(token);
                    setUser(userProfile);
                    setIsLoading(false);
                    return;
                } catch (error) {
                    console.error('Failed to restore user session:', error);
                    localStorage.removeItem(USER_TOKEN_KEY);
                }
            }

            try {
                const refreshed = await authApi.refresh();
                localStorage.setItem(USER_TOKEN_KEY, refreshed.access_token);
                const userProfile = await authApi.getProfile(refreshed.access_token);
                setUser(userProfile);
            } catch {
                localStorage.removeItem(USER_TOKEN_KEY);
            } finally {
                setIsLoading(false);
            }
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
        authApi.logout().catch((error) => {
            console.error('Failed to logout:', error);
        });
        localStorage.removeItem(USER_TOKEN_KEY);
        setUser(null);
    }, []);

    const register = useCallback(async (data: RegisterData) => {
        await authApi.register(data);
        // Do not automatically login here because the user must verify their email first.
        // The UserRegister component will handle showing the success screen.
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

// eslint-disable-next-line react-refresh/only-export-components
export const useUserAuth = (): UserAuthContextType => {
    const context = useContext(UserAuthContext);
    if (context === undefined) {
        throw new Error('useUserAuth must be used within a UserAuthProvider');
    }
    return context;
};
