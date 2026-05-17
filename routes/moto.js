const express = require('express')
const router = express.Router()
const db = require ('../models/db')
const calculateDays = require ('../public/middleware/calculateDays')

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/log');
}


router.get('/', ensureAuthenticated, (req, res) => {
    const errorMessage = "";
    res.render('moto/moto', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Moto",
        errorMessage: errorMessage
    })
})

router.get('/sceltamoto', ensureAuthenticated, (req, res) => {
    res.render('moto/sceltamoto', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Scelta Moto"
    })
})

router.post('/sceltamoto', ensureAuthenticated, calculateDays, (req, res) => {
    const { user_id, start_date, end_date, age } = req.body;

    // Convert dates to Date objects
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    const days = req.days;

    // Check if the end date is earlier than the start date
    if (startTimestamp >= endTimestamp) {
        return res.render('moto/moto', {
            user_id: req.user.id,
            start_date,
            end_date,
            days: days,
            age,
            user: req.user,
            authenticated: req.isAuthenticated(),
            title: "Moto",
            errorMessage: "La data di fine noleggio non può essere uguale o antecedente a quella di inizio."
        });

    }

    res.render('moto/sceltamoto', {
        user_id: req.user.id,
        start_date,
        end_date,
        age,
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Scelta Moto",
        errorMessage: ""
    });
});

router.get('/sceltamoto/polizzamoto', ensureAuthenticated, (req, res) => {
    res.render('moto/polizzamoto', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Polizza Moto"
    })
})

router.post('/sceltamoto/polizzamoto', ensureAuthenticated, calculateDays, (req, res) => {
    const { moto_name, start_date, end_date, age } = req.body;
    const days = req.days;
    res.render('moto/polizzamoto', {
        user_id: req.user.id,
        moto_name,
        start_date,
        end_date,
        days,
        age,
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Polizza Moto"
    })
})

router.post('/sceltamoto/polizzamoto/riepilogomoto', ensureAuthenticated, calculateDays, async (req, res) => {
    const { moto_name, start_date, end_date, age, insurance_type, has_navetta, has_secondo_conducente, has_seggiolino } = req.body;
    const days = req.days;
    try {
        // Split moto_name into brand and model
        const [brand, ...modelArray] = moto_name.split(' ');
        const model = modelArray.join(' ');

        const motoDetails = await db.query('SELECT * FROM moto WHERE brand = ? AND model = ?', [brand, model]);
        const daily_price = await db.query('SELECT price FROM moto WHERE brand = ? AND model = ?', [brand, model]);
        const price = daily_price[0].price;
        const finalPrice = (price * days) + (insurance_type ? 15 * days : 0) + (has_navetta ? 15 : 0) + (has_secondo_conducente ? 40 : 0) + (has_seggiolino ? 20 : 0);

        if (motoDetails.length > 0) {
            const moto = motoDetails[0];

            res.render('moto/riepilogomoto', {
                user_id: req.user.id,
                moto_name: `${moto.brand} ${moto.model}`, // Pass the moto name in 'Brand Model' format
                moto_image: moto.image_path,
                finalPrice,
                start_date,
                end_date,
                days,
                age,
                insurance_type,
                has_navetta,
                has_secondo_conducente,
                has_seggiolino,
                user: req.user,
                authenticated: req.isAuthenticated(),
                title: "Riepilogo Noleggio"
            });
        } else {
            res.status(404).send("moto not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/sceltamoto/polizzamoto/riepilogomoto/confermaNoleggioMoto', ensureAuthenticated, calculateDays, async (req, res) => {
    const { user_id, moto_name, price, insurance_type, has_navetta, has_secondo_conducente, has_seggiolino, start_date, end_date } = req.body;
    const days = req.days;

    // Extract brand and model from moto_name
    const [brand, ...modelArray] = moto_name.split(' ');
    const model = modelArray.join(' ');

    try {
        // Fetch the moto ID based on brand and model
        const motoDetails = await db.query('SELECT id FROM moto WHERE brand = ? AND model = ?', [brand, model]);
        if (motoDetails.length > 0) {
            const moto_id = motoDetails[0].id; // Use the correct column name
            const hasFullInsurance = insurance_type === 'Full Protection';

            // Insert into the rental table
            await db.query(
                `INSERT INTO rental (user_id, start_date, end_date, price, moto_id, has_full_insurance, has_navetta, has_seggiolino, has_secondo_conducente)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [user_id, start_date, end_date, price, moto_id, hasFullInsurance, has_navetta, has_seggiolino, has_secondo_conducente]
            );
            res.redirect('/thankyou');
        } else {
            throw new Error('moto not found');
        }
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router
