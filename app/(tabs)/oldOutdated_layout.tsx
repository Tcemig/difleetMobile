import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import AsyncStorage from '@react-native-async-storage/async-storage';


import HomeScreen from '@/app/(tabs)/home';
import ProcurementScreen from '@/app/(tabs)/procurement';
import AccountInformationScreen from '@/app/(tabs)/accountInformation';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
const Drawer = createDrawerNavigator();

function CustomDrawerContent({ navigation }: DrawerContentComponentProps) {
    const handleLogout = async () => {
        // Clear any authentication tokens or user data
        await AsyncStorage.removeItem('userToken');
        // Reset the navigation stack and navigate to the login screen
        navigation.reset({
            index: 0,
            routes: [{ name: 'login' }],
        });
    };

    return (
        <View style={styles.menu}>
            <TouchableOpacity onPress={() => navigation.closeDrawer()}>
                <Text style={styles.menuItem} onPress={() => navigation.navigate('Home')}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.closeDrawer()}>
                <Text style={styles.menuItem} onPress={() => navigation.navigate('Procurement')}>Procurement</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.closeDrawer()}>
                <Text style={styles.menuItem} onPress={() => navigation.navigate('AccoutInformation')}>Account Info</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.menuItem}>Logout</Text>
            </TouchableOpacity> 
        </View>
    );
}

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
    <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ navigation }) => ({
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 15 }}>
                    <FontAwesome name="bars" size={24} color={Colors[colorScheme ?? 'light'].text} />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Image
                        source={require('../../assets/images/diLogo_small.png')} // Use a relative path to the image
                        style={styles.headerIcon}
                    />
                </TouchableOpacity>
            ),
        })}
    >
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="Procurement" component={ProcurementScreen} />
            <Drawer.Screen name="AccountInformation" component={AccountInformationScreen} />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    menu: {
        flex: 1,
        width: '50%', // Set the width to 50% of the screen width
        backgroundColor: '#f0f0f0',
        padding: 20,
        paddingTop: 60, // Add padding at the top to lower the buttons
    },
    menuItem: {
        fontSize: 18,
        marginVertical: 10,
    },
    headerIcon: {
        width: 24,
        height: 24,
        marginRight: 15,
    },
});
