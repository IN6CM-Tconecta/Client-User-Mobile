import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useAuthStore } from '../store/authStore';

export const LoginScreen = ({ navigation }) => {
    const [cui, setCui] = useState('2000000000002');
    const [password, setPassword] = useState('Usuario123!');
    const { login, loading } = useAuthStore();

    const handleLogin = async () => {
        if (!cui.trim() || !password.trim()) {
            Alert.alert('Campos requeridos', 'Por favor ingresa tu CUI y contraseña.');
            return;
        }

        const res = await login(cui.trim(), password.trim());
        if (!res.success) {
            Alert.alert('Error de Autenticación', res.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View className="header" style={styles.header}>
                    <View style={styles.logoBadge}>
                        <Text style={styles.logoText}>T</Text>
                    </View>
                    <Text style={styles.title}>T-Conecta Ciudadano</Text>
                    <Text style={styles.subtitle}>Movilidad Urbana Multimodal</Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Iniciar Sesión</Text>

                    <Text style={styles.label}>CUI / DPI</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej. 2000000000002"
                        value={cui}
                        onChangeText={setCui}
                        keyboardType="numeric"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Contraseña</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Ingresar</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.registerText}>
                            ¿No tienes cuenta? <Text style={styles.registerBold}>Regístrate aquí</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC'
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20
    },
    header: {
        alignItems: 'center',
        marginBottom: 30
    },
    logoBadge: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: '#1801A9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#1801A9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '900'
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1801A9',
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4CB500',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginTop: 4
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 20,
        textAlign: 'center'
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6
    },
    input: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#0F172A',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#CBD5E1'
    },
    button: {
        backgroundColor: '#4CB500',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#4CB500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4
    },
    buttonDisabled: {
        opacity: 0.6
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700'
    },
    registerLink: {
        marginTop: 20,
        alignItems: 'center'
    },
    registerText: {
        fontSize: 14,
        color: '#64748B'
    },
    registerBold: {
        color: '#1801A9',
        fontWeight: '700'
    }
});
