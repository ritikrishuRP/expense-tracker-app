const User = require('../model/user.model');


const signupDetail = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'name, email, and password are required.' });
        }

        const newDetail = await User.create({name, email, password});
        res.status(201).json(newDetail);
    } catch (error) {
        console.error('Error in signup controller:', error); 
        res.status(500).json({ error: 'Failed to create signup detail' });
    }
    
}

module.exports = {
    signupDetail
}