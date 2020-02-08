const express = require('express');
const morgan = require('morgan');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

app.use(express.json());
app.use(morgan('dev'));
//app.use(express.static(`${__dirname}/public`));

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'hello from the server using express', app: 'natours' });
// });

// app.post('/', (req, res) => {
//   res.send('you can post to this URL');
// });

//route handlers

//creating my own middleware

app.use((req, res, next) => {
  console.log('middleware');
  next();
});

//Routes

//mounting the routes

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
//middleware para rodas nao gerenciadas
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl} on this server !`
  // });

  const err = new Error(`can't find ${req.originalUrl} on this server !`);
  err.status = 'fail';
  err.statusCode = 404;

  next(err);
});

app.use(globalErrorHandler);

// app.get('/api/v1/tours', getAllTours);
// app.patch('/api/v1/tours/:id', updateTour);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);

module.exports = app;
