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
const QUESTION_PER_PAGE = 3
const BLOG_PER_PAGE = 3
const PORTFOLIO_PER_PAGE = 3
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

app.get('/createQuestion/', function (req, res) {
    res.render('createQuestion')
})

app.post('/createQuestion/', function (req, res) {
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
    else
        res.render("createQuestion", {
            validationErrors,
            question,
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

app.get('/blogs', function (req, res) {
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

app.get('/blogs/:id', function (req, res) {
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
                res.redirect("/blogs/" + id)
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

app.get('/editBlog/:id', function (req, res) {
    const id = req.params.id

    db.getBlogById(id, function (error, blog) {
        if (error)
            res.render('error')
        else
            res.render('editBlog', {
                blog
            })
    })
})

app.post('/editBlog/:id', upload.single('image'), function (req, res) {
    const id = req.params.id
    const validationErrors = []
    const title = req.body.title
    const originalFile = req.body.originalFile
    const file = req.file
    const caption = req.body.caption
    const content = req.body.content

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

    const blog = {
        id,
        title,
        image: file ? file.path.replace(/^public/, '') : originalFile,
        caption,
        content,
    }
    if (validationErrors.length == 0)
        db.updateBlogById(id, blog, function (error, portfolioExisted) {
            if (error || !portfolioExisted)
                res.render('error')
            else
                res.redirect("/blogs/" + id)
        })
    else
        res.render("editBlog", {
            validationErrors,
            blog
        })
})

app.get('/portfolios/', function (req, res) {
    const page = req.query.page || 1
    const beginIndex = (PORTFOLIO_PER_PAGE * page) - PORTFOLIO_PER_PAGE
    const endIndex = beginIndex + PORTFOLIO_PER_PAGE

    db.getAllPortfolios(function (error, portfolios) {
        if (error)
            res.render('error')
        else
            res.render("portfolios", {
                portfolios: portfolios.slice(beginIndex, endIndex),
                pagination: {
                    page: page,
                    pageCount: Math.ceil(portfolios.length / PORTFOLIO_PER_PAGE)
                }
            })
    })
})

app.get('/portfolios/:id', function (req, res) {
    const id = req.params.id

    db.getPortfolioById(id, function (error, portfolio) {
        if (error)
            res.render('error')
        else
            res.render('portfolio', {
                portfolio
            })
    })
})


app.get('/editPortfolio/:id', function (req, res) {
    const id = req.params.id

    db.getPortfolioById(id, function (error, portfolio) {
        if (error)
            res.render('error')
        else
            res.render('editPortfolio', {
                portfolio,
            })
    })
})

app.post('/editPortfolio/:id', upload.single('image'), function (req, res) {
    const validationErrors = []
    const id = req.params.id
    const title = req.body.title
    const originalFile = req.body.originalFile
    const file = req.file
    const caption = req.body.caption
    const description = req.body.description
    const date = new Date(req.body.date)
    const today = new Date()

    if (date == "Invalid Date")
        validationErrors.push("Please input project's date.")
    else if (date > today)
        validationErrors.push("You cannot enter a date in the future!")

    if (title.length < TITLE_MIN_LENGTH)
        validationErrors.push("Title is too short.")
    else if (title.length > TITLE_MAX_LENGTH)
        validationErrors.push("Title is too long.")

    if (caption.length < CAPTION_MIN_LENGTH)
        validationErrors.push("Caption is too short.")
    else if (caption.length > CAPTION_MAX_LENGTH)
        validationErrors.push("Caption is too long.")

    if (description.length < CONTENT_MIN_LENGTH)
        validationErrors.push("Description is too short.")
    else if (description.length > CONTENT_MAX_LENGTH)
        validationErrors.push("Description is too long.")

    const portfolio = {
        id,
        title,
        image: file ? file.path.replace(/^public/, '') : originalFile,
        caption,
        description,
        timestamp: date.getTime()
    }

    if (validationErrors.length == 0) {
        db.updatePortfolioById(id, portfolio, function (error, portfolioExisted) {
            if (error || !portfolioExisted)
                res.render('error')
            else
                res.redirect("/portfolios/" + id)
        })
    }
    else
        res.render("editPortfolio", {
            validationErrors,
            portfolio
        })
})

app.post('/deleteBlog/:id', function (req, res) {
    const id = req.params.id

    db.deleteBlogById(id, function (error, blogExisted) {
        if (error || !blogExisted)
            res.render('error')
        else
            res.redirect("/blogs/")
    })
})

app.post('/deletePortfolio/:id', function (req, res) {
    const id = req.params.id

    db.deletePortfolioById(id, function (error, portfolioExisted) {
        if (error || !portfolioExisted)
            res.render('error')
        else
            res.redirect("/portfolios/")
    })
})

app.get('/createPortfolio/', function (req, res) {
    res.render('createPortfolio')
})

app.post('/createPortfolio', upload.single('image'), function (req, res) {
    const validationErrors = []
    const title = req.body.title
    const file = req.file
    const caption = req.body.caption
    const description = req.body.description
    const date = new Date(req.body.date)
    const today = new Date()

    if (date == "Invalid Date")
        validationErrors.push("Please input project's date.")
    else if (date > today)
        validationErrors.push("You cannot enter a date in the future!")

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

    if (description.length < CONTENT_MIN_LENGTH)
        validationErrors.push("Description is too short.")
    else if (description.length > CONTENT_MAX_LENGTH)
        validationErrors.push("Description is too long.")

    if (validationErrors.length == 0) {
        const portfolioObject = {
            title,
            image: file.path.replace(/^public/, ''),
            caption,
            description,
            timestamp: date.getTime()
        }
        db.createPortfolio(portfolioObject, function (error, id) {
            if (error)
                res.render('error')
            else
                res.redirect("/portfolios/" + id)
        })
    }
    else
        res.render("createPortfolio", {
            validationErrors,
            title,
            caption,
            description,
            date: req.body.date
        })
})


app.listen(3000)
