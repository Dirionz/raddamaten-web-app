const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    token: String

}, { timestamps: true });

const Invite = mongoose.model('Invite', inviteSchema);

module.exports = Invite;