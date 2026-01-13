const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    doi: { type: String },
    citation: { type: String },
    note: { type: String },
    year: { type: Number },
    link: { type: String }, // Added to match recent frontend updates
    description: { type: String } // Added to match recent frontend updates
}, { _id: false });

const phdScholarSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    image: { type: String },
    education: [{ type: String }],
    researchAreas: [{ type: String }],
    interests: [{ type: String }],
    publications: [publicationSchema],
    googleScholar: { type: String },
    linkedin: { type: String },
    github: { type: String },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('PhdScholar', phdScholarSchema);
