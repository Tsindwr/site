# About Sunder TTRPG

<div class="sunder-about-page">

<h2>Sunder's Vision Statement</h2>

<p>Sunder was created with the intent to give TTRPG players a storytelling framework that accommodates for creative choice. In this system, tasteful storytelling is rewarded in a quantifiable manner, and there are little to no limits to the kind of character you can play. Ease of use has been prioritized to cultivate a storytelling space that needs not be hindered by rules when unnecessary. This system encourages players to lean into their strengths, giving a natural blueprint for how to roleplay their character. Anything should be possible in Sunder, as long as a player is willing to pay the price to the story or to Magick itself.</p>

<!-- Author Profile Section -->
<div class="sunder-author-card">
  <div class="sunder-author-header">
    <img src="https://github.com/mullburrower.png" alt="mullburrower GitHub profile picture" class="sunder-author-avatar" />
    <div class="sunder-author-info">
      <h2 class="sunder-author-name">Faye M. Woods</h2>
      <p class="sunder-author-handle">@mullburrower</p>
    </div>
  </div>
  
  <div class="sunder-author-bio">
    <p>Creator of Sunder TTRPG, a tabletop roleplaying game set in the volatile world of Umbrea. Passionate about storytelling, world-building, and creating accessible systems for collaborative gameplay.</p>
  </div>

  <!-- GitHub & Repo Buttons -->
  <div class="sunder-btn-group">
    <a href="https://github.com/mullburrower" target="_blank" rel="noopener" class="sunder-btn sunder-btn-primary">
      <i class="fa-brands fa-github"></i> GitHub Profile
    </a>
    <a href="https://github.com/Tsindwr/site" target="_blank" rel="noopener" class="sunder-btn sunder-btn-secondary">
      <i class="fa-solid fa-code-branch"></i> View Repository
    </a>
  </div>

  <!-- Contact Links - Discord is the primary community link -->
  <div class="sunder-contact-links" aria-label="Contact and social links">
    <a href="https://discord.gg/zJEdEy4xtm" target="_blank" rel="noopener" class="sunder-contact-btn" title="Discord" aria-label="Join Discord server">
      <i class="fa-brands fa-discord"></i>
    </a>
    <a href="https://github.com/mullburrower" target="_blank" rel="noopener" class="sunder-contact-btn" title="GitHub" aria-label="Visit GitHub profile">
      <i class="fa-brands fa-github"></i>
    </a>
  </div>
</div>

<!-- Features History Section -->
<div class="sunder-features-history">
  <h2 class="sunder-section-title">
    <i class="fa-solid fa-clock-rotate-left"></i>
    Features &amp; Release History
  </h2>
  <p class="sunder-section-desc">
    Explore the development history of Sunder TTRPG. Each release brings new features, improvements, and fixes.
  </p>

  <!-- Accordion Container -->
  <div id="sunder-releases-accordion" class="sunder-accordion" role="region" aria-label="Release history">
    <div class="sunder-releases-loading">
      <i class="fa-solid fa-spinner fa-spin"></i> Loading release notes...
    </div>
  </div>
</div>

<!-- Quick Links Section -->
<div class="sunder-quick-links">
  <h2 class="sunder-section-title">
    <i class="fa-solid fa-compass"></i>
    Helpful Resources
  </h2>
  
  <div class="sunder-links-grid">
    <a href="guides/" class="sunder-link-card">
      <i class="fa-solid fa-book-open"></i>
      <span class="sunder-link-title">Guides &amp; Tutorials</span>
      <span class="sunder-link-desc">Learn how to use site features</span>
    </a>
    <a href="report-issue/" class="sunder-link-card">
      <i class="fa-solid fa-bug"></i>
      <span class="sunder-link-title">Report an Issue</span>
      <span class="sunder-link-desc">Found a problem? Let us know</span>
    </a>
    <a href="https://discord.gg/zJEdEy4xtm" target="_blank" rel="noopener" class="sunder-link-card">
      <i class="fa-brands fa-discord"></i>
      <span class="sunder-link-title">Join the Community</span>
      <span class="sunder-link-desc">Chat with other players</span>
    </a>
  </div>
</div>

</div>

