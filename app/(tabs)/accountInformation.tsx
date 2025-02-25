import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Button, Alert, ActivityIndicator, ScrollView, useColorScheme } from 'react-native';
import { Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NGROK_URL from '@/config';

type AccountInfo = {
    id: number;
    email: string;
    username: string;
    phone_number: string;
};

export default function AccountInformationScreen() {
    const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const colorScheme = useColorScheme();
    const styles = StyleSheet.create({
        ...mainStyles,
        ...(colorScheme === 'light' ? lightStyles : darkStyles),
    });

    useEffect(() => {
        fetchAccountInfo();
    }, []);

    const fetchAccountInfo = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('User not authenticated');
            }
    
            const response = await fetch(`${NGROK_URL}/diMobileApp/api/users/current_user_permissions_information/`, {
                headers: {
                    'Authorization': `Token ${token}`, // Use 'Token' prefix instead of 'Bearer'
                },
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch account information');
            }
    
            const data: AccountInfo = await response.json();
            setAccountInfo(data);
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            } else {
                Alert.alert('Error', 'An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : accountInfo ? (
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>Username</Text>
                        <Text style={styles.tableCell}>{accountInfo.username}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>Email</Text>
                        <Text style={styles.tableCell}>{accountInfo.email}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>Phone Number</Text>
                        <Text style={styles.tableCell}>{accountInfo.phone_number}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>Password</Text>
                        <Text style={styles.tableCell}>*******</Text>
                    </View>
                </View>
            ) : (
                <Text>No account information available.</Text>
            )}
            <View style={styles.separator_15} />
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>Permissions</Text>
                </View>
                <ScrollView horizontal>
                    <View style={styles.tableRow}>
                        {accountInfo && Object.entries(accountInfo)
                            .filter(([key, value]) => key.startsWith('is_') && value)
                            .map(([key]) => (
                                <Text key={key} style={styles.tableCell}>
                                    {key.replace('is_', '').replace('_', ' ').toUpperCase()}
                                </Text>
                            ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const mainStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
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
    separator_15: {
        marginVertical: 15,
        height: 1,
        width: '80%',
    },
});

const lightStyles = StyleSheet.create({
    table: {
        borderWidth: 1,
        borderColor: 'black',
        width: '100%',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: 'black',
    },
    tableCell: {
        flex: 1,
        padding: 10,
        borderRightWidth: 1,
        borderColor: 'black',
        textAlign: 'center', // Center text horizontally
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
        alignContent: 'center', // Center content vertically
    },
});

const darkStyles = StyleSheet.create({
    table: {
        borderWidth: 1,
        borderColor: 'white',
        width: '100%',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: 'white',
    },
    tableCell: {
        flex: 1,
        padding: 10,
        borderRightWidth: 1,
        borderColor: 'white',
        textAlign: 'center', // Center text horizontally
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
        alignContent: 'center', // Center content vertically
    },
});