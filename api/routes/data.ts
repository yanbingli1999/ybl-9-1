import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

const router = express.Router();

const readJsonFile = (filename: string) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
};

router.get('/cities', (req: Request, res: Response) => {
  try {
    const cities = readJsonFile('cities.json');
    res.json({ success: true, data: cities });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load cities' });
  }
});

router.get('/routes', (req: Request, res: Response) => {
  try {
    const routes = readJsonFile('routes.json');
    res.json({ success: true, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load routes' });
  }
});

router.get('/goods', (req: Request, res: Response) => {
  try {
    const goods = readJsonFile('goods.json');
    res.json({ success: true, data: goods });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load goods' });
  }
});

router.get('/vehicles', (req: Request, res: Response) => {
  try {
    const vehicles = readJsonFile('vehicles.json');
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load vehicles' });
  }
});

router.get('/weather', (req: Request, res: Response) => {
  try {
    const weather = readJsonFile('weather.json');
    res.json({ success: true, data: weather });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load weather' });
  }
});

router.get('/events', (req: Request, res: Response) => {
  try {
    const events = readJsonFile('events.json');
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load events' });
  }
});

router.get('/all', (req: Request, res: Response) => {
  try {
    const cities = readJsonFile('cities.json');
    const routes = readJsonFile('routes.json');
    const goods = readJsonFile('goods.json');
    const vehicles = readJsonFile('vehicles.json');
    const weather = readJsonFile('weather.json');
    const events = readJsonFile('events.json');
    
    res.json({
      success: true,
      data: {
        cities,
        routes,
        goods,
        vehicles,
        weather,
        events,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load all data' });
  }
});

export default router;
