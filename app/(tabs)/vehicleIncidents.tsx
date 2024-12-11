import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Alert, ScrollView, Dimensions, View, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text} from '@/components/Themed';
import NGROK_URL from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface VehicleIncidentsItem {
    id: number;
    totalOosDays: number | null;
    dateReported: string | null;
    ossYesNo: string | null;
    ossDate: string | null;
    repairProcessNotes: string | null;
    status: string | null;
    reasonsOfWaiting: string | null;
    lastStatusUpdate: string | null;
    dateCompleted: string | null;
    lastUpdatedBy: string | null;
    reportedBy: string | null;
    hub: string | null;
    driverName: string | null;
    vehicleId: string | null;
    vehicleModel: string | null;
    vin: string | null;
    licensePlate: string | null;
    repairLocation: string | null;
    rlPh: string | null;
    rlContactName: string | null;
    incidentDescription: string | null;
    covRentalOther: string | null;
    vehicleIssueTracking: string | null;
    dashCamVideo: string | null;
    claimNumber: string | null;
    claimStatus: string | null;
    lastClaimStatusUpdate: string | null;
    claimNotes: string | null;
}

const vehicleIncidentsItemKeys: Array<keyof VehicleIncidentsItem> = [
    'id', 'totalOosDays', 'dateReported', 'ossYesNo', 'ossDate', 'repairProcessNotes', 'status',
    'reasonsOfWaiting', 'lastStatusUpdate', 'dateCompleted', 'lastUpdatedBy', 'reportedBy',
    'hub', 'driverName', 'vehicleId', 'vehicleModel', 'vin', 'licensePlate', 'repairLocation',
    'rlPh', 'rlContactName', 'incidentDescription', 'covRentalOther', 'vehicleIssueTracking',
    'dashCamVideo', 'claimNumber', 'claimStatus', 'lastClaimStatusUpdate', 'claimNotes',
];

