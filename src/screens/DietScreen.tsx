import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, ScrollView, 
  TouchableOpacity, StatusBar, RefreshControl, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api'; 
import { DietPlanResponse, AiDietPlanData, MealItem } from '../types/diet';

// Enable Layout Animation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DietScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePlan, setActivePlan] = useState<AiDietPlanData | null>(null);
  const [eatenIndices, setEatenIndices] = useState<Set<number>>(new Set());

  const fetchDietPlan = async () => {
    try {
      const response = await api.get('/api/v1/diet-plans/active');
      const data: DietPlanResponse = response.data;
      
      if (data && data.planData) {
        const parsedData: AiDietPlanData = JSON.parse(data.planData);
        setActivePlan(parsedData);
      }
    } catch (error) {
      console.error("Failed to fetch diet plan", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDietPlan();
    }, [])
  );

  const toggleMeal = async (index: number, meal: MealItem) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newIndices = new Set(eatenIndices);
    const isMarkingAsEaten = !newIndices.has(index);

    if (isMarkingAsEaten) {
        newIndices.add(index);
    } else {
        newIndices.delete(index);
    }
    setEatenIndices(newIndices);

    if (isMarkingAsEaten) {
        try {
            await api.post('/api/v1/meal-logs', {
                logDate: new Date().toISOString().split('T')[0],
                mealType: meal.meal || "Snack", // Fallback
                foodDescription: meal.food || "Unknown Food", // Fallback
                calories: meal.calories || 0,
                proteinG: meal.macros?.protein || 0 
            });
        } catch (e) {
            console.error("Failed to log meal", e);
        }
    }
  };

  const consumed = useMemo(() => {
    let acc = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    if (!activePlan) return acc;

    activePlan.meals?.forEach((meal, index) => { // Added ?. check
        if (eatenIndices.has(index)) {
            acc.calories += meal.calories || 0;
            acc.protein += meal.macros?.protein || 0;
            acc.carbs += meal.macros?.carbs || 0;
            acc.fat += meal.macros?.fat || 0;
        }
    });
    return acc;
  }, [eatenIndices, activePlan]);

  const ProgressBar = ({ label, current, total, color }: any) => {
    const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;
    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>{label}</Text>
                <Text style={styles.progressValue}>
                    {Math.round(current)} / <Text style={{color:'#666'}}>{total || 0}g</Text>
                </Text>
            </View>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#fff" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(0,0,0,0)']} style={styles.topGradient} pointerEvents="none"/>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDietPlan(); }} tintColor="#FFF" />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>NUTRITION PROTOCOL</Text>
          <Text style={styles.dateText}>TODAY'S HUD</Text>
        </View>

        {!activePlan || !activePlan.meals ? (
             <View style={styles.emptyState}>
                <Text style={styles.emptyText}>NO ACTIVE PROTOCOL</Text>
                <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('Chat')}>
                    <Text style={styles.createButtonText}>CONSULT ORACLE</Text>
                </TouchableOpacity>
             </View>
        ) : (
          <>
            {/* 1. DYNAMIC HUD */}
            <View style={styles.dashboardContainer}>
                <View style={styles.mainStat}>
                    <Text style={styles.mainStatValue}>
                        {Math.round(consumed.calories)} <Text style={styles.mainStatTotal}>/ {activePlan.caloriesTarget || 2000} kcal</Text>
                    </Text>
                    <View style={styles.calTrack}>
                        <View style={[styles.calFill, { width: `${activePlan.caloriesTarget > 0 ? Math.min((consumed.calories / activePlan.caloriesTarget)*100, 100) : 0}%` }]} />
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.macroList}>
                    <ProgressBar label="PROTEIN" current={consumed.protein} total={activePlan.macros?.protein} color="#4F8DFF" />
                    <ProgressBar label="CARBS" current={consumed.carbs} total={activePlan.macros?.carbs} color="#03DAC6" />
                    <ProgressBar label="FATS" current={consumed.fat} total={activePlan.macros?.fat} color="#FFB74D" />
                </View>
                
                <Text style={styles.hudFooter}>
                    Protocol adjusts automatically as you log data.
                </Text>
            </View>

            {/* 2. MEAL LIST */}
            <Text style={styles.sectionTitle}>EXECUTION QUEUE</Text>

            {activePlan.meals.map((meal, index) => {
              const isEaten = eatenIndices.has(index);
              // Safe access for the title
              const mealTitle = meal.meal ? meal.meal.toUpperCase() : "MEAL";
              
              return (
                <View key={index} style={[styles.mealCard, isEaten && styles.mealCardEaten]}>
                    <View style={{flex: 1, paddingRight: 10}}>
                        <View style={styles.mealHeader}>
                            <Ionicons name={isEaten ? "checkmark-circle" : "ellipse-outline"} size={10} color={isEaten ? "#03DAC6" : "#666"} style={{marginRight: 6}} />
                            <Text style={[styles.mealType, isEaten && styles.textDim]}>{mealTitle}</Text>
                        </View>
                        <Text style={[styles.foodName, isEaten && styles.textStrikethrough]}>{meal.food || "Unknown Item"}</Text>
                        
                        {!isEaten && (
                            <Text style={styles.tinyMacros}>
                                {meal.calories || 0}kcal • {meal.macros?.protein || 0}P • {meal.macros?.carbs || 0}C • {meal.macros?.fat || 0}F
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity 
                        style={[styles.miniToggle, isEaten ? styles.miniToggleActive : styles.miniToggleInactive]}
                        onPress={() => toggleMeal(index, meal)}
                        activeOpacity={0.6}
                        hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                    >
                        <Text style={[styles.miniToggleText, isEaten ? styles.miniTextActive : styles.miniTextInactive]}>
                            {isEaten ? "LOGGED ✓" : "LOG"}
                        </Text>
                    </TouchableOpacity>
                </View>
              );
            })}
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#EAEAEA', letterSpacing: 1.5 },
  dateText: { fontSize: 10, color: '#666', fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  
  dashboardContainer: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 30,
  },
  mainStat: { marginBottom: 15 },
  mainStatValue: { fontSize: 28, color: '#FFF', fontWeight: '900', marginBottom: 8 },
  mainStatTotal: { fontSize: 14, color: '#666', fontWeight: '600' },
  calTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  calFill: { height: '100%', backgroundColor: '#EAEAEA' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
  macroList: { gap: 12 },
  progressContainer: {},
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel: { fontSize: 10, color: '#888', fontWeight: '700', letterSpacing: 1 },
  progressValue: { fontSize: 11, color: '#EEE', fontWeight: '700' },
  track: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
  fill: { height: '100%', borderRadius: 2 },
  hudFooter: { marginTop: 15, fontSize: 10, color: '#555', textAlign: 'center', fontStyle: 'italic' },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#666', letterSpacing: 2, marginBottom: 15, marginLeft: 5 },
  
  mealCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  mealCardEaten: {
    opacity: 0.4, borderColor: 'transparent', backgroundColor: 'rgba(0,0,0,0.2)'
  },
  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  mealType: { fontSize: 10, color: '#888', fontWeight: '800', letterSpacing: 1 },
  foodName: { fontSize: 14, color: '#EAEAEA', fontWeight: '600', marginBottom: 6 },
  textStrikethrough: { textDecorationLine: 'line-through', color: '#666' },
  textDim: { color: '#444' },
  tinyMacros: { fontSize: 10, color: '#4F8DFF', fontWeight: '600', opacity: 0.9 },

  miniToggle: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1,
    minWidth: 60, alignItems: 'center', justifyContent: 'center',
  },
  miniToggleInactive: { borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'transparent' },
  miniToggleActive: { borderColor: '#03DAC6', backgroundColor: 'rgba(3, 218, 198, 0.1)' },
  miniToggleText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  miniTextInactive: { color: '#888' },
  miniTextActive: { color: '#03DAC6' },

  emptyState: { alignItems: 'center', marginTop: 50, opacity: 0.7 },
  emptyText: { color: '#666', fontSize: 14, fontWeight: '700', letterSpacing: 2, marginBottom: 20 },
  createButton: { paddingVertical: 12, paddingHorizontal: 25, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 30 },
  createButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
});

export default DietScreen;