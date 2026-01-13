const Settings = require('../models/Settings');

// Default structure for openings
const DEFAULT_OPENINGS = {
    phd: { file: '', link: '' },
    mtech: { file: '', link: '' },
    btech: { file: '', link: '' },
    analyst: { file: '', link: '' }
};

// Get all openings
exports.getOpenings = async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'openings' });

        // Merge with defaults to ensure all types exist
        const openings = {
            ...DEFAULT_OPENINGS,
            ...(setting?.value || {})
        };

        res.json(openings);
    } catch (error) {
        console.error('Error fetching openings:', error);
        res.status(500).json({ error: 'Failed to fetch openings data' });
    }
};

// Update a specific opening type (phd, mtech, btech, analyst)
exports.updateOpeningType = async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ['phd', 'mtech', 'btech', 'analyst'];

        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Invalid opening category' });
        }

        let setting = await Settings.findOne({ key: 'openings' });

        if (!setting) {
            setting = new Settings({
                key: 'openings',
                value: { ...DEFAULT_OPENINGS, [category]: req.body }
            });
        } else {
            setting.value = {
                ...DEFAULT_OPENINGS,
                ...(setting.value || {}),
                [category]: req.body
            };
            setting.markModified('value');
        }

        await setting.save();

        res.json({
            success: true,
            message: `${category} opening updated successfully`,
            opening: setting.value[category]
        });
    } catch (error) {
        console.error('Error updating opening:', error);
        res.status(500).json({ error: 'Failed to update opening' });
    }
};

// Delete/clear a specific opening type
exports.deleteOpeningType = async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ['phd', 'mtech', 'btech', 'analyst'];

        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Invalid opening category' });
        }

        let setting = await Settings.findOne({ key: 'openings' });

        if (setting && setting.value && setting.value[category]) {
            // Reset to default (clear file and link but keep description)
            setting.value[category] = {
                file: '',
                link: '',
                description: DEFAULT_OPENINGS[category].description
            };
            setting.markModified('value');
            await setting.save();
        }

        res.json({ success: true, message: `${category} opening cleared` });
    } catch (error) {
        console.error('Error clearing opening:', error);
        res.status(500).json({ error: 'Failed to clear opening' });
    }
};
