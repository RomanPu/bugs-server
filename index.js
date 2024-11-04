// import { UtilService } from "./servises/util.service.js";
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { msgRoutes } from './api/msg/msg.routes.js'
import { bugRoutes } from './api/bug/bug.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'


const corsOptions = {
	origin: ['http://127.0.0.1:5172', 'http://localhost:5173'],
	credentials: true,
}
const app = express()
const port = 5032 || process.env.PORT

app.use(express.static('public'))
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.all('*', setupAsyncLocalStorage)

app.use('/api/bug', bugRoutes)
app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/msg', msgRoutes)

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


app.listen(port, () =>
console.log(`Server listening on port http://127.0.0.1:${port}/`)
)


