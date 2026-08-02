import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Animated
} from 'react-native';
import { useWalletStore } from '../../../shared/store/walletStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { isValidLuhn } from '../../../shared/utils/luhn';
import { Ionicons } from '@expo/vector-icons';

export const WalletScreen = () => {
    const { balance, courtesyTrips, fetchBalance, purchaseCard, rechargeWallet, loading } = useWalletStore();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('RECHARGE'); // 'RECHARGE' | 'PURCHASE'
    const [isFlipped, setIsFlipped] = useState(false);

    // Form inputs
    const [cardNumber, setCardNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [rechargeAmount, setRechargeAmount] = useState('20');

    const flipAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchBalance();
    }, []);

    useEffect(() => {
        Animated.timing(flipAnim, {
            toValue: isFlipped ? 1 : 0,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [isFlipped]);

    const frontInterpolate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    const backInterpolate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '360deg']
    });

    const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
    const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }] };

    const formatCardNumber = (num) => {
        if (!num) return 'XXXX XXXX XXXX XXXX';
        const matches = num.match(/.{1,4}/g);
        return matches ? matches.join(' ') : 'XXXX XXXX XXXX XXXX';
    };

    const validateExpiration = (expDate) => {
        const [month, year] = expDate.split('/');
        if (!month || !year) return false;
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        const expMonth = parseInt(month, 10);
        const expYear = parseInt(year, 10);

        if (isNaN(expMonth) || isNaN(expYear) || expYear < currentYear || (expYear === currentYear && expMonth < currentMonth) || expMonth > 12 || expMonth < 1) {
            return false;
        }
        return true;
    };

    const handlePurchaseCard = async () => {
        if (!cardNumber || !expirationDate || !cvv) {
            Alert.alert('Campos Incompletos', 'Por favor ingresa todos los datos de la tarjeta bancaria.');
            return;
        }

        if (!isValidLuhn(cardNumber)) {
            Alert.alert('Tarjeta Inválida', 'Número de tarjeta inválido. Verifica los 16 dígitos.');
            return;
        }

        if (!validateExpiration(expirationDate)) {
            Alert.alert('Tarjeta Vencida', 'La tarjeta está vencida o la fecha es inválida.');
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
            Alert.alert('Tarjeta Inválida', 'Número de tarjeta inválido. Verifica los 16 dígitos.');
            return;
        }

        if (!validateExpiration(expirationDate)) {
            Alert.alert('Tarjeta Vencida', 'La tarjeta está vencida o la fecha es inválida.');
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

    const getCardIcon = () => {
        if (cardNumber.startsWith('4')) return <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900', fontStyle: 'italic' }}>VISA</Text>;
        if (cardNumber.match(/^5[1-5]/)) return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 20, height: 20, backgroundColor: '#EF4444', borderRadius: 10, marginRight: -8, zIndex: 2 }} />
                <View style={{ width: 20, height: 20, backgroundColor: '#EAB308', borderRadius: 10, zIndex: 1 }} />
            </View>
        );
        return <Ionicons name="card" size={24} color="rgba(255,255,255,0.6)" />;
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header Wallet Card */}
            <View style={styles.walletHeader}>
                <Text style={styles.headerLabel}>Billetera Ciudadana T-Conecta</Text>
                <Text style={styles.balanceSubtext}>Saldo Disponible</Text>
                <Text style={styles.balanceText}>Q{balance !== null ? balance.toFixed(2) : '0.00'}</Text>
                <View style={styles.tripsRow}>
                    <Text style={styles.tripsLabel}>Viajes de Cortesía:</Text>
                    <Text style={styles.tripsBadge}>{courtesyTrips} viajes disponibles</Text>
                </View>

                {/* 3D Animated Card */}
                <View style={styles.cardContainer}>
                    <Animated.View style={[styles.creditCard, styles.creditCardFront, frontAnimatedStyle]}>
                        <View style={styles.cardTopRow}>
                            <Text style={styles.cardBrand}>T-CONECTA</Text>
                            {getCardIcon()}
                        </View>
                        <View style={styles.chip} />
                        <View style={styles.cardBottom}>
                            <Text style={styles.cardNumberText}>{formatCardNumber(cardNumber)}</Text>
                            <View style={styles.cardDetailsRow}>
                                <View>
                                    <Text style={styles.cardDetailLabel}>TITULAR</Text>
                                    <Text style={styles.cardDetailValue}>{user?.cui || 'USUARIO'}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.cardDetailLabel}>EXP</Text>
                                    <Text style={styles.cardDetailValue}>{expirationDate || 'MM/YY'}</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View style={[styles.creditCard, styles.creditCardBack, backAnimatedStyle]}>
                        <View style={styles.magneticStrip} />
                        <View style={styles.cvvStripContainer}>
                            <Text style={styles.signatureText}>Firma Autorizada</Text>
                            <View style={styles.cvvStrip}>
                                <Text style={styles.cvvText}>{cvv ? cvv.replace(/./g, '*') : '***'}</Text>
                            </View>
                        </View>
                        <Text style={styles.cardDisclaimer}>Esta tarjeta es emitida y administrada por T-Conecta. El uso de la misma se rige por los términos y condiciones vigentes.</Text>
                    </Animated.View>
                </View>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
                {/* Tab Switcher */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'RECHARGE' && styles.tabItemActive]}
                        onPress={() => setActiveTab('RECHARGE')}
                    >
                        <Text style={[styles.tabText, activeTab === 'RECHARGE' && styles.tabTextActive]}>Recargar Saldo Virtual</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'PURCHASE' && styles.tabItemActive]}
                        onPress={() => setActiveTab('PURCHASE')}
                    >
                        <Text style={[styles.tabText, activeTab === 'PURCHASE' && styles.tabTextActive]}>Adquirir Tarjeta Ciudadana</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formContent}>
                    {activeTab === 'RECHARGE' ? (
                        <>
                            <Text style={styles.formTitle}>Pasarela de Recarga Segura</Text>

                            <Text style={styles.label}>MONTO A RECARGAR (GTQ)</Text>
                            <View style={styles.amountPresets}>
                                {['10', '20', '50', '100'].map((amt) => (
                                    <TouchableOpacity
                                        key={amt}
                                        style={[styles.amountChip, rechargeAmount === amt && styles.amountChipActive]}
                                        onPress={() => setRechargeAmount(amt)}
                                    >
                                        <Text style={[styles.amountChipText, rechargeAmount === amt && styles.amountChipTextActive]}>Q{amt}.00</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Ingrese el monto"
                                value={rechargeAmount}
                                onChangeText={setRechargeAmount}
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>NÚMERO DE TARJETA DE CRÉDITO/DÉBITO</Text>
                            <TextInput
                                style={[styles.input, styles.monoInput]}
                                placeholder="4532 0151 1283 0366"
                                value={cardNumber}
                                onChangeText={setCardNumber}
                                keyboardType="numeric"
                                maxLength={16}
                            />

                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <Text style={styles.label}>EXPIRACIÓN (MM/YY)</Text>
                                    <TextInput style={[styles.input, styles.monoInput]} placeholder="12/28" value={expirationDate} onChangeText={setExpirationDate} maxLength={5} />
                                </View>
                                <View style={styles.col}>
                                    <Text style={styles.label}>CVV</Text>
                                    <TextInput 
                                        style={[styles.input, styles.monoInput]} 
                                        placeholder="123" 
                                        value={cvv} 
                                        onChangeText={setCvv} 
                                        keyboardType="numeric" 
                                        secureTextEntry 
                                        maxLength={4} 
                                        onFocus={() => setIsFlipped(true)}
                                        onBlur={() => setIsFlipped(false)}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.payButton, styles.greenBtn, loading && styles.btnDisabled]}
                                onPress={handleRecharge}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.payButtonText}>Acreditar Q{rechargeAmount}.00 a mi Billetera</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <View style={styles.benefitsCard}>
                                <Text style={styles.benefitsTitle}>Beneficios de la Tarjeta Ciudadana (Q20.00):</Text>
                                <Text style={styles.benefitsItem}>• Emisión de tarjeta virtual asociada a tu CUI.</Text>
                                <Text style={styles.benefitsItem}>• Acreditación inmediata de 5 viajes de cortesía.</Text>
                                <Text style={styles.benefitsItem}>• Acceso a torniquetes inteligentes de Transmetro y TuBus.</Text>
                            </View>

                            <Text style={styles.label}>NÚMERO DE TARJETA PARA PAGO</Text>
                            <TextInput
                                style={[styles.input, styles.monoInput]}
                                placeholder="4532 0151 1283 0366"
                                value={cardNumber}
                                onChangeText={setCardNumber}
                                keyboardType="numeric"
                                maxLength={16}
                            />

                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <Text style={styles.label}>EXPIRACIÓN (MM/YY)</Text>
                                    <TextInput style={[styles.input, styles.monoInput]} placeholder="12/28" value={expirationDate} onChangeText={setExpirationDate} maxLength={5} />
                                </View>
                                <View style={styles.col}>
                                    <Text style={styles.label}>CVV</Text>
                                    <TextInput 
                                        style={[styles.input, styles.monoInput]} 
                                        placeholder="123" 
                                        value={cvv} 
                                        onChangeText={setCvv} 
                                        keyboardType="numeric" 
                                        secureTextEntry 
                                        maxLength={4} 
                                        onFocus={() => setIsFlipped(true)}
                                        onBlur={() => setIsFlipped(false)}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.payButton, loading && styles.btnDisabled]}
                                onPress={handlePurchaseCard}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.payButtonText}>Comprar Tarjeta Ciudadana (Q20.00)</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { padding: 16 },
    walletHeader: {
        backgroundColor: '#1801A9',
        borderRadius: 24,
        padding: 24,
        paddingBottom: 32,
        marginBottom: 16,
        shadowColor: '#1801A9',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
        overflow: 'visible'
    },
    headerLabel: { color: '#4CB500', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
    balanceSubtext: { color: '#CBD5E1', fontSize: 13, marginTop: 4 },
    balanceText: { color: '#FFFFFF', fontSize: 42, fontWeight: '900', marginTop: 4, marginBottom: 12 },
    tripsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    tripsLabel: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' },
    tripsBadge: { backgroundColor: '#4CB500', color: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '800' },
    
    // 3D Card
    cardContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 190,
        width: '100%',
        marginTop: 10,
    },
    creditCard: {
        width: '95%',
        height: 190,
        backgroundColor: '#004e92',
        borderRadius: 16,
        position: 'absolute',
        backfaceVisibility: 'hidden',
        padding: 20,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    creditCardFront: {
        backgroundColor: '#004e92', // We could use linear-gradient if we install expo-linear-gradient, but solid is fine
    },
    creditCardBack: {
        backgroundColor: '#002b54',
        padding: 0,
        paddingVertical: 20,
    },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardBrand: { color: '#FFF', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
    chip: { width: 40, height: 30, backgroundColor: '#FBBF24', borderRadius: 6, opacity: 0.9, marginTop: 10, borderWidth: 1, borderColor: '#F59E0B' },
    cardBottom: { marginTop: 'auto' },
    cardNumberText: { color: '#E2E8F0', fontSize: 20, letterSpacing: 2, fontFamily: 'monospace', marginBottom: 8 },
    cardDetailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    cardDetailLabel: { color: '#94A3B8', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
    cardDetailValue: { color: '#F1F5F9', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

    // Back of Card
    magneticStrip: { width: '100%', height: 40, backgroundColor: 'rgba(0,0,0,0.8)', marginTop: 10 },
    cvvStripContainer: { paddingHorizontal: 20, width: '100%', marginTop: 16 },
    signatureText: { color: '#CBD5E1', fontSize: 9, fontWeight: '700', marginLeft: 4, marginBottom: 2 },
    cvvStrip: { width: '100%', height: 32, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 4, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 12 },
    cvvText: { color: '#000', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 14, fontStyle: 'italic', letterSpacing: 2 },
    cardDisclaimer: { color: '#94A3B8', fontSize: 7, paddingHorizontal: 20, textAlign: 'justify', marginTop: 12, lineHeight: 10 },

    // Form Section
    formContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
    tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    tabItem: { flex: 1, paddingVertical: 16, alignItems: 'center', backgroundColor: '#F8FAFC' },
    tabItemActive: { backgroundColor: '#F0FDF4', borderBottomWidth: 2, borderBottomColor: '#4CB500' },
    tabText: { fontSize: 11, fontWeight: '700', color: '#64748B', textAlign: 'center', paddingHorizontal: 10 },
    tabTextActive: { color: '#1801A9' },
    formContent: { padding: 20 },
    formTitle: { fontSize: 16, fontWeight: '800', color: '#1801A9', marginBottom: 20 },
    label: { fontSize: 10, fontWeight: '800', color: '#1801A9', marginBottom: 6 },
    input: { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#0F172A', marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    monoInput: { fontFamily: 'monospace', letterSpacing: 1 },
    row: { flexDirection: 'row', gap: 16 },
    col: { flex: 1 },
    amountPresets: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    amountChip: { flex: 1, backgroundColor: '#F8FAFC', paddingVertical: 10, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
    amountChipActive: { backgroundColor: '#1801A9', borderColor: '#1801A9' },
    amountChipText: { fontSize: 12, fontWeight: '800', color: '#334155' },
    amountChipTextActive: { color: '#FFFFFF' },
    payButton: { backgroundColor: '#1801A9', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
    greenBtn: { backgroundColor: '#4CB500' },
    btnDisabled: { opacity: 0.6 },
    payButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    benefitsCard: { backgroundColor: 'rgba(76, 181, 0, 0.1)', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(76, 181, 0, 0.3)' },
    benefitsTitle: { color: '#1801A9', fontWeight: '800', fontSize: 12, marginBottom: 8 },
    benefitsItem: { color: '#475569', fontSize: 11, marginBottom: 4 }
});
