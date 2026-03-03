(function() {
  // Release notes configuration
  const RELEASE_NOTES_BASE = '../../release-notes/';
  const ALT_RELEASE_NOTES_BASE = '/site/release-notes/'; // fallback for dev server root
  // Keep a hard-coded fallback for environments where directory listing isn't available
  const KNOWN_RELEASES = ['v0.3.0', 'v0.4.0', 'v0.5.0', 'v0.6.0', 'v0.7.0', 'v0.8.0', 'v1.0.0', 'v1.1.0', 'v1.2.0', 'v1.3.0', 'v1.4.0', 'v1.5.0', 'v1.6.0'];

  async function tryBases(pathSuffix, attemptFn) {
    const bases = [RELEASE_NOTES_BASE, ALT_RELEASE_NOTES_BASE];
    for (const base of bases) {
      try {
        const r = await attemptFn(base + pathSuffix);
        if (r) return r;
      } catch (e) {
        // continue
      }
    }
    return null;
  }

  // Discover release files by probing version numbers rather than relying on a directory listing.
  // Algorithm:
  // - Start at major=0, minor=3
  // - For each major, start minor at (major===0 ? 3 : 0), probe v{major}.{minor}.0.json upwards
  // - Stop the minor loop when a file for that minor is missing, then if any files were found for that major,
  //   increment major and repeat. If no files found for a major, stop entirely.
  // This avoids needing to maintain a manual list of releases.
  async function discoverReleaseFiles() {
    // Fast path: try index.json or directory listing first to avoid many probes
    const idxResult = await tryBases('index.json', async (url) => {
      try {
        const idxResp = await fetch(url, { cache: 'no-cache' });
        if (idxResp.ok) {
          const list = await idxResp.json();
          if (Array.isArray(list) && list.length > 0) {
            return list.map(p => p.replace(/^.*\//, '').replace(/\.json$/i, ''));
          }
        }
      } catch (e) {
        // ignore
      }
      return null;
    });
    if (idxResult) return idxResult;

    const dirResult = await tryBases('', async (url) => {
      try {
        const dirResp = await fetch(url, { cache: 'no-cache' });
        if (dirResp.ok) {
          const text = await dirResp.text();
          const re = /href\s*=\s*["']([^"']+?\.json)["']/ig;
          const matches = new Set();
          let m;
          while ((m = re.exec(text)) !== null) {
            let href = m[1];
            href = href.split(/[?#]/)[0];
            const filename = href.replace(/^.*\//, '').replace(/\.json$/i, '');
            if (filename) matches.add(filename);
          }
          if (matches.size > 0) return Array.from(matches);
        }
      } catch (e) {
        // ignore
      }
      return null;
    });
    if (dirResult) return dirResult;

    // Probe path (fallback): discover by incrementing minor versions per major
    const discovered = [];
    const maxMajor = 20; // safety cap
    const maxMinor = 200; // safety cap

    for (let major = 0; major <= maxMajor; major++) {
      let foundInMajor = false;
      let minor = (major === 0) ? 3 : 0;

      for (; minor <= maxMinor; minor++) {
        const candidateBaseName = `v${major}.${minor}.0`;
        let exists = false;

        // Try each known base for existence using HEAD to avoid downloading the whole file
        for (const base of [RELEASE_NOTES_BASE, ALT_RELEASE_NOTES_BASE]) {
          try {
            const url = base + candidateBaseName + '.json';
            const resp = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
            if (resp && resp.ok) {
              exists = true;
              break;
            }
          } catch (e) {
            // if HEAD fails (some hosts block it), try a lightweight GET
            try {
              const url = base + candidateBaseName + '.json';
              const respGet = await fetch(url, { method: 'GET', cache: 'no-cache' });
              if (respGet && respGet.ok) {
                exists = true;
                break;
              }
            } catch (e2) {
              // ignore and continue
            }
          }
        }

        if (exists) {
          discovered.push(candidateBaseName); // includes leading 'v'
          foundInMajor = true;
          continue; // probe next minor
        }

        // If this minor is missing, stop probing minors for this major
        break;
      }

      // If we found any releases in this major, continue to next major; otherwise stop entirely
      if (foundInMajor) {
        // continue to next major
      } else {
        break; // no releases in this major -> end discovery
      }
    }

    if (discovered.length === 0) {
      // Final fallback: use KNOWN_RELEASES
      console.log("Defaulting to known releases list due to discovery failure");
      return KNOWN_RELEASES.map(v => v.replace(/^v/, ''));
    }

    return discovered;
  }

  async function loadReleaseNotes() {
    const accordion = document.getElementById('sunder-releases-accordion');
    if (!accordion) return;

    const releases = [];
    const discovered = await discoverReleaseFiles();

    for (const baseName of discovered) {
      const candidates = [];
      if (baseName.match(/^v/)) candidates.push(baseName + '.json');
      else {
        candidates.push('v' + baseName + '.json');
        candidates.push(baseName + '.json');
      }

      let data = null;
      // Try each base+candidate combination
      for (const candidate of candidates) {
        // try both release-base prefixes
        for (const base of [RELEASE_NOTES_BASE, ALT_RELEASE_NOTES_BASE]) {
          try {
            const resp = await fetch(base + candidate);
            if (resp.ok) {
              data = await resp.json();
              data.filename = candidate.replace(/\.json$/i, '');
              break;
            }
          } catch (e) {
            // continue
          }
        }
        if (data) break;
      }

      if (data) {
        releases.push(data);
      } else {
        console.warn('Could not load release note:', baseName);
      }
    }

    releases.sort((a, b) => {
      const S = (r) => {
        const ver = (r.version || r.filename || '').toString().replace(/^v/, '');
        return ver.replace(/[^0-9.]/g, '').split('.').map(n => parseInt(n || '0', 10));
      };
      const vA = S(a);
      const vB = S(b);
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

    function escapeHtml(input) {
      return String(input || '').replace(/[&<>"']/g, function (c) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);
      });
    }

    let html = '';
    releases.forEach((release, index) => {
      const isHighlight = release.highlight === true;
      const tags = release.tags || [];
      const sections = release.sections || [];
      const summary = release.summary || '';
      const date = release.date || '';
      const versionLabel = (release.version || release.filename || '').toString();
      const itemId = 'release-' + versionLabel.replace(/\./g, '-').replace(/[^a-zA-Z0-9-_]/g, '-');

      html += '<div class="sunder-accordion-item' + (isHighlight ? ' sunder-accordion-highlight' : '') + '" data-release-index="' + index + '">';
      html += '<button class="sunder-accordion-header" id="' + itemId + '-header' + '" aria-expanded="false" aria-controls="' + itemId + '-panel" type="button">';
      html += '<div class="sunder-accordion-header-content">';
      html += '<span class="sunder-release-version">v' + escapeHtml(versionLabel) + '</span>';
      if (isHighlight) html += '<span class="sunder-release-badge"><i class="fa-solid fa-star"></i> Featured</span>';
      if (date) html += '<span class="sunder-release-date">' + escapeHtml(date) + '</span>';
      html += '</div>';
      html += '<span class="sunder-accordion-icon" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>';
      html += '</button>';

      html += '<div class="sunder-accordion-panel" id="' + itemId + '-panel' + '" role="region" aria-labelledby="' + itemId + '-header' + '" hidden>';
      html += '<div class="sunder-accordion-content">';

      if (summary) html += '<p class="sunder-release-summary">' + escapeHtml(summary) + '</p>';

      if (tags.length > 0) {
        html += '<div class="sunder-release-tags">';
        tags.forEach(tag => {
          html += '<span class="sunder-tag sunder-tag--' + escapeHtml(tag) + '">' + escapeHtml(tag) + '</span>';
        });
        html += '</div>';
      }

      if (sections.length > 0) {
        html += '<div class="sunder-release-sections">';
        sections.forEach(section => {
          html += '<div class="sunder-release-section">';
          html += '<h4 class="sunder-release-section-title">' + escapeHtml(section.title) + '</h4>';
          html += '<p class="sunder-release-section-desc">' + escapeHtml(section.description) + '</p>';
          html += '</div>';
        });
        html += '</div>';
      }

      html += '</div></div></div>';
    });

    container.innerHTML = html;

    setupAccordion(container);
  }

  function setupAccordion(container) {
    const headers = container.querySelectorAll('.sunder-accordion-header');

    headers.forEach((header, index) => {
      header.addEventListener('click', () => {
        const isExpanded = header.getAttribute('aria-expanded') === 'true';

        headers.forEach(h => {
          h.setAttribute('aria-expanded', 'false');
          const panelId = h.getAttribute('aria-controls');
          const panel = document.getElementById(panelId);
          if (panel) {
            panel.hidden = true;
          }
        });

        if (!isExpanded) {
          header.setAttribute('aria-expanded', 'true');
          const panelId = header.getAttribute('aria-controls');
          const panel = document.getElementById(panelId);
          if (panel) {
            panel.hidden = false;
          }
        }
      });

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadReleaseNotes);
  } else {
    loadReleaseNotes();
  }
})();
