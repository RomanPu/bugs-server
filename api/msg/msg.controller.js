import { msgService } from './msg.service.js'

export async function getMsgs(req, res) {
    const { filterBy } = req.query

    try {
        const msgs = await msgService.query(filterBy)
        res.send(msgs)
    } catch (err) {
        res.status(500).send('Failed to read messages')
    }
}

export async function getMsg(req, res) {
    const { msgId } = req.params
    try {
        const msg = await msgService.getById(msgId)
        res.send(msg)
    } catch (err) {
        res.status(500).send('Failed to get message')
    }
}

export async function removeMsg(req, res) {
    const { msgId } = req.params
    try {
        const msg = await msgService.remove(msgId)
        res.send(msg)
    } catch (err) {
        res.status(500).send('Failed to remove message')
    }
}

export async function addMsg(req, res) {
    const { txt, aboutBugId, byUserId } = req.body
    const msgToSave = { txt, aboutBugId, byUserId }

    try {
        const savedMsg = await msgService.add(msgToSave)
        res.send(savedMsg)
    } catch (err) {
        res.status(400).send(err)
    }
}

export async function updateMsg(req, res) {
    const { _id, txt, aboutBugId, byUserId } = req.body
    const msgToSave = { _id, txt, aboutBugId, byUserId }

    try {
        const savedMsg = await msgService.update(msgToSave)
        res.send(savedMsg)
    } catch (err) {
        res.status(400).send(err)
    }
}