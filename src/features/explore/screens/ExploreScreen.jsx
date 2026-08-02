import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { adminClient } from '../../../shared/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { Bus, MapPin } from 'lucide-react-native';

export const ExploreScreen = () => {
    const [activeTab, setActiveTab] = useState("roads");
    const [roads, setRoads] = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [rRes, sRes] = await Promise.allSettled([
                    adminClient.get(`/roads/all`),
                    adminClient.get(`/stations/all`),
                ]);

                if (rRes.status === "fulfilled") setRoads(rRes.value.data?.data || []);
                if (sRes.status === "fulfilled") setStations(sRes.value.data?.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Red Integrada de Transporte</Text>
                <Text style={styles.subtitle}>Explora las líneas de transporte, frecuencias y estaciones activas en la metrópoli.</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'roads' && styles.tabActive]}
                    onPress={() => setActiveTab('roads')}
                >
                    <Bus size={18} color={activeTab === 'roads' ? '#1801A9' : '#94A3B8'} />
                    <Text style={[styles.tabText, activeTab === 'roads' && styles.tabTextActive]}>Líneas y Rutas ({roads.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'stations' && styles.tabActive]}
                    onPress={() => setActiveTab('stations')}
                >
                    <MapPin size={18} color={activeTab === 'stations' ? '#1801A9' : '#94A3B8'} />
                    <Text style={[styles.tabText, activeTab === 'stations' && styles.tabTextActive]}>Estaciones ({stations.length})</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#1801A9" />
                    <Text style={styles.loaderText}>Cargando red de transporte...</Text>
                </View>
            ) : (
                <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
                    {activeTab === 'roads' ? (
                        roads.map((road) => (
                            <View key={road._id || road.routeCode} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardCode}>{road.routeCode}</Text>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{road.typeRoad}</Text>
                                    </View>
                                </View>
                                <Text style={styles.cardName}>{road.name}</Text>
                                <Text style={styles.cardDesc}>Puntos de trayecto: {road.path?.coordinates?.length || 0} coordenadas</Text>
                            </View>
                        ))
                    ) : (
                        stations.map((st) => (
                            <View key={st._id || st.stationCode} style={styles.card}>
                                <Text style={styles.stCode}>{st.stationCode}</Text>
                                <Text style={styles.cardName}>{st.name}</Text>
                                <View style={styles.stBadge}>
                                    <Text style={styles.stBadgeText}>{st.typeStation}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { padding: 16, paddingBottom: 10 },
    title: { fontSize: 22, fontWeight: '900', color: '#1801A9', marginBottom: 4 },
    subtitle: { fontSize: 13, color: '#64748B', lineHeight: 18 },
    tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderBottomWidth: 2, borderColor: 'transparent' },
    tabActive: { borderColor: '#4CB500' },
    tabText: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },
    tabTextActive: { color: '#1801A9' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 12, fontSize: 13, color: '#64748B' },
    listContainer: { flex: 1 },
    listContent: { padding: 16, gap: 12 },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardCode: { fontSize: 18, fontWeight: '900', color: '#1801A9' },
    badge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 10, fontWeight: '800', color: '#166534' },
    cardName: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
    cardDesc: { fontSize: 12, color: '#64748B' },
    stCode: { fontSize: 11, fontWeight: '800', color: '#1801A9', fontFamily: 'monospace', marginBottom: 6 },
    stBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
    stBadgeText: { fontSize: 10, fontWeight: '800', color: '#334155' }
});
