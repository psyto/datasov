import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const DataListingsChart: React.FC = () => {
    // Mock data - replace with actual API data
    const data = [
        { name: "Jan", listings: 12, sales: 8 },
        { name: "Feb", listings: 19, sales: 12 },
        { name: "Mar", listings: 15, sales: 10 },
        { name: "Apr", listings: 22, sales: 18 },
        { name: "May", listings: 28, sales: 24 },
        { name: "Jun", listings: 35, sales: 30 },
        { name: "Jul", listings: 42, sales: 38 },
        { name: "Aug", listings: 38, sales: 32 },
        { name: "Sep", listings: 45, sales: 40 },
        { name: "Oct", listings: 52, sales: 48 },
        { name: "Nov", listings: 48, sales: 44 },
        { name: "Dec", listings: 55, sales: 50 },
    ];

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "#6B7280" }}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "#6B7280" }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#F9FAFB",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        labelStyle={{ color: "#374151", fontWeight: "500" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="listings"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                        name="Active Listings"
                    />
                    <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                        name="Sales"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DataListingsChart;
