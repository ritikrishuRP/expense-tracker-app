const Razorpay = require('razorpay');
const Order = require('../model/order.model');

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
    try {
        const { payment_id, order_id } = req.body;

        // Find the order based on the order_id
        Order.findOne({ where: { orderid: order_id } })
            .then(order => {
                // Create two promises: one for updating the order and one for updating the user
                const updateOrderPromise = order.update({ paymentid: payment_id, status: 'SUCCESSFUL' });
                const updateUserPromise = req.user.update({ ispremiumUser: true });

                // Use Promise.all to run both update operations in parallel
                return Promise.all([updateOrderPromise, updateUserPromise]);
            })
            .then(() => {
                // Once both updates are successful, send the response
                return res.status(202).json({
                    success: true,
                    message: "Transaction Successful"
                });
            })
            .catch(err => {
                // Handle any error that occurs in the promises
                console.error("Error updating transaction:", err);
                return res.status(500).json({
                    success: false,
                    message: "Transaction failed",
                    error: err.message
                });
            });

    } catch (error) {
        // Catch synchronous errors
        console.error("Error in updateTransactionStatus:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


module.exports = {
    purchasePremium,
    updateTransactionStatus
}