import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';

export default function WorkerHomeScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchJobs();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/jobs/categories/');
            setCategories(res.data);
        } catch (e) {
            console.log('Fetch categories error:', e);
        }
    };

    const fetchJobs = async () => {
        setRefreshing(true);
        try {
            let url = '/jobs/?status=OPEN';
            if (selectedCategory) {
                url += `&category=${selectedCategory}`;
            }
            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }
            const res = await api.get(url);
            setJobs(res.data.results || res.data);
        } catch (e) {
            console.log('Fetch jobs error:', e);
        } finally {
            setRefreshing(false);
        }
    };

    const renderJobCard = ({ item }) => (
        <TouchableOpacity
            style={styles.jobCard}
            onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
        >
            <View style={styles.cardHeaderRow}>
                <View style={styles.badgeCategory}>
                    <Text style={styles.badgeCategoryText}>{item.category_name || 'General'}</Text>
                </View>
                <Text style={styles.wageText}>₹{item.payment_amount} <Text style={styles.wageType}>/{item.payment_type.toLowerCase()}</Text></Text>
            </View>

            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.locationText}>📍 {item.location}</Text>

            <View style={styles.skillsRow}>
                {(item.required_skills || []).map((skill, idx) => (
                    <View key={idx} style={styles.skillChip}>
                        <Text style={styles.skillText}>{skill}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.employerName}>🏗️ {item.employer_name}</Text>
                <View style={styles.escrowBadge}>
                    <Text style={styles.escrowText}>🔒 Escrow Protected</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Top Banner */}
            <View style={styles.topBanner}>
                <Text style={styles.greeting}>Namaste, {user?.full_name} 👋</Text>
                <Text style={styles.bannerTagline}>Find Work. Earn Better. Grow Together.</Text>

                {/* Search Bar */}
                <View style={styles.searchRow}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search electrician, plumber, painting..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={fetchJobs}
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={fetchJobs}>
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Categories Horizontal Bar */}
            <View style={styles.categoryHeaderRow}>
                <Text style={styles.sectionTitle}>Categories</Text>
                {selectedCategory && (
                    <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                        <Text style={styles.clearText}>Clear Filter</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesBar}>
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[styles.catChip, selectedCategory === cat.id && styles.catChipSelected]}
                        onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    >
                        <Text style={[styles.catChipText, selectedCategory === cat.id && styles.catChipTextSelected]}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Jobs List */}
            <View style={styles.listHeaderRow}>
                <Text style={styles.sectionTitle}>Available Jobs Nearby</Text>
                <Text style={styles.countText}>{jobs.length} jobs found</Text>
            </View>

            <FlatList
                data={jobs}
                renderItem={renderJobCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchJobs} colors={[COLORS.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyEmoji}>🔎</Text>
                        <Text style={styles.emptyTitle}>No Jobs Found</Text>
                        <Text style={styles.emptySubtext}>Try searching with a different keyword or category filter.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    topBanner: {
        backgroundColor: COLORS.primary,
        padding: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    greeting: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    bannerTagline: { fontSize: 13, color: COLORS.accent, marginBottom: 14 },
    searchRow: { flexDirection: 'row' },
    searchInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
    },
    searchButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: 10,
        paddingHorizontal: 16,
        justifyContent: 'center',
        marginLeft: 8,
    },
    searchButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
    categoryHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 14,
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
    clearText: { fontSize: 13, color: COLORS.danger, fontWeight: '600' },
    categoriesBar: { paddingLeft: 16, marginVertical: 10 },
    catChip: {
        backgroundColor: '#E9ECEF',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    catChipSelected: { backgroundColor: COLORS.primary },
    catChipText: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600' },
    catChipTextSelected: { color: '#FFFFFF' },
    listHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    countText: { fontSize: 12, color: COLORS.textSecondary },
    listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
    jobCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    badgeCategory: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    badgeCategoryText: { color: COLORS.secondary, fontSize: 12, fontWeight: 'bold' },
    wageText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
    wageType: { fontSize: 12, fontWeight: 'normal', color: COLORS.textSecondary },
    jobTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 8 },
    locationText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 },
    skillChip: { backgroundColor: '#F1F3F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 6, marginBottom: 4 },
    skillText: { fontSize: 11, color: COLORS.textSecondary },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F1F3F5', paddingTop: 10 },
    employerName: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
    escrowBadge: { backgroundColor: '#FFF9DB', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
    escrowText: { fontSize: 11, color: '#F59F00', fontWeight: 'bold' },
    emptyBox: { alignItems: 'center', marginTop: 40 },
    emptyEmoji: { fontSize: 40 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 8 },
    emptySubtext: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 },
});
