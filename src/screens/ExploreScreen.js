import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export const ExploreScreen = () => {
    const systems = [
        {
            id: '1',
            name: 'Transmetro Troncal',
            fare: 'Q1.00',
            color: '#1801A9',
            description: 'Red principal de autobuses articulados en carriles exclusivos.'
        },
        {
            id: '2',
            name: 'TuBus Alimentador',
            fare: 'Q1.00',
            color: '#4CB500',
            description: 'Autobuses de barrio que conectan con estaciones troncales.'
        },
        {
            id: '3',
            name: 'Transurbano Periférico',
            fare: 'Q2.00',
            color: '#2563EB',
            description: 'Sistema interurbano complementario de largo alcance.'
        }
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Infraestructura T-Conecta</Text>
            <Text style={styles.subtitle}>Red Integrada de Transporte Público</Text>

            {systems.map((item) => (
                <View key={item.id} style={[styles.card, { borderLeftColor: item.color }]}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <View style={[styles.badge, { backgroundColor: item.color }]}>
                            <Text style={styles.badgeText}>{item.fare}</Text>
                        </View>
                    </View>
                    <Text style={styles.cardDesc}>{item.description}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { padding: 16 },
    title: { fontSize: 22, fontWeight: '900', color: '#1801A9', marginBottom: 4 },
    subtitle: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 20 },
    card: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 6 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
    cardDesc: { fontSize: 13, color: '#475569', leading: 18 }
});
