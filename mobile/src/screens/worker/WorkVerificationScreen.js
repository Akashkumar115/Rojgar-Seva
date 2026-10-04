import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../../services/api';
import { COLORS } from '../../theme/colors';

export default function WorkVerificationScreen({ route, navigation }) {
    const { jobId } = route.params;
    const [job, setJob] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState(null);

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

    const handleVerifyLocation = async () => {
        setVerifying(true);
        setResult(null);

        // Simulated worker coordinates near job site for verification demo
        // Delhi Connaught Place coordinates: 28.6315, 77.2167
        const workerLat = job?.latitude ? job.latitude + 0.001 : 28.6315;
        const workerLon = job?.longitude ? job.longitude + 0.001 : 77.2167;

        try {
            const res = await api.post(`/verification/submit/${jobId}/`, {
                latitude: workerLat,
                longitude: workerLon,
                notes: "Worker arrived at location and confirmed work start."
            });

            setResult(res.data);
            if (res.data.is_verified) {
                Alert.alert('Verification Successful! ✅', 'Your location has been verified with the job site. Work is now marked IN PROGRESS.');
            } else {
                Alert.alert('Verification Failed ❌', res.data.message);
            }
        } catch (err) {
            Alert.alert('Verification Error', 'Failed to submit GPS location.');
        } finally {
            setVerifying(false);
        }
    };

    if (!job) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>Geo-Tagged Work Verification</Text>
            <Text style={styles.subtext}>Verify your presence at the job site using GPS location before starting work.</Text>

            <View style={styles.card}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.detail}>📍 Designated Location: {job.location}</Text>
                <Text style={styles.detail}>📐 Target Coordinates: {job.latitude}, {job.longitude}</Text>
                <Text style={styles.detail}>🔒 Allowed Radius: Within 5.0 km</Text>
            </View>

            <TouchableOpacity
                style={[styles.verifyBtn, verifying && styles.disabled]}
                onPress={handleVerifyLocation}
                disabled={verifying}
            >
                <Text style={styles.verifyBtnText}>{verifying ? 'Calculating GPS Distance...' : '📍 Verify My GPS Location'}</Text>
            </TouchableOpacity>

            {result && (
                <View style={[styles.resultCard, result.is_verified ? styles.resSuccess : styles.resFail]}>
                    <Text style={styles.resultTitle}>
                        {result.is_verified ? '✅ Location Verified' : '❌ Verification Failed'}
                    </Text>
                    <Text style={styles.resultDetail}>Distance to Job Site: {result.distance_km} km</Text>
                    <Text style={styles.resultMsg}>{result.message}</Text>
                    {result.is_verified && (
                        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('MyApplications')}>
                            <Text style={styles.doneBtnText}>Return to Applications</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    screenTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
    subtext: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20, marginTop: 4 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, marginBottom: 20, elevation: 2 },
    jobTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10 },
    detail: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
    verifyBtn: { backgroundColor: COLORS.secondary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    verifyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    disabled: { opacity: 0.6 },
    resultCard: { borderRadius: 14, padding: 18, marginTop: 20, borderWidth: 1 },
    resSuccess: { backgroundColor: '#E8F5E9', borderColor: COLORS.secondary },
    resFail: { backgroundColor: '#FFEBEE', borderColor: COLORS.danger },
    resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
    resultDetail: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
    resultMsg: { fontSize: 13, color: COLORS.textSecondary },
    doneBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 14 },
    doneBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
});
