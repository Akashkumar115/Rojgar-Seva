import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
    const { register } = useContext(AuthContext);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('WORKER'); // WORKER or EMPLOYER
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullName || !phoneNumber || !password || !confirmPassword) {
            Alert.alert('Validation Error', 'Please fill in all required fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Validation Error', 'Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await register(phoneNumber, fullName, password, confirmPassword, role);
        } catch (err) {
            const msg = err.response?.data?.phone_number?.[0] || err.response?.data?.password?.[0] || 'Registration failed.';
            Alert.alert('Registration Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.cardHeader}>Create Account</Text>
                <Text style={styles.subtext}>Join Rozgar Seva to find work or hire verified labourers.</Text>

                <Text style={styles.label}>Select Your Role</Text>
                <View style={styles.roleContainer}>
                    <TouchableOpacity
                        style={[styles.roleBox, role === 'WORKER' && styles.roleSelectedWorker]}
                        onPress={() => setRole('WORKER')}
                    >
                        <Text style={styles.roleEmoji}>👷</Text>
                        <Text style={[styles.roleText, role === 'WORKER' && styles.roleTextSelected]}>Daily Worker</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.roleBox, role === 'EMPLOYER' && styles.roleSelectedEmp]}
                        onPress={() => setRole('EMPLOYER')}
                    >
                        <Text style={styles.roleEmoji}>🏗️</Text>
                        <Text style={[styles.roleText, role === 'EMPLOYER' && styles.roleTextSelected]}>Job Provider</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Sunil Kumar"
                    value={fullName}
                    onChangeText={setFullName}
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 9876543210"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="At least 6 characters"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Complete Registration'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLink}>
                        Already have an account? <Text style={styles.linkBold}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: COLORS.primary,
        padding: 20,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        elevation: 4,
    },
    cardHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    subtext: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    roleBox: {
        flex: 0.48,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    roleSelectedWorker: {
        borderColor: COLORS.secondary,
        backgroundColor: '#E8F5E9',
    },
    roleSelectedEmp: {
        borderColor: COLORS.primary,
        backgroundColor: '#E3F2FD',
    },
    roleEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    roleTextSelected: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        marginBottom: 14,
        backgroundColor: '#FAFAFA',
    },
    button: {
        backgroundColor: COLORS.secondary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLink: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginTop: 16,
        fontSize: 14,
    },
    linkBold: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});
