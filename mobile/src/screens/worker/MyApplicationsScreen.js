import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../../services/api';
import { COLORS } from '../../theme/colors';

export default function MyApplicationsScreen({ navigation }) {
    const [applications, setApplications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/applications/my-applications/');
            setApplications(res.data.results || res.data);
        } catch (e) {
            console.log('Fetch applications error:', e);
        } finally {
            setRefreshing(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACCEPTED':
                return { style: styles.badgeAccepted, text: 'Accepted ✅' };
            case 'REJECTED':
                return { style: styles.badgeRejected, text: 'Rejected ❌' };
            case 'COMPLETED':
                return { style: styles.badgeCompleted, text: 'Completed 🎉' };
            default:
                return { style: styles.badgePending, text: 'Pending Review ⏳' };
        }
    };

    const renderItem = ({ item }) => {
        const badge = getStatusBadge(item.status);
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.jobTitle}>{item.job_title}</Text>
                    <View style={badge.style}>
                        <Text style={styles.badgeText}>{badge.text}</Text>
                    </View>
                </View>

                <Text style={styles.infoText}>🏗️ Employer: {item.employer_name}</Text>
                <Text style={styles.infoText}>📍 Location: {item.job_location}</Text>
                <Text style={styles.infoText}>💰 Wage: ₹{item.job_payment_amount}</Text>
                <Text style={styles.infoText}>📅 Date: {item.job_work_date}</Text>

                {item.status === 'ACCEPTED' && (
                    <TouchableOpacity
                        style={styles.verifyButton}
                        onPress={() => navigation.navigate('WorkVerification', { jobId: item.job })}
                    >
                        <Text style={styles.verifyButtonText}>📍 Start Work & Verify GPS Location</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.screenHeader}>My Job Applications</Text>

            <FlatList
                data={applications}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchApplications} colors={[COLORS.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyEmoji}>📋</Text>
                        <Text style={styles.emptyTitle}>No Applications Yet</Text>
                        <Text style={styles.emptySubtext}>Explore jobs on the Home screen and apply for daily work.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
    screenHeader: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 16 },
    list: { paddingBottom: 20 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    jobTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, flex: 1, marginRight: 8 },
    badgePending: { backgroundColor: '#FFF3BF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    badgeAccepted: { backgroundColor: '#D3F9D8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    badgeRejected: { backgroundColor: '#FFE3E3', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    badgeCompleted: { backgroundColor: '#E3FAF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 12, fontWeight: 'bold', color: COLORS.textPrimary },
    infoText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
    verifyButton: { backgroundColor: COLORS.secondary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    verifyButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
    emptyBox: { alignItems: 'center', marginTop: 60 },
    emptyEmoji: { fontSize: 40 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 8 },
    emptySubtext: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 },
});
