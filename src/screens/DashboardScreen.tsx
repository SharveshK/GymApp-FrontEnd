import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, ScrollView, 
  RefreshControl, TouchableOpacity, StatusBar 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DashboardScreen = ({ navigation }: any) => {
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [latestFat, setLatestFat] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await api.get('/api/v1/progress-logs');
      const logs = response.data;
      if (logs && logs.length > 0) {
        const currentLog = logs[logs.length - 1];
        setLatestWeight(currentLog.weightKg);
        setLatestFat(currentLog.bodyFatPercentage);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  // --- COMPONENT: GLASS GRID BUTTON ---
  const GridButton = ({ title, subtitle, icon, onPress, titleColor = "#EDEDED" }: any) => (
    <TouchableOpacity style={styles.gridButton} onPress={onPress}>
      <View style={styles.iconCircle}>
        {/* FIX #1: Brightened Icons (75% White) */}
        <Ionicons name={icon} size={24} color="rgba(255,255,255,0.75)" />
      </View>
      <View>
        <Text style={[styles.gridTitle, { color: titleColor }]}>{title}</Text>
        <Text style={styles.gridSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#444" />
      </View>
    );
  }

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
        
        {/* --- HEADER ROW --- */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => alert("Profile Coming Soon")} style={styles.profileButton}>
            {/* FIX #1: Brightened Profile Icon */}
            <Ionicons name="person" size={18} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
          <View style={styles.headerTextView}>
            <Text style={styles.headerTitle}>COMMAND CENTER</Text>
            <Text style={styles.subGreeting}>SYSTEMS ONLINE.</Text>
          </View>
          <View style={{ width: 40 }} /> 
        </View>

        {/* --- METRICS ROW --- */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
               {/* FIX #1: Brightened Icon */}
               <Ionicons name="scale-outline" size={14} color="rgba(255,255,255,0.75)" style={{marginRight: 6}} />
               <Text style={styles.statLabel}>CURRENT WEIGHT</Text>
            </View>
            <Text style={styles.statValue}>
              {latestWeight ? latestWeight : '--'} <Text style={styles.statUnit}>KG</Text>
            </Text>
          </View>
          
          <View style={styles.statBox}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
               {/* FIX #1: Brightened Icon */}
               <Ionicons name="body-outline" size={14} color="rgba(255,255,255,0.75)" style={{marginRight: 6}} />
               <Text style={styles.statLabel}>BODY FAT</Text>
            </View>
            <Text style={styles.statValue}>
              {latestFat ? latestFat : '--'} <Text style={styles.statUnit}>%</Text>
            </Text>
          </View>
        </View>

        {/* --- OPERATIONS GRID --- */}
        <Text style={styles.sectionTitle}>OPERATIONS</Text>
        
        <View style={styles.grid}>
          <GridButton 
            title="WORKOUTS" 
            subtitle="View Schedule" 
            icon="barbell" 
            onPress={() => navigation.navigate('Plan')}
          />
          
          <GridButton 
            title="LOG DATA" 
            subtitle="Track Progress" 
            icon="add-circle" 
            onPress={() => navigation.navigate('Log')}
          />

          <GridButton 
            title="NUTRITION" 
            subtitle="Meal Plans" 
            icon="restaurant" 
            // CHANGE THIS LINE BELOW:
            onPress={() => navigation.navigate('Diet')} 
          />

          <GridButton 
            title="ANALYTICS" 
            subtitle="View Graphs" 
            icon="stats-chart" 
            titleColor="#4F8DFF"
            onPress={() => alert("Analytics Coming Soon")} 
          />
        </View>

        {/* --- THE ORACLE --- */}
        <TouchableOpacity 
          style={styles.oracleButton} 
          onPress={() => navigation.navigate('Chat')}
        >
          <View style={styles.oracleIconBox}>
            <Ionicons name="sparkles" size={22} color="#000" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.oracleTitle}>CONSULT THE ORACLE</Text>
            <Text style={styles.oracleSubtitle}>AI Coaching Assistant</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#4F8DFF" />
        </TouchableOpacity>

        {/* FIX #3 & #4: Logout Styling */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>TERMINATE SESSION</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000' }, 
  
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 1 },
  
  scrollContent: { padding: 20, paddingTop: 60 },

  // HEADER
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 35 },
  profileButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)'
  },
  headerTextView: { alignItems: 'center' },
  headerTitle: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#EDEDED', 
    letterSpacing: 1.2, 
    textTransform: 'uppercase',
  },
  subGreeting: { 
    fontSize: 10, 
    fontWeight: '600', 
    color: 'rgba(255,255,255,0.5)', 
    letterSpacing: 2, 
    marginTop: 4 
  },

  // METRICS (FIX #4 & #2)
  statsContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    // FIX #4: Premium Glass Texture
    backgroundColor: 'rgba(255,255,255,0.04)', 
    borderRadius: 18, 
    paddingVertical: 22, 
    paddingHorizontal: 10,
    marginBottom: 30,
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.06)',
    // FIX #2: Subtle Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { 
    fontSize: 10, 
    color: '#888', 
    fontWeight: '600', 
    letterSpacing: 1, 
    textTransform: 'uppercase' 
  },
  statValue: { fontSize: 30, fontWeight: '900', color: '#EAEAEA' }, 
  statUnit: { fontSize: 14, color: '#666', fontWeight: '600' },

  // GRID
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#666', letterSpacing: 2, marginBottom: 15, marginLeft: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  
  gridButton: {
    width: '48%',
    aspectRatio: 1.1,
    // FIX #4: Premium Glass Texture
    backgroundColor: 'rgba(255,255,255,0.04)', 
    borderRadius: 18, 
    padding: 20, 
    marginBottom: 15,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    // FIX #2: Subtle Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.03)', 
    justifyContent: 'center', alignItems: 'center',
  },
  gridTitle: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5, marginTop: 12 }, 
  gridSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },

  // ORACLE BUTTON
  oracleButton: {
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 18, 
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', // FIX #4
    borderWidth: 1,
    borderColor: 'rgba(79, 141, 255, 0.3)', 
    flexDirection: 'row', alignItems: 'center',
    // FIX #2: Shadow on Oracle too
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  oracleIconBox: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: '#D1D1D1',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  oracleTitle: { fontSize: 15, fontWeight: '900', color: '#EAEAEA', letterSpacing: 1 },
  oracleSubtitle: { fontSize: 12, color: '#888', marginTop: 4 },

  // FIX #3: Spacing, Size, Opacity
  logoutButton: { marginTop: 30, alignItems: 'center', padding: 15 },
  logoutText: { 
    color: '#444', 
    fontSize: 10, // Smaller
    fontWeight: '700', 
    letterSpacing: 2, 
    textTransform: 'uppercase',
    opacity: 0.35 // Faded
  },
});

export default DashboardScreen;