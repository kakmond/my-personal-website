const express = require('express')
const router = express.Router()
// constants used for authentication
const USERNAME = "mond"
const PASSWORD = "mond123"

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

    if (username == USERNAME && password == PASSWORD) {
        req.session.isLoggedIn = true
        res.redirect("/")
    } else
        res.render('admins/login')
})

module.exports = router