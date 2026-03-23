function renderIdeaCard(idea) {
  const timeAgo = getTimeAgo(idea.created);
  const heatLevel = idea.heat || 0;
  const tagsHTML = (idea.tags || [])
    .map(tag => `<span style="background: #06b6d4; color: white; padding: 3px 10px; border-radius: 100px; font-size: 12px; display: inline-block; margin-right: 4px;">${tag}</span>`)
    .join('');
  
  const cardHTML = `
    <div class="idea-card" data-id="${idea.id}" style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 16px;">
      <div class="owner-row">
        <div class="owner-emoji">${idea.ownerEmoji || '<i class="fa-regular fa-user" aria-hidden="true"></i>'}</div>
        <div class="owner-details">
          <div class="owner-name">${idea.ownerName || 'Anonymous'}</div>
          <div class="owner-college">${idea.ownerCollege || 'Unknown'}</div>
        </div>
        <div class="time-ago">${timeAgo}</div>
      </div>
      
      <h3 class="idea-title">${idea.title || 'Untitled'}</h3>
      
      <div class="tags-row">
        ${tagsHTML}
      </div>
      
      <div class="action-row">
        <button class="react-btn"><i class="fa-solid fa-bolt" aria-hidden="true"></i> React ${idea.reactions || 0}</button>
        <button class="join-btn"><i class="fa-solid fa-user-plus" aria-hidden="true"></i> I want in ${idea.requests || 0}</button>
        <span class="heat-label">Heat <span class="heat-value">${heatLevel}</span></span>
      </div>
    </div>
  `;
  
  return cardHTML;
}

function getTimeAgo(timestamp) {
  if (!timestamp) return 'now';
  const date = new Date(timestamp);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd';
  return Math.floor(seconds / 604800) + 'w';
}

function getTopScore(idea) {
  const scores = {
    vibes: idea.vibes || 0,
    potential: idea.potential || 0,
    execution: idea.execution || 0
  };
  
  let topScore = { label: 'Score', value: 0 };
  for (const [key, value] of Object.entries(scores)) {
    if (value > topScore.value) {
      topScore = { label: key.charAt(0).toUpperCase() + key.slice(1), value };
    }
  }
  
  return topScore;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function openDrawer(ideaId) {
  const drawer = document.getElementById('collab-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const requestsList = document.getElementById('requests-list');

  if (!drawer || !overlay || !requestsList) {
    return;
  }

  drawer.classList.add('drawer-open');
  overlay.style.display = 'block';

  const requests = typeof getRequestsForIdea === 'function' ? (getRequestsForIdea(ideaId) || []) : [];
  const topMatches = typeof getTopMatches === 'function' ? (getTopMatches(ideaId) || []) : [];

  const topMatchesById = new Map(topMatches.map(user => [String(user.id), user]));
  const requestProfiles = requests.map(request => {
    const requestUser = typeof getUserById === 'function' ? getUserById(request.requesterId) : null;
    const matchedUser = topMatchesById.get(String(request.requesterId)) || {};
    const profile = requestUser || matchedUser;

    return {
      requestId: request.id,
      requesterId: request.requesterId,
      emoji: profile.profileEmoji || profile.emoji || '👤',
      name: profile.name || 'Unknown',
      college: profile.college || 'Unknown',
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      matchScore: typeof matchedUser.score === 'number' ? matchedUser.score : 0
    };
  });

  const pendingRequesterIds = new Set(requestProfiles.map(profile => String(profile.requesterId)));
  const matchOnlyProfiles = topMatches
    .filter(user => !pendingRequesterIds.has(String(user.id)))
    .map(user => ({
      requestId: null,
      requesterId: user.id,
      emoji: user.profileEmoji || user.emoji || '👤',
      name: user.name || 'Unknown',
      college: user.college || 'Unknown',
      skills: Array.isArray(user.skills) ? user.skills : [],
      matchScore: typeof user.score === 'number' ? user.score : 0
    }));

  const combinedProfiles = [...requestProfiles, ...matchOnlyProfiles]
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  if (combinedProfiles.length === 0) {
    requestsList.innerHTML = '<div class="drawer-empty">No requests or matches yet.</div>';
    return;
  }

  requestsList.innerHTML = combinedProfiles.map(profile => {
    const skillsBadges = profile.skills
      .map(skill => `<span class="skill-badge">${escapeHtml(skill)}</span>`)
      .join('');

    return `
      <div class="request-card" data-request-id="${profile.requestId || ''}" data-user-id="${escapeHtml(profile.requesterId)}">
        <div class="card-header">
          <div class="requester-avatar">${escapeHtml(profile.emoji)}</div>
          <div class="card-info">
            <div class="requester-name">${escapeHtml(profile.name)}</div>
            <div class="requester-college">${escapeHtml(profile.college)}</div>
          </div>
        </div>
        <div class="card-skills">${skillsBadges}</div>
        <div class="card-stats">
          <span class="match-score">${profile.matchScore}% Match</span>
        </div>
        <div class="card-actions">
          <button class="btn-accept" type="button">Accept</button>
          <button class="btn-decline" type="button">Decline</button>
        </div>
      </div>
    `;
  }).join('');
}

function closeDrawer() {
  const drawer = document.getElementById('collab-drawer');
  const overlay = document.getElementById('drawer-overlay');

  if (drawer) {
    drawer.classList.remove('drawer-open');
  }
  if (overlay) {
    overlay.style.display = 'none';
  }
}

const drawerOverlay = document.getElementById('drawer-overlay');
if (drawerOverlay) {
  drawerOverlay.addEventListener('click', closeDrawer);
}
