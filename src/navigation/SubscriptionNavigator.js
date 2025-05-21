// src/navigation/SubscriptionNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/colors';

// Import des écrans d'abonnement
import SubscriptionPlansScreen from '../screens/subscription/SubscriptionPlansScreen';
import PaymentMethodsScreen from '../screens/subscription/PaymentMethodsScreen';
import PaymentHistoryScreen from '../screens/subscription/PaymentHistoryScreen';

// Création du navigateur de pile pour les abonnements
const Stack = createStackNavigator();

const SubscriptionNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen
        name="SubscriptionPlans"
        component={SubscriptionPlansScreen}
        options={{ title: 'Plans d\'abonnement' }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{ title: 'Méthodes de paiement' }}
      />
      <Stack.Screen
        name="PaymentHistory"
        component={PaymentHistoryScreen}
        options={{ title: 'Historique des paiements' }}
      />
    </Stack.Navigator>
  );
};

export default SubscriptionNavigator;