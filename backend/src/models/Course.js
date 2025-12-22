const mongoose = require('mongoose');

// Use a flexible schema to store the courses array as-is
const coursesDataSchema = new mongoose.Schema({
    courses: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CoursesData', coursesDataSchema);
