const express = require('express');
const path = require('path');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require("dotenv");
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');

const userRoute = require('./route/user.route');
const expenseRoute = require('./route/expense.route');
const purchaseRoute = require('./route/purchase.route');
const premiumFeaturesRoute = require('./route/premiumFeatures.route');
const resetPassword = require('./route/forgotpassword.route');
const reportRoute = require('./route/report.route');

const User = require('./model/user.model');
const Expense = require('./model/expense.model');
const Order = require('./model/order.model');
const ForgotPassword = require('./model/forgotpassword.model');
const Download = require('./model/download.model');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(express.static('public'));

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "form-action 'self' http://34.239.2.148:3000");
  next();
});

const accessLogStream = fs.createWriteStream(path.join(__dirname , 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend'), {
  index: false // This will prevent index.html from being served by default
}));

// Define routes
app.use('/api', userRoute);
app.use('/expense', expenseRoute);
app.use('/purchase', purchaseRoute);
app.use('/premium', premiumFeaturesRoute);
app.use('/password', resetPassword);
app.use('/report', reportRoute);

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

// Define relationships
User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ForgotPassword, { foreignKey: 'userId' });
ForgotPassword.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Download, { foreignKey: 'userId' });
Download.belongsTo(User, { foreignKey: 'userId' });

// Global error handling
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Sync database and start server
sequelize
  .sync()
  .then(result => {
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
