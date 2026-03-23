const SKILL_MAP = {
  'Frontend Developer': ['React', 'Vue', 'HTML', 'CSS', 'JavaScript', 'UI', 'TypeScript'],
  'Backend Developer': ['Node.js', 'Python', 'Java', 'Express', 'Django', 'API', 'PHP'],
  'UI Designer': ['Figma', 'UI', 'UX', 'Design', 'Sketch', 'Adobe XD'],
  'ML Engineer': ['Python', 'TensorFlow', 'Machine Learning', 'AI', 'PyTorch', 'Data Science'],
  'Mobile Developer': ['Flutter', 'React Native', 'Android', 'iOS', 'Kotlin', 'Swift'],
  'Data Analyst': ['SQL', 'Power BI', 'Tableau', 'Excel', 'Data', 'Python']
};

function matchScore(userSkills, neededRoles) {
  if (!neededRoles || neededRoles.length === 0) return 0;
  
  const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
  let rolesMatched = 0;
  
  for (const role of neededRoles) {
    const roleKeywords = SKILL_MAP[role] || [];
    const keywordsLower = roleKeywords.map(kw => kw.toLowerCase());
    
    const hasMatch = keywordsLower.some(keyword => 
      userSkillsLower.some(skill => skill.includes(keyword) || keyword.includes(skill))
    );
    
    if (hasMatch) rolesMatched++;
  }
  
  return Math.round((rolesMatched / neededRoles.length) * 100);
}

function getTopMatches(ideaId) {
  const ideas = JSON.parse(localStorage.getItem('blackhole_ideas')) || [];
  const idea = ideas.find(i => i.id == ideaId);
  
  if (!idea) return [];
  
  const users = JSON.parse(localStorage.getItem('blackhole_users')) || [];
  
  const matches = users.map(user => ({
    ...user,
    score: matchScore(user.skills || [], idea.suggestedRoles || [])
  }));
  
  return matches.sort((a, b) => b.score - a.score);
}

function sendCollabRequest(ideaId, requesterId) {
  const requests = JSON.parse(localStorage.getItem('blackhole_requests')) || [];
  
  requests.push({
    id: Date.now(),
    ideaId,
    requesterId,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  
  localStorage.setItem('blackhole_requests', JSON.stringify(requests));
}

function getRequestsForIdea(ideaId) {
  const requests = JSON.parse(localStorage.getItem('blackhole_requests')) || [];
  return requests.filter(req => req.ideaId == ideaId && req.status === 'pending');
}

function updateRequestStatus(requestId, status) {
  const requests = JSON.parse(localStorage.getItem('blackhole_requests')) || [];
  const request = requests.find(req => req.id == requestId);
  
  if (request) {
    request.status = status;
    localStorage.setItem('blackhole_requests', JSON.stringify(requests));
  }
}
