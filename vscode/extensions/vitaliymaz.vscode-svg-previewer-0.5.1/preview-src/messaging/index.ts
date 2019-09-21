import { EventEmitter}  from 'events';

import vscode from '../vscode-api';

export interface IMessage {
    command: string;
    payload: any;
}

class MessageBroker extends EventEmitter {
    constructor() {
        super();

        window.addEventListener('message', event => {
            const { command, payload } = event.data;

            this.emit(command, payload);
        });
    }

    send(message: IMessage) {
        vscode.postMessage(message);
    }
}

export default new MessageBroker();