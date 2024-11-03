import { utilService } from "../../services/util.service.js"
import { loggerService } from "../../services/logger.service.js"
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import { ObjectId } from 'mongodb'


export const bagService = {
    query,
    getById,
    remove,
    update,
    add
}

const PAGE_SIZE = 2

async function query(filterBy) {

	try {
        const criteria = _buildCriteria(filterBy)
        const sort = _buildSort(filterBy)
		const collection = await dbService.getCollection('bugs')

		var bugCursor = await collection.find(criteria, { sort })

		if (filterBy.pageIdx !== undefined) {
	        bugCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
		}

        // const bug = await collection.findOne({ _id:"abc123" })
        // console.log('Bug:', bug)

		return bugCursor.toArray()
	} catch (err) {
		logger.error('cannot find bugs', err)
		throw err
	}
}

async function getById(id) {
	try {
        const criteria = { _id: ObjectId.createFromHexString(id) }

		const collection = await dbService.getCollection('bugs')
		const bug = await collection.findOne(criteria)
        
		// bug.createdAt = bug._id.getTimestamp()
		return bug
	} catch (err) {
		logger.error(`while finding bug ${id}`, err)
		throw err
	}
}

async function remove(id) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: ownerId, isAdmin } = loggedinUser

	try {
        const criteria = { 
            _id: ObjectId.createFromHexString(id)
        }
        if(!isAdmin) criteria['creator._id'] = ownerId
        
		const collection = await dbService.getCollection('bugs')
        console.log('Criteria:', criteria)
		const res = await collection.deleteOne(criteria)

        if(res.deletedCount === 0) throw('Not your bug')
		return id
	} catch (err) {
		logger.error(`cannot remove bug ${id}`, err)
		throw err
	}
}

async function add(bug) {
	try {
        bug.createdAt = Date.now()
        console.log('Bug:', bug)
		const collection = await dbService.getCollection('bugs')
		await collection.insertOne(bug)

		return bug
	} catch (err) {
		logger.error('cannot insert bug', err)
		throw err
	}
}

async function update(bug) {
    const bugToSave = { ...bug }
    delete bugToSave._id

    try {
        const criteria = { _id: ObjectId.createFromHexString(bug._id) }

		const collection = await dbService.getCollection('bugs')
		await collection.updateOne(criteria, { $set: bugToSave })

		return bug
	} catch (err) {
		logger.error(`cannot update bug ${bug._id}`, err)
		throw err
	}
}


function _buildCriteria(filterBy) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const criteria = {
        $or: [
            { title: { $regex: filterBy.txt, $options: 'i' } },
            { description: { $regex: filterBy.txt, $options: 'i' } }
        ],
        severity: { $gte: filterBy?.minSeverity ? +filterBy.minSeverity : 0 }
    }

    if (filterBy.onlyUser) {
        criteria['creator._id'] = loggedinUser._id
    }

    return criteria
}

function _buildSort(filterBy) {
    if(!filterBy.sortBy) return {}
    return { [filterBy.sortBy]: +filterBy.sortDirection }
}
