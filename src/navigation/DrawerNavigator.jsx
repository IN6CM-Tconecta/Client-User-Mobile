import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../shared/store/authStore';
import { MainTabs } from './MainTabs';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
    const { logout } = useAuthStore();
    
    const navigateToTab = (tabName) => {
        props.navigation.navigate(tabName);
    };

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que deseas salir?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Salir", style: "destructive", onPress: logout }
            ]
        );
    };

    const MenuItem = ({ label, icon, tabName }) => (
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateToTab(tabName)}>
            <Ionicons name={icon} size={24} color="#1801A9" />
            <Text style={styles.menuText}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
            <View style={styles.header}>
                <Ionicons name="person-circle-outline" size={60} color="#1801A9" />
                <Text style={styles.headerText}>Menú T-Conecta</Text>
            </View>
            <View style={styles.menuList}>
                <MenuItem label="Planificador" icon="map-outline" tabName="Planner" />
                <MenuItem label="Billetera" icon="card-outline" tabName="Wallet" />
                <MenuItem label="Infraestructura" icon="bus-outline" tabName="Explore" />
                <MenuItem label="Boletines" icon="warning-outline" tabName="Alerts" />
                <MenuItem label="Mi Perfil" icon="person-outline" tabName="Profile" />
            </View>
            
            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
    );
};

export const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: 'front',
                drawerStyle: {
                    width: 280,
                },
                overlayColor: 'rgba(0,0,0,0.7)',
            }}
        >
            <Drawer.Screen name="MainTabs" component={MainTabs} />
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    drawerContent: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', alignItems: 'center', marginBottom: 10 },
    headerText: { fontSize: 18, fontWeight: '800', color: '#1801A9', marginTop: 10 },
    menuList: { flex: 1, paddingHorizontal: 10 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 8, marginBottom: 5 },
    menuText: { fontSize: 15, fontWeight: '700', marginLeft: 15, color: '#1801A9' },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', marginTop: 'auto' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    logoutText: { fontSize: 16, fontWeight: '800', color: '#EF4444', marginLeft: 15 }
});
