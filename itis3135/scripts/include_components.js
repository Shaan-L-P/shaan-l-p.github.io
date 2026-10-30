// Load the shared header and footer fragments into their placeholders.
// Each placeholder uses a data-include attribute containing a path relative
// to the current page in the itis3135 directory.

async function loadComponents() {
    const placeholders = document.querySelectorAll("[data-include]");

    const loadTasks = Array.from(placeholders, async function (placeholder) {
        const filePath = placeholder.getAttribute("data-include");

        try {
            const response = await fetch(filePath);

            if (!response.ok) {
                throw new Error("Unable to load " + filePath + ": " + response.status);
            }

            const html = await response.text();
            const template = document.createElement("template");

            template.innerHTML = html;
            placeholder.replaceWith(template.content);
        } catch (error) {
            console.error("Component loading error:", error);
        }
    });

    await Promise.all(loadTasks);
}

loadComponents();