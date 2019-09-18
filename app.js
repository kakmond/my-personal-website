const path = require('path');
const express = require('express')
const expressHandlebars = require('express-handlebars')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')

const app = express()

app.engine("hbs", expressHandlebars({
    extname: 'hbs',
    defaultLayout: 'layout',
    partialsDir: __dirname + '/views/partials/',
    helpers: __dirname + "./public/helpers/",
}))
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: false
}))
// add a method override middleware to support PUT and DELETE in HTML form.
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

app.get('/', function (req, res) {
    res.render('home')
})

app.get('/about', function (req, res) {
    res.render('about')
})

app.get('/contact', function (req, res) {
    res.render('contact')
})

app.get('/faqs', function (req, res) {
    res.render('faqs')
})

app.get('/faqs/:id', function (req, res) {
    res.render('faq')
})

app.put('/faqs/:id', function (req, res) {
    console.log(req.body)
    res.render('faq')
})

app.post('/faq/:id', function (req, res) {
    console.log(req.body)
    res.render('faqs')
})

app.listen(3000)
