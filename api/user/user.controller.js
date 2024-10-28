import { userService } from './user.service.js'

export async function updateUser(req, res) {
    const { _id, fullname, username, password, score } = req.body
    const userToSave = { _id, fullname, username, password, score: +score }


    try {
        const savedUser = await userService.save(userToSave)
        res.send(savedUser)
    } catch (err) {
        res.status(400).send(err)
    }
}

export async function addUser(req, res) {
    const { fullname, username, password, score } = req.body
    const userToSave = { fullname, username, password, score: +score }

    try {
        const savedUser = await userService.save(userToSave)
        res.send(savedUser)
    } catch (err) {
        res.status(400).send(err)
    }
}

export async function getUsers(req, res) {
const { filterBy } = req.query

    try {
        const users = await userService.query(filterBy)
        res.send(users)
    } catch (err) {
        res.status(500).send('Failed to read users data')
    }
}

export async function removeUser(req, res) {
    const { userId } = req.params
    try {
        const user = await userService.remove(userId)
        res.send(user)
    } catch (err) {
        res.status(500).send('Failed to remove user')
    }
}

export async function getUser(req, res) {
    const { userId } = req.params
    try {
        const user = await userService.getById(userId)
        res.send(user)
    } catch (err) {
        res.status(500).send('Failed to get user')
    }
}