export default function VehicleIncidentsScreen() {
    const [viData, setViData] = useState<VehicleIncidentsItem[]>([]);
    const [filteredData, setFilteredData] = useState<VehicleIncidentsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

    const [searchValue, setSearchValue] = useState('');
    const [selectedColumn, setSelectedColumn] = useState<{ label: string, value: keyof VehicleIncidentsItem }>({ label: "Vehicle ID", value: "vehicleId" });

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState<VehicleIncidentsItem | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const rowsPerPage = 50;

    const [showDatePicker, setShowDatePicker] = useState<{ [key: number]: boolean }>({});
    const [date, setDate] = useState(new Date());
    const [isAddMode, setIsAddMode] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const [hasSuccessfulResponse, setHasSuccessfulResponse] = useState(false);
    const [hasDebounced, setHasDebounced] = useState(false);


    useEffect(() => {
        const fetchVehicleIncidents = async (page=1) => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'User not authenticated');
                setLoading(false);
                return;
            }

            fetch(`${NGROK_URL}/diMobileApp/api/vehicleIncidents/get_vehicleIncidents_data/?page=${page}&limit=${rowsPerPage}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch vehicle incidents');
                    }
                    return response.json();
                })
                .then((json) => {
                    setViData(json.results);
                    setFilteredData(json.results);
                    setTotalPages(Math.ceil(json.count / rowsPerPage));
                    })
                    .catch((error) => Alert.alert('Error', error.message))
                    .finally(() => setLoading(false));
        };

        fetchVehicleIncidents(currentPage);

        const handleResize = () => {
            setScreenWidth(Dimensions.get('window').width);
        };

        const subscription = Dimensions.addEventListener('change', handleResize);

        return () => {
            subscription?.remove();
        };
    }, [currentPage]);

    useEffect(() => {
        const fetchSearchData = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'User not authenticated');
                setLoading(false);
                return;
            }

            fetch(`${NGROK_URL}/diMobileApp/api/vehicleIncidents/search_vehicleIncidents_data/?query=${searchValue}&column=${selectedColumn.value}&page=${currentPage}&limit=${rowsPerPage}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch vehicle incidents');
                    }
                    return response.json();
                })
                .then((json) => {
                    setViData(json.results);
                    setFilteredData(json.results);
                    setTotalPages(Math.ceil(json.count / rowsPerPage));
                })
                .catch((error) => Alert.alert('Error', error.message))
                .finally(() => setLoading(false));
        };
    
        fetchSearchData();
    }, [searchValue, selectedColumn, currentPage]);

    const fetchVehicleData = async (vehicleId: string) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No authorization token found');
                return null;
            }
    
            const response = await fetch(`${NGROK_URL}/diMobileApp/api/procurement/vi_get_vehicle_data/?vehicleId=${vehicleId}`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
    
            if (!response.ok) {
                setHasSuccessfulResponse(false);
                return null;
            } else {
                setHasSuccessfulResponse(true);
            }
    
            const data = await response.json();
            return data;
        } catch (error) {
            setHasSuccessfulResponse(false);
            return null;
        }
    };

    

    const formatHeader = (header: string): string => {
        return header
            .replace(/([A-Z])/g, ' $1') // Add space before each capital letter
            .replace(/^./, str => str.toUpperCase()) // Capitalize the first letter
            .trim(); // Remove leading/trailing spaces
    };

    const getStatusBackgroundColor = (status: string) => {
        switch (status) {
            case 'At Body Shop':
            case 'At Mechanic':
                return 'lightcoral';
            case 'Complete':
                return 'lightgreen';
            case 'Pending Payment':
                return 'lightskyblue';
            case 'Ready for Pickup':
                return 'lightgoldenrodyellow';
            case 'Reported':
                return 'beige';
            default:
                return 'white'; // Default background color
        }
    };

    const renderTableHeader = () => (
        <View style={styles.tableRow}>
            {vehicleIncidentsItemKeys.map((key, index) => (
                <Text key={key} style={[styles.tableHeader, styles.tableCell, index !== vehicleIncidentsItemKeys.length - 1 && styles.borderRight]}>
                    {formatHeader(key)}
                </Text>
            ))}
        </View>
    );

    const renderTableRow = (item: VehicleIncidentsItem) => (
        <TouchableOpacity
            key={item.id}
            onLongPress={() => {
                setSelectedRow(item);
                setModalVisible(true);
            }}
            delayLongPress={300}
        >
            <View style={[styles.tableRow, { backgroundColor: getStatusBackgroundColor(item.status || '') }]}>
                {vehicleIncidentsItemKeys.map((key, index) => (
                    <View key={key} style={[styles.tableCell, index !== vehicleIncidentsItemKeys.length - 1 && styles.borderRight]}>
                        <Text>{item[key] !== undefined && item[key] !== null ? item[key].toString() : ''}</Text>
                    </View>
                ))}
            </View>
        </TouchableOpacity>
    );

    const handleDateChange = (event: any, selectedDate: Date | undefined, itemId: number) => {
        setShowDatePicker({ ...showDatePicker, [itemId]: false });
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setDate(selectedDate);
            handleInputChange('dateReported', formattedDate);
        }
    };

    // 
    // const handleInputChange = (field: keyof VehicleIncidentsItem, value: string) => {
    //     if (selectedRow) {
    //         setSelectedRow({ ...selectedRow, [field]: value });
    //     }
    // };
    function debounce(func: (...args: any[]) => void, wait: number) {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    const handleInputChange = (key: keyof VehicleIncidentsItem, value: string) => {
        setSelectedRow(prevState => ({
            ...prevState,
            [key]: value
        } as VehicleIncidentsItem));
    
        if (key === 'vehicleId' && isAddMode) {
            setHasSuccessfulResponse(false); // Reset the flag when vehicleId changes
            setHasDebounced(false); // Reset the debounce flag
            debounceFetchVehicleData(value);
        }
    };
    
    const debounceFetchVehicleData = debounce(async (vehicleId: string) => {
        setHasDebounced(true); // Set the flag to true when debounce function executes
    
        const vehicleData = await fetchVehicleData(vehicleId);
        if (vehicleData) {
            setSelectedRow(prevState => ({
                ...prevState,
                hub: vehicleData.hub,
                driverName: vehicleData.driverName,
                vehicleModel: vehicleData.vehicleModel,
                vin: vehicleData.vin,
                licensePlate: vehicleData.licensePlate
            } as VehicleIncidentsItem));
            setHasSuccessfulResponse(true); // Set the flag to true on successful response
        } else {
            if (!hasSuccessfulResponse && hasDebounced) { // Only show error if no successful response has been received and debounce has executed
                Alert.alert('Error', 'Network response was not ok');
            }
        }
    }, 10000); // 10 seconds delay

    // handles saving the updated data to Procurement DB
    const handleSave = async () => {
        if (!selectedRow) return;
    
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert('Error', 'No authorization token found');
            return;
        }
    
        const url = selectedRow.id === 0
            ? `${NGROK_URL}/diMobileApp/api/vehicleIncidents/create_vehicleIncidents_data/`
            : `${NGROK_URL}/diMobileApp/api/vehicleIncidents/${selectedRow.id}/update_vehicleIncidents_data/`;
    
        const method = selectedRow.id === 0 ? 'POST' : 'PUT';
    
        fetch(url, {
            method: method,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(selectedRow),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((error) => {
                        throw new Error(JSON.stringify(error));
                    });
                }
                return response.json();
            })
            .then((updatedItem) => {
                if (selectedRow.id === 0) {
                    setViData([...viData, updatedItem]);
                    setFilteredData([...viData, updatedItem]);
                } else {
                    const updatedData = viData.map(item => item.id === updatedItem.id ? updatedItem : item);
                    setViData(updatedData);
                    setFilteredData(updatedData);
                }
                setModalVisible(false);
                Alert.alert('Success', 'Data saved successfully');
            })
            .catch((error) => {
                console.error('Error:', error.message);
                Alert.alert('Error', error.message);
            });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    }

    const handleSelectItem = (item: { label: string, value: keyof VehicleIncidentsItem }) => {
        setSelectedColumn(item);
        setDropdownVisible(false);
    };

    const pickerItems: { label: string; value: keyof VehicleIncidentsItem }[] = [
        { label: "Vehicle ID", value: "vehicleId" },
        { label: "Status", value: "status" },
        { label: "VIN", value: "vin" },
        { label: "License Plate", value: "licensePlate" },
        { label: "Hub", value: "hub" },
        { label: "Driver Name", value: "driverName" },
        { label: "Claim Number", value: "claimNumber" },
        { label: "Claim Status", value: "claimStatus" },
        { label: "Repair Location", value: "repairLocation" },
    ];

    const handleAddButtonPress = () => {
        setSelectedRow({
            id: 0,
            totalOosDays: null,
            dateReported: null,
            ossYesNo: null,
            ossDate: null,
            repairProcessNotes: null,
            status: null,
            reasonsOfWaiting: null,
            lastStatusUpdate: null,
            dateCompleted: null,
            lastUpdatedBy: null,
            reportedBy: null,
            hub: null,
            driverName: null,
            vehicleId: null,
            vehicleModel: null,
            vin: null,
            licensePlate: null,
            repairLocation: null,
            rlPh: null,
            rlContactName: null,
            incidentDescription: null,
            covRentalOther: null,
            vehicleIssueTracking: null,
            dashCamVideo: null,
            claimNumber: null,
            claimStatus: null,
            lastClaimStatusUpdate: null,
            claimNotes: null,
        });
        setIsAddMode(true);
        setModalVisible(true);
    };

    const handleOosButtonPress = () => {
        const filtered = viData.filter(item => item.ossYesNo === "Yes");
        setFilteredData(filtered);
    };

    const oosYesNoOptions = ['Yes', 'No'];

    const statusOptions = ['At Body Shop', 'At Mechanic', 'Complete', 'Pending Payment', 'Ready for Pickup', 'Reported'];

    const reasonsOfWaitingOptions = ['Completed', 'Delayed due to Parts', 'On scheduled processing time', 'Pending adjuster/appraiser', 'Pending insurance', 'Totaled - Waiting for Payment'];

    const covRentalOtherOptions = ['COV', 'Rental', 'Other'];

    const vehicleIssueTrackingOptions = ['Incident', 'Mechanical Issue', 'Vandalism'];

    const dashCamVideoOptions = ['Yes', 'No'];

    return (
        <View style={styles.container}>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    value={searchValue}
                    onChangeText={setSearchValue}
                />
                <View style={styles.pickerContainer}>
                    <TouchableOpacity
                        style={styles.picker}
                        onPress={() => setDropdownVisible(!dropdownVisible)}
                    >
                        <Text style={styles.pickerItem}>{selectedColumn.label}</Text>
                    </TouchableOpacity>
                    {dropdownVisible && (
                        <View style={styles.pickerDropdown}>
                            {pickerItems.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={styles.pickerDropdownItem}
                                    onPress={() => handleSelectItem(item)}
                                >
                                    <Text style={styles.pickerItem}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
                <View style={styles.arrowsContainer}>
                    <MaterialIcons name="arrow-drop-up" size={20} />
                    <MaterialIcons name="arrow-drop-down" size={20} />
                </View>
            </View>

            <View style={styles.addAndPaginationContainer}>

                <View style={styles.addButtonContainer}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddButtonPress}
                    >
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
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
                </View>

                <View style={styles.oosButtonContainer}>
                    <TouchableOpacity
                        style={styles.oosButton}
                        onPress={handleOosButtonPress}
                    >
                        <Text style={styles.oosButtonText}>OOS</Text>
                    </TouchableOpacity>
                </View>

            </View>

            {loading ? <Text>Loading...</Text> : (
                <ScrollView horizontal>
                    <View style={{ width: screenWidth * 10 }}>
                        {renderTableHeader()}
                        <ScrollView>
                            {filteredData && filteredData.map(renderTableRow)}
                        </ScrollView>
                    </View>
                </ScrollView>
            )}

            {selectedRow && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.modalContainer}>
                        <ScrollView contentContainerStyle={styles.modalScrollViewContent}>
                            <View style={styles.modalContent}>
                                {vehicleIncidentsItemKeys
                                    .filter(key => key !== 'id')
                                    .map((key) => (
                                        <View key={key} style={styles.modalRow}>
                                            <Text style={styles.modalLabel}>{formatHeader(key)}:</Text>
                                            { (key === 'totalOosDays' || key === 'hub' || key === 'vehicleModel' || key === 'vin' || key === 'licensePlate') ? (
                                                    <Text style={[styles.modalInput, styles.frozenInput]}>{selectedRow?.[key]}</Text>
                                                ) : key === 'vehicleId' ? (
                                                isAddMode ? (
                                                    <TextInput
                                                        style={styles.modalInput}
                                                        value={selectedRow?.[key]?.toString() ?? ''}
                                                        onChangeText={(value) => handleInputChange(key as keyof VehicleIncidentsItem, value)}
                                                    />
                                                ) : (
                                                    <Text style={[styles.modalInput, key === 'vehicleId' && styles.frozenInput]}>{selectedRow?.[key]}</Text>
                                                )
                                            ) : key === 'ossYesNo' ? (
                                                <Picker
                                                    selectedValue={selectedRow?.ossYesNo ?? ''}
                                                    style={[styles.modalInput, { height: 50, width: 200 }]} // Adjust the height and width as needed
                                                    itemStyle={{ fontSize: 16, height: 38 }} // Adjust the font size as needed
                                                    onValueChange={(value) => handleInputChange(key as keyof VehicleIncidentsItem, value)}
                                                >
                                                    {!oosYesNoOptions.includes(selectedRow?.ossYesNo ?? '') && (
                                                        <Picker.Item label="Invalid Status" value="invalid"/>
                                                    )}
                                                    {oosYesNoOptions.map(option => (
                                                        <Picker.Item key={option} label={option} value={option}/>
                                                    ))}
                                                </Picker>
                                            ) : key === "status" ? (
                                                <Picker
                                                    selectedValue={selectedRow?.status ?? ''}
                                                    style={[styles.modalInput, { height: 50, width: 200 }]} // Adjust the height and width as needed
                                                    itemStyle={{ fontSize: 16, height: 38 }} // Adjust the font size as needed
                                                    onValueChange={(value) => handleInputChange(key as keyof VehicleIncidentsItem, value)}
                                                >
                                                    {!statusOptions.includes(selectedRow?.status ?? '') && (
                                                        <Picker.Item label="Invalid Status" value="invalid"/>
                                                    )}
                                                    {statusOptions.map(option => (
                                                        <Picker.Item key={option} label={option} value={option}/>
                                                    ))}
                                                </Picker>
                                            ) : key === "reasonsOfWaiting" ? (
                                                <Picker
                                                    selectedValue={selectedRow?.reasonsOfWaiting ?? ''}
                                                    style={[styles.modalInput, { height: 50, width: 200 }]} // Adjust the height and width as needed
                                                    itemStyle={{ fontSize: 16, height: 38 }} // Adjust the font size as needed
                                                    onValueChange={(value) => handleInputChange(key as keyof VehicleIncidentsItem, value)}
                                                >
                                                    {!reasonsOfWaitingOptions.includes(selectedRow?.reasonsOfWaiting ?? '') && (
                                                        <Picker.Item label="Invalid Status" value="invalid"/>
                                                    )}
                                                    {reasonsOfWaitingOptions.map(option => (
                                                        <Picker.Item key={option} label={option} value={option}/>
                                                    ))}
                                                </Picker>
                                            ) : key === "covRentalOther" ? (
                                                <Picker
                                                    selectedValue={selectedRow?.covRentalOther ?? ''}
                                                    style={[styles.modalInput, { height: 50, width: 200 }]} // Adjust the height and width as needed
                                                    itemStyle={{ fontSize: 16, height: 38 }} // Adjust the font size as needed
                                                    onValueChange={(value) => handleInputChange(key as keyof VehicleIncidentsItem, value)}
                                                >
                                                    {!covRentalOtherOptions.includes(selectedRow?.covRentalOther ?? '') && (
                                                        <Picker.Item label="Invalid Status" value="invalid"/>
                                                    )}
                                                    {covRentalOtherOptions.map(option => (
                                                        <Picker.Item key={option} label={option} value={option}/>
                                                    ))}
                                                </Picker>
                                            ) : key === "vehicleIssueTracking" ? (
                                                <Picker
                                                    selectedValue={selectedRow?.vehicleIssueTracking ?? ''}
                                                    style={[styles.modalInput, { height: 50, width: 200 }]} // Adjust the height and width as needed
                                                    itemStyle={{ fontSize: 16, height: 38 }} // Adjust the font size as needed
                                                    onValueChange={(value) => handleInputChange(key as keyof VehicleIncidentsItem, value)}
                                                >
                                                    {!vehicleIssueTrackingOptions.includes(selectedRow?.vehicleIssueTracking ?? '') && (
                                                        <Picker.Item label="Invalid Status" value="invalid"/>
                                                    )}
                                                    {vehicleIssueTrackingOptions.map(option => (
                                                        <Picker.Item key={option} label={option} value={option}/>
                                                    ))}
                                                </Picker>
                                            ) : key === "dashCamVideo" ? (
                                                <Picker
                                                    selectedValue={selectedRow?.dashCamVideo ?? ''}
                                                    style={[styles.modalInput, { height: 50, width: 200 }]} // Adjust the height and width as needed
                                                    itemStyle={{ fontSize: 16, height: 38 }} // Adjust the font size as needed
                                                    onValueChange={(value) => handleInputChange(key as keyof VehicleIncidentsItem, value)}
                                                >
                                                    {!dashCamVideoOptions.includes(selectedRow?.dashCamVideo ?? '') && (
                                                        <Picker.Item label="Invalid Status" value="invalid"/>
                                                    )}
                                                    {dashCamVideoOptions.map(option => (
                                                        <Picker.Item key={option} label={option} value={option}/>
                                                    ))}
                                                </Picker>
                                            ) : (key === 'dateReported' || key === 'ossDate' || key === 'lastStatusUpdate' || key === 'dateCompleted' || key === 'lastClaimStatusUpdate') ? (
                                                <>
                                                    <TouchableOpacity onPress={() => setShowDatePicker({ ...showDatePicker, [selectedRow?.id]: true })}>
                                                        <Text>{selectedRow?.[key] ? new Date(selectedRow[key]).toLocaleDateString() : 'Select Date'}</Text>
                                                    </TouchableOpacity>
                                                    {showDatePicker[selectedRow?.id] && (
                                                        <DateTimePicker
                                                            value={selectedRow?.[key] ? new Date(selectedRow[key]) : date}
                                                            mode="date"
                                                            display="default"
                                                            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, selectedRow?.id)}
                                                        />
                                                    )}
                                                </>
                                            ) : (key === 'repairProcessNotes' || key === 'incidentDescription') ? (
                                                <TextInput
                                                    style={styles.modalInput}
                                                    value={selectedRow?.[key]?.toString() ?? ''}
                                                    onChangeText={(value) => handleInputChange(key as keyof VehicleIncidentsItem, value)}
                                                    multiline
                                                />
                                            ) : (
                                                <TextInput
                                                    style={styles.modalInput}
                                                    value={selectedRow?.[key]?.toString() ?? ''}
                                                    onChangeText={(value) => handleInputChange(key as keyof VehicleIncidentsItem, value)}
                                                />
                                            )}
                                        </View>
                                    ))}
                                <View style={styles.modalButtonRow}>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.closeButtonText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            )}






        </View>

    );
}


