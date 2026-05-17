const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('others/contact', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Contattaci"
    })
})

module.exports = router
