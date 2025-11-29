import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, ScrollView, 
  TouchableOpacity, StatusBar, RefreshControl, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api'; 
// Ensure this path matches your project structure
import { WorkoutResponse } from '../types/workout';

// Enable Layout Animation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const WorkoutScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Using 'any' here is intentional to handle flexible JSON keys from AI
  const [activeWorkout, setActiveWorkout] = useState<any>(null); 
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());

  const fetchWorkout = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/api/v1/workouts?date=${today}`);
      const data: WorkoutResponse = response.data;
      
      if (data && data.workoutData) {
        const parsedData = JSON.parse(data.workoutData);
        setActiveWorkout(parsedData);
      } else {
        setActiveWorkout(null);
      }
    } catch (error) {
      console.error("Failed to fetch workout", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorkout();
    }, [])
  );

  const toggleExercise = async (index: number, exerciseName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newIndices = new Set(completedIndices);
    const isMarkingComplete = !newIndices.has(index);

    if (isMarkingComplete) {
        newIndices.add(index);
    } else {
        newIndices.delete(index);
    }
    setCompletedIndices(newIndices);

    if (isMarkingComplete) {
        console.log(`Logged ${exerciseName}`);
    }
  };

  const progress = useMemo(() => {
    let acc = { completedSets: 0, totalSets: 0, burnedCals: 0 };
    if (!activeWorkout || !activeWorkout.exercises) return acc;

    activeWorkout.exercises.forEach((ex: any, index: number) => {
        // Fallback to 3 sets if AI sends a string plan instead of numbers
        const sets = ex.sets || 3; 
        const cals = ex.calories || 0;

        acc.totalSets += sets;
        if (completedIndices.has(index)) {
            acc.completedSets += sets;
            acc.burnedCals += cals;
        }
    });
    return acc;
  }, [completedIndices, activeWorkout]);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#fff" /></View>;

  // --- CRITICAL CRASH PREVENTION ---
  // These lines handle the "Undefined" errors by providing fallbacks
  const workoutName = activeWorkout?.workoutName || activeWorkout?.name || "Daily Protocol";
  const focusText = activeWorkout?.focus ? activeWorkout.focus.toUpperCase() : "TRAINING";
  const estimatedCalories = activeWorkout?.estimatedCalories || 300;
  const estimatedDuration = activeWorkout?.estimatedDurationMin || 45;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(0,0,0,0)']} style={styles.topGradient} pointerEvents="none"/>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWorkout(); }} tintColor="#FFF" />}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>TRAINING PROTOCOL</Text>
          <View style={styles.aiBadgeRow}>
             <Text style={styles.aiText}>AI OPTIMIZED</Text>
             <Ionicons name="flash" size={10} color="#03DAC6" style={{ marginLeft: 4, opacity: 0.8 }} />
          </View>
        </View>

        {!activeWorkout ? (
             <View style={styles.emptyState}>
                <Ionicons name="barbell-outline" size={40} color="#333" />
                <Text style={styles.emptyText}>NO MISSION ASSIGNED</Text>
                <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('Chat')}>
                    <Text style={styles.createButtonText}>GENERATE PROTOCOL</Text>
                </TouchableOpacity>
             </View>
        ) : (
          <>
            {/* 1. HUD CARD */}
            <View style={styles.dashboardContainer}>
                {/* Header Section */}
                <View style={styles.hudHeader}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.hudTitle}>{focusText}</Text>
                        <Text style={styles.hudSubtitle}>{workoutName.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.hudMeta, { marginTop: 6 }]}>
                         <Ionicons name="time-outline" size={13} color="#888" style={{marginRight:4}} />
                         <Text style={styles.hudMetaText}>{estimatedDuration} MIN</Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Muscle Pills */}
                <View style={styles.muscleRow}>
                    {activeWorkout.muscleGroups?.map((muscle: string, i: number) => (
                        <View key={i} style={styles.muscleTag}>
                            <Text style={styles.muscleText}>{muscle}</Text>
                        </View>
                    ))}
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                      <View style={[styles.progressRow, { marginBottom: 4 }]}>
                        <Text style={styles.progressLabel}>CALORIES BURNED</Text>
                        <Text style={styles.progressValue}>
                            {Math.round(progress.burnedCals)} <Text style={{color:'#666'}}>/ {estimatedCalories}</Text>
                        </Text>
                      </View>
                      <View style={styles.track}>
                        <View style={[styles.fill, { width: `${(progress.burnedCals / estimatedCalories)*100}%` }]} />
                      </View>
                      <Text style={styles.aiAnchorText}>AI adjusts training intensity based on your logs.</Text>
                </View>
            </View>

            {/* 2. DIVIDER LINE */}
            <View style={styles.sectionDivider} />

            {/* 3. EXERCISE SEQUENCE */}
            <Text style={styles.sectionTitle}>EXERCISE SEQUENCE</Text>

            {activeWorkout.exercises?.map((ex: any, index: number) => {
              const isComplete = completedIndices.has(index);
              
              // --- SAFE KEY EXTRACTION ---
              // Checks for 'name' (old format) AND 'exercise' (new format)
              const exerciseName = ex.name || ex.exercise || "Unknown Exercise";
              
              const hasSpecificStats = ex.sets && ex.reps;
              const planText = ex.plan || "";

              return (
                <View key={index} style={[styles.card, isComplete && styles.cardComplete]}>
                    <View style={{flex: 1, paddingRight: 10}}>
                        <View style={styles.cardHeader}>
                            <Ionicons name={isComplete ? "checkmark-circle" : "ellipse-outline"} size={10} color={isComplete ? "#03DAC6" : "#666"} style={{ marginRight: 10, marginLeft: 4, marginTop: 2 }} />
                            <Text style={[styles.exerciseName, isComplete && styles.textStrikethrough]}>
                                {exerciseName.toUpperCase()}
                            </Text>
                        </View>
                        
                        <Text style={styles.statsText}>
                           {hasSpecificStats 
                              ? `${ex.sets} Sets  ·  ${ex.reps} Reps  ·  RPE ${ex.rpe}`
                              : planText 
                           }
                           {ex.calories ? <Text style={{color: '#4F8DFF'}}>  ·  {ex.calories} kcal</Text> : null}
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={[styles.miniToggle, isComplete ? styles.miniToggleActive : styles.miniToggleInactive]}
                        onPress={() => toggleExercise(index, exerciseName)}
                        activeOpacity={0.6}
                        hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} 
                    >
                        <Text style={[styles.miniToggleText, isComplete ? styles.miniTextActive : styles.miniTextInactive]}>
                            {isComplete ? "COMPLETE" : "LOG"}
                        </Text>
                        {isComplete && <Ionicons name="checkmark" size={10} color="#03DAC6" style={{marginLeft: 4}} />}
                    </TouchableOpacity>
                </View>
              );
            })}

            {/* 4. TERMINATE BUTTON */}
            <TouchableOpacity 
                style={styles.terminateButton}
                onPress={() => navigation.navigate('Dashboard')}
            >
                <Text style={styles.terminateText}>TERMINATE MISSION</Text>
                <Ionicons name="arrow-forward" size={10} color="#444" style={{marginLeft: 8}} />
            </TouchableOpacity>

          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#000' },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  
  // HEADER
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#EAEAEA', letterSpacing: 1.5 },
  aiBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  aiText: { fontSize: 9, color: '#03DAC6', fontWeight: '700', letterSpacing: 1 },

  // MAIN CARD (HUD)
  dashboardContainer: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 25,
  },
  hudHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  hudTitle: { fontSize: 10, color: '#888', fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  hudSubtitle: { fontSize: 16, color: '#FFF', fontWeight: '800', letterSpacing: 0.5 },
  hudMeta: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  hudMetaText: { fontSize: 10, color: '#CCC', fontWeight: '700' },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 10 },
  
  // PILLS
  muscleRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }, 
  muscleTag: { 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 8, marginRight: 6, marginBottom: 6 
  },
  muscleText: { fontSize: 10, color: '#CCC', fontWeight: '600' }, 

  // PROGRESS
  progressSection: { marginTop: 4 }, 
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 10, color: '#666', fontWeight: '700', letterSpacing: 1 },
  progressValue: { fontSize: 11, color: '#FFF', fontWeight: '700' },
  track: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
  fill: { height: '100%', backgroundColor: '#03DAC6', borderRadius: 2 },
  aiAnchorText: { marginTop: 8, fontSize: 9, color: '#444', fontStyle: 'italic', textAlign: 'center' },

  // DIVIDER LINE
  sectionDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 20, marginHorizontal: 10 },

  // EXERCISE CARDS
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#666', letterSpacing: 2, marginBottom: 15, marginLeft: 5 },
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  cardComplete: {
    opacity: 0.4, borderColor: 'transparent', backgroundColor: 'rgba(0,0,0,0.2)'
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  exerciseName: { fontSize: 13, color: '#EAEAEA', fontWeight: '700', letterSpacing: 0.5, lineHeight: 18 },
  textStrikethrough: { textDecorationLine: 'line-through', color: '#666' },

  // STATS
  statsText: { fontSize: 11, color: '#888', fontWeight: '500', paddingLeft: 24, letterSpacing: 0.3 }, 

  // LOG BUTTON
  miniToggle: {
    height: 34, 
    paddingHorizontal: 12,
    borderRadius: 17,
    borderWidth: 1,
    minWidth: 70, 
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
  },
  miniToggleInactive: { borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'transparent' }, 
  miniToggleActive: { borderColor: '#03DAC6', backgroundColor: 'rgba(3, 218, 198, 0.08)' },
  miniToggleText: { fontSize: 10, fontWeight: '500', letterSpacing: 0.5 }, 
  miniTextInactive: { color: '#AAA' },
  miniTextActive: { color: '#03DAC6' },

  // FOOTER
  terminateButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20, marginTop: 10, opacity: 0.5 },
  terminateText: { color: '#444', fontSize: 10, fontWeight: '700', letterSpacing: 2 },

  emptyState: { alignItems: 'center', marginTop: 50, opacity: 0.7 },
  emptyText: { color: '#666', fontSize: 14, fontWeight: '700', letterSpacing: 2, marginTop: 15, marginBottom: 20 },
  createButton: { paddingVertical: 12, paddingHorizontal: 25, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 30 },
  createButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
});

export default WorkoutScreen;