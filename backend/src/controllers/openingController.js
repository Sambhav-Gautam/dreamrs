const Settings = require('../models/Settings');

// Get all openings
exports.getOpenings = async (req, res) => {
    try {
        // Query for the specific generalOpening key
        const openingSetting = await Settings.findOne({ key: 'generalOpening' });

        // Return object structure expected by frontend
        // frontend expects { generalOpening: { file: ..., link: ... } }
        res.json({
            generalOpening: openingSetting?.value || {}
        });
    } catch (error) {
        console.error('Error fetching openings:', error);
        res.status(500).json({ error: 'Failed to fetch openings data' });
    }
};

// Update all openings
exports.updateOpenings = async (req, res) => {
    try {
        let data = await OpeningsData.findOne();

        if (!data) {
            data = new OpeningsData({ data: req.body });
        } else {
            data.data = req.body;
            data.markModified('data');
        }

        await data.save();

        res.json({
            success: true,
            message: 'Openings updated successfully'
        });
    } catch (error) {
        console.error('Error updating openings:', error);
        res.status(500).json({ error: 'Failed to update openings data' });
    }
};

// Add an opening to a category
exports.addOpening = async (req, res) => {
    try {
        const { category } = req.params;
        let data = await OpeningsData.findOne();

        if (!data) {
            data = new OpeningsData({ data: { [category]: [req.body] } });
        } else {
            if (!data.data) data.data = {};
            if (!data.data[category]) data.data[category] = [];
            data.data[category].push(req.body);
            data.markModified('data');
        }

        await data.save();

        res.json({
            success: true,
            opening: req.body
        });
    } catch (error) {
        console.error('Error adding opening:', error);
        res.status(500).json({ error: 'Failed to add opening' });
    }
};

// Delete an opening
exports.deleteOpening = async (req, res) => {
    try {
        const { category, index } = req.params;
        let data = await OpeningsData.findOne();

        if (!data || !data.data || !data.data[category] || !data.data[category][index]) {
            return res.status(404).json({ error: 'Opening not found' });
        }

        data.data[category].splice(parseInt(index), 1);
        data.markModified('data');
        await data.save();

        res.json({ success: true, message: 'Opening deleted' });
    } catch (error) {
        console.error('Error deleting opening:', error);
        res.status(500).json({ error: 'Failed to delete opening' });
    }
};
