import { utilService } from "../../services/util.service.js"
import { loggerService } from "../../services/logger.service.js"
import e from "express"

export const userService = {
    query,
    getById,
    remove,
    save,
    getByUsername
}

const PAGE_SIZE = 2

async function getByUsername(username) {
    const users = await query();
    return users.find(user => user.username === username);
}

async function query( filterBy ) {
    let fBy = {}
    if (filterBy) {
        const { txt, sortBy, pageIdx, sortDirection, score } = filterBy

        fBy = {
            txt: txt || '',
            score: score ? score : undefined,
            sortBy: sortBy || '',
            sortDirection: sortDirection || 1,
            pageIdx: pageIdx ? +pageIdx : undefined
        }
    }
    else {
        return utilService.readJsonFile('./data/users.json');
    }

    try {
        let users = utilService.readJsonFile('./data/users.json');
        
        if (txt) {
            const regExp = new RegExp(txt, 'i')
            users = users.filter(user =>  regExp.test(user.username) || regExp.test(user.fullname))
        }

        if (score) {
            users = users.filter(user => user.score === score)
        }

        // Apply sorting
        if (sortBy) {
            users.sort((a, b) => {
                if (a[sortBy] < b[sortBy]) return -1 * sortDirection;
                if (a[sortBy] > b[sortBy]) return 1 * sortDirection;
                return 0;
            });
        }

        if (pageIdx !== undefined) {
            const startIdx = pageIdx * PAGE_SIZE;
            users = users.slice(startIdx, startIdx + PAGE_SIZE);
        }

        return users;
    } catch (err) {
        loggerService.error('Failed to read users data', err);
        throw err;
    }
}

async function getById(id) {
    try {
        const users = await query();
        return users.find(user => user._id === id);
    } catch (err) {
        loggerService.error('Failed to get user by id', err);
        throw err;
    }
}

async function remove(id) {
    try {
        let users = await query();
        users = users.filter(user => user._id !== id);
        await utilService.writeJsonFile('./data/users.json', users);
        return users;
    } catch (err) {
        loggerService.error('Failed to remove user', err);
        throw err;
    }
}

async function save(user) {
    try {
        const users = await query();
        if (user._id) {
            const idx = users.findIndex(existingUser => existingUser._id === user._id);
            if (idx !== -1) users[idx] = user;
        } else {
            user._id = utilService.makeId();
            users.push(user);
        }
        await utilService.writeJsonFile('./data/users.json', users);
        return user;
    } catch (err) {
        loggerService.error('Failed to save user', err);
        throw err;
    }
}
