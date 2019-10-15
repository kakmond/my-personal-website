const express = require('express')
const db = require('./../db')
const router = express.Router()
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage })

// constants used for pagination.
const PORTFOLIO_PER_PAGE = 3
// constants used for validation of resources.
const TITLE_MIN_LENGTH = 5
const TITLE_MAX_LENGTH = 50
const CAPTION_MIN_LENGTH = 20
const CAPTION_MAX_LENGTH = 75
const CONTENT_MIN_LENGTH = 20
const CONTENT_MAX_LENGTH = 500

router.get('/', function (req, res) {
    const search = req.query.search
    const fromDate = req.query.fromDate
    const toDate = req.query.toDate
    const validationErrors = []
    const fromDateObject = new Date(fromDate)
    const toDateObject = new Date(toDate)
    const page = req.query.page || 1
    const beginIndex = (PORTFOLIO_PER_PAGE * page) - PORTFOLIO_PER_PAGE
    const endIndex = beginIndex + PORTFOLIO_PER_PAGE

    if (fromDate || toDate)
        if (fromDateObject == "Invalid Date")
            validationErrors.push("Please input fromDate")
        else if (toDateObject == "Invalid Date")
            validationErrors.push("Please input toDate")
        else if (fromDateObject > toDateObject)
            validationErrors.push("toDate must be greater than the fromDate")

    db.getAllPortfolios(function (error, portfolios) {
        if (error)
            res.render('errors/500')
        else {
            if (validationErrors.length == 0) {
                if (search)
                    portfolios = portfolios.filter(function (element) {
                        return element.title.includes(search)
                            || element.caption.includes(search)
                            || element.description.includes(search)
                    })
                if (fromDateObject != "Invalid Date")
                    portfolios = portfolios.filter(function (element) {
                        const portfolioDate = new Date(element.timestamp)
                        portfolioDate.setUTCHours(0, 0, 0, 0) // initialize a blog date to midnight 
                        return portfolioDate > fromDateObject
                            || +portfolioDate === +fromDateObject
                    })
                if (toDateObject != "Invalid Date")
                    portfolios = portfolios.filter(function (element) {
                        const portfolioDate = new Date(element.timestamp)
                        portfolioDate.setUTCHours(0, 0, 0, 0) // initialize a blog date to midnight 
                        return portfolioDate < toDateObject
                            || +portfolioDate === +toDateObject
                    })
            }
            res.render("portfolios/portfolios", {
                portfolios: portfolios.slice(beginIndex, endIndex),
                pagination: {
                    page: page,
                    pageCount: Math.ceil(portfolios.length / PORTFOLIO_PER_PAGE)
                },
                validationErrors,
                search,
                toDate,
                fromDate
            })
        }

    })
})

router.get('/create/', function (req, res) {
    if (!res.locals.isLoggedIn)
        res.redirect('/login')
    else
        res.render('portfolios/createPortfolio')
})

router.post('/create', upload.single('image'), function (req, res) {
    if (!res.locals.isLoggedIn) {
        res.redirect('/login')
        return
    }

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
                res.render('errors/500')
            else
                res.redirect("/portfolios/" + id)
        })
    }
    else
        res.render("portfolios/createPortfolio", {
            validationErrors,
            title,
            caption,
            description,
            date: req.body.date
        })
})

router.get('/edit/:id', function (req, res) {
    if (!res.locals.isLoggedIn) {
        res.redirect('/login')
        return
    }

    const id = req.params.id

    db.getPortfolioById(id, function (error, portfolio) {
        if (error)
            res.render('errors/500')
        else
            res.render('portfolios/editPortfolio', {
                portfolio,
            })
    })
})

router.post('/edit/:id', upload.single('image'), function (req, res) {
    if (!res.locals.isLoggedIn) {
        res.redirect('/login')
        return
    }

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
                res.render('errors/500')
            else
                res.redirect("/portfolios/" + id)
        })
    }
    else
        res.render("portfolios/editPortfolio", {
            validationErrors,
            portfolio
        })
})

router.get('/:id', function (req, res) {
    const id = req.params.id

    db.getPortfolioById(id, function (error, portfolio) {
        if (error)
            res.render('errors/500')
        else
            res.render('portfolios/portfolio', {
                portfolio
            })
    })
})

router.post('/delete/:id', function (req, res) {
    if (!res.locals.isLoggedIn) {
        res.redirect('/login')
        return
    }

    const id = req.params.id

    db.deletePortfolioById(id, function (error, portfolioExisted) {
        if (error || !portfolioExisted)
            res.render('errors/500')
        else
            res.redirect('/portfolios/')
    })
})

module.exports = router