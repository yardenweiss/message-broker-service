const messagesRepository = require('./messages.rep');
const SUCCESS = "success";

module.exports = (app)=> {
    // add new message by topic and publish messages to topic listeners
    app.post('/new/message', (req, res) => {
        try { 
            const { topic, message } = req.body;
            messagesRepository.newMessage(topic, message);
            res.status(200).send(SUCCESS)
        } catch (err) {
            console.log(err)
            res.status(500).send(JSON.stringify(err));
        }
    })

    // clientId subscribe to topic. Deliver all messages sent to that topic 
    app.get('/subscribe/:clientId/:topic', (req, res) => {
        try {
            const { clientId, topic } = req.params;
            messagesRepository.clientSubscribe(clientId, topic, res, req);
        } catch (err) { 
            console.log(err)
            res.status(500).send(JSON.stringify(err));
        }
    }) 

    // unsubscribe clientId from spesific topic
    app.get('/unsubscribe/:clientId/:topic', (req, res) => {
        try {
            const { clientId, topic } = req.params;
            messagesRepository.clientUnsubscribe(clientId, topic);
            res.status(200).send(SUCCESS)

        } catch (err) {
            res.status(500).send(JSON.stringify(err));
        }
    })
}