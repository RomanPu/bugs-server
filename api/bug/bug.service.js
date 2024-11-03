import { utilService } from "../../services/util.service.js"
import { loggerService } from "../../services/logger.service.js"
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import { ObjectId } from 'mongodb'


export const bagService = {
    query,
    getById,
    remove,
    save
}

const PAGE_SIZE = 2

function _buildCriteria(filterBy) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    console.log('filter:', filterBy)
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
    console.log('criteria:', criteria)
    return criteria
}

function _buildSort(filterBy) {
    if(!filterBy.sortBy) return {}
    return { [filterBy.sortBy]: +filterBy.sortDirection }
}

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
        const bags = await query();
        return bags.find(bag => bag._id === id);
    } catch (err) {
        loggerService.error('Failed to get bag by id', err);
        throw err;
    }
}

async function remove(id, user) {
    try {
        let bags = await query();
        const bag = bags.find(bag => bag._id === id);
        bags = bags.filter(bag => bag._id !== id);
        console.log('User:', user)
        console.log('Bag:', bag)
       
        if (!(user.isAdmin || user._id === bag.creator._id)) throw "not owner";
        await utilService.writeJsonFile('./data/bugs.json', bags);
        return bags.filter(bag => bag._id !== id);;
    } catch (err) {
        loggerService.error('Failed to remove bag', err);
        throw err;
    }
}
async function save(bag, user) {
    try {
        console.log('User:', user)
        console.log('Bag:', bag._id)
        const bags = await query();
        if (bag._id) {
            console.log('1')
            const idx = bags.findIndex(existingBag => existingBag._id === bag._id);
            console.log('2', bag, user)
            if (!(user.isAdmin || user._id === bag.creator._id)) throw "not owner";
            console.log('3')

            if (idx !== -1) bags[idx] = bag;
        } else {
            bag._id = utilService.makeId();
            bag.createdAt = Date.now();
            bag.creator = user;
            bags.push(bag);
        }
        await utilService.writeJsonFile('./data/bugs.json', bags);
        return bag;
    } catch (err) {
        loggerService.error('Failed to save bag', err);
        throw err;
    }
}