import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TextInput, Alert, ScrollView, Dimensions, View, Modal, TouchableOpacity, useColorScheme, RefreshControl } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text} from '@/components/Themed';
import NGROK_URL from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface currentAssignVehicleItem {
    hub: string;
    vehicleId: string;
    employeeAssigned: string | null;
    licensePlate: string;
    vehicleStatus: string;
}

const currentAssignVehicleItemKeys: Array<keyof currentAssignVehicleItem> = ['hub', 'vehicleId', 'employeeAssigned', 'licensePlate', 'vehicleStatus'];


export default function CurrentAssignedVehiclesScreen() {
    const [data, setData] = useState<currentAssignVehicleItem[]>([]);
    const [filteredData, setFilteredData] = useState<currentAssignVehicleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [permissions, setPermissions] = useState<any>(null);
    const [selectedHubs, setSelectedHubs] = useState<string[]>([]);
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);


    const [hubPermissions, setHubPermissions] = useState<{ [key: string]: boolean } | null>(null);
    const [refreshing, setRefreshing] = useState(false);


    const rowsPerPage = 100;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);


    const colorScheme = useColorScheme();
    const styles = StyleSheet.create({
        ...mainStyles,
        ...(colorScheme === 'light' ? lightStyles : darkStyles),
    });


    const onRefresh = () => {
        setRefreshing(true);
        setSelectedHubs(Object.keys(hubPermissions || {})); // Select all hubs by default
        fetchCurrentAssignedVehicles();
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

    const fetchCurrentAssignedVehicles = async (page = 1) => {

        if (selectedHubs.length === 0) {
            Alert.alert('Error', 'Please select at least one hub');
            setLoading(false);
            return;
        }

        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert('Error', 'No authorization token found');
            setLoading(false);
            return;
        }

        setLoading(true);

        fetch(`${NGROK_URL}/diMobileApp/api/procurement/get_vehicleData_Cav/?page=${page}&rowsPerPage=${rowsPerPage}&hubList=${selectedHubs.join(',')}`, {
            headers: {
                'Authorization': `Token ${token}`,
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setData(data.results);
                setFilteredData(data.results);
                setTotalPages(Math.ceil(data.count / rowsPerPage));
                setCurrentPage(page);
            })
            .catch((error) => Alert.alert('Error', error.message))
            .finally(() => setLoading(false));
    };
    
    // Track previous hubList to detect changes
    const previousHubListRef = useRef(selectedHubs);

    useEffect(() => {
        const previousHubList = previousHubListRef.current;

        // Check if the hubList (selectedHubs) has changed
        if ((JSON.stringify(previousHubList) !== JSON.stringify(selectedHubs) && (selectedHubs.length > 0))) {
            // Reset to page 1 and fetch data
            fetchCurrentAssignedVehicles(1);
        } else if (selectedHubs.length > 0) {
            // Fetch data for the current page (e.g., when navigating between pages)
            fetchCurrentAssignedVehicles(currentPage);
        }

        // Update the previous hubList reference
        previousHubListRef.current = selectedHubs;
    }, [selectedHubs, currentPage]);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(Dimensions.get('window').width);
        };

        const subscription = Dimensions.addEventListener('change', handleResize);
        return () => subscription?.remove();
    }, []);


    const handleHubSelection = (hub: string) => {
        setSelectedHubs(prevSelectedHubs => {
            if (prevSelectedHubs.includes(hub)) {
                return prevSelectedHubs.filter(h => h !== hub);
            } else {
                return [...prevSelectedHubs, hub];
            }
        });
    };



    const toggleSelectAll = () => {
        if (selectedHubs.length === Object.keys(hubPermissions || {}).length) {
            setSelectedHubs([]); // Deselect all
        } else {
            setSelectedHubs(Object.keys(hubPermissions || {})); // Select all
        }
    };

    useEffect(() => {
        const fetchPermissions = async () => {
            const storedPermissions = await AsyncStorage.getItem('userPermissions');
            if (storedPermissions) {
                setPermissions(JSON.parse(storedPermissions));
            }
        };

        fetchPermissions();
    }, []);


    const formatHeader = (header: string): string => {
            return header
                .replace(/([A-Z])/g, ' $1') // Add space before each capital letter
                .replace(/^./, str => str.toUpperCase()) // Capitalize the first letter
                .trim(); // Remove leading/trailing spaces
    };

    const renderTableHeader = () => (
        <View style={styles.tableRow}>
            {currentAssignVehicleItemKeys.map((key, index) => (
                <Text
                    key={`${key}-${index}`} // Ensure unique key
                    style={[
                        styles.tableHeader,
                        styles.tableCell,
                        index !== currentAssignVehicleItemKeys.length - 1 && styles.borderRight,
                    ]}
                >
                    {formatHeader(key)}
                </Text>
            ))}
        </View>
    );
    
    const renderTableRow = (item: currentAssignVehicleItem, rowIndex: number) => (
        <View key={`row-${rowIndex}`} style={styles.tableRow}>
            {currentAssignVehicleItemKeys.map((key, index) => (
                <View
                    key={`${key}-${rowIndex}-${index}`} // Ensure unique key
                    style={[
                        styles.tableCell,
                        index !== currentAssignVehicleItemKeys.length - 1 && styles.borderRight,
                    ]}
                >
                    <Text>
                        {item[key] !== undefined && item[key] !== null ? item[key].toString() : ''}
                    </Text>
                </View>
            ))}
        </View>
    );



    const hasRequiredPermissions = (...requiredPermissions: string[]) => {
        if (!permissions) return false;
        return requiredPermissions.some(permission => permissions[permission]);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    }

    return (
        <ScrollView
            contentContainerStyle={{flexGrow: 1}}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.container}>

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

                <View style={styles.paginationContainer}>
                    <TouchableOpacity
                        disabled={currentPage === 1}
                        onPress={() => handlePageChange(currentPage - 1)}
                    >
                        <Text style={styles.paginationButton}>Previous</Text>
                    </TouchableOpacity>
                    <Text style={styles.paginationText}>{`Page ${currentPage} of ${totalPages}`}</Text>
                    <TouchableOpacity
                        disabled={currentPage === totalPages}
                        onPress={() => handlePageChange(currentPage + 1)}
                    >
                        <Text style={styles.paginationButton}>Next</Text>
                    </TouchableOpacity>

                    {/* <View style={styles.titleContainer}>
                        <View style={{ flex: 1 }} /> */}
                        <TouchableOpacity style={styles.selectAllButton} onPress={toggleSelectAll}>
                            <Text style={styles.selectAllButtonText}>
                                {selectedHubs.length === Object.keys(hubPermissions || {}).length ? 'Deselect All' : 'Select All'}
                            </Text>
                        </TouchableOpacity>
                    {/* </View> */}
                </View>

                {loading ? (
                    <Text>Loading...</Text>
                ) : (
                    <ScrollView horizontal nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                        <View style={{ width: screenWidth * 2 }}>
                            {renderTableHeader()}
                            <ScrollView>
                                {filteredData && filteredData.length > 0 ? (
                                    filteredData.map((item, index) => renderTableRow(item, index))
                                ) : (
                                    <Text>No data available</Text>
                                )}
                            </ScrollView>
                        </View>
                    </ScrollView>
                )}

                
                

            </View>
        </ScrollView>

    );
}

const mainStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },

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

    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // marginTop: 5,
        marginBottom: 10,
    },
    paginationButton: {
        padding: 10,
        backgroundColor: '#007bff',
        color: '#fff',
        borderRadius: 5,
        textAlign: 'center',
    },
    paginationText: {
        fontSize: 16,
        paddingLeft: 10,
        paddingRight: 10,
    },

    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    tableHeader: {
        fontWeight: 'bold',
        backgroundColor: '#83B1FE',
        
    },
    tableCell: {
        flex: 1,
        padding: 10,
        width: 5, // Set a fixed width for each cell
        alignContent: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',
    },
    borderRight: {
        borderRightWidth: 1,
        borderRightColor: '#ccc',
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