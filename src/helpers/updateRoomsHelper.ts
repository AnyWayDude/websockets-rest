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
