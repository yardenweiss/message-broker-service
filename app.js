// massges map - hold all messages when the topic is the key and value is a message array content
const messages = new Map();
//clients map - hold all client id that subscribe to a topic, the key is the client id and the value is set with all the subscribed topics
const clients = new Map();
const express = require('express')
const app = express()
const SUCCESS = "success";
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

app.get('/subscribe/:clientId/:topic', (req, res) => {
    try {
        const { clientId, topic } = req.params;
        if (!clients.has(topic)) {
            clients.set(topic, [{ clientIds: clientId, res: res }])
        } else {
            const client_data = clients.get(topic);
            if (!client_data.find(x => x.clientIds == clientId)) {
                client_data.push({ clientIds: clientId, res: res });
            }
            clients.set(topic, client_data);
        }
        req.on('close', () => {
        });
    } catch (err) {
        res.status(500).send(err);
    }
})

app.get('/unsubscribe/:clientId/:topic', (req, res) => {
    try {
        const { clientId, topic } = req.params;
        console.log("clients before",clients)

        if (clients.has(topic)) {
            const client_data = clients.get(topic);
            const index = client_data.findIndex(x => x.clientIds == clientId);
            if(index > -1){
                client_data.splice(index, 1);
            }            
            clients.set(topic, client_data);
            console.log("clients",clients)

        }
        res.status(200).send(SUCCESS)

    } catch (err) {
        res.status(500).send(err);
    }
})


// publish all messages for listenter
function publish(topic) {
    if (clients.has(topic)) {
        const client_data = clients.get(topic);
        client_data.forEach(element => {
            const clientIds = element.clientIds;
            const res = element.res;
            const _messages = messages.has(topic) ? messages.get(topic) : null;
            res.end(JSON.stringify(_messages));
        });
    }
}



app.listen(3000)
