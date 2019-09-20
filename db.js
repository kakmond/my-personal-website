const sqlite3 = require('sqlite3')

const db = new sqlite3.Database("database.db")

db.run(`
	CREATE TABLE IF NOT EXISTS questions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		question TEXT,
		answer TEXT
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
    const query = `INSERT INTO questions(question) VALUES (?)`
    const values = [question]
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
        id = ?`

    const values = [updatedAnswer, id]
    db.run(query, values, function (error) {
        const questionExisted = (this.changes == 1)
        callback(error, questionExisted)
    })
}
