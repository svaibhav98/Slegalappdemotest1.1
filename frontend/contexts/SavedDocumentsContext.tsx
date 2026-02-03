import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedDocument {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  size: string;
  isSaved: boolean;
  hasStampDuty?: boolean;
}

interface SavedDocumentsContextType {
  documents: SavedDocument[];
  addDocument: (doc: SavedDocument) => void;
  updateDocument: (docId: string, updates: Partial<SavedDocument>) => void;
  toggleSaveDocument: (docId: string) => void;
  isDocumentSaved: (docId: string) => boolean;
  getDocument: (docId: string) => SavedDocument | undefined;
  getSavedDocuments: () => SavedDocument[];
}

const STORAGE_KEY = 'sunolegal_saved_documents';

const SavedDocumentsContext = createContext<SavedDocumentsContextType | undefined>(undefined);

// Initial demo documents
const INITIAL_DOCUMENTS: SavedDocument[] = [
  { id: 'doc-1', name: 'Rent Agreement - Flat 302', type: 'Rent Agreement', createdAt: '2025-01-20', size: '245 KB', isSaved: true, hasStampDuty: true },
  { id: 'doc-2', name: 'Consumer Complaint - Amazon', type: 'Consumer Complaint', createdAt: '2025-01-18', size: '189 KB', isSaved: false },
  { id: 'doc-3', name: 'NDA - TechCorp India', type: 'NDA', createdAt: '2025-01-15', size: '156 KB', isSaved: true },
];

export function SavedDocumentsProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<SavedDocument[]>(INITIAL_DOCUMENTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load documents from AsyncStorage on mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedDocs = JSON.parse(stored);
          // Merge with initial documents (keeping unique ids)
          const mergedDocs = [...INITIAL_DOCUMENTS];
          parsedDocs.forEach((doc: SavedDocument) => {
            if (!mergedDocs.some(d => d.id === doc.id)) {
              mergedDocs.push(doc);
            } else {
              // Update existing doc with stored state
              const index = mergedDocs.findIndex(d => d.id === doc.id);
              if (index >= 0) {
                mergedDocs[index] = { ...mergedDocs[index], ...doc };
              }
            }
          });
          setDocuments(mergedDocs);
        }
      } catch (error) {
        console.log('Error loading documents:', error);
      }
      setIsLoaded(true);
    };
    loadDocuments();
  }, []);

  // Save documents to AsyncStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      const saveDocuments = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
        } catch (error) {
          console.log('Error saving documents:', error);
        }
      };
      saveDocuments();
    }
  }, [documents, isLoaded]);

  const addDocument = useCallback((doc: SavedDocument) => {
    setDocuments(prev => {
      // Check if document already exists
      if (prev.some(d => d.id === doc.id)) {
        // Update existing
        return prev.map(d => d.id === doc.id ? { ...d, ...doc } : d);
      }
      // Add new document at the beginning
      return [doc, ...prev];
    });
  }, []);

  const updateDocument = useCallback((docId: string, updates: Partial<SavedDocument>) => {
    setDocuments(prev => 
      prev.map(d => d.id === docId ? { ...d, ...updates } : d)
    );
  }, []);

  const toggleSaveDocument = useCallback((docId: string) => {
    setDocuments(prev => 
      prev.map(d => d.id === docId ? { ...d, isSaved: !d.isSaved } : d)
    );
  }, []);

  const isDocumentSaved = useCallback((docId: string) => {
    const doc = documents.find(d => d.id === docId);
    return doc?.isSaved || false;
  }, [documents]);

  const getDocument = useCallback((docId: string) => {
    return documents.find(d => d.id === docId);
  }, [documents]);

  const getSavedDocuments = useCallback(() => {
    return documents.filter(d => d.isSaved);
  }, [documents]);

  return (
    <SavedDocumentsContext.Provider value={{ 
      documents, 
      addDocument, 
      updateDocument, 
      toggleSaveDocument, 
      isDocumentSaved,
      getDocument,
      getSavedDocuments
    }}>
      {children}
    </SavedDocumentsContext.Provider>
  );
}

export function useSavedDocuments() {
  const context = useContext(SavedDocumentsContext);
  if (context === undefined) {
    throw new Error('useSavedDocuments must be used within a SavedDocumentsProvider');
  }
  return context;
}
