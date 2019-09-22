module.exports = {
    timestampToDateString: function (timestamp) {
        const date = new Date(timestamp)
        const day = date.getDate()
        const month = date.toLocaleString('default', { month: 'long' })
        const year = date.getFullYear()
        const formattedDate = month + ' ' + day + ', ' + year
        return formattedDate
    },
    timestampToDateInputValue: function (timestamp) {
        const date = new Date(timestamp)
        const year = date.getFullYear()
        const month = ("0" + (date.getMonth() + 1)).substr(-2)
        const day = ("0" + date.getDate()).substr(-2)
        const formattedDate = year + "-" + month + "-" + day
        return formattedDate
    },
    ifCond: function (v1, operator, v2, options) {
        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case '!==':
                return (v1 !== v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    }
}
