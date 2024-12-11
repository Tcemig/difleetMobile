import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { NavigationContainer, DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';

import HomeScreen from '@/app/(tabs)/home';
import ProcurementScreen from '@/app/(tabs)/procurement';
import AccountInformationScreen from '@/app/(tabs)/accountInformation';
import LoginScreen from './login';
import VehicleIncidentsScreen from '@/app/(tabs)/vehicleIncidents';
import CurrentAssignedVehiclesScreen from './(tabs)/currentAssignedVehicles';
import PreTripCovInspectionDriverEntry from './(tabs)/preTripCovInspectionDriverEntry';

export {
    ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
    initialRouteName: 'login',
};

SplashScreen.preventAutoHideAsync();

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function CustomDrawerContent({ navigation }: DrawerContentComponentProps) {
    const [permissions, setPermissions] = useState<any>(null);

    useEffect(() => {
        const fetchPermissions = async () => {
            const storedPermissions = await AsyncStorage.getItem('userPermissions');
            if (storedPermissions) {
                setPermissions(JSON.parse(storedPermissions));
            }
        };

        fetchPermissions();
    }, []);

    const hasRequiredPermissions = (...requiredPermissions: string[]) => {
        if (!permissions) return false;
        return requiredPermissions.some(permission => permissions[permission]);
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        navigation.reset({
            index: 0,
            routes: [{ name: 'login' }],
        });
    };

    return (
        <View style={styles.menu}>
            {hasRequiredPermissions('is_activePermissions') && (
                <TouchableOpacity onPress={() => navigation.closeDrawer()}>
                    <Text style={styles.menuItem} onPress={() => navigation.navigate('Home')}>Home</Text>
                </TouchableOpacity>
            )}

            {hasRequiredPermissions('is_staff', 'is_superuser') && (
                <TouchableOpacity onPress={() => navigation.closeDrawer()}>
                    <Text style={styles.menuItem} onPress={() => navigation.navigate('Procurement')}>Procurement</Text>
                </TouchableOpacity>
            )}

            {hasRequiredPermissions('is_staff', 'is_superuser') && (
                <TouchableOpacity onPress={() => navigation.closeDrawer()}>
                    <Text style={styles.menuItem} onPress={() => navigation.navigate('Vehicle Incidents')}>Vehicle Incidents</Text>
                </TouchableOpacity>
            )}

            {hasRequiredPermissions('is_staff', 'is_superuser', 'is_manager', 'is_dispatcher') && (
                <TouchableOpacity onPress={() => navigation.closeDrawer()}>
                    <Text style={styles.menuItem} onPress={() => navigation.navigate('Current Assigned Vehicles')}>Current Assigned Vehicles</Text>
                </TouchableOpacity>
            )}

            {hasRequiredPermissions('is_covDriver', 'is_ggDriver') && (
                <TouchableOpacity onPress={() => navigation.closeDrawer()}>
                    <Text style={styles.menuItem} onPress={() => navigation.navigate('Pre Trip COV Inspection Driver Entry')}>Pre Trip Inspection</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.closeDrawer()}>
                <Text style={styles.menuItem} onPress={() => navigation.navigate('Account Information')}>Account Info</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.menuItem}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

function TabLayout() {
    const colorScheme = useColorScheme();
    const [permissions, setPermissions] = useState<any>(null);

    useEffect(() => {
        const fetchPermissions = async () => {
            const storedPermissions = await AsyncStorage.getItem('userPermissions');
            if (storedPermissions) {
                setPermissions(JSON.parse(storedPermissions));
            }
        };

        fetchPermissions();
    }, []);

    const hasRequiredPermissions = (...requiredPermissions: string[]) => {
        if (!permissions) return false;
        return requiredPermissions.every(permission => permissions[permission]);
    };

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
                    hasRequiredPermissions('is_activePermissions') ? (
                        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                            <Image
                                source={require('../assets/images/diLogo_small.png')}
                                style={styles.headerIcon}
                            />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => navigation.navigate('Account Information')}>
                            <Image
                                source={require('../assets/images/diLogo_small.png')}
                                style={styles.headerIcon}
                            />
                        </TouchableOpacity>
                    )
                ),
            })}
        >
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="Procurement" component={ProcurementScreen} />
            <Drawer.Screen name="Vehicle Incidents" component={VehicleIncidentsScreen} />
            <Drawer.Screen name="Current Assigned Vehicles" component={CurrentAssignedVehiclesScreen} />
            <Drawer.Screen name="Pre Trip COV Inspection Driver Entry" component={PreTripCovInspectionDriverEntry} />
            <Drawer.Screen name="Account Information" component={AccountInformationScreen} />
            

        </Drawer.Navigator>
    );
}

export default function RootLayout() {
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font,
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <RootLayoutNav />
    );
}

function RootLayoutNav() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack.Navigator initialRouteName="login">
                <Stack.Screen 
                    name="login" 
                    component={LoginScreen} 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="(tabs)" 
                    component={TabLayout} 
                    options={{ headerShown: false }} 
                />
            </Stack.Navigator>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    menu: {
        flex: 1,
        width: '100%',
        backgroundColor: '#f0f0f0',
        padding: 20,
        paddingTop: 60,
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