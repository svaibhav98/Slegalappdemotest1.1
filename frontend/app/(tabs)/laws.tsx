import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getLawsSchemes, CATEGORIES, LawScheme } from '../../services/lawsData';
import { useSavedLaws } from '../../contexts/SavedLawsContext';

const { width } = Dimensions.get('window');

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

const SWIPE_THRESHOLD = 50;

export default function LawsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const { isLawSaved, toggleSaveLaw } = useSavedLaws();

  const selectedCategory = CATEGORIES[selectedCategoryIndex]?.id || 'all';

  // Swipe gesture handling for categories
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left - next category
          if (selectedCategoryIndex < CATEGORIES.length - 1) {
            setSelectedCategoryIndex(selectedCategoryIndex + 1);
          }
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right - previous category
          if (selectedCategoryIndex > 0) {
            setSelectedCategoryIndex(selectedCategoryIndex - 1);
          }
        }
      },
    })
  ).current;

  const filteredLaws = useMemo(() => {
    return getLawsSchemes(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  const handleCardPress = (item: LawScheme) => {
    router.push({
      pathname: '/(tabs)/law-detail/[id]',
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

  const handleBack = () => router.back();
  const handleSavedItems = () => router.push('/(tabs)/documents?tab=saved');
  const clearSearch = () => setSearchQuery('');
  
  const clearFilter = () => {
    setSelectedCategoryIndex(0);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.gradientStart} />
      
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Laws & Govt. Schemes</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>Browse laws & schemes</Text>
          </View>
          
          <TouchableOpacity style={styles.savedButton} onPress={handleSavedItems} activeOpacity={0.8}>
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

        {/* Category Chips - Scrollable */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
          contentContainerStyle={styles.chipsContent}
        >
          {CATEGORIES.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.chip, selectedCategoryIndex === index && styles.chipSelected]}
              onPress={() => setSelectedCategoryIndex(index)}
              activeOpacity={0.8}
              data-testid={`category-chip-${category.id}`}
            >
              <Ionicons 
                name={category.icon as any} 
                size={16} 
                color={selectedCategoryIndex === index ? COLORS.white : COLORS.textPrimary} 
              />
              <Text style={[styles.chipText, selectedCategoryIndex === index && styles.chipTextSelected]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Swipe indicator */}
        <View style={styles.swipeIndicator}>
          <Text style={styles.swipeHint}>← Swipe to browse categories →</Text>
          <View style={styles.swipeDots}>
            {CATEGORIES.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.swipeDot, 
                  selectedCategoryIndex === index && styles.swipeDotActive
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Laws List with swipe gesture */}
        <View style={styles.contentWrapper} {...panResponder.panHandlers}>
          <ScrollView 
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredLaws.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySubtitle}>Try a different search term or category</Text>
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
                  data-testid={`law-card-${item.id}`}
                >
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={(e) => handleSaveToggle(item, e)}
                    activeOpacity={0.7}
                    data-testid={`save-law-btn-${item.id}`}
                  >
                    <Ionicons 
                      name={isLawSaved(item.id) ? 'bookmark' : 'bookmark-outline'} 
                      size={20} 
                      color={isLawSaved(item.id) ? COLORS.primary : COLORS.textMuted} 
                    />
                  </TouchableOpacity>

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
                          item.category === 'family' ? 'people' : 'document-text'
                        } 
                        size={32} 
                        color={item.tagColor} 
                      />
                    </View>
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                    
                    <View style={[styles.categoryTag, { backgroundColor: item.tagColor }]}>
                      <Text style={styles.categoryTagText}>{item.tagLabel}</Text>
                    </View>
                    
                    <Text style={styles.cardDescription} numberOfLines={3}>{item.shortSummary}</Text>
                    
                    <Text style={styles.learnMore}>Learn more..</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  headerCenter: { flex: 1, marginLeft: 16, marginRight: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  savedButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary + '40',
  },
  savedButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },

  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  searchInput: { flex: 1, marginLeft: 12, marginRight: 8, fontSize: 15, color: COLORS.textPrimary },

  chipsContainer: { maxHeight: 50, marginBottom: 8 },
  chipsContent: { paddingHorizontal: 20, gap: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 10, marginRight: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chipSelected: { backgroundColor: COLORS.chipSelected, borderColor: COLORS.chipSelected },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginLeft: 6 },
  chipTextSelected: { color: COLORS.white },

  // Swipe Indicator
  swipeIndicator: { alignItems: 'center', paddingVertical: 8 },
  swipeHint: { fontSize: 11, color: COLORS.textMuted, marginBottom: 6 },
  swipeDots: { flexDirection: 'row', gap: 4 },
  swipeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  swipeDotActive: { width: 12, backgroundColor: COLORS.primary },

  contentWrapper: { flex: 1 },
  listContainer: { flex: 1 },
  listContent: { paddingHorizontal: 20 },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
    position: 'relative',
  },
  saveButton: {
    position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, zIndex: 10,
  },
  cardImageContainer: { width: 100, height: 120, borderRadius: 12, overflow: 'hidden', marginRight: 14 },
  cardImagePlaceholder: { flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  cardContent: { flex: 1, justifyContent: 'space-between', paddingRight: 40 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 22, marginBottom: 8 },
  categoryTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  categoryTagText: { fontSize: 11, fontWeight: '600', color: COLORS.white },
  cardDescription: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 6 },
  learnMore: { fontSize: 13, fontWeight: '600', color: '#3B82F6' },

  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: 20, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  clearFilterButton: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  clearFilterText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
});
