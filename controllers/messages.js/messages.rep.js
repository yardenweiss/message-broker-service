//for every topic (key) the value is an messages array
const messagesMap = new Map();
//for every topic (key) the value is array of clientId and res object
const clientsMap = new Map();

module.exports = {
    newMessage,
    clientSubscribe,
    clientUnsubscribe
}

/*if there is a clients that subscribe to this topic add the msg to messages in clientMap
else save the msg in messagesMap by topic*/
function newMessage(topic, message) {
    try {
        if (clientsMap.has(topic)) {
            clientsMap.get(topic).forEach(client => {
                client.messages.push(message)
            })
        } else {
            if (!messagesMap.has(topic)) {
                messagesMap.set(topic, [message])
            } else {
                const prevMessages = messagesMap.get(topic);
                prevMessages.push(message);
                messagesMap.set(topic, prevMessages);
            }
        }
        publish(topic);
    } catch (err) {
        throw err;
    }
}

/*if the subscribed clientId have messages in the spesific topic we send immediately receive the messages
else save the rellavant data in clientData*/ 
function clientSubscribe(clientId, topic, res, req) {
    try {
        const messages = messagesMap.has(topic) ? messagesMap.get(topic) : [];
        if (messages.length > 0) {
            res.end(JSON.stringify({ messages, topic }));
        } else {
            if (!clientsMap.has(topic)) {
                clientsMap.set(topic, [{ clientId: clientId, res: res, messages: messages }])
            } else {
                const clientData = clientsMap.get(topic);
                if (!clientData.find(x => x.clientId == clientId)) {
                    clientData.push({ clientId: clientId, res: res, messages: messages });
                }
                clientsMap.set(topic, clientData);
            }
        }
    } catch (err) {
        throw err;
    }
}

/*delete client from clientData array by topic*/ 
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

/*if topic exist in client map send to all his clients the messages and then unsubscribed*/
function publish(topic) {
    if (clientsMap.has(topic)) {
        const clientData = clientsMap.get(topic);
        let savedClientsId = [];

        clientData.forEach(element => {
            const result = { messages: element.messages, topic: topic };
            element.res.end(JSON.stringify(result));
            savedClientsId.push(element.clientId);
        });

        savedClientsId.forEach(clientId => {
            clientUnsubscribe(clientId, topic);
        })
    }
}