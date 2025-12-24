const PhdData = require('../models/Phd');

// Get all PhD scholars
exports.getPhd = async (req, res) => {
    try {
        const data = await PhdData.findOne({});
        if (!data) {
            return res.json({ scholars: [] });
        }
        res.json(data);
    } catch (error) {
        console.error('Error fetching PhD data:', error);
        res.status(500).json({ error: 'Failed to fetch PhD data' });
    }
};

// Update all PhD data (replace entire document)
exports.updatePhd = async (req, res) => {
    try {
        const { scholars } = req.body;

        await PhdData.deleteMany({});
        const newData = await PhdData.create({ scholars });

        res.json({ success: true, data: newData });
    } catch (error) {
        console.error('Error updating PhD data:', error);
        res.status(500).json({ error: 'Failed to update PhD data' });
    }
};

// Add a single PhD scholar
exports.addScholar = async (req, res) => {
    try {
        const scholar = req.body;

        let data = await PhdData.findOne({});
        if (!data) {
            data = await PhdData.create({ scholars: [scholar] });
        } else {
            data.scholars.push(scholar);
            await data.save();
        }

        res.json({ success: true, scholar: data.scholars[data.scholars.length - 1] });
    } catch (error) {
        console.error('Error adding scholar:', error);
        res.status(500).json({ error: 'Failed to add scholar' });
    }
};

// Update a single PhD scholar by index or name
exports.updateScholar = async (req, res) => {
    try {
        const { index } = req.params;
        const updates = req.body;

        const data = await PhdData.findOne({});
        if (!data || !data.scholars[index]) {
            return res.status(404).json({ error: 'Scholar not found' });
        }

        Object.assign(data.scholars[index], updates);
        await data.save();

        res.json({ success: true, scholar: data.scholars[index] });
    } catch (error) {
        console.error('Error updating scholar:', error);
        res.status(500).json({ error: 'Failed to update scholar' });
    }
};

// Delete a PhD scholar by index
exports.deleteScholar = async (req, res) => {
    try {
        const { index } = req.params;

        const data = await PhdData.findOne({});
        if (!data || !data.scholars[index]) {
            return res.status(404).json({ error: 'Scholar not found' });
        }

        const removed = data.scholars.splice(index, 1);
        await data.save();

        res.json({ success: true, removed: removed[0] });
    } catch (error) {
        console.error('Error deleting scholar:', error);
        res.status(500).json({ error: 'Failed to delete scholar' });
    }
};
