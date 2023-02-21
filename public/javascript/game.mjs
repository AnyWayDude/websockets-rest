import { showMessageModal, showInputModal } from "./views/modal.mjs";
import { appendRoomElement } from "./views/room.mjs";


const username = sessionStorage.getItem('username');
const addRoomBtn = document.getElementById('add-room-btn');
const availableRooms = document.getElementById('rooms-page');
const gamePage = document.getElementById('game-page');
const roomName = document.getElementById('room-name');
const allRooms = document.getElementById('rooms-wrapper')
const leaveRoomBtn = document.getElementById('quit-room-btn')


if (!username) {
	window.location.replace('/login');
}

const socket = io('', { query: { username } });

socket.on('NEW_USER_ERROR', () => {
	showMessageModal({
		message: 'This name is already in use',
		onClose: () => {
			sessionStorage.clear('username');
			window.location.replace('/login');
		},
	});
});


socket.on("UPDATE_ROOMS", (rooms) => {
	allRooms.replaceChildren();
  
	rooms.forEach(({ name, userCount }) => {
	  appendRoomElement({
		name,
		numberOfUsers: userCount,
		onJoin: () => {
		  socket.emit("_ROOM", name);
		  availableRooms.classList.toggle("display-none");
		  gamePage.classList.toggle("display-none");
		  roomName.innerText = name;
		},
	  });
	});
  });



addRoomBtn.addEventListener('click', () => {
	let inputValue = ''
	showInputModal({
		title: 'Room name:',
		onChange: (value) => {
			inputValue = value
		},
		onSubmit: () => {
			if(inputValue.length === 0) {
				return alert('fill the input')
			} else {
				socket.emit('CREATE_THE_ROOM', inputValue);
			};
		},
	});
});

socket.on("CREATE_ROOM_SUCCESS", (name) => {
	availableRooms.classList.toggle('display-none');
	gamePage.classList.toggle('display-none');
	roomName.innerText = name;
  });

  socket.on("NEW_ROOM_ERROR", () => {
	showMessageModal({
	  message: "Name already exists",
	});
  });

  leaveRoomBtn.addEventListener('click', () => {
	console.log('foo')
	const room = roomName.innerText.trim();
	socket.emit("LEAVE_ROOM", room);
  })

  socket.on('LEAVE_ROOM_SUCCESS', (name) => {
	availableRooms.classList.toggle('display-none');
	gamePage.classList.toggle('display-none');
  })
