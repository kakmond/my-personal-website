const sqlite3 = require('sqlite3')

const db = new sqlite3.Database("database.db")

db.run(`
	CREATE TABLE IF NOT EXISTS questions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		question TEXT,
		answer TEXT
	)
`)

db.run(`
	CREATE TABLE IF NOT EXISTS blogs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT,
		image TEXT,
        caption TEXT,
        content TEXT,
		timestamp INTEGER
	)
`)

exports.getAllQuestions = function (callback) {
    const query = `SELECT * FROM questions ORDER BY id DESC`
    db.all(query, function (error, questions) {
        callback(error, questions)
    })
}

exports.getQuestionById = function (id, callback) {
    const query = `SELECT * FROM questions WHERE id = ?`
    const values = [id]
    db.get(query, values, function (error, question) {
        callback(error, question)
    })
}

exports.createQuestion = function (question, callback) {
    const query = `INSERT INTO questions(question, answer) VALUES (?, ?)`
    const values = [
        question.question,
        question.answer
    ]
    db.run(query, values, function (error) {
        const id = this.lastID
        callback(error, id)
    })
}

exports.deleteQuestionById = function (id, callback) {
    const query = `DELETE FROM questions WHERE id = ?`
    const values = [id]
    db.run(query, values, function (error) {
        const questionExisted = (this.changes == 1)
        callback(error, questionExisted)
    })
}

exports.updateAnswerById = function (id, updatedAnswer, callback) {
    const query = `
    UPDATE questions SET
        answer = ?
    WHERE
        id = ?
    `
    const values = [updatedAnswer, id]
    db.run(query, values, function (error) {
        const questionExisted = (this.changes == 1)
        callback(error, questionExisted)
    })
}

exports.getAllBlogs = function (callback) {
    const query = `SELECT * FROM blogs ORDER BY id DESC`
    db.all(query, function (error, questions) {
        callback(error, questions)
    })
}

exports.getBlogById = function (id, callback) {
    const query = `SELECT * FROM blogs WHERE id = ?`
    const values = [id]
    db.get(query, values, function (error, question) {
        callback(error, question)
    })
}

exports.createBlog = function (blog, callback) {
    const query = `
    INSERT INTO blogs
        (title, image, caption, content, timestamp) 
    VALUES 
        (?, ?, ?, ?, ?)`
    const values = [
        blog.title,
        blog.image,
        blog.caption,
        blog.content,
        blog.timestamp
    ]
    db.run(query, values, function (error) {
        const id = this.lastID
        callback(error, id)
    })
}

exports.deleteBlogById = function (id, callback) {
    const query = `DELETE FROM blogs WHERE id = ?`
    const values = [id]
    db.run(query, values, function (error) {
        const blogExisted = (this.changes == 1)
        callback(error, blogExisted)
    })
}

exports.updateBlogById = function (id, updatedBlog, callback) {
    const query = `
    UPDATE blogs SET
        title = ?,
        image = ?,
        caption = ?,
        content = ?,
    WHERE
        id = ?
    `
    const values = [
        blog.title,
        blog.image,
        blog.caption,
        blog.content,
        id
    ]
    db.run(query, values, function (error) {
        const blogExisted = (this.changes == 1)
        callback(error, blogExisted)
    })
}