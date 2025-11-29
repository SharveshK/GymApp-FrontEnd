import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, ScrollView, 
  TouchableOpacity, StatusBar, RefreshControl 
} from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App'; 

type PlanScreenNavigationProp = StackNavigationProp<RootStackParamList, 'WorkoutLogger'>;

type WorkoutPlan = {
  workoutId: number;
  workoutDate: string;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  workoutData: string;
};

const PlanScreen = () => {
  const navigation = useNavigation<PlanScreenNavigationProp>();
  
  // Get Today's Date
  const todayISO = new Date().toISOString().split('T')[0];
  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  }).toUpperCase(); 

  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [parsedPlan, setParsedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkout = async () => {
    setLoading(true);
    setWorkout(null);
    setParsedPlan(null);
    try {
      // Always fetch TODAY
      const response = await api.get(`/api/v1/workouts?date=${todayISO}`);
      if (response.data) {
        setWorkout(response.data);
        setParsedPlan(JSON.parse(response.data.workoutData));
      }
    } catch (error) {
      // 404 is expected for Rest Days
      console.log("No workout found for today.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkout();
  };

  const exerciseCount = parsedPlan?.exercises?.length || 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(0,0,0,0)']} 
        style={styles.topGradient}
        pointerEvents="none"
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
      >
        
        {/* --- HEADER --- */}
        <View style={styles.headerContainer}>
          <Text style={styles.dateText}>{todayDisplay}</Text>
          <Text style={styles.screenTitle}>MISSION PROTOCOL</Text>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color="#4F8DFF" style={{marginRight: 6}} />
            <Text style={styles.aiText}>AI OPTIMIZED BASED ON RECENT LOGS</Text>
          </View>
        </View>

        {/* --- LOADING --- */}
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#444" />
            <Text style={styles.loadingText}>DECRYPTING...</Text>
          </View>
        )}

        {/* --- STATE 1: WORKOUT ASSIGNED --- */}
        {!loading && workout && parsedPlan && (
          <View style={styles.heroCard}>
            
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Ionicons name="barbell" size={32} color="#EAEAEA" />
              </View>
              <View>
                <Text style={styles.workoutTitle}>{parsedPlan.name || "DAILY WORKOUT"}</Text>
                <Text style={styles.workoutMeta}>{exerciseCount} EXERCISES • EST. 60 MIN</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>OBJECTIVES:</Text>
              {parsedPlan.exercises?.slice(0, 4).map((ex: any, index: number) => (
                <View key={index} style={styles.exerciseRow}>
                  <Ionicons name="radio-button-on" size={12} color="#4F8DFF" style={{marginTop: 2}} />
                  <Text style={styles.exName}>{ex.exercise}</Text>
                </View>
              ))}
              {exerciseCount > 4 && (
                <Text style={styles.moreText}>+ {exerciseCount - 4} MORE...</Text>
              )}
            </View>

            {workout.status === 'COMPLETED' ? (
              <View style={styles.completedBox}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.completedText}>MISSION ACCOMPLISHED</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => {
                  navigation.navigate('WorkoutLogger', {
                    workoutPlanId: workout.workoutId,
                    planData: parsedPlan
                  });
                }}
              >
                <Text style={styles.startButtonText}>START MISSION</Text>
                <Ionicons name="arrow-forward" size={18} color="#000" style={{marginLeft: 8}} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* --- STATE 2: REST DAY (Simplified) --- */}
        {!loading && !workout && (
          <View style={[styles.heroCard, { borderColor: 'rgba(76, 175, 80, 0.2)' }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                <Ionicons name="leaf" size={32} color="#4CAF50" />
              </View>
              <View>
                <Text style={styles.workoutTitle}>RECOVERY PROTOCOL</Text>
                <Text style={styles.workoutMeta}>ACTIVE REST • MOBILITY</Text>
              </View>
            </View>

            <Text style={styles.restDescription}>
              No heavy operations assigned today. Your primary objective is recovery. Focus on sleep quality, hydration, and protein intake.
            </Text>
            
            {/* No Button here anymore. Just information. */}
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, zIndex: 1 },
  scrollContent: { padding: 20, paddingTop: 60, flexGrow: 1 },
  center: { alignItems: 'center', marginTop: 50 },
  loadingText: { color: '#666', fontSize: 10, letterSpacing: 2, marginTop: 10, fontWeight: '700' },

  headerContainer: { marginBottom: 40 },
  dateText: { color: '#4F8DFF', fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 5, textTransform: 'uppercase' },
  screenTitle: { fontSize: 32, fontWeight: '900', color: '#EAEAEA', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', opacity: 0.8 },
  aiText: { color: '#888', fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },

  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  workoutTitle: { fontSize: 20, fontWeight: '800', color: '#EAEAEA', letterSpacing: 1, textTransform: 'uppercase' },
  workoutMeta: { fontSize: 12, color: '#888', fontWeight: '700', marginTop: 4, letterSpacing: 0.5 },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 20 },

  previewContainer: { marginBottom: 30 },
  previewLabel: { fontSize: 10, color: '#666', fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  exName: { fontSize: 15, color: '#CCC', fontWeight: '500', marginLeft: 10 },
  moreText: { fontSize: 12, color: '#666', fontStyle: 'italic', marginTop: 5, marginLeft: 22 },

  restDescription: { fontSize: 14, color: '#AAA', lineHeight: 22, marginBottom: 10 },

  startButton: {
    backgroundColor: '#EAEAEA',
    height: 56, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: "#FFF", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  startButtonText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 2 },

  completedBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.3)'
  },
  completedText: { color: '#4CAF50', fontWeight: '800', fontSize: 14, letterSpacing: 1, marginLeft: 10 },
});

export default PlanScreen;