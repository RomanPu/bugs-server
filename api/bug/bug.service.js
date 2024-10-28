import { utilService } from "../../services/util.service.js"
import { loggerService } from "../../services/logger.service.js"

export const bagService = {
    query,
    getById,
    remove,
    save
}

const PAGE_SIZE = 2

async function query(filterBy, user) {
    let fBy = {}
console.log('filterBy:', filterBy)

    if (filterBy) { 
        const { txt, minSeverity, sortBy, sortDirection, pageIdx, onlyUser} = filterBy
        fBy = {
            txt: txt || '',
            minSeverity: minSeverity ? +minSeverity : undefined,
            sortBy: sortBy || '',
            sortDirection: sortDirection || 1,
            pageIdx: pageIdx ? +pageIdx : undefined,
            onlyUser: onlyUser || false
        }
    }
    else { 
        return utilService.readJsonFile('./data/bugs.json');
    }

    const { txt, minSeverity, sortBy, sortDirection, pageIdx, onlyUser} = fBy
    try {
        let bugs = utilService.readJsonFile('./data/bugs.json');
        
        if (txt) {
            const regExp = new RegExp(txt, 'i')
            bugs = bugs.filter(bug =>  regExp.test(bug.title) || regExp.test(bug.description))
        }
        
        if (minSeverity) {
            bugs = bugs.filter(bug => bug.severity >= minSeverity)
        }

        // Apply sorting
        if (sortBy) {
            bugs.sort((a, b) => {
                if (a[sortBy] < b[sortBy]) return -1 * sortDirection;
                if (a[sortBy] > b[sortBy]) return 1 * sortDirection;
                return 0;
            });
        }

        if (pageIdx !== 0) {
            const startIdx = pageIdx * PAGE_SIZE;
            bugs = bugs.slice(startIdx, startIdx + PAGE_SIZE);
        }
console.log(onlyUser)
        if (onlyUser) { 
            bugs = bugs.filter(bug => bug.creator._id === user._id)
        }

        return bugs;
    } catch (err) {
        loggerService.error('Failed to read bugs data', err);
        throw err;
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