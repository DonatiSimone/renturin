const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require ('../models/db')

function ensureNotAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/profile');
}

router.get('/', ensureNotAuthenticated, async (req, res) => {
    try {
        let errorMessage = "";
        const rows = await db.all("SELECT * FROM prefixes");
        res.render("auth/registrati", {
            errorMessage,
            req: {},
            rows: rows,
            title: "Registrati"
        });
    } catch (err) {
        console.error('Error fetching prefixes:', err);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/register', ensureNotAuthenticated, async (req, res) => {
    let errorMessage = "";
    const rows = await db.all("SELECT * FROM prefixes");
    try {
        const hashedPassword = await bcrypt.hash(req.body.user_password, 10);
        await db.addNewUser(
            req.body,
            hashedPassword
        );
        return res.redirect("/log");
    } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT' && e.message.includes('user.email')) {
        errorMessage = "L'email è già registrata. Per favore, usa un'email diversa.";
        return res.render("auth/registrati", {
            errorMessage,
            req: {},
            rows: rows,
            title: "Registrati"
        })
    } else {
        console.log("Errore di registrazione", e);
        res.redirect("/registrati");
        }
    }
});

module.exports = router;
