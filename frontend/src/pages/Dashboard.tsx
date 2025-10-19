import React from "react";
import {
    ChartBarIcon,
    IdentificationIcon,
    ShoppingBagIcon,
    DatabaseIcon,
} from "@heroicons/react/24/outline";
import { useSystemHealth } from "@/hooks/useSystemHealth";
import { useDataListings } from "@/hooks/useDataListings";
import StatsCard from "@/components/StatsCard";
import RecentActivity from "@/components/RecentActivity";
import DataListingsChart from "@/components/DataListingsChart";

const Dashboard: React.FC = () => {
    const { data: health } = useSystemHealth();
    const { listings, isLoading: listingsLoading } = useDataListings();

    const stats = [
        {
            title: "Total Identities",
            value: "12",
            change: 2,
            changeType: "increase" as const,
            icon: IdentificationIcon,
            description: "Verified digital identities",
        },
        {
            title: "Active Listings",
            value: listings?.length || 0,
            change: 5,
            changeType: "increase" as const,
            icon: ShoppingBagIcon,
            description: "Data listings in marketplace",
        },
        {
            title: "Data Transactions",
            value: "1,234",
            change: 12,
            changeType: "increase" as const,
            icon: DatabaseIcon,
            description: "Total data transactions",
        },
        {
            title: "System Health",
            value: health?.status === "healthy" ? "100%" : "95%",
            change: 0,
            changeType: "increase" as const,
            icon: ChartBarIcon,
            description: "Overall system status",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Welcome to DataSov - Your data ownership platform
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Data Listings Chart */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">
                            Data Listings Trend
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Number of data listings over time
                        </p>
                    </div>
                    <div className="card-body">
                        <DataListingsChart />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">
                            Recent Activity
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Latest transactions and events
                        </p>
                    </div>
                    <div className="card-body">
                        <RecentActivity />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-medium text-gray-900">
                        Quick Actions
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Common tasks and operations
                    </p>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <button className="btn btn-primary">
                            <IdentificationIcon className="h-5 w-5 mr-2" />
                            Register Identity
                        </button>
                        <button className="btn btn-secondary">
                            <DatabaseIcon className="h-5 w-5 mr-2" />
                            List Data
                        </button>
                        <button className="btn btn-outline">
                            <ShoppingBagIcon className="h-5 w-5 mr-2" />
                            Browse Marketplace
                        </button>
                        <button className="btn btn-outline">
                            <ChartBarIcon className="h-5 w-5 mr-2" />
                            View Analytics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
