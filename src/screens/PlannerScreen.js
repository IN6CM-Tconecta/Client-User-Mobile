import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    FlatList
} from 'react-native';
import { usePlannerStore } from '../store/plannerStore';
import { useWalletStore } from '../store/walletStore';

export const PlannerScreen = () => {
    const [originLat, setOriginLat] = useState('14.6150');
    const [originLon, setOriginLon] = useState('-90.5350');
    const [destLat, setDestLat] = useState('14.6400');
    const [destLon, setDestLon] = useState('-90.5130');
    const [systemType, setSystemType] = useState('TRANSMETRO');
    const [result, setResult] = useState(null);

    const { planTrip, history, fetchHistory, loading } = usePlannerStore();
    const { balance, fetchBalance } = useWalletStore();

    useEffect(() => {
        fetchBalance();
        fetchHistory();
    }, []);

    const handlePlanTrip = async () => {
        const res = await planTrip(originLat, originLon, destLat, destLon, systemType);
        if (res.success) {
            setResult(res.data);
            if (res.warning) {
                Alert.alert('Aviso de Saldo', res.warning);
            }
        } else {
            Alert.alert('No se pudo planear el viaje', res.message);
        }
    };

    const handleSelectPreset = (oLat, oLon, dLat, dLon) => {
        setOriginLat(oLat);
        setOriginLon(oLon);
        setDestLat(dLat);
        setDestLon(dLon);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header Balance Banner */}
            <View style={styles.balanceBanner}>
                <View>
                    <Text style={styles.balanceLabel}>Saldo Disponible</Text>
                    <Text style={styles.balanceValue}>Q{balance !== null ? balance.toFixed(2) : '0.00'}</Text>
                </View>
                <View style={styles.courtesyBadge}>
                    <Text style={styles.courtesyText}>5 Viajes Cortesía</Text>
                </View>
            </View>

            {/* Main Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Planificador Multimodal</Text>

                {/* Presets */}
                <Text style={styles.sectionSubtitle}>Rutas Frecuentes Presets</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
                    <TouchableOpacity
                        style={styles.presetChip}
                        onPress={() => handleSelectPreset('14.6150', '-90.5350', '14.6400', '-90.5130')}
                    >
                        <Text style={styles.presetText}>El Trébol → Centro Histórico</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.presetChip}
                        onPress={() => handleSelectPreset('14.5800', '-90.5500', '14.6300', '-90.5100')}
                    >
                        <Text style={styles.presetText}>CENMA → Plaza Barrios</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* System Selection */}
                <Text style={styles.sectionSubtitle}>Sistema de Transporte</Text>
                <View style={styles.systemSelector}>
                    {['TRANSMETRO', 'TUBUS', 'TRANSURBANO'].map((sys) => {
                        const active = systemType === sys;
                        const fare = sys === 'TRANSURBANO' ? 'Q2.00' : 'Q1.00';
                        return (
                            <TouchableOpacity
                                key={sys}
                                style={[styles.systemOption, active && styles.systemOptionActive]}
                                onPress={() => setSystemType(sys)}
                            >
                                <Text style={[styles.systemText, active && styles.systemTextActive]}>{sys}</Text>
                                <Text style={[styles.fareText, active && styles.fareTextActive]}>{fare}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Inputs */}
                <View style={styles.coordRow}>
                    <View style={styles.coordCol}>
                        <Text style={styles.label}>Lat Origen</Text>
                        <TextInput style={styles.input} value={originLat} onChangeText={setOriginLat} keyboardType="numeric" />
                    </View>
                    <View style={styles.coordCol}>
                        <Text style={styles.label}>Lon Origen</Text>
                        <TextInput style={styles.input} value={originLon} onChangeText={setOriginLon} keyboardType="numeric" />
                    </View>
                </View>

                <View style={styles.coordRow}>
                    <View style={styles.coordCol}>
                        <Text style={styles.label}>Lat Destino</Text>
                        <TextInput style={styles.input} value={destLat} onChangeText={setDestLat} keyboardType="numeric" />
                    </View>
                    <View style={styles.coordCol}>
                        <Text style={styles.label}>Lon Destino</Text>
                        <TextInput style={styles.input} value={destLon} onChangeText={setDestLon} keyboardType="numeric" />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.actionBtn, loading && styles.btnDisabled]}
                    onPress={handlePlanTrip}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionBtnText}>Calcular y Debitar Pasaje</Text>}
                </TouchableOpacity>
            </View>

            {/* Trip Result Card */}
            {result && (
                <View style={styles.resultCard}>
                    <Text style={styles.resultHeader}>Itinerario Calculado</Text>
                    <Text style={styles.resultItinerary}>{result.itinerary}</Text>
                    <View style={styles.resultGrid}>
                        <View style={styles.resultItem}>
                            <Text style={styles.resultItemLabel}>Distancia</Text>
                            <Text style={styles.resultItemVal}>{result.estimatedDistance}</Text>
                        </View>
                        <View style={styles.resultItem}>
                            <Text style={styles.resultItemLabel}>Tiempo Est.</Text>
                            <Text style={styles.resultItemVal}>{result.estimatedTime}</Text>
                        </View>
                        <View style={styles.resultItem}>
                            <Text style={styles.resultItemLabel}>Tarifa</Text>
                            <Text style={styles.resultItemValText}>{result.chargedFare}</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* History List */}
            <View style={styles.historySection}>
                <Text style={styles.historyTitle}>Historial Reciente de Viajes</Text>
                {history.length === 0 ? (
                    <Text style={styles.emptyText}>No has realizado viajes aún.</Text>
                ) : (
                    history.slice(0, 5).map((item, idx) => (
                        <View key={item._id || idx} style={styles.historyCard}>
                            <View style={styles.historyLeft}>
                                <Text style={styles.historyType}>Viaje #{history.length - idx}</Text>
                                <Text style={styles.historySub}>{(item.distanciaMetros / 1000).toFixed(2)} km • {item.tiempoEstimadoMinutos} min</Text>
                            </View>
                            <Text style={styles.historyFare}>-Q{item.tarifaCobrada?.toFixed(2) || '1.00'}</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { padding: 16 },
    balanceBanner: {
        backgroundColor: '#1801A9',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    balanceLabel: { color: '#E2E8F0', fontSize: 12, fontWeight: '600' },
    balanceValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
    courtesyBadge: { backgroundColor: '#4CB500', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    courtesyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    cardTitle: { fontSize: 18, fontWeight: '800', color: '#1801A9', marginBottom: 12 },
    sectionSubtitle: { fontSize: 12, fontWeight: '700', color: '#64748B', uppercase: true, marginTop: 10, marginBottom: 8 },
    presetsRow: { marginBottom: 12 },
    presetChip: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#CBD5E1' },
    presetText: { fontSize: 12, fontWeight: '600', color: '#334155' },
    systemSelector: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    systemOption: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1' },
    systemOptionActive: { backgroundColor: '#1801A9', borderColor: '#1801A9' },
    systemText: { fontSize: 11, fontWeight: '800', color: '#64748B' },
    systemTextActive: { color: '#FFFFFF' },
    fareText: { fontSize: 11, fontWeight: '700', color: '#4CB500', marginTop: 2 },
    fareTextActive: { color: '#4CB500' },
    coordRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    coordCol: { flex: 1 },
    label: { fontSize: 11, fontWeight: '600', color: '#475569', marginBottom: 4 },
    input: { backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#0F172A', borderWidth: 1, borderColor: '#CBD5E1' },
    actionBtn: { backgroundColor: '#4CB500', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
    btnDisabled: { opacity: 0.6 },
    actionBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
    resultCard: { backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#86EFAC' },
    resultHeader: { fontSize: 15, fontWeight: '800', color: '#166534', marginBottom: 6 },
    resultItinerary: { fontSize: 13, fontWeight: '600', color: '#15803D', marginBottom: 12 },
    resultGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    resultItem: { alignItems: 'center' },
    resultItemLabel: { fontSize: 10, color: '#166534', fontWeight: '700' },
    resultItemVal: { fontSize: 14, fontWeight: '800', color: '#092C15' },
    resultItemValText: { fontSize: 14, fontWeight: '800', color: '#4CB500' },
    historySection: { marginTop: 8 },
    historyTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
    emptyText: { color: '#94A3B8', fontSize: 13, fontStyle: 'italic' },
    historyCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    historyLeft: { flex: 1 },
    historyType: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    historySub: { fontSize: 12, color: '#64748B', marginTop: 2 },
    historyFare: { fontSize: 15, fontWeight: '800', color: '#DC2626' }
});
