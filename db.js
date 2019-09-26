const sqlite3 = require('sqlite3')

const db = new sqlite3.Database("database.db")

db.run(`
	CREATE TABLE IF NOT EXISTS questions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		question TEXT,
        answer TEXT,
        timestamp INTEGER
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

db.run(`
	CREATE TABLE IF NOT EXISTS portfolios (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT,
		image TEXT,
        caption TEXT,
        description TEXT,
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
    const query = `INSERT INTO questions(question, timestamp) VALUES (?, ?)`
    const values = [
        question.question,
        question.timestamp
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
    db.all(query, function (error, blogs) {
        callback(error, blogs)
    })
}

exports.getBlogById = function (id, callback) {
    const query = `SELECT * FROM blogs WHERE id = ?`
    const values = [id]
    db.get(query, values, function (error, blog) {
        callback(error, blog)
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
        content = ?
    WHERE
        id = ?
    `
    const values = [
        updatedBlog.title,
        updatedBlog.image,
        updatedBlog.caption,
        updatedBlog.content,
        id
    ]
    db.run(query, values, function (error) {
        const blogExisted = (this.changes == 1)
        callback(error, blogExisted)
    })
}

exports.getAllPortfolios = function (callback) {
    const query = `SELECT * FROM portfolios ORDER BY id DESC`
    db.all(query, function (error, portfolios) {
        callback(error, portfolios)
    })
}

exports.getPortfolioById = function (id, callback) {
    const query = `SELECT * FROM portfolios WHERE id = ?`
    const values = [id]
    db.get(query, values, function (error, portfolio) {
        callback(error, portfolio)
    })
}

exports.createPortfolio = function (blog, callback) {
    const query = `
    INSERT INTO portfolios
        (title, image, caption, description, timestamp) 
    VALUES 
        (?, ?, ?, ?, ?)`
    const values = [
        blog.title,
        blog.image,
        blog.caption,
        blog.description,
        blog.timestamp
    ]
    db.run(query, values, function (error) {
        const id = this.lastID
        callback(error, id)
    })
}

exports.deletePortfolioById = function (id, callback) {
    const query = `DELETE FROM portfolios WHERE id = ?`
    const values = [id]
    db.run(query, values, function (error) {
        const portfolioExisted = (this.changes == 1)
        callback(error, portfolioExisted)
    })
}

exports.updatePortfolioById = function (id, updatedPortfolio, callback) {
    const query = `
    UPDATE portfolios SET
        title = ?,
        image = ?,
        caption = ?,
        description = ?,
        timestamp = ?
    WHERE
        id = ?
    `
    const values = [
        updatedPortfolio.title,
        updatedPortfolio.image,
        updatedPortfolio.caption,
        updatedPortfolio.description,
        updatedPortfolio.timestamp,
        id
    ]
    db.run(query, values, function (error) {
        const portfolioExisted = (this.changes == 1)
        callback(error, portfolioExisted)
    })
}