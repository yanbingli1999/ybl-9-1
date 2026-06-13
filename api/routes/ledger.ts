import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { LedgerEntry } from '../../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const LEDGER_FILE = path.join(DATA_DIR, 'ledger.json');

const router = express.Router();

const readLedger = (): LedgerEntry[] => {
  if (!fs.existsSync(LEDGER_FILE)) {
    return [];
  }
  const content = fs.readFileSync(LEDGER_FILE, 'utf-8');
  return JSON.parse(content);
};

const writeLedger = (entries: LedgerEntry[]) => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(LEDGER_FILE, JSON.stringify(entries, null, 2), 'utf-8');
};

router.get('/', (req: Request, res: Response) => {
  try {
    const { day } = req.query;
    let entries = readLedger();
    
    if (day) {
      entries = entries.filter(e => e.day === Number(day));
    }
    
    entries.sort((a, b) => b.createdAt - a.createdAt);
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load ledger' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const entry = req.body as LedgerEntry;
    entry.id = `ledger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    entry.createdAt = Date.now();
    
    const entries = readLedger();
    entries.push(entry);
    writeLedger(entries);
    
    res.json({ success: true, id: entry.id });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add ledger entry' });
  }
});

router.post('/batch', (req: Request, res: Response) => {
  try {
    const newEntries = req.body as LedgerEntry[];
    const entries = readLedger();
    
    newEntries.forEach(entry => {
      entry.id = `ledger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      entry.createdAt = Date.now();
      entries.push(entry);
    });
    
    writeLedger(entries);
    res.json({ success: true, count: newEntries.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add ledger entries' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entries = readLedger();
    const filtered = entries.filter(e => e.id !== id);
    writeLedger(filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete ledger entry' });
  }
});

export default router;
