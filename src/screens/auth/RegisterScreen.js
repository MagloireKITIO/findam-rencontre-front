// src/screens/auth/RegisterScreen.js

import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/colors';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { register } = useAuth();
  
  // États pour gérer les entrées du formulaire
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Vérification des champs et gestion des erreurs
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Vérifier si les champs sont valides
  const validateInputs = () => {
    let isValid = true;
    let newErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    
    // Valider le nom d'utilisateur
    if (username.trim() === '') {
      newErrors.username = 'Le nom d\'utilisateur est requis';
      isValid = false;
    }
    
    // Valider l'email
    if (email.trim() === '') {
      newErrors.email = 'L\'email est requis';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'L\'email n\'est pas valide';
      isValid = false;
    }
    
    // Valider le mot de passe
    if (password.trim() === '') {
      newErrors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }
    
    // Valider la confirmation du mot de passe
    if (confirmPassword.trim() === '') {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Fonction d'inscription
  const handleRegister = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await register({
        username,
        email,
        password,
        password2: confirmPassword
      });
      
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Erreur d\'inscription:', err);
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
        <Text style={styles.headerTitle}>Inscription</Text>
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
          label="Nom d'utilisateur"
          value={username}
          onChangeText={setUsername}
          placeholder="Choisissez un nom d'utilisateur"
          error={!!errors.username}
          errorText={errors.username}
        />
        
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Votre adresse email"
          keyboardType="email-address"
          error={!!errors.email}
          errorText={errors.email}
        />
        
        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="Créez un mot de passe"
          secureTextEntry
          error={!!errors.password}
          errorText={errors.password}
        />
        
        <Input
          label="Confirmer le mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirmez votre mot de passe"
          secureTextEntry
          error={!!errors.confirmPassword}
          errorText={errors.confirmPassword}
        />
        
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            En vous inscrivant, vous acceptez nos{' '}
            <Text style={styles.termsLink}>Conditions d'utilisation</Text> et notre{' '}
            <Text style={styles.termsLink}>Politique de confidentialité</Text>
          </Text>
        </View>
        
        <Button
          label="S'inscrire"
          onPress={handleRegister}
          loading={loading}
          style={styles.registerButton}
        />
      </View>
      
      {/* Lien de connexion */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>
          Vous avez déjà un compte ? {' '}
          <Text 
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            Se connecter
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
    marginVertical: 20,
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
  termsContainer: {
    marginVertical: 16,
  },
  termsText: {
    color: colors.textLight,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  registerButton: {
    marginTop: 10,
  },
  loginContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: colors.textLight,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;