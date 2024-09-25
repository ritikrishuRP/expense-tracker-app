const express = require('express');
const path = require('path');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoute = require('./route/user.route')
const expenseRoute = require('./route/expense.route');
const purchaseRoute = require('./route/purchase.route')

const User = require('./model/user.model');
const Expense = require('./model/expense.model');
const Order = require('./model/order.model')

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend'), {
  index: false // This will prevent index.html from being served by default
}));


app.use('/api', userRoute);
app.use('/expense', expenseRoute);
app.use('/purchase', purchaseRoute);

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname,'..','frontend','index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'signup.html'));
});

app.get('/login', (req,res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
})

User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' })

sequelize
  .sync()
  .then(result => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
