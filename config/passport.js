var passport = require('passport');
var User = require('../models/users');
var Seller = require('../models/seller');

// Making Local Strategy of Passport Authentication
var Localstrategy = require('passport-local').Strategy;

// Serialize and Deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Creating new User (sign up)
passport.use(
  'local-signup',
  new Localstrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, email, password, done) => {
      req
        .checkBody('email', 'Invalid Email')
        .notEmpty()
        .isEmail();
      req
        .checkBody('password', 'Invalid Password')
        .notEmpty()
        .isLength({ min: 6 });
      var errors = req.validationErrors();
      if (errors) {
        var messages = [];
        errors.forEach((error) => {
          messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
      }
      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, false, { message: 'User is already exists' });
        }
        var newUser = new User();
        if (req.body.name === '') {
          return done(null, false, { message: 'Kindly Enter User Name' });
        } else {
          newUser.name = req.body.name;
          newUser.email = email;
          newUser.password = newUser.encryptPassword(password);
          newUser.save((err, result) => {
            if (err) {
              return done(err);
            }
            return done(null, newUser);
          });
        }
      });
    }
  )
);

// Creating new Seller (sign up)
passport.use(
  'local-seller-signup',
  new Localstrategy(
    {
      usernameField: 'aid',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, aid, password, done) => {
      var errors = req.validationErrors();
      if (errors) {
        var messages = [];
        errors.forEach((error) => {
          messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
      }
      Seller.findOne({ aid: aid }, (err, seller) => {
        if (err) {
          return done(err);
        }
        if (seller) {
          return done(null, false, { message: 'Seller is already exists' });
        }
        var newSeller = new Seller();
        if (req.body.name === '') {
          return done(null, false, { message: 'Kindly Enter Admin Name' });
        } else {
          newSeller.name = req.body.name;
          newSeller.aid = aid;
          newSeller.password = newSeller.encryptPassword(password);
          newSeller.save((err, result) => {
            if (err) {
              return done(err);
            }
            return done(null, newSeller);
          });
        }
      });
    }
  )
);

// Fetching Seller (Sign in)
passport.use(
  'local-seller-signin',
  new Localstrategy(
    {
      usernameField: 'aid',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, aid, password, done) {
      req.checkBody('password', 'Invalid Password').notEmpty();
      var errors = req.validationErrors();
      if (errors) {
        var messages = [];
        errors.forEach((err) => {
          messages.push(err.msg);
        });
        return done(null, false, req.flash('error', messages));
      }

      Seller.findOne({ aid: aid }, (err, seller) => {
        if (err) {
          return done(err);
        }
        if (!seller) {
          return done(null, false, { message: 'Seller Not Found !' });
        }
        if (!seller.validPassword(password)) {
          return done(null, false, { message: 'Wrong Password !' });
        }

        return done(null, seller);
      });
    }
  )
);
// Fetching User (Sign in)
passport.use(
  'local-signin',
  new Localstrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, email, password, done) {
      req.checkBody('email', 'Invalid Email').notEmpty();
      req.checkBody('password', 'Invalid Password').notEmpty();
      var errors = req.validationErrors();
      if (errors) {
        var messages = [];
        errors.forEach((err) => {
          messages.push(err.msg);
        });
        return done(null, false, req.flash('error', messages));
      }

      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: 'User Not Found !' });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: 'Wrong Password !' });
        }

        return done(null, user);
      });
    }
  )
);
