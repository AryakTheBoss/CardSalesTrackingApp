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
  quantity?: number;
  isTrade?: boolean;
}

export interface Sale {
  id: string;
  cardId: string;
  soldPrice: number;
  date: string;
  notes: string;
  showId?: string;
  quantitySold?: number;
  isTrade?: boolean;
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
  isDemoMode: boolean;
  firebaseError: string | null;
  setIsGuest: (isGuest: boolean) => void;
  setIsDemoMode: (isDemo: boolean) => void;
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
  isDemoMode: false,
  firebaseError: null,

  setIsGuest: (isGuest) => set({ isGuest }),
  setIsDemoMode: (isDemoMode) => {
    if (isDemoMode) {
      // Load dummy data
      const c1: Card = { id: 'd-c1', name: 'Charizard Base Set', pricePaid: 150, type: 'raw', condition: 'LP', status: 'in-stock', dateAdded: new Date(Date.now() - 864000000).toISOString(), quantity: 1, notes: '' };
      const c2: Card = { id: 'd-c2', name: 'Lugia 1st Edition', pricePaid: 800, type: 'slab', gradingCompany: 'PSA', grade: '9', status: 'in-stock', dateAdded: new Date(Date.now() - 400000000).toISOString(), quantity: 1, notes: '' };
      const c3: Card = { id: 'd-c3', name: 'Umbreon VMAX Alt Art', pricePaid: 450, type: 'raw', condition: 'NM', status: 'sold', dateAdded: new Date(Date.now() - 600000000).toISOString(), quantity: 0, notes: '' };
      const c4: Card = { id: 'd-c4', name: 'Rayquaza Gold Star', pricePaid: 1200, type: 'slab', gradingCompany: 'BGS', grade: '9.5', status: 'sold', dateAdded: new Date(Date.now() - 700000000).toISOString(), quantity: 0, notes: '' };
      const c5: Card = { id: 'd-c5', name: '151 Booster Bundle', pricePaid: 25, type: 'sealed', status: 'in-stock', dateAdded: new Date(Date.now() - 100000000).toISOString(), quantity: 5, notes: '' };

      const s1: Sale = { id: 'd-s1', cardId: 'd-c3', soldPrice: 650, date: new Date(Date.now() - 200000000).toISOString(), notes: 'eBay sale' };
      const s2: Sale = { id: 'd-s2', cardId: 'd-c4', soldPrice: 1800, date: new Date(Date.now() - 300000000).toISOString(), notes: 'Discord deal' };
      const s3: Sale = { id: 'd-s3', cardId: 'd-c5', soldPrice: 45, date: new Date(Date.now() - 50000000).toISOString(), notes: 'Local trade', quantitySold: 1, isTrade: true };
      const s4: Sale = { id: 'd-s4', cardId: 'd-c5', soldPrice: 45, date: new Date(Date.now() - 40000000).toISOString(), notes: 'Local deal', quantitySold: 1 };
      const s5: Sale = { id: 'd-s5', cardId: 'd-c5', soldPrice: 40, date: new Date(Date.now() - 30000000).toISOString(), notes: 'Bulk discount', quantitySold: 2 };
      const show1: Show = { id: 'd-show1', name: 'Collect-A-Con', date: new Date(Date.now() + 864000000).toISOString(), tables: 2, tableCost: 350 };
      const shift1: Shift = { id: 'd-shift1', employee: 'Tae', showId: 'd-show1', date: new Date(Date.now() + 864000000).toISOString(), hours: 8, hourlyRate: 15, bonus: 0, status: 'Pending' };
      
      set({ 
        isDemoMode: true, 
        inventory: [c1, c2, c3, c4, c5], 
        sales: [s1, s2, s3, s4, s5], 
        shows: [show1], 
        shifts: [shift1], 
        isFirebaseInitialized: true 
      });
    } else {
      set({ isDemoMode: false, inventory: [], sales: [], shows: [], shifts: [] });
    }
  },
  setFirebaseError: (firebaseError) => set({ firebaseError }),

  initializeFirebaseListeners: () => {
    if (get().isDemoMode) {
      set({ isFirebaseInitialized: true });
      return () => {};
    }

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
      dateAdded: new Date().toISOString(),
      quantity: card.quantity || 1
    };
    
    if (get().isDemoMode) {
      set(state => ({ inventory: [...state.inventory, newCard] }));
      return;
    }

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

    if (get().isDemoMode) {
      set(state => ({
        inventory: state.inventory.map(c => c.id === id ? { ...c, ...cardData } : c)
      }));
      return;
    }

