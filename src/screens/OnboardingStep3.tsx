import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, StatusBar, ImageBackground, ScrollView, Modal, FlatList, ActivityIndicator, Alert 
} from 'react-native';
import { BlurView } from 'expo-blur'; 
import { Ionicons } from '@expo/vector-icons'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStackParamList } from '../../App';

// --- CHECK YOUR IP ---
const API_URL = 'http://192.168.0.102:8080';  

type Step3RouteProp = RouteProp<AuthStackParamList, 'OnboardingStep3'>;
type Step3NavProp = StackNavigationProp<AuthStackParamList, 'OnboardingStep3'>;
type Props = {
  route: Step3RouteProp;
  navigation: Step3NavProp;
};

// --- DATA ---
const ALLERGY_LIST = [
  { id: 1, name: 'Peanuts' },
  { id: 2, name: 'Shellfish' },
  { id: 3, name: 'Dairy' },
  { id: 4, name: 'Gluten' },
  { id: 5, name: 'Soy' },
  { id: 6, name: 'Eggs' },
];

const CONDITION_LIST = [
  { id: 1, name: 'Knee Pain' },
  { id: 2, name: 'Lower Back Pain' },
  { id: 3, name: 'Asthma' },
  { id: 4, name: 'High Blood Pressure' },
];

