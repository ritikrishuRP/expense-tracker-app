const sgMail = require('@sendgrid/mail');

const User = require('../model/user.model');



const forgotpassword = async (req,res) => {
    try {
        const {email} = req.body;
        // const user = await User.finOne({ where: {email}});

        sgMail.setApiKey(process.env.SENDGRID_API_KEY)

        const msg = {
            to: email,
            from: 'rrishu212@gmail.com',
            subject: 'Expense Tracker ForgotPassword',
            text: 'You will click on the link below to reset password'
        }

        sgMail
        .send(msg)
        .then((response) => {
            return res.status(response[0].statusCode).json({message: 'Link to reset password sent to your mail', success: true})
        })
        .catch((error) => {
            throw new Error(error);
        })
    } catch (error) {
        console.error(error)
        return res.json({ message: error, sucess: false });
    }

}

module.exports = {
    forgotpassword
}
