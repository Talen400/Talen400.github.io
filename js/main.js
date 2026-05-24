/* ═══════════════════════════════════════════════════════════════════
   main.js — Portfolio @ 42 SP

   Responsibilities:
     1. Data: GITHUB_USER + SKILLS array (the only part you edit)
     2. Render the skills accordion into the DOM
     3. Handle project selection → fetch README from GitHub
     4. Render README content with marked.js
     5. Update the hero stats dynamically
═══════════════════════════════════════════════════════════════════ */


/* ───────────────────────────────────────────────────────────────────
   ✏️  CONFIGURATION — EDIT ONLY THIS BLOCK

   1. Replace GITHUB_USER with your actual GitHub login.

   2. Fill in SKILLS with your own skill areas and projects.
      Each skill has:
        name     → title shown in the accordion (e.g. "C Fundamentals")
        icon     → emoji for the visual icon
        projects → array of projects that belong to this skill

      Each project has:
        name   → EXACT repository name on GitHub (case-sensitive)
        techs  → array of languages / tools used
        branch → main branch of the repo ("main" or "master")

   The README.md is fetched automatically from:
     https://raw.githubusercontent.com/GITHUB_USER/name/branch/README.md

   A project can appear in more than one skill — just repeat the object.
─────────────────────────────────────────────────────────────────── */
const GITHUB_USER = "Talen400"; // ← REPLACE WITH YOUR LOGIN

const SKILLS = [
  {
    name: "C Fundamentals",
    icon: "⚙️",
    projects: [
      { name: "42_libft",         techs: ["C", "Makefile"],           branch: "main" },
      { name: "42_printf",     techs: ["C", "Variadic functions"], branch: "main" },
      { name: "42_gnl", techs: ["C", "File descriptors"],   branch: "main" },
    ]
  },
  {
    name: "Algorithms & Data Structures",
    icon: "📐",
    projects: [
      { name: "42_push_swap", techs: ["C", "Algorithms", "Stacks"], branch: "main" },
      { name: "libft",     techs: ["C", "Makefile"],             branch: "main" },
    ]
  },
  {
    name: "Systems Programming",
    icon: "🔩",
    projects: [
      { name: "42_minishell",    techs: ["C", "Processes", "Pipes"], branch: "main" },
      { name: "42_philosophers", techs: ["C", "Threads", "Mutexes"], branch: "main" },
	  { name: "42_pipex",	techs: ["C", "Process", "Pipes"], branch: "main"},
    ]
  },
  {
    name: "C++ & OOP",
    icon: "🧱",
    projects: [
      { name: "42_cpp00", techs: ["C++", "Classes"],      branch: "main" },
      { name: "42_cpp01", techs: ["C++", "Memory Management"], branch: "main" },
      { name: "42_cpp02", techs: ["C++", "Polimorfism ad-hoc"], branch: "main" },
      { name: "42_cpp03", techs: ["C++", "Inheritance"], branch: "main" },
      { name: "42_cpp04", techs: ["C++", "Interfaces"], branch: "main" },
      { name: "42_cpp05", techs: ["C++", "Exceptions"], branch: "main" },
    ]
  },
  {
    name: "Computer Graphics",
    icon: "🧱",
    projects: [
      { name: "42_miniRT", techs: ["C", "Raytracer"],      branch: "main" },
      { name: "42_fdf", techs: ["C", "2.5D map game"], branch: "main" },
    ]
  },
  {
    name: "DevOps / SysAdmin",
    icon: "🧱",
    projects: [
      { name: "42_inception", techs: ["docker", "makefile", "ngnix"],      branch: "main" },
    ]
  },
];
/* ════════════════════════════════════════════════════════ END OF CONFIG */


/* ───────────────────────────────────────────────────────────────────
   INTERNAL STATE
   cache      → avoids re-fetching the same README twice
   activeCard → DOM reference to the currently selected card (for styling)
─────────────────────────────────────────────────────────────────── */
const cache = {};
let activeCard = null;


/* ───────────────────────────────────────────────────────────────────
   updateHeroStats
   Counts unique projects (a project can appear in multiple skills)
   and updates the numbers in the hero section dynamically.
─────────────────────────────────────────────────────────────────── */
function updateHeroStats() {
  // A Set automatically deduplicates — so a repo listed under two skills
  // is still counted as a single project.
  const uniqueProjects = new Set();
  SKILLS.forEach(skill => skill.projects.forEach(proj => uniqueProjects.add(proj.name)));

  document.getElementById("heroProjectCount").textContent = uniqueProjects.size;
  document.getElementById("heroSkillCount").textContent   = SKILLS.length;
}


