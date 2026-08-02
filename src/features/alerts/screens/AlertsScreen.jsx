import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useAlertsStore } from '../../../shared/store/alertsStore';
import { Ionicons } from '@expo/vector-icons';

export const AlertsScreen = () => {
    const { alerts, loading, fetchAlerts } = useAlertsStore();

    useEffect(() => {
        fetchAlerts();
    }, []);

    const getTypeBadge = (typeAlert) => {
        switch (typeAlert) {
            case "INCIDENT":
                return (
                    <View style={[styles.badge, { backgroundColor: '#FFE4E6' }]}>
                        <Ionicons name="warning" size={12} color="#BE123C" style={{ marginRight: 4 }} />
                        <Text style={[styles.badgeText, { color: '#BE123C' }]}>INCIDENTE</Text>
                    </View>
                );
            case "MAINTENANCE":
                return (
                    <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="build" size={12} color="#92400E" style={{ marginRight: 4 }} />
                        <Text style={[styles.badgeText, { color: '#92400E' }]}>MANTENIMIENTO</Text>
                    </View>
                );
            case "INFO":
            default:
                return (
                    <View style={[styles.badge, { backgroundColor: '#E0F2FE' }]}>
                        <Ionicons name="information-circle" size={12} color="#075985" style={{ marginRight: 4 }} />
                        <Text style={[styles.badgeText, { color: '#075985' }]}>INFORMACIÓN</Text>
                    </View>
                );
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAlerts} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Alertas de Servicio en Tiempo Real</Text>
                <Text style={styles.subtitle}>Mantente informado sobre cambios operacionales, incidentes o mantenimientos en el transporte.</Text>
            </View>

            {loading && alerts.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1801A9" />
                    <Text style={styles.centerText}>Cargando alertas de servicio...</Text>
                </View>
            ) : alerts.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>Actualmente todo el servicio opera de forma regular sin incidentes reportados.</Text>
                </View>
            ) : (
                <View style={styles.listContainer}>
                    {alerts.map((alert) => (
                        <View key={alert._id || alert.id} style={styles.alertCard}>
                            <View style={styles.alertHeader}>
                                {getTypeBadge(alert.typeAlert)}
                                <Text style={styles.dateText}>
                                    {new Date(alert.createdAt).toLocaleString("es-GT")}
                                </Text>
                            </View>
                            <Text style={styles.alertTitle}>{alert.title}</Text>
                            <Text style={styles.alertDesc}>{alert.description}</Text>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { padding: 16 },
    header: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '900', color: '#1801A9', marginBottom: 4 },
    subtitle: { fontSize: 13, color: '#64748B', lineHeight: 18 },
    
    centerContainer: { padding: 32, alignItems: 'center' },
    centerText: { marginTop: 12, color: '#64748B' },
    
    emptyCard: { backgroundColor: '#FFFFFF', padding: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(15, 23, 42, 0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, alignItems: 'center' },
    emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center' },
    
    listContainer: { gap: 16 },
    alertCard: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(15, 23, 42, 0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 10, fontWeight: '800' },
    dateText: { fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' },
    alertTitle: { fontSize: 16, fontWeight: '800', color: '#1801A9', marginBottom: 8 },
    alertDesc: { fontSize: 13, color: '#334155', lineHeight: 20 }
});
