const express = require('express')
const router = express.Router()
const db = require ('../models/db')

router.get('/', (req, res) => {
    res.render('home', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Home"
    })
})

router.post('/newsletter', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send('Email is required');
    }

    try {
        const query = `INSERT INTO newsletter (email) VALUES (?)`;
        await db.run(query, [email]);
        res.redirect('/');
    } catch (error) {
        res.status(500).send('An error occurred while subscribing');
    }
});

module.exports = router;
