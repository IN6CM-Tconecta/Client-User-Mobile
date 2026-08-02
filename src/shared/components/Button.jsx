import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const Button = ({ title, onPress, style, textStyle, ...props }) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} {...props}>
        <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#1801A9',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