const styles = StyleSheet.create({
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

    searchContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        height: 40,
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        marginRight: 10,
        height: '100%',
    },
    arrowsContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },

    pickerContainer: {
        alignItems: 'center',
        width: '50%', // Adjust the width as needed
    },
    picker: {
        width: '100%', // Adjust the width as needed
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerItem: {
        fontSize: 15,
        textAlign: 'center', // Center align the text
    },
    pickerDropdown: {
        position: 'absolute',
        top: '100%',
        width: '100%',
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        zIndex: 1,
    },
    pickerDropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },

    oosButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    oosButton: {
        padding: 10,
        backgroundColor: 'lightcoral',
        borderRadius: 5,
    },
    oosButtonText: {
        color: 'white',
        fontWeight: 'bold',
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
        width: 100, // Set a fixed width for each cell
        alignContent: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',
    },
    borderRight: {
        borderRightWidth: 1,
        borderRightColor: '#ccc',
    },

    addAndPaginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
    },

    addButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    addButton: {
        padding: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 5,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
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

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalScrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // marginTop: 75,
        paddingVertical: 20,
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
        marginBottom: 10,
    },
    modalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalLabel: {
        flex: 1,
        fontWeight: 'bold',
    },
    modalInput: {
        flex: 2,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 5,
    },
    modalInputPicker: {
        flex: 2,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 5,
        height: 40,
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    frozenInput: {
        backgroundColor: '#d3d3d3',
    },
    saveButton: {
        padding: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 5,
        marginRight: 10,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
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
});