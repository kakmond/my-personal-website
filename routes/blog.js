const express = require('express')
const db = require('./../db')
const router = express.Router()
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage })

// constants used for pagination.
const BLOG_PER_PAGE = 3
// constants used for validation of resources.
const TITLE_MIN_LENGTH = 5
const TITLE_MAX_LENGTH = 50
const CAPTION_MIN_LENGTH = 20
const CAPTION_MAX_LENGTH = 75
const CONTENT_MIN_LENGTH = 20
const CONTENT_MAX_LENGTH = 500

router.get('/', function (req, res) {
    const page = req.query.page || 1
    const beginIndex = (BLOG_PER_PAGE * page) - BLOG_PER_PAGE
    const endIndex = beginIndex + BLOG_PER_PAGE

    db.getAllBlogs(function (error, blogs) {
        if (error)
            res.render('errors/error')
        else
            res.render("blogs/blogs", {
                blogs: blogs.slice(beginIndex, endIndex),
                pagination: {
                    page: page,
                    pageCount: Math.ceil(blogs.length / BLOG_PER_PAGE)
                }
            })
    })
})

router.get('/create', function (req, res) {
    if (!res.locals.isLoggedIn)
        res.redirect('/login')
    else
        res.render('blogs/createBlog')
})

router.post('/create', upload.single('image'), function (req, res) {
    if (!res.locals.isLoggedIn) {
        res.redirect('/login')
        return
    }

    console.log(req.csrfToken())

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
                res.render('errors/error')
            else
                res.redirect("/blogs/" + id)
        })
    }
    else {
        res.render("blogs/createBlog", {
            validationErrors,
            title,
            caption,
            content,
        })
    }
})

router.get('/edit/:id', function (req, res) {
    if (!res.locals.isLoggedIn) {
        res.redirect('/login')
        return
    }

    const id = req.params.id

    db.getBlogById(id, function (error, blog) {
        if (error)
            res.render('errors/error')
        else
            res.render('blogs/editBlog', {
                blog
            })
    })
})

router.post('/edit/:id', upload.single('image'), function (req, res) {
    if (!res.locals.isLoggedIn) {
        res.redirect('/login')
        return
    }

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
                res.render('errors/error')
            else
                res.redirect("/blogs/" + id)
        })
    else
        res.render("editBlog", {
            validationErrors,
            blog
        })
})

router.get('/:id', function (req, res) {
    const id = req.params.id

    db.getBlogById(id, function (error, blog) {
        if (error)
            res.render('errors/error')
        else
            res.render('blogs/blog', {
                blog
            })
    })
})

router.post('/delete/:id', function (req, res) {
    if (!res.locals.isLoggedIn) {
        res.redirect('/login')
        return
    }
    
    const id = req.params.id

    db.deleteBlogById(id, function (error, blogExisted) {
        if (error || !blogExisted)
            res.render('errors/error')
        else
            res.redirect("/blogs/")
    })
})

module.exports = router