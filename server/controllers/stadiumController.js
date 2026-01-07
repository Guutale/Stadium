const Stadium = require('../models/Stadium');

// Get all stadiums
exports.getAllStadiums = async (req, res) => {
    try {
        const stadiums = await Stadium.find().sort({ createdAt: -1 });
        res.json(stadiums);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get stadium by ID
exports.getStadiumById = async (req, res) => {
    try {
        const stadium = await Stadium.findById(req.params.id);
        if (!stadium) {
            return res.status(404).json({ message: 'Stadium not found' });
        }
        res.json(stadium);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Stadium not found' });
        }
        res.status(500).send('Server Error');
    }
};

// Create a stadium (Admin only)
exports.createStadium = async (req, res) => {
    try {
        const newStadium = new Stadium(req.body);
        const stadium = await newStadium.save();
        res.json(stadium);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update a stadium (Admin only)
exports.updateStadium = async (req, res) => {
    try {
        const stadium = await Stadium.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(stadium);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a stadium (Admin only)
exports.deleteStadium = async (req, res) => {
    try {
        const stadium = await Stadium.findById(req.params.id);
        if (!stadium) {
            return res.status(404).json({ message: 'Stadium not found' });
        }
        await stadium.deleteOne();
        res.json({ message: 'Stadium removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
