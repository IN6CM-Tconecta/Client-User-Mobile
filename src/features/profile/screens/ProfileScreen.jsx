import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { useAuthStore } from '../../../shared/store/authStore';
import { clientClient } from '../../../shared/api';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export const ProfileScreen = () => {
    const { user, logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState('RESUMEN'); // 'RESUMEN' | 'USUARIO'
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                setLoading(true);
                const res = await clientClient.get('/tours/history');
                setHistory(res.data?.data || []);
            } catch (err) {
                console.error('Error cargando historial', err);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    // Compute metrics
    const totalSpent = history.reduce((sum, t) => sum + (t.tarifaCobrada || 0), 0);
    const totalDistance = history.reduce((sum, t) => sum + ((t.distanciaMetros || 0) / 1000), 0);

    // Group data by date for charts
    const chartDataMap = {};
    history.forEach(t => {
        const dateObj = new Date(t.createdAt);
        const day = dateObj.getDate().toString().padStart(2, '0');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const dateStr = `${day} ${monthNames[dateObj.getMonth()]}`;

        if (!chartDataMap[dateStr]) {
            chartDataMap[dateStr] = { date: dateStr, gastado: 0, recorrido: 0 };
        }
        chartDataMap[dateStr].gastado += (t.tarifaCobrada || 0);
        chartDataMap[dateStr].recorrido += ((t.distanciaMetros || 0) / 1000);
    });

    const chartDataArray = Object.values(chartDataMap).reverse();
    
    // Default dummy data if empty to prevent chart crashes
    const labels = chartDataArray.length > 0 ? chartDataArray.map(d => d.date) : ['Sin datos'];
    const gastadoData = chartDataArray.length > 0 ? chartDataArray.map(d => d.gastado) : [0];
    const recorridoData = chartDataArray.length > 0 ? chartDataArray.map(d => d.recorrido) : [0];

    const chartConfig = {
        backgroundGradientFrom: '#FFFFFF',
        backgroundGradientTo: '#FFFFFF',
        color: (opacity = 1) => `rgba(24, 1, 169, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 1,
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.headerCard}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={40} color="#4CB500" />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Mi Perfil Ciudadano</Text>
                    <Text style={styles.headerSubtitle}>CUI: {user?.cui || 'Cargando...'}</Text>
                    <View style={styles.badgesRow}>
                        <View style={styles.badgeGreen}>
                            <Ionicons name="checkmark-circle" size={12} color="#4CB500" style={{ marginRight: 4 }} />
                            <Text style={styles.badgeGreenText}>CUENTA ACTIVA</Text>
                        </View>
                        <View style={styles.badgeBlue}>
                            <Ionicons name="key" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                            <Text style={styles.badgeBlueText}>ROL: {user?.role === 'User' ? 'CIUDADANO' : (user?.role || 'USER').toUpperCase()}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'RESUMEN' && styles.tabItemActiveResumen]}
                    onPress={() => setActiveTab('RESUMEN')}
                >
                    <Ionicons name="analytics" size={18} color={activeTab === 'RESUMEN' ? '#4CB500' : '#64748B'} />
                    <Text style={[styles.tabText, activeTab === 'RESUMEN' && styles.tabTextActiveResumen]}>Resumen de Actividad</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'USUARIO' && styles.tabItemActiveUsuario]}
                    onPress={() => setActiveTab('USUARIO')}
                >
                    <Ionicons name="person" size={18} color={activeTab === 'USUARIO' ? '#1801A9' : '#64748B'} />
                    <Text style={[styles.tabText, activeTab === 'USUARIO' && styles.tabTextActiveUsuario]}>Datos del Usuario</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.tabContent}>
                {activeTab === 'RESUMEN' && (
                    <View style={styles.fadeContainer}>
                        {/* KPI Cards */}
                        <View style={styles.kpiRow}>
                            <View style={styles.kpiCard}>
                                <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                                    <Ionicons name="cash" size={24} color="#EF4444" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.kpiLabel}>TOTAL GASTADO</Text>
                                    <Text style={styles.kpiValue}>Q{totalSpent.toFixed(2)}</Text>
                                </View>
                            </View>
                            <View style={styles.kpiCard}>
                                <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
                                    <Ionicons name="location" size={24} color="#1801A9" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.kpiLabel}>DIST. RECORRIDA</Text>
                                    <Text style={styles.kpiValue}>{totalDistance.toFixed(1)} km</Text>
                                </View>
                            </View>
                        </View>

                        {/* Charts */}
                        <Text style={styles.chartTitle}>Gastos por Día (Q)</Text>
                        <View style={styles.chartContainer}>
                            {loading ? (
                                <ActivityIndicator color="#1801A9" style={{ marginVertical: 40 }} />
                            ) : (
                                <BarChart
                                    data={{
                                        labels: labels,
                                        datasets: [{ data: gastadoData }]
                                    }}
                                    width={screenWidth - 64}
                                    height={220}
                                    yAxisLabel="Q"
                                    chartConfig={{
                                        ...chartConfig,
                                        color: (opacity = 1) => `rgba(76, 181, 0, ${opacity})`,
                                    }}
                                    style={styles.chartStyle}
                                    showValuesOnTopOfBars
                                />
                            )}
                        </View>

                        <Text style={styles.chartTitle}>Distancia por Día (km)</Text>
                        <View style={styles.chartContainer}>
                            {loading ? (
                                <ActivityIndicator color="#1801A9" style={{ marginVertical: 40 }} />
                            ) : (
                                <LineChart
                                    data={{
                                        labels: labels,
                                        datasets: [{ data: recorridoData }]
                                    }}
                                    width={screenWidth - 64}
                                    height={220}
                                    yAxisSuffix="km"
                                    chartConfig={{
                                        ...chartConfig,
                                        color: (opacity = 1) => `rgba(24, 1, 169, ${opacity})`,
                                    }}
                                    bezier
                                    style={styles.chartStyle}
                                />
                            )}
                        </View>
                    </View>
                )}

                {activeTab === 'USUARIO' && (
                    <View style={styles.fadeContainer}>
                        <Text style={styles.sectionTitle}>Información de Cuenta</Text>
                        
                        <View style={styles.infoCard}>
                            <View style={styles.infoIconBox}>
                                <Ionicons name="person" size={20} color="#1801A9" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoLabel}>CUI / DPI</Text>
                                <Text style={styles.infoValue}>{user?.cui || "No disponible"}</Text>
                                <Text style={styles.infoDesc}>Identificador Único del Sistema</Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={styles.infoIconBox}>
                                <Ionicons name="calendar" size={20} color="#1801A9" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoLabel}>MIEMBRO DESDE</Text>
                                <Text style={styles.infoValue}>2026</Text>
                                <Text style={styles.infoDesc}>Fecha de registro en T-Conecta</Text>
                            </View>
                        </View>

                        <View style={styles.securityBox}>
                            <Text style={styles.securityTitle}>Privacidad y Seguridad</Text>
                            <Text style={styles.securityText}>Tus datos están encriptados en los servidores de la municipalidad. El sistema T-Conecta utiliza autenticación avanzada JWT y algoritmos seguros para proteger tu identidad y las transacciones de tu billetera ciudadana.</Text>
                        </View>

                        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { padding: 16 },
    headerCard: {
        backgroundColor: '#1801A9',
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#1801A9',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    avatarContainer: {
        width: 70,
        height: 70,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        marginRight: 16
    },
    headerInfo: { flex: 1 },
    headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginBottom: 2 },
    headerSubtitle: { color: '#DBEAFE', fontSize: 13, fontWeight: '600', marginBottom: 8 },
    badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    badgeGreen: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 181, 0, 0.3)', borderColor: 'rgba(76, 181, 0, 0.5)', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeGreenText: { color: '#4CB500', fontSize: 9, fontWeight: '800' },
    badgeBlue: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeBlueText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
    
    tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 16 },
    tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabItemActiveResumen: { borderBottomColor: '#4CB500' },
    tabItemActiveUsuario: { borderBottomColor: '#1801A9' },
    tabText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
    tabTextActiveResumen: { color: '#4CB500' },
    tabTextActiveUsuario: { color: '#1801A9' },

    tabContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    fadeContainer: { flex: 1 },
    
    kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    kpiCard: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
    iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    kpiLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', marginBottom: 4 },
    kpiValue: { fontSize: 20, fontWeight: '900', color: '#0F172A' },

    chartTitle: { fontSize: 14, fontWeight: '800', color: '#1801A9', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 6 },
    chartContainer: { alignItems: 'center', marginBottom: 24 },
    chartStyle: { borderRadius: 16 },

    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1801A9', marginBottom: 16 },
    infoCard: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 12, alignItems: 'center' },
    infoIconBox: { backgroundColor: '#FFFFFF', padding: 10, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, marginRight: 12 },
    infoLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', marginBottom: 2 },
    infoValue: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: 'monospace' },
    infoDesc: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

    securityBox: { backgroundColor: '#EFF6FF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#DBEAFE', marginTop: 12 },
    securityTitle: { fontSize: 13, fontWeight: '800', color: '#1801A9', marginBottom: 6 },
    securityText: { fontSize: 12, color: '#475569', lineHeight: 18, textAlign: 'justify' },

    logoutButton: { backgroundColor: '#EF4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 16, marginTop: 24, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    logoutButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginLeft: 8 }
});
