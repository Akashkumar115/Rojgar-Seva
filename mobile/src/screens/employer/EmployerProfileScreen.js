import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';

export default function EmployerProfileScreen() {
    const { user, logout } = useContext(AuthContext);
    const profile = user?.employer_profile;

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout }
        ]);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.headerCard}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarEmoji}>🏗️</Text>
                </View>
                <Text style={styles.userName}>{user?.full_name}</Text>
                <Text style={styles.companyName}>{profile?.company_name || 'Individual Employer'}</Text>
                <Text style={styles.phoneText}>📱 {user?.phone_number}</Text>

                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {profile?.rating || 5.0} / 5.0 Rating</Text>
                </View>
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Business Info</Text>
                <Text style={styles.infoRow}>🏢 Organization: <Text style={styles.bold}>{profile?.company_name || 'Individual Contractor'}</Text></Text>
                <Text style={styles.infoRow}>📍 Office Location: <Text style={styles.bold}>{profile?.location || 'New Delhi'}</Text></Text>
                <Text style={styles.infoRow}>🛡️ Verification Status: <Text style={styles.verifiedText}>Verified Employer ✅</Text></Text>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 16 },
    headerCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 14, elevation: 2 },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    avatarEmoji: { fontSize: 40 },
    userName: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
    companyName: { fontSize: 14, color: COLORS.primary, fontWeight: 'bold', marginTop: 2 },
    phoneText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
    ratingBadge: { backgroundColor: '#FFF9DB', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 10 },
    ratingText: { fontSize: 13, color: '#F59F00', fontWeight: 'bold' },
    sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 14, elevation: 1 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10 },
    infoRow: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
    bold: { fontWeight: 'bold', color: COLORS.textPrimary },
    verifiedText: { color: COLORS.secondary, fontWeight: 'bold' },
    logoutBtn: { backgroundColor: '#FFE3E3', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginVertical: 10 },
    logoutText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 15 },
});
