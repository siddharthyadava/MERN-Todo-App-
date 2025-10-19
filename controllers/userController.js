const userModel = require("../models/userModel");
const bcrypt = require('bcryptjs')

//REGISTER
const registerController = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        //validation
        if(!username || !email || !password) {
            return res.status(500).send({
                success: false,
                message: "Please provide all fields"
            })
        }
        //check existing user
        const existingUser = await userModel.findOne({email})
        if(existingUser) {
            return res.status(500).send({
                success: false,
                message: "user already exist"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //save user
        const newUser = new userModel({username, email, password:hashedPassword});
        await newUser.save();

        res.status(201).send({
            success: true,
            message: 'User Registered Successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Register API",
            error
        })
    }
};
 
//LOGIN
const loginController = async (req, res) => {
    try {
        const {email, password} = req.body;
        //find user
        const user = await userModel.findOne({email})
        //validation
        if(!user) {
            return res.status(404).send({
                success: false,
                message: "Invalid Email or Password"
            })
        }
        //match password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(500).send({
                success: false,
                message: "Invalid Credentials"
            })
        }
        res.status(200).send({
            success: true,
            message: "Login successfully",
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "login API",
            error
        })
    }
}

module.exports = { registerController, loginController };