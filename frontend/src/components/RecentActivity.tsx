import React from "react";
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface ActivityItem {
    id: string;
    type: "sale" | "listing" | "purchase" | "verification";
    title: string;
    description: string;
    timestamp: number;
    amount?: string;
    status: "completed" | "pending" | "failed";
}

const RecentActivity: React.FC = () => {
    // Mock data - replace with actual API calls
    const activities: ActivityItem[] = [
        {
            id: "1",
            type: "sale",
            title: "Data Sale",
            description: "Location History data sold to DataCorp Inc.",
            timestamp: Date.now() - 3600000, // 1 hour ago
            amount: "0.5 SOL",
            status: "completed",
        },
        {
            id: "2",
            type: "listing",
            title: "New Listing",
            description: "App Usage data listed for 0.3 SOL",
            timestamp: Date.now() - 7200000, // 2 hours ago
            status: "completed",
        },
        {
            id: "3",
            type: "purchase",
            title: "Data Purchase",
            description: "Purchased Health Data from MedTech Solutions",
            timestamp: Date.now() - 86400000, // 1 day ago
            amount: "1.2 SOL",
            status: "completed",
        },
        {
            id: "4",
            type: "verification",
            title: "Identity Verified",
            description: "NTT DOCOMO identity verification completed",
            timestamp: Date.now() - 172800000, // 2 days ago
            status: "completed",
        },
        {
            id: "5",
            type: "listing",
            title: "Listing Failed",
            description:
                "Failed to list Financial Data - insufficient permissions",
            timestamp: Date.now() - 259200000, // 3 days ago
            status: "failed",
        },
    ];

    const getActivityIcon = (type: string, status: string) => {
        if (status === "failed") {
            return <XCircleIcon className="h-5 w-5 text-error-500" />;
        }

        switch (type) {
            case "sale":
                return (
                    <CurrencyDollarIcon className="h-5 w-5 text-success-500" />
                );
            case "listing":
                return <CheckCircleIcon className="h-5 w-5 text-primary-500" />;
            case "purchase":
                return (
                    <CurrencyDollarIcon className="h-5 w-5 text-secondary-500" />
                );
            case "verification":
                return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
            default:
                return <ClockIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "text-success-600";
            case "pending":
                return "text-warning-600";
            case "failed":
                return "text-error-600";
            default:
                return "text-gray-600";
        }
    };

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) {
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else {
            return `${days}d ago`;
        }
    };

    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        {getActivityIcon(activity.type, activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {activity.title}
                            </p>
                            <div className="flex items-center space-x-2">
                                {activity.amount && (
                                    <span className="text-sm font-medium text-gray-900">
                                        {activity.amount}
                                    </span>
                                )}
                                <span
                                    className={`text-xs font-medium ${getStatusColor(
                                        activity.status
                                    )}`}
                                >
                                    {activity.status}
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                            {activity.description}
                        </p>
                        <p className="text-xs text-gray-400">
                            {formatTimestamp(activity.timestamp)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentActivity;
