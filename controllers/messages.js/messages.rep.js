//for every topic (key) the value is an messages array
const messagesMap = new Map();
//for every topic (key) the value is array of clientId & res & messages object
const clientsMap = new Map();

module.exports = {
    newMessage,
    clientSubscribe,
    clientUnsubscribe
}

function newMessage(topic, message) {
    try {
        if (clientsMap.has(topic)) {
            updateMessagesForEveryClientInTopic(topic, message);
        }

        updateMessagesMapWithNewMessage(topic, message);
        publishMessagesToSubscribedClient(topic);
    } catch (err) {
        throw err;
    }
}

function updateMessagesForEveryClientInTopic(topic, message) {
    try {
        clientsMap.get(topic).forEach(client => {
            client.messages.push(message);
        })
    } catch (err) {
        throw err;
    }
}

function updateMessagesMapWithNewMessage(topic, message) {
    try {
        if (!messagesMap.has(topic)) {
            messagesMap.set(topic, [message])
        } else {
            const prevMessages = messagesMap.get(topic);
            prevMessages.push(message);
            messagesMap.set(topic, prevMessages);
        }
    } catch (err) {
        throw err;
    }
}

function clientSubscribe(clientId, topic, res) {
    try {
        const messages = messagesMap.has(topic) ? messagesMap.get(topic) : [];

        if (!clientsMap.has(topic)) {
            clientsMap.set(topic, [{ clientId: clientId, res: res, messages: messages }])
            deliverMessagesForSpesificClient(messages, topic, clientId);
        } else {
            setToClientMapTheTopicWithClientData(clientId, topic, res, messages);
        }
    } catch (err) {
        throw err;
    }
}

function setToClientMapTheTopicWithClientData(clientId, topic, res, messages) {
    try {
        const clientData = clientsMap.get(topic);
        const index = clientData.findIndex(x => x.clientId == clientId);

        if (index == -1) {
            clientData.push({ clientId: clientId, res: res, messages: messages });
            clientsMap.set(topic, clientData);
            deliverMessagesForSpesificClient(messages, topic, clientId);
        } else {
            clientData[index].res = res;
            deliverMessagesForSpesificClient(clientData[index].messages, topic, clientId);
        }
    } catch (err) {
        throw err;
    }
}

function deliverMessagesForSpesificClient(messages, topic, clientId) {
    try {
        if (messages.length > 0) {
            const clientData = clientsMap.get(topic);
            const client = clientData.find(x => x.clientId == clientId);
            client.res.end(JSON.stringify({ messages, topic }));
            client.res = null;
            client.messages = [];
        }
    } catch (err) {
        throw err;
    }
}

function clientUnsubscribe(clientId, topic) {
    try {
        if (clientsMap.has(topic)) {
            const clientData = clientsMap.get(topic);
            const index = clientData.findIndex(x => x.clientId == clientId);
            if (index > -1) {
                clientData[index].res.end(JSON.stringify({ clientId, topic }));
                clientData.splice(index, 1);
            }
            clientsMap.set(topic, clientData);
        }
    } catch (err) {
        throw err;
    }
}

function publishMessagesToSubscribedClient(topic) {
    try {
        if (clientsMap.has(topic)) {
            
            clientsMap.get(topic).forEach(element => {
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