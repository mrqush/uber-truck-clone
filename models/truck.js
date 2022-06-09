const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const truckScheme = new Schema(
    {
        created_by: String,
        assigned_to: String,
        type: {
            type: String,
            enum: ['SPRINTER', 'SMALL STRAIGHT', 'LARGE STRAIGHT']
        },
        status: {
            type: String,
            enum: ['IS', 'OL'],
            default: 'IS'
        },
        created_date: Date
    }, { versionKey: false, collection: 'trucks' });

module.exports = mongoose.model('Truck', truckScheme);
