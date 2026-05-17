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
    res.render('auto/auto', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Auto",
        errorMessage: errorMessage
    });
});

router.get('/sceltaveicolo', ensureAuthenticated, (req, res) => {
    res.render('auto/sceltaveicolo', {
        user_id: req.user.id,
        start_date,
        end_date,
        age,
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Scelta Auto"
    })
})


router.post('/sceltaveicolo', ensureAuthenticated, calculateDays, async (req, res) => {
    const { user_id, start_date, end_date, age } = req.body;

    // Convert dates to Date objects
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    const days = req.days;

    if (startTimestamp >= endTimestamp) {
        return res.render('auto/auto', {
            user_id: req.user.id,
            start_date,
            end_date,
            days: days,
            age,
            user: req.user,
            authenticated: req.isAuthenticated(),
            title: "Auto",
            errorMessage: "La data di fine noleggio non può essere uguale o antecedente a quella di inizio."
        });

    }

    res.render('auto/sceltaveicolo', {
        user_id: req.user.id,
        start_date,
        end_date,
        age,
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Scelta Auto",
        errorMessage: ""
    });
});


router.post('/sceltaveicolo/polizzaAuto', ensureAuthenticated, calculateDays, (req, res) => {
    const { user_id, car_name, start_date, end_date, age } = req.body;
    const days = req.days;
    res.render('auto/polizzaAuto', {
        user_id: req.user.id,
        car_name,
        start_date,
        end_date,
        days,
        age,
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Polizza Auto"
    })
})

router.get('/sceltaveicolo/polizzaAuto/opzioniaggiuntive', ensureAuthenticated, (req, res) => {
    res.render('auto/opzioniaggiuntive', {
        user: req.user,
        authenticated: req.isAuthenticated(),
        title: "Opzioni Aggiuntive Auto"
    })
})


router.post('/sceltaveicolo/polizzaAuto/opzioniaggiuntive', ensureAuthenticated, calculateDays, async (req, res) => {
    const { user_id, car_name,  start_date, end_date, age, insurance_type } = req.body;
    const days = req.days;

    try {
        // Split car_name into brand and model
        const [brand, ...modelArray] = car_name.split(' ');
        const model = modelArray.join(' ');

        const carDetails = await db.query('SELECT * FROM auto WHERE brand = ? AND model = ?', [brand, model]);

        if (carDetails.length > 0) {
            const car = carDetails[0];

            res.render('auto/opzioniaggiuntive', {
                user_id: req.user.id,
                car_name: `${car.brand} ${car.model}`, // Pass the car name in 'Brand Model' format
                car_image: car.image_path,
                start_date,
                end_date,
                days,
                age,
                insurance_type,
                user: req.user,
                authenticated: req.isAuthenticated(),
                title: "Opzioni Aggiuntive Auto"
            });
        } else {
            res.status(404).send("Car not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});



router.post('/sceltaveicolo/polizzaAuto/opzioniaggiuntive/riepilogoauto', ensureAuthenticated, calculateDays, async (req, res) => {
    const { user_id, car_name, start_date, end_date, age, insurance_type, has_navetta, has_secondo_conducente, has_seggiolino } = req.body;
    const days = req.days;

    try {
        // Split car_name into brand and model
        const [brand, ...modelArray] = car_name.split(' ');
        const model = modelArray.join(' ');

        const carDetails = await db.query('SELECT * FROM auto WHERE brand = ? AND model = ?', [brand, model]);
        const daily_price = await db.query('SELECT price FROM auto WHERE brand = ? AND model = ?', [brand, model]);
        const price = daily_price[0].price;
        const finalPrice = (price * days) + (insurance_type ? 15 * days : 0) + (has_navetta ? 15 : 0) + (has_secondo_conducente ? 40 : 0) + (has_seggiolino ? 20 : 0);

        if (carDetails.length > 0) {
            const car = carDetails[0];

            res.render('auto/riepilogoauto', {
                user_id: req.user.id,
                car_name: `${car.brand} ${car.model}`, // Pass the car name in 'Brand Model' format
                car_image: car.image_path,
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
            res.status(404).send("Car not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/sceltaveicolo/polizzaAuto/opzioniaggiuntive/riepilogoauto/confermaNoleggio', ensureAuthenticated, calculateDays, async (req, res) => {
    const { user_id, car_name, price, finalPrice, insurance_type, has_navetta, has_secondo_conducente, has_seggiolino, start_date, end_date } = req.body;
    const [brand, ...modelArray] = car_name.split(' ');
    const model = modelArray.join(' ');

    try {
        const carDetails = await db.query('SELECT id FROM auto WHERE brand = ? AND model = ?', [brand, model]);
        if (carDetails.length > 0) {
            const car_id = carDetails[0].id;
            const hasFullInsurance = insurance_type === 'Full Protection';

            // Insert into the rental table
            await db.query(
                `INSERT INTO rental (user_id, start_date, end_date, auto_id, price, has_full_insurance, has_navetta, has_seggiolino, has_secondo_conducente)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [user_id, start_date, end_date, car_id, price, hasFullInsurance, has_navetta, has_seggiolino, has_secondo_conducente]
            );

            res.redirect('/thankyou');
        } else {
            throw new Error('Car not found');
        }
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router


