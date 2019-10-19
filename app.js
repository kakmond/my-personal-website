const path = require("path");
const express = require("express")
const expressHandlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const app = express()
const expressSession = require("express-session")
const SQLiteStore = require("connect-sqlite3")(expressSession)
const Handlebars = require("handlebars");
const paginate = require("handlebars-paginate");
const csrf = require("csurf");
const cookieParser = require("cookie-parser")
const csrfMiddleware = csrf({ cookie: true })
const indexRouter = require("./routes/index")
const questionsRouter = require("./routes/question")
const blogsRouter = require("./routes/blog")
const portfoliosRouter = require("./routes/portfolio")

app.engine("hbs", expressHandlebars({
    extname: "hbs",
    defaultLayout: "layout",
    helpers: require("./public/javascripts/helpers"),
}))
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({
    extended: false
}))
Handlebars.registerHelper("paginate", paginate);
const sessionOption = {
    secret: "verysecret",
    saveUninitialized: false,
    resave: false,
    store: new SQLiteStore(),
}
app.use(expressSession(sessionOption))
app.use(cookieParser());
app.use(csrfMiddleware);
app.use(function (req, res, next) {
    res.locals.csrftoken = req.csrfToken();
    res.locals.isLoggedIn = req.session.isLoggedIn
    next()
})
app.use("/", indexRouter)
app.use("/questions", questionsRouter)
app.use("/blogs", blogsRouter)
app.use("/portfolios", portfoliosRouter)
// The 404 Route
app.get("*", function (req, res) {
    res.render("errors/404")
});
app.listen(process.env.PORT || 3000)