import { create } from 'zustand';
import { db } from '../config/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';

export type CardType = 'slab' | 'raw';
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
}

interface AppState {
  inventory: Card[];
  sales: Sale[];
  isFirebaseInitialized: boolean;
  initializeFirebaseListeners: () => () => void;
  addCard: (card: Omit<Card, 'id' | 'status' | 'dateAdded'>) => Promise<void>;
  updateCard: (id: string, cardData: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'date'> & { date?: string }) => Promise<void>;
  syncFromExcel: (inventory: Card[], sales: Sale[]) => Promise<void>;
  getProfitByMonth: (year: number) => { month: string; profit: number }[];
}

export const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
};

export const useStore = create<AppState>()((set, get) => ({
  inventory: [],
  sales: [],
  isFirebaseInitialized: false,

  initializeFirebaseListeners: () => {
    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const inventory = snapshot.docs.map(doc => doc.data() as Card);
      set({ inventory, isFirebaseInitialized: true });
    });

    const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const sales = snapshot.docs.map(doc => doc.data() as Sale);
      set({ sales });
    });

    return () => {
      unsubInventory();
      unsubSales();
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
    await updateDoc(doc(db, 'inventory', id), cardData);
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

  getProfitByMonth: (year) => {
    const state = get();
    const sales = state.sales || [];
    const inventory = state.inventory || [];
    const monthlyProfits = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
      profit: 0
    }));

    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      if (saleDate.getFullYear() === year) {
        const card = inventory.find(c => c.id === sale.cardId);
        if (card) {
          const profit = sale.soldPrice - card.pricePaid;
          monthlyProfits[saleDate.getMonth()].profit += profit;
        }
      }
    });

    return monthlyProfits;
  }
}));
