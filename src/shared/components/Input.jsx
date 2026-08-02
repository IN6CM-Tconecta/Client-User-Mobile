import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';

export const Input = ({ label, error, style, ...props }) => (
    <View style={style}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput style={[styles.input, error && styles.inputError]} {...props} />
        {error && <Text style={styles.error}>{error}</Text>}
    </View>
);

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    inputError: {
        borderColor: 'red',
    },
    error: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
});
