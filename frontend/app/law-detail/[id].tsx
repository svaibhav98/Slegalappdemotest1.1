import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Dimensions,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLawSchemeById, getRelatedLawsSchemes, LawScheme } from '../../services/lawsData';
import { useSavedLaws } from '../../contexts/SavedLawsContext';

const { width } = Dimensions.get('window');

// Design System Colors
const COLORS = {
  headerBg: '#2B2D42',
  primary: '#FF9933',
  white: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  background: '#F9FAFB',
  link: '#3B82F6',
};

export default function LawDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { isLawSaved, toggleSaveLaw } = useSavedLaws();
  
  const [lawItem, setLawItem] = useState<LawScheme | null>(null);
  const [relatedItems, setRelatedItems] = useState<LawScheme[]>([]);
  
  const isSaved = lawItem ? isLawSaved(lawItem.id) : false;
  
  const handleToggleSave = () => {
    if (lawItem) {
      toggleSaveLaw({
        lawId: lawItem.id,
        title: lawItem.title,
        category: lawItem.category,
        tagLabel: lawItem.tagLabel,
        tagColor: lawItem.tagColor,
      });
    }
  };

  useEffect(() => {
    if (id) {
      const item = getLawSchemeById(id);
      if (item) {
        setLawItem(item);
        setRelatedItems(getRelatedLawsSchemes(item, 4));
      }
    }
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Cannot open URL:", url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  const handleRelatedPress = (item: LawScheme) => {
    router.push({
      pathname: '/law-detail/[id]',
      params: { id: item.id }
    });
  };

  if (!lawItem) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Parse overview text to display with proper formatting
  const formatOverviewText = (text: string) => {
    return text.split('\n').map((paragraph, index) => {
      // Check if it's a heading (starts with **)
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return (
          <Text key={index} style={styles.overviewHeading}>
            {paragraph.replace(/\*\*/g, '')}
          </Text>
        );
      }
      // Check if it's a bullet point
      if (paragraph.trim().startsWith('•')) {
        return (
          <Text key={index} style={styles.overviewBullet}>
            {paragraph}
          </Text>
        );
      }
      // Check if it's a numbered item
      if (/^\d+\./.test(paragraph.trim())) {
        return (
          <Text key={index} style={styles.overviewBullet}>
            {paragraph}
          </Text>
        );
      }
      // Regular paragraph
      if (paragraph.trim()) {
        return (
          <Text key={index} style={styles.overviewParagraph}>
            {paragraph.replace(/\*\*/g, '')}
          </Text>
        );
      }
      return null;
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />
      
      <View style={styles.container}>
        {/* Compact Dark Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          
          {/* Save/Bookmark Button - Top Right */}
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleToggleSave}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isSaved ? COLORS.primary : COLORS.white} 
            />
          </TouchableOpacity>
          
          {/* Icon and Title Row */}
          <View style={styles.headerContent}>
            <View style={styles.iconCircle}>
              <Ionicons 
                name={
                  lawItem.category === 'tenant-housing' ? 'home' :
                  lawItem.category === 'land-property' ? 'business' :
                  lawItem.category === 'consumer' ? 'shield-checkmark' :
                  lawItem.category === 'citizen-rights' ? 'person' :
                  lawItem.category === 'labour' ? 'briefcase' :
                  lawItem.category === 'farmer' ? 'leaf' :
                  lawItem.category === 'family' ? 'people' :
                  'document-text'
                } 
                size={32} 
                color={COLORS.primary} 
              />
            </View>
            <Text style={styles.headerTitle} numberOfLines={2}>{lawItem.title}</Text>
          </View>
        </View>

        {/* Content Card */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Overview Section */}
            <Text style={styles.sectionTitle}>
              {lawItem.type === 'SCHEME' ? 'Scheme Details' : 'Overview'}
            </Text>
            
            <View style={styles.overviewContent}>
              {formatOverviewText(lawItem.overviewText)}
            </View>

            {/* Learn More Link */}
            <TouchableOpacity 
              style={styles.learnMoreContainer}
              onPress={() => handleOpenLink(lawItem.officialLink)}
              activeOpacity={0.8}
            >
              <Ionicons name="document-text-outline" size={18} color={COLORS.textMuted} />
              <View style={styles.learnMoreTextContainer}>
                <Text style={styles.learnMoreLabel}>Learn more:</Text>
                <Text style={styles.learnMoreLink}>{lawItem.officialLink}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Related For You Section */}
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Related for you</Text>
            
            {relatedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.relatedCard}
                onPress={() => handleRelatedPress(item)}
                activeOpacity={0.9}
              >
                <View style={[styles.relatedIconContainer, { backgroundColor: item.tagColor + '20' }]}>
                  <Ionicons 
                    name={
                      item.category === 'tenant-housing' ? 'home' :
                      item.category === 'land-property' ? 'business' :
                      item.category === 'consumer' ? 'shield-checkmark' :
                      item.category === 'citizen-rights' ? 'person' :
                      item.category === 'labour' ? 'briefcase' :
                      item.category === 'farmer' ? 'leaf' :
                      item.category === 'family' ? 'people' :
                      'document-text'
                    } 
                    size={24} 
                    color={item.tagColor} 
                  />
                </View>
                <View style={styles.relatedTextContainer}>
                  <Text style={styles.relatedCardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.relatedCardSubtitle} numberOfLines={1}>
                    {item.tagLabel}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}

            {/* See More Button */}
            <TouchableOpacity 
              style={styles.seeMoreButton}
              onPress={() => router.push('/(tabs)/laws')}
              activeOpacity={0.8}
            >
              <Text style={styles.seeMoreText}>See more in Laws & Schemes</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  
  // Header - Compact
  header: {
    backgroundColor: COLORS.headerBg,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  saveButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 30,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Content
  content: {
    flex: 1,
    marginTop: -1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  overviewContent: {
    marginBottom: 20,
  },
  overviewHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  overviewParagraph: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  overviewBullet: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 6,
    paddingLeft: 4,
  },
  
  // Learn More
  learnMoreContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  learnMoreTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  learnMoreLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  learnMoreLink: {
    fontSize: 14,
    color: COLORS.link,
    textDecorationLine: 'underline',
  },

  // Related Section
  relatedSection: {
    marginTop: 24,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  relatedIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  relatedTextContainer: {
    flex: 1,
  },
  relatedCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  relatedCardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  
  // See More
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  seeMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 6,
  },
});
