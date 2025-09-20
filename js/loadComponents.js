// loadComponents.js
(function () {
  function run() {
    const origin = window.location.origin;   // e.g. http://localhost:5500
    const baseRoot = origin + "/";           // force root-base for resolving links

    // URLs for navbar and footer
    const navbarHtmlUrl = baseRoot + "navbar.html";
    const footerHtmlUrl = baseRoot + "footer.html";

    // ---- function to normalize paths ----
    function normalizedPath(pathname) {
      let p = (pathname || "").replace(/\/+$/, "");
      if (p === "") p = "/";
      if (p === "/") return "/index.html";   // treat root as index.html
      return p;
    }

    // ---- reusable loader ----
    function loadComponent(containerId, htmlUrl) {
      const container = document.getElementById(containerId);
      if (!container) return;

      fetch(htmlUrl)
        .then(res => {
          if (!res.ok) throw new Error(`${containerId} not found at ${htmlUrl} (status ${res.status})`);
          return res.text();
        })
        .then(html => {
          container.innerHTML = html;

          // Fix all <a> links inside so they’re root-based
          const links = container.querySelectorAll("a[href]");
          const currentPath = normalizedPath(window.location.pathname);

          links.forEach(link => {
            const rawHref = link.getAttribute("href") || "";
            let resolved;
            try {
              resolved = new URL(rawHref, baseRoot); // force resolve relative -> absolute
            } catch (e) {
              return;
            }
            link.href = resolved.href;

            // Active state highlight
            const linkPath = normalizedPath(resolved.pathname);
            if (linkPath === currentPath) {
              link.classList.add("active");
              if (link.parentElement) link.parentElement.classList.add("active");
            }
          });

          // event dispatch if needed
          window.dispatchEvent(new CustomEvent(containerId + "Loaded", { detail: { url: htmlUrl } }));
        })
        .catch(err => console.error(`Error loading ${containerId}:`, err));
    }

    // Load navbar + footer
    loadComponent("navbar", navbarHtmlUrl);
    loadComponent("footer", footerHtmlUrl);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
