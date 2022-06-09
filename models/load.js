const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loadScheme = new Schema(
    {
        created_by: String,
        assigned_to: String,
        status: {
            type: String,
            enum: ['NEW', 'POSTED', 'ASSIGNED', 'SHIPPED'],
            default: 'NEW'
        },
        state: {
            type: String,
            enum: [null, 'En route to Pick Up', 'Arrived to Pick Up', 'En route to delivery', 'Arrived to delivery']
        },
        name: String,
        payload: Number,
        pickup_address: String,
        delivery_address: String,
        dimensions: {
            width: Number,
            length: Number,
            height: Number
        },
        logs: [],
        created_date: Date
    }, { versionKey: false, collection: 'loads' });

module.exports = mongoose.model('Load', loadScheme);
