import { loggerService } from "../../services/logger.service.js";
import { dbService } from '../../services/db.service.js';
import { ObjectId } from 'mongodb';

export const userService = {
    query,
    getById,
    remove,
    update,
    getByUsername,
    add
};

async function getByUsername(username) {
    try {
        const criteria = { username };
        const collection = await dbService.getCollection('users');
        const user = await collection.findOne(criteria);
        return user;
    } catch (err) {
        loggerService.error('Failed to get user by username', err);
        throw err;
    }
}

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy);
        const collection = await dbService.getCollection('users');
        const users = await collection.find(criteria).toArray();
        return users;
    } catch (err) {
        loggerService.error('Failed to query users', err);
        throw err;
    }
}

async function getById(id) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(id) };
        const collection = await dbService.getCollection('users');
        const user = await collection.findOne(criteria);
        return user;
    } catch (err) {
        loggerService.error('Failed to get user by id', err);
        throw err;
    }
}

async function remove(id) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(id) };
        const collection = await dbService.getCollection('users');
        const res = await collection.deleteOne(criteria);
        if (res.deletedCount === 0) throw new Error('Failed to remove user');
        return id;
    } catch (err) {
        loggerService.error('Failed to remove user', err);
        throw err;
    }
}

async function add(user) {
    try {
        const collection = await dbService.getCollection('users');
        user.createdAt = Date.now();
        await collection.insertOne(user);
        return user;
    } catch (err) {
        loggerService.error('Failed to add user', err);
        throw err;
    }
}

async function update(user) {
    try {
        const collection = await dbService.getCollection('users');
        const criteria = { _id: ObjectId.createFromHexString(user._id) };
        delete user._id;
        await collection.updateOne(criteria, { $set: user });
        return user;
    } catch (err) {
        loggerService.error('Failed to update user', err);
        throw err;
    }
}

function _buildCriteria(filterBy) {
    const criteria = {};
    if (filterBy.txt) {
        criteria.$or = [
            { username: { $regex: filterBy.txt, $options: 'i' } },
            { fullname: { $regex: filterBy.txt, $options: 'i' } }
        ];
    }
    return criteria;
}