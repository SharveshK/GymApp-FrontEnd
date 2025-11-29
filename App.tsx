import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

// --- IMPORT SCREENS ---
import LoadingScreen from './src/screens/LoadingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnboardingStep1 from './src/screens/OnboardingStep1';
import OnboardingStep2 from './src/screens/OnboardingStep2';
import OnboardingStep3 from './src/screens/OnboardingStep3';

import DashboardScreen from './src/screens/DashboardScreen';
import LogScreen from './src/screens/LogScreen';
import ChatScreen from './src/screens/ChatScreen';

// NEW: The "HUD" screens
import DietScreen from './src/screens/DietScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';

// Loggers
import MealLoggerScreen from './src/screens/MealLoggerScreen';
// Note: WorkoutLoggerScreen is removed because logging is now inside WorkoutScreen

// --- DEFINE PARAMETER LISTS ---

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OnboardingStep1: { email: string; password: string };
  OnboardingStep2: { [key: string]: any };
  OnboardingStep3: { [key: string]: any };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Plan: undefined; // This now points to WorkoutScreen
  Log: undefined;
  Chat: undefined;
  Diet: undefined;
};

export type RootStackParamList = {
  Loading: undefined;
  Auth: undefined;
  Main: undefined;
  // WorkoutLogger removed (obsolete)
  MealLogger: { mealType: string; foodDesc: string };
};

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainTabParamList>(); 

// --- 1. AUTH STACK ---
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="OnboardingStep1" component={OnboardingStep1} />
      <AuthStack.Screen name="OnboardingStep2" component={OnboardingStep2} />
      <AuthStack.Screen name="OnboardingStep3" component={OnboardingStep3} />
    </AuthStack.Navigator>
  );
};

// --- 2. MAIN APP STACK (Command Center) ---
const MainNavigator = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#121212', // Onyx Background
          shadowColor: 'transparent',
        },
        headerTintColor: '#EAEAEA', // Silver Text
        headerTitleStyle: {
          fontWeight: '900',
          letterSpacing: 2,
          textTransform: 'uppercase',
          fontSize: 14,
        },
        headerBackTitleVisible: false,
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
      }}
    >
      <MainStack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ headerShown: false }} 
      />
      
      {/* PLAN ROUTE NOW POINTS TO WORKOUT SCREEN */}
      <MainStack.Screen name="Plan" component={WorkoutScreen} options={{ title: 'PROTOCOL' }} />
      
      <MainStack.Screen name="Log" component={LogScreen} options={{ title: 'LOG DATA' }} />
      <MainStack.Screen name="Chat" component={ChatScreen} options={{ title: 'THE ORACLE' }} />
      <MainStack.Screen name="Diet" component={DietScreen} options={{ title: 'NUTRITION' }} />
      
    </MainStack.Navigator>
  );
};

// --- 3. ROOT APP COMPONENT ---
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading" screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />

        {/* Removed WorkoutLogger (Log Workout logic is now inside WorkoutScreen) */}
        
        <Stack.Screen 
          name="MealLogger" 
          component={MealLoggerScreen} 
          options={{ title: 'Log Meal', headerShown: true }} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;