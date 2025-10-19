import React from "react";
import { TrendingUpIcon, TrendingDownIcon } from "@heroicons/react/24/outline";

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeType?: "increase" | "decrease";
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    description,
}) => {
    return (
        <div className="card">
            <div className="card-body">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary-600" />
                        </div>
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 truncate">
                            {title}
                        </p>
                        <div className="flex items-baseline">
                            <p className="text-2xl font-semibold text-gray-900">
                                {value}
                            </p>
                            {change !== undefined && (
                                <div
                                    className={`ml-2 flex items-baseline text-sm font-medium ${
                                        changeType === "increase"
                                            ? "text-success-600"
                                            : "text-error-600"
                                    }`}
                                >
                                    {changeType === "increase" ? (
                                        <TrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                                    ) : (
                                        <TrendingDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                                    )}
                                    <span className="sr-only">
                                        {changeType === "increase"
                                            ? "Increased"
                                            : "Decreased"}{" "}
                                        by
                                    </span>
                                    {Math.abs(change)}%
                                </div>
                            )}
                        </div>
                        {description && (
                            <p className="text-sm text-gray-500 mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
