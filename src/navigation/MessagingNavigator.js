// src/navigation/MessagingNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

// Import des écrans de messagerie
import ConversationsScreen from '../screens/messaging/ConversationsScreen';
import ConversationScreen from '../screens/messaging/ConversationScreen';

// Création du navigateur de pile pour la messagerie
const Stack = createStackNavigator();

const MessagingNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
          shadowColor: colors.border,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 4,
          height: 60 + insets.top, // Ajuster la hauteur du header selon les insets
          paddingTop: insets.top,  // Ajouter un padding pour l'encoche
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.text,
        },
        headerTitleAlign: 'center', // Centrer le titre sur Android aussi
        headerTintColor: colors.text,
        cardStyle: { 
          backgroundColor: colors.background,
          // Ajouter un padding au bas de l'écran pour éviter la superposition
          // avec la barre d'onglets dans l'écran de conversations (pas pour la conversation individuelle)
        },
      }}
    >
      <Stack.Screen
        name="Conversations"
        component={ConversationsScreen}
        options={{ 
          headerShown: false,
          // Ajouter un padding au bas de la carte pour l'écran de conversations
          cardStyle: {
            backgroundColor: colors.background,
            paddingBottom: 80, // Approximativement la hauteur de la tabBar
          }
        }}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={({ route }) => ({
          headerTitle: "",
          headerBackTitleVisible: false,
          // Pour l'écran de conversation individuelle, pas de padding supplémentaire
          // car cet écran est plein écran et ne doit pas afficher la tabBar
          cardStyle: { 
            backgroundColor: colors.background,
          },
          // Assurer que cet écran soit affiché au-dessus de la tabBar
          presentation: 'card',
        })}
      />
    </Stack.Navigator>
  );
};

export default MessagingNavigator;