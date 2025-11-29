import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, StatusBar, Alert, ScrollView
} from 'react-native';
import { Video, ResizeMode } from 'expo-av'; 
import { BlurView } from 'expo-blur'; 
import { Ionicons } from '@expo/vector-icons'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../App';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;
type Props = {
  navigation: RegisterScreenNavigationProp;
};

const RegisterScreen = ({ navigation }: Props) => {
  // --- STATE ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Toggle for showing password
  const [showPassword, setShowPassword] = useState(false);

  const handleNext = () => {
    // 1. Validation
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Missing Info', 'Please fill out all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    // 2. Proceed to Onboarding
    // Note: We aren't saving First/Last name to backend yet (backend update needed),
    // but we collect them here for the UI experience.
    navigation.navigate('OnboardingStep1', { email, password });
  };

  return (
    <View style={styles.container}>
      
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

      {/* 1. NEW BACKGROUND VIDEO */}
      <Video
        source={require('../../assets/videos/register-bg.mp4')} // Ensure this file exists!
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted={true}
      />

      <View style={styles.overlay} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <BlurView intensity={25} tint="dark" style={styles.glassBox}>
            
            {/* HEADER */}
            <Text style={styles.title}>JOIN NUTRON</Text>
            <Text style={styles.subtitle}>SCULPT YOUR LEGACY.</Text>

            {/* NAME ROW (First & Last) */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="#8A8A8A"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="#8A8A8A"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            {/* EMAIL */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={16} color="#BFBFBF" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8A8A8A" 
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* PASSWORD + SHOW/HIDE TOGGLE */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={16} color="#BFBFBF" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#8A8A8A"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword} // Toggle this
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={18} 
                  color="#BFBFBF" 
                />
              </TouchableOpacity>
            </View>

            {/* CONFIRM PASSWORD */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={16} color="#BFBFBF" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#8A8A8A"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* CREATE ACCOUNT BUTTON */}
            <TouchableOpacity style={styles.createButton} onPress={handleNext}>
              <Text style={styles.createButtonText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>

            {/* TERMS TEXT */}
            <Text style={styles.termsText}>
              By continuing, you agree to our <Text style={styles.termsHighlight}>Terms</Text> & <Text style={styles.termsHighlight}>Privacy Policy</Text>.
            </Text>

            {/* DIVIDER */}
            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR CONTINUE WITH</Text>
              <View style={styles.line} />
            </View>

            {/* GOOGLE BUTTON (Icon Only) */}
            <TouchableOpacity style={styles.googleButton} onPress={() => Alert.alert("NUTRON", "Google Coming Soon")}>
              <Ionicons name="logo-google" size={22} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>

            {/* FOOTER: LOGIN LINK */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
              <Text style={styles.loginText}>
                Already training with us? <Text style={styles.loginHighlight}>LOGIN</Text>
              </Text>
            </TouchableOpacity>

          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' }, 
  
  contentContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 30 },

  glassBox: {
    borderRadius: 20,
    padding: 30,
    paddingVertical: 40,
    backgroundColor: 'rgba(10, 10, 10, 0.55)', 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)', 
    overflow: 'hidden',
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#D1D1D1', 
    textAlign: 'center',
    letterSpacing: 4, 
    marginBottom: 2, 
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 11, 
    fontWeight: '600',
    color: '#8F8F8F', 
    textAlign: 'center',
    letterSpacing: 2, 
    marginBottom: 30, 
    textTransform: 'uppercase',
  },

  // LAYOUT HELPERS
  row: { flexDirection: 'row', justifyContent: 'space-between' },

  // INPUTS
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 14, 
    marginBottom: 12, 
    paddingHorizontal: 15,
    height: 48, 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', 
  },
  icon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#BFBFBF', 
    letterSpacing: 0.5,
    fontWeight: '500', 
  },

  // CREATE ACCOUNT BUTTON
  createButton: {
    backgroundColor: '#141414', 
    height: 48, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#EAEAEA', 
    fontWeight: '700', 
    fontSize: 14, 
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // TERMS TEXT
  termsText: {
    color: '#666',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 16,
  },
  termsHighlight: { color: '#888', fontWeight: 'bold' },

  // DIVIDER
  dividerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 20, 
    opacity: 0.4 
  },
  line: { flex: 1, height: 1, backgroundColor: '#555' },
  orText: { color: '#888', marginHorizontal: 10, fontSize: 10, fontWeight: 'bold' },

  // GOOGLE BUTTON
  googleButton: {
    alignSelf: 'center', // Center horizontally
    width: 48, 
    height: 48, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // LOGIN FOOTER
  loginLink: { marginTop: 25, alignItems: 'center' },
  loginText: { 
    color: '#666', 
    fontSize: 12, 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    fontWeight: '500' 
  },
  loginHighlight: { 
    color: '#4F8DFF', 
    fontWeight: 'bold', 
    marginLeft: 5 
  }, 
});

export default RegisterScreen;