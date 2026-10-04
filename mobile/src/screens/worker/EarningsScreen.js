import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import api from '../../services/api';
import { COLORS } from '../../theme/colors';

export default function EarningsScreen() {
    const [summary, setSummary] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/payments/worker-earnings/');
            setSummary(res.data);
        } catch (e) {
            console.log('Fetch earnings error:', e);
        } finally {
            setRefreshing(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.historyCard}>
            <View style={styles.historyRow}>
                <Text style={styles.jobTitle}>{item.job_title}</Text>
                <Text style={styles.amountText}>+₹{item.net_amount}</Text>
            </View>
            <Text style={styles.subtext}>From: {item.employer_name}</Text>
            <Text style={styles.feeText}>Original Wage: ₹{item.amount} (Platform fee 5%: -₹{item.platform_fee})</Text>
            <View style={styles.releasedBadge}>
                <Text style={styles.releasedText}>✅ Escrow Released</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>My Earnings & Escrow</Text>

            {/* Summary Banner */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Net Earnings</Text>
                <Text style={styles.totalAmount}>₹{summary?.total_earnings || 0.0}</Text>

                <View style={styles.summaryStatsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{summary?.completed_jobs_count || 0}</Text>
                        <Text style={styles.statLbl}>Completed Jobs</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>100%</Text>
                        <Text style={styles.statLbl}>Escrow Guaranteed</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Payment Release History</Text>

            <FlatList
                data={summary?.history || []}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchEarnings} colors={[COLORS.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyEmoji}>💰</Text>
                        <Text style={styles.emptyTitle}>No Released Payments Yet</Text>
                        <Text style={styles.emptySubtext}>Once an employer confirms your completed job, your earnings will appear here.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
    screenTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 16 },
    summaryCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, marginBottom: 20, elevation: 3 },
    summaryLabel: { color: COLORS.accent, fontSize: 13, fontWeight: 'bold' },
    totalAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', marginVertical: 6 },
    summaryStatsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingTop: 14, marginTop: 10 },
    statBox: { alignItems: 'center', flex: 0.48 },
    statVal: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    statLbl: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
    list: { paddingBottom: 20 },
    historyCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 1 },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    jobTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary, flex: 1, marginRight: 8 },
    amountText: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
    subtext: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
    feeText: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
    releasedBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start', marginTop: 8 },
    releasedText: { fontSize: 11, color: COLORS.secondary, fontWeight: 'bold' },
    emptyBox: { alignItems: 'center', marginTop: 40 },
    emptyEmoji: { fontSize: 40 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 8 },
    emptySubtext: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 },
});
