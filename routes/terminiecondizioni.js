const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('others/terminiecondizioni', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Termini e condizioni"
    })
})

module.exports = router
