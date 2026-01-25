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
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getLawsSchemes, CATEGORIES, LawScheme } from '../../services/lawsData';
import { useSavedLaws } from '../../contexts/SavedLawsContext';

const { width } = Dimensions.get('window');

// Design System Colors
const COLORS = {
  gradientStart: '#FFF5F0',
  gradientEnd: '#FFFFFF',
  primary: '#FF9933',
  headerBg: '#2B2D42',
  white: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  chipBg: '#F3F4F6',
  chipSelected: '#FF9933',
};

export default function LawsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isLawSaved, toggleSaveLaw } = useSavedLaws();

  const filteredLaws = useMemo(() => {
    return getLawsSchemes(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  const handleCardPress = (item: LawScheme) => {
    router.push({
      pathname: '/law-detail/[id]',
      params: { id: item.id }
    });
  };

  const handleSaveToggle = (item: LawScheme, e: any) => {
    e.stopPropagation();
    toggleSaveLaw({
      lawId: item.id,
      title: item.title,
      category: item.category,
      tagLabel: item.tagLabel,
      tagColor: item.tagColor,
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleSavedItems = () => {
    router.push('/(tabs)/documents?tab=saved');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearFilter = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.gradientStart} />
      
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Laws & Govt. Schemes</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              Browse laws & schemes
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.savedButton} 
            onPress={handleSavedItems}
            activeOpacity={0.8}
          >
            <Ionicons name="bookmark" size={20} color={COLORS.primary} />
            <Text style={styles.savedButtonText}>Saved</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search laws & Schemes...."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
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
                color={selectedCategory === category.id ? COLORS.white : COLORS.textPrimary} 
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

        {/* Laws List */}
        <ScrollView 
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredLaws.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search term or category
              </Text>
              <TouchableOpacity style={styles.clearFilterButton} onPress={clearFilter}>
                <Text style={styles.clearFilterText}>Clear filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredLaws.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => handleCardPress(item)}
                activeOpacity={0.9}
              >
                {/* Save Button - Top Right */}
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={(e) => handleSaveToggle(item, e)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={isLawSaved(item.id) ? 'bookmark' : 'bookmark-outline'} 
                    size={20} 
                    color={isLawSaved(item.id) ? COLORS.primary : COLORS.textMuted} 
                  />
                </TouchableOpacity>

                {/* Card Image */}
                <View style={styles.cardImageContainer}>
                  <View style={styles.cardImagePlaceholder}>
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
                      size={32} 
                      color={item.tagColor} 
                    />
                  </View>
                </View>

                {/* Card Content */}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  
                  <View style={[styles.categoryTag, { backgroundColor: item.tagColor }]}>
                    <Text style={styles.categoryTagText}>{item.tagLabel}</Text>
                  </View>
                  
                  <Text style={styles.cardDescription} numberOfLines={3}>
                    {item.shortSummary}
                  </Text>
                  
                  <Text style={styles.learnMore}>Learn more..</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  savedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  savedButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Search Bar
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  // Category Chips
  chipsContainer: {
    maxHeight: 50,
    marginBottom: 16,
  },
  chipsContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.chipSelected,
    borderColor: COLORS.chipSelected,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  chipTextSelected: {
    color: COLORS.white,
  },

  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  cardImageContainer: {
    width: 100,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 14,
  },
  cardImagePlaceholder: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 8,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  learnMore: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  clearFilterButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearFilterText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
