import express from 'express'
import { login, logout, signup } from './auth.controller.js'
import { log } from '../../middlewares/log.middleware.js'

const router = express.Router()

router.post('/login', log, login)
router.post('/signup', log, signup)
router.post('/logout', log, logout)

export const authRoutes = router