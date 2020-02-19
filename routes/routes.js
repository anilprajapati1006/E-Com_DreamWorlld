var router = require('express').Router();
var Product = require('../models/products');
var Seller = require('../models/seller');
var Cart = require('../models/cart');
var Orders = require('../models/orders');
const { APIKEY } = require('../config/stripe');
const stripe = require('stripe')(APIKEY);
const nodemailer = require('nodemailer');
const passport = require('passport');
const csrf = require('csurf');

/* GET home page. */
router.get('/', async (req, res, next) => {
  var successMsg = req.flash('success')[0];
  const response = await Product.find();
  const url = req.url;
  return res.render('shop/index', {
    title: 'DreamWorld',
    response,
    successMsg,
    noMessage: !successMsg,
    homePage: true,
    matched: url === '/' ? true : false
  });
});

router.get('/search', async (req, res, next) => {
  let carouselShowcase;
  const { search } = req.query;
  let response;
  if (search !== undefined && search !== '') {
    carouselShowcase = false;
    response = await Product.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { desc: { $regex: search, $options: 'i' } }
      ]
    });
  } else {
    carouselShowcase = true;
    response = await Product.find();
  }
  return res.render('shop/index', {
    title: 'DreamWorld',
    response,
    homePage: carouselShowcase,
    noMessage: true,
    matched: true
  });
});

router.post('/subscribe', (req, res, next) => {
  const output = `
        <hr>
        <center><a href="https://dreamworldbpccs.herokuapp.com/"><img src="https://firebasestorage.googleapis.com/v0/b/mydocs-9999.appspot.com/o/Untitled-1.jpg?alt=media&token=242317b3-5147-4226-88fc-72aad455c0aa"></a></center>
        <hr>
    `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'badboysecurities@gmail.com', // DreamWorld Email ID
      pass: 'LaW6rXvEguCHB2V' // DreamWorld Password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  let sender = 'badboysecurities@gmail.com';
  // send mail with defined transport object
  transporter.sendMail({
    from: `"DreamWorld - A Hope Of Happiness" 👻 <${sender}>`,
    to: req.body.subEmail, // list of receivers
    subject: `Congratulations, ${req.body.subName} You are subscribed to DreamWorld Daily Offers`, // Subject line
    html: output // html body
  });
  return res.redirect('/');
});

router.post('/add', async (req, res, next) => {
  const { productImageUrl, name, desc, price } = req.body;
  const response = await new Product({
    imagePath: productImageUrl,
    name,
    desc,
    price
  }).save();
  return res.redirect('/adminDashboard');
});

// update Order
router.post('/updateOrder', async (req, res) => {
  const { _id, status } = req.body;
  const response = await Orders.update(
    { _id },
    {
      $set: {
        status
      }
    }
  );
  console.log('\n\nUPDATE ORDER STATUS ADMIN', response, '\n\n');
  res.redirect('/adminDashboard');
});

//  Update Route
router.post('/adminDashboard', async (req, res, next) => {
  const {
    _id,
    updatedImagePath,
    updatedName,
    updatedDesc,
    updatedPrice
  } = req.body;
  const response = await Product.update(
    { _id },
    {
      $set: {
        imagePath: updatedImagePath,
        name: updatedName,
        desc: updatedDesc,
        price: updatedPrice
      }
    }
  );
  return res.redirect('/adminDashboard');
});

router.get('/adminDashboard', async (req, res, next) => {
  const adminLogin = true;
  const allProducts = await Product.find();
  const allOrders = await Orders.find();
  const sizeOfAllOrders = allOrders.length;
  const sizeOfAllProducts = allProducts.length;
  if (sizeOfAllProducts > 0) {
    result = true;
  } else {
    result = false;
  }

  if (sizeOfAllOrders > 0) {
    resultOrder = true;
  } else {
    resultOrder = false;
  }

  return res.render('admin', {
    title: 'Seller Panel',
    allProducts,
    allOrders,
    result,
    resultOrder,
    adminLogin
  });
});