const OnboardingStep3 = ({ route, navigation }: Props) => {
  const { ...prevData } = route.params;

  const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<number[]>([]);
  const [allergyQuery, setAllergyQuery] = useState('');
  const [conditionQuery, setConditionQuery] = useState('');
  
  // Loading State for API Call
  const [isLoading, setIsLoading] = useState(false);

  // --- LOGIC ---

  const addItem = (id: number, list: number[], setList: Function, setQuery: Function) => {
    if (!list.includes(id)) setList([...list, id]);
    setQuery('');
  };

  const removeItem = (id: number, list: number[], setList: Function) => {
    setList(list.filter(item => item !== id));
  };

  const getFilteredData = (query: string, masterList: any[], selectedList: number[]) => {
    if (!query.trim()) return [];
    return masterList.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) && 
      !selectedList.includes(item.id)
    );
  };

  // --- THE FINAL SUBMIT LOGIC ---
  const handleFinish = async () => {
    setIsLoading(true);

    // 1. Construct the Final Data Object
    const finalData = {
      ...prevData,
      allergyIds: selectedAllergies,
      medicalConditionIds: selectedConditions,
      dislikedFoodIds: [], // Empty
      equipmentIds: [],    // Empty
      customEquipmentNames: [] // Empty
    };

    try {
      console.log('Submitting Registration:', finalData);

      // 2. Call API
      const response = await axios.post(`${API_URL}/api/auth/register`, finalData);

      // 3. Save Token
      const { token } = response.data;
      await AsyncStorage.setItem('userToken', token);

      // 4. Navigate to Main App
      // We use reset() so they can't "go back" to the registration screen
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });

    } catch (error) {
      console.error('Registration Failed:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER COMPONENTS ---
  const RenderTag = ({ id, masterList, onRemove }: any) => {
    const item = masterList.find((e: any) => e.id === id);
    if (!item) return null;
    return (
      <TouchableOpacity onPress={() => onRemove(id)} style={styles.tag}>
        <Text style={styles.tagText}>{item.name}</Text>
        <Ionicons name="close-circle" size={14} color="#BFBFBF" style={{marginLeft: 8}} />
      </TouchableOpacity>
    );
  };

  const RenderSuggestion = ({ item, onPress }: any) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={onPress}>
      <Text style={styles.suggestionText}>{item.name}</Text>
      <Ionicons name="add-circle-outline" size={20} color="#D1D1D1" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" transparent={true} backgroundColor="transparent" />

      <ImageBackground
        source={require('../../assets/images/onboarding-bg-3.jpg')} 
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <BlurView intensity={25} tint="dark" style={styles.glassBox}>
              
              {/* Updated Step Count */}
              <Text style={styles.stepIndicator}>FINAL STEP</Text>
              <Text style={styles.title}>THE BIOLOGY</Text>
              <Text style={styles.subtitle}>Identify constraints.</Text>

              {/* ALLERGIES */}
              <View style={styles.inputLabelContainer}>
                <Ionicons name="alert-circle-outline" size={14} color="#8F8F8F" style={{marginRight: 8}} />
                <Text style={styles.inputLabel}>ALLERGIES</Text>
              </View>
              <View style={styles.tagsContainer}>
                {selectedAllergies.map(id => (
                  <RenderTag key={id} id={id} masterList={ALLERGY_LIST} onRemove={(id: number) => removeItem(id, selectedAllergies, setSelectedAllergies)} />
                ))}
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type to search..."
                  placeholderTextColor="#444" 
                  value={allergyQuery}
                  onChangeText={setAllergyQuery}
                />
                {allergyQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setAllergyQuery('')}><Ionicons name="close" size={16} color="#666" /></TouchableOpacity>
                )}
              </View>
              {allergyQuery.length > 0 && (
                <View style={styles.suggestionsBox}>
                  {getFilteredData(allergyQuery, ALLERGY_LIST, selectedAllergies).map(item => (
                    <RenderSuggestion key={item.id} item={item} onPress={() => addItem(item.id, selectedAllergies, setSelectedAllergies, setAllergyQuery)} />
                  ))}
                </View>
              )}

              {/* CONDITIONS */}
              <View style={[styles.inputLabelContainer, { marginTop: 20 }]}>
                <Ionicons name="medkit-outline" size={14} color="#8F8F8F" style={{marginRight: 8}} />
                <Text style={styles.inputLabel}>MEDICAL CONDITIONS</Text>
              </View>
              <View style={styles.tagsContainer}>
                {selectedConditions.map(id => (
                  <RenderTag key={id} id={id} masterList={CONDITION_LIST} onRemove={(id: number) => removeItem(id, selectedConditions, setSelectedConditions)} />
                ))}
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type to search..."
                  placeholderTextColor="#444" 
                  value={conditionQuery}
                  onChangeText={setConditionQuery}
                />
                {conditionQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setConditionQuery('')}><Ionicons name="close" size={16} color="#666" /></TouchableOpacity>
                )}
              </View>
              {conditionQuery.length > 0 && (
                <View style={styles.suggestionsBox}>
                  {getFilteredData(conditionQuery, CONDITION_LIST, selectedConditions).map(item => (
                    <RenderSuggestion key={item.id} item={item} onPress={() => addItem(item.id, selectedConditions, setSelectedConditions, setConditionQuery)} />
                  ))}
                </View>
              )}

              {/* FINISH BUTTON */}
              <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.finishButtonText}>INITIALIZE NUTRON</Text>
                )}
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
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  glassBox: { marginTop: 60, borderRadius: 20, padding: 25, backgroundColor: 'rgba(10, 10, 10, 0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  stepIndicator: { color: '#4F8DFF', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 5 },
  title: { fontSize: 24, fontWeight: '900', color: '#D1D1D1', letterSpacing: 4, marginBottom: 5, textTransform: 'uppercase' },
  subtitle: { fontSize: 11, fontWeight: '600', color: '#8F8F8F', letterSpacing: 2, marginBottom: 30, textTransform: 'uppercase' },
  inputLabelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  inputLabel: { color: '#8F8F8F', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 15, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  input: { flex: 1, fontSize: 15, color: '#BFBFBF', letterSpacing: 0.5, fontWeight: '500' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, marginBottom: 8 },
  tagText: { color: '#EAEAEA', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  suggestionsBox: { marginTop: 5, backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingVertical: 5, marginBottom: 20 },
  suggestionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  suggestionText: { color: '#BFBFBF', fontSize: 14, fontWeight: '500' },
  
  // FINISH BUTTON (Bright White/Silver to signify completion)
  // ... inside StyleSheet.create({ ... other styles above ...

  // FINISH BUTTON (Stealth Luxury Theme)
  finishButton: {
    backgroundColor: '#141414', // Deep Charcoal background
    height: 52, // Slightly taller for final action gravity
    borderRadius: 14, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 40, 
    borderWidth: 1.5, // Thicker, premium border
    borderColor: 'rgba(255,255,255,0.2)', // Subtle silver edge
    // Deep, dark shadow for presence
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
  },
  finishButtonText: { 
    color: '#D1D1D1', // Premium Silver text
    fontWeight: '900', 
    fontSize: 15, 
    letterSpacing: 4, // Wider spacing for cinematic feel
    textTransform: 'uppercase' 
  },
});

export default OnboardingStep3;