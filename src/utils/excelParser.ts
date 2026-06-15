import * as XLSX from 'xlsx';
import { type Card, type Sale, generateId } from '../store/useStore';

const cleanKey = (key: string) => key.trim().replace(/[\r\n]+/g, ' ');

const parsePrice = (value: any): number => {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value;
  // Remove spaces, currency symbols, and commas before parsing
  const cleaned = String(value).replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const parseExcelFile = (file: File): Promise<{ inventory: Card[], sales: Sale[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });

        const newInventory: Card[] = [];
        const newSales: Sale[] = [];

        // 1. Parse Slabs Inventory
        const slabsSheetName = workbook.SheetNames.find(n => n.includes('Slabs Inventory'));
        if (slabsSheetName) {
          const slabsData = XLSX.utils.sheet_to_json<any>(workbook.Sheets[slabsSheetName], { range: 1, raw: false });
          slabsData.forEach(row => {
            const cardName = String(row['Card Name'] || '');
            if (!cardName || cardName.toUpperCase().includes('TOTAL')) return;

            newInventory.push({
              id: generateId(),
              name: cardName,
              type: 'slab',
              pricePaid: parsePrice(row['Buy Price ($)'] || row['Buy Price']),
              gradingCompany: row['Grade Co.\r\n(PSA/BGS/CGC)'] || row['Grade Co. (PSA/BGS/CGC)'] || row['Grade Co.'] || '',
              grade: String(row['Grade'] || ''),
              status: 'in-stock',
              dateAdded: row['Date Purchased'] ? new Date(row['Date Purchased']).toISOString() : new Date().toISOString(),
              notes: ''
            });
          });
        }

        // 2. Parse Raw Inventory
        const rawSheetName = workbook.SheetNames.find(n => n.includes('Raw Inventory'));
        if (rawSheetName) {
          // Normalize headers
          const rawDataRaw = XLSX.utils.sheet_to_json<any>(workbook.Sheets[rawSheetName], { range: 1, raw: false });
          const rawData = rawDataRaw.map(row => {
            const normalized: any = {};
            for (let key in row) {
              normalized[cleanKey(key)] = row[key];
            }
            return normalized;
          });

          rawData.forEach(row => {
            const cardName = String(row['Card Name'] || '');
            if (!cardName || cardName.toUpperCase().includes('TOTAL')) return;

            newInventory.push({
              id: generateId(),
              name: cardName,
              type: 'raw',
              pricePaid: parsePrice(row['Buy Price'] || row['Buy Price ($)']),
              condition: row['Condition'] || '',
              status: 'in-stock',
              dateAdded: new Date().toISOString(),
              notes: row['Notes'] || ''
            });
          });
        }

        // 3. Parse All-Time Sold
        const soldSheetName = workbook.SheetNames.find(n => n.includes('All-Time Sold'));
        if (soldSheetName) {
          const soldData = XLSX.utils.sheet_to_json<any>(workbook.Sheets[soldSheetName], { range: 1, raw: false });
          
          soldData.forEach(row => {
            const cardName = String(row['Card Name'] || '');
            if (!cardName || cardName.toUpperCase().includes('TOTAL')) return;

            // Create a "sold" card in inventory to link the sale
            const soldCardId = generateId();
            newInventory.push({
              id: soldCardId,
              name: cardName,
              type: 'raw', // Assuming raw by default for imported legacy sales
              pricePaid: parsePrice(row['Buy Price ($)'] || row['Buy Price']),
              status: 'sold',
              dateAdded: row['Date Sold'] ? new Date(row['Date Sold']).toISOString() : new Date().toISOString(),
              notes: 'Imported from Excel'
            });

            // Create the Sale record
            newSales.push({
              id: generateId(),
              cardId: soldCardId,
              soldPrice: parsePrice(row['Sold Price ($)'] || row['Sold Price']),
              date: row['Date Sold'] ? new Date(row['Date Sold']).toISOString() : new Date().toISOString(),
              notes: 'Imported from Excel'
            });
          });
        }

        resolve({ inventory: newInventory, sales: newSales });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
