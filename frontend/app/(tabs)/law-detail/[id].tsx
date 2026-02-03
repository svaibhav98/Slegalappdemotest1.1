import React, { useEffect, useState, useRef } from 'react';
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
import { useSavedLaws } from '../../../contexts/SavedLawsContext';
import {
  getLawById,
  getCentralLaws,
  getStateLaws,
  CATEGORIES,
  STATE_OPTIONS,
  LawScheme,
  DISCLAIMER,
} from '../../../services/lawsDataExport';

const { width } = Dimensions.get('window');

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
  green: '#10B981',
  purple: '#8B5CF6',
  red: '#EF4444',
};

// Section icons mapping
const SECTION_ICONS: Record<string, string> = {
  'Overview': 'information-circle',
  'Why This Matters': 'star',
  'Common Real-Life Problems': 'warning',
  'What Citizens Can Do (Steps)': 'checkmark-circle',
  'Documents Usually Required': 'document-text',
  'Where to Apply / Complain / Track': 'location',
};

export default function LawDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { isLawSaved, toggleSaveLaw } = useSavedLaws();
  
  const [lawItem, setLawItem] = useState<LawScheme | null>(null);
  const [relatedItems, setRelatedItems] = useState<LawScheme[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Overview']));
  const scrollViewRef = useRef<ScrollView>(null);
  
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
      // Scroll to top when navigating to a new law detail
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      
      const item = getLawById(id);
      if (item) {
        setLawItem(item);
        // Get related items from same category or level
        const allLaws = item.level === 'central' 
          ? getCentralLaws() 
          : getStateLaws(item.stateCode || '');
        const related = allLaws
          .filter(l => l.id !== item.id && (l.category === item.category || l.type === item.type))
          .slice(0, 4);
        setRelatedItems(related);
        // Expand all sections by default
        setExpandedSections(new Set(item.sections.map(s => s.title)));
      }
    }
  }, [id]);

  const handleBack = () => {
    // Navigate back to the Laws page
    // Using push ensures proper navigation to the Laws screen
    router.push('/(tabs)/laws');
  };

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  const handleRelatedPress = (item: LawScheme) => {
    router.push({
      pathname: '/(tabs)/law-detail/[id]',
      params: { id: item.id }
    });
  };

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  const getCategoryIcon = (category: string): string => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.icon || 'document-text';
  };

  const getSectionIcon = (title: string): string => {
    return SECTION_ICONS[title] || 'chevron-forward';
  };

  const getStateName = (code: string): string => {
    return STATE_OPTIONS.find(s => s.code === code)?.name || code;
  };

  if (!lawItem) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.8}
            data-testid="back-button"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={2}>{lawItem.title}</Text>
          </View>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleToggleSave}
            activeOpacity={0.8}
            data-testid="save-button"
          >
            <Ionicons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isSaved ? COLORS.primary : COLORS.white} 
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Meta Info Card */}
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <View style={[styles.typeBadge, { backgroundColor: lawItem.tagColor }]}>
                <Text style={styles.typeBadgeText}>{lawItem.tagLabel}</Text>
              </View>
              <View style={styles.levelBadge}>
                <Ionicons 
                  name={lawItem.level === 'central' ? 'flag' : 'location'} 
                  size={14} 
                  color={COLORS.textSecondary} 
                />
                <Text style={styles.levelText}>
                  {lawItem.level === 'central' ? 'Pan-India' : getStateName(lawItem.stateCode || '')}
                </Text>
              </View>
            </View>
            <View style={styles.categoryRow}>
              <Ionicons name={getCategoryIcon(lawItem.category) as any} size={16} color={COLORS.textSecondary} />
              <Text style={styles.categoryText}>
                {CATEGORIES.find(c => c.id === lawItem.category)?.name || lawItem.category}
              </Text>
            </View>
            {lawItem.lastUpdated && (
              <Text style={styles.lastUpdated}>Last updated: {lawItem.lastUpdated}</Text>
            )}
          </View>

          {/* Sections */}
          {lawItem.sections.map((section, index) => (
            <View key={index} style={styles.sectionCard}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => toggleSection(section.title)}
                activeOpacity={0.8}
              >
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionIcon, { backgroundColor: lawItem.tagColor + '20' }]}>
                    <Ionicons 
                      name={getSectionIcon(section.title) as any} 
                      size={18} 
                      color={lawItem.tagColor} 
                    />
                  </View>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <Ionicons 
                  name={expandedSections.has(section.title) ? 'chevron-up' : 'chevron-down'} 
                  size={22} 
                  color={COLORS.textMuted} 
                />
              </TouchableOpacity>
              
              {expandedSections.has(section.title) && (
                <View style={styles.sectionContent}>
                  {section.content.map((item, idx) => (
                    <View key={idx} style={styles.contentItem}>
                      {section.title.includes('Steps') || section.title.includes('Problems') || 
                       section.title.includes('Matters') || section.title.includes('Documents') ||
                       section.title.includes('Apply') ? (
                        <>
                          <View style={[styles.bullet, { backgroundColor: lawItem.tagColor }]} />
                          <Text style={styles.contentText}>{item}</Text>
                        </>
                      ) : (
                        <Text style={styles.paragraphText}>{item}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Official Links */}
          {lawItem.officialLinks && lawItem.officialLinks.length > 0 && (
            <View style={styles.linksCard}>
              <Text style={styles.linksTitle}>Official Links & Resources</Text>
              {lawItem.officialLinks.map((link, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.linkItem}
                  onPress={() => handleOpenLink(link.url)}
                  activeOpacity={0.8}
                >
                  <View style={styles.linkIcon}>
                    <Ionicons name="globe-outline" size={18} color={COLORS.link} />
                  </View>
                  <View style={styles.linkContent}>
                    <Text style={styles.linkLabel}>{link.label}</Text>
                    <Text style={styles.linkUrl} numberOfLines={1}>{link.url}</Text>
                  </View>
                  <Ionicons name="open-outline" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimerCard}>
            <Ionicons name="alert-circle" size={18} color={COLORS.red} />
            <Text style={styles.disclaimerText}>{DISCLAIMER}</Text>
          </View>

          {/* Related Section */}
          {relatedItems.length > 0 && (
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
                      name={getCategoryIcon(item.category) as any} 
                      size={24} 
                      color={item.tagColor} 
                    />
                  </View>
                  <View style={styles.relatedTextContainer}>
                    <Text style={styles.relatedCardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.relatedCardSubtitle} numberOfLines={1}>
                      {item.tagLabel} • {CATEGORIES.find(c => c.id === item.category)?.name}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}

              <TouchableOpacity 
                style={styles.seeMoreButton}
                onPress={() => router.push('/(tabs)/laws')}
                activeOpacity={0.8}
              >
                <Text style={styles.seeMoreText}>Browse all Laws & Schemes</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}

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
  
  // Header
  header: {
    backgroundColor: COLORS.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 24,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Meta Card
  metaCard: {
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    gap: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Section Card
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '50',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  sectionContent: {
    padding: 16,
    paddingTop: 12,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 10,
  },
  contentText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  paragraphText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },

  // Links Card
  linksCard: {
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
  linksTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '50',
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.link + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkContent: {
    flex: 1,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  linkUrl: {
    fontSize: 12,
    color: COLORS.link,
  },

  // Disclaimer
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.red + '10',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.red,
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // Related Section
  relatedSection: {
    marginTop: 8,
  },
  relatedTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  relatedIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  relatedTextContainer: {
    flex: 1,
  },
  relatedCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  relatedCardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  // See More
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 6,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 6,
  },
});