    await updateDoc(doc(db, 'inventory', id), sanitizedData);
  },

  deleteCard: async (id) => {
    const state = get();
    if (state.isDemoMode) {
      set(s => ({
        inventory: s.inventory.filter(c => c.id !== id),
        sales: s.sales.filter(sale => sale.cardId !== id)
      }));
      return;
    }

    await deleteDoc(doc(db, 'inventory', id));
    // Also delete associated sales
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
      quantitySold: sale.quantitySold || 1,
    };
    
    const state = get();
    const card = state.inventory.find(c => c.id === newSale.cardId);
    const currentQty = card?.quantity ?? 1;
    const newQty = currentQty - (newSale.quantitySold || 1);

    if (state.isDemoMode) {
      set(s => ({
        sales: [...s.sales, newSale],
        inventory: s.inventory.map(c => 
          c.id === newSale.cardId 
            ? { ...c, status: newQty <= 0 ? 'sold' : 'in-stock', quantity: newQty } 
            : c
        )
      }));
      return;
    }

    const batch = writeBatch(db);
    batch.set(doc(db, 'sales', newSale.id), newSale);
    batch.update(doc(db, 'inventory', newSale.cardId), { 
      status: newQty <= 0 ? 'sold' : 'in-stock',
      quantity: newQty
    });
    await batch.commit();
  },

  updateSale: async (id, saleData) => {
    const state = get();
    const existingSale = state.sales.find(s => s.id === id);
    if (!existingSale) return;

    const sanitizedData = { ...saleData } as any;
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined) {
        sanitizedData[key] = deleteField();
      }
    });

    const batch = writeBatch(db);
    batch.update(doc(db, 'sales', id), sanitizedData);

    if (saleData.quantitySold !== undefined && saleData.quantitySold !== existingSale.quantitySold) {
      const card = state.inventory.find(c => c.id === existingSale.cardId);
      if (card) {
        const oldQtySold = existingSale.quantitySold || 1;
        const newQtySold = saleData.quantitySold;
        const diff = newQtySold - oldQtySold;
        const currentQty = card.quantity ?? 1;
        const newInventoryQty = currentQty - diff;

        batch.update(doc(db, 'inventory', existingSale.cardId), {
          quantity: newInventoryQty,
          status: newInventoryQty <= 0 ? 'sold' : 'in-stock'
        });
      }
    }

    if (state.isDemoMode) {
      set(s => {
        let newInventory = [...s.inventory];
        if (saleData.quantitySold !== undefined && saleData.quantitySold !== existingSale.quantitySold) {
          const card = newInventory.find(c => c.id === existingSale.cardId);
          if (card) {
            const oldQtySold = existingSale.quantitySold || 1;
            const diff = saleData.quantitySold - oldQtySold;
            const currentQty = card.quantity ?? 1;
            const newInventoryQty = currentQty - diff;
            card.quantity = newInventoryQty;
            card.status = newInventoryQty <= 0 ? 'sold' : 'in-stock';
          }
        }
        return {
          sales: s.sales.map(sItem => sItem.id === id ? { ...sItem, ...saleData } : sItem),
          inventory: newInventory
        };
      });
      return;
    }

    await batch.commit();
  },

  deleteSale: async (id) => {
    const state = get();
    const sale = state.sales.find(s => s.id === id);
    if (!sale) return;

    const card = state.inventory.find(c => c.id === sale.cardId);

    const batch = writeBatch(db);
    batch.delete(doc(db, 'sales', id));
    
    if (card) {
      const currentQty = card.quantity ?? 0;
      const newQty = currentQty + (sale.quantitySold || 1);
      
      if (state.isDemoMode) {
        set(s => ({
          sales: s.sales.filter(sItem => sItem.id !== id),
          inventory: s.inventory.map(c => 
            c.id === sale.cardId ? { ...c, status: 'in-stock', quantity: newQty } : c
          )
        }));
        return;
      }

      batch.update(doc(db, 'inventory', sale.cardId), { 
        status: 'in-stock',
        quantity: newQty
      });
    } else if (state.isDemoMode) {
      set(s => ({ sales: s.sales.filter(sItem => sItem.id !== id) }));
      return;
    }

    await batch.commit();
  },

  addShow: async (show) => {
    const newShow: Show = {
      ...show,
      id: generateId(),
    };

    if (get().isDemoMode) {
      set(state => ({ shows: [...state.shows, newShow] }));
      return;
    }

    await setDoc(doc(db, 'shows', newShow.id), newShow);
  },

  updateShow: async (id, showData) => {
    const sanitizedData = { ...showData } as any;
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined) {
        sanitizedData[key] = deleteField();
      }
    });

    if (get().isDemoMode) {
      set(state => ({
        shows: state.shows.map(s => s.id === id ? { ...s, ...showData } : s)
      }));
      return;
    }

    await updateDoc(doc(db, 'shows', id), sanitizedData);
  },

  deleteShow: async (id) => {
    if (get().isDemoMode) {
      set(state => ({ shows: state.shows.filter(s => s.id !== id) }));
      return;
    }
    await deleteDoc(doc(db, 'shows', id));
  },

  addShift: async (shift) => {
    const newShift: Shift = {
      ...shift,
      id: generateId(),
    };

    if (get().isDemoMode) {
      set(state => ({ shifts: [...state.shifts, newShift] }));
      return;
    }

    await setDoc(doc(db, 'shifts', newShift.id), newShift);
  },

  updateShift: async (id, shiftData) => {
    const sanitizedData = { ...shiftData } as any;
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined) {
        sanitizedData[key] = deleteField();
      }
    });

    if (get().isDemoMode) {
      set(state => ({
        shifts: state.shifts.map(s => s.id === id ? { ...s, ...shiftData } : s)
      }));
      return;
    }

    await updateDoc(doc(db, 'shifts', id), sanitizedData);
  },

  deleteShift: async (id) => {
    if (get().isDemoMode) {
      set(state => ({ shifts: state.shifts.filter(s => s.id !== id) }));
      return;
    }
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
    
    if (get().isDemoMode) {
      set(state => ({
        inventory: [...state.inventory, ...inventory],
        sales: [...state.sales, ...sales]
      }));
      return;
    }

    await batch.commit();
  },

  refreshData: async () => {
    if (get().isDemoMode) return;

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
