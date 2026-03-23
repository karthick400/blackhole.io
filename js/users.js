// users.js

// Save current user object to localStorage
function saveCurrentUser(obj) {
	localStorage.setItem('blackhole_current_user', JSON.stringify(obj));
}

// Get current user object from localStorage
function getCurrentUser() {
	const data = localStorage.getItem('blackhole_current_user');
	return data ? JSON.parse(data) : null;
}

// Update current user with updates object
function updateCurrentUser(updates) {
	const user = getCurrentUser();
	if (!user) return;
	const updatedUser = Object.assign({}, user, updates);
	saveCurrentUser(updatedUser);
}

// Save user to directory (array in localStorage)
function saveUserToDirectory(obj) {
	const users = getAllUsers();
	const idx = users.findIndex(u => u.id === obj.id);
	if (idx !== -1) {
		users[idx] = obj;
	} else {
		users.push(obj);
	}
	localStorage.setItem('blackhole_users', JSON.stringify(users));
}

// Get user by id from directory
function getUserById(id) {
	const users = getAllUsers();
	return users.find(u => u.id === id) || null;
}

// Get all users from directory
function getAllUsers() {
	const data = localStorage.getItem('blackhole_users');
	return data ? JSON.parse(data) : [];
}

// Create a guest user object
function createGuestUser() {
	return {
		id: 'guest_001',
		name: 'Deepan K',
		college: 'Your College',
		skills: ['JavaScript', 'UI Design'],
		profileEmoji: '⚡',
		joinedAt: new Date().toISOString(),
		ideaIds: [],
		bio: 'Builder and idea machine'
	};
}

// Export functions (if using modules)
// Uncomment below if using ES modules or CommonJS
// export { saveCurrentUser, getCurrentUser, updateCurrentUser, saveUserToDirectory, getUserById, getAllUsers, createGuestUser };
// module.exports = { saveCurrentUser, getCurrentUser, updateCurrentUser, saveUserToDirectory, getUserById, getAllUsers, createGuestUser };
