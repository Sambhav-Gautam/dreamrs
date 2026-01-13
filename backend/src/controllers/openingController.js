const Settings = require('../models/Settings');

// Default structure for openings - each category is an array of items
const DEFAULT_OPENINGS = {
    phd: [],
    mtech: [],
    btech: [],
    analyst: []
};

const VALID_CATEGORIES = ['phd', 'mtech', 'btech', 'analyst'];

// Get all openings
exports.getOpenings = async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'openings' });
        const rawData = setting?.value || {};

        // Helper to ensure category is an array (handles old object format)
        const ensureArray = (data) => {
            if (Array.isArray(data)) return data;
            // If old format (object with file/link), convert to array with one item
            if (data && typeof data === 'object' && (data.file || data.link)) {
                return [{ title: 'Opening', file: data.file || '', form: data.link || '' }];
            }
            return [];
        };

        const openings = {
            phd: ensureArray(rawData.phd),
            mtech: ensureArray(rawData.mtech),
            btech: ensureArray(rawData.btech),
            analyst: ensureArray(rawData.analyst)
        };

        res.json(openings);
    } catch (error) {
        console.error('Error fetching openings:', error);
        res.status(500).json({ error: 'Failed to fetch openings data' });
    }
};

// Add an item to a category
exports.addItem = async (req, res) => {
    try {
        const { category } = req.params;
        const { title, file, form } = req.body;

        if (!VALID_CATEGORIES.includes(category)) {
            return res.status(400).json({ error: 'Invalid opening category' });
        }

        let setting = await Settings.findOne({ key: 'openings' });

        if (!setting) {
            setting = new Settings({
                key: 'openings',
                value: { ...DEFAULT_OPENINGS, [category]: [{ title, file, form }] }
            });
        } else {
            if (!setting.value) setting.value = { ...DEFAULT_OPENINGS };
            if (!Array.isArray(setting.value[category])) setting.value[category] = [];

            setting.value[category].push({ title: title || '', file: file || '', form: form || '' });
            setting.markModified('value');
        }

        await setting.save();

        res.json({
            success: true,
            message: `Item added to ${category}`,
            items: setting.value[category]
        });
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: 'Failed to add item' });
    }
};

// Update an item in a category
exports.updateItem = async (req, res) => {
    try {
        const { category, index } = req.params;
        const { title, file, form } = req.body;
        const idx = parseInt(index);

        if (!VALID_CATEGORIES.includes(category)) {
            return res.status(400).json({ error: 'Invalid opening category' });
        }

        let setting = await Settings.findOne({ key: 'openings' });

        if (!setting || !setting.value || !Array.isArray(setting.value[category]) || !setting.value[category][idx]) {
            return res.status(404).json({ error: 'Item not found' });
        }

        setting.value[category][idx] = {
            title: title !== undefined ? title : setting.value[category][idx].title,
            file: file !== undefined ? file : setting.value[category][idx].file,
            form: form !== undefined ? form : setting.value[category][idx].form
        };
        setting.markModified('value');
        await setting.save();

        res.json({
            success: true,
            message: `Item updated in ${category}`,
            item: setting.value[category][idx]
        });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
};

// Delete an item from a category
exports.deleteItem = async (req, res) => {
    try {
        const { category, index } = req.params;
        const idx = parseInt(index);

        if (!VALID_CATEGORIES.includes(category)) {
            return res.status(400).json({ error: 'Invalid opening category' });
        }

        let setting = await Settings.findOne({ key: 'openings' });

        if (!setting || !setting.value || !Array.isArray(setting.value[category]) || !setting.value[category][idx]) {
            return res.status(404).json({ error: 'Item not found' });
        }

        setting.value[category].splice(idx, 1);
        setting.markModified('value');
        await setting.save();

        res.json({
            success: true,
            message: `Item deleted from ${category}`,
            items: setting.value[category]
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
};