<script>
(function() {
  // Release notes configuration
  const RELEASE_NOTES_BASE = '../../release-notes/';
  const KNOWN_RELEASES = ['v0.3.0', 'v0.4.0', 'v0.5.0', 'v0.6.0', 'v0.7.0', 'v0.8.0', 'v1.0.0']; // Add more versions as they are created
  
  async function loadReleaseNotes() {
    const accordion = document.getElementById('sunder-releases-accordion');
    if (!accordion) return;
    
    const releases = [];
    
    for (const version of KNOWN_RELEASES) {
      try {
        const response = await fetch(RELEASE_NOTES_BASE + version + '.json');
        if (response.ok) {
          const data = await response.json();
          releases.push({ ...data, filename: version });
        }
      } catch (e) {
        console.warn('Failed to load release:', version, e);
      }
    }
    
    // Sort by version (newest first)
    releases.sort((a, b) => {
      const vA = a.version.replace(/[^\d.]/g, '').split('.').map(Number);
      const vB = b.version.replace(/[^\d.]/g, '').split('.').map(Number);
      for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
        if ((vA[i] || 0) > (vB[i] || 0)) return -1;
        if ((vA[i] || 0) < (vB[i] || 0)) return 1;
      }
      return 0;
    });
    
    renderReleases(releases, accordion);
  }
  
  function renderReleases(releases, container) {
    if (releases.length === 0) {
      container.innerHTML = '<p class="sunder-no-releases">No release notes available.</p>';
      return;
    }
    
    container.innerHTML = releases.map((release, index) => {
      const isHighlight = release.highlight === true;
      const tags = release.tags || [];
      const sections = release.sections || [];
      const summary = release.summary || '';
      const date = release.date || '';
      const itemId = 'release-' + release.version.replace(/\./g, '-');
      
      return `
        <div class="sunder-accordion-item${isHighlight ? ' sunder-accordion-highlight' : ''}" data-release-index="${index}">
          <button 
            class="sunder-accordion-header" 
            id="${itemId}-header"
            aria-expanded="false" 
            aria-controls="${itemId}-panel"
            type="button"
          >
            <div class="sunder-accordion-header-content">
              <span class="sunder-release-version">v${release.version}</span>
              ${isHighlight ? '<span class="sunder-release-badge"><i class="fa-solid fa-star"></i> Featured</span>' : ''}
              ${date ? '<span class="sunder-release-date">' + date + '</span>' : ''}
            </div>
            <span class="sunder-accordion-icon" aria-hidden="true">
              <i class="fa-solid fa-chevron-down"></i>
            </span>
          </button>
          <div 
            class="sunder-accordion-panel" 
            id="${itemId}-panel"
            role="region"
            aria-labelledby="${itemId}-header"
            hidden
          >
            <div class="sunder-accordion-content">
              ${summary ? '<p class="sunder-release-summary">' + summary + '</p>' : ''}
              ${tags.length > 0 ? `
                <div class="sunder-release-tags">
                  ${tags.map(tag => '<span class="sunder-tag sunder-tag--' + tag + '">' + tag + '</span>').join('')}
                </div>
              ` : ''}
              ${sections.length > 0 ? `
                <div class="sunder-release-sections">
                  ${sections.map(section => `
                    <div class="sunder-release-section">
                      <h4 class="sunder-release-section-title">${section.title}</h4>
                      <p class="sunder-release-section-desc">${section.description}</p>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Setup accordion behavior
    setupAccordion(container);
  }
  
  function setupAccordion(container) {
    const headers = container.querySelectorAll('.sunder-accordion-header');
    
    headers.forEach((header, index) => {
      header.addEventListener('click', () => {
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        
        // Close all other panels (accordion behavior - one at a time)
        headers.forEach(h => {
          h.setAttribute('aria-expanded', 'false');
          const panelId = h.getAttribute('aria-controls');
          const panel = document.getElementById(panelId);
          if (panel) {
            panel.hidden = true;
          }
        });
        
        // Toggle current panel
        if (!isExpanded) {
          header.setAttribute('aria-expanded', 'true');
          const panelId = header.getAttribute('aria-controls');
          const panel = document.getElementById(panelId);
          if (panel) {
            panel.hidden = false;
          }
        }
      });
      
      // Keyboard navigation
      header.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            const nextIndex = (index + 1) % headers.length;
            headers[nextIndex].focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            const prevIndex = (index - 1 + headers.length) % headers.length;
            headers[prevIndex].focus();
            break;
          case 'Home':
            e.preventDefault();
            headers[0].focus();
            break;
          case 'End':
            e.preventDefault();
            headers[headers.length - 1].focus();
            break;
        }
      });
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadReleaseNotes);
  } else {
    loadReleaseNotes();
  }
})();
</script>
