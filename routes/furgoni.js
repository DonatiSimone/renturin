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
    res.render('furgoni/furgoni', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Furgoni",
        errorMessage: errorMessage
    })
})

router.post('/sceltafurgone', ensureAuthenticated, calculateDays, (req, res) => {
    const { user_id, start_date, end_date, age } = req.body;

    // Convert dates to Date objects
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    const days = req.days;

    if (startTimestamp >= endTimestamp) {
        return res.render('furgoni/furgoni', {
            user_id: req.user.id,
            start_date,
            end_date,
            days: days,
            age,
            user: req.user,
            authenticated: req.isAuthenticated(),
            title: "Furgoni",
            errorMessage: "La data di fine noleggio non può essere uguale o antecedente a quella di inizio."
        });

    }

    res.render('furgoni/sceltafurgone', {
        user_id: req.user.id,
        start_date,
        end_date,
        age,
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Scelta Furgone",
        errorMessage: ""
    });
});

router.get('/sceltafurgone/polizzafurgone', ensureAuthenticated, (req, res) => {
    res.render('furgoni/polizzafurgone', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Polizza Furgone"
    })
})

router.post('/sceltafurgone/polizzafurgone', ensureAuthenticated, calculateDays, (req, res) => {
    const { user_id, furgone_name, start_date, end_date, age } = req.body;
    const days = req.days;
    res.render('furgoni/polizzafurgone', {
        user_id: req.user.id,
        furgone_name,
        start_date,
        end_date,
        days,
        age,
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Polizza Furgone"
    })
})

router.get('/sceltafurgone/polizzafurgone/opzioniaggiuntivefurgoni', ensureAuthenticated, (req, res) => {
    res.render('furgoni/opzioniaggiuntivefurgoni', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Opzioni Aggiuntive Furgoni"
    })
})

router.post('/sceltafurgone/polizzafurgone/opzioniaggiuntivefurgoni', ensureAuthenticated, calculateDays, async (req, res) => {
    const { user_id, furgone_name, start_date, end_date, age, insurance_type } = req.body;
    const days = req.days;

    try {
        // Split furgone_name into brand and model
        const [brand, ...modelArray] = furgone_name.split(' ');
        const model = modelArray.join(' ');

        const furgoneDetails = await db.query('SELECT * FROM furgoni WHERE brand = ? AND model = ?', [brand, model]);

        if (furgoneDetails.length > 0) {
            const furgone = furgoneDetails[0];

            res.render('furgoni/opzioniaggiuntivefurgoni', {
                user_id: req.user.id,
                furgone_name: `${furgone.brand} ${furgone.model}`, // Pass the furgone name in 'Brand Model' format
                furgone_image: furgone.image_path,
                start_date,
                end_date,
                days,
                age,
                insurance_type,
                user: req.user,
                authenticated: req.isAuthenticated(),
                title: "Opzioni Aggiuntive furgoni"
            });
        } else {
            res.status(404).send("Furgone not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/sceltafurgone/polizzafurgone/opzioniaggiuntivefurgoni/riepilogofurgone', ensureAuthenticated, (req, res) => {
    res.render('furgoni/riepilogofurgone', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Riepilogo Furgone"
    })
})

router.post('/sceltafurgone/polizzafurgone/opzioniaggiuntivefurgoni/riepilogofurgone', ensureAuthenticated, calculateDays, async (req, res) => {
    const { user_id, furgone_name, start_date, end_date, age, insurance_type, has_navetta, has_secondo_conducente, has_seggiolino } = req.body;
    const days = req.days;
    try {
        // Split furgone_name into brand and model
        const [brand, ...modelArray] = furgone_name.split(' ');
        const model = modelArray.join(' ');

        const furgoneDetails = await db.query('SELECT * FROM furgoni WHERE brand = ? AND model = ?', [brand, model]);
        const daily_price = await db.query('SELECT price FROM furgoni WHERE brand = ? AND model = ?', [brand, model]);
        const price = daily_price[0].price;
        const finalPrice = (price * days) + (insurance_type ? 15 * days : 0) + (has_navetta ? 15 : 0) + (has_secondo_conducente ? 40 : 0) + (has_seggiolino ? 20 : 0);

        if (furgoneDetails.length > 0) {
            const furgone = furgoneDetails[0];

            res.render('furgoni/riepilogofurgone', {
                user_id: req.user.id,
                furgone_name: `${furgone.brand} ${furgone.model}`, // Pass the furgone name in 'Brand Model' format
                furgone_image: furgone.image_path,
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
            res.status(404).send("furgone not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/sceltafurgone/polizzafurgone/opzioniaggiuntivefurgoni/riepilogofurgone/confermaNoleggioFurgone', ensureAuthenticated, calculateDays, async (req, res) => {
    const { user_id, furgone_name, price, insurance_type, has_navetta, has_secondo_conducente, has_seggiolino, start_date, end_date } = req.body;
    const days = req.days;

    // Extract brand and model from furgone_name
    const [brand, ...modelArray] = furgone_name.split(' ');
    const model = modelArray.join(' ');

    try {
        const furgoneDetails = await db.query('SELECT id FROM furgoni WHERE brand = ? AND model = ?', [brand, model]);
        if (furgoneDetails.length > 0) {
            const furgone_id = furgoneDetails[0].id;
            const hasFullInsurance = insurance_type === 'Full Protection';

            // Insert into the rental table
            await db.query(
                `INSERT INTO rental (user_id, start_date, end_date, price, furgone_id, has_full_insurance, has_navetta, has_seggiolino, has_secondo_conducente)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [user_id, start_date, end_date, price, furgone_id, hasFullInsurance, has_navetta, has_seggiolino, has_secondo_conducente]
            );

            res.redirect('/thankyou');
        } else {
            throw new Error('furgone not found');
        }
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router
