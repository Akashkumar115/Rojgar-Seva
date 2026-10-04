import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import api from '../../services/api';
import { COLORS } from '../../theme/colors';

export default function PostJobScreen({ navigation }) {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requiredSkills, setRequiredSkills] = useState('');
    const [location, setLocation] = useState('Connaught Place, New Delhi');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentType, setPaymentType] = useState('PER_DAY');
    const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
    const [workersRequired, setWorkersRequired] = useState('1');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/jobs/categories/');
            setCategories(res.data);
            if (res.data.length > 0) {
                setSelectedCategory(res.data[0].id);
            }
        } catch (e) {
            console.log('Error fetching categories:', e);
        }
    };

    const handlePostJob = async () => {
        if (!title || !description || !paymentAmount || !selectedCategory) {
            Alert.alert('Validation Error', 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            const skillsArray = requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : [];
            await api.post('/jobs/', {
                category: selectedCategory,
                title,
                description,
                required_skills: skillsArray,
                location,
                latitude: 28.6315,
                longitude: 77.2167,
                payment_amount: parseFloat(paymentAmount),
                payment_type: paymentType,
                work_date: workDate,
                workers_required: parseInt(workersRequired, 10),
            });

            Alert.alert('Job Posted Successfully 🎉', 'Escrow record created. Workers can now view and apply for your job!', [
                { text: 'View Dashboard', onPress: () => navigation.navigate('EmployerDashboard') }
            ]);
        } catch (err) {
            Alert.alert('Posting Error', 'Failed to post job. Check inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.screenTitle}>Post a New Job Requirement</Text>
            <Text style={styles.subtext}>Create a daily job posting with automatic simulated Escrow protection.</Text>

            <Text style={styles.label}>Select Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[styles.catChip, selectedCategory === cat.id && styles.catChipSelected]}
                        onPress={() => setSelectedCategory(cat.id)}
                    >
                        <Text style={[styles.catChipText, selectedCategory === cat.id && styles.catChipTextSelected]}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.label}>Job Title *</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Electrician for Wiring Repair"
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.label}>Daily Wage / Rate (₹) *</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. 750"
                keyboardType="numeric"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
            />

            <Text style={styles.label}>Work Location *</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Lajpat Nagar, New Delhi"
                value={location}
                onChangeText={setLocation}
            />

            <Text style={styles.label}>Required Skills (Comma separated)</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Wiring, Fitting, Maintenance"
                value={requiredSkills}
                onChangeText={setRequiredSkills}
            />

            <Text style={styles.label}>Detailed Work Description *</Text>
            <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Describe work scope, timings, and expectations..."
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
            />

            <TouchableOpacity
                style={[styles.submitBtn, loading && styles.disabled]}
                onPress={handlePostJob}
                disabled={loading}
            >
                <Text style={styles.submitBtnText}>{loading ? 'Creating Job...' : '🔒 Post Job with Escrow Guarantee'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 16 },
    screenTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
    subtext: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16, marginTop: 4 },
    label: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6, marginTop: 10 },
    catScroll: { marginBottom: 10 },
    catChip: { backgroundColor: '#E9ECEF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
    catChipSelected: { backgroundColor: COLORS.primary },
    catChipText: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600' },
    catChipTextSelected: { color: '#FFFFFF' },
    input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 15, backgroundColor: '#FFFFFF', marginBottom: 10 },
    multiline: { textAlignVertical: 'top' },
    submitBtn: { backgroundColor: COLORS.secondary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
    submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    disabled: { opacity: 0.6 },
});
