import { Server } from "socket.io";

interface Room {
    name: string;
    userCount: number;
}

export interface User {
    id: string;
    username: string;
    progress: number;
    ready: boolean;
}

export const updateRoomsHelper = (rooms: Map<string, User[]>, io: Server): Room[] => {
    const result: Room[] = [];
    rooms.forEach((value, key) => {
        result.push({
            name: key,
            userCount: value.length
        })
    });

    return result;
};

export const updateRoomHelper = (room: string, id: string, io: Server) => {
    const roomUsers = io.sockets.adapter.rooms.get(room);

    if (!roomUsers) {
        return [];
    }

    return Array.from(roomUsers).reduce((results: User[], user: string) => {
        const socket = io.sockets.sockets.get(user);
        if (socket) {
            const user: User = {
                id: id,
                username: socket.handshake.query.username as string,
                progress: 0,
                ready: false,
            }
            results.push(user)
        }

        return results
    }, [])
};