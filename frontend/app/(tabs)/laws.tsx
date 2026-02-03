import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  Modal,
  FlatList,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSavedLaws } from '../../contexts/SavedLawsContext';
import {
  getCentralLaws,
  getStateLaws,
  searchLaws,
  filterByCategory,
  filterByType,
  getCategoriesWithCounts,
  getTypeLabel,
  getTypeBadgeColor,
  CATEGORIES,
  STATE_OPTIONS,
  LawScheme,
  LawSchemeType,
} from '../../services/lawsDataExport';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;

const COLORS = {
  gradientStart: '#FFF5F0',
  gradientEnd: '#FFFFFF',
  primary: '#FF9933',
  primaryDark: '#E68A2E',
  headerBg: '#2B2D42',
  white: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  chipBg: '#F3F4F6',
  chipSelected: '#FF9933',
  tabInactive: '#E5E7EB',
  tabActive: '#FF9933',
  green: '#10B981',
  blue: '#3B82F6',
  purple: '#8B5CF6',
};

type TabType = 'central' | 'state';
type TypeFilter = 'all' | 'law' | 'scheme' | 'portal';

export default function LawsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('central');
  const [selectedState, setSelectedState] = useState<string>('MH');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showStateSelector, setShowStateSelector] = useState(false);
  const { isLawSaved, toggleSaveLaw } = useSavedLaws();

  // Get available categories for swipe navigation
  const availableCategories = useMemo(() => {
    const cats = categoriesWithCounts.filter(c => c.count > 0 || c.id === 'all');
    return cats.map(c => c.id);
  }, [categoriesWithCounts]);

  // Track selected category index for swipe
  const selectedCategoryRef = useRef(selectedCategory);
  selectedCategoryRef.current = selectedCategory;
  const availableCategoriesRef = useRef(availableCategories);
  availableCategoriesRef.current = availableCategories;

  // PanResponder for category swipe (only affects category filters, NOT Central/State tabs)
  const categoryPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 15;
      },
      onPanResponderRelease: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const cats = availableCategoriesRef.current;
        const currentIndex = cats.indexOf(selectedCategoryRef.current);
        
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left - go to next category
          if (currentIndex < cats.length - 1) {
            setSelectedCategory(cats[currentIndex + 1]);
          }
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right - go to previous category
          if (currentIndex > 0) {
            setSelectedCategory(cats[currentIndex - 1]);
          }
        }
      },
    })
  ).current;

  // Get base laws based on tab
  const baseLaws = useMemo(() => {
    if (activeTab === 'central') {
      return getCentralLaws();
    } else {
      return getStateLaws(selectedState);
    }
  }, [activeTab, selectedState]);

  // Apply filters
  const filteredLaws = useMemo(() => {
    let laws = baseLaws;
    
    // Search filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      laws = laws.filter(law => 
        law.title.toLowerCase().includes(lowerQuery) ||
        law.preview.toLowerCase().includes(lowerQuery) ||
        law.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      laws = laws.filter(law => law.category === selectedCategory);
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      laws = laws.filter(law => law.type === typeFilter);
    }
    
    return laws;
  }, [baseLaws, searchQuery, selectedCategory, typeFilter]);

  // Categories with counts
  const categoriesWithCounts = useMemo(() => {
    return getCategoriesWithCounts(baseLaws);
  }, [baseLaws]);

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
  
  const clearAllFilters = () => {
    setSelectedCategory('all');
    setTypeFilter('all');
    setSearchQuery('');
  };

  const getSelectedStateName = () => {
    return STATE_OPTIONS.find(s => s.code === selectedState)?.name || 'Select State';
  };

  const getCategoryIcon = (category: string): string => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.icon || 'document-text';
  };

  const renderLawCard = ({ item }: { item: LawScheme }) => (
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
        <View style={[styles.cardImagePlaceholder, { backgroundColor: item.tagColor + '15' }]}>
          <Ionicons 
            name={getCategoryIcon(item.category) as any} 
            size={32} 
            color={item.tagColor} 
          />
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeBadgeColor(item.type) }]}>
            <Text style={styles.typeBadgeText}>{getTypeLabel(item.type)}</Text>
          </View>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText} numberOfLines={1}>
              {CATEGORIES.find(c => c.id === item.category)?.name || item.category}
            </Text>
          </View>
        </View>
        
        <Text style={styles.cardDescription} numberOfLines={2}>{item.preview}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.learnMore}>Learn more →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            <Text style={styles.headerSubtitle}>
              {activeTab === 'central' ? 'Pan-India Laws & Schemes' : `${getSelectedStateName()} Laws & Schemes`}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.savedButton} onPress={handleSavedItems} activeOpacity={0.8}>
            <Ionicons name="bookmark" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Central / State Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'central' && styles.tabActive]}
            onPress={() => setActiveTab('central')}
            activeOpacity={0.8}
            data-testid="central-tab"
          >
            <Ionicons 
              name="flag" 
              size={18} 
              color={activeTab === 'central' ? COLORS.white : COLORS.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'central' && styles.tabTextActive]}>
              Central
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'state' && styles.tabActive]}
            onPress={() => setActiveTab('state')}
            activeOpacity={0.8}
            data-testid="state-tab"
          >
            <Ionicons 
              name="location" 
              size={18} 
              color={activeTab === 'state' ? COLORS.white : COLORS.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'state' && styles.tabTextActive]}>
              State
            </Text>
          </TouchableOpacity>
        </View>

        {/* State Selector (only when State tab is active) */}
        {activeTab === 'state' && (
          <TouchableOpacity 
            style={styles.stateSelector}
            onPress={() => setShowStateSelector(true)}
            activeOpacity={0.8}
            data-testid="state-selector"
          >
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <Text style={styles.stateSelectorText}>{getSelectedStateName()}</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search laws, schemes, keywords..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              data-testid="search-input"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.filterButton, showAdvancedFilters && styles.filterButtonActive]}
            onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
            activeOpacity={0.8}
            data-testid="filter-toggle"
          >
            <Ionicons 
              name="options" 
              size={20} 
              color={showAdvancedFilters ? COLORS.white : COLORS.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <View style={styles.advancedFilters}>
            <Text style={styles.filterLabel}>Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilters}>
              {(['all', 'law', 'scheme', 'portal'] as TypeFilter[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, typeFilter === type && styles.typeChipActive]}
                  onPress={() => setTypeFilter(type)}
                  data-testid={`type-filter-${type}`}
                >
                  <Text style={[styles.typeChipText, typeFilter === type && styles.typeChipTextActive]}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearAllFilters}>
              <Ionicons name="refresh" size={16} color={COLORS.primary} />
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Category Chips - Scrollable */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
          contentContainerStyle={styles.chipsContent}
        >
          {categoriesWithCounts.filter(c => c.count > 0 || c.id === 'all').map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.chip, selectedCategory === category.id && styles.chipSelected]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.8}
              data-testid={`category-chip-${category.id}`}
            >
              <Ionicons 
                name={category.icon as any} 
                size={16} 
                color={selectedCategory === category.id ? COLORS.white : COLORS.textPrimary} 
              />
              <Text style={[styles.chipText, selectedCategory === category.id && styles.chipTextSelected]}>
                {category.name}
              </Text>
              {category.count > 0 && (
                <View style={[styles.countBadge, selectedCategory === category.id && styles.countBadgeActive]}>
                  <Text style={[styles.countText, selectedCategory === category.id && styles.countTextActive]}>
                    {category.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredLaws.length} {filteredLaws.length === 1 ? 'result' : 'results'}
          </Text>
        </View>

        {/* Laws List */}
        <FlatList
          data={filteredLaws}
          renderItem={renderLawCard}
          keyExtractor={(item) => item.id}
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>Try a different search term or adjust filters</Text>
              <TouchableOpacity style={styles.clearFilterButton} onPress={clearAllFilters}>
                <Text style={styles.clearFilterText}>Clear all filters</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      </LinearGradient>

      {/* State Selector Modal */}
      <Modal
        visible={showStateSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStateSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStateSelector(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            {STATE_OPTIONS.map((state) => (
              <TouchableOpacity
                key={state.code}
                style={[styles.stateOption, selectedState === state.code && styles.stateOptionActive]}
                onPress={() => {
                  setSelectedState(state.code);
                  setShowStateSelector(false);
                }}
                data-testid={`state-option-${state.code}`}
              >
                <Ionicons 
                  name="location" 
                  size={20} 
                  color={selectedState === state.code ? COLORS.primary : COLORS.textSecondary} 
                />
                <Text style={[styles.stateOptionText, selectedState === state.code && styles.stateOptionTextActive]}>
                  {state.name}
                </Text>
                {selectedState === state.code && (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  
  // Header
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary },
  savedButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary + '40',
    justifyContent: 'center', alignItems: 'center',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: COLORS.chipBg,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },

  // State Selector
  stateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    gap: 8,
  },
  stateSelectorText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Search
  searchContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20, 
    marginBottom: 12,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 10, marginRight: 8, fontSize: 15, color: COLORS.textPrimary },
  filterButton: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  // Advanced Filters
  advancedFilters: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  typeFilters: {
    marginBottom: 10,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.chipBg,
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  typeChipTextActive: {
    color: COLORS.white,
  },
  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearFiltersText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Category Chips
  chipsContainer: { maxHeight: 50, marginBottom: 8 },
  chipsContent: { paddingHorizontal: 20, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 22,
    paddingHorizontal: 14, paddingVertical: 10, marginRight: 8,
    borderWidth: 1, borderColor: COLORS.border,
    gap: 6,
  },
  chipSelected: { backgroundColor: COLORS.chipSelected, borderColor: COLORS.chipSelected },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  chipTextSelected: { color: COLORS.white },
  countBadge: {
    backgroundColor: COLORS.chipBg,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  countTextActive: {
    color: COLORS.white,
  },

  // Results
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },

  // List
  listContainer: { flex: 1 },
  listContent: { paddingHorizontal: 20 },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 14, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
    position: 'relative',
  },
  saveButton: {
    position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, zIndex: 10,
  },
  cardImageContainer: { width: 90, height: 110, borderRadius: 12, overflow: 'hidden', marginRight: 12 },
  cardImagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  cardContent: { flex: 1, justifyContent: 'space-between', paddingRight: 36 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 20, marginBottom: 6 },
  
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.chipBg,
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  
  cardDescription: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17, marginBottom: 4 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnMore: { fontSize: 12, fontWeight: '600', color: COLORS.blue },

  // Empty State
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  clearFilterButton: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  clearFilterText: { fontSize: 14, fontWeight: '600', color: COLORS.white },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  stateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '50',
  },
  stateOptionActive: {
    backgroundColor: COLORS.primary + '10',
  },
  stateOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  stateOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
