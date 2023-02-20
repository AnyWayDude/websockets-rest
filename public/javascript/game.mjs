import { showMessageModal } from "./views/modal.mjs";

const username = sessionStorage.getItem('username');


if (!username) {
	window.location.replace('/login');
}

const socket = io('', { query: { username } });

socket.on('NEW_USER_ERROR', () => {
	showMessageModal({
		message: 'This name is already in use',
		onclose: () => {
			sessionStorage.clear('username');
			window.location.replace('/login');
		},
	});
});
