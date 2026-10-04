import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import api from '../../services/api';
import { COLORS } from '../../theme/colors';

export default function JobApplicantsScreen({ route, navigation }) {
    const { jobId } = route.params;
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    const fetchApplicants = async () => {
        try {
            const res = await api.get(`/applications/job/${jobId}/`);
            setApplicants(res.data.results || res.data);
        } catch (e) {
            console.log('Fetch applicants error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptWorker = async (applicationId, workerName) => {
        Alert.alert(
            'Confirm Worker Selection',
            `Are you sure you want to select ${workerName}? This will lock the escrow amount for this job.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Accept & Lock Escrow 🔒',
                    onPress: async () => {
                        try {
                            await api.post(`/applications/${applicationId}/accept/`);
                            Alert.alert('Worker Accepted 🎉', `${workerName} is assigned to your job. Escrow status updated to HELD.`);
                            fetchApplicants();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to accept worker.');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.workerName}>👷 {item.worker_name}</Text>
                    <Text style={styles.phoneText}>📱 {item.worker_phone}</Text>
                </View>
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {item.worker_rating} / 5.0</Text>
                </View>
            </View>

            <Text style={styles.coverNote}>"{item.cover_note || 'Ready for daily work.'}"</Text>
            <Text style={styles.skillsText}>Skills: {(item.worker_skills || []).join(', ')}</Text>

            {item.status === 'PENDING' ? (
                <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptWorker(item.id, item.worker_name)}
                >
                    <Text style={styles.acceptBtnText}>ACCEPT WORKER & LOCK ESCROW 🔒</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.selectedBadge}>
                    <Text style={styles.selectedText}>Status: {item.status}</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>Job Applicants</Text>
            <Text style={styles.subtext}>Review profiles and accept the best suited worker.</Text>

            <FlatList
                data={applicants}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyEmoji}>📩</Text>
                        <Text style={styles.emptyTitle}>No Applicants Yet</Text>
                        <Text style={styles.emptySubtext}>Workers will apply soon. Pull down to refresh.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
    screenTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
    subtext: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16, marginTop: 2 },
    list: { paddingBottom: 20 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    workerName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
    phoneText: { fontSize: 12, color: COLORS.textSecondary },
    ratingBadge: { backgroundColor: '#FFF9DB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    ratingText: { fontSize: 12, color: '#F59F00', fontWeight: 'bold' },
    coverNote: { fontSize: 14, fontStyle: 'italic', color: COLORS.textPrimary, marginVertical: 8 },
    skillsText: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 10 },
    acceptBtn: { backgroundColor: COLORS.secondary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    acceptBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
    selectedBadge: { backgroundColor: '#D3F9D8', padding: 8, borderRadius: 6, alignItems: 'center' },
    selectedText: { color: COLORS.secondary, fontWeight: 'bold' },
    emptyBox: { alignItems: 'center', marginTop: 60 },
    emptyEmoji: { fontSize: 40 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 8 },
    emptySubtext: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 },
});
