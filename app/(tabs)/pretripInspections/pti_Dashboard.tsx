import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Alert, ScrollView, Dimensions, View, Modal, TouchableOpacity, ActivityIndicator, useColorScheme, Switch, Keyboard, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text} from '@/components/Themed';
import NGROK_URL from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import { CheckBox } from 'react-native-elements';
// import CheckBox from '@react-native-community/checkbox';

interface pretripInspectionItems {
    id: number;
    vehicleId: string | null;
    hub: string | null;
    inspectionDateTime: string | null;
    inspectionDateTimeUTC: string | null;
    userUsernameSubmitted: string | null;
    conditionTires: string | null;
    conditionFrontBumper: string | null;
    conditionRearBumper: string | null;
    conditionSideMirrors: string | null;
    conditionBrakes: string | null;
    conditionWindshield: string | null;
    conditionWorkingLights: boolean;
    conditionAccidentPacket: boolean;
    conditionInterior: string | null;
    conditionPhoneMount: boolean;
    conditionSpareTire: boolean;
    packetFile: string | null;
    vehicleDamageImages: string[] | null;
    inspectionIntTimeStamp: number | null;
    conditionAccidentPacketNotes: string | null;
    ConditionBrakesNotes: string | null;
    conditionFrontBumperNotes: string | null;
    conditionRearBumperNotes: string | null;
    conditionInteriorNotes: string | null;
    conditionPhoneMountNotes: string | null;
    conditionSideMirrorsNotes: string | null;
    conditionSpareTireNotes: string | null;
    conditionWindshieldNotes: string | null;
    conditionWorkingLightsNotes: string | null;
    conditionTiresNotes: string | null;
    conditionBodyDamageNotes: string | null;
    conditionBodyDamage: string | null;
    vehicleGrounded: boolean | null;
    vehicleGroundedNotes: string | null;
    vehicleUngroundedBy: string | null;
    geolocationData: string | null;
    timeOnPage: number | null;
}

const pretripInspectionItemsKeys: Array<keyof pretripInspectionItems> = [
    'id', 'vehicleId', 'hub', 'inspectionDateTime', 'inspectionDateTimeUTC', 'userUsernameSubmitted',
    'conditionTires', 'conditionFrontBumper', 'conditionRearBumper', 'conditionSideMirrors',
    'conditionBrakes', 'conditionWindshield', 'conditionWorkingLights', 'conditionAccidentPacket',
    'conditionInterior', 'conditionPhoneMount', 'conditionSpareTire', 'packetFile',
    'vehicleDamageImages', 'inspectionIntTimeStamp', 'conditionAccidentPacketNotes',
    'ConditionBrakesNotes', 'conditionFrontBumperNotes', 'conditionRearBumperNotes',
    'conditionInteriorNotes', 'conditionPhoneMountNotes', 'conditionSideMirrorsNotes',
    'conditionSpareTireNotes', 'conditionWindshieldNotes', 'conditionWorkingLightsNotes',
    'conditionTiresNotes', 'conditionBodyDamageNotes', 'conditionBodyDamage', 'vehicleGrounded',
    'vehicleGroundedNotes', 'vehicleUngroundedBy', 'geolocationData', 'timeOnPage'
];

