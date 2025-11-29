import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import api from '../services/api';

const MealLoggerScreen = ({ navigation, route }: any) => {
  // We might pass a "isCheatMeal" param later to auto-tag it
  const isCheatMeal = route.params?.isCheatMeal || false;

  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!food || !calories) {
      Alert.alert("Missing Info", "Please enter food name and calories.");
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await api.post('/api/v1/meal-logs', {
        logDate: today,
        mealType: isCheatMeal ? 'CHEAT_MEAL' : 'Snack',
        foodDescription: food,
        calories: parseFloat(calories),
        proteinG: protein ? parseFloat(protein) : 0
      });

      Alert.alert("Yum!", "Meal logged successfully.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not log meal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {isCheatMeal ? "Treat Yourself 🍕" : "Log Meal"}
      </Text>
      <Text style={styles.subHeader}>
        {isCheatMeal ? "You earned it! What are you having?" : "Track your nutrition."}
      </Text>

      <Text style={styles.label}>Food Name</Text>
      <TextInput 
        style={styles.input} 
        placeholder={isCheatMeal ? "e.g. Large Pepperoni Pizza" : "e.g. Chicken Salad"}
        value={food}
        onChangeText={setFood}
      />

      <Text style={styles.label}>Calories (Est.)</Text>
      <TextInput 
        style={styles.input} 
        placeholder="e.g. 800"
        keyboardType="numeric"
        value={calories}
        onChangeText={setCalories}
      />

      <Text style={styles.label}>Protein (g) - Optional</Text>
      <TextInput 
        style={styles.input} 
        placeholder="e.g. 30"
        keyboardType="numeric"
        value={protein}
        onChangeText={setProtein}
      />

      <TouchableOpacity 
        style={[styles.button, isCheatMeal ? styles.cheatButton : null]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : (
          <Text style={styles.btnText}>{isCheatMeal ? "Log Cheat Meal" : "Save Meal"}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  subHeader: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, fontSize: 16, marginBottom: 20, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  cheatButton: { backgroundColor: 'tomato' }, // Red/Orange for cheat meals
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default MealLoggerScreen;