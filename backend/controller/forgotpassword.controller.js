const sgMail = require('@sendgrid/mail');
const uuid = require('uuid');
const bcrypt = require('bcrypt');


const User = require('../model/user.model');
const ForgotPassword = require('../model/forgotpassword.model');


const forgotpassword = async (req,res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({ where: {email}});
        if(user){
            const id = uuid.v4();
            user.createForgotpassword( {id, active: true })
            .catch(err => {
                throw new Error(err);
            })

        sgMail.setApiKey(process.env.SENDGRID_API_KEY)

        const msg = {
            to: email,
            from: 'rrishu212@gmail.com',
            subject: 'Expense Tracker ForgotPassword',
            text: 'You will click on the link below to reset password',
            html: `<a href="http://34.239.2.148//password/resetpassword/${id}">Reset password</a>`,
        }

        sgMail
        .send(msg)
        .then((response) => {
            return res.status(response[0].statusCode).json({message: 'Link to reset password sent to your mail', success: true})
        })
        .catch((error) => {
            throw new Error(error);
        }) 
    } else {
        throw new Error('User doesnt exist')
    }
    } catch (error) {
        console.error(error)
        return res.json({ message: error, sucess: false });
    }

}

const resetpassword = async (req,res) => {
    const id = req.params.id;
    await ForgotPassword.findOne({ where : { id }}).then(forgotpasswordrequest => {
        if(forgotpasswordrequest){
            forgotpasswordrequest.update({active: false});
            res.status(200).send(`
                <html>
                  <script>
                      function formsubmitted(e){
                        e.preventDefault();
                        console.log('called')
                      }
                  </script>

                  <form action='/password/updatepassword/${id}' method='get'>
                     <label for='newpassword'>Enter New Password</label>
                     <input name='newpassword' type='password' required></input>
                  </form>
                </html>
                `)

                res.end();
        }
    })
}

const updatepassword = async(req,res) => {
    try {
        const {newpassword} = req.query;
        const {resetpasswordid} = req.params;
        await ForgotPassword.findOne({ where: { id: resetpasswordid}}).then(resetpasswordrequest => {
            User.findOne({where : {id : resetpasswordrequest.userId}}).then(user => {
                console.log('userDetails', user)
                if(user) {
                    //encrypt the password 

                    const salt = 10;
                    bcrypt.genSalt(salt, function (err, salt){
                        if(err){
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function(err,hash) {
                            //Store hash in your password DB
                            if(err){
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({password: hash}).then(() => {
                                res.status(201).json({message: 'Successfully update the new password'})
                            })
                        })
                    })
                } else {
                    return res.status(404).json({ error: 'No user Exists', success: false})
                }
            })
        })
    } catch (error) {
        return res.status(403).json({ error, success: false } )
    }
}


module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword
}