/* ───────────────────────────────────────────────────────────────────
   renderSkills
   Builds the HTML for the skills accordion and injects it into
   #skillsPanel. Uses template literals to construct the markup.
─────────────────────────────────────────────────────────────────── */
function renderSkills() {
  const panel = document.getElementById("skillsPanel");

  panel.innerHTML = SKILLS.map((skill, si) => `
    <div class="skill-group" id="skill-${si}">

      <!-- Clickable skill header -->
      <div class="skill-header" onclick="toggleSkill(${si})">
        <div class="skill-icon">${skill.icon}</div>
        <div class="skill-info">
          <div class="skill-name">${skill.name}</div>
          <div class="skill-count">
            ${skill.projects.length} project${skill.projects.length !== 1 ? "s" : ""}
          </div>
        </div>
        <span class="skill-chevron">▶</span>
      </div>

      <!-- Project list (hidden until the skill is opened) -->
      <div class="skill-projects">
        ${skill.projects.map((proj, pi) => `
          <div class="proj-card"
               id="card-${si}-${pi}"
               onclick="selectProject(${si}, ${pi})">
            <div>
              <div class="proj-card-name">${proj.name}</div>
              <div class="proj-card-tech">${proj.techs.slice(0, 3).join(" · ")}</div>
            </div>
            <span class="proj-card-arrow">→</span>
          </div>
        `).join("")}
      </div>

    </div>
  `).join("");
}


/* ───────────────────────────────────────────────────────────────────
   toggleSkill
   Opens or closes a skill group by toggling the .open class.
   The CSS handles the animation via the max-height transition.
─────────────────────────────────────────────────────────────────── */
function toggleSkill(si) {
  document.getElementById(`skill-${si}`).classList.toggle("open");
}


/* ───────────────────────────────────────────────────────────────────
   selectProject
   Called when a project card is clicked. It:
     1. Updates the active card's visual state
     2. Ensures the parent skill group is open
     3. Fetches (or retrieves from cache) the README
─────────────────────────────────────────────────────────────────── */
async function selectProject(si, pi) {
  const proj   = SKILLS[si].projects[pi];
  const cardEl = document.getElementById(`card-${si}-${pi}`);

  // Deactivate the previous card, activate the new one
  if (activeCard) activeCard.classList.remove("active");
  cardEl.classList.add("active");
  activeCard = cardEl;

  // Make sure the skill group is expanded
  const group = document.getElementById(`skill-${si}`);
  if (!group.classList.contains("open")) group.classList.add("open");

  // On mobile, scroll smoothly to the README viewer
  document.getElementById("readmePanel").scrollIntoView({ behavior: "smooth", block: "start" });

  // Show the project header + loading spinner immediately (instant feedback)
  renderReadmeShell(proj);

  // Build the raw GitHub URL and the repo URL
  const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${proj.name}/${proj.branch}/README.md`;
  const ghUrl  = `https://github.com/${GITHUB_USER}/${proj.name}`;

  // Serve from cache if already fetched — no unnecessary network request
  if (cache[rawUrl] !== undefined) {
    renderReadmeContent(cache[rawUrl], proj, ghUrl);
    return;
  }

  // Fetch the README and store the result in cache
  try {
    const res  = await fetch(rawUrl);
    const text = res.ok ? await res.text() : null;
    cache[rawUrl] = text;
    renderReadmeContent(text, proj, ghUrl);
  } catch {
    // Fetch failed (no network, CORS, etc.)
    cache[rawUrl] = null;
    renderReadmeContent(null, proj, ghUrl);
  }
}


/* ───────────────────────────────────────────────────────────────────
   renderReadmeShell
   Renders the right panel with the project header and a loading
   spinner before the README arrives — gives instant visual feedback.
─────────────────────────────────────────────────────────────────── */
function renderReadmeShell(proj) {
  document.getElementById("readmePanel").innerHTML = `
    <div class="readme-project-header">
      <div>
        <h2>${proj.name}</h2>
        <div class="readme-tech-tags">
          ${proj.techs.map(t => `<span class="readme-tech-tag">${t}</span>`).join("")}
        </div>
      </div>
      <div class="readme-header-actions">
        <a href="https://github.com/${GITHUB_USER}/${proj.name}"
           target="_blank"
           class="btn btn-dark"
           style="font-size:0.7rem; padding:0.5rem 1rem;">
          Open on GitHub ↗
        </a>
      </div>
    </div>
    <div class="readme-loading">
      <div class="spinner"></div>
      Fetching README.md…
    </div>
  `;
}


