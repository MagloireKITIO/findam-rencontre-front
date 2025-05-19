// src/screens/auth/PhoneVerificationScreen.js

import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import Button from '../../components/common/Button';
import apiServices from '../../services/api';

const PhoneVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber } = route.params || {};
  
  // Référence pour les inputs de code
  const inputRefs = useRef([]);
  
  // États pour gérer le code de vérification
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Démarrer le compte à rebours au chargement de l'écran
  useEffect(() => {
    startCountdown();
  }, []);
  
  // Fonction pour démarrer le compte à rebours
  const startCountdown = () => {
    setTimer(60);
    setCanResend(false);
    
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  };
  
  // Fonction pour gérer la saisie du code
  const handleCodeChange = (text, index) => {
    // Créer une copie du code actuel
    const newCode = [...code];
    
    // Mettre à jour le chiffre à l'index donné
    newCode[index] = text;
    setCode(newCode);
    
    // Si un chiffre est saisi et ce n'est pas le dernier champ, passer au champ suivant
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    // Si tous les chiffres sont saisis, soumettre le code
    if (index === 5 && text) {
      Keyboard.dismiss();
      // Vérifier si tous les chiffres sont remplis
      if (newCode.every(digit => digit !== '')) {
        handleVerifyCode(newCode.join(''));
      }
    }
  };
  
  // Fonction pour gérer la suppression (retour arrière)
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  
  // Fonction pour renvoyer le code
  const handleResendCode = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiServices.auth.requestPhoneVerification(phoneNumber);
      
      if (response.data) {
        startCountdown();
        Alert.alert(
          "Code envoyé",
          `Un nouveau code a été envoyé au ${phoneNumber}`,
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi du code. Veuillez réessayer.');
      console.error('Erreur d\'envoi du code:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour vérifier le code
  const handleVerifyCode = async (fullCode) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiServices.auth.verifyPhoneCode({
        phone_number: phoneNumber,
        code: fullCode
      });
      
      if (response.data) {
        // Rediriger vers la page suivante ou le tableau de bord
        navigation.replace('Main');
      }
    } catch (err) {
      setError('Code invalide. Veuillez réessayer.');
      console.error('Erreur de vérification du code:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vérification</Text>
        <View style={styles.emptySpace} />
      </View>
      
      {/* Contenu principal */}
      <View style={styles.content}>
        <Text style={styles.title}>Vérification du téléphone</Text>
        <Text style={styles.description}>
          Un code à 6 chiffres a été envoyé au {phoneNumber}
        </Text>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        
        {/* Champs de saisie du code */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={styles.codeInput}
              value={digit}
              onChangeText={text => handleCodeChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>
        
        {/* Bouton de renvoi de code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Vous n'avez pas reçu le code ? {canResend ? (
              <Text 
                style={styles.resendLink}
                onPress={handleResendCode}
              >
                Renvoyer
              </Text>
            ) : (
              <Text style={styles.timerText}>({timer}s)</Text>
            )}
          </Text>
        </View>
        
        {/* Bouton de vérification */}
        <Button
          label="Vérifier"
          onPress={() => handleVerifyCode(code.join(''))}
          disabled={code.some(digit => !digit)}
          loading={loading}
          style={styles.verifyButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 40,
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.error,
    width: '100%',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: colors.card,
  },
  resendContainer: {
    marginBottom: 30,
  },
  resendText: {
    color: colors.textLight,
    fontSize: 14,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  timerText: {
    color: colors.textLight,
  },
  verifyButton: {
    width: '100%',
  },
});

export default PhoneVerificationScreen;