import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { SaveGame } from '../../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const SAVE_FILE = path.join(DATA_DIR, 'savegame.json');

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(SAVE_FILE)) {
      return res.json({ success: true, data: null });
    }
    const content = fs.readFileSync(SAVE_FILE, 'utf-8');
    const saveData = JSON.parse(content) as SaveGame;
    res.json({ success: true, data: saveData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load save game' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const saveData = req.body as SaveGame;
    saveData.savedAt = Date.now();
    
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    fs.writeFileSync(SAVE_FILE, JSON.stringify(saveData, null, 2), 'utf-8');
    res.json({ success: true, message: 'Game saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save game' });
  }
});

router.delete('/', (req: Request, res: Response) => {
  try {
    if (fs.existsSync(SAVE_FILE)) {
      fs.unlinkSync(SAVE_FILE);
    }
    res.json({ success: true, message: 'Save game deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete save game' });
  }
});

export default router;
