function filterAndRenderIdeas() {
    if (!document.getElementById('ideas-grid')) return;

    // 1) Get value from tag filter dropdown
    const tagEl = document.getElementById('tag-filter');
    const tagFilter = tagEl ? tagEl.value : 'All Tags';
    
    // 2) Get value from sort dropdown
    const sortEl = document.getElementById('sort-dropdown');
    const sortBy = sortEl ? sortEl.value : 'Hottest';
    
    // 3) Get value from search input
    const searchEl = document.getElementById('search-input');
    const searchText = searchEl ? searchEl.value.toLowerCase() : '';
    
    // 4) Call getPublicIdeas() to get all public ideas
    let ideas = getPublicIdeas();
    
    // 5) Filter by tag (case insensitive)
    if (tagFilter !== 'All Tags') {
        ideas = ideas.filter(idea => 
            idea.tags && idea.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase())
        );
    }
    
    // 6) Filter by search text (case insensitive)
    if (searchText.trim() !== '') {
        ideas = ideas.filter(idea =>
            (idea.title && idea.title.toLowerCase().includes(searchText)) ||
            (idea.description && idea.description.toLowerCase().includes(searchText))
        );
    }
    
    // 7) Sort by selected criteria
    if (sortBy === 'Hottest') {
        ideas.sort((a, b) => (b.heatScore || 0) - (a.heatScore || 0));
    } else if (sortBy === 'Newest') {
        ideas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'Most Needed') {
        ideas.sort((a, b) => (b.requests || 0) - (a.requests || 0));
    }
    
    const emptyState = document.getElementById('empty-state');
    const ideasGrid = document.getElementById('ideas-grid');
    
    // 8) If result array is empty, show empty-state and hide ideas-grid
    if (ideas.length === 0) {
        emptyState.style.display = 'block';
        ideasGrid.style.display = 'none';
    } 
    // 9) Otherwise hide empty-state and render ideas
    else {
        emptyState.style.display = 'none';
        ideasGrid.style.display = 'grid';
        ideasGrid.innerHTML = ideas.map(renderIdeaCard).join('');
        
        // Call loadMockData() if grid is empty
        if (ideasGrid.innerHTML === '') {
            loadMockData();
        }
    }
}

// Add event listeners on all 3 controls
document.addEventListener('DOMContentLoaded', function() {
    const tagFilter = document.getElementById('tag-filter');
    const sortDropdown = document.getElementById('sort-dropdown');
    const searchInput = document.getElementById('search-input');
    
    if (tagFilter) {
        tagFilter.addEventListener('change', filterAndRenderIdeas);
    }
    
    if (sortDropdown) {
        sortDropdown.addEventListener('change', filterAndRenderIdeas);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', filterAndRenderIdeas);
    }
    
    // Call filterAndRenderIdeas once on page load
    filterAndRenderIdeas();
});

