// src/screens/subscription/PaymentMethodsScreen.js

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import apiServices from '../../services/api';
import Button from '../../components/common/Button';

const PaymentMethodsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan } = route.params;

  const [selectedMethod, setSelectedMethod] = useState('CM_MOBILE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [verification, setVerification] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [verificationInterval, setVerificationInterval] = useState(null);

  // Arrêter la vérification du paiement lors du démontage
  useEffect(() => {
    return () => {
      if (verificationInterval) {
        clearInterval(verificationInterval);
      }
    };
  }, [verificationInterval]);

  // Formater le prix pour l'affichage
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Obtenir l'icône pour la méthode de paiement
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'CM_MOBILE':
        return 'phone-portrait-outline';
      case 'CM_MTN':
        return 'logo-google';
      case 'CM_ORANGE':
        return 'logo-google';
      case 'CARD':
        return 'card-outline';
      case 'PAYPAL':
        return 'logo-paypal';
      default:
        return 'cash-outline';
    }
  };

  // Obtenir le nom de la méthode de paiement
  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'CM_MOBILE':
        return 'Mobile Money';
      case 'CM_MTN':
        return 'MTN Mobile Money';
      case 'CM_ORANGE':
        return 'Orange Money';
      case 'CARD':
        return 'Carte bancaire';
      case 'PAYPAL':
        return 'PayPal';
      default:
        return 'Autre';
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    if (!phoneNumber && (selectedMethod === 'CM_MOBILE' || selectedMethod === 'CM_MTN' || selectedMethod === 'CM_ORANGE')) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide.');
      return false;
    }
    return true;
  };

  // Formater le numéro de téléphone
  const formatPhoneNumber = (value) => {
    // Supprimer tous les caractères non numériques
    const cleaned = ('' + value).replace(/\D/g, '');
    
    // Vérifier le format
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})$/);
    
    if (match) {
      let formatted = '';
      if (match[1]) {
        formatted += match[1];
        if (match[2]) {
          formatted += ' ' + match[2];
          if (match[3]) {
            formatted += ' ' + match[3];
          }
        }
      }
      return formatted;
    }
    
    return cleaned;
  };

  // src/screens/subscription/PaymentMethodsScreen.js (suite)

  // Initier le paiement
  const initiatePayment = async () => {
  if (!validateForm()) return;

  setProcessingPayment(true);
  try {
    // Préparer les données de paiement
    const paymentData = {
      plan: plan.id,
      payment_method: selectedMethod,
    };

    // Ajouter le numéro de téléphone si nécessaire
    if (selectedMethod === 'CM_MOBILE' || selectedMethod === 'CM_MTN' || selectedMethod === 'CM_ORANGE') {
      // Nettoyer le numéro et ajouter le préfixe +237 si nécessaire
      let formattedNumber = phoneNumber.replace(/\s+/g, '');
      if (!formattedNumber.startsWith('+237')) {
        formattedNumber = '+237' + formattedNumber;
      }
      paymentData.phone_number = formattedNumber;
      console.log('Numéro de téléphone formaté:', paymentData.phone_number);
    }

    console.log('Données de paiement à envoyer:', paymentData);

    // Envoyer la requête d'initialisation de paiement
    const response = await apiServices.subscriptions.initiatePayment(paymentData);
    
    console.log('Réponse d\'initialisation de paiement:', response.data);
    
    if (response.data && response.data.payment) {
      // Stocker la référence de paiement pour la vérification
      setPaymentReference(response.data.payment.reference);
      
      // Si c'est un paiement par carte ou PayPal et qu'il y a une URL d'autorisation
      if ((selectedMethod === 'CARD' || selectedMethod === 'PAYPAL') && response.data.payment.authorization_url) {
        // Ouvrir l'URL de paiement dans un navigateur
        Linking.openURL(response.data.payment.authorization_url);
      }
      
      // Montrer l'écran de vérification
      setVerification(true);
      
      // Commencer à vérifier l'état du paiement à intervalles réguliers
      const interval = setInterval(() => verifyPayment(response.data.payment.reference), 5000);
      setVerificationInterval(interval);
    } else {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'initialisation du paiement. Veuillez réessayer.');
    }
  } catch (error) {
    console.error('Détails de l\'erreur:', error.response?.data);
    console.error('Erreur lors de l\'initialisation du paiement:', error);
    
    // Message d'erreur plus informatif
    let errorMessage = 'Impossible d\'initier le paiement. Veuillez réessayer.';
    
    if (error.response?.data?.payment) {
      errorMessage = error.response.data.payment;
    } else if (error.response?.data?.details) {
      // Formater les détails d'erreur
      const details = error.response.data.details;
      errorMessage = `${errorMessage}\n\nDétails: ${JSON.stringify(details)}`;
    }
    
    Alert.alert('Erreur', errorMessage);
  } finally {
    setProcessingPayment(false);
  }
};

  // Vérifier l'état du paiement
  const verifyPayment = async (reference) => {
    try {
      const response = await apiServices.subscriptions.verifyPayment({
        payment_reference: reference
      });
      
      if (response.data) {
        // Si le paiement est réussi
        if (response.data.payment.status === 'SUCCESS') {
          // Arrêter les vérifications
          if (verificationInterval) {
            clearInterval(verificationInterval);
          }
          
          // Afficher l'écran de succès
          setVerification(false);
          setShowSuccess(true);
        }
        // Si le paiement a échoué ou a été annulé
        else if (response.data.payment.status === 'FAILED' || response.data.payment.status === 'CANCELLED') {
          // Arrêter les vérifications
          if (verificationInterval) {
            clearInterval(verificationInterval);
          }
          
          // Afficher un message d'échec
          setVerification(false);
          Alert.alert(
            'Paiement échoué',
            'Le paiement n\'a pas été effectué avec succès. Veuillez réessayer avec une autre méthode de paiement.',
            [
              { text: 'OK' }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
    }
  };

  // Fermer l'écran de succès et retourner à l'écran d'accueil
  const handleFinish = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  // Annuler la vérification de paiement
  const cancelVerification = () => {
    if (verificationInterval) {
      clearInterval(verificationInterval);
    }
    setVerification(false);
  };

  // Afficher l'écran de vérification
  if (verification) {
    return (
      <View style={styles.container}>
        <View style={styles.verificationContainer}>
          <ActivityIndicator size="large" color={colors.primary} style={styles.verificationIndicator} />
          <Text style={styles.verificationTitle}>Vérification du paiement</Text>
          <Text style={styles.verificationText}>
            Veuillez suivre les instructions sur votre téléphone pour confirmer le paiement. Cette page se mettra à jour automatiquement lorsque la transaction sera terminée.
          </Text>
          <Text style={styles.verificationReference}>
            Référence: {paymentReference}
          </Text>
          <Button
            variant="outlined"
            label="Annuler"
            onPress={cancelVerification}
            style={styles.cancelButton}
          />
        </View>
      </View>
    );
  }

  // Afficher l'écran de succès
  if (showSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} style={styles.successIcon} />
          <Text style={styles.successTitle}>Paiement Réussi !</Text>
          <Text style={styles.successText}>
            Félicitations ! Votre paiement a été effectué avec succès et votre abonnement Premium est maintenant actif.
          </Text>
          <View style={styles.successDetails}>
            <Text style={styles.successPlanName}>{plan.name}</Text>
            <Text style={styles.successPrice}>{formatPrice(plan.price)}</Text>
          </View>
          <Button
            variant="primary"
            label="Terminer"
            onPress={handleFinish}
            style={styles.finishButton}
          />
        </View>
      </View>
    );
  }

  // Afficher l'écran de sélection de méthode de paiement
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Méthode de paiement</Text>
        <View style={styles.emptySpace} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.planSummary}>
          <Text style={styles.summaryTitle}>Résumé de la commande</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{plan.name}</Text>
            <Text style={styles.summaryValue}>{formatPrice(plan.price)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Durée</Text>
            <Text style={styles.summaryValue}>
              {plan.duration === 'MONTHLY' ? '1 mois' : 
               plan.duration === 'BIANNUAL' ? '6 mois' : 
               plan.duration === 'ANNUAL' ? '12 mois' : plan.duration}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(plan.price)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choisissez une méthode de paiement</Text>

        <View style={styles.methodsContainer}>
          {/* Mobile Money */}
          <TouchableOpacity
            style={[
              styles.methodItem,
              selectedMethod === 'CM_MOBILE' && styles.selectedMethod
            ]}
            onPress={() => setSelectedMethod('CM_MOBILE')}
          >
            <View style={styles.methodIconContainer}>
              <Ionicons 
                name={getPaymentMethodIcon('CM_MOBILE')} 
                size={24} 
                color={selectedMethod === 'CM_MOBILE' ? colors.primary : colors.text} 
              />
            </View>
            <View style={styles.methodInfo}>
              <Text style={[
                styles.methodName,
                selectedMethod === 'CM_MOBILE' && styles.selectedMethodText
              ]}>
                {getPaymentMethodName('CM_MOBILE')}
              </Text>
              <Text style={styles.methodDescription}>
                MTN MoMo ou Orange Money
              </Text>
            </View>
            <View style={[
              styles.methodRadio,
              selectedMethod === 'CM_MOBILE' && styles.selectedMethodRadio
            ]}>
              {selectedMethod === 'CM_MOBILE' && (
                <View style={styles.methodRadioInner} />
              )}
            </View>
          </TouchableOpacity>

          {/* MTN Mobile Money */}
          <TouchableOpacity
            style={[
              styles.methodItem,
              selectedMethod === 'CM_MTN' && styles.selectedMethod
            ]}
            onPress={() => setSelectedMethod('CM_MTN')}
          >
            <View style={styles.methodIconContainer}>
              <Image 
                source={require('../../../assets/icons/mtn-logo.png')} 
                style={styles.methodLogo} 
              />
            </View>
            <View style={styles.methodInfo}>
              <Text style={[
                styles.methodName,
                selectedMethod === 'CM_MTN' && styles.selectedMethodText
              ]}>
                {getPaymentMethodName('CM_MTN')}
              </Text>
              <Text style={styles.methodDescription}>
                Paiement via MTN MoMo
              </Text>
            </View>
            <View style={[
              styles.methodRadio,
              selectedMethod === 'CM_MTN' && styles.selectedMethodRadio
            ]}>
              {selectedMethod === 'CM_MTN' && (
                <View style={styles.methodRadioInner} />
              )}
            </View>
          </TouchableOpacity>

          {/* Orange Money */}
          <TouchableOpacity
            style={[
              styles.methodItem,
              selectedMethod === 'CM_ORANGE' && styles.selectedMethod
            ]}
            onPress={() => setSelectedMethod('CM_ORANGE')}
          >
            <View style={styles.methodIconContainer}>
              <Image 
                source={require('../../../assets/icons/orange-logo.png')} 
                style={styles.methodLogo} 
              />
            </View>
            <View style={styles.methodInfo}>
              <Text style={[
                styles.methodName,
                selectedMethod === 'CM_ORANGE' && styles.selectedMethodText
              ]}>
                {getPaymentMethodName('CM_ORANGE')}
              </Text>
              <Text style={styles.methodDescription}>
                Paiement via Orange Money
              </Text>
            </View>
            <View style={[
              styles.methodRadio,
              selectedMethod === 'CM_ORANGE' && styles.selectedMethodRadio
            ]}>
              {selectedMethod === 'CM_ORANGE' && (
                <View style={styles.methodRadioInner} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Formulaire de paiement Mobile Money */}
        {(selectedMethod === 'CM_MOBILE' || selectedMethod === 'CM_MTN' || selectedMethod === 'CM_ORANGE') && (
          <View style={styles.paymentForm}>
            <Text style={styles.formLabel}>Numéro de téléphone</Text>
            <TextInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
              placeholder="6xx xxx xxx"
              keyboardType="phone-pad"
              maxLength={11} // 9 chiffres + 2 espaces
            />
            <Text style={styles.formHint}>
              Entrez le numéro qui recevra la demande de paiement
            </Text>
          </View>
        )}

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            En continuant, vous acceptez nos{' '}
            <Text style={styles.termsLink}>Conditions d'utilisation</Text> et notre{' '}
            <Text style={styles.termsLink}>Politique de confidentialité</Text>.
          </Text>
        </View>

        <Button
          variant="primary"
          label={processingPayment ? "Traitement en cours..." : "Procéder au paiement"}
          onPress={initiatePayment}
          disabled={processingPayment}
          style={styles.payButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  planSummary: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  totalRow: {
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  methodsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 20,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedMethod: {
    backgroundColor: colors.primary + '10',
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 12,
  },
  methodLogo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  selectedMethodText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  methodDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  methodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedMethodRadio: {
    borderColor: colors.primary,
  },
  methodRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  paymentForm: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  phoneInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  formHint: {
    fontSize: 12,
    color: colors.textLight,
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  payButton: {
    marginBottom: 20,
  },
  // Styles pour l'écran de vérification
  verificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  verificationIndicator: {
    marginBottom: 20,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  verificationText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  verificationReference: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 30,
  },
  cancelButton: {
    marginTop: 20,
  },
  // Styles pour l'écran de succès
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  successDetails: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  successPlanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  successPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  finishButton: {
    width: '100%',
  },
});

export default PaymentMethodsScreen;