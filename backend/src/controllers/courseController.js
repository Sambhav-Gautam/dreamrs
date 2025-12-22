const CoursesData = require('../models/Course');

// Get all courses
exports.getCourses = async (req, res) => {
    try {
        const data = await CoursesData.findOne();

        if (!data || !data.courses) {
            return res.json([]);
        }

        res.json(data.courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

// Update all courses (replace all)
exports.updateCourses = async (req, res) => {
    try {
        let data = await CoursesData.findOne();

        if (!data) {
            data = new CoursesData({ courses: req.body });
        } else {
            data.courses = req.body;
            data.markModified('courses');
        }

        await data.save();

        res.json({
            success: true,
            message: 'Courses updated successfully'
        });
    } catch (error) {
        console.error('Error updating courses:', error);
        res.status(500).json({ error: 'Failed to update courses' });
    }
};

// Add a course
exports.addCourse = async (req, res) => {
    try {
        let data = await CoursesData.findOne();

        if (!data) {
            data = new CoursesData({ courses: [req.body] });
        } else {
            data.courses.push(req.body);
            data.markModified('courses');
        }

        await data.save();

        res.json({
            success: true,
            course: req.body
        });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ error: 'Failed to add course' });
    }
};

// Update a course
exports.updateCourse = async (req, res) => {
    try {
        const { index } = req.params;
        let data = await CoursesData.findOne();

        if (!data || !data.courses || !data.courses[index]) {
            return res.status(404).json({ error: 'Course not found' });
        }

        data.courses[index] = { ...data.courses[index], ...req.body };
        data.markModified('courses');
        await data.save();

        res.json({ success: true, course: data.courses[index] });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
    try {
        const { index } = req.params;
        let data = await CoursesData.findOne();

        if (!data || !data.courses || !data.courses[index]) {
            return res.status(404).json({ error: 'Course not found' });
        }

        data.courses.splice(parseInt(index), 1);
        data.markModified('courses');
        await data.save();

        res.json({ success: true, message: 'Course deleted' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
};
