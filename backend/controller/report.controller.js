const {Op, literal, fn} = require('sequelize')

const getDailyReport = async (req, res) => {
    try {
        if (req.user.ispremiumUser) {
            const date = req.body.date; // Expected format: 'YYYY-MM-DD'

            // Fetch expenses for the specified date
            const data = await req.user.getExpenses({
                where: { createdAt: date },
                attributes: ['description', 'expense', 'createdAt'], // Specify required fields
            });

            return res.json(data);
        } else {
            return res.status(403).json({ success: false, msg: "You are not a premium user" });
        }
    } catch (error) {
        console.error('Error fetching daily report:', error);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};

const getWeeklyReport = async (req, res) => {
    try {
        if (req.user.ispremiumUser) {
            const currentDate = new Date();
            const pastDate = new Date();
            pastDate.setDate(currentDate.getDate() - 7); // 7 days ago

            // Fetch expenses grouped by day name
            const result = await req.user.getExpenses({
                attributes: [
                    [fn('DAYNAME', literal('createdAt')), 'day'],
                    [fn('SUM', literal('expense')), 'totalAmount']
                ],
                where: {
                    createdAt: {
                        [Op.gt]: pastDate
                    }
                },
                group: [fn('DAYNAME', literal('createdAt'))],
                raw: true, // Returns plain objects
            });

            return res.json(result);
        } else {
            return res.status(403).json({ success: false, msg: "You are not a premium user" });
        }
    } catch (error) {
        console.error('Error fetching weekly report:', error);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};

const getMonthlyReport = async (req, res) => {
    try {
        if (req.user.ispremiumUser) {


            const month = req.body.month;
            const startDate = new Date(month);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
            const result = await req.user.getExpenses({
                attributes : [
                    [fn('DATE' , literal('createdAt')) , 'date'],
                    [literal('SUM(expense)') , 'totalAmount']
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate

                    }
                },
                group: [fn('DATE' , literal('createdAt'))]
            })
            return res.json(result)
        } else {
            return res.status(403).json({ success: false, msg: "you are not a premium user" })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, msg: "Internal server error" })
    }
}

const getYearlyReport = async (req, res) => {
    try {
        if (req.user.ispremiumUser) {


            const year = req.body.year;
            const startYear = new Date(year)
            const endYear = new Date(startYear.getFullYear() + 1, 0, 1)
            const result = await req.user.getExpenses({
                attributes: [
                    [fn('MONTHNAME',literal('createdAt')), 'month'],
                    [literal('SUM(expense)'), 'totalAmount'],
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startYear,
                        [Op.lt]: endYear,
                    },
                },
                group: [fn('MONTHNAME',literal('createdAt'))],
                raw: true,
            });
            return res.json(result)
        } else {
            return res.status(403).json({ success: false, msg: "you are not a premium user" })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, msg: "Internal server error" })
    }
}

module.exports = {
    getDailyReport,
    getMonthlyReport,
    getWeeklyReport,
    getYearlyReport
}

