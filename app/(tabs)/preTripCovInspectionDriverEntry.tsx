import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TextInput, Alert, ScrollView, Dimensions, View, Modal, TouchableOpacity, Button, Image, TouchableWithoutFeedback, useColorScheme, ActivityIndicator,  } from 'react-native';
// import { launchCamera } from 'react-native-image-picker';
// import { Picker } from '@react-native-picker/picker';
import { Text} from '@/components/Themed';
import NGROK_URL from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker'; // Install this package if not already installed
import DropDownPicker from 'react-native-dropdown-picker';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import { blue } from 'react-native-reanimated/lib/typescript/Colors';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
// import { launchImageLibrary } from 'react-native-image-picker';
import * as FileSystem from 'expo-file-system';
import Svg, { Circle, Image as SvgImage } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
// import RNFS from 'react-native-fs';
import FormData from 'form-data';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
// import axios from 'axios';
import * as Location from 'expo-location';



interface InspectionReport {
    id: number;
    vehicleId: string | null;
    vehicleVin: string | null;
    vehicleLicensePlate: string | null;
    hub: string | null;
    packetFile?: string;
    vehicleDamageImage: string | null;
    inspectionDateTime: string | null;
    inspectionDateTimeUTC: string | null;
    userUsernameSubmitted: string | null;
    pgl_corrected: boolean | null;
    callbackURL: string | null;

    timeOnPage: number | null; // Corrected from Float to number
    geolocationData: Record<string, unknown> | null; // Corrected from JSON to Record<string, unknown>

    conditionTires: string;
    conditionTiresNotes: string;
    conditionFrontBumper: string;
    conditionFrontBumperNotes: string;
    conditionRearBumper: string;
    conditionRearBumperNotes: string;
    conditionSideMirrors: string;
    conditionSideMirrorsNotes: string;
    conditionBodyDamage: string;
    conditionBodyDamageNotes: string;
    conditionBrakes: string;
    conditionBrakesNotes: string;
    conditionWindshield: string;
    conditionWindshieldNotes: string;
    conditionWorkingLights: boolean | null;
    conditionWorkingLightsNotes: string | null;
    conditionAccidentPacket: boolean | null;
    conditionAccidentPacketNotes: string | null;
    conditionInterior: string;
    conditionInteriorNotes: string;
    conditionPhoneMount: boolean | null;
    conditionPhoneMountNotes: string | null;
    conditionSpareTire: boolean | null;
    conditionSpareTireNotes: string | null;
    conditionLeakingFluids: boolean | null;
    conditionLeakingFluidsNotes: string | null;

    adminGroundedNotes: string | null;
    adminGroundedBy: string | null;
    vehicleGrounded: boolean | null;
    vehicleGroundedNotes: string | null;
    vehicleUngroundedBy: string | null;
}

const inspectionReportItemKeys: Array<keyof InspectionReport> = [
    'vehicleId', 'vehicleVin', 'vehicleLicensePlate', 'hub', 'packetFile', 'vehicleDamageImage', 
    'inspectionDateTime', 'inspectionDateTimeUTC', 'userUsernameSubmitted', 'pgl_corrected',
    'callbackURL',

    'timeOnPage', 'geolocationData',

    'conditionTires', 'conditionTiresNotes', 'conditionFrontBumper', 'conditionFrontBumperNotes',
    'conditionRearBumper', 'conditionRearBumperNotes', 'conditionSideMirrors', 'conditionSideMirrorsNotes',
    'conditionBodyDamage', 'conditionBodyDamageNotes', 'conditionBrakes', 'conditionBrakesNotes',
    'conditionWindshield', 'conditionWindshieldNotes', 'conditionWorkingLights', 'conditionWorkingLightsNotes',
    'conditionAccidentPacket', 'conditionAccidentPacketNotes', 'conditionInterior', 'conditionInteriorNotes',
    'conditionPhoneMount', 'conditionPhoneMountNotes', 'conditionSpareTire', 'conditionSpareTireNotes',
    'conditionLeakingFluids', 'conditionLeakingFluidsNotes',

    'adminGroundedNotes', 'adminGroundedBy', 'vehicleGrounded', 'vehicleGroundedNotes', 'vehicleUngroundedBy'
];

