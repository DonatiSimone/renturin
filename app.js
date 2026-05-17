if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const app = express();
const path = require('path');
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const db = require ('./models/db')
const PORT = process.env.PORT || 3000;

const furgoniRouter = require('./routes/furgoni');
const motoRouter = require('./routes/moto');
const contactRouter = require('./routes/contact');
const registratiRouter = require('./routes/registrati');
const logRouter = require('./routes/log');
const profileRouter = require('./routes/profile');
const chisiamoRouter = require('./routes/chisiamo');
const privacyRouter = require('./routes/privacy');
const terminiRouter = require('./routes/terminiecondizioni');
const thankyouRouter = require('./routes/thankyou');
const logoutRouter = require('./routes/logout');
const autoRouter = require('./routes/auto');
const homeRouter = require('./routes/home');
const adminRouter = require('./routes/admin');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/thankyou', thankyouRouter);
app.use('/furgoni', furgoniRouter);
app.use('/moto', motoRouter);
app.use('/contact', contactRouter);
app.use('/registrati', registratiRouter);
app.use('/log', logRouter);
app.use('/profile', profileRouter);
app.use('/chisiamo', chisiamoRouter);
app.use('/privacy', privacyRouter);
app.use('/terminiecondizioni', terminiRouter);
app.use('/logout', logoutRouter);
app.use('/auto', autoRouter);
app.use('/', homeRouter);
app.use('/admin', adminRouter)

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'user_password'
}, async function (email, password, done) {
    try {
        const user = await db.getUserByEmail(email);
        if (!user) return done(null, false);

        bcrypt.compare(password, user.user_password, function (err, result) {
            if (err) return done(err);
            if (result) return done(null, user);
            else return done(null, false);
        });
    } catch (err) {
        console.error("Error finding user by email:", err);
        return done(err);
    }
}));


passport.serializeUser(function (user, done) {
    done(null, user.id); // Store the user ID in the session
});

passport.deserializeUser(async function (id, done) {
    try {
        // Fetch the user by their ID
        const user = await db.getUserById(id);
        if (user) {
            done(null, user);
        } else {
            done(new Error('User not found'));
        }
    } catch (err) {
        console.error("Error finding user by ID:", err);
        done(err);
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
