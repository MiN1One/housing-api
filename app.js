const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');

const errorController = require('./controllers/errorController');

const reviewRoute = require('./routes/reviewRoute');
const apartmentsRoute = require('./routes/apartmentRoute');
const userRoute = require('./routes/userRoute');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// HTTP Security headers
app.use(helmet());

app.use(cors());

if (process.env.NODE_ENV === 'development')
  app.use(morgan('dev'));

app.use(express.json());
app.use(cookieParser());

// Security middlewares
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
// ---------------------

const Apt = require('./models/apartmentModel');
app.get('/max', async (req, res, next) => {
  const maxvals = await Apt.aggregate([
    {
      $group: {
        _id: null,
        maxPrice: { $max: "$price" }
      }
    }
  ]);

  res.status(200).json({
    maxvals
  })
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/reviews', reviewRoute);
app.use('/api/apartments', apartmentsRoute);
app.use('/api/users', userRoute);

app.get('*', (req, res) => 
  res.sendFile(path.join(__dirname, './public/index.html'))
);

app.use(errorController);

module.exports = app;