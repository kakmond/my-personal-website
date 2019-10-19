const sqlite3 = require("sqlite3")

const db = new sqlite3.Database("database.db")

db.run(`
	CREATE TABLE IF NOT EXISTS questions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		question TEXT,
        answer TEXT,
        createdAt INTEGER
	)
`)

db.run(`
	CREATE TABLE IF NOT EXISTS blogs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT,
		imageUrl TEXT,
        caption TEXT,
        content TEXT,
		createdAt INTEGER
	)
`)

db.run(`
	CREATE TABLE IF NOT EXISTS portfolios (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT,
		imageUrl TEXT,
        caption TEXT,
        description TEXT,
		publishedAt INTEGER
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
    const query = `INSERT INTO questions(question, createdAt) VALUES (?, ?)`
    const values = [
        question.question,
        question.createdAt
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
        (title, imageUrl, caption, content, createdAt) 
    VALUES 
        (?, ?, ?, ?, ?)`
    const values = [
        blog.title,
        blog.imageUrl,
        blog.caption,
        blog.content,
        blog.createdAt
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
        imageUrl = ?,
        caption = ?,
        content = ?
    WHERE
        id = ?
    `
    const values = [
        updatedBlog.title,
        updatedBlog.imageUrl,
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
        (title, imageUrl, caption, description, publishedAt) 
    VALUES 
        (?, ?, ?, ?, ?)`
    const values = [
        blog.title,
        blog.imageUrl,
        blog.caption,
        blog.description,
        blog.publishedAt
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
        imageUrl = ?,
        caption = ?,
        description = ?,
        publishedAt = ?
    WHERE
        id = ?
    `
    const values = [
        updatedPortfolio.title,
        updatedPortfolio.imageUrl,
        updatedPortfolio.caption,
        updatedPortfolio.description,
        updatedPortfolio.publishedAt,
        id
    ]
    db.run(query, values, function (error) {
        const portfolioExisted = (this.changes == 1)
        callback(error, portfolioExisted)
    })
}