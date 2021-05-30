const messagesRepository = require('./messages.rep');
const responseService = require('../../utils/response');

module.exports = (app) => {
    app.post('/new/message', (req, res) => {
        try {
            const { topic, message } = req.body;
            messagesRepository.newMessage(topic, message);
            res.status(responseService.status.OK).send(responseService.message.SUCCESS)
        } catch (err) {
            res.status(responseService.status.INTERNAL_ERROR).send(JSON.stringify(err));
        }
    })

    app.get('/subscribe/:clientId/:topic', (req, res) => {
        try {
            const { clientId, topic } = req.params;
            messagesRepository.clientSubscribe(clientId, topic, res);
        } catch (err) {
            res.status(responseService.status.INTERNAL_ERROR).send(JSON.stringify(err));
        }
    })

    app.get('/unsubscribe/:clientId/:topic', (req, res) => {
        try {
            const { clientId, topic } = req.params;
            messagesRepository.clientUnsubscribe(clientId, topic);
            res.status(responseService.status.OK).send(responseService.message.SUCCESS)
        } catch (err) {
            res.status(responseService.status.INTERNAL_ERROR).send(JSON.stringify(err));
        }
    })
}