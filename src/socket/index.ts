import { Server } from 'socket.io';
import { updateRoomsHelper, User } from '../helpers/updateRoomsHelper';
import * as config from './config';


const roomsMap = new Map<string, User[]>();

export default (io: Server) => {
	io.on('connection', async (socket) => {
		const username = socket.handshake.query.username;
		console.log(`${username}coected`);

		io.emit("UPDATE_ROOMS", updateRoomsHelper(roomsMap, io));


		const socketData = await io.fetchSockets();
		const allUsers = socketData.map((el) => {
			return el.handshake.query.username;
		});
		const userNameTaken = allUsers.filter((name) => name === username).length > 1;
		if (userNameTaken) {
			socket.emit('NEW_USER_ERROR')
		}


		socket.on('CREATE_THE_ROOM', async (room) => {
			if (roomsMap.has(room)) {
				return socket.emit("NEW_ROOM_ERROR");
			}

			roomsMap.set(room, [
				{
					id: socket.id,
					username: username as string,
					progress: 0,
					ready: false,
				}
			]);
			socket.join(room);
			socket.emit("CREATE_ROOM_SUCCESS", room);
			io.emit("UPDATE_ROOMS", updateRoomsHelper(roomsMap, io));
		})

		socket.on("LEAVE_ROOM", (room) => {
			socket.leave(room);

			const usersInRoom = roomsMap.get(room)?.length;

			if (!usersInRoom) {
				roomsMap.delete(room);
			} else {
				io.emit("UPDATE_ROOMS", updateRoomsHelper(roomsMap, io));
				socket.emit("LEAVE_ROOM_SUCCESS");
			}
		});








	});
};
