import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';

export default function WorkerProfileScreen() {
    const { user, logout } = useContext(AuthContext);
    const profile = user?.worker_profile;

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout }
        ]);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.profileHeaderCard}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarEmoji}>👷</Text>
                </View>
                <Text style={styles.userName}>{user?.full_name}</Text>
                <Text style={styles.userRole}>Daily Wage Worker</Text>
                <Text style={styles.userPhone}>📱 {user?.phone_number}</Text>

                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {profile?.rating || 5.0} / 5.0 ({profile?.total_ratings_count || 0} reviews)</Text>
                </View>
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Skills & Experience</Text>
                <View style={styles.skillsRow}>
                    {(profile?.skills || []).map((skill, idx) => (
                        <View key={idx} style={styles.skillChip}>
                            <Text style={styles.skillText}>{skill}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.infoRow}>💼 Experience: <Text style={styles.bold}>{profile?.experience_years || 1} Years</Text></Text>
                <Text style={styles.infoRow}>📍 Location: <Text style={styles.bold}>{profile?.location || 'New Delhi'}</Text></Text>
                <Text style={styles.infoRow}>⚡ Availability: <Text style={styles.availText}>{profile?.availability || 'AVAILABLE'}</Text></Text>
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>About Me</Text>
                <Text style={styles.aboutText}>{profile?.about || 'Experienced worker looking for reliable daily employment.'}</Text>
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
    profileHeaderCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 14, elevation: 2 },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    avatarEmoji: { fontSize: 40 },
    userName: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
    userRole: { fontSize: 13, color: COLORS.secondary, fontWeight: '600', marginTop: 2 },
    userPhone: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
    ratingBadge: { backgroundColor: '#FFF9DB', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 10 },
    ratingText: { fontSize: 13, color: '#F59F00', fontWeight: 'bold' },
    sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 14, elevation: 1 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10 },
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    skillChip: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginRight: 8, marginBottom: 6 },
    skillText: { fontSize: 12, color: COLORS.secondary, fontWeight: 'bold' },
    infoRow: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
    bold: { fontWeight: 'bold', color: COLORS.textPrimary },
    availText: { fontWeight: 'bold', color: COLORS.secondary },
    aboutText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
    logoutBtn: { backgroundColor: '#FFE3E3', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginVertical: 10 },
    logoutText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 15 },
});
