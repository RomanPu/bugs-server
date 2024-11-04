import { loggerService } from "../../services/logger.service.js";
import { dbService } from '../../services/db.service.js';
import { ObjectId } from 'mongodb';

export const msgService = {
    query,
    getById,
    remove,
    update,
    add
};

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy);
        const collection = await dbService.getCollection('msgs');
        const msgs = await collection.find(criteria).toArray();
        return msgs;
    } catch (err) {
        loggerService.error('Failed to query messages', err);
        throw err;
    }
}

async function getById(msgId) {
    try {
        const collection = await dbService.getCollection('msgs');
        const msg = await collection.findOne({ _id: ObjectId.createFromHexString(msgId) });
        return msg;
    } catch (err) {
        loggerService.error(`Failed to get message ${msgId}`, err);
        throw err;
    }
}

async function remove(msgId) {
    try {
        const collection = await dbService.getCollection('msgs');
        await collection.deleteOne({ _id: ObjectId.createFromHexString(msgId) });
        return msgId;
    } catch (err) {
        loggerService.error(`Failed to remove message ${msgId}`, err);
        throw err;
    }
}

async function add(msg) {
    try {
        const collection = await dbService.getCollection('msgs');
        await collection.insertOne(msg);
        return msg;
    } catch (err) {
        loggerService.error('Failed to add message', err);
        throw err;
    }
}

async function update(msg) {
    try {
        const msgToSave = { ...msg };
        delete msgToSave._id;
        const collection = await dbService.getCollection('msgs');
        await collection.updateOne(
            { _id: ObjectId.createFromHexString(msg._id) },
            { $set: msgToSave }
        );
        return msg;
    } catch (err) {
        loggerService.error('Failed to update message', err);
        throw err;
    }
}

function _buildCriteria(filterBy) {
    const criteria = {};
    if (filterBy.txt) {
        criteria.txt = { $regex: filterBy.txt, $options: 'i' };
    }
    if (filterBy.aboutBugId) {
        criteria.aboutBugId = filterBy.aboutBugId;
    }
    if (filterBy.byUserId) {
        criteria.byUserId = filterBy.byUserId;
    }
    return criteria;
}