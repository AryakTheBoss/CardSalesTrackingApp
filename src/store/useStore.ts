import { create } from 'zustand';
import { persist } from 'zustand/middleware';


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
  addCard: (card: Omit<Card, 'id' | 'status' | 'dateAdded'>) => void;
  updateCard: (id: string, cardData: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date'> & { date?: string }) => void;
  syncFromExcel: (inventory: Card[], sales: Sale[]) => void;
  getProfitByMonth: (year: number) => { month: string; profit: number }[];
}

// Ensure we have a uuid implementation or just use crypto.randomUUID
// Wait, I didn't install uuid. I will use crypto.randomUUID() which works in modern browsers.
export const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      inventory: [],
      sales: [],
      addCard: (card) => set((state) => ({
        inventory: [
          ...state.inventory, 
          { 
            ...card, 
            id: generateId(), 
            status: 'in-stock', 
            dateAdded: new Date().toISOString() 
          }
        ]
      })),
      updateCard: (id, cardData) => set((state) => ({
        inventory: state.inventory.map(card => 
          card.id === id ? { ...card, ...cardData } : card
        )
      })),
      deleteCard: (id) => set((state) => ({
        inventory: state.inventory.filter(card => card.id !== id),
        sales: state.sales.filter(sale => sale.cardId !== id) // Remove associated sales if card is deleted
      })),
      addSale: (sale) => set((state) => {
        const newSale: Sale = {
          ...sale,
          id: generateId(),
          date: sale.date ? new Date(sale.date).toISOString() : new Date().toISOString(),
        };
        
        return {
          sales: [...state.sales, newSale],
          // Update the card status to 'sold'
          inventory: state.inventory.map(c => 
            c.id === sale.cardId ? { ...c, status: 'sold' } : c
          )
        };
      }),
      syncFromExcel: (inventory, sales) => set(() => ({
        inventory,
        sales
      })),
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
    }),
    {
      name: 'pokemon-inventory-storage',
    }
  )
);
