const express = require('express')
const User = require('../models/userModel')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')

//uploading profile pic with multer
const upload = multer({
    dest: 'profileImage',//Images will stored in this folder
    limits:{
        fileSize: 5000000//max size of image is 5mb
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {//only jpg/jpeg/png images allowed
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    } 
})

//create user(register user)
router.post('/createuser', upload.single('profileImage'), async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

//login with existing user
router.post('/user/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
})

//logout user
router.post('/user/logout', auth, async(req, res) => {
    try{
        req.user.tokenes = req.user.tokens.filter((token) => {
            return token.token !== req.token 
        }) 
        await req.user.save()
        res.send()
    }catch(e){
        res.send(500).send()
    }
})

//logout from multiple login devices
router.post('/user/logoutAll', auth, async(req, res) => {
    try{
        req.user.token = []
        req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

//getallUsers
router.get('/getallusers', auth, async (req, res) => {
    try {
        const user = await User.find({})
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

//getUserById
router.get('/getuserbyid/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

//update user (only loged in user can update their details other user's details can not be updated)
router.patch('/user/me', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [ 'name', 'email', 'password', 'dob', 'phonenumber']
    const isvalidOperation = updates.every((update) => allowedUpdates.includes(update))
    if(!isvalidOperation){
        return res.status(400).send({error: 'Invalid updates!'})
    }
    try{
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user) 
    }catch(e){
        res.status(400).send(e)
    }
})

//delete user(user can delete its own profile)
router.delete('/user/me',  auth, async (req, res) => {
    try{
       await req.user.remove()
       res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

//userlist by their name filter
router.get('/usersByName', auth, async (req, res) => {
    try {
        const name = req.query.name; // Get the name parameter from the query string
        let users;
        if (name) {
            users = await User.find({ name: { $regex: name, $options: "i" } }); // Find users with the given name (case-insensitive)
        } else {
            users = await User.find({}); // Get all users if no name parameter is provided
        }
        res.send(users);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router