export default function PreTripInspection_DashboardScreen() {
    const [loading, setLoading] = useState<boolean>(true);
    const [groundedVehicles, setGroundedVehicles] = useState<pretripInspectionItems[]>([]);
    const [totalVehicleCount, setTotalVehicleCount] = useState<number>(0);
    const [current_day_inspections_count, setCurrent_day_inspections_count] = useState<number>(0);
    const [selectedInspectionId, setSelectedInspectionId] = useState<pretripInspectionItems | null>(null);
    const [showGroundedVehicleModal, setShowGroundedVehicleModal] = useState<boolean>(false);
    const [isUngroundChecked, setIsUngroundChecked] = useState<boolean>(false);
    const [ungroundNotes, setUngroundNotes] = useState<string>('');


    const colorScheme = useColorScheme();
    const styles = StyleSheet.create({
        ...mainStyles,
        ...(colorScheme === 'light' ? lightStyles : darkStyles),
    });


    const fetchGroundedVehicles = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('User not authenticated');
            }
    
            const response = await fetch(`${NGROK_URL}/diMobileApp/api/preTripCovInspections/get_grounded_vehicles/`, {
                headers: {
                    'Authorization': `Token ${token}`, // Use 'Token' prefix instead of 'Bearer'
                },
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch grounded vehicles');
            }
    
            const data = await response.json();
            setGroundedVehicles(data.grounded_vehicles);
            // setTotalVehicleCount(data.total_vehicle_count);
            // setCurrent_day_inspections_count(data.current_day_inspections_count);
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            } else {
                Alert.alert('Error', 'An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchGroundedVehicles();
    }, []);

    const fetchInspectionNumbers = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('User not authenticated');
            }
    
            const response = await fetch(`${NGROK_URL}/diMobileApp/api/preTripCovInspections/get_inspection_numbers/`, {
                headers: {
                    'Authorization': `Token ${token}`, // Use 'Token' prefix instead of 'Bearer'
                },
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch grounded vehicles');
            }
    
            const data = await response.json();
            setTotalVehicleCount(data.total_vehicle_count);
            setCurrent_day_inspections_count(data.current_day_inspections_count);
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            } else {
                Alert.alert('Error', 'An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchInspectionNumbers();
    }, []);


    const handleVehiclePress = (vehicle: pretripInspectionItems) => {
        setSelectedInspectionId(vehicle);
        setShowGroundedVehicleModal(true);
    };

    const closeModal = () => {
        setShowGroundedVehicleModal(false);
        setSelectedInspectionId(null);
        setUngroundNotes('');
    };

    const closeKeyboard = () => {
        Keyboard.dismiss();
    };

    const submitUngroundVehicle = async () => {
        if (!setIsUngroundChecked || !ungroundNotes) {
            Alert.alert('Error', 'Please provide notes.');
            return;
        }
    
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('User not authenticated');
            }
    
            const response = await fetch(`${NGROK_URL}/diMobileApp/api/preTripCovInspections/unground_vehicle/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`, // Use 'Token' prefix instead of 'Bearer'
                    'Content-Type': 'application/json' // Add Content-Type header
                },
                body: JSON.stringify({ id: selectedInspectionId?.id, ungroundNotes: ungroundNotes }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to unground vehicle');
            }
    
            fetchGroundedVehicles();
            closeModal();
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            } else {
                Alert.alert('Error', 'An unknown error occurred');
            }
        }
    };




    return (
        <View style={styles.container}>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : totalVehicleCount ? (
                <View >
                    <Text>Todays Inspections / Total Vehicles: {current_day_inspections_count} / {totalVehicleCount}</Text>
                </View>
            ) : (
                <Text>No Data Pulled</Text>
            )}

            <Text style={styles.title}>Grounded Vehicles</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : groundedVehicles ? (
                <View>
                    <View style={styles.grid}>
                        {groundedVehicles.map((vehicle, index) => (
                            <TouchableOpacity
                                key={vehicle.id}
                                style={[
                                    styles.gridItem,
                                    (index + 1) % 3 === 0 && styles.gridItemLastInRow,
                                ]}
                                onPress={() => handleVehiclePress(vehicle)}
                            >
                                <Text style={styles.gridItemText}>{vehicle.vehicleId}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ) : (
                <Text>No grounded vehicles found</Text>
            )}






            {selectedInspectionId && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showGroundedVehicleModal}
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Grounded Vehicle</Text>
                            <Text style={[styles.modalTitle, {marginBottom: 20,}]}>{selectedInspectionId.vehicleId} - {selectedInspectionId.hub} - {selectedInspectionId.userUsernameSubmitted}</Text>
                            <Text style={[styles.modalText, {marginBottom: 10,}]}>
                                Grounded at: {selectedInspectionId.inspectionDateTimeUTC ? new Date(selectedInspectionId.inspectionDateTimeUTC).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true
                                }) : 'N/A'}
                            </Text>
                            <Text style={[styles.modalText, {marginBottom: 10,}]}>Reasons Vehicle Grounded</Text>
                            {selectedInspectionId.conditionTires === 'Repair' && (
                                <Text style={[styles.modalText, {marginBottom: 10,}]}>Tires: {selectedInspectionId.conditionTiresNotes}</Text>
                            )}


                            <Text style={[styles.modalText]}>Why is the vehicle being ungrounded?</Text>
                            <Text style={[styles.modalText, {marginBottom: 10,}]}>What steps will be taken to fix the problem?</Text>
                            
                            <View style={styles.grid}>
                                <TouchableOpacity onPress={() => setIsUngroundChecked(!isUngroundChecked)} style={[styles.gridItem, {width: '45%', marginBottom: 10, backgroundColor: isUngroundChecked ? 'green' : '#ccc', marginRight: 10,}]} >
                                    <Text style={styles.gridItemText}>Unground Vehicle</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={closeKeyboard} style={[styles.gridItem, {width: '45%', marginBottom: 10, marginLeft: 10,}]} >
                                    <Text style={styles.gridItemText}>Close Keyboard</Text>
                                </TouchableOpacity>
                            </View>
                            {/* <Button title="Unground Vehicle" onPress={() => setIsUngroundChecked(!isUngroundChecked)} /> */}
                            <TextInput
                                style={[
                                    styles.ungroundedNotesText,
                                    {
                                        width: '100%',
                                        height: 100,
                                        borderColor: 'gray',
                                        borderWidth: 1,
                                        borderRadius: 5,
                                        padding: 10,
                                        marginBottom: 20,
                                        backgroundColor: colorScheme === 'light' ? isUngroundChecked ? '#e0e0e0' : 'gray' : colorScheme === 'dark' ? isUngroundChecked ? '#333' : '#666' : 'white',
                                    },
                                ]}
                                multiline={true}
                                numberOfLines={4}
                                placeholder="Enter notes here..."
                                editable={isUngroundChecked}
                                value={ungroundNotes}
                                onChangeText={setUngroundNotes}
                            />

                            <View style={styles.grid}>
                                <TouchableOpacity onPress={submitUngroundVehicle} style={[styles.submitUngroundButton, {marginRight: 10,}]}>
                                    <Text style={styles.submitUngroundButtonText}>Submit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={closeModal} style={[styles.closeButton, {marginLeft: 10,}]}>
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const mainStyles = StyleSheet.create({
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    tableCell: {
        flex: 1,
        padding: 10,
        textAlign: 'center',
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '30%',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
    gridItemLastInRow: {
        marginRight: 0,
    },
    gridItemText: {
        textAlign: 'center',
        color: 'black',
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#2196F3',
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },

    submitUngroundButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'green',
        borderRadius: 5,
    },
    submitUngroundButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },

});

const lightStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        // justifyContent: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'black',
    },
    modalContent: {
        width: '95%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    modalText: {
        fontSize: 14,
        color: 'black',
    },

    ungroundedNotesText: {
        color: 'black',
    },
});

const darkStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        // justifyContent: 'center',
        padding: 20,
        backgroundColor: 'black',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'white',
    },
    modalContent: {
        width: '95%',
        padding: 20,
        backgroundColor: '#333',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
        color: 'white',
        textAlign: 'center',
    },
    modalText: {
        fontSize: 14,
        color: 'white',
    },

    ungroundedNotesText: {
        color: 'white',
    },
});