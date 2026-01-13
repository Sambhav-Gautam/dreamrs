const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const { getGridFSBucket } = require('../config/database');
const mongoose = require('mongoose');

// Helper to migrate old single-doc data to new collection
const migrateData = async () => {
    try {
        const count = await TeamMember.countDocuments();
        if (count > 0) return; // Already migrated

        const oldDoc = await Team.findOne().lean();
        if (!oldDoc || !oldDoc.data) return;

        console.log('Migrating Team data to TeamMember collection...');
        const operations = [];

        Object.keys(oldDoc.data).forEach(category => {
            const members = oldDoc.data[category];
            if (Array.isArray(members)) {
                members.forEach((member, index) => {
                    operations.push({
                        insertOne: {
                            document: {
                                ...member,
                                category,
                                order: index
                            }
                        }
                    });
                });
            }
        });

        if (operations.length > 0) {
            await TeamMember.bulkWrite(operations);
            console.log(`Migrated ${operations.length} team members.`);
        }
    } catch (error) {
        console.error('Migration error:', error);
    }
};

// Get all team data (Grouped by category to match legacy frontend format)
exports.getTeam = async (req, res) => {
    try {
        await migrateData(); // Ensure migration runs once

        const members = await TeamMember.find().sort({ category: 1, order: 1 }).lean();

        // Group by category to match old JSON structure
        const groupedData = {};
        members.forEach(member => {
            if (!groupedData[member.category]) {
                groupedData[member.category] = [];
            }
            groupedData[member.category].push(member);
        });

        res.json(groupedData);
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: 'Failed to fetch team data' });
    }
};

// Update all team data (Legacy support - ideally deprecated)
exports.updateTeam = async (req, res) => {
    res.status(405).json({ error: 'Bulk update deprecated. Use individual add/update.' });
};

// Add a team member
exports.addMember = async (req, res) => {
    try {
        const { category } = req.params;
        const newMember = new TeamMember({
            ...req.body,
            category
        });

        await newMember.save();
        res.json({ success: true, member: newMember });
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ error: 'Failed to add team member' });
    }
};

// Update a team member (By ID)
exports.updateMember = async (req, res) => {
    try {
        const { index } = req.params; // Using 'index' param as ID in new routes
        // Check if index is a valid ObjectId (refining route param later)

        let updateId = index;

        // Handle legacy index-based calls gracefully if possible? 
        // Realistically, frontend MUST send ID. Validation:
        if (!mongoose.Types.ObjectId.isValid(updateId)) {
            return res.status(400).json({ error: 'Invalid ID format. Please refresh page.' });
        }

        const updatedMember = await TeamMember.findByIdAndUpdate(
            updateId,
            { ...req.body },
            { new: true }
        );

        if (!updatedMember) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json({ success: true, member: updatedMember });
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({ error: 'Failed to update team member' });
    }
};

// Delete a team member (By ID)
exports.deleteMember = async (req, res) => {
    try {
        const { index } = req.params; // 'index' param is now ID

        if (!mongoose.Types.ObjectId.isValid(index)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const member = await TeamMember.findById(index);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Delete associated image from GridFS if exists
        if (member.image) {
            try {
                const bucket = getGridFSBucket();
                const files = await bucket.find({ filename: member.image }).toArray();
                for (const file of files) {
                    await bucket.delete(file._id);
                }
            } catch (err) {
                console.warn('Could not delete member image:', err.message);
            }
        }

        await TeamMember.findByIdAndDelete(index);

        res.json({ success: true, message: 'Team member deleted' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ error: 'Failed to delete team member' });
    }
};
