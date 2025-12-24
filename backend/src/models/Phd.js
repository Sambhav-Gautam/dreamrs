const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    doi: { type: String },
    citation: { type: String },
    note: { type: String },
    year: { type: Number }
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
    github: { type: String }
}, { timestamps: true });

const phdDataSchema = new mongoose.Schema({
    scholars: [phdScholarSchema]
}, { timestamps: true });

module.exports = mongoose.model('PhdData', phdDataSchema);
