import { loggerService } from "../../services/logger.service.js";
import { dbService } from '../../services/db.service.js';
import { ObjectId } from 'mongodb';

export const msgService = {
    query,
    remove,
    update,
    add
};

async function query(filterBy = {}) {
    try {
		const criteria = _buildCriteria(filterBy)
		const collection = await dbService.getCollection('msgs');
        
		var msgs = await collection.aggregate([
            {
                $match: criteria,
            },
            {
                $lookup: {
                    localField: 'byUserId',
                    from: 'users', foreignField: '_id',
                    as: 'byUser',
                },
            },
            {
                $unwind: '$byUser',
            },
            {
                $lookup: {
                    from: 'bugs', foreignField: '_id',
                    localField: 'aboutBugId',
                    as: 'aboutBug',
                },
            },
            {
                $unwind: '$aboutBug',
            },
            { 
                $project: {
                    '_id': true, 'txt': true, 
                    'byUser._id': true, 'byUser.fullname': true,
                    'aboutBug._id': true, 'aboutBug.title': true,
                } 
            }
        ]).toArray()

        return msgs;
    } catch (err) {
        loggerService.error('Failed to query messages', err);
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
        const options = { upsert: true, returnDocument: 'after' };
        const { insertedId } = await collection.insertOne(msg, options);

        const criteria = { _id: insertedId};

        var msg = await collection.aggregate([
            {
                $match: criteria,
            },
            // {
            //     $lookup: {
            //         localField: 'byUserId',
            //         from: 'users', foreignField: '_id',
            //         as: 'byUser',
            //     },
            // },
            // {
            //     $unwind: '$byUser',
            // },
            // {
            //     $lookup: {
            //         from: 'bugs', foreignField: '_id',
            //         localField: 'aboutBugId',
            //         as: 'aboutBug',
            //     },
            // },
            // {
            //     $unwind: '$aboutBug',
            // },
            // { 
            //     $project: {
            //         '_id': true, 'txt': true, 
            //         'byUser._id': true, 'byUser.fullname': true,
            //         'aboutBug._id': true, 'aboutBug.title': true,
            //     } 
            // }
        ]).toArray()

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