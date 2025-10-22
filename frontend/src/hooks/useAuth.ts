import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { AuthState, User } from "../types";
import apiService from "../services/api";
import toast from "react-hot-toast";

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: true,
    });

    const queryClient = useQueryClient();

    // Check if user is authenticated on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const token = apiService.getAuthToken();
            if (token) {
                try {
                    const user = await apiService.getCurrentUser();
                    setAuthState({
                        isAuthenticated: true,
                        user,
                        token,
                        loading: false,
                    });
                } catch (error) {
                    // Token is invalid, remove it
                    apiService.removeAuthToken();
                    setAuthState({
                        isAuthenticated: false,
                        user: null,
                        token: null,
                        loading: false,
                    });
                }
            } else {
                setAuthState((prev) => ({
                    ...prev,
                    loading: false,
                }));
            }
        };

        initializeAuth();
    }, []);

    // Login mutation
    const loginMutation = useMutation(
        async ({ email, password }: { email: string; password: string }) => {
            return await apiService.login(email, password);
        },
        {
            onSuccess: (data) => {
                const { token, user } = data;
                setAuthState({
                    isAuthenticated: true,
                    user,
                    token,
                    loading: false,
                });
                toast.success("Login successful");
                queryClient.invalidateQueries();
            },
            onError: (error: any) => {
                toast.error(error.message || "Login failed");
                setAuthState((prev) => ({
                    ...prev,
                    loading: false,
                }));
            },
        }
    );

    // Register mutation
    const registerMutation = useMutation(
        async ({
            email,
            password,
            name,
        }: {
            email: string;
            password: string;
            name: string;
        }) => {
            return await apiService.register({ email, password, name });
        },
        {
            onSuccess: (data) => {
                const { token, user } = data;
                setAuthState({
                    isAuthenticated: true,
                    user,
                    token,
                    loading: false,
                });
                toast.success("Registration successful");
                queryClient.invalidateQueries();
            },
            onError: (error: any) => {
                toast.error(error.message || "Registration failed");
            },
        }
    );

    // Logout function
    const logout = useCallback(async () => {
        try {
            await apiService.logout();
        } catch (error) {
            // Ignore logout errors
        }

        setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
        });
        queryClient.clear();
        toast.success("Logged out successfully");
    }, [queryClient]);

    // Update user profile
    const updateProfileMutation = useMutation(
        async (updates: Partial<User>) => {
            // For now, just update the local state
            // In a real app, this would make an API call
            const updatedUser = { ...authState.user, ...updates } as User;
            return { user: updatedUser };
        },
        {
            onSuccess: (data) => {
                setAuthState((prev) => ({
                    ...prev,
                    user: data.user,
                }));
                toast.success("Profile updated successfully");
            },
            onError: (error: any) => {
                toast.error(error.message || "Profile update failed");
            },
        }
    );

    return {
        ...authState,
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        logout,
        updateProfile: updateProfileMutation.mutate,
        isLoggingIn: loginMutation.isLoading,
        isRegistering: registerMutation.isLoading,
        isUpdatingProfile: updateProfileMutation.isLoading,
    };
};
