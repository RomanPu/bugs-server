import express from 'express'
import { addUser, getUser, getUsers, removeUser, updateUser } from './user.controller.js'
import { adminOnly } from '../../middlewares/admin-only.middleware.js'

const router = express.Router()

router.get('/',adminOnly, getUsers)
router.get('/:userId',adminOnly, getUser)
router.put('/:userId',adminOnly, updateUser)
router.post('/',adminOnly, addUser)
router.delete('/:userId',adminOnly, removeUser)

export const userRoutes = router