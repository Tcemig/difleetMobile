import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function HomeScreen() {

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Home Page</Text>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});