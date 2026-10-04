import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
    const { login } = useContext(AuthContext);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!phoneNumber || !password) {
            Alert.alert('Validation Error', 'Please enter both phone number and password.');
            return;
        }
        setLoading(true);
        try {
            await login(phoneNumber, password);
        } catch (err) {
            const msg = err.response?.data?.detail || 'Invalid credentials. Please try again.';
            Alert.alert('Login Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoWorkerLogin = () => {
        setPhoneNumber('9123456780');
        setPassword('worker123');
    };

    const handleDemoEmployerLogin = () => {
        setPhoneNumber('9876543210');
        setPassword('emp123');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View stipulation={styles.headerBox}>
                <Text style={styles.brandTitle}>Rojgar Seva</Text>
                <Text style={styles.brandSubtitle}>Find Work. Earn Better. Grow Together.</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardHeader}>Welcome Back</Text>

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 9123456780"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Sign In'}</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <Text style={styles.dividerText}>OR TRY DEMO ACCOUNTS</Text>
                </View>

                <View style={styles.demoRow}>
                    <TouchableOpacity style={styles.demoButtonWorker} onPress={handleDemoWorkerLogin}>
                        <Text style={styles.demoText}>👷 Demo Worker</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.demoButtonEmp} onPress={handleDemoEmployerLogin}>
                        <Text style={styles.demoText}>🏗️ Demo Employer</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerLink}>
                        Don't have an account? <Text style={styles.linkBold}>Register Now</Text>
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
        justifyContent: 'center',
        padding: 20,
    },
    headerBox: {
        alignItems: 'center',
        marginBottom: 30,
    },
    brandTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    brandSubtitle: {
        fontSize: 14,
        color: COLORS.accent,
        marginTop: 6,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        elevation: 4,
    },
    cardHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
        backgroundColor: '#FAFAFA',
    },
    button: {
        backgroundColor: COLORS.secondary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '700',
    },
    demoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    demoButtonWorker: {
        flex: 0.48,
        backgroundColor: '#E8F5E9',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    demoButtonEmp: {
        flex: 0.48,
        backgroundColor: '#E3F2FD',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#BBDEFB',
    },
    demoText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    registerLink: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginTop: 10,
        fontSize: 14,
    },
    linkBold: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});
