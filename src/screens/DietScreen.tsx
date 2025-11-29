import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  TouchableOpacity, StatusBar, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api'; 

// Enable Layout Animation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DietScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dietPlan, setDietPlan] = useState<any>(null);
  
  // Track which meals are eaten (Indices)
  const [consumedIndices, setConsumedIndices] = useState<Set<number>>(new Set());

  const fetchData = async () => {
    try {
      const response = await api.get('/api/v1/diet-plans/active');
      const data = response.data;
      
      if (data && data.planData) {
        setDietPlan(JSON.parse(data.planData));
      } else {
        setDietPlan(null);
      }
    } catch (error) {
      console.error("Failed to fetch diet", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // --- TOGGLE MEAL LOGIC ---
  const toggleMeal = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newIndices = new Set(consumedIndices);
    if (newIndices.has(index)) {
        newIndices.delete(index);
    } else {
        newIndices.add(index);
    }
    setConsumedIndices(newIndices);
  };

  // --- LIVE CALCULATOR ---
  const consumedStats = useMemo(() => {
    let acc = { protein: 0, carbs: 0, fat: 0, calories: 0 };
    if (!dietPlan || !dietPlan.meals) return acc;

    const totalMeals = dietPlan.meals.length || 1;

    // Estimate per-meal targets if AI didn't provide specific numbers
    const estPerMeal = {
        protein: (dietPlan.macros?.protein || 0) / totalMeals,
        carbs: (dietPlan.macros?.carbs || 0) / totalMeals,
        fat: (dietPlan.macros?.fat || 0) / totalMeals,
        calories: (dietPlan.caloriesTarget || 2000) / totalMeals,
    };

    dietPlan.meals.forEach((meal: any, index: number) => {
      if (consumedIndices.has(index)) {
        // Use specific meal data if available, otherwise use estimate
        acc.protein += meal.protein || estPerMeal.protein;
        acc.carbs += meal.carbs || estPerMeal.carbs;
        acc.fat += meal.fat || estPerMeal.fat;
        acc.calories += meal.calories || estPerMeal.calories;
      }
    });
    return acc;
  }, [consumedIndices, dietPlan]);

  // --- COMPONENT: MACRO BAR ---
  const MacroBar = ({ label, current, total, color }: any) => {
    const safeTotal = total || 1; 
    const percent = Math.min((current / safeTotal) * 100, 100);
    return (
      <View style={styles.macroRow}>
        <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 6}}>
           <Text style={styles.macroLabel}>{label}</Text>
           <Text style={styles.macroValue}>{Math.round(current)}g <Text style={{color:'#666'}}>/ {total}g</Text></Text>
        </View>
        <View style={styles.track}>
           <LinearGradient 
              colors={[color, 'rgba(0,0,0,0)']} 
              start={{x: 0, y: 0}} end={{x: 1, y: 0}}
              style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} 
           />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient colors={['rgba(255,255,255,0.05)', 'rgba(0,0,0,0)']} style={styles.topGradient} pointerEvents="none"/>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#FFF" />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>NUTRITION PROTOCOL</Text>
          <View style={styles.aiBadgeRow}>
             <Text style={styles.aiText}>AI OPTIMIZED</Text>
             <Ionicons name="flash" size={10} color="#03DAC6" style={{ marginLeft: 4, opacity: 0.8 }} />
          </View>
        </View>

        {!dietPlan ? (
             <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={40} color="#333" />
                <Text style={styles.emptyText}>NO DIET ASSIGNED</Text>
                <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('Chat')}>
                    <Text style={styles.createButtonText}>GENERATE MEAL PLAN</Text>
                </TouchableOpacity>
             </View>
        ) : (
          <>
            {/* 1. LIVE HUD */}
            <View style={styles.dashboardContainer}>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
                   <View>
                      <Text style={styles.calsLabel}>DAILY CALORIES</Text>
                      <Text style={styles.calsValue}>
                        {Math.round(consumedStats.calories)} 
                        <Text style={{color:'#666', fontSize: 20}}> / {dietPlan.caloriesTarget}</Text>
                        <Text style={{fontSize:14, color:'#888'}}> KCAL</Text>
                      </Text>
                   </View>
                   <Ionicons name="flame" size={24} color="#EAEAEA" style={{opacity:0.8}} />
                </View>

                <MacroBar label="PROTEIN" current={consumedStats.protein} total={dietPlan.macros?.protein || 0} color="#4F8DFF" />
                <MacroBar label="CARBS" current={consumedStats.carbs} total={dietPlan.macros?.carbs || 0} color="#03DAC6" />
                <MacroBar label="FATS" current={consumedStats.fat} total={dietPlan.macros?.fat || 0} color="#FFCF5C" />
            </View>

            <View style={styles.sectionDivider} />

            {/* 2. INTERACTIVE MEAL LIST */}
            <Text style={styles.sectionTitle}>FUELING SCHEDULE</Text>

            {dietPlan.meals?.map((meal: any, index: number) => {
               const isConsumed = consumedIndices.has(index);
               return (
                <View key={index} style={[styles.card, isConsumed && styles.cardComplete]}>
                    <View style={styles.cardLeft}>
                        <View style={styles.iconBox}>
                           <Ionicons name="restaurant" size={14} color="#FFF" />
                        </View>
                        <View style={{marginLeft: 15, flex: 1}}>
                           <Text style={[styles.mealName, isConsumed && styles.textStrikethrough]}>{meal.meal.toUpperCase()}</Text>
                           <Text style={[styles.foodName, isConsumed && {color:'#666'}]}>{meal.food}</Text>
                        </View>
                    </View>
                    
                    {/* TOGGLE BUTTON */}
                    <TouchableOpacity 
                       style={[styles.toggleButton, isConsumed ? styles.toggleActive : styles.toggleInactive]}
                       onPress={() => toggleMeal(index)}
                    >
                       <Ionicons name={isConsumed ? "checkmark" : "add"} size={16} color={isConsumed ? "#03DAC6" : "#000"} />
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
  container: { flex: 1, backgroundColor: '#000' },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#EAEAEA', letterSpacing: 1.5 },
  aiBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  aiText: { fontSize: 9, color: '#03DAC6', fontWeight: '700', letterSpacing: 1 },

  dashboardContainer: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 25,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 25,
  },
  calsLabel: { fontSize: 10, color: '#888', fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  calsValue: { fontSize: 32, color: '#FFF', fontWeight: '800', letterSpacing: 0.5 },

  macroRow: { marginBottom: 15 },
  macroLabel: { fontSize: 10, color: '#CCC', fontWeight: '700', letterSpacing: 1 },
  macroValue: { fontSize: 11, color: '#FFF', fontWeight: '700' },
  track: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow:'hidden' },
  fill: { height: '100%', borderRadius: 3 },

  sectionDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 20, marginHorizontal: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#666', letterSpacing: 2, marginBottom: 15, marginLeft: 5 },

  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 15, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  cardComplete: { opacity: 0.5, backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'transparent' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent:'center', alignItems:'center' },
  mealName: { fontSize: 10, color: '#888', fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  foodName: { fontSize: 13, color: '#EAEAEA', fontWeight: '600' },
  textStrikethrough: { textDecorationLine: 'line-through' },
  
  toggleButton: { width: 32, height: 32, borderRadius: 16, justifyContent:'center', alignItems:'center' },
  toggleInactive: { backgroundColor: '#EAEAEA' },
  toggleActive: { backgroundColor: 'rgba(3, 218, 198, 0.2)', borderWidth:1, borderColor: '#03DAC6' },

  emptyState: { alignItems: 'center', marginTop: 50, opacity: 0.7 },
  emptyText: { color: '#666', fontSize: 14, fontWeight: '700', letterSpacing: 2, marginTop: 15, marginBottom: 20 },
  createButton: { paddingVertical: 12, paddingHorizontal: 25, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 30 },
  createButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
});

export default DietScreen;