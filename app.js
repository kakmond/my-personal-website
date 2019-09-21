const path = require('path');
const express = require('express')
const expressHandlebars = require('express-handlebars')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const db = require('./db')
const app = express()

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/upload/');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});
var upload = multer({ storage: storage })
// register the handlebars-paginate helper with Handlebars:
const Handlebars = require('handlebars');
const paginate = require('handlebars-paginate');
Handlebars.registerHelper('paginate', paginate);
// constants used for pagination.
const QUESTION_PER_PAGE = 5
const BLOG_PER_PAGE = 3
// constants used for validation of resources.
const QUESTION_MIN_LENGTH = 5
const QUESTION_MAX_LENGTH = 100
const TITLE_MIN_LENGTH = 5
const TITLE_MAX_LENGTH = 50
const CAPTION_MIN_LENGTH = 20
const CAPTION_MAX_LENGTH = 75
const CONTENT_MIN_LENGTH = 20
const CONTENT_MAX_LENGTH = 500

app.engine("hbs", expressHandlebars({
    extname: 'hbs',
    defaultLayout: 'layout',
    helpers: require("./public/javascripts/helpers"),
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
    const validationErrors = []
    const question = req.body.question

    if (question.length < QUESTION_MIN_LENGTH)
        validationErrors.push("Question is too short!")
    else if (question.length > QUESTION_MAX_LENGTH)
        validationErrors.push("Question is too long!")

    if (validationErrors.length == 0) {
        const questionObject = {
            question,
            answer: ""
        }
        db.createQuestion(questionObject, function (error, id) {
            if (error)
                res.render('error')
            else
                res.redirect("/questions/")
        })
    }
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

app.get('/blogposts', function (req, res) {
    const page = req.query.page || 1
    const beginIndex = (BLOG_PER_PAGE * page) - BLOG_PER_PAGE
    const endIndex = beginIndex + BLOG_PER_PAGE

    db.getAllBlogs(function (error, blogs) {
        if (error)
            res.render('error')
        else
            res.render("blogs", {
                blogs: blogs.slice(beginIndex, endIndex),
                pagination: {
                    page: page,
                    pageCount: Math.ceil(blogs.length / BLOG_PER_PAGE)
                }
            })
    })
})

app.get('/blogposts/:id', function (req, res) {
    const id = req.params.id

    db.getBlogById(id, function (error, blog) {
        if (error)
            res.render('error')
        else
            res.render('blog', {
                blog
            })
    })
})

app.get('/createBlog/', function (req, res) {
    res.render('createBlog')
})

app.post('/createBlog', upload.single('image'), function (req, res) {
    const validationErrors = []
    const title = req.body.title
    const file = req.file
    const caption = req.body.caption
    const content = req.body.content

    if (!file)
        validationErrors.push("Please upload image file.")

    if (title.length < TITLE_MIN_LENGTH)
        validationErrors.push("Title is too short.")
    else if (title.length > TITLE_MAX_LENGTH)
        validationErrors.push("Title is too long.")

    if (caption.length < CAPTION_MIN_LENGTH)
        validationErrors.push("Caption is too short.")
    else if (caption.length > CAPTION_MAX_LENGTH)
        validationErrors.push("Caption is too long.")

    if (content.length < CONTENT_MIN_LENGTH)
        validationErrors.push("Content is too short.")
    else if (content.length > CONTENT_MAX_LENGTH)
        validationErrors.push("Content is too long.")

    if (validationErrors.length == 0) {
        const blogObject = {
            title,
            image: file.path.replace(/^public/, ''),
            caption,
            content,
            timestamp: new Date().getTime()
        }
        db.createBlog(blogObject, function (error, id) {
            if (error)
                res.render('error')
            else
                res.redirect("/blogposts/" + id)
        })
    }
    else {
        res.render("createBlog", {
            validationErrors,
            title,
            caption,
            content,
        })
    }
})

app.listen(3000)
