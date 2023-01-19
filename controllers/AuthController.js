const User = require('../models/User')

const bcrypt = require('bcryptjs')
const { unsubscribe } = require('../routes/authRoutes')

module.exports = class AuthController {

    static login(req, res) {
        res.render('auth/login')
    }

    static register(req, res){
        res.render('auth/register')
    }

    static async registerPost(req,res){

        const {name, email, password, confirmpassword} = req.body

        //password match validation
        if(password != confirmpassword){
            req.flash('message', 'A senhas não conferem, tente novamente')
            res.render('auth/register')
            return
        }

        // check if user exists
        const checkIfUserExist = await User.findOne({where: {email: email}})

        if(checkIfUserExist){
            req.flash('message', 'O email ja existe')
            res.render('auth/register')

            return
        }

        //create password
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password, salt)

        const user = {
            name,
            email,
            password: hashedPassword
        }

        try{
            const createdUser = await User.create(user)

            //initialize session
            req.session.userid = createdUser.id

            req.flash('message', 'Cadastro feito com sucesso')

            req.session.save(() =>{
                res.redirect('/')
            })

        } catch(err){
            console.log(err)

        }
    }

    static logout(req, res){
        req.session.destroy()
        res.redirect('/login')
    }
}