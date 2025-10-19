import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { AuthState, User } from "@/types";
import apiService from "@/services/api";
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
        const token = apiService.getAuthToken();
        if (token) {
            setAuthState((prev) => ({
                ...prev,
                token,
                isAuthenticated: true,
                loading: false,
            }));
        } else {
            setAuthState((prev) => ({
                ...prev,
                loading: false,
            }));
        }
    }, []);

    // Login mutation
    const loginMutation = useMutation(
        async ({ email, password }: { email: string; password: string }) => {
            // Mock login - replace with actual API call
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const data = await response.json();
            return data;
        },
        {
            onSuccess: (data) => {
                const { token, user } = data;
                apiService.setAuthToken(token);
                setAuthState({
                    isAuthenticated: true,
                    user,
                    token,
                    loading: false,
                });
                toast.success("Login successful");
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
            // Mock register - replace with actual API call
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, name }),
            });

            if (!response.ok) {
                throw new Error("Registration failed");
            }

            const data = await response.json();
            return data;
        },
        {
            onSuccess: (data) => {
                const { token, user } = data;
                apiService.setAuthToken(token);
                setAuthState({
                    isAuthenticated: true,
                    user,
                    token,
                    loading: false,
                });
                toast.success("Registration successful");
            },
            onError: (error: any) => {
                toast.error(error.message || "Registration failed");
            },
        }
    );

    // Logout function
    const logout = useCallback(() => {
        apiService.removeAuthToken();
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
            const response = await fetch("/api/user/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authState.token}`,
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error("Profile update failed");
            }

            return response.json();
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
