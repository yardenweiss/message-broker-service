

module.export={
    newMessage,
    clientSubscribe,
    clientUnsubscribe
}

function newMessage(topic, message) {
    try{
        if (!messages.has(topic)) {
            messages.set(topic, [message])
        } else {
            const prev_messages = messages.get(topic);
            prev_messages.push(message);
            messages.set(topic, prev_messages);
        }
        publish(topic);
    }catch(err){
        throw err;
    }
}

function clientSubscribe(clientId, topic) {
    try{
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
    }catch(err){
        throw err;
    }
}

function clientUnsubscribe(clientId, topic) {
    try{
        if (clients.has(topic)) {
            const client_data = clients.get(topic);
            const index = client_data.findIndex(x => x.clientId == clientId);
            if (index > -1) {
                client_data.splice(index, 1);
            }
            clients.set(topic, client_data);
        }
    }catch(err){
        throw err;
    }
}