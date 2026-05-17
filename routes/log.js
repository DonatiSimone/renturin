const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get("/", (req, res) => {
    const { alert } = req.query;
    let message = '';
    if (alert === "errore") {
        message = "Username o password errati";
    } else if (!message && alert) {
        message = "Autenticati";
    }
    res.render("auth/log", { message, title: "Log in" });
});

router.post("/", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error("Errore durante l'autenticazione:", err);
            return next(err);
        }
        if (!user) {
            return res.redirect('/log?alert=errore');
        }
        req.login(user, (err) => {
            if (err) {
                console.error("Errore durante il login:", err);
                return next(err);
            }
            if (req.user.role === 'admin') {
                // Reindirizza gli amministratori alla loro dashboard
                return res.redirect("/admin");
            } else {
                return res.redirect("/");
            }
        });
    })(req, res, next);
});

module.exports = router;
