import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Alert, ScrollView, Dimensions, RefreshControl, View, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text} from '@/components/Themed';
import NGROK_URL from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


interface ProcurementItem {
    id: number;
    vehicleId: string | null;
    insured: boolean;
    hub: string | null;
    employeeAssigned: string | null;
    employeeType: string | null;
    fuelCard: string | null;
    vehicleStatus: string | null;
    vehicleStatusDate: string | null;
    notes: string | null;
    licensePlate: string | null;
    licenseExp: string | null;
    tempPlate: string | null;
    deployDate: string | null;
    mfr: string | null;
    model: string | null;
    year: string | null;
    vin: string | null;
    insuranceNotification: string | null;
    entUnitId: string | null;
    geotabSn: string | null;
    deliveredDate: string | null;
    dashCam: string | null;
    quoteDate: string | null;
    quote: string | null;
    quotedVehiclesRecdClose: string | null;
    busUnit: string | null;
    spareKey: string | null;
    diPuGmcPu: string | null;
    tollRoadAccount: string | null;
    phoneMount: string | null;
}

const procurementItemKeys: Array<keyof ProcurementItem> = [
    'vehicleId', 'insured', 'hub', 'employeeAssigned', 'employeeType', 'fuelCard', 'vehicleStatus', 'vehicleStatusDate',
    'notes', 'licensePlate', 'licenseExp', 'tempPlate', 'deployDate', 'mfr', 'model', 'year', 'vin', 'insuranceNotification',
    'entUnitId', 'geotabSn', 'deliveredDate', 'dashCam', 'quoteDate', 'quote', 'quotedVehiclesRecdClose', 'busUnit', 'spareKey',
    'diPuGmcPu', 'tollRoadAccount', 'phoneMount'
];

interface ActiveInsuredVehiclesItem {
    vin: string;
}


