const { Op, fn, col } = require('sequelize');

const getDailyReport = async (req, res) => {
    try {
        if (req.user.ispremiumUser) {
            const date = req.body.date; // Get date from the request body
            console.log('Testing date:', date);
            
            const startDate = new Date(date + 'T00:00:00Z'); 
            const endDate = new Date(date + 'T23:59:59Z'); 
            
            console.log('Start Date:', startDate);
            console.log('End Date:', endDate);

            const data = await req.user.getExpenses({
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate 
                    }
                },
                attributes: ['description', 'expense', 'category','createdAt']
            });

            // Check if no expenses found
            if (data.length === 0) {
                console.log('No expenses found for the selected date.');
            }

            return res.json({ success: true, data });
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
            const today = new Date();
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday
            const endOfWeek = new Date(today.setDate(startOfWeek.getDate() + 6)); // Saturday

            console.log('Start of Week:', startOfWeek);
            console.log('End of Week:', endOfWeek);

            // Fetch expenses for the week
            const expenses = await req.user.getExpenses({
                where: {
                    createdAt: {
                        [Op.gte]: startOfWeek,
                        [Op.lte]: endOfWeek
                    }
                },
                attributes: ['description', 'expense','category', 'createdAt']
            });

            // Return expenses directly
            return res.json({ success: true, data: expenses }); // Ensure this is an array
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
            const { month } = req.body; 

            if (!month) {
                return res.status(400).json({ success: false, msg: "Month is required" });
            }

            const [year, monthNum] = month.split('-');
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 1);

            // Fetch monthly expenses
            const result = await req.user.getExpenses({
                attributes: [
                    'description', 
                    'expense', 
                    'category',
                    'createdAt'
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }
                },
                raw: true
            });

            return res.json({ success: true, data: result });
        } else {
            return res.status(403).json({ success: false, msg: "You are not a premium user" });
        }
    } catch (error) {
        console.error('Error fetching monthly report:', error);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};

const getYearlyReport = async (req, res) => {
    try {
        if (req.user.ispremiumUser) {
            const { year } = req.body;

            if (!year) {
                return res.status(400).json({ success: false, msg: "Year is required" });
            }

            const startYear = new Date(year, 0, 1);
            const endYear = new Date(parseInt(year) + 1, 0, 1);

            const result = await req.user.getExpenses({
                attributes: [
                    'description', 
                    'expense', 
                    'category',
                    'createdAt'
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startYear,
                        [Op.lt]: endYear
                    }
                },
                raw: true
            });

            return res.json({ success: true, data: result });
        } else {
            return res.status(403).json({ success: false, msg: "You are not a premium user" });
        }
    } catch (error) {
        console.error('Error fetching yearly report:', error);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};

module.exports = {
    getDailyReport,
    getMonthlyReport,
    getWeeklyReport,
    getYearlyReport
};
