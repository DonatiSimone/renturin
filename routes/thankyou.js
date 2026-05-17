const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('others/thankyou', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Thank you"
    });
});

module.exports = router
