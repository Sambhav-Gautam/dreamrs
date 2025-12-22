const Team = require('../models/Team');
const { getGridFSBucket } = require('../config/database');
const mongoose = require('mongoose');

// Get all team data
exports.getTeam = async (req, res) => {
    try {
        let team = await Team.findOne();

        if (!team || !team.data) {
            return res.json({});
        }

        res.json(team.data);
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: 'Failed to fetch team data' });
    }
};

// Update all team data (replaces entire dataset)
exports.updateTeam = async (req, res) => {
    try {
        let team = await Team.findOne();

        if (!team) {
            team = new Team({ data: req.body });
        } else {
            team.data = req.body;
            team.markModified('data'); // Required for Mixed type
        }

        await team.save();

        res.json({
            success: true,
            message: 'Team data updated successfully'
        });
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ error: 'Failed to update team data' });
    }
};

// Add a team member to a specific category
exports.addMember = async (req, res) => {
    try {
        const { category } = req.params;
        let team = await Team.findOne();

        if (!team) {
            team = new Team({ data: {} });
        }

        if (!team.data) {
            team.data = {};
        }

        if (!team.data[category]) {
            team.data[category] = [];
        }

        team.data[category].push(req.body);
        team.markModified('data');
        await team.save();

        res.json({
            success: true,
            member: team.data[category][team.data[category].length - 1]
        });
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ error: 'Failed to add team member' });
    }
};

// Update a team member
exports.updateMember = async (req, res) => {
    try {
        const { category, index } = req.params;
        let team = await Team.findOne();

        if (!team || !team.data || !team.data[category] || !team.data[category][index]) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        team.data[category][index] = {
            ...team.data[category][index],
            ...req.body
        };
        team.markModified('data');
        await team.save();

        res.json({
            success: true,
            member: team.data[category][index]
        });
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({ error: 'Failed to update team member' });
    }
};

// Delete a team member
exports.deleteMember = async (req, res) => {
    try {
        const { category, index } = req.params;
        let team = await Team.findOne();

        if (!team || !team.data || !team.data[category] || !team.data[category][index]) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        // Delete associated image from GridFS if exists
        const member = team.data[category][index];
        if (member.image) {
            try {
                const bucket = getGridFSBucket();
                // Try to find and delete the file by filename
                const files = await bucket.find({ filename: member.image }).toArray();
                for (const file of files) {
                    await bucket.delete(file._id);
                }
            } catch (err) {
                console.warn('Could not delete member image:', err.message);
            }
        }

        team.data[category].splice(parseInt(index), 1);
        team.markModified('data');
        await team.save();

        res.json({ success: true, message: 'Team member deleted' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ error: 'Failed to delete team member' });
    }
};
