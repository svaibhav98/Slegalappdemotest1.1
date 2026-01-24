import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Modal,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLawyers, CATEGORIES, Lawyer, LawyerPackage } from '../services/lawyersData';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

// Design System Colors
const COLORS = {
  primary: '#FF9933',
  white: '#FFFFFF',
  background: '#F8F9FA',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  success: '#10B981',
  star: '#F59E0B',
  teal: '#14B8A6',
};

export default function LawyersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<LawyerPackage | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const filteredLawyers = useMemo(() => {
    return getLawyers(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  const handleBack = () => {
    router.back();
  };

  const handleLawyerPress = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    setSelectedPackage(lawyer.packages[0]); // Default to first package
    setShowProfileModal(true);
  };

  const handleConsultNow = () => {
    if (selectedLawyer && selectedPackage) {
      setShowProfileModal(false);
      router.push({
        pathname: '/booking-summary',
        params: { 
          lawyerId: selectedLawyer.id,
          packageId: selectedPackage.id,
          mode: 'instant'
        }
      });
    }
  };

  const handleScheduleLater = () => {
    if (selectedLawyer && selectedPackage) {
      setShowProfileModal(false);
      router.push({
        pathname: '/schedule-booking',
        params: { 
          lawyerId: selectedLawyer.id,
          packageId: selectedPackage.id
        }
      });
    }
  };

  const getPackageIcon = (type: string) => {
    switch (type) {
      case 'voice': return 'call';
      case 'chat': return 'chatbubble';
      case 'video': return 'videocam';
      default: return 'call';
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/logo-transparent.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>Suno Legal</Text>
              <Text style={styles.logoSubtitle}>Nyay-AI Powered Legal Assistant</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Consult a <Text style={styles.titleHighlight}>LAWYER</Text></Text>
          <Text style={styles.subtitle}>Search Lawyers. Consult Lawyers. Get Answers.</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={18} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Category Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
          contentContainerStyle={styles.chipsContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.chip,
                selectedCategory === category.id && styles.chipSelected
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={category.icon as any} 
                size={16} 
                color={selectedCategory === category.id ? COLORS.white : COLORS.textSecondary} 
              />
              <Text style={[
                styles.chipText,
                selectedCategory === category.id && styles.chipTextSelected
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lawyers Grid */}
        <ScrollView 
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {filteredLawyers.map((lawyer) => (
              <TouchableOpacity
                key={lawyer.id}
                style={styles.lawyerCard}
                onPress={() => handleLawyerPress(lawyer)}
                activeOpacity={0.9}
              >
                <View style={styles.cardImageContainer}>
                  <Image 
                    source={{ uri: lawyer.image }} 
                    style={styles.cardImage}
                  />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.lawyerName} numberOfLines={1}>
                      {lawyer.name}
                    </Text>
                    {lawyer.isVerified && (
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    )}
                  </View>
                  
                  <Text style={styles.practiceArea}>{lawyer.practiceArea}</Text>
                  
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={COLORS.star} />
                    <Text style={styles.ratingText}>
                      {lawyer.rating} ({lawyer.reviewCount})
                    </Text>
                  </View>
                  
                  <View style={styles.priceRow}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.priceText}>
                      {lawyer.packages[1]?.duration || 10} min / ₹{lawyer.packages[1]?.price || 200}
                    </Text>
                  </View>
                  
                  <View style={styles.experienceRow}>
                    <Text style={styles.experienceLabel}>Experience</Text>
                    <Text style={styles.experienceValue}>{lawyer.experience} Years</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Bottom Navigation Bar */}
        <BottomNavBar activeTab="home" />

        {/* Lawyer Profile Modal */}
        <Modal
          visible={showProfileModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowProfileModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedLawyer && (
                <>
                  {/* Close Button */}
                  <TouchableOpacity 
                    style={styles.modalCloseButton}
                    onPress={() => setShowProfileModal(false)}
                  >
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Profile Header */}
                    <View style={styles.profileHeader}>
                      <Image 
                        source={{ uri: selectedLawyer.image }} 
                        style={styles.profileImage}
                      />
                      {selectedLawyer.isVerified && (
                        <View style={styles.verifiedBadge}>
                          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                        </View>
                      )}
                    </View>

                    <Text style={styles.profileName}>{selectedLawyer.name}</Text>
                    <Text style={styles.profilePractice}>{selectedLawyer.practiceArea}</Text>
                    
                    {/* Availability */}
                    <View style={styles.availabilityRow}>
                      <View style={[
                        styles.availabilityDot,
                        { backgroundColor: selectedLawyer.isAvailable ? COLORS.success : COLORS.textMuted }
                      ]} />
                      <Text style={styles.availabilityText}>
                        {selectedLawyer.isAvailable ? 'Available now' : 'Currently unavailable'}
                      </Text>
                    </View>

                    {/* Info Badges */}
                    <View style={styles.badgesContainer}>
                      <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="star" size={14} color={COLORS.star} />
                        <Text style={styles.badgeText}>{selectedLawyer.rating} ({selectedLawyer.reviewCount})</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: '#E0E7FF' }]}>
                        <Ionicons name="briefcase" size={14} color="#6366F1" />
                        <Text style={styles.badgeText}>{selectedLawyer.experience}+ Years</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: '#DCFCE7' }]}>
                        <Ionicons name="time" size={14} color={COLORS.success} />
                        <Text style={styles.badgeText}>₹{selectedLawyer.packages[1]?.price || 200} / {selectedLawyer.packages[1]?.duration || 10} min</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: '#F3E8FF' }]}>
                        <Ionicons name="globe" size={14} color="#9333EA" />
                        <Text style={styles.badgeText}>{selectedLawyer.languages.join(', ')}</Text>
                      </View>
                    </View>

                    {/* About Section */}
                    <View style={styles.aboutSection}>
                      <Text style={styles.sectionTitle}>About me</Text>
                      <Text style={styles.aboutText}>{selectedLawyer.about}</Text>
                    </View>

                    {/* Consultation Packages */}
                    <View style={styles.packagesSection}>
                      <Text style={styles.sectionTitle}>Consultation Packages</Text>
                      {selectedLawyer.packages.map((pkg) => (
                        <TouchableOpacity
                          key={pkg.id}
                          style={[
                            styles.packageCard,
                            selectedPackage?.id === pkg.id && styles.packageCardSelected
                          ]}
                          onPress={() => setSelectedPackage(pkg)}
                          activeOpacity={0.8}
                        >
                          <View style={[styles.packageIcon, { backgroundColor: COLORS.primary + '15' }]}>
                            <Ionicons name={getPackageIcon(pkg.type) as any} size={24} color={COLORS.primary} />
                          </View>
                          <View style={styles.packageInfo}>
                            <Text style={styles.packageName}>{pkg.name}</Text>
                            <Text style={styles.packagePrice}>₹{pkg.price}</Text>
                          </View>
                          <Text style={styles.packageDuration}>{pkg.duration} min</Text>
                          {selectedPackage?.id === pkg.id && (
                            <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* CTA Buttons */}
                    <View style={styles.ctaContainer}>
                      <TouchableOpacity 
                        style={styles.consultNowButton}
                        onPress={handleConsultNow}
                        activeOpacity={0.9}
                        disabled={!selectedLawyer.isAvailable}
                      >
                        <Text style={styles.consultNowText}>Consult Now</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.scheduleLaterButton}
                        onPress={handleScheduleLater}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.scheduleLaterText}>Schedule Later</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ height: 30 }} />
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 44,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  logoTextContainer: {
    alignItems: 'flex-start',
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  logoSubtitle: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },

  // Title
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  titleHighlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Category Chips
  chipsContainer: {
    maxHeight: 50,
    backgroundColor: COLORS.white,
    paddingBottom: 16,
  },
  chipsContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  chipTextSelected: {
    color: COLORS.white,
  },

  // Lawyers Grid
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lawyerCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
  },
  cardImageContainer: {
    marginRight: 10,
  },
  cardImage: {
    width: 50,
    height: 65,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lawyerName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 4,
  },
  practiceArea: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  experienceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  experienceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    padding: 24,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary + '30',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  profilePractice: {
    fontSize: 14,
    color: COLORS.success,
    textAlign: 'center',
    marginTop: 4,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Badges
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },

  // About Section
  aboutSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Packages Section
  packagesSection: {
    marginBottom: 24,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packageCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  packageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  packageDuration: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 10,
  },

  // CTA Buttons
  ctaContainer: {
    gap: 12,
  },
  consultNowButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  consultNowText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  scheduleLaterButton: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  scheduleLaterText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
