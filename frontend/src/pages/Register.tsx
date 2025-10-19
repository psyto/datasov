import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
}

const Register: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register: registerUser, isRegistering } = useAuth();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>();

    const password = watch("password");

    const onSubmit = (data: RegisterFormData) => {
        const { confirmPassword, agreeToTerms, ...userData } = data;
        registerUser(userData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">DS</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your DataSov account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Start your data ownership journey
                    </p>
                </div>

                <form
                    className="mt-8 space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="label">
                                Full name
                            </label>
                            <input
                                {...register("name", {
                                    required: "Name is required",
                                    minLength: {
                                        value: 2,
                                        message:
                                            "Name must be at least 2 characters",
                                    },
                                })}
                                type="text"
                                autoComplete="name"
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
                                            value: 8,
                                            message:
                                                "Password must be at least 8 characters",
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                            message:
                                                "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                                        },
                                    })}
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    className={`input pr-10 ${
                                        errors.password ? "input-error" : ""
                                    }`}
                                    placeholder="Create a strong password"
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

                        <div>
                            <label htmlFor="confirmPassword" className="label">
                                Confirm password
                            </label>
                            <div className="relative">
                                <input
                                    {...register("confirmPassword", {
                                        required:
                                            "Please confirm your password",
                                        validate: (value) =>
                                            value === password ||
                                            "Passwords do not match",
                                    })}
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="new-password"
                                    className={`input pr-10 ${
                                        errors.confirmPassword
                                            ? "input-error"
                                            : ""
                                    }`}
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-error-600">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            {...register("agreeToTerms", {
                                required:
                                    "You must agree to the terms and conditions",
                            })}
                            id="agreeToTerms"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label
                            htmlFor="agreeToTerms"
                            className="ml-2 block text-sm text-gray-900"
                        >
                            I agree to the{" "}
                            <a
                                href="#"
                                className="text-primary-600 hover:text-primary-500"
                            >
                                Terms and Conditions
                            </a>{" "}
                            and{" "}
                            <a
                                href="#"
                                className="text-primary-600 hover:text-primary-500"
                            >
                                Privacy Policy
                            </a>
                        </label>
                    </div>
                    {errors.agreeToTerms && (
                        <p className="text-sm text-error-600">
                            {errors.agreeToTerms.message}
                        </p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isRegistering}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRegistering ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                "Create account"
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <span className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Sign in
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
