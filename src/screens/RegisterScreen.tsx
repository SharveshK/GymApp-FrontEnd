import React, { useState } from 'react';
import { View, StyleSheet, Button, TextInput, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../App'; // Import from App.tsx

// --- Navigation Props ---
type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;
type Props = {
  navigation: RegisterScreenNavigationProp;
};

const RegisterScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleNext = () => {
    // Simple validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    
    // We don't call the API yet.
    // We just pass the data to the *next* screen.
    // We will build this screen in the next step.
    // Alert.alert('DEBUG', 'Navigating to OnboardingStep1...'); 
    navigation.navigate('OnboardingStep1', { email, password });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Next: Your Profile" onPress={handleNext} />
      
      <View style={styles.loginButton}>
        <Button
          title="Already have an account? Login"
          onPress={() => navigation.goBack()} // Go back to Login
          color="#555"
        />
      </View>
    </View>
  );
};

// --- Styles (Same as Login) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
  loginButton: {
    marginTop: 20,
  },
});

export default RegisterScreen;