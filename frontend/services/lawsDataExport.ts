// Combined Laws & Schemes Export
// This file exports all data and helper functions for the Laws & Schemes feature

import { CENTRAL_LAWS, CATEGORIES, STATE_OPTIONS, LawScheme, LawSchemeType, LevelType, Section } from './lawsData';
import { MAHARASHTRA_LAWS } from './stateLawsData';
import { DELHI_LAWS, UP_LAWS } from './stateLawsData2';
import { KARNATAKA_LAWS } from './stateLawsKarnataka';

// Re-export types
export type { LawScheme, LawSchemeType, LevelType, Section };
export { CATEGORIES, STATE_OPTIONS };

// All State Laws combined
export const STATE_LAWS: Record<string, LawScheme[]> = {
  MH: MAHARASHTRA_LAWS,
  DL: DELHI_LAWS,
  UP: UP_LAWS,
  KA: KARNATAKA_LAWS,
};

// Get all central laws
export const getCentralLaws = (): LawScheme[] => CENTRAL_LAWS;

// Get state laws by state code
export const getStateLaws = (stateCode: string): LawScheme[] => {
  return STATE_LAWS[stateCode] || [];
};

// Get all laws (central + all states)
export const getAllLaws = (): LawScheme[] => {
  const allStateLaws = Object.values(STATE_LAWS).flat();
  return [...CENTRAL_LAWS, ...allStateLaws];
};

// Get law by ID
export const getLawById = (id: string): LawScheme | undefined => {
  const allLaws = getAllLaws();
  return allLaws.find(law => law.id === id);
};

// Search laws by query
export const searchLaws = (query: string, level?: LevelType, stateCode?: string): LawScheme[] => {
  let laws: LawScheme[];
  
  if (level === 'central') {
    laws = CENTRAL_LAWS;
  } else if (level === 'state' && stateCode) {
    laws = getStateLaws(stateCode);
  } else {
    laws = getAllLaws();
  }
  
  if (!query.trim()) return laws;
  
  const lowerQuery = query.toLowerCase();
  return laws.filter(law => 
    law.title.toLowerCase().includes(lowerQuery) ||
    law.preview.toLowerCase().includes(lowerQuery) ||
    law.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    law.category.toLowerCase().includes(lowerQuery)
  );
};

// Filter laws by category
export const filterByCategory = (laws: LawScheme[], categoryId: string): LawScheme[] => {
  if (categoryId === 'all') return laws;
  return laws.filter(law => law.category === categoryId);
};

// Filter laws by type
export const filterByType = (laws: LawScheme[], type: LawSchemeType): LawScheme[] => {
  return laws.filter(law => law.type === type);
};

// Get categories with counts for a given set of laws
export const getCategoriesWithCounts = (laws: LawScheme[]) => {
  return CATEGORIES.map(category => ({
    ...category,
    count: category.id === 'all' 
      ? laws.length 
      : laws.filter(law => law.category === category.id).length
  }));
};

// Get type badge colors
export const getTypeBadgeColor = (type: LawSchemeType): string => {
  switch (type) {
    case 'law': return '#8B5CF6';
    case 'scheme': return '#10B981';
    case 'portal': return '#3B82F6';
    default: return '#6B7280';
  }
};

// Get type label
export const getTypeLabel = (type: LawSchemeType): string => {
  switch (type) {
    case 'law': return 'Law';
    case 'scheme': return 'Scheme';
    case 'portal': return 'Portal';
    default: return 'Info';
  }
};

// Stats
export const getStats = () => ({
  totalCentral: CENTRAL_LAWS.length,
  totalMaharashtra: MAHARASHTRA_LAWS.length,
  totalDelhi: DELHI_LAWS.length,
  totalUP: UP_LAWS.length,
  totalKarnataka: KARNATAKA_LAWS.length,
  grandTotal: getAllLaws().length,
});

// Disclaimer text
export const DISCLAIMER = 'This information is for general awareness only and does not constitute legal advice. Please consult a qualified lawyer for specific legal matters.';
