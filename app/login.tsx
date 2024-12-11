import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Button, Alert, Image, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NGROK_URL from '@/config';


// Define the type for the navigation stack
type RootStackParamList = {
    login: undefined;
    '(tabs)': { screen: string };
};

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [isPortrait, setIsPortrait] = useState(true);

    const { height } = Dimensions.get('window');
    const dynamicPadding = height * 0.05;

    const handleOrientationChange = () => {
        const { width, height } = Dimensions.get('window');
        setIsPortrait(height >= width);
    };

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', handleOrientationChange);
        handleOrientationChange(); // Set initial orientation

        return () => {
            subscription?.remove();
        };
    }, []);

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${NGROK_URL}/diMobileApp/api/users/login/`, {
                email,
                password,
            });

            if (response.status === 200) {
                const { token } = response.data;
                await AsyncStorage.setItem('userToken', token); // Store the token in AsyncStorage
                // await AsyncStorage.setItem('userEmail', email); // Store the email in AsyncStorage
                
                // Fetch user permissions
                const permissionsResponse = await axios.get(`${NGROK_URL}/diMobileApp/api/users/current_user_permissions_information/`, {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });

                const usernameReposonses = await axios.get(`${NGROK_URL}/diMobileApp/api/users/get_user_data/`, {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });

                if (permissionsResponse.status === 200) {
                    const permissions = permissionsResponse.data.permissions;
                    console.log('permissions:', permissions);
                    await AsyncStorage.setItem('userPermissions', JSON.stringify(permissions)); // Store the permissions in AsyncStorage

                    await AsyncStorage.setItem('username', usernameReposonses.data.username);

                    // Check for the "is_activePermissions" permission
                    if (permissions.is_activePermissions) {
                        // Navigate to home screen if the user has "is_activePermissions"
                        navigation.navigate('(tabs)', { screen: 'Home' });
                    } else if (permissions.is_covDriver || permissions.is_ggDriver) {
                        navigation.navigate('(tabs)', { screen: 'Pre Trip COV Inspection Driver Entry' });
                    } else {
                        // Navigate to "Account Information" screen if the user does not have "is_activePermissions"
                        navigation.navigate('(tabs)', { screen: 'Account Information' });
                    }
                } else {
                    Alert.alert('Login', 'Failed to fetch user permissions');
                }
            } else {
                // Login failed
                Alert.alert('Login', 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error); // Log the error to the console
            Alert.alert('Login', 'An error occurred. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            {isPortrait && (
                <View style={{ alignItems: 'center', paddingVertical: dynamicPadding, }}>
                    <Image
                        source={require('../assets/images/diLogoText.png')}
                        style={{width: '80%', height: 100, resizeMode: 'contain'}}
                    />
                </View>
            )}
            {!isPortrait && (
                <View style={{ alignItems: 'center', marginTop: 0, }}>
                    <Image
                        source={require('../assets/images/diLogoText.png')}
                        style={{width: '30%', height: 100, resizeMode: 'contain'}}
                    />
                </View>
            )}
            <View style={styles.formContainer}>
                <Text style={styles.title}>Email:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Text style={styles.title}>Password:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <Button title="Login" onPress={handleLogin} />
            </View>
            {isPortrait && (
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../assets/images/difleet_loginpage.png')}
                        style={styles.logoImage}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
        marginBottom: 0,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    imageContainer: {
        alignItems: 'center',
        // marginBottom: 50,
    },
    logoImage: {
        width: '70%',
        height: 300,
        resizeMode: 'contain',
    },
});
