import React from "react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "md",
    className = "",
    text,
}) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    };

    return (
        <div
            className={`flex flex-col items-center justify-center ${className}`}
        >
            <div
                className={`loading-spinner ${sizeClasses[size]} border-primary-600`}
            />
            {text && (
                <p className="mt-2 text-sm text-gray-600 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