// Event delegation for ideas grid
document.addEventListener('click', function(event) {
    const ideasGrid = document.getElementById('ideas-grid');
    if (!ideasGrid) return;

    const reactButton = event.target.closest('.react-btn');
    const joinButton = event.target.closest('.join-btn');
    
    // Handle react button clicks
    if (reactButton) {
        const card = reactButton.closest('[data-id]');
        if (!card) return;
        
        const ideaId = card.getAttribute('data-id');
        const reactionKey = 'reacted_' + ideaId;
        
        if (localStorage.getItem(reactionKey)) {
            return; // Already reacted
        }
        
        // Call updateHeatScore
        updateHeatScore(ideaId, 'react');
        localStorage.setItem(reactionKey, 'true');

        // Increment reaction count in button text (supports "React N" or icon+label variants).
        const reactText = reactButton.textContent || '';
        const countMatch = reactText.match(/(\d+)\s*$/);
        const currentReactionCount = countMatch ? parseInt(countMatch[1], 10) : 0;
        const nextReactionCount = currentReactionCount + 1;
        reactButton.innerHTML = `<i class="fa-solid fa-bolt" aria-hidden="true"></i> React ${nextReactionCount}`;

        // Increment visible heat value by exactly 1 after a react.
        const heatValueEl = card.querySelector('.heat-value');
        if (heatValueEl) {
            const currentHeat = parseInt(heatValueEl.textContent, 10) || 0;
            heatValueEl.textContent = String(currentHeat + 1);
        }
        
        // Add pop animation
        reactButton.classList.add('pop-animate');
        setTimeout(() => {
            reactButton.classList.remove('pop-animate');
        }, 600);
    }
    
    // Handle join button clicks
    if (joinButton) {
        const user = getCurrentUser();
        if (!user) {
            alert('Please sign up first!');
            return;
        }
        
        const card = joinButton.closest('[data-id]');
        if (!card) return;
        
        const ideaId = card.getAttribute('data-id');
        const userId = user.id || user.uid;
        const requestKey = 'requested_' + ideaId + '_' + userId;
        
        if (localStorage.getItem(requestKey)) {
            alert('Already requested!');
            return;
        }
        
        // Call updateHeatScore
        updateHeatScore(ideaId, 'request');
        localStorage.setItem(requestKey, 'true');
        
        // Update button text
        joinButton.textContent = 'Request Sent ✓';
        
        // Show toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease-in-out;
        `;
        toast.textContent = 'Collaboration request sent! 🚀';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
});
function initPage() {
    // Apply fade-in early so all pages reveal smoothly, even on early returns.
    requestAnimationFrame(() => {
        document.body.classList.add('page-loaded');
    });

    // 1) Load mock data
    loadMockData();
    
    // 2) Check user and show signup modal if needed
    let user = getCurrentUser();
    const path = window.location.pathname;
    const isHomePage = path === '/' || path.endsWith('/index.html');
    if (!user && !isHomePage) {
        showSignupModal();
        return;
    }
    
    // 3) Update navbar
    updateNavbar(user);
    
    // 4) Highlight active nav link
    highlightActiveNavLink();
    
}

function showSignupModal() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
    `;
    
    const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'Flutter', 'UI Design', 'Machine Learning', 'Data Science'];
    const emojis = ['🚀', '💻', '🎨', '🔬', '📊', '🎯', '⚡', '🌟'];
    
    let selectedSkills = [];
    let selectedEmoji = '🚀';
    
    modal.innerHTML = `
        <h2 style="margin-bottom: 20px;">Join Black Hole</h2>
        <input type="text" id="signup-name" placeholder="Name" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
        <input type="text" id="signup-college" placeholder="College" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
        
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Skills:</label>
            <div id="skills-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;"></div>
        </div>
        
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Choose Emoji:</label>
            <div id="emoji-container" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;"></div>
        </div>
        
        <button id="signup-submit" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Sign Up</button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const skillsContainer = modal.querySelector('#skills-container');
    skills.forEach(skill => {
        const label = document.createElement('label');
        label.style.cssText = `display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px; border-radius: 4px; border: 1px solid #ddd;`;
        label.innerHTML = `<input type="checkbox" value="${skill}" style="cursor: pointer;"> ${skill}`;
        label.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) selectedSkills.push(skill);
            else selectedSkills = selectedSkills.filter(s => s !== skill);
        });
        skillsContainer.appendChild(label);
    });
    
    const emojiContainer = modal.querySelector('#emoji-container');
    emojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.textContent = emoji;
        btn.style.cssText = `padding: 10px; font-size: 24px; border: 2px solid #ddd; border-radius: 6px; cursor: pointer; background: white;`;
        btn.addEventListener('click', () => {
            emojiContainer.querySelectorAll('button').forEach(b => b.style.borderColor = '#ddd');
            btn.style.borderColor = '#007bff';
            selectedEmoji = emoji;
        });
        if (emoji === '🚀') btn.style.borderColor = '#007bff';
        emojiContainer.appendChild(btn);
    });
    
    modal.querySelector('#signup-submit').addEventListener('click', () => {
        const name = modal.querySelector('#signup-name').value;
        const college = modal.querySelector('#signup-college').value;
        
        if (!name || !college) {
            alert('Please fill in all fields');
            return;
        }
        
        const userData = { name, college, skills: selectedSkills, emoji: selectedEmoji };
        saveCurrentUser(userData);
        saveUserToDirectory(userData);
        
        overlay.remove();
        location.reload();
    });
}

function updateNavbar(user) {
    const signupBtn = document.querySelector('[data-nav="signup"]') 
    if (!signupBtn) return;
    
    if (user) {
        const userDiv = document.createElement('div');
        userDiv.style.cssText = `display: flex; align-items: center; gap: 10px; padding: 8px 16px; background: rgba(0,0,0,0.05); border-radius: 6px;`;
        userDiv.innerHTML = `
            <span style="font-size: 20px;">${user.emoji || '🚀'}</span>
            <span style="font-weight: 500;">${user.name}</span>
            <button id="logout-btn" style="background: none; border: none; font-size: 18px; cursor: pointer;">🚪</button>
        `;
        
        signupBtn.parentNode.replaceChild(userDiv, signupBtn);
        
        userDiv.querySelector('#logout-btn').addEventListener('click', () => {
            localStorage.removeItem('blackhole_current_user');
            location.reload();
        });
    }
}

function highlightActiveNavLink() {
    const links = document.querySelectorAll('a[href]');
    const currentPath = window.location.pathname;
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || /^[a-z][a-z\d+\-.]*:/i.test(href)) return;
        if (currentPath.includes(href) || (currentPath === '/' && href === 'index.html')) {
            link.classList.add('nav-active');
        } else {
            link.classList.remove('nav-active');
        }
    });
}

document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href]');
    if (!link) return;
    
    const href = link.getAttribute('href');
    // Skip empty, hash-only, external, or special-protocol links
    if (!href || href.startsWith('#') || /^[a-z][a-z\d+\-.]*:/i.test(href) || link.getAttribute('target')) return;
    if (window.location.pathname.includes(href)) return;
    
    e.preventDefault();
    document.body.classList.add('page-exit');
    
    setTimeout(() => {
        window.location.href = href;
    }, 200);
});

// Add CSS for page transitions
const style = document.createElement('style');
style.textContent = `
    body {
        opacity: 0;
        transition: opacity 300ms ease-in-out;
    }
    body.page-loaded {
        opacity: 1;
    }
    body.page-exit {
        opacity: 0;
        transition: opacity 200ms ease-in-out;
    }
    .nav-active {
        font-weight: 600;
        color: #007bff;
        border-bottom: 2px solid #007bff;
    }
`;
document.head.appendChild(style);

initPage();