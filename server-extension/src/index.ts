import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { requestAPI } from './handler';

import { w3cwebsocket as W3CWebSocket } from "websocket";



/**
 * Initialization data for the server-extension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'server-extension',
  autoStart: true,
  optional: [ILauncher],
  requires: [ICommandPalette],
  activate: async (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    launcher: ILauncher | null
  ) => {
    console.log('JupyterLab extension server-extension is activated!');


	console.log('I want test websocket!!!');
	
	let client = new W3CWebSocket('ws://pi-syna.local:8889/echo');
	
	//let ws = new WebSocket('wss://pi-syna.local:8889/echo');

	
	console.log(client.readyState)
	
	for (let i = 0; i < 10; i++) {
		console.log(client.readyState)
		if (client.readyState)
		{
			console.log("send message!!!")
			
			let pong: any = { Type: "Pong" };
			client.send(JSON.stringify(pong));

			//client.send("message")
			break;
		}
		await new Promise(f => setTimeout(f, 1000));
	}

	client.send("message")
	
	client.onmessage = event => {
		console.log(event)
	}

	await new Promise(f => setTimeout(f, 2000));

	console.log('I want test request after websocket!!!');


	
	// GET request
    try {
      const data = requestAPI<any>('general');
      console.log(data);
    } catch (reason) {
      console.error(`Error on GET /webds-api/general.\n${reason}`);
    }
  },
};

export default extension;

