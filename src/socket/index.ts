import { Server } from 'socket.io';
import * as config from './config';

export default (io: Server) => {
	io.on('connection', async (socket) => {
		const username = socket.handshake.query.username;
		console.log(`${username}coected`);

		const socketData = await io.fetchSockets();

		const allUsers = socketData.map((el) => {
			return el.handshake.query.username;
		});

		const userNameTaken = allUsers.filter((name) => name === username).length > 1;

		if (userNameTaken) {
			socket.emit('NEW_USER_ERROR')
		}



	});

};
