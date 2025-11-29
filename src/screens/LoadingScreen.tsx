import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  navigation: any;
};

const LoadingScreen = ({ navigation }: Props) => {
  
  useEffect(() => {
    const checkToken = async () => {
      console.log("--- LOADING SCREEN STARTED ---");
      try {
        // 1. Look for the token
        console.log("1. Checking AsyncStorage for token...");
        const userToken = await AsyncStorage.getItem('userToken');
        console.log("2. Token found?", userToken);

        // 2. Decide where to go
        if (userToken) {
          console.log("3. Navigating to 'Main'...");
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          console.log("3. Navigating to 'Auth'...");
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        }
      } catch (e) {
        console.error("ERROR in LoadingScreen:", e);
        // If error, default to Auth
        navigation.replace('Auth');
      }
    };

    checkToken();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={{marginTop: 20}}>Checking Authentication...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingScreen;