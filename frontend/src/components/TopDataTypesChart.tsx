import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const TopDataTypesChart: React.FC = () => {
    // Mock data - replace with actual API data
    const data = [
        { name: "Location", sales: 45, revenue: 22.5 },
        { name: "Health", sales: 32, revenue: 19.2 },
        { name: "App Usage", sales: 28, revenue: 14.0 },
        { name: "Purchase", sales: 24, revenue: 12.0 },
        { name: "Social", sales: 18, revenue: 9.0 },
        { name: "Search", sales: 15, revenue: 7.5 },
        { name: "Financial", sales: 12, revenue: 6.0 },
    ];

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
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
                        formatter={(value: number, name: string) => [
                            name === "sales"
                                ? `${value} sales`
                                : `${value} SOL`,
                            name === "sales" ? "Sales" : "Revenue",
                        ]}
                    />
                    <Bar
                        dataKey="sales"
                        fill="#3B82F6"
                        name="sales"
                        radius={[2, 2, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TopDataTypesChart;
