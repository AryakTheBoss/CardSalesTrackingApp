import { create } from 'zustand';
import { db } from '../config/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, writeBatch, deleteField, getDocs } from 'firebase/firestore';

export type CardType = 'slab' | 'raw' | 'sealed';
export type CardStatus = 'in-stock' | 'sold';

export interface Card {
  id: string;
  name: string;
  pricePaid: number;
  type: CardType;
  notes: string;
  status: CardStatus;
  dateAdded: string;
  gradingCompany?: string;
  grade?: string;
  condition?: string;
}

export interface Sale {
  id: string;
  cardId: string;
  soldPrice: number;
  date: string;
  notes: string;
  showId?: string;
}

export interface Show {
  id: string;
  name: string;
  date: string;
  tables: number;
  tableCost: number;
}

export interface Shift {
  id: string;
  employee: 'Tae' | 'Hub' | 'Vic' | string;
  showId: string;
  date: string;
  hours: number;
  hourlyRate: number;
  bonus: number;
  status: 'Paid' | 'Pending';
}

interface AppState {
  inventory: Card[];
  sales: Sale[];
  shows: Show[];
  shifts: Shift[];
  isFirebaseInitialized: boolean;
  isGuest: boolean;
  firebaseError: string | null;
  setIsGuest: (isGuest: boolean) => void;
  setFirebaseError: (error: string | null) => void;
  initializeFirebaseListeners: () => () => void;
  addCard: (card: Omit<Card, 'id' | 'status' | 'dateAdded'>) => Promise<void>;
  updateCard: (id: string, cardData: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'date'> & { date?: string }) => Promise<void>;
  updateSale: (id: string, saleData: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  addShow: (show: Omit<Show, 'id'>) => Promise<void>;
  updateShow: (id: string, showData: Partial<Show>) => Promise<void>;
  deleteShow: (id: string) => Promise<void>;
  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  updateShift: (id: string, shiftData: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  syncFromExcel: (inventory: Card[], sales: Sale[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
};

export const useStore = create<AppState>()((set, get) => ({
  inventory: [],
  sales: [],
  shows: [],
  shifts: [],
  isFirebaseInitialized: false,
  isGuest: false,
  firebaseError: null,

  setIsGuest: (isGuest) => set({ isGuest }),
  setFirebaseError: (firebaseError) => set({ firebaseError }),

  initializeFirebaseListeners: () => {
    const handleSnapshotError = (error: any) => {
      console.error("Firebase Snapshot Error:", error);
      if (error.code === 'permission-denied') {
        set({ firebaseError: 'You do not have permission to access some data.' });
      } else {
        set({ firebaseError: error.message || 'Failed to sync with Firebase.' });
      }
    };

    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const inventory = snapshot.docs.map(doc => doc.data() as Card);
      set({ inventory, isFirebaseInitialized: true, firebaseError: null });
    }, handleSnapshotError);

    const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const sales = snapshot.docs.map(doc => doc.data() as Sale);
      set({ sales, firebaseError: null });
    }, handleSnapshotError);

    const unsubShows = onSnapshot(collection(db, 'shows'), (snapshot) => {
      const shows = snapshot.docs.map(doc => doc.data() as Show);
      set({ shows, firebaseError: null });
    }, handleSnapshotError);

    const unsubShifts = onSnapshot(collection(db, 'shifts'), (snapshot) => {
      const shifts = snapshot.docs.map(doc => doc.data() as Shift);
      set({ shifts, firebaseError: null });
    }, handleSnapshotError);

    return () => {
      unsubInventory();
      unsubSales();
      unsubShows();
      unsubShifts();
    };
  },

  addCard: async (card) => {
    const newCard: Card = {
      ...card,
      id: generateId(),
      status: 'in-stock',
      dateAdded: new Date().toISOString()
    };
    await setDoc(doc(db, 'inventory', newCard.id), newCard);
  },

  updateCard: async (id, cardData) => {
    // Convert undefined values to deleteField() for Firestore
    const sanitizedData = { ...cardData } as any;
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined) {
        sanitizedData[key] = deleteField();
      }
    });
    await updateDoc(doc(db, 'inventory', id), sanitizedData);
  },

  deleteCard: async (id) => {
    await deleteDoc(doc(db, 'inventory', id));
    // Also delete associated sales
    const state = get();
    const associatedSales = state.sales.filter(s => s.cardId === id);
    if (associatedSales.length > 0) {
      const batch = writeBatch(db);
      associatedSales.forEach(sale => {
        batch.delete(doc(db, 'sales', sale.id));
      });
      await batch.commit();
    }
  },

  addSale: async (sale) => {
    const newSale: Sale = {
      ...sale,
      id: generateId(),
      date: sale.date ? new Date(sale.date).toISOString() : new Date().toISOString(),
    };
    
    const batch = writeBatch(db);
    batch.set(doc(db, 'sales', newSale.id), newSale);
    batch.update(doc(db, 'inventory', newSale.cardId), { status: 'sold' });
    await batch.commit();
  },

  updateSale: async (id, saleData) => {
    const sanitizedData = { ...saleData } as any;
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined) {
        sanitizedData[key] = deleteField();
      }
    });
    await updateDoc(doc(db, 'sales', id), sanitizedData);
  },

  deleteSale: async (id) => {
    const state = get();
    const sale = state.sales.find(s => s.id === id);
    if (!sale) return;

    const batch = writeBatch(db);
    batch.delete(doc(db, 'sales', id));
    batch.update(doc(db, 'inventory', sale.cardId), { status: 'in-stock' });
    await batch.commit();
  },

  addShow: async (show) => {
    const newShow: Show = {
      ...show,
      id: generateId(),
    };
    await setDoc(doc(db, 'shows', newShow.id), newShow);
  },

  updateShow: async (id, showData) => {
    const sanitizedData = { ...showData } as any;
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined) {
        sanitizedData[key] = deleteField();
      }
    });
    await updateDoc(doc(db, 'shows', id), sanitizedData);
  },

  deleteShow: async (id) => {
    await deleteDoc(doc(db, 'shows', id));
  },

  addShift: async (shift) => {
    const newShift: Shift = {
      ...shift,
      id: generateId(),
    };
    await setDoc(doc(db, 'shifts', newShift.id), newShift);
  },

  updateShift: async (id, shiftData) => {
    const sanitizedData = { ...shiftData } as any;
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined) {
        sanitizedData[key] = deleteField();
      }
    });
    await updateDoc(doc(db, 'shifts', id), sanitizedData);
  },

  deleteShift: async (id) => {
    await deleteDoc(doc(db, 'shifts', id));
  },

  syncFromExcel: async (inventory, sales) => {
    const batch = writeBatch(db);
    
    // WARNING: This assumes a small enough dataset for a single batch (limit 500 ops)
    // For larger datasets, this would need to be chunked into multiple batches.
    inventory.forEach(card => {
      batch.set(doc(db, 'inventory', card.id), card);
    });
    
    sales.forEach(sale => {
      batch.set(doc(db, 'sales', sale.id), sale);
    });
    
    await batch.commit();
  },

  refreshData: async () => {
    try {
      const inventorySnapshot = await getDocs(collection(db, 'inventory'));
      const inventory = inventorySnapshot.docs.map(doc => doc.data() as Card);
      
      const salesSnapshot = await getDocs(collection(db, 'sales'));
      const sales = salesSnapshot.docs.map(doc => doc.data() as Sale);
      
      const showsSnapshot = await getDocs(collection(db, 'shows'));
      const shows = showsSnapshot.docs.map(doc => doc.data() as Show);
      
      const shiftsSnapshot = await getDocs(collection(db, 'shifts'));
      const shifts = shiftsSnapshot.docs.map(doc => doc.data() as Shift);
      
      set({ inventory, sales, shows, shifts, firebaseError: null });
    } catch (error: any) {
      console.error("Refresh Data Error:", error);
      if (error.code === 'permission-denied') {
        set({ firebaseError: 'Permission denied while refreshing data.' });
      } else {
        set({ firebaseError: error.message || 'Failed to refresh data from Firebase.' });
      }
    }
  }
}));
