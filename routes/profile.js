const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Import the singleton database instance


// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/log');
}

router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        res.render('auth/profile', {
            user: user,
            authenticated: req.isAuthenticated(),
            title: "Profile"
        });
    } catch (err) {
        console.error("Error rendering profile page:", err);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/', ensureAuthenticated, async (req, res, next) => {

    try {
        const userId = req.user.id;
        console.log("User ID from session:", userId);

        // Update the user's profile in the database
        await db.updateUserById(userId, req.body);

        // Fetch the updated user data from the database
        const updatedUser = await db.getUserById(userId);

        // Re-login the user with the updated data using Passport
        req.login(updatedUser, (err) => {
            if (err) {
                console.error("Error during re-login:", err);
                return next(err);
            }
            console.log("User successfully re-logged in after update:", updatedUser.email);
            res.redirect('/profile');
        });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/prenotazioni', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;

    db.all(`
        SELECT
            rental.id,
            rental.start_date,
            rental.end_date,
            CASE
                WHEN auto.brand IS NOT NULL THEN auto.brand
                WHEN furgoni.brand IS NOT NULL THEN furgoni.brand
                ELSE moto.brand
            END AS brand,
            CASE
                WHEN auto.model IS NOT NULL THEN auto.model
                WHEN furgoni.model IS NOT NULL THEN furgoni.model
                ELSE moto.model
            END AS model,
            rental.price,
            rental.has_full_insurance,
            rental.has_navetta,
            rental.has_seggiolino,
            rental.has_secondo_conducente
        FROM rental
        LEFT JOIN auto ON rental.auto_id = auto.id
        LEFT JOIN furgoni ON rental.furgone_id = furgoni.id
        LEFT JOIN moto ON rental.moto_id = moto.id
        WHERE rental.user_id = ?
    `, [userId])
    .then(rows => {
        if (rows.length === 0) {
            console.log("No rentals found for this user.");
            res.render('auth/prenotazioni', { rentals: [], user: req.user });
        } else {
            res.render('auth/prenotazioni', { rentals: rows, user: req.user });
        }
    })
    .catch(err => {
        console.error('Error fetching rentals:', err);
        res.status(500).send("An error occurred while fetching your rentals.");
    });
});


module.exports = router;
