// screens/OpeningScreen.js
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedButton from '../components/AnimatedButton';

export default function OpeningScreen({ navigation }) {
  return (
    <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.container}>
      <Image source={require('../assets/tasktrek_logo.png')} style={styles.logo} />
      <AnimatedButton title="Sign In" onPress={() => navigation.navigate('SignIn')} />
      <AnimatedButton title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  logo: {
    width: 150, height: 150, marginBottom: 30, resizeMode: 'contain'
  },
});