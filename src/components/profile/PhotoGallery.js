// src/components/profile/PhotoGallery.js

import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  TouchableOpacity, 
  Text, 
  Dimensions, 
  FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

/**
 * Composant pour afficher une galerie de photos avec pagination
 * @param {Array} photos - Liste des photos à afficher
 * @param {Function} onAddPhoto - Fonction appelée lorsqu'on clique sur le bouton ajouter
 */
const PhotoGallery = ({ photos = [], onAddPhoto }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Calcul de la largeur de l'écran pour les dimensions des photos
  const windowWidth = Dimensions.get('window').width;
  const imageWidth = windowWidth - 32; // Ajuster pour les marges
  
  // Rendu d'une photo
  const renderPhoto = ({ item, index }) => {
    return (
      <View style={[styles.photoContainer, { width: imageWidth }]}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.photo} 
          resizeMode="cover"
        />
        {item.is_primary && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryBadgeText}>Photo principale</Text>
          </View>
        )}
      </View>
    );
  };
  
  // Gérer le changement de photo (swipe)
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / imageWidth);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };
  
  // Si aucune photo n'est disponible
  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Ionicons name="images-outline" size={48} color={colors.textLight} />
          <Text style={styles.emptyText}>Aucune photo ajoutée</Text>
          <TouchableOpacity style={styles.addButton} onPress={onAddPhoto}>
            <Ionicons name="add" size={24} color={colors.textInverted} />
            <Text style={styles.addButtonText}>Ajouter des photos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Galerie de photos avec pagination */}
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      
      {/* Indicateurs de pagination */}
      <View style={styles.paginationContainer}>
        {photos.map((_, index) => (
          <View 
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive
            ]}
          />
        ))}
      </View>
      
      {/* Bouton d'ajout de photo */}
      <TouchableOpacity 
        style={styles.addPhotoButton}
        onPress={onAddPhoto}
      >
        <Ionicons name="camera-outline" size={22} color={colors.textInverted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    position: 'relative',
  },
  emptyContainer: {
    height: 300,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginVertical: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {
    color: colors.textInverted,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  photoContainer: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  addPhotoButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: colors.primary + 'DD', // Ajouter de la transparence
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  primaryBadgeText: {
    color: colors.textInverted,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PhotoGallery;