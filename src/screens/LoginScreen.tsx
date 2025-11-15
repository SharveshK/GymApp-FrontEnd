import React, { useState } from 'react'; // Import useState
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native'; // Import TextInput and Alert
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../App';
import axios from 'axios'; // Import Axios
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// --- Navigation Props (same as before) ---
type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;
type Props = {
  navigation: LoginScreenNavigationProp;
};

// --- IMPORTANT: Set your Backend's IP Address ---
// 1. Find your computer's "Private IP Address" (e.g., 192.168.1.10)
// 2. Your phone CANNOT use 'http://localhost:8080'
// 3. It MUST use your computer's IP address on the Wi-Fi.
const API_URL = 'http://192.168.0.102:8080'; // <-- CHANGE THIS TO YOUR IP

const LoginScreen = ({ navigation }: Props) => {
  // --- State Variables ---
  // These will hold the text from the input boxes
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- API Call Function ---
  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      console.log('Attempting login...');
      // 1. Make the API call to your Spring Boot backend
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email,
        password: password,
      });

      // 2. Get the token from the response
      const { token } = response.data;

      // 3. Save the token to the phone's secure storage
      await AsyncStorage.setItem('userToken', token);

      // 4. If login is successful, we would navigate to the "main app"
      // (We haven't built this yet, so for now, just an alert)
      Alert.alert('Success!', 'Logged in!');
      console.log('Login successful, token saved!');

      // TODO: navigation.replace('MainApp');

    } catch (error) {
      // If the backend returns a 403 (Bad Credentials) or 404, it will land here
      console.error('Login failed:', error);
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>

      {/* --- Email Input --- */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* --- Password Input --- */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry // Hides the password
      />

      {/* --- Login Button --- */}
      <Button title="Login" onPress={handleLogin} />

      {/* --- Register Button (same as before) --- */}
      <View style={styles.registerButton}>
        <Button
          title="Don't have an account? Register"
          onPress={() => navigation.navigate('Register')}
          color="#555"
        />
      </View>
    </View>
  );
};

// --- Styles (You can be creative here later) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  registerButton: {
    marginTop: 20,
  },
});

export default LoginScreen;