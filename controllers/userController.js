const bcrypt = require('bcrypt');
const User = require('../models/user');
const app = require('../app');

exports.getUser = function (req, res) {
    try {
        const user = req.user;
        res.send({
            user: {
                _id: user._id,
                role: user.role,
                email: user.email,
                created_date: user.created_date
            }
        });
        console.log(app.formattedTime() + 'Get user: ' + user._id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
};

exports.changePassword = async function (req, res) {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = req.user;

        const passwordResult = bcrypt.compareSync(oldPassword, user.password);
        if (!passwordResult) {
            throw new Error('Password is incorrect');
        }
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(newPassword, salt);

        await User.updateOne(
            { _id: user._id },
            { $set: { password: password } });
        res.status(200).send({
            message: 'Password changed successfully',
        });
        console.log(app.formattedTime() + 'Change password in user: ' + user._id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
};

exports.deleteUser = async function (req, res) {
    try {
        const user = req.user;
        await User.deleteOne({ _id: user._id });
        res.status(200).send({
            message: 'Profile deleted successfully',
        });
        console.log(app.formattedTime() + 'Delete user: ' + user._id);
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
        console.error(app.formattedTime() + err);
    }
};
