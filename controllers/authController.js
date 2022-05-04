const User = require('../models/userModel')
const bcrypt = require('bcryptjs')


exports.signUp = async(req, res) => {

  const {username, password} = req.body
  
  try{

    const hashpassword = await bcrypt.hash(password, 12)
    const newUser = await User.create({
      username,
      password: hashpassword
    })

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    })

  } catch (err) {
    res.status(400).json({
      status: 'failed signup',
      message: err.toString()
    })
  }
}

exports.login = async (req, res) => {
  const {username, password} = req.body

  try{
    
    const user = await User.findOne( {username} ) 

    if(!user){
      res.status(404).json({
        status: 'failed login',
        message: 'user not found'
      })
      return
    }

    const isCorrect = await bcrypt.compare(password, user.password)
    if(isCorrect){

      // req.session.user = user

      res.status(200).json({
        status: 'success',
        user: user
      })
    } else {
      res.status(400).json({
        status: 'failed login',
        message: 'incorrect username or password'
      })
    }

  } catch (err) {
    res.status(400).json({
      status: 'failed login catch',
      message: err.toString()
    })
  }
}