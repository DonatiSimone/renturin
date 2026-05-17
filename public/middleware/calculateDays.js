const calculateDays = (req, res, next) => {
    const { start_date, end_date } = req.body;

    if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        const startTimestamp = startDate.getTime();
        const endTimestamp = endDate.getTime();

        req.days = (endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24);
    } else {
        req.days = null;
    }

    next();
};

module.exports = calculateDays;
