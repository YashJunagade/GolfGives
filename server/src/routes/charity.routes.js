import { Router } from 'express';
import auth from '../middleware/auth.js';
import requireAdmin from '../middleware/requireAdmin.js';
import {
  getCharities, getCharity, selectCharity, deselectCharity,
  createCharity, updateCharity, deleteCharity,
  getCharityEvents, createCharityEvent, deleteCharityEvent,
} from '../controllers/charity.controller.js';

const router = Router();

// Public
router.get('/',    getCharities);
router.get('/:id', getCharity);

// Authenticated
router.patch('/select',   auth, selectCharity);
router.delete('/select',  auth, deselectCharity);

// Admin
router.post('/',       auth, requireAdmin, createCharity);
router.patch('/:id',   auth, requireAdmin, updateCharity);
router.delete('/:id',  auth, requireAdmin, deleteCharity);

// Events (public read, admin write)
router.get('/:id/events',                   getCharityEvents);
router.post('/:id/events',                  auth, requireAdmin, createCharityEvent);
router.delete('/:id/events/:eventId',       auth, requireAdmin, deleteCharityEvent);

export default router;
