// packages
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');
const mongoose = require('mongoose');

const {
    APIError
} = require('./helpers');

const {
    authHandler,
    companyAuthHandler
} = require('./handlers');

// globals
const app = express();
const PORT = 3007;
const {
    usersRouters,
    companiesRouters,
    jobsRouters,
} = require('./routers');

// settings
// app.set('view engine', 'pug');
// app.use(express.static(__dirname + '/public'))

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
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({
    type: '*/*'
}));
app.use(morgan('dev'));
// app.use(methodOverride('_method'));
app.use('/users', usersRouters);
app.use('/companies', companiesRouters);
app.use('/jobs', jobsRouters);

// general routes
app.get('/', (req, res, next) => {
    return res.redirect('/users');
});

app.post('/user-auth', authHandler);
app.post('/company-auth', companyAuthHandler);

// error handler
app.use((err, req, res, next) => {
    if (!(err instanceof APIError)) {
        err = new APIError(500, 'Internal Server Error', err.message);
    }
    return res.status(err.status).json(err);
});

app.listen(PORT, () => {
    console.log(`server running at ${PORT}`);
});