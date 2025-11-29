import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Sparkles, 
  Dumbbell, 
  Check, 
  Activity
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// --- TYPES ---
type SetData = {
  id: string;
  weight: string;
  reps: string;
  rpe: string;
};

type Exercise = {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  targetRpe: number;
  sets: SetData[];
  isCompleted: boolean;
};

// --- MOCK DATA (Matches your JSON structure) ---
const INITIAL_PLAN: Exercise[] = [
  {
    id: 'e1',
    name: 'Incline Dumbbell Press',
    targetSets: 3,
    targetReps: '8-10',
    targetRpe: 8,
    isCompleted: false,
    sets: [
      { id: 's1', weight: '32', reps: '10', rpe: '8' }, // AI Autofilled
      { id: 's2', weight: '32', reps: '9', rpe: '8.5' },
      { id: 's3', weight: '', reps: '', rpe: '' },
    ],
  },
  {
    id: 'e2',
    name: 'Cable Lateral Raise',
    targetSets: 4,
    targetReps: '12-15',
    targetRpe: 9,
    isCompleted: false,
    sets: [
      { id: 's1', weight: '12.5', reps: '15', rpe: '9' },
      { id: 's2', weight: '', reps: '', rpe: '' },
      { id: 's3', weight: '', reps: '', rpe: '' },
      { id: 's4', weight: '', reps: '', rpe: '' },
    ],
  },
];

const WorkoutLoggerScreen = () => {
  const navigation = useNavigation();
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_PLAN);

  // --- ACTIONS ---
  const handleSetChange = (exerciseIndex: number, setIndex: number, field: keyof SetData, value: string) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  const toggleComplete = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].isCompleted = !updatedExercises[exerciseIndex].isCompleted;
    setExercises(updatedExercises);
  };

  const handleConfirmLog = () => {
    console.log('Mission Logged:', JSON.stringify(exercises, null, 2));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* 1. HEADER: Tactical OS Style */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>MISSION PROTOCOL — ACTIVE LOG</Text>
          <View style={styles.headerSubRow}>
            <Sparkles color="#4da6ff" size={12} style={{ marginRight: 6 }} />
            <Text style={styles.headerSubtitle}>AI-Optimized Based on Your Recent Logs</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 2. EXERCISE CARDS STACK */}
          {exercises.map((exercise, exerciseIndex) => (
            <View 
              key={exercise.id} 
              style={[
                styles.card, 
                exercise.isCompleted && styles.cardCompleted
              ]}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={styles.iconContainer}>
                    <Dumbbell color="#fff" size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.aiPredictionText}>
                      AI Predicted: {exercise.targetSets} sets • {exercise.targetReps} reps • RPE {exercise.targetRpe}
                    </Text>
                  </View>
                  
                  {/* Check Mark Button */}
                  <TouchableOpacity 
                    style={[
                      styles.completeButton, 
                      exercise.isCompleted && styles.completeButtonActive
                    ]}
                    onPress={() => toggleComplete(exerciseIndex)}
                  >
                    {exercise.isCompleted ? (
                      <Check color="#000" size={14} strokeWidth={4} />
                    ) : (
                      <View style={styles.completeButtonPlaceholder} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Minimal Divider */}
              <View style={styles.divider} />

              {/* Sets Rows */}
              <View style={styles.setsContainer}>
                {exercise.sets.map((set, setIndex) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={styles.setLabel}>SET {setIndex + 1}</Text>
                    
                    <View style={styles.inputsRow}>
                      {/* Weight Pill */}
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.input}
                          value={set.weight}
                          onChangeText={(text) => handleSetChange(exerciseIndex, setIndex, 'weight', text)}
                          placeholder="0"
                          placeholderTextColor="rgba(255,255,255,0.2)"
                          keyboardType="numeric"
                        />
                        <Text style={styles.unitText}>KG</Text>
                      </View>

                      {/* Reps Pill */}
                      <View style={[styles.inputWrapper, { width: 70 }]}>
                        <TextInput
                          style={styles.input}
                          value={set.reps}
                          onChangeText={(text) => handleSetChange(exerciseIndex, setIndex, 'reps', text)}
                          placeholder="0"
                          placeholderTextColor="rgba(255,255,255,0.2)"
                          keyboardType="numeric"
                        />
                        <Text style={styles.unitText}>REPS</Text>
                      </View>

                      {/* RPE Pill */}
                      <View style={[styles.inputWrapper, { width: 60, borderColor: 'rgba(77, 166, 255, 0.3)' }]}>
                        <TextInput
                          style={[styles.input, { color: '#4da6ff' }]}
                          value={set.rpe}
                          onChangeText={(text) => handleSetChange(exerciseIndex, setIndex, 'rpe', text)}
                          placeholder="-"
                          placeholderTextColor="rgba(77, 166, 255, 0.3)"
                          keyboardType="numeric"
                          maxLength={3}
                        />
                        <Text style={[styles.unitText, { color: '#4da6ff' }]}>RPE</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Bottom Card Action Text */}
              <TouchableOpacity 
                style={styles.markDoneRow}
                onPress={() => toggleComplete(exerciseIndex)}
              >
                <Text style={styles.markDoneText}>
                  {exercise.isCompleted ? 'LOGGED' : 'MARK COMPLETED'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Spacer for Floating Button */}
          <View style={{ height: 100 }} /> 
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 4. BOTTOM CTA */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleConfirmLog} activeOpacity={0.9}>
          <LinearGradient
            colors={['#ffffff', '#b0b0b0']}
            style={styles.confirmButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <Activity color="#000" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.confirmButtonText}>CONFIRM MISSION LOG</Text>
            <ArrowLeft style={{ transform: [{ rotate: '180deg' }], marginLeft: 8 }} color="#000" size={18} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure Black as requested
  },
  // --- HEADER ---
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2, // Tactical spacing
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '500',
  },
  
  // --- SCROLLVIEW ---
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },

  // --- EXERCISE CARD ---
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)', // Glass effect
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16, // Vertical spacing between cards
    padding: 18,
  },
  cardCompleted: {
    opacity: 0.5, // Dim when done
    borderColor: 'rgba(255,255,255,0.02)',
  },
  cardHeader: {
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  aiPredictionText: {
    color: '#4da6ff', // Nutron Blue
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  completeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  completeButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  completeButtonPlaceholder: {
    width: 0, 
    height: 0,
  },
  
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 12,
  },

  // --- SETS ROWS ---
  setsContainer: {
    gap: 10,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '700',
    width: 40,
    letterSpacing: 1,
  },
  inputsRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 8,
  },
  inputWrapper: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 34,
    width: 85,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    padding: 0,
  },
  unitText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 4,
  },

  // --- BOTTOM CARD FOOTER ---
  markDoneRow: {
    marginTop: 14,
    alignItems: 'flex-end',
  },
  markDoneText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // --- BOTTOM FLOATING CTA ---
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.9)', // Fade out background
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  confirmButton: {
    height: 54,
    borderRadius: 27,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default WorkoutLoggerScreen;