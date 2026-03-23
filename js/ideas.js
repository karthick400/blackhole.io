// ideas.js module

const IDEA_FIELDS = [
	'id', 'title', 'description', 'tags', 'feasibility', 'originality', 'impact', 'verdict',
	'isPublic', 'needsTeam', 'suggestedRoles', 'suggestedTeamSize',
	'ownerId', 'ownerName', 'ownerCollege', 'ownerEmoji',
	'heatScore', 'reactions', 'views', 'requests', 'createdAt'
];

function saveIdea(obj) {
	const id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
	const createdAt = new Date().toISOString();
	const idea = {
		id,
		createdAt,
		// Ensure all required fields are present, fallback to null/empty if missing
		title: obj.title || '',
		description: obj.description || '',
		tags: Array.isArray(obj.tags) ? obj.tags : [],
		feasibility: obj.feasibility || '',
		originality: obj.originality || '',
		impact: obj.impact || '',
		verdict: obj.verdict || '',
		isPublic: !!obj.isPublic,
		needsTeam: !!obj.needsTeam,
		suggestedRoles: Array.isArray(obj.suggestedRoles) ? obj.suggestedRoles : [],
		suggestedTeamSize: obj.suggestedTeamSize || '',
		ownerId: obj.ownerId || '',
		ownerName: obj.ownerName || '',
		ownerCollege: obj.ownerCollege || '',
		ownerEmoji: obj.ownerEmoji || '',
		heatScore: typeof obj.heatScore === 'number' ? obj.heatScore : 0,
		reactions: typeof obj.reactions === 'number' ? obj.reactions : 0,
		views: typeof obj.views === 'number' ? obj.views : 0,
		requests: typeof obj.requests === 'number' ? obj.requests : 0,
	};
	let ideas = JSON.parse(localStorage.getItem('blackhole_ideas')) || [];
	ideas.push(idea);
	localStorage.setItem('blackhole_ideas', JSON.stringify(ideas));
	return idea;
}

function getAllIdeas() {
	return JSON.parse(localStorage.getItem('blackhole_ideas')) || [];
}

function getPublicIdeas() {
	return getAllIdeas().filter(idea => idea.isPublic === true);
}

function getIdeaById(id) {
	return getAllIdeas().find(idea => idea.id === id) || null;
}

function updateIdea(id, updates) {
	let ideas = getAllIdeas();
	const idx = ideas.findIndex(idea => idea.id === id);
	if (idx === -1) return null;
	// Only update allowed fields
	const allowedUpdates = {};
	IDEA_FIELDS.forEach(field => {
		if (field in updates && field !== 'id' && field !== 'createdAt') {
			allowedUpdates[field] = updates[field];
		}
	});
	Object.assign(ideas[idx], allowedUpdates);
	localStorage.setItem('blackhole_ideas', JSON.stringify(ideas));
	return ideas[idx];
}

function deleteIdea(id) {
	let ideas = getAllIdeas();
	ideas = ideas.filter(idea => idea.id !== id);
	localStorage.setItem('blackhole_ideas', JSON.stringify(ideas));
}

// Export functions if using modules
// module.exports = { saveIdea, getAllIdeas, getPublicIdeas, getIdeaById, updateIdea, deleteIdea };
