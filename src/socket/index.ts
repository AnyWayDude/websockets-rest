import { Server } from 'socket.io';
import { updateRoomsHelper, updateRoomHelper, User } from '../helpers/updateRoomsHelper';
import * as config from './config';


const roomsMap = new Map<string, User[]>();

export default (io: Server) => {
	io.on('connection', async (socket) => {
		const username = socket.handshake.query.username;
		const query = socket.handshake.query;
		console.log(query)

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

			if (usersInRoom != null && usersInRoom == 0) {
				roomsMap.delete(room);
			} else {
				io.emit("UPDATE_ROOMS", updateRoomsHelper(roomsMap, io));
				socket.emit("LEAVE_ROOM_SUCCESS");
			}
		});

		socket.on("ENTER_ROOM", (room) => {
			socket.join(room);
			const currentRoomUser = roomsMap.get(room) ?? [];

			roomsMap.set(room, [
				...currentRoomUser,
				{
					id: socket.id,
					username: username as string,
					progress: 0,
					ready: false,
				},
			]);
			io.emit("UPDATE_ROOMS", updateRoomsHelper(roomsMap, io));
			io.to(room).emit("UPDATE_ROOM", updateRoomHelper(room, socket.id, io));
		});

		io.of("/").adapter.on("leave-room", (room, id) => {
			const isCreatedRoom = roomsMap.has(room);

			if (!isCreatedRoom) {
				return;
			}
			const roomUsers = roomsMap.get(room) ?? []
			const usersToUpdate = roomUsers.filter(user => user.id !== id)

			roomsMap.set(room, usersToUpdate);

			if (!usersToUpdate.length) {
				roomsMap.delete(room);
			} else {
				io.to(room).emit("UPDATE_ROOM", updateRoomHelper(room, id, io));
			}

			io.emit("UPDATE_ROOMS", updateRoomsHelper(roomsMap, io));
		});








	});
};
