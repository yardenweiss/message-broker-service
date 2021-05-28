/*
    In this application there is to maps that saving the memory.
    Every new mwssage saved in messages map by the topic.
    Every topic can be subscribed by clients ids, for each one we save the res.
    Delivered all messages to the listeners happend in 2 case: 
        1. There is a new subscribe for the topic we puclish all the rellavent messages for the spesific clientId
        2. a spesific topic get a new msg
*/

//for every topic (key) the value is an array messages content
const messages = new Map();
//for every topic (key) the value is array of clientId and res object
const clients = new Map();
const express = require('express')
const app = express()
const SUCCESS = "success";
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// add new message by topic and publish messages to topic listeners
app.post('/new/message', (req, res) => {
    try {
        const { topic, message } = req.body;
        if (!messages.has(topic)) {
            messages.set(topic, [message])
        } else {
            const prev_messages = messages.get(topic);
            prev_messages.push(message);
            messages.set(topic, prev_messages);
        }
        publish(topic);
        res.status(200).send(SUCCESS)
    } catch (err) {
        res.status(500).send(err);
    }
})

// clientId subscribe to topic. Deliver all messages sent to that topic 
app.get('/subscribe/:clientId/:topic', (req, res) => {
    try {
        const { clientId, topic } = req.params;
        if (!clients.has(topic)) {
            clients.set(topic, [{ clientId: clientId, res: res }])
        } else {
            const client_data = clients.get(topic);
            if (!client_data.find(x => x.clientId == clientId)) {
                client_data.push({ clientId: clientId, res: res });
            }
            clients.set(topic, client_data);
        }
        publish(topic, clientId);
        req.on('close', () => {
        });
    } catch (err) {
        res.status(500).send(err);
    }
})

// unsubscribe clientId from spesific topic
app.get('/unsubscribe/:clientId/:topic', (req, res) => {
    try {
        const { clientId, topic } = req.params;
        if (clients.has(topic)) {
            const client_data = clients.get(topic);
            const index = client_data.findIndex(x => x.clientId == clientId);
            if (index > -1) {
                client_data.splice(index, 1);
            }
            clients.set(topic, client_data);
        }
        res.status(200).send(SUCCESS)

    } catch (err) {
        res.status(500).send(err);
    }
})

// publish messages for all the listeners of the spesific topic
function publish(topic, clientId = null) {
    if (clients.has(topic)) {
        const client_data = clients.get(topic);
        client_data.forEach(element => {
            if (element.clientId == clientId || !clientId)
                element.res.end(JSON.stringify(messages.has(topic) ? messages.get(topic) : []));
        });
    }
}

app.listen(3000)
