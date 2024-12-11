import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Alert, ScrollView, Dimensions, View, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text} from '@/components/Themed';
import NGROK_URL from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


export default function CurrentAssignedVehiclesScreen() {




    return (
        <View style={styles.container}>


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

});