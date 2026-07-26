import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { PlannerScreen } from '../screens/PlannerScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { AlertsScreen } from '../screens/AlertsScreen';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: '#1801A9' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: '800', fontSize: 18 },
                tabBarActiveTintColor: '#4CB500',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 8, backgroundColor: '#FFFFFF' },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Planner') iconName = focused ? 'map' : 'map-outline';
                    else if (route.name === 'Wallet') iconName = focused ? 'card' : 'card-outline';
                    else if (route.name === 'Explore') iconName = focused ? 'bus' : 'bus-outline';
                    else if (route.name === 'Alerts') iconName = focused ? 'warning' : 'warning-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                }
            })}
        >
            <Tab.Screen name="Planner" component={PlannerScreen} options={{ title: 'Planificador' }} />
            <Tab.Screen name="Wallet" component={WalletScreen} options={{ title: 'Billetera' }} />
            <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: 'Infraestructura' }} />
            <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Boletines' }} />
        </Tab.Navigator>
    );
};
