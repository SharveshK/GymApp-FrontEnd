import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, StatusBar, ImageBackground, ScrollView 
} from 'react-native';
import { BlurView } from 'expo-blur'; 
import { Ionicons } from '@expo/vector-icons'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../App';

type Step1RouteProp = RouteProp<AuthStackParamList, 'OnboardingStep1'>;
type Step1NavProp = StackNavigationProp<AuthStackParamList, 'OnboardingStep1'>;
type Props = {
  route: Step1RouteProp;
  navigation: Step1NavProp;
};

const OnboardingStep1 = ({ route, navigation }: Props) => {
  const { email, password } = route.params;

  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('');

  const handleNext = () => {
    // 1. Validation
    if (!age || !height || !weight || !gender) {
      alert('Please complete required fields.');
      return;
    }

    // 2. LOGIC FIX: Calculate Date of Birth from Age
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - parseInt(age);
    const dateOfBirth = `${birthYear}-01-01`; 

    // 3. LOGIC FIX: Rename keys to match Java Backend (heightCm, weightKg)
    navigation.navigate('OnboardingStep2', {
      email, 
      password,
      dateOfBirth: dateOfBirth, 
      heightCm: parseFloat(height), // <--- RENAMED
      weightKg: parseFloat(weight), // <--- RENAMED
      gender
    });
  };

  const SelectableButton = ({ label, value, isSelected, onSelect }: any) => (
    <TouchableOpacity 
      style={[styles.selectButton, isSelected && styles.selectButtonActive]} 
      onPress={() => onSelect(value)}
    >
      <Text style={[styles.selectButtonText, isSelected && styles.selectButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

      <ImageBackground
        source={require('../../assets/images/onboarding-bg-1.jpg')} 
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <BlurView intensity={25} tint="dark" style={styles.glassBox}>
              
              <Text style={styles.stepIndicator}>STEP 1 OF 5</Text>
              <Text style={styles.title}>THE FOUNDATION</Text>
              <Text style={styles.subtitle}>Define your starting point.</Text>

              {/* INPUT: AGE */}
              <View style={styles.inputLabelContainer}>
                <Ionicons name="calendar-outline" size={14} color="#8F8F8F" style={{marginRight: 8}} />
                <Text style={styles.inputLabel}>AGE</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 24"
                  placeholderTextColor="#444" 
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>

              {/* ROW: HEIGHT & WEIGHT */}
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                   <View style={styles.inputLabelContainer}>
                    <Ionicons name="resize-outline" size={14} color="#8F8F8F" style={{marginRight: 8}} />
                    <Text style={styles.inputLabel}>HEIGHT (CM)</Text>
                  </View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 180"
                      placeholderTextColor="#444"
                      value={height}
                      onChangeText={setHeight}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                   <View style={styles.inputLabelContainer}>
                    <Ionicons name="scale-outline" size={14} color="#8F8F8F" style={{marginRight: 8}} />
                    <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
                  </View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 85"
                      placeholderTextColor="#444"
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                </View>
              </View>

              {/* GENDER SELECTOR */}
              <View style={styles.inputLabelContainer}>
                <Ionicons name="person-outline" size={14} color="#8F8F8F" style={{marginRight: 8}} />
                <Text style={styles.inputLabel}>GENDER</Text>
              </View>
              <View style={styles.row}>
                <SelectableButton 
                  label="MALE" 
                  value="MALE" 
                  isSelected={gender === 'MALE'} 
                  onSelect={setGender} 
                />
                <View style={{width: 15}} />
                <SelectableButton 
                  label="FEMALE" 
                  value="FEMALE" 
                  isSelected={gender === 'FEMALE'} 
                  onSelect={setGender} 
                />
              </View>

              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>NEXT: GOALS</Text>
                <Ionicons name="arrow-forward" size={16} color="#EAEAEA" style={{marginLeft: 8}} />
              </TouchableOpacity>

            </BlurView>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' }, 
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 50 },
  backButton: {
    position: 'absolute', top: 50, left: 20, zIndex: 10,
    padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20,
  },
  glassBox: {
    borderRadius: 20, padding: 30, marginTop: 60,
    backgroundColor: 'rgba(10, 10, 10, 0.55)', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden',
  },
  stepIndicator: { color: '#4F8DFF', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 5 },
  title: { fontSize: 24, fontWeight: '900', color: '#D1D1D1', letterSpacing: 4, marginBottom: 5, textTransform: 'uppercase' },
  subtitle: { fontSize: 11, fontWeight: '600', color: '#8F8F8F', letterSpacing: 2, marginBottom: 35, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  inputLabelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 5 },
  inputLabel: { color: '#8F8F8F', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 15, height: 48, 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', justifyContent: 'center'
  },
  input: { fontSize: 15, color: '#BFBFBF', letterSpacing: 0.5, fontWeight: '500' },
  selectButton: {
    flex: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  selectButtonActive: { backgroundColor: '#D1D1D1', borderColor: '#D1D1D1' },
  selectButtonText: { color: '#8F8F8F', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  selectButtonTextActive: { color: '#000' },
  nextButton: {
    backgroundColor: '#141414', height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  nextButtonText: { color: '#EAEAEA', fontWeight: '700', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' },
});

export default OnboardingStep1;