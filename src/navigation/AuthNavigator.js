// src/navigation/AuthNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import des écrans d'authentification
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PhoneVerificationScreen from '../screens/auth/PhoneVerificationScreen';

// Création du navigateur de pile pour l'authentification
const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ title: 'Bienvenue' }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Connexion' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Inscription' }}
      />
      <Stack.Screen 
        name="PhoneVerification" 
        component={PhoneVerificationScreen} 
        options={{ title: 'Vérification du téléphone' }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;