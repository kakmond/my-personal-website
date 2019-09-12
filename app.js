var path = require('path');
const express = require('express')
const expressHandlebars = require('express-handlebars')
var indexRouter = require('./routes/index');

const app = express()

app.engine("hbs", expressHandlebars({
    extname: 'hbs',
    defaultLayout: 'layout',
    partialsDir: __dirname + '/views/partials/',
    helpers: __dirname + "./public/helpers/",
}))
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);

app.listen(3000)
