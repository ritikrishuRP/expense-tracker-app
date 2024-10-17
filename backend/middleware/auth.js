const jwt = require('jsonwebtoken');
const User = require('../model/user.model');

const authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        //console.log(token);
        const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
       // console.log('userID >>>>>>', user.userId)
        User.findByPk(user.userId).then(user => {
           // console.log(JSON.stringify(user));
            req.user = user;
            next();
        }).catch(err => { throw new Error(err)})
    } catch (err) {
        console.log(err);
        return res.status(401).json({success: false})
    }
}

module.exports = {
    authenticate
}

// backend/middleware/auth.js

// const jwt = require('jsonwebtoken');
// const User = require('../model/user.model'); // Adjust the path as necessary

// exports.authenticate = async (req, res, next) => {
//     try {
//         const authHeader = req.headers['authorization'];
//         console.log('Authorization Header:', authHeader); // Debugging

//         if (!authHeader) {
//             console.warn('Authorization header missing');
//             return res.status(401).json({ success: false, msg: 'Authorization header missing' });
//         }

//         const token = authHeader.split(' ')[1]; // Expecting 'Bearer <token>'
//         console.log('Extracted Token:', token); // Debugging

//         if (!token) {
//             console.warn('Authentication token missing');
//             return res.status(401).json({ success: false, msg: 'Authentication token missing' });
//         }

//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         console.log('Decoded Token:', decoded); // Debugging

//         if (!decoded || !decoded.userId) {
//             console.warn('Invalid token payload');
//             return res.status(401).json({ success: false, msg: 'Invalid token payload' });
//         }

//         // Find the user
//         const user = await User.findByPk(decoded.userId);
//         if (!user) {
//             console.warn(`User not found with ID: ${decoded.userId}`);
//             return res.status(401).json({ success: false, msg: 'User not found' });
//         }

//         // Attach user to request
//         req.user = user;
//         next();
//     } catch (error) {
//         console.error('Authentication error:', error);
//         return res.status(401).json({ success: false, msg: 'Invalid or expired token' });
//     }
// };
