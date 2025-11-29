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

type Step2RouteProp = RouteProp<AuthStackParamList, 'OnboardingStep2'>;
type Step2NavProp = StackNavigationProp<AuthStackParamList, 'OnboardingStep2'>;
type Props = {
  route: Step2RouteProp;
  navigation: Step2NavProp;
};

const OnboardingStep2 = ({ route, navigation }: Props) => {
  // Get data from Step 1
  const { ...prevData } = route.params;

  // Form State
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [dietaryType, setDietaryType] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [workoutLocation, setWorkoutLocation] = useState('');
  const [mealFrequency, setMealFrequency] = useState('');
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState('');

  const handleNext = () => {
    // --- VALIDATION CHECK ---
    // We ensure ALL required fields are filled before moving on
    if (!primaryGoal || !experienceLevel || !workoutLocation || !mealFrequency || !dietaryType || !activityLevel) {
      alert('Please select ALL options to proceed.');
      return;
    }
    
    navigation.navigate('OnboardingStep3', {
      ...prevData,
      primaryGoal,
      experienceLevel,
      dietaryType,
      activityLevel,
      workoutLocation,
      mealFrequency: parseInt(mealFrequency) || 3,
      cookingTimeMinutes: parseInt(cookingTimeMinutes) || 30
    });
  };

  // --- CUSTOM SELECTOR COMPONENT ---
  const OptionButton = ({ label, value, currentValue, onSelect }: any) => {
    const isActive = currentValue === value;
    return (
      <TouchableOpacity 
        style={[styles.optionButton, isActive && styles.optionButtonActive]} 
        onPress={() => onSelect(value)}
      >
        <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
          {label}
        </Text>
        {isActive && <Ionicons name="checkmark-circle" size={16} color="#000" />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" transparent={true} backgroundColor="transparent" />

      <ImageBackground
        source={require('../../assets/images/onboarding-bg-2.jpg')} 
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            
            {/* Back Button */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <BlurView intensity={25} tint="dark" style={styles.glassBox}>
              
              <Text style={styles.stepIndicator}>STEP 2 OF 5</Text>
              <Text style={styles.title}>THE MISSION</Text>
              <Text style={styles.subtitle}>Define your path.</Text>

              {/* --- SECTION: GOAL --- */}
              <Text style={styles.sectionLabel}>PRIMARY GOAL</Text>
              <View style={styles.gridContainer}>
                <OptionButton label="LOSE FAT" value="LOSE_FAT" currentValue={primaryGoal} onSelect={setPrimaryGoal} />
                <OptionButton label="BUILD MUSCLE" value="BUILD_MUSCLE" currentValue={primaryGoal} onSelect={setPrimaryGoal} />
                <OptionButton label="RECOMP" value="RECOMP" currentValue={primaryGoal} onSelect={setPrimaryGoal} />
                <OptionButton label="STRENGTH" value="IMPROVE_STRENGTH" currentValue={primaryGoal} onSelect={setPrimaryGoal} />
              </View>

              {/* --- SECTION: EXPERIENCE --- */}
              <Text style={styles.sectionLabel}>EXPERIENCE LEVEL</Text>
              <View style={styles.gridContainer}>
                <OptionButton label="BEGINNER" value="BEGINNER" currentValue={experienceLevel} onSelect={setExperienceLevel} />
                <OptionButton label="INTERMEDIATE" value="INTERMEDIATE" currentValue={experienceLevel} onSelect={setExperienceLevel} />
                <OptionButton label="ADVANCED" value="ADVANCED" currentValue={experienceLevel} onSelect={setExperienceLevel} />
              </View>

              {/* --- SECTION: LOCATION --- */}
              <Text style={styles.sectionLabel}>WORKOUT LOCATION</Text>
              <View style={styles.gridContainer}>
                <OptionButton label="COMMERCIAL GYM" value="COMMERCIAL_GYM" currentValue={workoutLocation} onSelect={setWorkoutLocation} />
                <OptionButton label="HOME GYM" value="HOME_GYM" currentValue={workoutLocation} onSelect={setWorkoutLocation} />
              </View>

              {/* --- SECTION: DIET --- */}
              <Text style={styles.sectionLabel}>DIET PREFERENCE</Text>
              <View style={styles.gridContainer}>
                <OptionButton label="NON-VEG" value="NON_VEG" currentValue={dietaryType} onSelect={setDietaryType} />
                <OptionButton label="VEG" value="VEGETARIAN" currentValue={dietaryType} onSelect={setDietaryType} />
                <OptionButton label="VEGAN" value="VEGAN" currentValue={dietaryType} onSelect={setDietaryType} />
              </View>

              {/* --- SECTION: ACTIVITY LEVEL (New) --- */}
              <Text style={styles.sectionLabel}>DAILY ACTIVITY</Text>
              <View style={styles.gridContainer}>
                <OptionButton label="SEDENTARY" value="SEDENTARY" currentValue={activityLevel} onSelect={setActivityLevel} />
                <OptionButton label="LIGHT ACTIVE" value="LIGHTLY_ACTIVE" currentValue={activityLevel} onSelect={setActivityLevel} />
                <OptionButton label="ACTIVE" value="MODERATELY_ACTIVE" currentValue={activityLevel} onSelect={setActivityLevel} />
                <OptionButton label="VERY ACTIVE" value="VERY_ACTIVE" currentValue={activityLevel} onSelect={setActivityLevel} />
              </View>

              {/* --- NUMERIC INPUTS --- */}
              <View style={[styles.row, { marginTop: 10 }]}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.sectionLabel}>MEALS / DAY</Text>
                  <View style={styles.inputContainer}>
                    <TextInput 
                      style={styles.input} 
                      placeholder="e.g. 4" 
                      placeholderTextColor="#444" 
                      keyboardType="numeric"
                      value={mealFrequency}
                      onChangeText={setMealFrequency}
                    />
                  </View>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.sectionLabel}>COOK TIME (MIN)</Text>
                  <View style={styles.inputContainer}>
                    <TextInput 
                      style={styles.input} 
                      placeholder="e.g. 45" 
                      placeholderTextColor="#444" 
                      keyboardType="numeric"
                      value={cookingTimeMinutes}
                      onChangeText={setCookingTimeMinutes}
                    />
                  </View>
                </View>
              </View>

              {/* NEXT BUTTON */}
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>NEXT: HEALTH</Text>
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
  
  scrollContainer: { flexGrow: 1, padding: 20, paddingVertical: 50 },
  
  backButton: {
    position: 'absolute',
    top: 50, left: 20, zIndex: 10,
    padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20,
  },

  glassBox: {
    marginTop: 60,
    borderRadius: 20,
    padding: 25,
    backgroundColor: 'rgba(10, 10, 10, 0.55)', 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)', 
    overflow: 'hidden',
  },

  stepIndicator: { color: '#4F8DFF', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 5 },
  title: { fontSize: 24, fontWeight: '900', color: '#D1D1D1', letterSpacing: 4, marginBottom: 5, textTransform: 'uppercase' },
  subtitle: { fontSize: 11, fontWeight: '600', color: '#8F8F8F', letterSpacing: 2, marginBottom: 30, textTransform: 'uppercase' },

  sectionLabel: { color: '#8F8F8F', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 15, marginBottom: 8 },

  // GRID LAYOUT
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },

  optionButton: {
    width: '48%', 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10, 
  },
  optionButtonActive: {
    backgroundColor: '#D1D1D1',
    borderColor: '#D1D1D1',
  },
  optionText: {
    color: '#BFBFBF',
    fontSize: 10, 
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  optionTextActive: { color: '#000', fontWeight: '700' },

  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 12, 
    paddingHorizontal: 15,
    height: 48, 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', 
    justifyContent: 'center'
  },
  input: { fontSize: 15, color: '#BFBFBF', letterSpacing: 0.5, fontWeight: '500' },

  nextButton: {
    backgroundColor: '#141414', 
    height: 48, 
    borderRadius: 12, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30, 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  nextButtonText: { color: '#EAEAEA', fontWeight: '700', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' },
});

export default OnboardingStep2;