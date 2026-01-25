import React, { createContext, useContext, useState, useCallback } from 'react';

export interface SavedLaw {
  lawId: string;
  title: string;
  category: string;
  tagLabel: string;
  tagColor: string;
  timestamp: number;
}

interface SavedLawsContextType {
  savedLaws: SavedLaw[];
  isLawSaved: (lawId: string) => boolean;
  saveLaw: (law: Omit<SavedLaw, 'timestamp'>) => void;
  unsaveLaw: (lawId: string) => void;
  toggleSaveLaw: (law: Omit<SavedLaw, 'timestamp'>) => void;
}

const SavedLawsContext = createContext<SavedLawsContextType | undefined>(undefined);

export function SavedLawsProvider({ children }: { children: React.ReactNode }) {
  const [savedLaws, setSavedLaws] = useState<SavedLaw[]>([]);

  const isLawSaved = useCallback((lawId: string) => {
    return savedLaws.some(law => law.lawId === lawId);
  }, [savedLaws]);

  const saveLaw = useCallback((law: Omit<SavedLaw, 'timestamp'>) => {
    setSavedLaws(prev => {
      if (prev.some(l => l.lawId === law.lawId)) return prev;
      return [...prev, { ...law, timestamp: Date.now() }];
    });
  }, []);

  const unsaveLaw = useCallback((lawId: string) => {
    setSavedLaws(prev => prev.filter(law => law.lawId !== lawId));
  }, []);

  const toggleSaveLaw = useCallback((law: Omit<SavedLaw, 'timestamp'>) => {
    setSavedLaws(prev => {
      const exists = prev.some(l => l.lawId === law.lawId);
      if (exists) {
        return prev.filter(l => l.lawId !== law.lawId);
      }
      return [...prev, { ...law, timestamp: Date.now() }];
    });
  }, []);

  return (
    <SavedLawsContext.Provider value={{ savedLaws, isLawSaved, saveLaw, unsaveLaw, toggleSaveLaw }}>
      {children}
    </SavedLawsContext.Provider>
  );
}

export function useSavedLaws() {
  const context = useContext(SavedLawsContext);
  if (context === undefined) {
    throw new Error('useSavedLaws must be used within a SavedLawsProvider');
  }
  return context;
}
