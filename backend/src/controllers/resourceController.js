const Settings = require('../models/Settings');

// Default structure for resources
const DEFAULT_RESOURCES = [];

// Get all resources
exports.getResources = async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'resources' }).lean();
        const resources = setting?.value || DEFAULT_RESOURCES;
        res.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
};

// Add a new resource
exports.addResource = async (req, res) => {
    try {
        const { title, description, file, type } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        let setting = await Settings.findOne({ key: 'resources' });

        const newResource = {
            id: Date.now().toString(),
            title: title || '',
            description: description || '',
            file: file || '',
            type: type || 'document', // 'video', 'presentation', 'document', 'other'
            createdAt: new Date().toISOString()
        };

        if (!setting) {
            setting = new Settings({
                key: 'resources',
                value: [newResource]
            });
        } else {
            if (!Array.isArray(setting.value)) setting.value = [];
            setting.value.push(newResource);
            setting.markModified('value');
        }

        await setting.save();

        res.json({
            success: true,
            message: 'Resource added successfully',
            resource: newResource,
            resources: setting.value
        });
    } catch (error) {
        console.error('Error adding resource:', error);
        res.status(500).json({ error: 'Failed to add resource' });
    }
};

// Update a resource
exports.updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, file, type } = req.body;

        let setting = await Settings.findOne({ key: 'resources' });

        if (!setting || !Array.isArray(setting.value)) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        const resourceIndex = setting.value.findIndex(r => r.id === id);
        if (resourceIndex === -1) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        setting.value[resourceIndex] = {
            ...setting.value[resourceIndex],
            title: title !== undefined ? title : setting.value[resourceIndex].title,
            description: description !== undefined ? description : setting.value[resourceIndex].description,
            file: file !== undefined ? file : setting.value[resourceIndex].file,
            type: type !== undefined ? type : setting.value[resourceIndex].type,
            updatedAt: new Date().toISOString()
        };
        setting.markModified('value');
        await setting.save();

        res.json({
            success: true,
            message: 'Resource updated successfully',
            resource: setting.value[resourceIndex]
        });
    } catch (error) {
        console.error('Error updating resource:', error);
        res.status(500).json({ error: 'Failed to update resource' });
    }
};

// Delete a resource
exports.deleteResource = async (req, res) => {
    try {
        const { id } = req.params;

        let setting = await Settings.findOne({ key: 'resources' });

        if (!setting || !Array.isArray(setting.value)) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        const resourceIndex = setting.value.findIndex(r => r.id === id);
        if (resourceIndex === -1) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        setting.value.splice(resourceIndex, 1);
        setting.markModified('value');
        await setting.save();

        res.json({
            success: true,
            message: 'Resource deleted successfully',
            resources: setting.value
        });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ error: 'Failed to delete resource' });
    }
};
