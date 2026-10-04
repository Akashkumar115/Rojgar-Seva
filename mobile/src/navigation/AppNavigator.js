import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Worker Screens
import WorkerHomeScreen from '../screens/worker/WorkerHomeScreen';
import JobDetailsScreen from '../screens/worker/JobDetailsScreen';
import MyApplicationsScreen from '../screens/worker/MyApplicationsScreen';
import WorkVerificationScreen from '../screens/worker/WorkVerificationScreen';
import EarningsScreen from '../screens/worker/EarningsScreen';
import WorkerProfileScreen from '../screens/worker/WorkerProfileScreen';

// Employer Screens
import EmployerDashboardScreen from '../screens/employer/EmployerDashboardScreen';
import PostJobScreen from '../screens/employer/PostJobScreen';
import JobApplicantsScreen from '../screens/employer/JobApplicantsScreen';
import EscrowReleaseScreen from '../screens/employer/EscrowReleaseScreen';
import EmployerProfileScreen from '../screens/employer/EmployerProfileScreen';

// Admin Screen
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function WorkerTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: 'bold' },
                tabBarActiveTintColor: COLORS.secondary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarStyle: { paddingBottom: 6, paddingTop: 6, height: 60 },
            }}
        >
            <Tab.Screen
                name="WorkerHome"
                component={WorkerHomeScreen}
                options={{ title: 'Find Jobs', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🔎</Text> }}
            />
            <Tab.Screen
                name="MyApplications"
                component={MyApplicationsScreen}
                options={{ title: 'Applications', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text> }}
            />
            <Tab.Screen
                name="Earnings"
                component={EarningsScreen}
                options={{ title: 'Earnings', tabBarIcon: () => <Text style={{ fontSize: 20 }}>💰</Text> }}
            />
            <Tab.Screen
                name="WorkerProfile"
                component={WorkerProfileScreen}
                options={{ title: 'Profile', tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }}
            />
        </Tab.Navigator>
    );
}

function EmployerTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: 'bold' },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarStyle: { paddingBottom: 6, paddingTop: 6, height: 60 },
            }}
        >
            <Tab.Screen
                name="EmployerDashboard"
                component={EmployerDashboardScreen}
                options={{ title: 'Dashboard', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text> }}
            />
            <Tab.Screen
                name="PostJob"
                component={PostJobScreen}
                options={{ title: 'Post Job', tabBarIcon: () => <Text style={{ fontSize: 20 }}>➕</Text> }}
            />
            <Tab.Screen
                name="EmployerProfile"
                component={EmployerProfileScreen}
                options={{ title: 'Company', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏢</Text> }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#FFFFFF' }}>
                {!user ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                    </>
                ) : user.role === 'WORKER' ? (
                    <>
                        <Stack.Screen name="WorkerTabs" component={WorkerTabNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="JobDetails" component={JobDetailsScreen} options={{ title: 'Job Details' }} />
                        <Stack.Screen name="WorkVerification" component={WorkVerificationScreen} options={{ title: 'GPS Work Verification' }} />
                    </>
                ) : user.role === 'EMPLOYER' ? (
                    <>
                        <Stack.Screen name="EmployerTabs" component={EmployerTabNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} options={{ title: 'Applicants' }} />
                        <Stack.Screen name="EscrowRelease" component={EscrowReleaseScreen} options={{ title: 'Release Payment' }} />
                    </>
                ) : (
                    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'System Admin' }} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
