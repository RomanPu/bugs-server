import { bagService } from './bug.service.js'

export async function updateBug(req, res) {
    const { _id, title, description, severity, createdAt, creator } = req.body
    const bugToSave = { _id, title, description, severity: +severity, createdAt: +createdAt, creator: creator }
    const user = req.loggedinUser

    try {
        const savedBug = await bagService.save(bugToSave, user)
        res.send(savedBug)
    } catch (err) {
        res.status(400).send(err)
    }
}

export async function addBug(req, res) {
    const { title, description, severity, createdAt } = req.body
    const bugToSave = { title, description, severity: +severity, createdAt: +createdAt }
    const user = req.loggedinUser

    try {
        const savedBug = await bagService.save(bugToSave, user)
        res.send(savedBug)
    } catch (err) {
        res.status(400).send(err)
    }
}

export async function getBugs (req, res){
    const filterBy= req.query
    const user = req.loggedinUser

    try {
        const bugs = await bagService.query(filterBy, user)
        res.send(bugs)
    } catch (err) {
        res.status(500).send('Failed to read bugs data')
    }
    
}

export async function removeBug (req, res){
    const { bugId } = req.params
    const user = req.loggedinUser
    console.log('User:', user)
    try {
        const bug = await bagService.remove(bugId, user)
        res.send(bug)
    } catch (err) {
        res.status(500).send('Failed to remove bug')
    }
}

export async function getBug (req, res){
    const { bugId } = req.params
    var bugsVisited = req.cookies.bugsVisited || []
    try {
        const bug = await bagService.getById(bugId)
        if (!bugsVisited.includes(bugId)) {
            bugsVisited.push(bugId)
            res.cookie('bugsVisited',bugsVisited  , { maxAge: 1000 * 7 } )
        }
        if (bugsVisited.length >= 3) {
            console.log('User visited at the following bugs: ', bugsVisited)
            return res.status(401).send('Wait for a bit')
        }

        res.send(bug)
    } catch (err) {
        res.status(500).send('failed to get bug')
    }
}
