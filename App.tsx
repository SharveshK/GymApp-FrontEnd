import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import all your screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnboardingStep1 from './src/screens/OnboardingStep1';
import OnboardingStep2 from './src/screens/OnboardingStep2';
import OnboardingStep3 from './src/screens/OnboardingStep3';
import OnboardingStep4 from './src/screens/OnboardingStep4';
import OnboardingStep5_Submit from './src/screens/OnboardingStep5_Submit'; // <-- 1. ADD THIS

// 2. Update the parameter list
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OnboardingStep1: { email: string; password: string };
  OnboardingStep2: {
    email: string;
    password: string;
    dateOfBirth: string;
    heightCm: number;
    weightKg: number;
    gender: string;
  };
  OnboardingStep3: {
    email: string;
    password: string;
    dateOfBirth: string;
    heightCm: number;
    weightKg: number;
    gender: string;
    primaryGoal: string;
    experienceLevel: string;
    dietaryType: string;
    activityLevel: string;
    workoutLocation: string;
    mealFrequency: number;
    cookingTimeMinutes: number;
  };
  OnboardingStep4: {
    email: string;
    password: string;
    dateOfBirth: string;
    heightCm: number;
    weightKg: number;
    gender: string;
    primaryGoal: string;
    experienceLevel: string;
    dietaryType: string;
    activityLevel: string;
    workoutLocation: string;
    mealFrequency: number;
    cookingTimeMinutes: number;
    allergyIds: number[];
    medicalConditionIds: number[];
    dislikedFoodIds: number[];
  };
  // This is the final screen!
  OnboardingStep5_Submit: { // <-- 2. ADD THIS
    email: string;
    password: string;
    dateOfBirth: string;
    heightCm: number;
    weightKg: number;
    gender: string;
    primaryGoal: string;
    experienceLevel: string;
    dietaryType: string;
    activityLevel: string;
    workoutLocation: string;
    mealFrequency: number;
    cookingTimeMinutes: number;
    allergyIds: number[];
    medicalConditionIds: number[];
    dislikedFoodIds: number[];
    
    // New data from Step 4
    equipmentIds: number[];
    customEquipmentNames: string[];
  };
};

const Stack = createStackNavigator<AuthStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Welcome!' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account (1/5)' }} />
        <Stack.Screen name="OnboardingStep1" component={OnboardingStep1} options={{ title: 'Profile (2/5)' }} />
        <Stack.Screen name="OnboardingStep2" component={OnboardingStep2} options={{ title: 'Goals (3/5)' }} />
        <Stack.Screen name="OnboardingStep3" component={OnboardingStep3} options={{ title: 'Health (4/5)' }} />
        <Stack.Screen name="OnboardingStep4" component={OnboardingStep4} options={{ title: 'Equipment (5/5)' }} />
        
        {/* 3. Add the new screen to the stack */}
        <Stack.Screen 
          name="OnboardingStep5_Submit" 
          component={OnboardingStep5_Submit}
          options={{ title: 'Review & Submit' }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;