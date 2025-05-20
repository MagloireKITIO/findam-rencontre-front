// src/navigation/MessagingNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/colors';

// Import des écrans de messagerie
import ConversationsScreen from '../screens/messaging/ConversationsScreen';
import ConversationScreen from '../screens/messaging/ConversationScreen';

// Création du navigateur de pile pour la messagerie
const Stack = createStackNavigator();

const MessagingNavigator = () => {
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
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.text,
        },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen
        name="Conversations"
        component={ConversationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={({ route }) => ({
          headerTitle: "",
          headerBackTitleVisible: false,
          cardStyle: { backgroundColor: colors.background },
        })}
      />
    </Stack.Navigator>
  );
};

export default MessagingNavigator;