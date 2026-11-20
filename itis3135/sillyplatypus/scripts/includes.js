// Load the shared header and footer components.
// Keeping both components in one folder makes the business-site layout reusable.
document.addEventListener("DOMContentLoaded", async function () {
    const placeholders = Array.from(document.querySelectorAll("[data-include]"));

    await Promise.all(placeholders.map(async function (placeholder) {
        const file = placeholder.getAttribute("data-include");

        try {
            const response = await fetch(file);
            if (!response.ok) {
                throw new Error("Could not load " + file);
            }

            const html = await response.text();
            const template = document.createElement("template");
            template.innerHTML = html.trim();
            placeholder.replaceWith(template.content);

            if (file.endsWith("header.html")) {
                const currentPage = window.location.pathname.split("/").pop() || "index.html";
                document.querySelectorAll("header nav a").forEach(function (link) {
                    if (link.getAttribute("href") === currentPage) {
                        link.setAttribute("aria-current", "page");
                    }
                });
            }
        } catch (error) {
            console.error(error);
        }
    }));

    // Run the standards checker only after the shared header and footer are in the page.
    const checker = document.createElement("script");
    checker.src = "https://divonbriesen.github.io/teaching/tools/standards-check.js";
    checker.defer = true;
    document.body.appendChild(checker);
});