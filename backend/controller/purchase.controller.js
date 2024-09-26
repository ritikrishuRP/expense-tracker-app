const Razorpay = require('razorpay');
const Order = require('../model/order.model');
const userController = require('../controller/user.controller');


const purchasePremium = async (req, res) => {
    try {
        var rzp = new Razorpay({
            key_id: 'rzp_test_6mibziaNEsM9ew',
            key_secret: 'lg6qn1Rd41cEwK46Q909Lczg'
        })
        const amount = 2500;

        rzp.orders.create({amount, currency: 'INR'}, (err, order) => {
            if(err){
                console.log("Raw Error:", err);
            }
            req.user.createOrder({ orderid: order.id, status: 'PENDING'}).then(() => {
                return res.status(201).json({order, key_id: rzp.key_id});
            }).catch(err => {
                throw new Error(err)
            })
        })
    } catch (error) {
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err})
    }
}

const updateTransactionStatus = (req, res) => {
    const { payment_id, order_id } = req.body;
    const userId = req.user.id;

    Order.findOne({ where: { orderid: order_id } })
        .then(order => {
            const updateOrderPromise = order.update({ paymentid: payment_id, status: 'SUCCESSFUL' });
            const updateUserPromise = req.user.update({ ispremiumUser: true });

            return Promise.all([updateOrderPromise, updateUserPromise]);
        })
        .then(() => {
            return res.status(202).json({
                success: true,
                message: "Transaction Successful",
                token: userController.generateAccessToken(userId, req.user.name, true) // Ensure token is updated to premium
            });
        })
        .catch(err => {
            console.error("Error updating transaction:", err);
            return res.status(500).json({
                success: false,
                message: "Transaction failed",
                error: err.message
            });
        });
};


module.exports = {
    purchasePremium,
    updateTransactionStatus
}