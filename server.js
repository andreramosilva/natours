const mongoose = require('mongoose');

const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);

  // server.close(() => {
  process.exit(1);
  // });
});

const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  // .connect(process.env.DATABASE_LOCAL,{ // how to connect local database
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(con => {
    console.log(con.connections);
    console.log('DB connection is working');
  });

//testing inset data into the database
// const testTour = new Tour({
//   name: 'the forest hiker',
//   rating: 4.7,
//   price: 497
// });

// testTour
//   .save()
//   .then(doc => {
//     console.log(doc);
//   })
//   .catch(err => {
//     console.log('ERROR!! : ', err);
//   });

//starting the server:
const port = 3000;

const server = app.listen(port, () => {
  console.log(`app listening on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
