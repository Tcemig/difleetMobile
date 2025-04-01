import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Button, Alert, ScrollView, RefreshControl, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NGROK_URL from '@/config';
import { WebView } from 'react-native-webview';


export default function HomeScreen() {
    const [loading, setLoading] = useState<boolean>(true);
    const [permissions, setPermissions] = useState<{ [key: string]: boolean } | null>(null);
    const [hubPermissions, setHubPermissions] = useState<{ [key: string]: boolean } | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedHubs, setSelectedHubs] = useState<string[]>([]);
    const [vehicleData, setVehicleData] = useState<any>(null);
    
    // const [showWebView, setShowWebView] = useState(false); // State to control WebView visibility
    
    const colorScheme = useColorScheme();
    const styles = StyleSheet.create({
        ...mainStyles,
        ...(colorScheme === 'light' ? lightStyles : darkStyles),
    });

    const { height, width } = Dimensions.get('window'); // Get screen dimensions

    const onRefresh = () => {
        setRefreshing(true);
        setSelectedHubs(Object.keys(hubPermissions || {})); // Select all hubs by default
        fetchVehicleData();
    };

    useEffect(() => {
        const fetchPermissions = async () => {
            const storedPermissions = await AsyncStorage.getItem('userPermissions');
            if (storedPermissions) {
                setPermissions(JSON.parse(storedPermissions));
                const parsedPermissions = JSON.parse(storedPermissions);
                const filteredPermissions = Object.keys(parsedPermissions)
                    .filter(key => parsedPermissions[key] && key.startsWith('is_') && key.length === 6)
                    .reduce<{ [key: string]: boolean }>((obj, key) => {
                        const newKey = key.slice(3);
                        obj[newKey] = parsedPermissions[key];
                        return obj;
                    }, {});
                setHubPermissions(filteredPermissions);
                setSelectedHubs(Object.keys(filteredPermissions)); // Select all hubs by default
            }
        };

        fetchPermissions();
    }, []);

    const fetchVehicleData = async () => {
        if (selectedHubs.length === 0) {
            setVehicleData({
                numberVehicles: 0,
                deployedVehicles: 0,
                readyToDeployVehicles: 0,
                outOfServiceVehicles: 0,
                totaledVehicles: 0
            });
            setRefreshing(false);
            return;
        }

        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert('Error', 'No authorization token found');
            setLoading(false);
            return;
        }

        fetch(`${NGROK_URL}/diMobileApp/api/procurement/home_get_vehicle_data/?hubList=${selectedHubs.join(',')}`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch vehicle data');
                }
                return response.json();
            })
            .then((data) => {
                setVehicleData(data);
            })
            .catch((error) => Alert.alert('Error', error.message))
            .finally(() => setRefreshing(false));
    };

    useEffect(() => {
        fetchVehicleData();
    }, [selectedHubs]);

    const handleHubSelection = (hub: string) => {
        setSelectedHubs(prevSelectedHubs => {
            if (prevSelectedHubs.includes(hub)) {
                return prevSelectedHubs.filter(h => h !== hub);
            } else {
                return [...prevSelectedHubs, hub];
            }
        });
    };

    const hasRequiredPermissions = (...requiredPermissions: string[]) => {
        if (!permissions) return false;
        return requiredPermissions.some(permission => permissions[permission]);
    };

    const showHubInfo = () => {
        Alert.alert('Info', 'Select the HUBs you want to view numbers for. All HUBs are selected by default.');
    };

    const toggleSelectAll = () => {
        if (selectedHubs.length === Object.keys(hubPermissions || {}).length) {
            setSelectedHubs([]); // Deselect all
        } else {
            setSelectedHubs(Object.keys(hubPermissions || {})); // Select all
        }
    };

    return (
        <ScrollView
            contentContainerStyle={{flexGrow: 1}}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.container}>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Viewable Hubs</Text>
                    <TouchableOpacity style={styles.infoCircle} onPress={showHubInfo}>
                        <Text style={styles.infoText}>i</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={styles.selectAllButton} onPress={toggleSelectAll}>
                        <Text style={styles.selectAllButtonText}>
                            {selectedHubs.length === Object.keys(hubPermissions || {}).length ? 'Deselect All' : 'Select All'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 55, width: '100%' }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.hubContainer}>
                        {hubPermissions && Object.keys(hubPermissions).length > 0 ? (
                            Object.keys(hubPermissions).map((key) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.hubButton,
                                        selectedHubs.includes(key) && styles.selectedHubButton
                                    ]}
                                    onPress={() => handleHubSelection(key)}
                                >
                                    <Text style={styles.hubButtonText}>{key}</Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text>No Hubs to Select</Text>
                        )}
                    </ScrollView>
                </View>
            
                <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    {vehicleData ? (
                            <View>
                                <Text>Number of Vehicles: {vehicleData.numberVehicles}</Text>
                                <View style={styles.smallSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                                <Text>Deployed Vehicles: {vehicleData.deployedVehicles}</Text>
                                <View style={styles.smallSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                                <Text>Ready To Deploy Vehicles: {vehicleData.readyToDeployVehicles}</Text>
                                <View style={styles.smallSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                                <Text>Out of Service Vehicles: {vehicleData.outOfServiceVehicles}</Text>
                                <View style={styles.smallSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                                <Text>Totaled Vehicles: {vehicleData.totaledVehicles}</Text>
                            </View>
                        ) : (
                            <Text>Loading...</Text>
                        )
                    }
                </View>

                <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />







                {/* <View style={{ flex: 1 }}>
                    <TouchableOpacity onPress={() => setShowWebView(true)} style={styles.webButton}>
                        <Text style={styles.webButtonText}>Start Pre-Trip Inspection Link</Text>
                    </TouchableOpacity>
                </View>
                {showWebView && (
                    <View style={{ flex: 1, height, width }}>
                        <WebView
                            source={{ uri: 'https://www.difleet.com/operations/authenticate-to-pretrip-inspection-app?beansId=testeraccount02' }}
                            style={{ flex: 1 }}
                        />
                        <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                )} */}

            
            </View>
        </ScrollView>
    );
}

const mainStyles = StyleSheet.create({
    separator: {
        marginVertical: 10,
        height: 1,
        width: '80%',
    },
    smallSeparator: {
        marginVertical: 5,
        height: 1,
        width: '80%',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectAllButton: {
        marginLeft: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: 'gray',
        borderRadius: 5,
    },



    webButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'blue',
        borderRadius: 5,
        alignItems: 'center',
    },
    webButtonText: {
        color: 'white',
        fontSize: 16,
    },
    closeButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'red',
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

const lightStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'black',
    },
    infoCircle: {
        marginLeft: 10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'gray',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    selectAllButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    hubContainer: {
        flexDirection: 'row',
        marginVertical: 10,
    },
    hubButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginHorizontal: 5,
        backgroundColor: 'gray',
        borderRadius: 5,
    },
    selectedHubButton: {
        backgroundColor: 'blue',
    },
    hubButtonText: {
        color: 'white',
    },
});

const darkStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 20,
        backgroundColor: 'black',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'white',
    },
    infoCircle: {
        marginLeft: 10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'gray',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    selectAllButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    hubContainer: {
        flexDirection: 'row',
        marginVertical: 10,
    },
    hubButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginHorizontal: 5,
        backgroundColor: 'gray',
        borderRadius: 5,
    },
    selectedHubButton: {
        backgroundColor: 'blue',
    },
    hubButtonText: {
        color: 'white',
    },
});