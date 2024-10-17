const { Op, fn, col } = require('sequelize');
const sequelize = require('../util/database'); // Adjust this import if needed
const User = require('../model/user.model'); // Import your User model if needed

const getDailyReport = async (req, res) => {
    try {
        if (req.user.ispremiumUser) {
            // Hardcoded date for testing
            const date = '2024-10-15'; // Change this to the date you are testing
            console.log('Testing date:', date);
            
            // Convert date to start and end of the day
            const startDate = new Date(date + 'T00:00:00Z'); // Adjust for UTC
            const endDate = new Date(date + 'T23:59:59Z'); // Adjust for UTC
            
            console.log('Start Date:', startDate);
            console.log('End Date:', endDate);

            // Fetch expenses for the specified date
            const data = await req.user.getExpenses({
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate // Change to lte to include end of the day
                    }
                },
                attributes: ['description', 'expense', 'createdAt']
            });

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
                attributes: ['description', 'expense', 'createdAt']
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



// Helper function to format the weekly report remains the same


// Helper function to format the weekly report


const getMonthlyReport = async (req, res) => {
    try {
        if (req.user.ispremiumUser) {
            const { month } = req.body; // Expected format: 'YYYY-MM'

            if (!month) {
                return res.status(400).json({ success: false, msg: "Month is required" });
            }

            const [year, monthNum] = month.split('-');
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 1);

            // Fetch expenses grouped by date
            const result = await req.user.getExpenses({
                attributes: [
                    [fn('DATE', col('createdAt')), 'date'],
                    [fn('SUM', col('expense')), 'totalAmount']
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }
                },
                group: [fn('DATE', col('createdAt'))],
                raw: true
            });

            return res.json(result);
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
            const { year } = req.body; // Expected format: 'YYYY'

            if (!year) {
                return res.status(400).json({ success: false, msg: "Year is required" });
            }

            const startYear = new Date(year, 0, 1);
            const endYear = new Date(parseInt(year) + 1, 0, 1);

            // Fetch expenses grouped by month name
            const result = await req.user.getExpenses({
                attributes: [
                    [fn('MONTHNAME', col('createdAt')), 'month'],
                    [fn('SUM', col('expense')), 'totalAmount']
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startYear,
                        [Op.lt]: endYear
                    }
                },
                group: [fn('MONTHNAME', col('createdAt'))],
                raw: true
            });

            return res.json(result);
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