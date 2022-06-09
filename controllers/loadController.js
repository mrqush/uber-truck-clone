const Load = require('../models/load');
const Truck = require('../models/truck');
const app = require('../app');

const truckTypes = [
    {
        name: 'SPRINTER',
        width: 300,
        length: 250,
        height: 170,
        payload: 1700
    },
    {
        name: 'SMALL STRAIGHT',
        width: 500,
        length: 250,
        height: 170,
        payload: 2500
    },
    {
        name: 'LARGE STRAIGHT',
        width: 700,
        length: 350,
        height: 200,
        payload: 4000
    }
]

exports.getLoads = async function (req, res) {
    try {
        const user = req.user;
        let { status, limit, offset } = req.query;
        if (user.role !== 'SHIPPER') {
            throw new Error('Only shippers can get loads');
        }
        if (limit > 50 || limit < 1) {
            throw new Error('Limit must be at least 1 and maximum 50');
        }
        if (!limit) {
            limit = 10;
        }
        const loads = await Load.find({
            created_by: user._id,
            ...status ? { status: status } : {}
        }).limit(limit).skip(offset)
            .catch(err => { throw err });
        res.status(200).send({
            loads: loads
        });
        console.log(app.formattedTime() + 'Get loads by: ' + user._id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
}

exports.addLoad = async function (req, res) {
    try {
        if (!req.body) {
            throw new Error('Invalid value');
        }
        const user = req.user;
        const { name, payload, pickup_address, delivery_address, dimensions } = req.body;
        const date = new Date();
        if (user.role !== 'SHIPPER') {
            throw new Error('Only shippers can add loads');
        }
        let load = new Load({
            created_by: user._id,
            assigned_to: null,
            name,
            payload,
            pickup_address,
            delivery_address,
            dimensions,
            logs: {
                message: `Load created by user with id: ${user._id}`,
                time: date
            },
            created_date: date
        });

        load = await load.save();
        res.status(200).send({
            message: 'Load created successfully'
        });
        console.log(app.formattedTime() + 'Created load : ' + load._id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
};

exports.getLoadById = async function (req, res) {
    try {
        const id = req.params.id;
        const load = await Load.findOne({ _id: id })
            .catch(err => { throw err });
        if (!load) {
            throw new Error('Load not found');
        }
        res.status(200).send({
            load
        });
        console.log(app.formattedTime() + 'Get load with id: ' + id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
}

exports.updateLoad = async function (req, res) {
    try {
        if (!req.body) {
            throw new Error('Invalid value');
        }
        const id = req.params.id;
        const user = req.user;
        const { name, payload, pickup_address, delivery_address, dimensions } = req.body;
        if (user.role !== 'SHIPPER') {
            throw new Error('Only shippers can update loads');
        }

        const load = await Load.findOneAndUpdate(
            {
                _id: id,
                status: 'NEW'
            },
            {
                $set: {
                    ...name ? { name: name } : {},
                    ...payload ? { payload: payload } : {},
                    ...pickup_address ? { pickup_address: pickup_address } : {},
                    ...delivery_address ? { delivery_address: delivery_address } : {},
                    ...dimensions ? { dimensions: dimensions } : {}
                }
            }
        ).catch(err => { throw err });
        if (!load) {
            throw new Error('Load not found');
        }
        res.status(200).send({
            message: 'Load updated successfully'
        });
        console.log(app.formattedTime() + 'Updated load : ' + id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
}

exports.deleteLoad = async function (req, res) {
    try {
        const id = req.params.id;
        const user = req.user;
        if (user.role !== 'SHIPPER') {
            throw new Error('Only shippers can delete loads');
        }

        const load = await Load.findOneAndDelete({ _id: id, status: 'NEW' }).catch(err => { throw err });
        if (!load) {
            throw new Error('Load not found');
        }
        res.status(200).send({
            message: 'Load deleted successfully'
        });
        console.log(app.formattedTime() + 'Delete load : ' + id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
}

exports.postLoad = async function (req, res) {
    try {
        const id = req.params.id;
        const user = req.user;
        if (user.role !== 'SHIPPER') {
            throw new Error('Only shippers can post loads');
        }
        const load = await Load.findOneAndUpdate({ _id: id }, { $set: { status: 'POSTED' } })
            .catch(err => { throw err });
        if (!load) {
            throw new Error('Load not found');
        }
        const suitTruckTypes = [];
        truckTypes.forEach(item => {
            if (load.payload <= item.payload &&
                load.dimensions.width <= item.width &&
                load.dimensions.length <= item.length &&
                load.dimensions.height <= item.height) {
                suitTruckTypes.push(item.name);
            }
        })
        if (!suitTruckTypes.length) {
            load.status = 'NEW';
            await load.save();
            throw new Error('There is no avialable driver at the moment');
        }
        Truck.findOne({ assigned_to: { $ne: null }, status: 'IS', type: suitTruckTypes }, async (err, truck) => {
            try {
                if (err) {
                    throw err
                }
                const date = new Date();
                const loadLogs = load.logs;
                if (!truck) {
                    load.status = 'NEW';
                    loadLogs.push = {
                        message: 'Load has posted, but there is no avialable driver at the moment',
                        time: date
                    }
                    load.logs = loadLogs;
                    await load.save();
                    throw new Error('There is no avialable driver at the moment');
                }
                truck.status = 'OL';
                load.assigned_to = truck.assigned_to;
                load.status = 'ASSIGNED';
                load.state = 'En route to Pick Up';
                loadLogs.push = {
                    message: `Load has assigned to driver with id: ${truck.assigned_to}`,
                    time: date
                }
                load.logs = loadLogs;
                await truck.save();
                await load.save();
                res.status(200).send({
                    message: 'Load posted successfully',
                    driver_found: true
                });
                console.log(app.formattedTime() + 'Posted load with id: ' + id);
            } catch (err) {
                res.status(400).send({
                    message: err.message,
                    driver_found: false
                });
                console.error(app.formattedTime() + err);
            }
        });
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
}

exports.getLoadShippingInfo = async function (req, res) {
    try {
        const id = req.params.id;
        const user = req.user;
        if (user.role !== 'SHIPPER') {
            throw new Error('Only shippers can get shipping info about loads');
        }
        const load = await Load.findOne({ _id: id, state: { $ne: 'Arrived to delivery' } })
            .catch(err => { throw err });
        if (!load) {
            throw new Error('Load not found');
        }
        if (load.status !== 'SHIPPED') {
            throw new Error('This load hasn\'t shipped yet');
        }
        res.status(200).send({
            load
        });
        console.log(app.formattedTime() + 'Get load shipping info with id: ' + id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
}

exports.getActiveLoad = async function (req, res) {
    try {
        const user = req.user;
        if (user.role !== 'DRIVER') {
            throw new Error('Only drivers can get active loads');
        }
        const load = await Load.findOne({ assigned_to: user._id, state: { $ne: 'Arrived to delivery' } })
            .catch(err => { throw err });
        if (!load) {
            throw new Error('Load not found');
        }
        res.status(200).send({
            load
        });
        console.log(app.formattedTime() + 'Get active load from driver with id: ' + user._id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
}

exports.iterateLoadState = async function (req, res) {
    try {
        const user = req.user;
        if (user.role !== 'DRIVER') {
            throw new Error('Only drivers can iterate to next load state');
        }
        const states = Load.schema.path('state').enumValues;
        const truck = await Truck.findOne({ assigned_to: user._id });
        Load.findOne({ assigned_to: user._id, state: { $ne: 'Arrived to delivery' } }, async (err, load) => {
            try {
                if (!load) {
                    throw new Error('Load not found');
                }
                load.state = states[states.findIndex(item => item === load.state) + 1];
                if (load.status === 'ASSIGNED') {
                    load.status = 'SHIPPED';
                }
                if (load.state === 'Arrived to delivery') {
                    truck.status = 'IS';
                    await truck.save();
                }
                await load.save();
                res.status(200).send({
                    message: `Load state changed to: '${load.state}'`
                });
                console.log(app.formattedTime() + 'Iterate to next load state from driver with id: ' + user._id);
            } catch (err) {
                res.status(400).send({
                    message: err.message
                });
                console.error(app.formattedTime() + err);
            }
        })
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
}