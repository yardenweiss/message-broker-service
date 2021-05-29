/*
    In this application there is to maps that saving the memory.
    Every new mwssage saved in messages map by the topic.
    Every topic can be subscribed by clients ids, for each one we save the res.
    Delivered all messages to the listeners happend in 2 case: 
        1. There is a new subscribe for the topic we puclish all the rellavent messages for the spesific clientId
        2. a spesific topic get a new msg
*/


const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.listen(3000)

try { require('./controllers/messages.js/messages.js')(app); } catch (error) { console.log(error) }