router.get('/delete/:_id', async (req, res, next) => {
  const { _id } = req.params;
  const response = await Product.findOneAndDelete({ _id });
  return res.redirect('/adminDashboard');
});

router.get('/deleteAllProduct', async (req, res, next) => {
  const response = await Product.deleteMany();
  return res.redirect('/adminDashboard');
});

router.get('/add-to-cart/:_id', async (req, res, next) => {
  const productID = req.params._id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  await Product.findById(productID, (err, product) => {
    if (err) {
      res.redirect('/');
    }
    cart.add(product, product._id, product.name);
    req.session.cart = cart;
    console.log(req.session.cart);
    return res.redirect('/');
  });
});

router.get('/buy-now-add-to-cart/:_id', async (req, res, next) => {
  const productID = req.params._id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  await Product.findById(productID, (err, product) => {
    if (err) {
      res.redirect('/');
    }
    cart.add(product, product._id, product.name);
    req.session.cart = cart;
    console.log(req.session.cart);
    return res.redirect('/checkout');
  });
});

router.get('/reduce/:id', (req, res, next) => {
  const productID = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productID);
  req.session.cart = cart;
  return res.redirect('/shopping-cart');
});

router.get('/addByOne/:id', (req, res, next) => {
  const productID = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.addByOne(productID);
  req.session.cart = cart;
  return res.redirect('/shopping-cart');
});

router.get('/shopping-cart', (req, res, next) => {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', { products: null });
  }
  var cart = new Cart(req.session.cart);
  return res.render('shop/shopping-cart', {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice
  });
});

router.get('/checkout', isLoggedIn, (req, res, next) => {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  return res.render('shop/checkout', {
    total: cart.totalPrice,
    errMsg,
    noError: !errMsg
  });
});

router.post('/checkout', isLoggedIn, (req, res, next) => {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  stripe.charges.create(
    {
      amount: cart.totalPrice * 100,
      currency: 'usd',
      source: req.body.stripeToken, // obtained with Stripe.js
      description: 'Test Charge'
    },
    function(err, charge) {
      // asynchronously called
      if (err) {
        console.log(' STRIPE ERROR');
        req.flash('error', err.message);
        return res.redirect('/checkout');
      }

      const response = new Orders({
        user: req.user,
        userName: req.user.name,
        cart,
        address: req.body.address,
        name: req.body.name,
        status: 'Received',
        paymentId: charge.id
      }).save((err, result) => {
        if (err) {
          console.log('Database Saving Error : ' + err);
          res.redirect('/checkout');
        }
        req.flash('success', 'Successfully bought Product !');
        console.log(' STRIPE SUCCESS');
        req.session.cart = null;
        return res.redirect('/');
      });

      console.log(response);
    }
  );
});

router.get('/adminSignup', async (req, res) => {
  var messages = req.flash('error');
  console.log(messages);
  res.render('admin/signup', {
    adminSignInAndUp: true,
    title: 'Seller Panel Signup',
    hasError: messages.length > 0,
    messages: messages
  });
});

router.get('/admin', async (req, res) => {
  var messages = req.flash('error');
  res.render('admin/signin', {
    adminSignInAndUp: true,
    title: 'Seller Panel Signin',
    hasError: messages.length > 0,
    messages: messages
  });
});

router.post(
  '/admin',
  passport.authenticate('local-seller-signin', {
    failureRedirect: '/admin',
    failureFlash: true
  }),
  async (req, res) => {
    return res.redirect('/adminDashboard');
  }
);

router.post(
  '/sellersignup',
  passport.authenticate('local-seller-signup', {
    failureRedirect: '/adminSignup',
    failureFlash: true
  }),
  async (req, res) => {
    return res.redirect('/adminDashboard');
  }
);

// Route for individual Product View Page
router.get('/products/:productID', async (req, res, next) => {
  const productID = req.params.productID;
  const product = await Product.findOne({ _id: productID });

  res.render('shop/productView', {
    title: product.name,
    product: product
  });
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  return res.redirect('/users/signin');
}
