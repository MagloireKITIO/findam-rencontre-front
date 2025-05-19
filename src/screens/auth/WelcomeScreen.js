// src/screens/auth/WelcomeScreen.js

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Logo et titre */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Findam</Text>
        <Text style={styles.tagline}>Trouvez l'amour au Cameroun</Text>
      </View>
      
      {/* Image de présentation - temporairement remplacée par un placeholder */}
      <View style={styles.imageContainer}>
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>Image de bienvenue</Text>
        </View>
      </View>
      
      {/* Boutons d'action */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.loginButton]} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Connexion</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.registerButton]} 
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerButtonText}>Inscription</Text>
        </TouchableOpacity>
      </View>
      
      {/* Texte de bas de page */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          En continuant, vous acceptez nos{' '}
          <Text style={styles.footerLink}>Conditions d'utilisation</Text> et{' '}
          <Text style={styles.footerLink}>Politique de confidentialité</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: colors.textLight,
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    width: '100%',
    height: '80%',
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  placeholderText: {
    color: colors.textLight,
    fontSize: 18,
  },
  buttonsContainer: {
    marginBottom: 30,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: colors.primary,
  },
  loginButtonText: {
    color: colors.textInverted,
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 14,
    lineHeight: 20,
  },
  footerLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;