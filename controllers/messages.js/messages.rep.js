//for every topic (key) the value is an messages array
const messagesMap = new Map();
//for every topic (key) the value is array of clientId and res object
const clientsMap = new Map();

module.exports = {
    newMessage,
    clientSubscribe,
    clientUnsubscribe
}

/*save the msg in messagesMap by topic 
if there is a clients that subscribe to this topic add the msg to messages in clientMap*/
function newMessage(topic, message) {
    try {
        if (clientsMap.has(topic)) {
            clientsMap.get(topic).forEach(client => {
                client.messages.push(message)
            })
        }
        if (!messagesMap.has(topic)) {
            messagesMap.set(topic, [message])
        } else {
            const prevMessages = messagesMap.get(topic);
            prevMessages.push(message);
            messagesMap.set(topic, prevMessages);
        }

        publish(topic);
    } catch (err) {
        throw err;
    }
}

/*save client res&messages&clientId in clientMap bt topic
if the subscribed clientId have messages in the spesific topic send immediately the messages*/
function clientSubscribe(clientId, topic, res, req) {
    try {
        const messages = messagesMap.has(topic) ? messagesMap.get(topic) : [];

        if (!clientsMap.has(topic)) {
            clientsMap.set(topic, [{ clientId: clientId, res: res, messages: messages }])
            deliverAllMessages(messages, topic, clientId);
        } else {
            const clientData = clientsMap.get(topic);
            const index = clientData.findIndex(x => x.clientId == clientId);
            if (index == -1) {
                clientData.push({ clientId: clientId, res: res, messages: messages });
                clientsMap.set(topic, clientData);
                deliverAllMessages(messages, topic, clientId);
            } else {
                clientData[index].res = res;
                deliverAllMessages(clientData[index].messages, topic, clientId);
            }
        }
    } catch (err) {
        throw err;
    }
}

/*send to spesific client all his messages and initial the client data*/
function deliverAllMessages(messages, topic, clientId) {
    try {
        if (messages.length > 0) {
            const clientData = clientsMap.get(topic);
            const client = clientData.find(x => x.clientId == clientId);
            client.res.end(JSON.stringify({ messages, topic }))
            client.res = null;
            client.messages = [];
        }
    } catch (err) {
        throw err;
    }
}

/*delete client from clientsMap by topic*/
function clientUnsubscribe(clientId, topic) {
    try {
        if (clientsMap.has(topic)) {
            const clientData = clientsMap.get(topic);
            const index = clientData.findIndex(x => x.clientId == clientId);
            if (index > -1) {
                clientData.splice(index, 1);
            }
            clientsMap.set(topic, clientData);
        }
    } catch (err) {
        throw err;
    }
}

/*if topic exist in client map send to all his clients the messages*/
function publish(topic) {
    try {
        if (clientsMap.has(topic)) {
            const clientData = clientsMap.get(topic);

            clientData.forEach(element => {
                if (element.res) {
                    const result = { messages: element.messages, topic: topic };
                    element.res.end(JSON.stringify(result));
                    element.res = null;
                    element.messages = [];
                }
            });
        }
    } catch (err) {
        throw err;
    }
}