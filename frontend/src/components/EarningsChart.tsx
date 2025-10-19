import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const EarningsChart: React.FC = () => {
    // Mock data - replace with actual API data
    const data = [
        { name: "Week 1", earnings: 0.5 },
        { name: "Week 2", earnings: 1.2 },
        { name: "Week 3", earnings: 0.8 },
        { name: "Week 4", earnings: 2.1 },
        { name: "Week 5", earnings: 1.8 },
        { name: "Week 6", earnings: 3.2 },
        { name: "Week 7", earnings: 2.9 },
        { name: "Week 8", earnings: 4.1 },
    ];

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient
                            id="earningsGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="5%"
                                stopColor="#10B981"
                                stopOpacity={0.3}
                            />
                            <stop
                                offset="95%"
                                stopColor="#10B981"
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "#6B7280" }}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "#6B7280" }}
                        tickFormatter={(value) => `${value} SOL`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#F9FAFB",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        labelStyle={{ color: "#374151", fontWeight: "500" }}
                        formatter={(value: number) => [
                            `${value} SOL`,
                            "Earnings",
                        ]}
                    />
                    <Area
                        type="monotone"
                        dataKey="earnings"
                        stroke="#10B981"
                        strokeWidth={2}
                        fill="url(#earningsGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EarningsChart;
