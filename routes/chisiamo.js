const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('others/chisiamo', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Chi Siamo"
    })
})

module.exports = router
