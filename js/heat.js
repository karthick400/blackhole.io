// Heat score tracking module for ideas
// Tracks engagement metrics: views, reactions, requests

/**
 * Updates the heat score for an idea based on an action
 * @param {string} ideaId - The idea's unique identifier
 * @param {string} action - The type of action: "view" (1pt), "react" (3pts), "request" (5pts)
 */
function updateHeatScore(ideaId, action) {
  const points = {
    view: 1,
    react: 3,
    request: 5
  };

  const pointValue = points[action] || 0;
  if (pointValue === 0) return;

  // Retrieve idea from localStorage
  const idea = getIdeaById(ideaId);
  if (!idea) return;

  // Update heat score
  idea.heatScore = (idea.heatScore || 0) + pointValue;

  // Increment relevant counter
  if (action === "view") {
    idea.views = (idea.views || 0) + 1;
  } else if (action === "react") {
    idea.reactions = (idea.reactions || 0) + 1;
  } else if (action === "request") {
    idea.requests = (idea.requests || 0) + 1;
  }

  // Save back to localStorage
  updateIdea(ideaId, idea);
}

/**
 * Determines heat level based on score
 * @param {number} score - The heat score
 * @returns {string} - Heat level: "cool", "warm", "hot", or "blazing"
 */
function getHeatLevel(score) {
  if (score <= 15) return "cool";
  if (score <= 35) return "warm";
  if (score <= 60) return "hot";
  return "blazing";
}

/**
 * Gets CSS color for a heat level
 * @param {string} level - The heat level
 * @returns {string} - CSS color hex code
 */
function getHeatColor(level) {
  const colors = {
    cool: "#3b82f6",
    warm: "#f59e0b",
    hot: "#ef4444",
    blazing: "#7c3aed"
  };
  return colors[level] || "#3b82f6";
}

/**
 * Tracks a view for an idea with debouncing per session
 * Ensures each user only increments view count once per session per idea
 * @param {string} ideaId - The idea's unique identifier
 */
function trackView(ideaId) {
  const sessionKey = `viewed_${ideaId}`;
  
  // Check if this idea has already been viewed in this session
  if (sessionStorage.getItem(sessionKey)) {
    return;
  }

  // Mark as viewed in this session
  sessionStorage.setItem(sessionKey, "true");

  // Update heat score
  updateHeatScore(ideaId, "view");
}

/**
 * Initialize heat tracking for all visible idea cards
 * Uses IntersectionObserver to trigger trackView when cards become visible
 */
function initHeatTracking() {
  const cards = document.querySelectorAll("[data-id]");

  const observerOptions = {
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const cardElement = entry.target;
        const ideaId = cardElement.getAttribute("data-id");

        if (ideaId) {
          trackView(ideaId);
          observer.unobserve(cardElement);
        }
      }
    });
  }, observerOptions);

  // Observe all cards
  cards.forEach((card) => {
    observer.observe(card);
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeatTracking);
} else {
  initHeatTracking();
}
