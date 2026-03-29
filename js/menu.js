(() => {
    const templateCache = new Map();
    let overlay = null;
    let activeMenuName = null;

    function ensureOverlay() {
        if (overlay) {
            return overlay;
        }

        overlay = document.createElement("div");
        overlay.className = "overlay";
        overlay.setAttribute("aria-hidden", "true");

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                closeMenu();
            }
        });

        document.body.appendChild(overlay);
        return overlay;
    }

    function closeMenu() {
        if (!overlay) {
            return;
        }

        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("menu-opened");
        activeMenuName = null;
        overlay.replaceChildren();
    }

    async function loadMenuTemplate(menuName) {
        if (templateCache.has(menuName)) {
            return templateCache.get(menuName);
        }

        const fileName = menuName.endsWith(".html") ? menuName : `${menuName}.html`;
        const response = await fetch(`/static/menus/${fileName}`);
        if (!response.ok) {
            throw new Error(`Не удалось загрузить меню: ${menuName}`);
        }

        const html = await response.text();
        templateCache.set(menuName, html);
        return html;
    }

    async function openMenu(menuName) {
        if (!menuName) {
            return;
        }

        const currentOverlay = ensureOverlay();

        if (activeMenuName === menuName && currentOverlay.classList.contains("is-open")) {
            return;
        }

        try {
            const html = await loadMenuTemplate(menuName);

            currentOverlay.replaceChildren();
            currentOverlay.insertAdjacentHTML("beforeend", html);
            currentOverlay.classList.add("is-open");
            currentOverlay.setAttribute("aria-hidden", "false");
            document.body.classList.add("menu-opened");
            activeMenuName = menuName;
        } catch (error) {
            console.error(error);
        }
    }

    document.addEventListener("click", (event) => {
        const trigger = event.target.closest("[menu]");
        if (!trigger) {
            return;
        }

        event.preventDefault();
        const menuName = trigger.getAttribute("menu");
        openMenu(menuName);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
})();
