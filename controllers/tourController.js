//const fs = require('fs');
const Tour = require('./../models/tourModel');
const ApiFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, value) => {
//   console.log(`Tour ID is ${value}`);
//   const id = req.params.id * 1;
//   const tour = tours.find(el => el.id === id);

//   if (id > tours.length) {
//     //tamanho do tour menor que o numero que vem pelo request
//     //if (!tour) {
//     //nao encontrou nada na base de dados
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid id'
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   let name = req.body.name;
//   let price = req.params.price;
//   console.log(req.params.price);

//   if (!name && !price) {
//     console.log(`nome: ${name} e price: ${price}`);
//     return res
//       .status(404)
//       .json({ status: 'fail', message: 'ta faltando nome ou o preço' });
//   }

//   next();
// };

exports.getAliasTours = async (req, res, next) => {
  //console.log('midleware funfando de boa');
  //req.query.page = '1';
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  //console.log('ficou assim: ', req.query.limit);

  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //try {
  //filtra objeto da consulta para pegar apenas os valores relevantes e nao quebrar a consulta
  //build query
  // const queryObj = { ...req.query };
  // const excludeFields = ['page', 'sort', 'limit', 'fields'];
  // excludeFields.forEach(el => delete queryObj[el]);
  // console.log('primeira query', req.query);

  // //converting the query obj(objeto de consulta que vem o http) to string so i can manipulate it and replace the query js para query mongodb
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  // console.log('primeira query', JSON.parse(queryStr));

  // let query = Tour.find(JSON.parse(queryStr));
  // Sorting data
  // if (req.query.sort) {
  //   console.log('chegou no if do sorting');

  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-createdAt');
  // }
  //field limiting (choose fields that we want to see)

  // if (req.query.fields) {
  //   console.log('chegou no if dos fields');

  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v');

  // }
  //pagination
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page - 1) * limit;

  // query = query.skip(skip).limit(limit);
  // console.log('query pagination', query);

  // if (req.query.page) {
  //   console.log('chegou no if de page');

  //   const numTours = await Tour.countDocuments();
  //   console.log('num tours', numTours);

  //   if (skip >= numTours) throw new Error('This page does not exist');
  // }

  const features = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: 'sucess',
    results: tours.length,
    data: { tours }
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: 'Invalid data sent ' //err
  //   });
  // }
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'sucess',
    results: tour.length,
    data: { tour }
  });
  // try {

  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid data sent ' //err
  //   });
  // }

  //const id = req.params.id * 1;
  //const tour = tours.find(el => el.id === id);
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  // try {

  res.status(204).json({
    status: 'sucess',
    results: tour.length,
    data: null
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid data sent ' //err
  //   });
  // }

  //const id = req.params.id * 1;
  //const tour = tours.find(el => el.id === id);
});

exports.createTour = catchAsync(async (req, res, next) => {
  // try {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'sucess',
    results: newTour.length,
    data: { newTour }
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: 'Invalid data sent ' //err
  //   });
  //   //console.log('deu ruin na criaçao do doc ');
  // }

  //console.log(req.body);
  // const newID = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newID }, req.body);
  // tours.push(newTour);
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   err => {
  //     res.status(200).json({ status: 'sucess', data: { tour: newTour } });
  //   }
  // );
  //res.send('Done');
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // try {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'sucess',
    results: tour.length,
    data: { tour }
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid data sent ' //err
  //   });
  // }

  // const id = req.params.id * 1;
  //const tour = tours.find(el => el.id === id);

  // // if (id > tours.length) { //tamanho do tour menor que o numero que vem pelo request
  // if (!tour) {
  //   //nao encontrou nada na base de dados
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'invalid id'
  //   });
  // }
});

exports.getToursStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAvg: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQty' },
        avgRating: { $avg: '$ratingAvg' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);
  console.log('obj stats', stats);

  res.status(200).json({
    status: 'sucess',
    results: stats.length,
    data: { stats }
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid data sent ' //err
  //   });
  // }
});

exports.busiestMonth = catchAsync(async (req, res, next) => {
  //  try {
  const year = req.params.year * 1;
  // console.log(year);
  // console.log(new Date(`${year}-01-01`));
  // console.log(new Date(`${year}-12-31`));

  const month = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTours: -1 }
    }
  ]);

  res.status(200).json({
    status: 'sucess',
    results: month.length,
    data: { month }
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err
  //   });
  // }
});
