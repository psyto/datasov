import React from "react";
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import { useSystemHealth } from "../hooks/useSystemHealth";

const SystemStatus: React.FC = () => {
    const { data: health, isLoading } = useSystemHealth();

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (!health) {
        return (
            <div className="p-4">
                <div className="text-center text-gray-500">
                    Unable to load system status
                </div>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "up":
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case "degraded":
                return (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                );
            case "down":
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <ClockIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "up":
                return "text-green-600";
            case "degraded":
                return "text-yellow-600";
            case "down":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                    System Status
                </h3>
                <div
                    className={`flex items-center ${getStatusColor(
                        health.status
                    )}`}
                >
                    {getStatusIcon(health.status)}
                    <span className="ml-2 text-sm font-medium capitalize">
                        {health.status}
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {Object.entries(health.services).map(([service, status]) => (
                    <div
                        key={service}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center">
                            {getStatusIcon(status.status)}
                            <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                                {service}
                            </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                            {status.responseTime && (
                                <span className="mr-2">
                                    {status.responseTime}ms
                                </span>
                            )}
                            <span className={getStatusColor(status.status)}>
                                {status.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Uptime:</span>
                        <span className="ml-2 font-medium">
                            {Math.floor(health.metrics.uptime / 3600)}h
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500">Memory:</span>
                        <span className="ml-2 font-medium">
                            {Math.round(
                                health.metrics.memoryUsage / 1024 / 1024
                            )}
                            MB
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500">CPU:</span>
                        <span className="ml-2 font-medium">
                            {Math.round(health.metrics.cpuUsage * 100)}%
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500">Connections:</span>
                        <span className="ml-2 font-medium">
                            {health.metrics.activeConnections}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemStatus;
