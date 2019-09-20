const path = require('path');
const express = require('express')
const expressHandlebars = require('express-handlebars')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const db = require('./db')
const app = express()
// register the handlebars-paginate helper with Handlebars:
const Handlebars = require('handlebars');
const paginate = require('handlebars-paginate');
Handlebars.registerHelper('paginate', paginate);
// constants used for pagination.
const QUESTION_PER_PAGE = 5
// constants used for validation of resources.
const QUESTION_MIN_LENGTH = 5
const QUESTION_MAX_LENGTH = 50

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

app.get('/questions', function (req, res) {
    const page = req.query.page || 1
    const beginIndex = (QUESTION_PER_PAGE * page) - QUESTION_PER_PAGE
    const endIndex = beginIndex + QUESTION_PER_PAGE
    db.getAllQuestions(function (error, questions) {
        if (error)
            res.render('error')
        else
            res.render("questions", {
                questions: questions.slice(beginIndex, endIndex),
                pagination: {
                    page: page,
                    pageCount: Math.ceil(questions.length / QUESTION_PER_PAGE)
                }
            })
    })
})

app.post('/questions', function (req, res) {
    const question = req.body.question
    const validationErrors = []
    if (question == "")
        validationErrors.push("Question must not be empty!")
    if (validationErrors.length == 0)
        db.createQuestion(question, function (error, id) {
            if (error)
                res.render('error')
            else
                res.redirect("/questions/")
        })
    else {
        // go back to the first page of questions with validation errors
        const page = 1
        const beginIndex = (QUESTION_PER_PAGE * page) - QUESTION_PER_PAGE
        const endIndex = beginIndex + QUESTION_PER_PAGE
        db.getAllQuestions(function (error, questions) {
            if (error)
                res.render('error')
            else
                res.render("questions", {
                    validationErrors,
                    questions: questions.slice(beginIndex, endIndex),
                    pagination: {
                        page: page,
                        pageCount: Math.ceil(questions.length / QUESTION_PER_PAGE)
                    }
                })
        })
    }
})

app.get('/questions/:id', function (req, res) {
    const id = req.params.id
    db.getQuestionById(id, function (error, question) {
        if (error)
            res.render('error')
        else
            res.render('question', {
                question
            })
    })
})

app.put('/questions/:id', function (req, res) {
    const id = req.params.id
    const answer = req.body.answer
    db.updateAnswerById(id, answer, function (error, questionExisted) {
        if (error || !questionExisted)
            res.render('error')
        else
            res.redirect("/questions/" + id)
    })
})

app.delete('/questions/:id', function (req, res) {
    const id = req.params.id
    db.deleteQuestionById(id, function (error, questionExisted) {
        if (error || !questionExisted)
            res.render('error')
        else
            res.redirect("/questions/")
    })
})

app.listen(3000)
