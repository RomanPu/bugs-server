import express from 'express'
import { adminOnly } from '../../middlewares/admin-only.middleware.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'
import { addMsg, getMsg, getMsgs, removeMsg, updateMsg } from './msg.controller.js'
const router = express.Router()

router.get('/', getMsgs)
router.get('/:msgId', requireAuth, getMsg)
router.put('/:msgId', requireAuth, updateMsg)
router.post('/', requireAuth, addMsg)
router.delete('/:msgId', adminOnly, removeMsg)

export const msgRoutes = router
