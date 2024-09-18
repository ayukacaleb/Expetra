const express=require('express');
const { Sequelize, where } = require('sequelize');
const app=express();
const {User,expenses} = require('./models');
const bcrypt=require('bcryptjs');
const session =require('express-session');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized:true,
  cookie:{ secure:false}
}));

const sequelize = new Sequelize('database_development', 'root', 'ayukac45', {
  host: 'localhost',
  dialect: 'mysql'
});

async function connect() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}
connect();

app.get('/signup',(req,res)=>{
  res.render('signup',{title: 'Sign Up'});
});

app.get('/login',(req,res)=>{
  res.render('login',{title: 'login page'});
});

app.get('/dashboard',(req,res)=>{
  res.render('dashboard',{title: 'dashboard'});
});

app.post('/signup', async (req, res) => {
  console.log('Received request body:', req.body); // Log request body

  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if required fields are provided
  if (!username || !email || !password) {
      return res.status(400).send('All fields are required.');
  }

  try {
      const user = await User.create({ username, email, password:hashedPassword });
      res.render('login');
  } catch (error) {
      console.log('Error creating user:', error); // Log the error
      res.status(500).send('Error');
  }
});

app.post('/login', async (req, res) => {
  console.log('Received request body:', req.body);

  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  try {
    const user = await User.findOne({ where: { email, password } });
    if (user) {
      res.render('dashboard', { username: user.username });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('An error occurred');
  }
});
app.get('/dashboard',(req,res)=>{
  res.render('dashboard',{title: 'dashboard'});
});

app.post('/dashboard', async (req,res) => {
  const {initialamount, description, amount} = req.body;

  try{
    const Expense = await expenses.create ({initialamount, description, amount});
    res.render('dashboard', {initialamount: Expense.initialamount, description:Expense.initialamount, amount: Expense.amount});
  }
  catch(err){
    console.log(err);
    return res.status(500).send('Error');
  }
});

app.listen(4000,()=>{
  console.log('Server is running on http://localhost:4000');
});