type geoLocation = {
    latitude: number;
    longitude: number;
    timestamp: number;
};

export default function PreTripCovInspectionsDriverEntry() {
    const [modalVisible, setModalVisible] = useState(false);
    const [inspectionStartValue, setInspectionStartValue] = useState('');
    // const [isLoading, setIsLoading] = useState(true);

    // const [inspectionReportNewReport, setInspectionReportNewReport] = useState<InspectionReport | null>(null);

    const [inspectionReport, setInspectionReport] = useState<InspectionReport | null>({
        id: 1,
        vehicleId: null,
        vehicleVin: null,
        vehicleLicensePlate: null,
        hub: null,
        packetFile: FileSystem.documentDirectory + 'default_vanImage.png', // Default image path
        vehicleDamageImage: null,
        inspectionDateTime: null,
        inspectionDateTimeUTC: null,
        userUsernameSubmitted: null,
        pgl_corrected: null,
        callbackURL: null,

        timeOnPage: null,
        geolocationData: null,

        conditionTires: '',
        conditionTiresNotes: '',
        conditionFrontBumper: '',
        conditionFrontBumperNotes: '',
        conditionRearBumper: '',
        conditionRearBumperNotes: '',
        conditionSideMirrors: '',
        conditionSideMirrorsNotes: '',
        conditionBodyDamage: '',
        conditionBodyDamageNotes: '',
        conditionBrakes: '',
        conditionBrakesNotes: '',
        conditionWindshield: '',
        conditionWindshieldNotes: '',
        conditionWorkingLights: null,
        conditionWorkingLightsNotes: '',
        conditionAccidentPacket: null,
        conditionAccidentPacketNotes: '',
        conditionInterior: '',
        conditionInteriorNotes: '',
        conditionPhoneMount: null,
        conditionPhoneMountNotes: '',
        conditionSpareTire: null,
        conditionSpareTireNotes: '',
        conditionLeakingFluids: null,
        conditionLeakingFluidsNotes: '',

        adminGroundedNotes: '',
        adminGroundedBy: '',
        vehicleGrounded: null,
        vehicleGroundedNotes: '',
        vehicleUngroundedBy: '',
    });


    // const [oldInspectionReport, setOldInspectionReport] = useState(null);
    const [circlePositions, setCirclePositions] = useState<{ x: number, y: number }[]>([]);
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [photoUris, setPhotoUris] = useState<string[]>([]);
    const svgRef = useRef<Svg>(null);
    const viewRef = useRef(null);
    const [hubList, setHubList] = useState<string[]>([]); // Initialize as an empty array
    const [selectedHub, setSelectedHub] = useState<string>(''); // Default to an empty string

    const [refreshing, setRefreshing] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // Get the height of the screen
    const screenHeight = Dimensions.get('window').height * 0.76;

    const colorScheme = useColorScheme();
    const styles = StyleSheet.create({
        ...mainStyles,
        ...(colorScheme === 'light' ? lightStyles : darkStyles),
    });
    const placeholderTextColor = 
        colorScheme === 'light' ? 'black' : 'white';

    useEffect(() => {
        requestCameraPermission();
    }, []);

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required to take pictures.');
        }
    };

    // useEffect(() => {
    //     const checkForInspection = async () => {
    //         try {
    //             const token = await AsyncStorage.getItem('userToken');
    //             if (!token) {
    //                 Alert.alert('Error', 'No authorization token found');
    //                 return;
    //             }

    //             const response = await fetch(`${NGROK_URL}/diMobileApp/api/preTripCovInspections/check_for_preTripInspection/`, {
    //                 method: 'GET',
    //                 headers: {
    //                     'Authorization': `Token ${token}`,
    //                     'Content-Type': 'application/json'
    //                 }
    //             });

    //             const result = await response.json();
    //             if (response.ok) {
    //                 if (result.message === "No inspections report found") {
    //                     setModalVisible(true);
    //                 } else {
    //                     setInspectionReport(result.report);
    //                 }
    //             } else {
    //                 Alert.alert('Error', result.message);
    //             }
    //         } catch (error) {
    //             Alert.alert('Error', 'Failed to check for inspection report.');
    //         }
    //     };

    //     checkForInspection();
    // }, []);

    const handleGetHubList = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No authorization token found');
                return;
            }

            const response = await fetch(`${NGROK_URL}/diMobileApp/api/procurement/get_hub_list/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (response.ok && Array.isArray(data.hubList)) {

                setHubList(data.hubList);

                console.log('Hub List:', data.hubList);

                // Set the first hub as the default selected value if available
                if (data.hubList.length > 0) {
                    setSelectedHub(data.hubList[0]);
                }
            } else {
                Alert.alert('Error', data.message || 'Failed to get hub list');
            }
        } catch (error) {
            console.error('Error fetching hub list:', error); // Log the error for debugging
            Alert.alert('Error', 'An error occurred while getting the hub list');
        }
    };

    useEffect(() => {
        handleGetHubList();
    }, []);


    const handleStartInspection = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No authorization token found');
                return;
            }
    
            const response = await fetch(`${NGROK_URL}/diMobileApp/api/procurement/inspection_report_start_inspection_data/?inspectionstartvalue=${inspectionStartValue}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            const data = await response.json();
            if (response.ok && data.message === 'Vehicle is in the system') {
                // Alert.alert('Vehicle is in the system');
                setInspectionReport(data.report);
                setSelectedHub(data.report.hub);

                // Start tracking time and location
                startTrackingTime();
                // startTrackingLocation();
                
                setModalVisible(false);
            }
            else if (response.ok && data.message === 'Vehicle Id, License Plate, VIN; Not found in database try a different search parameter.') {
                Alert.alert('Vehicle Id, License Plate, VIN; Not found in database try a different search parameter.');
            }
            else if (response.ok && data.message === 'That vehicle is grounded. Please contact dispatcher to fix or complete inspection on another vehicle.') {
                Alert.alert('That vehicle is grounded. Please contact dispatcher to fix or complete inspection on another vehicle.');
            }
            else {
                Alert.alert('Error', data.message || 'Failed to start inspection');
            
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while starting the inspection');
        } 
        // finally {
        //     setModalVisible(false);
        // }
    };

    const handlePress = (event: any) => {
        const { locationX, locationY } = event.nativeEvent;

        // Check if a circle already exists at the clicked position
        const isPositionOccupied = circlePositions.some(
            position => Math.abs(position.x - locationX) < 10 && Math.abs(position.y - locationY) < 10
        );

        if (!isPositionOccupied) {
            setCirclePositions([...circlePositions, { x: locationX, y: locationY }]);
        }
    };

    const handleUndo = () => {
        setCirclePositions(circlePositions.slice(0, -1));
    };

    // const saveImageWithCircles = async () => {
    //     if (!svgRef.current || !inspectionReport?.packetFile) return;
    
    //     const svg = svgRef.current;
    //     svg.toDataURL((dataUrl: string) => {
    //         if (!dataUrl) {
    //             console.error('Failed to generate SVG data URL');
    //             return;
    //         }
    //         const base64Data = dataUrl.split(',')[1];
    //         if (!base64Data) {
    //             console.error('Failed to split SVG data URL');
    //             return;
    //         }
    //         const filePath = `${FileSystem.documentDirectory}/inspection_report.png`;
    //         FileSystem.writeAsStringAsync(filePath, base64Data, { encoding: FileSystem.EncodingType.Base64 })
    //             .then(() => {
    //                 setInspectionReport((prevReport) => 
    //                     prevReport ? { ...prevReport, packetFile: filePath } : prevReport
    //                 );
    //             })
    //             .catch((error) => {
    //                 console.error('Failed to write file', error);
    //             });
    //     });
    // };

    // useEffect(() => {
    //     saveImageWithCircles();
    // }, [circlePositions]);
    
    // useEffect(() => {
    //     // Load the default image when the component mounts
    //     const loadDefaultImage = async () => {
    //         const defaultImageUri = FileSystem.documentDirectory + 'default_image.png';
    //         const imageExists = await FileSystem.getInfoAsync(defaultImageUri);
    //         if (!imageExists.exists) {
    //             // Copy the default image from assets to the document directory
    //             const asset = require('../../assets/images/InspectionReport_vanImage.png');
    //             await FileSystem.copyAsync({
    //                 from: asset.uri,
    //                 to: defaultImageUri,
    //             });
    //         }
    //         setInspectionReport((prevReport) => 
    //             prevReport ? { ...prevReport, packetFile: defaultImageUri } : prevReport
    //         );
    //     };
    
    //     loadDefaultImage();
    // }, []);

    const handleTakePicture = async () => {
        if (circlePositions.length === 0) {
            Alert.alert('No Marked Damange', 'Please mark the damage locations first.');
            return;
        }
    
        if (photoUris.length >= 4) {
            Alert.alert('Limit Reached', 'You can only take up to 4 pictures.');
            return;
        }
    
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required to take pictures.');
            return;
        }
    
        const result = await ImagePicker.launchCameraAsync();
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotoUris([...photoUris, result.assets[0].uri]);
        }
    };
    
    const handleDeletePhoto = (uri: string) => {
        setPhotoUris(photoUris.filter(photoUri => photoUri !== uri));
    };

    const handleSaveInspection = async () => {
        try {
            // I want to get the current date and time
            const currentDateTime = new Date();
            const timestampUTC = Date.UTC(
                currentDateTime.getUTCFullYear(),
                currentDateTime.getUTCMonth(),
                currentDateTime.getUTCDate(),
                currentDateTime.getUTCHours(),
                currentDateTime.getUTCMinutes(),
                currentDateTime.getUTCSeconds(),
                currentDateTime.getUTCMilliseconds()
            );

            // Convert base64 to a file-like object
            // const blob = await fetch(packetFile).then(res => res.blob());

            const formData = new FormData();

            // Append all current inspectionReport data except packetFile
            for (const key in inspectionReport) {
                if (key !== "packetFile" && key !== "vehicleDamageImage") {
                    formData.append(key, inspectionReport[key as keyof InspectionReport] as string);
                }
            }

            // Retrieve the username and inspection report ID
            const username = await AsyncStorage.getItem('username'); // Assuming username is stored in AsyncStorage

            const token_ = await AsyncStorage.getItem('userToken');
            // const lastInspectionReportId = await axios.get(`${NGROK_URL}/diMobileApp/api/preTripCovInspections/pulling_last_preTripInspection_id/`, {
            //     headers: {
            //         'Authorization': `Token ${token_}`
            //     }
            // });

            let packetFile = null;

            if (circlePositions.length > 0) {
                const uri = await captureRef(viewRef, {
                    format: 'png',
                    quality: 1,
                });
    
                const base64Data = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                packetFile = `data:image/png;base64,${base64Data}`;

                const fileName = `${timestampUTC}_inspection_report.png`;

                formData.append('packetFile', {
                    uri: uri,
                    name: fileName,
                    type: 'image/png',
                });
            }   


            // Append Admin Grounded Vehicle Submission
            formData.append('AdminGroundedVehicleSubmission', true);

            // Append photos if they exist
            photoUris.slice(0, 4).forEach((photoUri, index) => {
                formData.append(`vehicleDamageImages`, {
                    uri: photoUri,
                    // name: `${inspectionReport?.vehicleId}/${username}/${timestamp}_photo${index + 1}.jpg`,
                    name: `${timestampUTC}_photo${index + 1}.jpg`,
                    type: 'image/jpeg',
                });
            });

            // Append time spent
            formData.append('timeSpent', timeSpent.toFixed(2)); // Converts to a string with 2 decimal places

            // Append geolocation data
            // formData.append('locationData', JSON.stringify(locationData));

    
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No authorization token found');
                return;
            }
    
            const response = await fetch(`${NGROK_URL}/diMobileApp/api/preTripCovInspections/submit_preTripInspection/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    // 'Content-Type': 'multipart/form-data' // Remove this line
                },
                body: formData as any,
            });
    
            const result = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Inspection report submitted successfully');
                setInspectionReport(null); // Reset the form after successful submission
                setCirclePositions([]); // Clear all circles
                setPhotoUris([]); // Clear all photos
            } else {
                Alert.alert('Error', result.message || 'Failed to submit inspection report');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to save inspection report.');
        }
    };

    let timeSpent = 0;
    let locationData: geoLocation[] = []; // Explicitly define the type of locationData

    const startTrackingTime = () => {
        timeSpent = 0;
        setInterval(() => {
            timeSpent += 1; // Increment time in seconds
        }, 1000);
    };

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Permission to access location was denied. Please enable it in your device settings.'
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error requesting location permission:', error);
            Alert.alert('Error', 'An error occurred while requesting location permissions.');
            return false;
        }
    };

    const startTrackingLocation = async () => {
        setIsLoading(true); // Show a loader while requesting permissions
        const hasPermission = await requestLocationPermission();
        setIsLoading(false); // Hide the loader after permission is handled
    
        if (!hasPermission) {
            return; // Exit if permission is not granted
        }
    
        // Start tracking location
        const locationInterval = setInterval(async () => {
            try {
                const location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;
                const timestamp = Date.now();
                locationData.push({ latitude, longitude, timestamp });
            } catch (error) {
                console.error('Error fetching location:', error);
            }
        }, 5000);
    };

    // Good Fair Repair Conditions
    const conditions = [
        { key: 'conditionTires', label: 'Tires', options: ['Good', 'Fair', 'Repair'] },
        { key: 'conditionFrontBumper', label: 'Front Bumper', options: ['Good', 'Fair', 'Repair'] },
        { key: 'conditionRearBumper', label: 'Rear Bumper', options: ['Good', 'Fair', 'Repair'] },
        { key: 'conditionSideMirrors', label: 'Side Mirrors', options: ['Good', 'Fair', 'Repair'] },
        { key: 'conditionBodyDamage', label: 'Body Damage', options: ['Good', 'Fair', 'Repair'] },
        { key: 'conditionBrakes', label: 'Brakes', options: ['Good', 'Fair', 'Repair'] },
        { key: 'conditionWindshield', label: 'Windshield', options: ['Good', 'Fair', 'Repair'] },
        { key: 'conditionInterior', label: 'Interior', options: ['Good', 'Fair', 'Repair'] },
    ];

    const booleanConditions = [
        { key: 'conditionWorkingLights', label: 'Working Lights', options: ['Yes', 'No'] },
        { key: 'conditionAccidentPacket', label: 'Accident Packet', options: ['Yes', 'No'] },
        { key: 'conditionPhoneMount', label: 'Phone Mount', options: ['Yes', 'No'] },
        { key: 'conditionSpareTire', label: 'Spare Tire', options: ['Yes', 'No'] },
        { key: 'conditionLeakingFluids', label: 'Leaking Fluids', options: ['Yes', 'No'] },
    ];


    useEffect(() => {
        console.log(inspectionReport);
    }, [inspectionReport]);


    return (
        <View 
            style={styles.container}
        >

            {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

            <TouchableOpacity style={{ borderWidth: 1, padding: 5, width: "50%", borderColor: '#ccc'}} onPress={() => setModalVisible(true)}>
                <Text style={{ textAlign: 'center', fontSize: 16, color: 'lightblue' }}>New Inspection Report</Text>
            </TouchableOpacity>


            <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', paddingBottom: 5 }}>Inspection Report</Text>
            </View>

            <View style={{ borderWidth: 2, maxHeight: screenHeight, paddingTop: 5, paddingBottom: 5, paddingLeft: 2, paddingRight: 2 }}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    

                    <View style={styles.inspectionReportRow}>
                        <Text style={styles.inspectionReportHeader}>Vehicle ID:</Text>
                        <TextInput
                            style={[styles.inspectionReportTextInput, { backgroundColor: '#B7B7B7' }]}
                            editable={false}
                            value={
                                    // inspectionReportNewReport?.vehicleId ?? 
                                    inspectionReport?.vehicleId ?? 
                                    ''
                                }
                        />
                    </View>

                    <View style={styles.inspectionReportRow}>
                        <Text style={styles.inspectionReportHeader}>VIN:</Text>
                        <TextInput
                            style={[styles.inspectionReportTextInput, { backgroundColor: '#B7B7B7' }]}
                            editable={false}
                            value={
                                // inspectionReportNewReport?.vehicleVin ??
                                inspectionReport?.vehicleVin ?? 
                                ''
                            }
                        />
                    </View>

                    <View style={styles.inspectionReportRow}>
                        <Text style={styles.inspectionReportHeader}>License Plate:</Text>
                        <TextInput
                            style={[styles.inspectionReportTextInput, { backgroundColor: '#B7B7B7' }]}
                            editable={false}
                            value={
                                // inspectionReportNewReport?.vehicleLicensePlate ??
                                inspectionReport?.vehicleLicensePlate ??
                                ''
                            }
                        />
                    </View>

                    <View style={styles.inspectionReportRow}>
                        <Text style={styles.inspectionReportHeader}>HUB:</Text>

                        {hubList.length > 0 ? (
                            <Picker
                                selectedValue={selectedHub}
                                onValueChange={(itemValue) => setSelectedHub(itemValue)}
                                style={styles.picker}
                                itemStyle={styles.pickerItem}
                            >
                                <Picker.Item label="Please select a hub" value="" />
                                {hubList.map((hub) => (
                                    <Picker.Item key={hub} label={hub} value={hub} />
                                ))}
                            </Picker>
                        ) : (
                            <Text>Loading hubs...</Text>
                        )}
                    </View>

                    <View style={styles.inspectionReportRow}>
                        <Text style={{ fontSize: 16, padding: 5}}>Vehicle Damages</Text>
                        <Button title="Undo" onPress={handleUndo} />
                        {/* <Button title="Select Image" onPress={handleImageSelect} /> */}
                    </View>

                    <TouchableWithoutFeedback onPress={handlePress}>
                        <View ref={viewRef}>
                            <Image
                                source={require('../../assets/images/InspectionReport_vanImage.png')}
                                style={styles.vanDamagePdfImage}
                            />
                            <Svg style={StyleSheet.absoluteFill}>
                                {circlePositions.map((position, index) => (
                                    <Circle
                                        key={index}
                                        cx={position.x}
                                        cy={position.y}
                                        r={10}
                                        stroke="red"
                                        strokeWidth={2}
                                        fill="transparent"
                                    />
                                ))}
                            </Svg>
                        </View>
                    </TouchableWithoutFeedback>

                    {/* <TouchableWithoutFeedback onPress={handlePress}>
                        <View>
                            <View>
                                <Image
                                    source={require('../../assets/images/InspectionReport_vanImage.png')}
                                    style={styles.vanDamagePdfImage}
                                />
                                {circlePositions.map((position, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.circle,
                                            { top: position.y - 10, left: position.x - 10 },
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    </TouchableWithoutFeedback> */}

                    <View style={styles.inspectionReportRow}>
                        <Button title="Take Picture(s)" onPress={handleTakePicture} />
                    </View>

                    {photoUris.length > 0 && (
                        <View style={styles.previewContainer}>
                            <Text style={styles.previewText}>Photo Previews:</Text>
                            <View style={styles.previewGridContainer}>
                                {photoUris.map((uri, index) => (
                                    <View key={index} style={styles.previewGridItem}>
                                        <Image source={{ uri }} style={styles.previewImage} />
                                        <Button title="Delete" onPress={() => handleDeletePhoto(uri)} />
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <View>
                        {conditions.map((condition) => (
                            <View key={condition.key} style={styles.conditionReportRow}>
                                <Text style={styles.conditionReportHeader}>{condition.label}:</Text>
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        {condition.options.map((option) => (
                                            <TouchableOpacity
                                                key={option}
                                                style={[
                                                    styles.conditionOptionButton,
                                                    inspectionReport?.[condition.key as keyof InspectionReport] === option && option === 'Good' && styles.conditionGood,
                                                    inspectionReport?.[condition.key as keyof InspectionReport] === option && option === 'Fair' && styles.conditionFair,
                                                    inspectionReport?.[condition.key as keyof InspectionReport] === option && option === 'Repair' && styles.conditionRepair,
                                                ]}
                                                onPress={() => setInspectionReport((prevReport) => 
                                                    prevReport ? { ...prevReport, [condition.key]: option } : prevReport
                                                )}
                                            >
                                                <Text style={styles.conditionOptionText}>{option}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <TextInput
                                            style={styles.conditionTextArea}
                                            multiline
                                            numberOfLines={4}
                                            placeholder="Add comments"
                                            value={String(inspectionReport?.[`${condition.key}Notes` as keyof InspectionReport] ?? '')}
                                            onChangeText={(text) => setInspectionReport((prevReport) => 
                                                prevReport ? { ...prevReport, [`${condition.key}Notes`]: text } : prevReport
                                            )}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View>
                        { booleanConditions.map((condition) => (
                            <View key={condition.key} style={styles.conditionReportRow}>
                                <Text style={styles.conditionReportHeader}>{condition.label}:</Text>
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        {condition.options.map((option) => (
                                            <TouchableOpacity
                                                key={option}
                                                style={[
                                                    styles.conditionOptionButton,
                                                    condition.key === 'conditionLeakingFluids'
                                                        ? inspectionReport?.[condition.key as keyof InspectionReport] === option && option === 'Yes' && styles.conditionRepair ||
                                                            inspectionReport?.[condition.key as keyof InspectionReport] === option && option === 'No' && styles.conditionGood
                                                        : inspectionReport?.[condition.key as keyof InspectionReport] === option && option === 'Yes' && styles.conditionGood ||
                                                            inspectionReport?.[condition.key as keyof InspectionReport] === option && option === 'No' && styles.conditionRepair,
                                                ]}
                                                onPress={() => setInspectionReport((prevReport) => 
                                                    prevReport ? { ...prevReport, [condition.key]: option } : prevReport
                                                )}
                                            >
                                                <Text style={styles.conditionOptionText}>{option}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <TextInput
                                            style={styles.conditionTextArea}
                                            multiline
                                            numberOfLines={4}
                                            placeholder="Add comments"
                                            value={String(inspectionReport?.[`${condition.key}Notes` as keyof InspectionReport] ?? '')}
                                            onChangeText={(text) =>
                                                setInspectionReport((prevReport) => {
                                                    if (!prevReport) return prevReport; // Ensure prevReport is not null
                                                    return {
                                                        ...prevReport,
                                                        [`${condition.key}Notes`]: text,
                                                    } as InspectionReport; // Explicitly cast to InspectionReport
                                                })
                                            }
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.inspectionReportRow}>
                        <Button title="Submit Inspection" onPress={handleSaveInspection} />
                    </View>

                </ScrollView>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <TouchableOpacity
                    style={styles.centeredView}
                    activeOpacity={1}
                    onPressOut={() => setModalVisible(false)}
                >
                    <View style={styles.modalView}>
                        <Text style={[styles.verifyVehicleText, { fontSize: 16, paddingBottom: 10, fontWeight: 'bold' }]}>No Inspection Report Submitted Today</Text>
                        <Text style={[styles.verifyVehicleText, { paddingBottom: 5 }]}>Please enter: <Text style={[styles.verifyVehicleText, { textDecorationLine: 'underline' }]}>Vehicle Id</Text>, <Text style={[styles.verifyVehicleText, { textDecorationLine: 'underline' }]}>VIN</Text>, or <Text style={[styles.verifyVehicleText, { textDecorationLine: 'underline' }]}>License Plate</Text></Text>
                        <Text style={[styles.verifyVehicleText, { paddingBottom: 15 }]}>Entry <Text style={[styles.verifyVehicleText, { fontWeight: 'bold' }]}>DOES NOT</Text> need to be case sensitive</Text>
                        <TextInput
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 15, width: 250, paddingHorizontal: 10, textAlign: 'center' }} // Set a fixed width
                            placeholder="Please enter...."
                            placeholderTextColor="black"
                            value={inspectionStartValue}
                            onChangeText={setInspectionStartValue}
                        />
                        <Button title="Start Inspection" onPress={handleStartInspection} />
                    </View>
                </TouchableOpacity>
            </Modal>

        </View>
    );
}

const mainStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    

    inspectionReportRow: {
        flexDirection: 'row', 
        padding: 5, 
        width: '100%', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    inspectionReportHeader: {
        fontSize: 16, 
        width: '50%', 
        // borderRightWidth: 2, 
        textAlign: 'center'
    },
    

    vanDamagePdfImage: {
        width: '100%',
        height: 235,
        alignSelf: 'center',
    },
    circle: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: 'red',
        backgroundColor: 'transparent',
    },

    
    previewText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    previewGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    previewGridItem: {
        width: '48%', // Adjust the width to fit two items per row with some spacing
        marginBottom: 10,
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: 100,
        marginBottom: 5,
        borderRadius: 5,
    },
    previewImageContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 10,
        width: '45%', // Adjust the width to fit two items per row
    },

    verifyVehicleText: {
        color: 'black',
    },


    conditionReportRow: {
        flexDirection: 'row', 
        padding: 5, 
        width: '100%', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    conditionReportHeader: {
        fontSize: 16, 
        width: '30%', 
        // borderRightWidth: 2, 
        textAlign: 'center'
    },
    
    
    conditionGood: {
        backgroundColor: 'green',
    },
    conditionFair: {
        backgroundColor: 'yellow',
    },
    conditionRepair: {
        backgroundColor: 'red',
    },

    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 40,
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
    },

    picker: {
        height: 40, // Ensure the Picker has a proper height
        width: '50%', // Set the width to fill the container
        justifyContent: 'center', // Center the text vertically
        overflow: 'hidden', // Hide the overflowing items
    },
    pickerItem: {
        textAlign: 'center', // Center the text horizontally
        fontSize: 16, // Adjust font size as needed
    },
});

const lightStyles = StyleSheet.create({
    modalView: {
        margin: 5,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },

    inspectionReportTextInput: {
        height: 40, 
        borderColor: 'gray', 
        borderWidth: 1, 
        width: '50%', 
        textAlign: 'center',
        color: 'black',
    },

    previewContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },

    conditionOptionButton: {
        padding: 6,
        borderWidth: 1,
        borderColor: 'gray',
        marginBottom: 5,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    conditionOptionText: {
        color: 'black',
    },
    conditionTextArea: {
        height: 100,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 5,
        color: 'black',
    },

    inspectionReportHubTextInput: {
        color: 'black',
    },

});

const darkStyles = StyleSheet.create({
    modalView: {
        margin: 5,
        backgroundColor: '#ccc',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },

    inspectionReportTextInput: {
        height: 40, 
        borderColor: '#ccc', 
        borderWidth: 1, 
        width: '50%', 
        textAlign: 'center',
        color: 'black',
    },

    previewContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#ccc',
        borderRadius: 5,
    },

    conditionOptionButton: {
        padding: 6,
        borderWidth: 1,
        borderColor: 'gray',
        marginBottom: 5,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    conditionOptionText: {
        color: 'white',
    },
    conditionTextArea: {
        height: 100,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 5,
        color: 'white',
    },

    inspectionReportHubTextInput: {
        color: 'white',
    },
});
