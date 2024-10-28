import { authService } from '../api/auth/auth.service.js'

export function adminOnly(req, res, next) {
	const loggedinUser = authService.validateToken(req.cookies.loginToken)
	if (!loggedinUser || !loggedinUser.isAdmin) return res.status(401).send('Admin only!!')
	next()
}
