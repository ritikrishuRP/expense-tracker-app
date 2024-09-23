const express = require('express');
const path = require('path');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoute = require('./route/user.route')
const expenseRoute = require('./route/expense.route')

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));


app.use('/api', userRoute);
app.use('/expense', expenseRoute);

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname,'..','frontend','index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'signup.html'));
});

app.get('/login', (req,res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
})

sequelize
  .sync()
  .then(result => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