/* ───────────────────────────────────────────────────────────────────
   resolveImageUrl
   Converts any image URL found in a README into a URL the browser
   can actually load. There are three cases:

   1. Already absolute (https://...)
      → pass through unchanged.
      e.g. "https://i.imgur.com/abc.png" stays as-is.

   2. GitHub "blob" URL — the pretty viewer page you get when you
      click an image file on github.com. Browsers can't use the
      blob page as an image src, so we swap it for the raw CDN URL.
      e.g. "https://github.com/user/repo/blob/main/assets/img.png"
        →  "https://raw.githubusercontent.com/user/repo/main/assets/img.png"

   3. Relative path — the most common case when a README references
      images stored in the same repository.
      e.g. "assets/chess.png"
        →  "https://raw.githubusercontent.com/Talen400/42_fdf/main/assets/chess.png"
      We build the full URL using GITHUB_USER, the repo name, and
      the branch — information we already have from the SKILLS array.
─────────────────────────────────────────────────────────────────── */
function resolveImageUrl(src, proj) {
  // Case 1 & 2: already absolute
  if (src.startsWith("http://") || src.startsWith("https://")) {
    // Case 2: swap GitHub blob viewer URL for the raw CDN URL
    return src.replace(
      /https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\//,
      "https://raw.githubusercontent.com/$1/$2/"
    );
  }

  // Case 3: relative path → build absolute raw.githubusercontent.com URL.
  // Strip any leading "./" so "./assets/img.png" becomes "assets/img.png".
  const cleanSrc = src.replace(/^\.\//, "");
  return `https://raw.githubusercontent.com/${GITHUB_USER}/${proj.name}/${proj.branch}/${cleanSrc}`;
}


/* ───────────────────────────────────────────────────────────────────
   renderReadmeContent
   Replaces the spinner with the rendered README content,
   or with an error message if the fetch failed.

   The key addition here is a custom marked.js Renderer.
   marked.js lets you override how it converts specific Markdown
   tokens into HTML. By overriding the `image` method we intercept
   every ![alt](src) in the README and run resolveImageUrl on the
   src before the <img> tag is written — so images always point to
   the correct absolute GitHub CDN URL instead of breaking.
─────────────────────────────────────────────────────────────────── */
function renderReadmeContent(text, proj, ghUrl) {
  const panel  = document.getElementById("readmePanel");
  const headEl = panel.querySelector(".readme-project-header");
  const loadEl = panel.querySelector(".readme-loading");

  // Remove the spinner
  if (loadEl) loadEl.remove();

  if (!text) {
    // README not found or network error
    headEl.insertAdjacentHTML("afterend", `
      <div class="readme-not-found">
        <p>
          README.md not found.<br />
          Make sure the repository is public and the branch name is correct.
        </p>
        <a href="${ghUrl}" target="_blank"
           class="btn btn-ghost"
           style="display:inline-flex; margin-top:1rem; font-size:0.72rem;">
          View repository on GitHub ↗
        </a>
      </div>
    `);
    return;
  }

  // Build a custom renderer that fixes image URLs before they are
  // written into the final HTML. Every other token falls through to
  // marked's default handling — we only override images.
  const renderer = new marked.Renderer();
  renderer.image = (href, title, alt) => {
    const resolvedSrc = resolveImageUrl(href, proj);
    const titleAttr   = title ? ` title="${title}"` : "";
    // loading="lazy" skips loading images below the fold until the
    // user scrolls to them — makes initial render noticeably faster.
    return `<img src="${resolvedSrc}" alt="${alt}"${titleAttr} loading="lazy" />`;
  };

  marked.setOptions({ breaks: true, gfm: true, renderer });
  const html = marked.parse(text);

  headEl.insertAdjacentHTML("afterend", `
    <div class="readme-content">${html}</div>
  `);
}


/* ───────────────────────────────────────────────────────────────────
   INIT
   Called once when the script loads.
─────────────────────────────────────────────────────────────────── */
updateHeroStats();
renderSkills();

// Open the first skill group by default so visitors see something right away
document.getElementById("skill-0").classList.add("open");
