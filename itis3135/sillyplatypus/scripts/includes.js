// Load the shared header and footer so every page uses the same site components.
document.addEventListener("DOMContentLoaded", function () {
    const includes = document.querySelectorAll("[data-include]");

    includes.forEach(function (placeholder) {
        const file = placeholder.getAttribute("data-include");

        fetch(file)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Could not load " + file);
                }
                return response.text();
            })
            .then(function (html) {
                placeholder.outerHTML = html;

                if (file.endsWith("header.html")) {
                    const currentPage = window.location.pathname.split("/").pop() || "index.html";
                    document.querySelectorAll("header nav a").forEach(function (link) {
                        if (link.getAttribute("href") === currentPage) {
                            link.setAttribute("aria-current", "page");
                        }
                    });
                }
            })
            .catch(function (error) {
                console.error(error);
            });
    });
});