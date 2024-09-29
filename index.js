const express = require('express');
const { Sequelize, where } = require('sequelize');
const app = express();
const { User, expenses } = require('./models');
const bcrypt = require('bcryptjs');
const session = require('express-session');

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json()); // Parses JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form data

// Set up session management
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure: true in production with HTTPS
}));

// Configure Sequelize for database connection
const sequelize = new Sequelize('database_development', 'root', 'ayukac45', {
  host: 'localhost',
  dialect: 'mysql'
});

// Connect to the database
async function connect() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
connect();

// Route for the home page
app.get('/', (req, res) => {
  res.render('home', { title: 'Home Page' }); // Render the home page
});

// Route to render sign-up page
app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up' });
});

// Route to render login page
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login Page' });
});

// Route to render dashboard
app.get('/dashboard', (req, res) => {
  res.render('dashboard', { title: 'Dashboard' });
});

// Route to handle sign-up
app.post('/signup', async (req, res) => {
  console.log('Received request body:', req.body); // Log request body

  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if required fields are provided
  if (!username || !email || !password) {
    return res.status(400).send('All fields are required.');
  }

  try {
    const user = await User.create({ username, email, password: hashedPassword });
    res.render('login'); // Redirect to login page after sign-up
  } catch (error) {
    console.log('Error creating user:', error); // Log the error
    res.status(500).send('Error creating user.');
  }
});

// Route to handle login
app.post('/login', async (req, res) => {
  console.log('Received request body:', req.body); // Log request body

  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  try {
    // Fetch user based on email
    const user = await User.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) { // Check password using bcrypt
      req.session.userId = user.id; // Store user ID in session
      res.render('dashboard', { username: user.username }); // Render dashboard
    } else {
      res.status(401).send('Invalid credentials'); // Send error if credentials are invalid
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('An error occurred during login.');
  }
});

// Route to handle adding expenses
app.post('/dashboard', async (req, res) => {
  const { initialamount, description, amount } = req.body;

  try {
    const Expense = await expenses.create({ initialamount, description, amount });
    res.render('dashboard', {
      initialamount: Expense.initialamount,
      description: Expense.description,
      amount: Expense.amount
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error while adding expense.');
  }
});

// Start the server
app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
