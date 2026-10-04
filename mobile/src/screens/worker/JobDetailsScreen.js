import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';

export default function JobDetailsScreen({ route, navigation }) {
    const { jobId } = route.params;
    const { user } = useContext(AuthContext);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [coverNote, setCoverNote] = useState('');
    const [applying, setApplying] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);

    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            const res = await api.get(`/jobs/${jobId}/`);
            setJob(res.data);
        } catch (e) {
            Alert.alert('Error', 'Unable to fetch job details.');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        setApplying(true);
        try {
            await api.post(`/applications/apply/${jobId}/`, { cover_note: coverNote });
            Alert.alert('Success 🎉', 'Your application has been submitted to the employer!', [
                { text: 'OK', onPress: () => navigation.navigate('MyApplications') }
            ]);
            setShowApplyModal(false);
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to submit application.';
            Alert.alert('Application Failed', msg);
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!job) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.headerCard}>
                <Text style={styles.categoryBadge}>{job.category_name}</Text>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.wageText}>₹{job.payment_amount} <Text style={styles.wageType}>/{job.payment_type.toLowerCase()}</Text></Text>

                <View style={styles.escrowBanner}>
                    <Text style={styles.escrowEmoji}>🔒</Text>
                    <View style={styles.escrowTextBox}>
                        <Text style={styles.escrowTitle}>Simulated Escrow Protection</Text>
                        <Text style={styles.escrowDesc}>Employer deposits ₹{job.payment_amount} into Escrow before work starts. Released to you upon work completion.</Text>
                    </View>
                </View>
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Job Details</Text>
                <Text style={styles.detailRow}>📍 <Text style={styles.detailBold}>Location:</Text> {job.location}</Text>
                <Text style={styles.detailRow}>📅 <Text style={styles.detailBold}>Work Date:</Text> {job.work_date}</Text>
                <Text style={styles.detailRow}>⏰ <Text style={styles.detailBold}>Timings:</Text> {job.start_time} - {job.end_time}</Text>
                <Text style={styles.detailRow}>👥 <Text style={styles.detailBold}>Workers Needed:</Text> {job.workers_required}</Text>
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.bodyText}>{job.description}</Text>
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Required Skills</Text>
                <View style={styles.skillsRow}>
                    {(job.required_skills || []).map((skill, idx) => (
                        <View key={idx} style={styles.skillChip}>
                            <Text style={styles.skillText}>{skill}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Employer Details</Text>
                <Text style={styles.detailRow}>🏗️ <Text style={styles.detailBold}>Employer:</Text> {job.employer_name}</Text>
                <Text style={styles.detailRow}>⭐ <Text style={styles.detailBold}>Employer Rating:</Text> {job.employer_rating} / 5.0</Text>
            </View>

            {user?.role === 'WORKER' && (
                !showApplyModal ? (
                    <TouchableOpacity style={styles.applyButton} onPress={() => setShowApplyModal(true)}>
                        <Text style={styles.applyButtonText}>APPLY FOR THIS JOB</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.applyBox}>
                        <Text style={styles.applyBoxTitle}>Submit Application</Text>
                        <Text style={styles.label}>Cover Note (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. I have 4 years experience and can reach on time."
                            multiline
                            numberOfLines={3}
                            value={coverNote}
                            onChangeText={setCoverNote}
                        />

                        <View style={styles.applyButtonRow}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowApplyModal(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmApplyButton, applying && styles.disabled]}
                                onPress={handleApply}
                                disabled={applying}
                            >
                                <Text style={styles.confirmText}>{applying ? 'Submitting...' : 'Confirm Apply'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 16 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, marginBottom: 14, elevation: 2 },
    categoryBadge: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
    jobTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
    wageText: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginVertical: 8 },
    wageType: { fontSize: 13, fontWeight: 'normal', color: COLORS.textSecondary },
    escrowBanner: { backgroundColor: '#FFF9DB', borderRadius: 10, padding: 12, flexDirection: 'row', marginTop: 10 },
    escrowEmoji: { fontSize: 24, marginRight: 10 },
    escrowTextBox: { flex: 1 },
    escrowTitle: { fontWeight: 'bold', color: '#F59F00', fontSize: 13 },
    escrowDesc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
    sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 14, elevation: 1 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10 },
    detailRow: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 6 },
    detailBold: { fontWeight: 'bold' },
    bodyText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap' },
    skillChip: { backgroundColor: '#E9ECEF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginRight: 8, marginBottom: 6 },
    skillText: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '600' },
    applyButton: { backgroundColor: COLORS.secondary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginVertical: 10 },
    applyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    applyBox: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: COLORS.secondary },
    applyBoxTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10 },
    label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 },
    input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, fontSize: 14, textAlignVertical: 'top', marginBottom: 12 },
    applyButtonRow: { flexDirection: 'row', justifyContent: 'space-between' },
    cancelButton: { flex: 0.45, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, alignItems: 'center' },
    cancelText: { color: COLORS.textSecondary, fontWeight: 'bold' },
    confirmApplyButton: { flex: 0.5, paddingVertical: 12, backgroundColor: COLORS.secondary, borderRadius: 8, alignItems: 'center' },
    confirmText: { color: '#FFFFFF', fontWeight: 'bold' },
    disabled: { opacity: 0.6 },
});
