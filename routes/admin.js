const express = require('express')
const router = express.Router()
const db = require ('../models/db')

function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    } else {
        res.status(403).send('Access denied');
    }
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/log');
}

router.get('/', ensureAdmin, ensureAuthenticated, async (req, res) => {
    db.all(`
        SELECT
            rental.id,
            rental.user_id,
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
    `)
    .then(rows => {
        if (rows.length === 0) {
            console.log("No rentals found.");
            res.render('admin/allRentals', { rentals: [], user: req.user });
        } else {
            res.render('admin/allRentals', { rentals: rows, user: req.user });
        }
    })
    .catch(err => {
        console.error('Error fetching all rentals:', err);
        res.status(500).send("An error occurred while fetching rentals.");
    });
});

router.get('/ricercaUtenti', ensureAdmin, ensureAuthenticated, async (req, res) => {
    const userId = req.query.user_id;

    try {
        const user = await db.getUserById(userId);

        if (!user) {
            return res.render('admin/ricercaUtenti', { message: "Utente non trovato", user: null });
        }
        res.render('admin/ricercaUtenti', { user: user, message: null });
    } catch (err) {
        console.error("Error fetching user details:", err);
        res.status(500).send("Errore del server durante la ricerca dell'utente.");
    }
});

module.exports = router;
