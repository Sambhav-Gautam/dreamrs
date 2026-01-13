const ResearchData = require('../models/Research');

// Get all research data
exports.getResearch = async (req, res) => {
    try {
        const data = await ResearchData.findOne().lean();

        if (!data || !data.data) {
            return res.json({
                publications: [],
                collaborations: [],
                projects: { funded: [], other: [] }
            });
        }

        // Ensure structure exists
        const responseData = {
            publications: data.data.publications || [],
            collaborations: data.data.collaborations || [],
            projects: data.data.projects || { funded: [], other: [] }
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching research:', error);
        res.status(500).json({ error: 'Failed to fetch research data' });
    }
};

// Update all research data
exports.updateResearch = async (req, res) => {
    try {
        let data = await ResearchData.findOne();

        if (!data) {
            data = new ResearchData({ data: req.body });
        } else {
            data.data = req.body;
            data.markModified('data');
        }

        await data.save();

        res.json({
            success: true,
            message: 'Research data updated successfully'
        });
    } catch (error) {
        console.error('Error updating research:', error);
        res.status(500).json({ error: 'Failed to update research data' });
    }
};

// Add a publication
exports.addPublication = async (req, res) => {
    try {
        let data = await ResearchData.findOne();

        if (!data) {
            data = new ResearchData({ data: { publications: [req.body], collaborations: [] } });
        } else {
            if (!data.data) data.data = { publications: [], collaborations: [] };
            if (!data.data.publications) data.data.publications = [];
            data.data.publications.unshift(req.body);
            data.markModified('data');
        }

        await data.save();

        res.json({
            success: true,
            publication: req.body
        });
    } catch (error) {
        console.error('Error adding publication:', error);
        res.status(500).json({ error: 'Failed to add publication' });
    }
};

// Update a publication
exports.updatePublication = async (req, res) => {
    try {
        const { index } = req.params;
        let data = await ResearchData.findOne();

        if (!data || !data.data || !data.data.publications || !data.data.publications[index]) {
            return res.status(404).json({ error: 'Publication not found' });
        }

        data.data.publications[index] = { ...data.data.publications[index], ...req.body };
        data.markModified('data');
        await data.save();

        res.json({ success: true, publication: data.data.publications[index] });
    } catch (error) {
        console.error('Error updating publication:', error);
        res.status(500).json({ error: 'Failed to update publication' });
    }
};

// Delete a publication
exports.deletePublication = async (req, res) => {
    try {
        const { index } = req.params;
        let data = await ResearchData.findOne();

        if (!data || !data.data || !data.data.publications || !data.data.publications[index]) {
            return res.status(404).json({ error: 'Publication not found' });
        }

        data.data.publications.splice(parseInt(index), 1);
        data.markModified('data');
        await data.save();

        res.json({ success: true, message: 'Publication deleted' });
    } catch (error) {
        console.error('Error deleting publication:', error);
        res.status(500).json({ error: 'Failed to delete publication' });
    }
};

// Add a collaboration
exports.addCollaboration = async (req, res) => {
    try {
        let data = await ResearchData.findOne();

        if (!data) {
            data = new ResearchData({ data: { publications: [], collaborations: [req.body] } });
        } else {
            if (!data.data) data.data = { publications: [], collaborations: [] };
            if (!data.data.collaborations) data.data.collaborations = [];
            data.data.collaborations.push(req.body);
            data.markModified('data');
        }

        await data.save();

        res.json({
            success: true,
            collaboration: req.body
        });
    } catch (error) {
        console.error('Error adding collaboration:', error);
        res.status(500).json({ error: 'Failed to add collaboration' });
    }
};

// Update a collaboration
exports.updateCollaboration = async (req, res) => {
    try {
        const { index } = req.params;
        let data = await ResearchData.findOne();

        if (!data || !data.data || !data.data.collaborations || !data.data.collaborations[index]) {
            return res.status(404).json({ error: 'Collaboration not found' });
        }

        data.data.collaborations[index] = { ...data.data.collaborations[index], ...req.body };
        data.markModified('data');
        await data.save();

        res.json({ success: true, collaboration: data.data.collaborations[index] });
    } catch (error) {
        console.error('Error updating collaboration:', error);
        res.status(500).json({ error: 'Failed to update collaboration' });
    }
};

// Delete a collaboration
exports.deleteCollaboration = async (req, res) => {
    try {
        const { index } = req.params;
        let data = await ResearchData.findOne();

        if (!data || !data.data || !data.data.collaborations || !data.data.collaborations[index]) {
            return res.status(404).json({ error: 'Collaboration not found' });
        }

        data.data.collaborations.splice(parseInt(index), 1);
        data.markModified('data');
        await data.save();

        res.json({ success: true, message: 'Collaboration deleted' });
    } catch (error) {
        console.error('Error deleting collaboration:', error);
        res.status(500).json({ error: 'Failed to delete collaboration' });
    }
};
