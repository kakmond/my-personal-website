const path = require('path');
const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const expressSession = require('express-session')
const SQLiteStore = require('connect-sqlite3')(expressSession)
const Handlebars = require('handlebars');
const paginate = require('handlebars-paginate');
const indexRouter = require('./routes/index')
const questionsRouter = require('./routes/question')
const blogsRouter = require('./routes/blog')
const portfoliosRouter = require('./routes/portfolio')

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
Handlebars.registerHelper('paginate', paginate);
app.use(expressSession({
    secret: "verysecret",
    saveUninitialized: false,
    resave: false,
    store: new SQLiteStore()
}))

app.use(function (request, response, next) {
    response.locals.isLoggedIn = request.session.isLoggedIn
    next()
})

app.use("/", indexRouter)
app.use("/questions", questionsRouter)
app.use("/blogs", blogsRouter)
app.use("/portfolios", portfoliosRouter)
app.listen(3000)