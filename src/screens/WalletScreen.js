import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useWalletStore } from '../store/walletStore';
import { isValidLuhn } from '../utils/luhn';

export const WalletScreen = () => {
    const { balance, courtesyTrips, fetchBalance, purchaseCard, rechargeWallet, loading } = useWalletStore();
    const [activeTab, setActiveTab] = useState('PURCHASE'); // 'PURCHASE' | 'RECHARGE'

    // Form inputs
    const [cardNumber, setCardNumber] = useState('4532015112830366');
    const [expirationDate, setExpirationDate] = useState('12/28');
    const [cvv, setCvv] = useState('123');
    const [rechargeAmount, setRechargeAmount] = useState('50.00');

    useEffect(() => {
        fetchBalance();
    }, []);

    const handlePurchaseCard = async () => {
        if (!cardNumber || !expirationDate || !cvv) {
            Alert.alert('Campos Incompletos', 'Por favor ingresa todos los datos de la tarjeta bancaria.');
            return;
        }

        if (!isValidLuhn(cardNumber)) {
            Alert.alert('Tarjeta Inválida', 'El número de tarjeta no cumple el algoritmo de Luhn.');
            return;
        }

        const res = await purchaseCard(cardNumber.trim(), expirationDate.trim(), cvv.trim());
        if (res.success) {
            Alert.alert('¡Tarjeta Adquirida!', `${res.message}\nSe han acreditado 5 viajes de cortesía a tu cuenta.`);
        } else {
            Alert.alert('Error', res.message);
        }
    };

    const handleRecharge = async () => {
        if (!cardNumber || !expirationDate || !cvv || !rechargeAmount) {
            Alert.alert('Campos Incompletos', 'Ingresa los datos bancarios y el monto a recargar.');
            return;
        }

        if (!isValidLuhn(cardNumber)) {
            Alert.alert('Tarjeta Inválida', 'El número de tarjeta no pasa la verificación Luhn.');
            return;
        }

        const amt = parseFloat(rechargeAmount);
        if (isNaN(amt) || amt <= 0) {
            Alert.alert('Monto Inválido', 'El monto a recargar debe ser un número positivo.');
            return;
        }

        const res = await rechargeWallet(cardNumber.trim(), expirationDate.trim(), cvv.trim(), amt);
        if (res.success) {
            Alert.alert('¡Recarga Exitosa!', `${res.message}\nTu nuevo saldo es de Q${(balance + amt).toFixed(2)}.`);
        } else {
            Alert.alert('Error', res.message);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header Wallet Card */}
            <View style={styles.walletHeader}>
                <Text style={styles.headerLabel}>Billetera Digital Ciudadana</Text>
                <Text style={styles.balanceText}>Q{balance !== null ? balance.toFixed(2) : '0.00'}</Text>
                <View style={styles.tripsRow}>
                    <Text style={styles.tripsLabel}>Viajes de Cortesía:</Text>
                    <Text style={styles.tripsBadge}>{courtesyTrips} viajes disponibles</Text>
                </View>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'PURCHASE' && styles.tabItemActive]}
                    onPress={() => setActiveTab('PURCHASE')}
                >
                    <Text style={[styles.tabText, activeTab === 'PURCHASE' && styles.tabTextActive]}>Comprar Tarjeta (Q20)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'RECHARGE' && styles.tabItemActive]}
                    onPress={() => setActiveTab('RECHARGE')}
                >
                    <Text style={[styles.tabText, activeTab === 'RECHARGE' && styles.tabTextActive]}>Recargar Saldo</Text>
                </TouchableOpacity>
            </View>

            {/* Form Section */}
            <View style={styles.card}>
                <Text style={styles.formTitle}>
                    {activeTab === 'PURCHASE' ? 'Adquisición de Tarjeta Ciudadana' : 'Pasarela de Recarga Virtual'}
                </Text>

                <Text style={styles.label}>Número de Tarjeta (16 Dígitos - Algoritmo Luhn)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="4532 0151 1283 0366"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    keyboardType="numeric"
                />

                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Expira (MM/YY)</Text>
                        <TextInput style={styles.input} placeholder="12/28" value={expirationDate} onChangeText={setExpirationDate} />
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>CVV</Text>
                        <TextInput style={styles.input} placeholder="123" value={cvv} onChangeText={setCvv} keyboardType="numeric" secureTextEntry />
                    </View>
                </View>

                {activeTab === 'RECHARGE' && (
                    <View style={styles.amountSection}>
                        <Text style={styles.label}>Monto a Recargar (Q)</Text>
                        <View style={styles.amountPresets}>
                            {['10.00', '20.00', '50.00', '100.00'].map((amt) => (
                                <TouchableOpacity
                                    key={amt}
                                    style={[styles.amountChip, rechargeAmount === amt && styles.amountChipActive]}
                                    onPress={() => setRechargeAmount(amt)}
                                >
                                    <Text style={[styles.amountChipText, rechargeAmount === amt && styles.amountChipTextActive]}>Q{amt}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Monto personalizado"
                            value={rechargeAmount}
                            onChangeText={setRechargeAmount}
                            keyboardType="numeric"
                        />
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.payButton, loading && styles.btnDisabled]}
                    onPress={activeTab === 'PURCHASE' ? handlePurchaseCard : handleRecharge}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.payButtonText}>
                            {activeTab === 'PURCHASE' ? 'Pagar Q20.00 y Emitir Tarjeta' : `Recargar Q${rechargeAmount}`}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { padding: 16 },
    walletHeader: {
        backgroundColor: '#1801A9',
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#1801A9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    headerLabel: { color: '#CBD5E1', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    balanceText: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', marginVertical: 8 },
    tripsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    tripsLabel: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' },
    tripsBadge: { backgroundColor: '#4CB500', color: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '800' },
    tabBar: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 14, padding: 4, marginBottom: 16 },
    tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    tabItemActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    tabTextActive: { color: '#1801A9' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
    formTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
    label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
    input: { backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#0F172A', marginBottom: 14, borderWidth: 1, borderColor: '#CBD5E1' },
    row: { flexDirection: 'row', gap: 12 },
    col: { flex: 1 },
    amountSection: { marginTop: 4 },
    amountPresets: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    amountChip: { flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 8, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1' },
    amountChipActive: { backgroundColor: '#4CB500', borderColor: '#4CB500' },
    amountChipText: { fontSize: 12, fontWeight: '800', color: '#334155' },
    amountChipTextActive: { color: '#FFFFFF' },
    payButton: { backgroundColor: '#1801A9', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
    btnDisabled: { opacity: 0.6 },
    payButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' }
});
