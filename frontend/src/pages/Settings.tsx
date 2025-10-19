import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

interface SettingsFormData {
    name: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    notifications: {
        email: boolean;
        sales: boolean;
        updates: boolean;
    };
    privacy: {
        profileVisibility: "public" | "private";
        dataSharing: boolean;
    };
}

const Settings: React.FC = () => {
    const { user, updateProfile, isUpdatingProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<
        "profile" | "security" | "notifications" | "privacy"
    >("profile");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm<SettingsFormData>({
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            notifications: {
                email: true,
                sales: true,
                updates: false,
            },
            privacy: {
                profileVisibility: "public",
                dataSharing: true,
            },
        },
    });

    const newPassword = watch("newPassword");

    const onSubmit = (data: SettingsFormData) => {
        const {
            currentPassword,
            newPassword,
            confirmPassword,
            ...profileData
        } = data;

        if (newPassword && newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        updateProfile(profileData);
    };

    const tabs = [
        {
            id: "profile",
            name: "Profile",
            description: "Update your personal information",
        },
        {
            id: "security",
            name: "Security",
            description: "Manage your password and security",
        },
        {
            id: "notifications",
            name: "Notifications",
            description: "Configure notification preferences",
        },
        {
            id: "privacy",
            name: "Privacy",
            description: "Control your privacy settings",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Navigation */}
                <div className="lg:col-span-1">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? "bg-primary-100 text-primary-900"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                            >
                                <div className="font-medium">{tab.name}</div>
                                <div className="text-xs text-gray-500">
                                    {tab.description}
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* Profile Tab */}
                        {activeTab === "profile" && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Profile Information
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Update your personal details and contact
                                        information
                                    </p>
                                </div>
                                <div className="card-body space-y-4">
                                    <div>
                                        <label htmlFor="name" className="label">
                                            Full Name
                                        </label>
                                        <input
                                            {...register("name", {
                                                required: "Name is required",
                                            })}
                                            type="text"
                                            className={`input ${
                                                errors.name ? "input-error" : ""
                                            }`}
                                            placeholder="Enter your full name"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-error-600">
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="label"
                                        >
                                            Email Address
                                        </label>
                                        <input
                                            {...register("email", {
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message:
                                                        "Invalid email address",
                                                },
                                            })}
                                            type="email"
                                            className={`input ${
                                                errors.email
                                                    ? "input-error"
                                                    : ""
                                            }`}
                                            placeholder="Enter your email"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-error-600">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === "security" && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Security Settings
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Update your password and security
                                        preferences
                                    </p>
                                </div>
                                <div className="card-body space-y-4">
                                    <div>
                                        <label
                                            htmlFor="currentPassword"
                                            className="label"
                                        >
                                            Current Password
                                        </label>
                                        <input
                                            {...register("currentPassword")}
                                            type="password"
                                            className="input"
                                            placeholder="Enter your current password"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="newPassword"
                                            className="label"
                                        >
                                            New Password
                                        </label>
                                        <input
                                            {...register("newPassword", {
                                                minLength: {
                                                    value: 8,
                                                    message:
                                                        "Password must be at least 8 characters",
                                                },
                                            })}
                                            type="password"
                                            className={`input ${
                                                errors.newPassword
                                                    ? "input-error"
                                                    : ""
                                            }`}
                                            placeholder="Enter your new password"
                                        />
                                        {errors.newPassword && (
                                            <p className="mt-1 text-sm text-error-600">
                                                {errors.newPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className="label"
                                        >
                                            Confirm New Password
                                        </label>
                                        <input
                                            {...register("confirmPassword", {
                                                validate: (value) =>
                                                    value === newPassword ||
                                                    "Passwords do not match",
                                            })}
                                            type="password"
                                            className={`input ${
                                                errors.confirmPassword
                                                    ? "input-error"
                                                    : ""
                                            }`}
                                            placeholder="Confirm your new password"
                                        />
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-error-600">
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === "notifications" && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Notification Preferences
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Choose how you want to be notified about
                                        important events
                                    </p>
                                </div>
                                <div className="card-body space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Email Notifications
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Receive notifications via email
                                            </p>
                                        </div>
                                        <input
                                            {...register("notifications.email")}
                                            type="checkbox"
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Sales Notifications
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Get notified when your data is
                                                purchased
                                            </p>
                                        </div>
                                        <input
                                            {...register("notifications.sales")}
                                            type="checkbox"
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Platform Updates
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Receive updates about new
                                                features and changes
                                            </p>
                                        </div>
                                        <input
                                            {...register(
                                                "notifications.updates"
                                            )}
                                            type="checkbox"
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Privacy Tab */}
                        {activeTab === "privacy" && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Privacy Settings
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Control your privacy and data sharing
                                        preferences
                                    </p>
                                </div>
                                <div className="card-body space-y-4">
                                    <div>
                                        <label
                                            htmlFor="profileVisibility"
                                            className="label"
                                        >
                                            Profile Visibility
                                        </label>
                                        <select
                                            {...register(
                                                "privacy.profileVisibility"
                                            )}
                                            className="input"
                                        >
                                            <option value="public">
                                                Public
                                            </option>
                                            <option value="private">
                                                Private
                                            </option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Data Sharing
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Allow your data to be shared
                                                with research institutions
                                            </p>
                                        </div>
                                        <input
                                            {...register("privacy.dataSharing")}
                                            type="checkbox"
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isUpdatingProfile}
                                className="btn btn-primary"
                            >
                                {isUpdatingProfile ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
