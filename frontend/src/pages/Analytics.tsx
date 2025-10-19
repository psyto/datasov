import React from "react";
import {
    ChartBarIcon,
    TrendingUpIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";
import StatsCard from "@/components/StatsCard";
import DataListingsChart from "@/components/DataListingsChart";
import EarningsChart from "@/components/EarningsChart";
import TopDataTypesChart from "@/components/TopDataTypesChart";

const Analytics: React.FC = () => {
    const stats = [
        {
            title: "Total Revenue",
            value: "2,456.78 SOL",
            change: 12.5,
            changeType: "increase" as const,
            icon: CurrencyDollarIcon,
            description: "Lifetime earnings from data sales",
        },
        {
            title: "Active Listings",
            value: "24",
            change: 8,
            changeType: "increase" as const,
            icon: ChartBarIcon,
            description: "Currently listed data items",
        },
        {
            title: "Data Buyers",
            value: "156",
            change: 23,
            changeType: "increase" as const,
            icon: UserGroupIcon,
            description: "Unique data purchasers",
        },
        {
            title: "Conversion Rate",
            value: "18.4%",
            change: -2.1,
            changeType: "decrease" as const,
            icon: TrendingUpIcon,
            description: "Views to purchases ratio",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Track your data marketplace performance and earnings
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Earnings Chart */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">
                            Earnings Over Time
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Revenue from data sales (last 30 days)
                        </p>
                    </div>
                    <div className="card-body">
                        <EarningsChart />
                    </div>
                </div>

                {/* Data Listings Chart */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">
                            Listings Performance
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Number of active listings over time
                        </p>
                    </div>
                    <div className="card-body">
                        <DataListingsChart />
                    </div>
                </div>
            </div>

            {/* Top Data Types */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-medium text-gray-900">
                        Top Data Types
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Most popular data categories by sales volume
                    </p>
                </div>
                <div className="card-body">
                    <TopDataTypesChart />
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Average Sale Price */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">
                            Average Sale Price
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="text-3xl font-bold text-gray-900">
                            0.45 SOL
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            <span className="text-success-600">+5.2%</span> from
                            last month
                        </p>
                    </div>
                </div>

                {/* Best Performing Listing */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">
                            Best Performer
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="text-lg font-semibold text-gray-900">
                            Location History
                        </div>
                        <p className="text-sm text-gray-500">
                            15 sales • 2.3 SOL total
                        </p>
                        <p className="mt-1 text-sm text-success-600">
                            <span className="font-medium">+12%</span> this month
                        </p>
                    </div>
                </div>

                {/* Market Share */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">
                            Market Share
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="text-3xl font-bold text-gray-900">
                            3.2%
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Of total marketplace volume
                        </p>
                        <div className="mt-2">
                            <div className="bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary-600 h-2 rounded-full"
                                    style={{ width: "32%" }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-medium text-gray-900">
                        Recent Sales
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Latest data purchases and transactions
                    </p>
                </div>
                <div className="card-body">
                    <div className="space-y-4">
                        {[
                            {
                                type: "Location History",
                                buyer: "DataCorp Inc.",
                                amount: "0.5 SOL",
                                time: "2 hours ago",
                            },
                            {
                                type: "App Usage",
                                buyer: "Analytics Co.",
                                amount: "0.3 SOL",
                                time: "5 hours ago",
                            },
                            {
                                type: "Purchase History",
                                buyer: "Market Research Ltd.",
                                amount: "0.8 SOL",
                                time: "1 day ago",
                            },
                            {
                                type: "Health Data",
                                buyer: "MedTech Solutions",
                                amount: "1.2 SOL",
                                time: "2 days ago",
                            },
                        ].map((sale, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                            >
                                <div className="flex items-center">
                                    <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <span className="text-primary-600 font-semibold text-sm">
                                            {sale.type.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">
                                            {sale.type}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Sold to {sale.buyer}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {sale.amount}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {sale.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
