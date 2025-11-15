import React, { useState } from 'react';
import { View, StyleSheet, Button, Text, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../App';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios'; // We need axios to call the API
import AsyncStorage from '@react-native-async-storage/async-storage'; // To save the token

// --- Navigation Props ---
type Step5NavigationProp = StackNavigationProp<AuthStackParamList, 'OnboardingStep5_Submit'>;
type Step5RouteProp = RouteProp<AuthStackParamList, 'OnboardingStep5_Submit'>;

type Props = {
  navigation: Step5NavigationProp;
  route: Step5RouteProp;
};

// Find your computer's IP Address (e.g., 192.168.1.10)
// Your phone CANNOT use 'http://localhost:8080'
const API_URL = 'http://192.168.0.102:8080'; // <-- CHANGE THIS TO YOUR IP

const OnboardingStep5_Submit = ({ navigation, route }: Props) => {
  // 1. Get ALL the data from the previous 4 screens
  const allOnboardingData = route.params;

  // State to show a loading spinner
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Show loading spinner
    setIsLoading(true);

    // 2. We must convert the gender, goals, etc. strings
    // to match the enums your backend expects.
    // Our 'App.tsx' param list already has the types (number[], string[])
    // so we just need to send the data.
    
    // The 'allOnboardingData' object already perfectly matches
    // your backend 'RegisterRequest' DTO.
    
    try {
      console.log('Submitting Registration:', allOnboardingData);

      // 3. Call your Spring Boot API
      const response = await axios.post(`${API_URL}/api/auth/register`, allOnboardingData);

      // 4. If successful, get and save the token
      const { token } = response.data;
      await AsyncStorage.setItem('userToken', token);

      // 5. Registration is complete!
      Alert.alert('Success!', 'Your account has been created.');
      
      // We will now navigate to the main app.
      // We haven't built 'MainApp' yet, so for now we'll
      // just go back to Login.
      navigation.popToTop(); // Go all the way back to the first screen (Login)

    } catch (error) {
      console.error('Registration Failed:', error);
      Alert.alert('Registration Failed', 'An error occurred. Please try again.');
    } finally {
      // Hide loading spinner
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>You're All Set!</Text>
      <Text style={styles.subtitle}>
        Press the button below to create your account and start your journey.
      </Text>

      {/* Show a spinner while API call is happening */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Complete Registration" onPress={handleSubmit} />
      )}
    </ScrollView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center the button/spinner
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
});

export default OnboardingStep5_Submit;