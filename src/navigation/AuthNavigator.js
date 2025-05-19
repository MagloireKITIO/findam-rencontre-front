// src/navigation/AuthNavigator.js

import React from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

// Écrans d'authentification (ils seront créés plus tard)
// Import des écrans à venir:
// import WelcomeScreen from '../screens/auth/WelcomeScreen';
// import LoginScreen from '../screens/auth/LoginScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen';
// import PhoneVerificationScreen from '../screens/auth/PhoneVerificationScreen';

// Création d'un "placeholder" temporaire pour les tests
const PlaceholderScreen = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Écran {route.name}</Text>
  </View>
);

// Création du navigateur de pile pour l'authentification
const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Ces écrans seront implémentés plus tard */}
      <Stack.Screen 
        name="Welcome" 
        component={PlaceholderScreen} 
        options={{ title: 'Bienvenue' }}
      />
      <Stack.Screen 
        name="Login" 
        component={PlaceholderScreen} 
        options={{ title: 'Connexion' }}
      />
      <Stack.Screen 
        name="Register" 
        component={PlaceholderScreen} 
        options={{ title: 'Inscription' }}
      />
      <Stack.Screen 
        name="PhoneVerification" 
        component={PlaceholderScreen} 
        options={{ title: 'Vérification du téléphone' }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;