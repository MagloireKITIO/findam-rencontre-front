// src/navigation/AppNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

// Création du navigateur principal
const Stack = createStackNavigator();

const AppNavigator = () => {
  // Utiliser le contexte d'authentification
  const { isAuthenticated, loading } = useAuth();

  // Afficher un écran de chargement pendant la vérification
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Si l'utilisateur est authentifié, afficher l'application principale
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        // Sinon, afficher le flux d'authentification
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;