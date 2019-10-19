const express = require("express")
const db = require("./../db")
const router = express.Router()
const QUESTION_PER_PAGE = 3
const QUESTION_MIN_LENGTH = 5
const QUESTION_MAX_LENGTH = 100
const ANSWER_MIN_LENGTH = 5
const ANSWER_MAX_LENGTH = 75

router.get("/", function (req, res) {
    const search = req.query.search
    const page = req.query.page || 1
    const beginIndex = (QUESTION_PER_PAGE * page) - QUESTION_PER_PAGE
    const endIndex = beginIndex + QUESTION_PER_PAGE
    db.getAllQuestions(function (error, questions) {
        if (error)
            res.render("errors/500")
        else {
            if (search)
                questions = questions.filter(function (element) {
                    return element.question.includes(search)
                })
            res.render("questions/questions", {
                questions: questions.slice(beginIndex, endIndex),
                pagination: {
                    page: page,
                    pageCount: Math.ceil(questions.length / QUESTION_PER_PAGE)
                },
                search
            })
        }
    })
})

router.get("/create/", function (req, res) {
    res.render("questions/createQuestion")
})

router.post("/create/", function (req, res) {
    const validationErrors = []
    const question = req.body.question
    if (question.length < QUESTION_MIN_LENGTH)
        validationErrors.push("Question is too short!")
    else if (question.length > QUESTION_MAX_LENGTH)
        validationErrors.push("Question is too long!")
    if (validationErrors.length == 0) {
        const questionObject = {
            question,
            createdAt: new Date().getTime()
        }
        db.createQuestion(questionObject, function (error, id) {
            if (error)
                res.render("errors/500")
            else
                res.redirect("/questions/")
        })
    }
    else
        res.render("questions/createQuestion", {
            validationErrors,
            question,
        })
})

router.get("/edit/:id", function (req, res) {
    if (!res.locals.isLoggedIn) {
        res.redirect("/login")
        return
    }
    const id = req.params.id
    db.getQuestionById(id, function (error, question) {
        if (error)
            res.render("errors/500")
        else
            res.render("questions/editQuestion", {
                question
            })
    })
})

router.post("/edit/:id", function (req, res) {
    if (!res.locals.isLoggedIn) {
        res.redirect("/login")
        return
    }
    const validationErrors = []
    const id = req.params.id
    const answer = req.body.answer
    if (answer.length < ANSWER_MIN_LENGTH)
        validationErrors.push("Answer is too short!")
    else if (answer.length > ANSWER_MAX_LENGTH)
        validationErrors.push("Answer is too long!")
    if (validationErrors.length == 0) {
        db.updateAnswerById(id, answer, function (error, questionExisted) {
            if (error || !questionExisted)
                res.render("errors/500")
            else
                res.redirect("/questions/" + id)
        })
    }
    else {
        const question = {
            id,
            question: req.body.question,
            answer
        }
        res.render("questions/editQuestion", {
            validationErrors,
            question,
        })
    }
})

router.post("/delete/:id", function (req, res) {
    if (!res.locals.isLoggedIn) {
        res.redirect("/login")
        return
    }
    const id = req.params.id
    db.deleteQuestionById(id, function (error, questionExisted) {
        if (error || !questionExisted)
            res.render("errors/500")
        else
            res.redirect("/questions/")
    })
})

router.get("/:id", function (req, res) {
    const id = req.params.id
    db.getQuestionById(id, function (error, question) {
        if (error)
            res.render("errors/500")
        else
            res.render("questions/question", {
                question
            })
    })
})

module.exports = router