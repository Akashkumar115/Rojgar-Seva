import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import api from '../../services/api';
import { COLORS } from '../../theme/colors';

export default function AdminDashboardScreen() {
    const [stats, setStats] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/jobs/admin-stats/');
            setStats(res.data);
        } catch (e) {
            console.log('Fetch admin stats error:', e);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStats} colors={[COLORS.primary]} />}
        >
            <View style={styles.banner}>
                <Text style={styles.bannerTitle}>Rozgar Seva Platform Admin 🛡️</Text>
                <Text style={styles.bannerSub}>System Operations & Escrow Ledger Control</Text>
            </View>

            <Text style={styles.sectionTitle}>System Metrics</Text>

            <View style={styles.grid}>
                <View style={styles.card}>
                    <Text style={styles.cardVal}>{stats?.total_users || 0}</Text>
                    <Text style={styles.cardLbl}>Total Registered Users</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardVal}>{stats?.total_jobs || 0}</Text>
                    <Text style={styles.cardLbl}>Total Jobs Posted</Text>
                </View>

                <View style={styles.card}>
                    <Text style={[styles.cardVal, { color: COLORS.secondary }]}>₹{stats?.total_escrow_held || 0.0}</Text>
                    <Text style={styles.cardLbl}>Escrow Funds Currently Held</Text>
                </View>

                <View style={styles.card}>
                    <Text style={[styles.cardVal, { color: COLORS.accent }]}>₹{stats?.total_escrow_released || 0.0}</Text>
                    <Text style={styles.cardLbl}>Total Escrow Released</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 16 },
    banner: { backgroundColor: '#1A1D20', borderRadius: 16, padding: 20, marginBottom: 16 },
    bannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    bannerSub: { fontSize: 13, color: COLORS.accent, marginTop: 4 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
    cardVal: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
    cardLbl: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
});
