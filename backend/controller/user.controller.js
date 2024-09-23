const User = require('../model/user.model');
const bcrypt = require('bcrypt');


const signupDetail = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'name, email, and password are required.' });
        }

        bcrypt.hash(password, 10, async(err, hash) => {
            console.log(err)
            const newDetail = await User.create({name, email, password: hash});
            res.status(201).json(newDetail);
        })
    } catch (error) {
        console.error('Error in signup controller:', error); 
        res.status(500).json({ error: 'Failed to create signup detail' });
    }
    
}

const loginDetail = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({where: { email }});

        if(!user){
            return res.status(404).json({message: 'User not found'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(401).json({ message: 'User not authorized'});
        }

        res.status(200).json({message: 'User login successfully'})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in login controller' });
    }
}

module.exports = {
    signupDetail,
    loginDetail
}