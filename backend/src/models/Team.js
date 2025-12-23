const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    workDescription: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    image: {
        type: String,  // Store filename, not ObjectId for flexibility
        default: ''
    },
    linkedin: {
        type: String,
        default: ''
    },
    github: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    scholar: {
        type: String,
        default: ''
    }
}, { _id: false });

// Use a flexible schema that can handle any category names
const teamSchema = new mongoose.Schema({
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);
