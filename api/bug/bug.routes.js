import express from 'express'
import { addBug, getBug, getBugs, removeBug, updateBug } from './bug.controller.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'

const router = express.Router()

router.get('/',requireAuth, getBugs)
router.get('/:bugId', getBug)
router.put('/:bugId',requireAuth, updateBug)
router.post('/', requireAuth, addBug)
router.delete('/:bugId',requireAuth, removeBug)

export const bugRoutes = router