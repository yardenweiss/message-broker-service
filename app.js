

const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const controllerPath = './controllers/messages.js/messages.js';

app.listen(3000)

try { require(controllerPath)(app); } catch (error) { console.log(error) }

