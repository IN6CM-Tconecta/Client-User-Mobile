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

export const RegisterScreen = ({ navigation }) => {
    const [cui, setCui] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, loading } = useAuthStore();

    const handleRegister = async () => {
        if (!cui.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
            return;
        }

        if (cui.trim().length !== 13) {
            Alert.alert('CUI Inválido', 'El CUI debe contener exactamente 13 dígitos.');
            return;
        }

        const res = await register(cui.trim(), email.trim(), password.trim());
        if (!res.success) {
            Alert.alert('Error de Registro', res.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Crear Cuenta Ciudadana</Text>
                    <Text style={styles.subtitle}>Forma parte de la red T-Conecta</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>CUI / DPI (13 Dígitos)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej. 2000000000002"
                        value={cui}
                        onChangeText={setCui}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Correo Electrónico</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
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
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Registrarme</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginText}>
                            ¿Ya tienes cuenta? <Text style={styles.loginBold}>Inicia sesión</Text>
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
        marginBottom: 24
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1801A9',
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
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
        backgroundColor: '#1801A9',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#1801A9',
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
    loginLink: {
        marginTop: 20,
        alignItems: 'center'
    },
    loginText: {
        fontSize: 14,
        color: '#64748B'
    },
    loginBold: {
        color: '#4CB500',
        fontWeight: '700'
    }
});
