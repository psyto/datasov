import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";

// Mock data
const mockEarnings = {
    today: 0.15,
    weekly: 1.25,
    monthly: 5.8,
    total: 23.45,
};

const mockDataTypes = [
    { name: "Location Data", collected: true, price: 0.1 },
    { name: "App Usage", collected: true, price: 0.05 },
    { name: "Health Data", collected: false, price: 0.2 },
    { name: "Purchase History", collected: false, price: 0.15 },
];

export default function App() {
    const [currentScreen, setCurrentScreen] = useState("home");
    const [dataTypes, setDataTypes] = useState(mockDataTypes);

    // Error handling function
    const handleScreenChange = (screen: string) => {
        try {
            console.log(`Changing to ${screen} screen`);
            setCurrentScreen(screen);
        } catch (error) {
            console.error("Screen change error:", error);
            Alert.alert("Error", "An error occurred while changing screens");
        }
    };

    const toggleDataCollection = (index: number) => {
        const newDataTypes = [...dataTypes];
        newDataTypes[index].collected = !newDataTypes[index].collected;
        setDataTypes(newDataTypes);

        Alert.alert(
            "Data Collection Settings",
            `Collection of ${newDataTypes[index].name} has been ${
                newDataTypes[index].collected ? "started" : "stopped"
            }`
        );
    };

    const renderHomeScreen = () => (
        <ScrollView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>DataSov Mobile</Text>
                <Text style={styles.subtitle}>Data Monetization App</Text>
            </View>

            {/* Revenue Display */}
            <View style={styles.earningsCard}>
                <Text style={styles.earningsTitle}>Current Earnings</Text>
                <Text style={styles.earningsAmount}>${mockEarnings.total}</Text>
                <View style={styles.earningsBreakdown}>
                    <Text style={styles.earningsText}>
                        Today: ${mockEarnings.today}
                    </Text>
                    <Text style={styles.earningsText}>
                        This Week: ${mockEarnings.weekly}
                    </Text>
                    <Text style={styles.earningsText}>
                        This Month: ${mockEarnings.monthly}
                    </Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleScreenChange("data")}
                >
                    <Text style={styles.actionButtonText}>
                        📊 Data Collection
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleScreenChange("earnings")}
                >
                    <Text style={styles.actionButtonText}>
                        💰 Revenue Details
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleScreenChange("settings")}
                >
                    <Text style={styles.actionButtonText}>⚙️ Settings</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderDataScreen = () => {
        try {
            return (
                <ScrollView style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => handleScreenChange("home")}
                        >
                            <Text style={styles.backButton}>← Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.screenTitle}>Data Collection</Text>
                    </View>

                    <View style={styles.dataTypesContainer}>
                        {dataTypes.map((dataType, index) => (
                            <View key={index} style={styles.dataTypeCard}>
                                <View style={styles.dataTypeInfo}>
                                    <Text style={styles.dataTypeName}>
                                        {dataType.name}
                                    </Text>
                                    <Text style={styles.dataTypePrice}>
                                        ${dataType.price}/item
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[
                                        styles.toggleButton,
                                        {
                                            backgroundColor: dataType.collected
                                                ? "#10B981"
                                                : "#EF4444",
                                        },
                                    ]}
                                    onPress={() => toggleDataCollection(index)}
                                >
                                    <Text style={styles.toggleButtonText}>
                                        {dataType.collected ? "ON" : "OFF"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <View style={styles.collectionStats}>
                        <Text style={styles.statsTitle}>Collection Status</Text>
                        <Text style={styles.statsText}>
                            Collecting:{" "}
                            {dataTypes.filter((d) => d.collected).length} /{" "}
                            {dataTypes.length}
                        </Text>
                    </View>
                </ScrollView>
            );
        } catch (error) {
            console.error("データ画面レンダリングエラー:", error);
            return (
                <View style={styles.container}>
                    <StatusBar style="dark" />
                    <View style={styles.header}>
                        <Text style={styles.title}>エラーが発生しました</Text>
                        <Text style={styles.subtitle}>
                            データ収集画面の読み込みに失敗しました
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleScreenChange("home")}
                    >
                        <Text style={styles.actionButtonText}>
                            ホームに戻る
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    const renderEarningsScreen = () => {
        try {
            return (
                <ScrollView style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => handleScreenChange("home")}
                        >
                            <Text style={styles.backButton}>← Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.screenTitle}>Revenue Details</Text>
                    </View>

                    <View style={styles.earningsDetailCard}>
                        <Text style={styles.detailTitle}>Earnings History</Text>
                        <View style={styles.earningsHistory}>
                            <View style={styles.historyItem}>
                                <Text style={styles.historyDate}>Today</Text>
                                <Text style={styles.historyAmount}>
                                    ${mockEarnings.today}
                                </Text>
                            </View>
                            <View style={styles.historyItem}>
                                <Text style={styles.historyDate}>
                                    Yesterday
                                </Text>
                                <Text style={styles.historyAmount}>$0.12</Text>
                            </View>
                            <View style={styles.historyItem}>
                                <Text style={styles.historyDate}>
                                    This Week
                                </Text>
                                <Text style={styles.historyAmount}>
                                    ${mockEarnings.weekly}
                                </Text>
                            </View>
                            <View style={styles.historyItem}>
                                <Text style={styles.historyDate}>
                                    This Month
                                </Text>
                                <Text style={styles.historyAmount}>
                                    ${mockEarnings.monthly}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.goalsCard}>
                        <Text style={styles.detailTitle}>Goals</Text>
                        <View style={styles.goalItem}>
                            <Text style={styles.goalText}>
                                Monthly Goal: $15.00
                            </Text>
                            <Text style={styles.goalProgress}>
                                Progress:{" "}
                                {Math.round((mockEarnings.monthly / 15) * 100)}%
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            );
        } catch (error) {
            console.error("Revenue screen rendering error:", error);
            return (
                <View style={styles.container}>
                    <StatusBar style="dark" />
                    <View style={styles.header}>
                        <Text style={styles.title}>Error Occurred</Text>
                        <Text style={styles.subtitle}>
                            Failed to load revenue details screen
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleScreenChange("home")}
                    >
                        <Text style={styles.actionButtonText}>
                            ホームに戻る
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    const renderSettingsScreen = () => {
        try {
            return (
                <ScrollView style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => handleScreenChange("home")}
                        >
                            <Text style={styles.backButton}>← Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.screenTitle}>Settings</Text>
                    </View>

                    <View style={styles.settingsContainer}>
                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>
                                Notification Settings
                            </Text>
                            <TouchableOpacity style={styles.settingButton}>
                                <Text style={styles.settingButtonText}>ON</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>
                                Privacy Settings
                            </Text>
                            <TouchableOpacity style={styles.settingButton}>
                                <Text style={styles.settingButtonText}>
                                    Details
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>
                                Account Information
                            </Text>
                            <TouchableOpacity style={styles.settingButton}>
                                <Text style={styles.settingButtonText}>
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            );
        } catch (error) {
            console.error("Settings screen rendering error:", error);
            return (
                <View style={styles.container}>
                    <StatusBar style="dark" />
                    <View style={styles.header}>
                        <Text style={styles.title}>Error Occurred</Text>
                        <Text style={styles.subtitle}>
                            Failed to load settings screen
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleScreenChange("home")}
                    >
                        <Text style={styles.actionButtonText}>
                            ホームに戻る
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    // Screen switching
    try {
        switch (currentScreen) {
            case "data":
                return renderDataScreen();
            case "earnings":
                return renderEarningsScreen();
            case "settings":
                return renderSettingsScreen();
            default:
                return renderHomeScreen();
        }
    } catch (error) {
        console.error("Screen rendering error:", error);
        return (
            <View style={styles.container}>
                <StatusBar style="dark" />
                <View style={styles.header}>
                    <Text style={styles.title}>Error Occurred</Text>
                    <Text style={styles.subtitle}>Please restart the app</Text>
                </View>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleScreenChange("home")}
                >
                    <Text style={styles.actionButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        backgroundColor: "#FFFFFF",
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1F2937",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 4,
    },
    backButton: {
        fontSize: 16,
        color: "#3B82F6",
        marginBottom: 10,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1F2937",
    },
    earningsCard: {
        backgroundColor: "#FFFFFF",
        margin: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    earningsTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
    },
    earningsAmount: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#10B981",
        marginBottom: 16,
    },
    earningsBreakdown: {
        gap: 4,
    },
    earningsText: {
        fontSize: 14,
        color: "#6B7280",
    },
    actionsContainer: {
        padding: 20,
        gap: 12,
    },
    actionButton: {
        backgroundColor: "#3B82F6",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: "center",
    },
    actionButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    dataTypesContainer: {
        padding: 20,
        gap: 12,
    },
    dataTypeCard: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    dataTypeInfo: {
        flex: 1,
    },
    dataTypeName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
    },
    dataTypePrice: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 2,
    },
    toggleButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 60,
        alignItems: "center",
    },
    toggleButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    collectionStats: {
        backgroundColor: "#FFFFFF",
        margin: 20,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
    },
    statsText: {
        fontSize: 14,
        color: "#6B7280",
    },
    earningsDetailCard: {
        backgroundColor: "#FFFFFF",
        margin: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 16,
    },
    earningsHistory: {
        gap: 12,
    },
    historyItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    historyDate: {
        fontSize: 14,
        color: "#6B7280",
    },
    historyAmount: {
        fontSize: 16,
        fontWeight: "600",
        color: "#10B981",
    },
    goalsCard: {
        backgroundColor: "#FFFFFF",
        margin: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    goalItem: {
        gap: 8,
    },
    goalText: {
        fontSize: 14,
        color: "#6B7280",
    },
    goalProgress: {
        fontSize: 14,
        color: "#3B82F6",
        fontWeight: "600",
    },
    settingsContainer: {
        padding: 20,
        gap: 16,
    },
    settingItem: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    settingLabel: {
        fontSize: 16,
        color: "#1F2937",
    },
    settingButton: {
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    settingButtonText: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
});
