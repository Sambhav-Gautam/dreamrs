const PhdData = require('../models/Phd');
const PhdScholar = require('../models/PhdScholar');
const mongoose = require('mongoose');

// Helper to migrate old single-doc data to new collection
const migratePhdData = async () => {
    try {
        const count = await PhdScholar.countDocuments();
        if (count > 0) return; // Already migrated

        const oldDoc = await PhdData.findOne().lean();
        if (!oldDoc || !oldDoc.scholars) return;

        console.log('Migrating PhD data to PhdScholar collection...');
        const operations = oldDoc.scholars.map(scholar => ({
            insertOne: {
                document: { ...scholar }
            }
        }));

        if (operations.length > 0) {
            await PhdScholar.bulkWrite(operations);
            console.log(`Migrated ${operations.length} PhD scholars.`);
        }
    } catch (error) {
        console.error('Migration error:', error);
    }
};

// Get all PhD scholars
exports.getPhd = async (req, res) => {
    try {
        await migratePhdData(); // Ensure migration

        const scholars = await PhdScholar.find().sort({ createdAt: 1 }).lean();

        // Return wrapped in 'scholars' array to match legacy format
        res.json({ scholars });
    } catch (error) {
        console.error('Error fetching PhD data:', error);
        res.status(500).json({ error: 'Failed to fetch PhD data' });
    }
};

// Update all PhD data (Legacy - Deprecate)
exports.updatePhd = async (req, res) => {
    res.status(405).json({ error: 'Bulk update deprecated. Use individual add/update.' });
};

// Add a single PhD scholar
exports.addScholar = async (req, res) => {
    try {
        const newScholar = new PhdScholar(req.body);
        await newScholar.save();
        res.json({ success: true, scholar: newScholar });
    } catch (error) {
        console.error('Error adding scholar:', error);
        res.status(500).json({ error: 'Failed to add scholar' });
    }
};

// Update a single PhD scholar by ID
exports.updateScholar = async (req, res) => {
    try {
        const { index } = req.params; // Using 'index' param as ID

        if (!mongoose.Types.ObjectId.isValid(index)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const updatedScholar = await PhdScholar.findByIdAndUpdate(
            index,
            { ...req.body },
            { new: true }
        );

        if (!updatedScholar) {
            return res.status(404).json({ error: 'Scholar not found' });
        }

        res.json({ success: true, scholar: updatedScholar });
    } catch (error) {
        console.error('Error updating scholar:', error);
        res.status(500).json({ error: 'Failed to update scholar' });
    }
};

// Delete a PhD scholar by ID
exports.deleteScholar = async (req, res) => {
    try {
        const { index } = req.params; // 'index' param is now ID

        if (!mongoose.Types.ObjectId.isValid(index)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const deleted = await PhdScholar.findByIdAndDelete(index);

        if (!deleted) {
            return res.status(404).json({ error: 'Scholar not found' });
        }

        res.json({ success: true, removed: deleted });
    } catch (error) {
        console.error('Error deleting scholar:', error);
        res.status(500).json({ error: 'Failed to delete scholar' });
    }
};
