import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';

export default function EmployerDashboardScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/jobs/my-posted/');
            setJobs(res.data.results || res.data);
        } catch (e) {
            console.log('Fetch my jobs error:', e);
        } finally {
            setRefreshing(false);
        }
    };

    const activeJobsCount = jobs.filter(j => ['OPEN', 'APPLICATIONS_RECEIVED', 'WORKER_SELECTED', 'IN_PROGRESS'].includes(j.status)).length;
    const completedJobsCount = jobs.filter(j => j.status === 'COMPLETED').length;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMyJobs} colors={[COLORS.primary]} />}
        >
            {/* Header Banner */}
            <View style={styles.banner}>
                <Text style={styles.greeting}>Welcome, {user?.full_name} 🏗️</Text>
                <Text style={styles.tagline}>Find the Right Worker for Your Job</Text>

                <TouchableOpacity style={styles.postBtn} onPress={() => navigation.navigate('PostJob')}>
                    <Text style={styles.postBtnText}>➕ POST A NEW JOB</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{activeJobsCount}</Text>
                    <Text style={styles.statLabel}>Active / Open Jobs</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{completedJobsCount}</Text>
                    <Text style={styles.statLabel}>Completed Jobs</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Your Posted Jobs</Text>

            {jobs.map((job) => (
                <View key={job.id} style={styles.jobCard}>
                    <View style={styles.cardRow}>
                        <Text style={styles.jobTitle}>{job.title}</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{job.status}</Text>
                        </View>
                    </View>

                    <Text style={styles.infoText}>📍 {job.location}</Text>
                    <Text style={styles.infoText}>💰 ₹{job.payment_amount} ({job.payment_type})</Text>
                    <Text style={styles.infoText}>📩 {job.applications_count} Applicants Received</Text>

                    <View style={styles.actionsRow}>
                        {job.applications_count > 0 && (
                            <TouchableOpacity
                                style={styles.applicantsBtn}
                                onPress={() => navigation.navigate('JobApplicants', { jobId: job.id })}
                            >
                                <Text style={styles.applicantsBtnText}>View Applicants ({job.applications_count})</Text>
                            </TouchableOpacity>
                        )}

                        {job.selected_worker && job.status !== 'COMPLETED' && (
                            <TouchableOpacity
                                style={styles.escrowBtn}
                                onPress={() => navigation.navigate('EscrowRelease', { jobId: job.id })}
                            >
                                <Text style={styles.escrowBtnText}>🔒 Release Escrow Payment</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 16 },
    banner: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, marginBottom: 16 },
    greeting: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    tagline: { fontSize: 13, color: COLORS.accent, marginBottom: 14 },
    postBtn: { backgroundColor: COLORS.secondary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    postBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statCard: { flex: 0.48, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2 },
    statNumber: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary },
    statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
    jobCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    jobTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, flex: 1, marginRight: 8 },
    statusBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusText: { fontSize: 11, fontWeight: 'bold', color: COLORS.primary },
    infoText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
    actionsRow: { marginTop: 10 },
    applicantsBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 6 },
    applicantsBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
    escrowBtn: { backgroundColor: COLORS.accent, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    escrowBtnText: { color: '#1A1D20', fontWeight: 'bold', fontSize: 13 },
});
