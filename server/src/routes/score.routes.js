import { Router } from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import requireSubscription from '../middleware/requireSubscription.js';
import { getScores, addScore, updateScore, deleteScore } from '../controllers/score.controller.js';

const router = Router();

const scoreValidation = [
  body('score').isInt({ min: 1, max: 45 }).withMessage('Score must be between 1 and 45.'),
];

const dateValidation = [
  body('date').isDate({ format: 'YYYY-MM-DD' }).withMessage('Date must be in YYYY-MM-DD format.'),
];

router.get('/',       auth, getScores);
router.post('/',      auth, requireSubscription, [...scoreValidation, ...dateValidation], addScore);
router.patch('/:id',  auth, requireSubscription, scoreValidation, updateScore);
router.delete('/:id', auth, requireSubscription, deleteScore);

export default router;
