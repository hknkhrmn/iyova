import { Router } from 'express';
import { getMeds, createMed, toggleMed, deleteMed } from '../controllers/medController.js';

const router = Router();

router.get('/',            getMeds);
router.post('/',           createMed);
router.patch('/:id/toggle', toggleMed);
router.delete('/:id',      deleteMed);

export default router;
