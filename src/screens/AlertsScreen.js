import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useAlertsStore } from '../store/alertsStore';

export const AlertsScreen = () => {
    const { alerts, loading, fetchAlerts } = useAlertsStore();

    useEffect(() => {
        fetchAlerts();
    }, []);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAlerts} />}
        >
            <Text style={styles.title}>Boletines Operacionales</Text>
            <Text style={styles.subtitle}>Alertas de servicio en tiempo real</Text>

            {loading && alerts.length === 0 ? (
                <ActivityIndicator size="large" color="#1801A9" style={{ marginTop: 40 }} />
            ) : alerts.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>Servicio Operando Normal</Text>
                    <Text style={styles.emptyDesc}>No hay alertas ni trabajos de mantenimiento activos en este momento.</Text>
                </View>
            ) : (
                alerts.map((item) => (
                    <View key={item._id || item.id} style={styles.alertCard}>
                        <View style={styles.alertHeader}>
                            <Text style={styles.alertTitle}>{item.title}</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{item.type || 'AVISO'}</Text>
                            </View>
                        </View>
                        <Text style={styles.alertDesc}>{item.description}</Text>
                    </View>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { padding: 16 },
    title: { fontSize: 22, fontWeight: '900', color: '#1801A9', marginBottom: 4 },
    subtitle: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 20 },
    emptyCard: { backgroundColor: '#F0FDF4', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#86EFAC', alignItems: 'center' },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: '#166534', marginBottom: 4 },
    emptyDesc: { fontSize: 13, color: '#15803D', textAlign: 'center' },
    alertCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 5, borderLeftColor: '#E11D48' },
    alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    alertTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
    badge: { backgroundColor: '#FFE4E6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { color: '#E11D48', fontSize: 10, fontWeight: '800' },
    alertDesc: { fontSize: 13, color: '#475569' }
});
