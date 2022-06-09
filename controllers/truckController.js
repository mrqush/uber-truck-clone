const Truck = require('../models/truck');
const app = require('../app');

exports.getTrucks = async function (req, res) {
    try {
        const user = req.user;
        if (user.role !== 'DRIVER') {
            throw new Error('Only drivers can get trucks');
        }
        const trucks = await Truck.find({ created_by: user._id })
            .catch(err => { throw err });
        res.status(200).send({
            trucks: trucks
        });
        console.log(app.formattedTime() + 'Get trucks by: ' + user._id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
}

exports.addTruck = async function (req, res) {
    try {
        if (!req.body) {
            throw new Error('Invalid value');
        }
        const user = req.user;
        const type = req.body.type;
        const date = new Date();
        if (user.role !== 'DRIVER') {
            throw new Error('Only drivers can add trucks');
        }
        let truck = new Truck({
            created_by: user._id,
            assigned_to: null,
            type,
            created_date: date,
        });

        truck = await truck.save();
        res.status(200).send({
            message: 'Truck created successfully'
        });
        console.log(app.formattedTime() + 'Created truck: ' + truck._id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
};

exports.getTruckById = async function (req, res) {
    try {
        const id = req.params.id;
        const user = req.user;
        if (user.role !== 'DRIVER') {
            throw new Error('Only drivers can get trucks');
        }
        const truck = await Truck.findOne({ _id: id, created_by: user._id });
        if (!truck) {
            throw new Error('Truck not found');
        }
        res.status(200).send({
            truck
        })
        console.log(app.formattedTime() + 'Get truck by id: ' + truck._id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
}

exports.updateTruck = async function (req, res) {
    try {
        const id = req.params.id;
        const type = req.body.type;
        const user = req.user;
        if (user.role !== 'DRIVER') {
            throw new Error('Only drivers can update trucks');
        }
        const truck = await Truck.findOneAndUpdate({ _id: id, created_by: user._id }, { $set: { type: type } });
        if (!truck) {
            throw new Error('Truck not found');
        }
        res.status(200).send({
            message: 'Truck details changed successfully'
        })
        console.log(app.formattedTime() + 'Update truck with id: ' + truck._id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
}

exports.deleteTruck = async function (req, res) {
    try {
        const id = req.params.id;
        const user = req.user;
        if (user.role !== 'DRIVER') {
            throw new Error('Only drivers can delete trucks');
        }
        const truck = await Truck.findOneAndDelete({ _id: id, created_by: user._id });
        if (!truck) {
            throw new Error('Truck not found');
        }
        res.status(200).send({
            message: 'Truck deleted successfully'
        })
        console.log(app.formattedTime() + 'Delete truck: ' + truck._id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
}

exports.assignTruck = async function (req, res) {
    try {
        const id = req.params.id;
        const user = req.user;
        if (user.role !== 'DRIVER') {
            throw new Error('Only drivers can assign trucks');
        }
        const assignedTruck = await Truck.findOne({ assigned_to: user._id });
        if (assignedTruck) {
            throw new Error('The driver already has an assigned truck');
        }
        const truck = await Truck.updateOne({ _id: id, created_by: user._id }, { $set: { assigned_to: user._id } });
        res.status(200).send({
            message: 'Truck assigned successfully'
        })
        console.log(app.formattedTime() + 'Assig truck: ' + truck._id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
}