export default function ProcurementScreen() {
    const [data, setData] = useState<ProcurementItem[]>([]);
    const [filteredData, setFilteredData] = useState<ProcurementItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [searchValue, setSearchValue] = useState('');
    const [selectedColumn, setSelectedColumn] = useState<{ label: string, value: keyof ProcurementItem }>({ label: "Vehicle ID", value: "vehicleId" });
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState<ProcurementItem | null>(null);
    const [activeInsuredVins, setActiveInsuredVins] = useState<Set<string>>(new Set<string>());
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const rowsPerPage = 50;
    const [showDatePicker, setShowDatePicker] = useState<{ [key: number]: boolean }>({});
    const [date, setDate] = useState(new Date());
    const [isAddMode, setIsAddMode] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    const fetchProcurementData = async (page = 1) => {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert('Error', 'No authorization token found');
            setLoading(false);
            return;
        }

        fetch(`${NGROK_URL}/diMobileApp/api/procurement/get_procurement_data/?page=${page}&limit=${rowsPerPage}`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((json) => {
                setData(json.results);
                setFilteredData(json.results);
                setTotalPages(Math.ceil(json.count / rowsPerPage));
            })
            .catch((error) => Alert.alert('Error', error.message))
            .finally(() => setLoading(false));
    };
    
    useEffect(() => {
        fetchProcurementData(currentPage);

        const fetchActiveInsuredVehicleData = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No authorization token found');
                setLoading(false);
                return;
            }

            fetch(`${NGROK_URL}/diMobileApp/api/activeInsuredVehicle/get_activeInsuredVehicle_data/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((json) => {
                    const vins = new Set<string>(json.map((item: { vin: string }) => item.vin));
                    setActiveInsuredVins(vins);
                })
                .catch((error) => Alert.alert('Error', error.message))
                .finally(() => setLoading(false));
        };

        fetchActiveInsuredVehicleData();

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
                Alert.alert('Error', 'No authorization token found');
                setLoading(false);
                return;
            }
    
            fetch(`${NGROK_URL}/diMobileApp/api/procurement/search_procurement_data/?query=${searchValue}&column=${selectedColumn.value}&page=${currentPage}&limit=${rowsPerPage}`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((json) => {
                    setData(json.results);
                    setFilteredData(json.results);
                    setTotalPages(Math.ceil(json.count / rowsPerPage));
                })
                .catch((error) => Alert.alert('Error', error.message))
                .finally(() => setLoading(false));
        };
    
        fetchSearchData();
    }, [searchValue, selectedColumn, currentPage]);

    const onRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1); // Reset to the first page
        fetchProcurementData(1).finally(() => setRefreshing(false));
    };

    const formatHeader = (header: string): string => {
        return header
            .replace(/([A-Z])/g, ' $1') // Add space before each capital letter
            .replace(/^./, str => str.toUpperCase()) // Capitalize the first letter
            .trim(); // Remove leading/trailing spaces
    };

    const renderTableHeader = () => (
        <View style={styles.tableRow}>
            {procurementItemKeys.map((key, index) => (
                <Text key={key} style={[styles.tableHeader, styles.tableCell, index !== procurementItemKeys.length - 1 && styles.borderRight]}>
                    {formatHeader(key)}
                </Text>
            ))}
        </View>
    );
    
    const renderTableRow = (item: ProcurementItem) => (
        <TouchableOpacity
            key={item.id}
            onLongPress={() => {
                setSelectedRow(item);
                setModalVisible(true);
            }}
            delayLongPress={500}
        >
            <View style={styles.tableRow}>
                {procurementItemKeys.map((key, index) => (
                    <View key={key} style={[styles.tableCell, index !== procurementItemKeys.length - 1 && styles.borderRight]}>
                        {key === 'insured' ? (
                            activeInsuredVins.has(item.vin ?? '') ? (
                                <FontAwesome name="check" size={20} color="green" />
                            ) : (
                                <FontAwesome name="times" size={20} color="red" />
                            )
                        ) : (
                            <Text>{item[key] !== undefined && item[key] !== null ? item[key].toString() : ''}</Text>
                        )}
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
            handleInputChange('vehicleStatusDate', formattedDate);
        }
    };

    // 
    const handleInputChange = (field: keyof ProcurementItem, value: string) => {
        if (selectedRow) {
            setSelectedRow({ ...selectedRow, [field]: value });
        }
    };

    // handles saving the updated data to Procurement DB
    const handleSave = async () => {
        if (!selectedRow) return;
    
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert('Error', 'No authorization token found');
            return;
        }
    
        const url = selectedRow.id === 0
            ? `${NGROK_URL}/diMobileApp/api/procurement/create_procurement_data/`
            : `${NGROK_URL}/diMobileApp/api/procurement/${selectedRow.id}/update_procurement_data/`;
    
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
                    setData([...data, updatedItem]);
                    setFilteredData([...data, updatedItem]);
                } else {
                    const updatedData = data.map(item => item.id === updatedItem.id ? updatedItem : item);
                    setData(updatedData);
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

    const handleSelectItem = (item: { label: string, value: keyof ProcurementItem }) => {
        setSelectedColumn(item);
        setDropdownVisible(false);
    };

    const pickerItems: { label: string; value: keyof ProcurementItem }[] = [
        { label: "Vehicle ID", value: "vehicleId" },
        { label: "Hub", value: "hub" },
        { label: "Employee Assigned", value: "employeeAssigned" },
        { label: "Status", value: "vehicleStatus" },
        { label: "License Plate", value: "licensePlate" },
        { label: "Enterprise Unit ID", value: "entUnitId" },
        { label: "VIN", value: "vin" },
    ];

    const handleAddButtonPress = () => {
        setSelectedRow({
            id: 0,
            vehicleId: null,
            insured: false,
            hub: null,
            employeeAssigned: null,
            employeeType: null,
            fuelCard: null,
            vehicleStatus: null,
            vehicleStatusDate: null,
            notes: null,
            licensePlate: null,
            licenseExp: null,
            tempPlate: null,
            deployDate: null,
            mfr: null,
            model: null,
            year: null,
            vin: null,
            insuranceNotification: null,
            entUnitId: null,
            geotabSn: null,
            deliveredDate: null,
            dashCam: null,
            quoteDate: null,
            quote: null,
            quotedVehiclesRecdClose: null,
            busUnit: null,
            spareKey: null,
            diPuGmcPu: null,
            tollRoadAccount: null,
            phoneMount: null
        });
        setIsAddMode(true);
        setModalVisible(true);
    };

    const vehicleStatusOptions = [
        { label: '1 - DEPLOYED', value: '1 - DEPLOYED' },
        { label: '2 - READY TO DEPLOY', value: '2 - READY TO DEPLOY' },
        { label: '3 - OUT OF SERVICE', value: '3 - OUT OF SERVICE' },
        { label: '4 - ORDERED', value: '4 - ORDERED' },
        { label: '5 - TOTALED', value: '5 - TOTALED' },
        { label: '6 - READY TO RETURN', value: '6 - READY TO RETURN' },
    ];

    const licenseExpOptions = [
        { label: 'January', value: 'January' },
        { label: 'February', value: 'February' },
        { label: 'March', value: 'March' },
        { label: 'April', value: 'April' },
        { label: 'May', value: 'May' },
        { label: 'June', value: 'June' },
        { label: 'July', value: 'July' },
        { label: 'August', value: 'August' },
        { label: 'September', value: 'September' },
        { label: 'October', value: 'October' },
        { label: 'November', value: 'November' },
        { label: 'December', value: 'December' },
    ];

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >

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

            </View>

            {loading ? <Text>Loading...</Text> : (
                <ScrollView 
                    horizontal
                >
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
                                {procurementItemKeys
                                    .filter(key => key !== 'id' && key !== 'insured')
                                    .map((key) => (
                                        <View key={key} style={styles.modalRow}>
                                            <Text style={styles.modalLabel}>{formatHeader(key)}:</Text>
                                            { (key === 'vehicleId' || key === 'mfr' || key === 'model' || key === 'year' || key === 'vin' || key === 'entUnitId') ? (
                                                isAddMode ? (
                                                    <TextInput
                                                        style={styles.modalInput}
                                                        value={selectedRow?.[key]?.toString() ?? ''}
                                                        onChangeText={(value) => handleInputChange(key as keyof ProcurementItem, value)}
                                                    />
                                                ) : (
                                                    <Text style={[styles.modalInput, styles.frozenInput]}>{selectedRow?.[key]}</Text>
                                                )
                                            ) : key === 'vehicleStatus' ? (
                                                <Picker
                                                    selectedValue={selectedRow?.vehicleStatus ?? ''}
                                                    style={[styles.modalInput, { height: 50, width: 200 }]} // Adjust the height and width as needed
                                                    itemStyle={{ fontSize: 16, height: 38 }} // Adjust the font size as needed
                                                    onValueChange={(value) => handleInputChange(key as keyof ProcurementItem, value)}
                                                >
                                                    {!vehicleStatusOptions.some(option => option.value === selectedRow?.vehicleStatus) && (
                                                        <Picker.Item label="Invalid Status" value="invalid"/>
                                                    )}
                                                    {vehicleStatusOptions.map(option => (
                                                        <Picker.Item key={option.value} label={option.label} value={option.value}/>
                                                    ))}
                                                </Picker>
                                            ) : key === "licenseExp" ? (
                                                <Picker
                                                    selectedValue={selectedRow?.licenseExp ?? ''}
                                                    style={[styles.modalInput, { height: 50, width: 200 }]} // Adjust the height and width as needed
                                                    itemStyle={{ fontSize: 16, height: 38 }} // Adjust the font size as needed
                                                    onValueChange={(value) => handleInputChange(key as keyof ProcurementItem, value)}
                                                >
                                                    {!licenseExpOptions.some(option => option.value === selectedRow?.licenseExp) && (
                                                        <Picker.Item label="Invalid Month" value="invalid"/>
                                                    )}
                                                    {licenseExpOptions.map(option => (
                                                        <Picker.Item key={option.value} label={option.label} value={option.value}/>
                                                    ))}
                                                </Picker>
                                            ) : (key === 'vehicleStatusDate' || key === 'deployDate' || key === 'insuranceNotification' || key === 'deliveredDate' || key === 'quoteDate' || key === 'phoneMount') ? (
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
                                            ) : (
                                                <TextInput
                                                    style={styles.modalInput}
                                                    value={selectedRow?.[key]?.toString() ?? ''}
                                                    onChangeText={(value) => handleInputChange(key as keyof ProcurementItem, value)}
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
        </ScrollView>
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