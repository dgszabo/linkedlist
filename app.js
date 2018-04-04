// packages
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');
const mongoose = require('mongoose');

// globals
const app = express();
const PORT = 3007;
const { usersRouters, companiesRouters } = require('./routers');

// settings
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'))

// database
mongoose.set('debug', true);
mongoose
    .connect('mongodb://localhost/linkedlist_db')
    .then(() => {
        console.log('mongoDB connected!')
    })
    .catch(err => {
        console.log(err);
    });

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(methodOverride('_method'));
app.use('/users', usersRouters);
app.use('/companies', companiesRouters);

// general routes
app.get('/', (req, res, next) => {
    return res.redirect('/users');
});

// error handler
app.use((err, req, res, next) => {
    return res.json(err);
});

app.listen(PORT, () => {
   console.log(`server running at ${PORT}`); 
});