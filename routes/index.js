const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');

// constants used for authentication
const USERNAME = 'mond'
const PASSWORD_HASH = "$2b$10$jv5.FNAxIt3fOXD4OReUjeQ8ge5jWBLP5Xd2EQd2qXckD.ALulM7y"

router.get('/', function (req, res) {
    res.render('homes/home')
})

router.get('/about', function (req, res) {
    res.render('homes/about')
})

router.get('/contact', function (req, res) {
    res.render('homes/contact')
})

router.get('/login/', function (req, res) {
    res.render('admins/login')
})

router.post('/login', function (req, res) {
    const username = req.body.username
    const password = req.body.password
    if (username == USERNAME)
        bcrypt.compare(password, PASSWORD_HASH, function (error, matched) {
            if (error)
                res.render('errors/error')
            else if (matched) {
                req.session.isLoggedIn = true
                res.redirect('/')
            }
            else
                res.render('admins/login', {
                    error: 'password is not matched!'
                })
        })
    else
        res.render('admins/login', {
            error: 'username is not matched!'
        })
})

router.post('/logout', function (req, res) {
    delete req.session.isLoggedIn;
    res.redirect('/')
})

module.exports = router