import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";

interface LoginFormData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoggingIn } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    const onSubmit = (data: LoginFormData) => {
        login(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">DS</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to DataSov
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Access your data ownership platform
                    </p>
                </div>

                <form
                    className="mt-8 space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="label">
                                Email address
                            </label>
                            <input
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address",
                                    },
                                })}
                                type="email"
                                autoComplete="email"
                                className={`input ${
                                    errors.email ? "input-error" : ""
                                }`}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-error-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="label">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message:
                                                "Password must be at least 6 characters",
                                        },
                                    })}
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    className={`input pr-10 ${
                                        errors.password ? "input-error" : ""
                                    }`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-error-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="remember-me"
                                className="ml-2 block text-sm text-gray-900"
                            >
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a
                                href="#"
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoggingIn ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <span className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Sign up
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
