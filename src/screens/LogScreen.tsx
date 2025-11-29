import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

// --- DATA LISTS ---
const SORENESS_AREAS = ['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core'];
const ENERGY_LEVELS = [
  { label: 'LOW 😴', value: 'LOW' },
  { label: 'GOOD 😐', value: 'GOOD' },
  { label: 'FIRE 🔥', value: 'HIGH' }
];
const SLEEP_QUALITY = [
  { label: 'POOR', value: 'POOR' },
  { label: 'OKAY', value: 'OKAY' },
  { label: 'GREAT', value: 'GREAT' }
];

const LogScreen = ({ navigation }: any) => {
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  
  const [energy, setEnergy] = useState('');
  const [sleep, setSleep] = useState('');
  const [soreness, setSoreness] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const todayDate = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  }).toUpperCase();
  const todayYear = new Date().getFullYear();

  useEffect(() => {
    const fetchLastWeight = async () => {
      try {
        const response = await api.get('/api/v1/progress-logs');
        const logs = response.data;
        if (logs && logs.length > 0) {
          const lastLog = logs[logs.length - 1];
          if (lastLog.weightKg) setWeight(lastLog.weightKg.toString());
        }
      } catch (error) {
        console.log("No previous logs.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchLastWeight();
  }, []);

  const toggleSoreness = (area: string) => {
    if (soreness.includes(area)) {
      setSoreness(soreness.filter(s => s !== area));
    } else {
      setSoreness([...soreness, area]);
    }
  };

  const handleSubmit = async () => {
    if (!weight) {
      alert('Please confirm your weight.');
      return;
    }

    setIsLoading(true);
    try {
      const todayISO = new Date().toISOString().split('T')[0]; 

      const packedNotes = `
        [ENERGY: ${energy || 'N/A'}] 
        [SLEEP: ${sleep || 'N/A'}] 
        [SORENESS: ${soreness.join(', ') || 'None'}] 
        --- 
        ${notes}
      `.trim();

      const payload = {
        logDate: todayISO,
        weightKg: parseFloat(weight),
        notes: packedNotes
      };

      await api.post('/api/v1/progress-logs', payload);
      navigation.navigate('Dashboard');

    } catch (error) {
      console.error('Log failed:', error);
      alert('Failed to save log.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
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

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* --- HEADER --- */}
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.headerDate}>{todayDate}</Text>
              <Text style={styles.headerYear}>{todayYear}</Text>
            </View>
            {/* FIX #3: Brighter Icon (75%) */}
            <Ionicons name="create-outline" size={28} color="rgba(255,255,255,0.75)" />
          </View>

          {/* --- 1. WEIGHT --- */}
          <View style={styles.glassCard}>
            <View style={styles.rowCenter}>
              {/* FIX #6: Lighter Font Weight (500) */}
              <Text style={styles.cardTitle}>CURRENT WEIGHT</Text>
              <View style={styles.weightInputWrapper}>
                <TextInput
                  style={styles.weightInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="0.0"
                  placeholderTextColor="#666"
                />
                <Text style={styles.unitText}>KG</Text>
              </View>
            </View>
          </View>

          {/* --- 2. VITALS --- */}
          <View style={[styles.glassCard, { marginTop: 15 }]}>
            {/* FIX #1: Added Top Spacing */}
            <Text style={[styles.cardTitle, { marginTop: 8 }]}>ENERGY LEVEL</Text>
            <View style={styles.selectorRow}>
              {ENERGY_LEVELS.map((item) => (
                <TouchableOpacity 
                  key={item.value} 
                  style={[styles.selectBtn, energy === item.value && styles.selectBtnActive]}
                  onPress={() => setEnergy(item.value)}
                >
                  <Text style={[styles.selectText, energy === item.value && styles.selectTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* FIX #2: Softer Divider */}
            <View style={styles.divider} />

            <Text style={styles.cardTitle}>SLEEP QUALITY</Text>
            <View style={styles.selectorRow}>
              {SLEEP_QUALITY.map((item) => (
                <TouchableOpacity 
                  key={item.value} 
                  style={[styles.selectBtn, sleep === item.value && styles.selectBtnActive]}
                  onPress={() => setSleep(item.value)}
                >
                  <Text style={[styles.selectText, sleep === item.value && styles.selectTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* --- 3. SORENESS --- */}
          <View style={[styles.glassCard, { marginTop: 15 }]}>
            <Text style={[styles.cardTitle, { marginTop: 8 }]}>MUSCLE SORENESS</Text>
            <View style={styles.tagsContainer}>
              {SORENESS_AREAS.map((area) => (
                <TouchableOpacity 
                  key={area}
                  // FIX #5: New "Highlight" Style logic
                  style={[styles.tag, soreness.includes(area) && styles.tagActive]}
                  onPress={() => toggleSoreness(area)}
                >
                  <Text style={[styles.tagText, soreness.includes(area) && styles.tagTextActive]}>
                    {area}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* --- 4. NOTES --- */}
          <View style={[styles.glassCard, { marginTop: 15 }]}>
            <Text style={[styles.cardTitle, { marginTop: 8 }]}>ADDITIONAL NOTES</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Stress, injuries, or thoughts..."
              placeholderTextColor="#555"
              multiline
            />
          </View>

          <View style={styles.aiNotice}>
            <Ionicons name="sparkles" size={14} color="#4F8DFF" />
            <Text style={styles.aiText}>
              Your AI coach will adapt based on this log.
            </Text>
          </View>

          {/* --- CONFIRM BUTTON --- */}
          {/* FIX #4: Increased Padding */}
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#EAEAEA" />
            ) : (
              <Text style={styles.saveButtonText}>CONFIRM LOG</Text>
            )}
          </TouchableOpacity>

          <View style={{height: 100}} />

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000' },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },

  // HEADER
  headerContainer: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    marginBottom: 25, paddingHorizontal: 5 
  },
  headerDate: { fontSize: 32, fontWeight: '900', color: '#EDEDED', letterSpacing: 1 },
  headerYear: { fontSize: 14, fontWeight: '600', color: '#666', letterSpacing: 2 },

  // GLASS CARD STANDARD (Fix #2)
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  // FIX #6: Weight 500
  cardTitle: { 
    fontSize: 11, fontWeight: '500', color: '#888', 
    letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' 
  },

  rowCenter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weightInputWrapper: { flexDirection: 'row', alignItems: 'flex-end' },
  weightInput: {
    fontSize: 24, fontWeight: '700', color: '#EDEDED',
    borderBottomWidth: 1, borderBottomColor: '#444',
    minWidth: 60, textAlign: 'right', paddingBottom: 5
  },
  unitText: { fontSize: 12, color: '#666', fontWeight: '700', marginLeft: 5, marginBottom: 8 },

  // SELECTORS
  selectorRow: { flexDirection: 'row', justifyContent: 'space-between' },
  selectBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, marginHorizontal: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  selectBtnActive: { backgroundColor: '#EAEAEA', borderColor: '#EAEAEA' },
  selectText: { fontSize: 11, fontWeight: '600', color: '#888' },
  selectTextActive: { color: '#000', fontWeight: '800' },

  // FIX #2: Softer Divider
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 20 },

  // SORENESS TAGS
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)', marginRight: 8, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  // FIX #5: Subtle Highlight instead of Red
  tagActive: { 
    backgroundColor: 'rgba(255,255,255,0.12)', 
    borderColor: 'rgba(255,255,255,0.20)' 
  },
  tagText: { fontSize: 11, color: '#AAA', fontWeight: '600' },
  tagTextActive: { color: '#FFF', fontWeight: '700' },

  textArea: {
    color: '#EDEDED', fontSize: 14, lineHeight: 22,
    minHeight: 60,
  },

  aiNotice: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    marginTop: 20, opacity: 0.7 
  },
  aiText: { color: '#4F8DFF', fontSize: 10, marginLeft: 6, fontWeight: '600' },

  // FIX #4: Button Padding & Spacing
  saveButton: {
    backgroundColor: '#141414', 
    paddingVertical: 16, // Increased padding
    borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: 30,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  saveButtonText: { color: '#EDEDED', fontWeight: '800', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' }
});

export default LogScreen;