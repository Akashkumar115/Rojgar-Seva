import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../../services/api';
import { COLORS } from '../../theme/colors';

export default function EscrowReleaseScreen({ route, navigation }) {
    const { jobId } = route.params;
    const [job, setJob] = useState(null);
    const [releasing, setReleasing] = useState(false);

    useEffect(() => {
        fetchJob();
    }, [jobId]);

    const fetchJob = async () => {
        try {
            const res = await api.get(`/jobs/${jobId}/`);
            setJob(res.data);
        } catch (e) {
            console.log('Error fetching job:', e);
        }
    };

    const handleReleaseEscrow = async () => {
        Alert.alert(
            'Confirm Escrow Release',
            `Are you satisfied with the work done by ${job?.selected_worker_name}? This will instantly transfer net earnings (₹${(job?.payment_amount * 0.95).toFixed(2)}) to the worker's account.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Release Payment Now 💸',
                    onPress: async () => {
                        setReleasing(true);
                        try {
                            const res = await api.post(`/payments/escrow/${jobId}/release/`);
                            Alert.alert('Payment Released Successfully 🎉', res.data.message);
                            navigation.navigate('EmployerDashboard');
                        } catch (err) {
                            const msg = err.response?.data?.error || 'Failed to release escrow.';
                            Alert.alert('Release Error', msg);
                        } finally {
                            setReleasing(false);
                        }
                    }
                }
            ]
        );
    };

    if (!job) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const netWorkerAmount = (job.payment_amount * 0.95).toFixed(2);
    const platformFee = (job.payment_amount * 0.05).toFixed(2);

    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>Escrow Payment Release</Text>
            <Text style={styles.subtext}>Confirm job completion to authorize release of held escrow funds.</Text>

            <View style={styles.card}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.detail}>👷 Assigned Worker: <Text style={styles.bold}>{job.selected_worker_name}</Text></Text>
                <Text style={styles.detail}>📍 Location: {job.location}</Text>
                <Text style={styles.detail}>📅 Work Date: {job.work_date}</Text>

                <View style={styles.divider} />

                <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLbl}>Gross Payment Held:</Text>
                    <Text style={styles.breakdownVal}>₹{job.payment_amount}</Text>
                </View>
                <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLbl}>Platform Fee (5%):</Text>
                    <Text style={styles.breakdownVal}>-₹{platformFee}</Text>
                </View>
                <View style={[styles.breakdownRow, styles.totalRow]}>
                    <Text style={styles.totalLbl}>Net Transfer to Worker:</Text>
                    <Text style={styles.totalVal}>₹{netWorkerAmount}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.releaseBtn, releasing && styles.disabled]}
                onPress={handleReleaseEscrow}
                disabled={releasing}
            >
                <Text style={styles.releaseBtnText}>{releasing ? 'Releasing Funds...' : '💸 RELEASE ESCROW TO WORKER'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    screenTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
    subtext: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20, marginTop: 4 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, marginBottom: 20, elevation: 2 },
    jobTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
    detail: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
    bold: { color: COLORS.textPrimary, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    breakdownLbl: { fontSize: 13, color: COLORS.textSecondary },
    breakdownVal: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
    totalRow: { borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 10, marginTop: 6 },
    totalLbl: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
    totalVal: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
    releaseBtn: { backgroundColor: COLORS.secondary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    releaseBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    disabled: { opacity: 0.6 },
});
