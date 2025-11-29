import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, StatusBar 
} from 'react-native';
import { Video, ResizeMode } from 'expo-av'; 
import { BlurView } from 'expo-blur'; 
import { Ionicons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Check your IP!
const API_URL = 'http://192.168.0.102:8080';  

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      await AsyncStorage.setItem('userToken', response.data.token);
      navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      Alert.alert('Access Denied', 'Credentials invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" transparent={true} backgroundColor="transparent" />

      <Video
        source={require('../../assets/videos/login-bg.mp4')}
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
        <BlurView intensity={25} tint="dark" style={styles.glassBox}>
          
          <Text style={styles.title}>NUTRON</Text>
          <Text style={styles.subtitle}>SCULPT YOUR LEGACY.</Text>

          {/* --- INPUTS --- */}
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

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={16} color="#BFBFBF" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8A8A8A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* --- FORGOT PASSWORD (Text Only) --- */}
          <TouchableOpacity 
            style={styles.forgotContainer}
            onPress={() => Alert.alert("Reset", "Feature coming soon.")}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* --- DIVIDER --- */}
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          {/* --- ACTION ROW (Google + Login) --- */}
          <View style={styles.actionRow}>
            
            {/* Google Icon Button */}
            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={() => Alert.alert("NUTRON", "Google Auth Coming Soon")}
            >
              <Ionicons name="logo-google" size={20} color="#EAEAEA" />
            </TouchableOpacity>

            {/* Main Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              {isLoading ? (
                <ActivityIndicator color="#EAEAEA" />
              ) : (
                <Text style={styles.loginButtonText}>LOGIN</Text>
              )}
            </TouchableOpacity>

          </View>

          {/* --- REGISTER LINK --- */}
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={styles.registerText}>Begin Your Legacy - <Text style={styles.registerHighlight}>REGISTER</Text></Text>
          </TouchableOpacity>

        </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' }, 
  contentContainer: { flex: 1, justifyContent: 'center', padding: 30 },
  
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
    fontSize: 34,
    fontWeight: '900',
    color: '#D1D1D1', 
    textAlign: 'center',
    letterSpacing: 8, 
    marginBottom: 2, 
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 11, 
    fontWeight: '600',
    color: '#8F8F8F', 
    textAlign: 'center',
    letterSpacing: 2, 
    marginBottom: 40, 
    textTransform: 'uppercase',
  },

  // INPUTS
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 12, 
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

  // FORGOT PASSWORD
  forgotContainer: {
    alignSelf: 'flex-end', // Pushes text to the right
    marginBottom: 20,
  },
  forgotText: {
    color: '#8F8F8F',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // DIVIDER
  dividerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20, 
    opacity: 0.4 
  },
  line: { flex: 1, height: 1, backgroundColor: '#555' },
  orText: { color: '#888', marginHorizontal: 10, fontSize: 10, fontWeight: 'bold' },

  // ACTION ROW
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 48, // Match input height
  },

  // GOOGLE BUTTON (Square/Icon only)
  googleButton: {
    width: 48, // Square
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // LOGIN BUTTON (Fills rest of row)
  loginButton: {
    flex: 1, // Take up remaining space
    marginLeft: 12, // Spacing from Google button
    backgroundColor: '#141414', 
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#EAEAEA', 
    fontWeight: '700', // Slightly bolder
    fontSize: 14, 
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  registerLink: { marginTop: 25, alignItems: 'center' },
  registerText: { color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '500' },
  registerHighlight: { color: '#4F8DFF', fontWeight: 'bold', marginLeft: 5 }, 
});

export default LoginScreen;