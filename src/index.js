require('dotenv').config();
const express = require('express')
const morgan = require('morgan');
const app = express();
const convertRoute = require('./routes/convert.route');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}))

app.use('/api/v1',convertRoute)


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});