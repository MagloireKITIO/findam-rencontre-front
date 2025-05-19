// src/screens/auth/LoginScreen.js

import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/colors';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  
  // États pour gérer les entrées du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Vérifier si les champs sont valides
  const isValid = email.trim() !== '' && password.trim() !== '';
  
  // Fonction de connexion
  const handleLogin = async () => {
    if (!isValid) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await login({ email, password });
      
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Erreur de connexion:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connexion</Text>
        <View style={styles.emptySpace} />
      </View>
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Findam</Text>
      </View>
      
      {/* Formulaire */}
      <View style={styles.formContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Votre adresse email"
          keyboardType="email-address"
        />
        
        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="Votre mot de passe"
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.forgotPasswordContainer}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
        
        <Button
          label="Se connecter"
          onPress={handleLogin}
          disabled={!isValid}
          loading={loading}
          style={styles.loginButton}
        />
      </View>
      
      {/* Séparateur */}
      <View style={styles.separatorContainer}>
        <View style={styles.separator} />
        <Text style={styles.separatorText}>ou</Text>
        <View style={styles.separator} />
      </View>
      
      {/* Options de connexion sociale */}
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={24} color={colors.text} />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-facebook" size={24} color="#3b5998" />
          <Text style={styles.socialButtonText}>Facebook</Text>
        </TouchableOpacity>
      </View>
      
      {/* Lien d'inscription */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>
          Vous n'avez pas de compte ? {' '}
          <Text 
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            S'inscrire
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptySpace: {
    width: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.primary,
  },
  formContainer: {
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: colors.error + '20', // 20 pour l'opacité
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
  },
  loginButton: {
    marginTop: 10,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  separatorText: {
    color: colors.textLight,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    flex: 0.48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialButtonText: {
    marginLeft: 8,
    fontWeight: '500',
    color: colors.text,
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    color: colors.textLight,
    fontSize: 14,
  },
  registerLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;