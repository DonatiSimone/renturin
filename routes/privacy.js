const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('others/privacy', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Privacy"
    })
})

module.exports = router
