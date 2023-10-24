const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const PORT = 3000;
const app = express();
//app.get('/',(req,res)=>{
  //  res.send("Hello World");
//});
//app.get('/user',(req,res) => {
  //  res.send('User');
//});
// Set up view engine
app.set('view engine', 'ejs');

// Static files
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'anhnhy4qweol34nlanms312xcb5rwqai4457sheqwe',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message; // clear it after using
    next();
});

const connectDB = require('./config/db');
//Load config
dotenv.config({ path: './config/config.env'});
connectDB();

// Routes
const mainRoutes = require('./routes/index');
app.use(mainRoutes);


// Start the server
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});