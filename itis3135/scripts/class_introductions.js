/*
 * Class Introductions loads classmates' introduction submissions from the shared
 * class API and turns the submitted information into a searchable yearbook.
 * Text is inserted with textContent/createElement so submitted content is
 * displayed as text rather than interpreted as HTML.
 */
(function () {
    "use strict";

    const API_URL = "https://intro-form.tommyhost.ing/";

    const searchInput = document.getElementById("profile-search");
    const sortSelect = document.getElementById("profile-sort");
    const refreshButton = document.getElementById("refresh-profiles");
    const statusMessage = document.getElementById("profiles-status");
    const profileCount = document.getElementById("profile-count");
    const profileGrid = document.getElementById("profile-grid");
    const emptyState = document.getElementById("empty-state");

    const state = { profiles: [], searchTerm: "", sortOrder: "name" };

    function getText(value) {
        if (value === null || value === undefined) return "";
        return String(value).trim();
    }

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text !== undefined && text !== null) element.textContent = String(text);
        return element;
    }

    function makeSafeUrl(value) {
        const rawUrl = getText(value);
        if (!rawUrl) return "";

        try {
            const parsedUrl = new URL(rawUrl);
            if (parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:") {
                return parsedUrl.href;
            }
        } catch (error) {
            return "";
        }

        return "";
    }

    function makeSafeImageSource(value) {
        const source = getText(value);
        if (/^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(source)) return source;
        return makeSafeUrl(source);
    }

    function getDisplayName(profile) {
        const data = profile.data;
        const parts = [data.firstName, data.middleName, data.lastName]
            .map(getText).filter(Boolean);
        return parts.join(" ") || profile.username || "Classmate";
    }

    function getSearchText(profile) {
        const data = profile.data;
        const personalInfo = data.personalInfo && typeof data.personalInfo === "object"
            ? data.personalInfo : {};

        return [
            profile.username, data.firstName, data.middleName, data.nickname,
            data.lastName, data.adjectives, data.animal, data.caption, data.quote,
            data.quoteAuthor, personalInfo.statement, personalInfo.personalBackground,
            personalInfo.professionalBackground, personalInfo.academicBackground,
            personalInfo.interests
        ].map(getText).join(" ").toLowerCase();
    }

    function normalizeSubmissions(payload) {
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];

        return Object.entries(payload).map(function (entry) {
            const username = entry[0];
            const record = entry[1];
            const data = record && record.introductionData;

            if (!data || typeof data !== "object" || Array.isArray(data)) return null;

            return { username: getText(username), record: record, data: data };
        }).filter(Boolean);
    }

    function formatDate(value) {
        const rawDate = getText(value);
        if (!rawDate) return "";

        const date = new Date(rawDate);
        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric"
        });
    }

    function addInformation(container, label, value) {
        const text = getText(value);
        if (!text) return;

        const paragraph = createElement("p");
        const strong = createElement("strong", "", label + ": ");
        paragraph.append(strong, document.createTextNode(text));
        container.appendChild(paragraph);
    }

    function addSectionHeading(container, headingText) {
        container.appendChild(createElement("h4", "", headingText));
    }

    function buildCourses(container, courses) {
        if (!Array.isArray(courses) || courses.length === 0) return;

        addSectionHeading(container, "Courses");
        const list = createElement("ul");

        courses.forEach(function (course) {
            if (!course || typeof course !== "object") return;

            const department = getText(course.department);
            const number = getText(course.courseNumber);
            const title = getText(course.courseTitle);
            const courseName = [department, number].filter(Boolean).join(" ");
            const fullTitle = [courseName, title].filter(Boolean).join(": ");
            if (!fullTitle) return;

            const item = createElement("li", "course-item");
            item.appendChild(createElement("strong", "", fullTitle));

            const reason = getText(course.reasonForTaking);
            if (reason) item.appendChild(createElement("p", "course-reason", reason));
            list.appendChild(item);
        });

        if (list.children.length > 0) container.appendChild(list);
    }

    function buildFooterLinks(container, links) {
        if (!Array.isArray(links) || links.length === 0) return;

        const safeLinks = links.filter(function (link) {
            return link && typeof link === "object" && makeSafeUrl(link.url);
        });
        if (safeLinks.length === 0) return;

        addSectionHeading(container, "Links");
        const linkList = createElement("div", "profile-links");

        safeLinks.forEach(function (link) {
            const anchor = createElement("a", "", getText(link.label) || "Website");
            anchor.href = makeSafeUrl(link.url);
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
            linkList.appendChild(anchor);
        });

        container.appendChild(linkList);
    }

    function buildProfileDetails(profile) {
        const data = profile.data;
        const personalInfo = data.personalInfo && typeof data.personalInfo === "object"
            ? data.personalInfo : {};
        const details = createElement("details", "profile-details");
        const summary = createElement("summary", "",
            "More about " + (getText(data.firstName) || "this classmate"));
        const content = createElement("div", "details-section");

        details.appendChild(summary);

        addInformation(content, "Personal background",
            personalInfo.personalBackground || personalInfo.statement);
        addInformation(content, "Professional background", personalInfo.professionalBackground);
        addInformation(content, "Academic background", personalInfo.academicBackground);
        addInformation(content, "Interests", personalInfo.interests);
        addInformation(content, "Primary work computer", personalInfo.primaryWorkComputer);
        addInformation(content, "Primary work location", personalInfo.primaryWorkLocation);
        addInformation(content, "Alternate computer or location", personalInfo.alternateComputerLocation);

        buildCourses(content, data.courses);
        addInformation(content, "Something to share", data.somethingToShare);
        addInformation(content, "Funny thing", data.funnyItem);
        buildFooterLinks(content, data.footerLinks);

        if (content.children.length > 0) details.appendChild(content);
        else details.hidden = true;

        const originalJsonUrl = makeSafeUrl(profile.record.jsonUrl);
        if (originalJsonUrl) {
            const originalLink = createElement("a", "original-submission",
                "View original introduction data");
            originalLink.href = originalJsonUrl;
            originalLink.target = "_blank";
            originalLink.rel = "noopener noreferrer";
            details.appendChild(originalLink);
        }

        return details;
    }

    function buildProfileCard(profile) {
        const data = profile.data;
        const personalInfo = data.personalInfo && typeof data.personalInfo === "object"
            ? data.personalInfo : {};
        const card = createElement("article", "profile-card");
        const imageSource = makeSafeImageSource(data.img);
        const displayName = getDisplayName(profile);
        const imageAlt = getText(data.pictureAlt) || ("Profile picture for " + displayName);

        if (imageSource) {
            const image = createElement("img", "profile-image");
            image.src = imageSource;
            image.alt = imageAlt;
            image.loading = "lazy";
            image.decoding = "async";
            image.addEventListener("error", function () {
                const placeholder = createElement("div", "avatar-placeholder", "🦆");
                placeholder.setAttribute("role", "img");
                placeholder.setAttribute("aria-label", "No profile image available");
                image.replaceWith(placeholder);
            }, {once: true});
            card.appendChild(image);
        } else {
            const placeholder = createElement("div", "avatar-placeholder", "🦆");
            placeholder.setAttribute("role", "img");
            placeholder.setAttribute("aria-label", "No profile image provided");
            card.appendChild(placeholder);
        }

        const content = createElement("div", "profile-content");
        content.appendChild(createElement("p", "profile-eyebrow", "Pond resident"));
        content.appendChild(createElement("h3", "profile-name", displayName));

        const nickname = getText(data.nickname);
        if (nickname) {
            content.appendChild(createElement("p", "preferred-name", "Goes by “" + nickname + "”"));
        }

        const mascot = [getText(data.adjectives), getText(data.animal)].filter(Boolean).join(" ");
        if (mascot) content.appendChild(createElement("p", "mascot-tag", mascot));

        const caption = getText(data.caption);
        if (caption) content.appendChild(createElement("p", "picture-caption", caption));

        const statement = getText(personalInfo.statement)
            || getText(personalInfo.personalBackground)
            || getText(personalInfo.interests);
        if (statement) content.appendChild(createElement("p", "personal-summary", statement));

        const quote = getText(data.quote);
        if (quote) {
            const quoteBlock = createElement("blockquote", "profile-quote");
            quoteBlock.appendChild(createElement("p", "", quote));

            const quoteAuthor = getText(data.quoteAuthor);
            if (quoteAuthor) {
                quoteBlock.appendChild(createElement("cite", "quote-credit", "“ " + quoteAuthor + " ”"));
            }

            content.appendChild(quoteBlock);
        }

        const meta = createElement("div", "profile-meta");
        const courses = Array.isArray(data.courses) ? data.courses.filter(Boolean) : [];
        if (courses.length > 0) {
            meta.appendChild(createElement("span", "",
                courses.length + (courses.length === 1 ? " course" : " courses")));
        }

        const updated = formatDate(profile.record.lastUpdated);
        if (updated) {
            const date = createElement("time", "", "Updated " + updated);
            date.dateTime = getText(profile.record.lastUpdated);
            meta.appendChild(date);
        }

        if (meta.children.length > 0) content.appendChild(meta);
        content.appendChild(buildProfileDetails(profile));
        card.appendChild(content);

        return card;
    }

    function renderProfiles() {
        const term = state.searchTerm.toLowerCase();
        const visibleProfiles = state.profiles.filter(function (profile) {
            return !term || getSearchText(profile).includes(term);
        });

        visibleProfiles.sort(function (first, second) {
            if (state.sortOrder === "recent") {
                const firstTime = Date.parse(getText(first.record.lastUpdated)) || 0;
                const secondTime = Date.parse(getText(second.record.lastUpdated)) || 0;
                return secondTime - firstTime;
            }

            return getDisplayName(first).localeCompare(getDisplayName(second), undefined, {
                sensitivity: "base"
            });
        });

        profileGrid.replaceChildren();
        visibleProfiles.forEach(function (profile) {
            profileGrid.appendChild(buildProfileCard(profile));
        });

        profileCount.textContent = visibleProfiles.length + " of " + state.profiles.length +
            (state.profiles.length === 1 ? " profile" : " profiles");
        emptyState.hidden = visibleProfiles.length !== 0 || state.profiles.length === 0;

        if (state.profiles.length > 0) {
            statusMessage.textContent = term
                ? "Showing matches for “" + state.searchTerm + "”."
                : "Browse the introductions submitted by our class.";
        }
    }

    async function loadProfiles() {
        refreshButton.disabled = true;
        refreshButton.textContent = "Loading...";
        statusMessage.textContent = "Loading class introductions from the shared API...";
        profileCount.textContent = "";
        emptyState.hidden = true;
        profileGrid.replaceChildren();

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: {Accept: "application/json"},
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error("The introduction server responded with status " + response.status + ".");
            }

            const payload = await response.json();
            state.profiles = normalizeSubmissions(payload);

            if (state.profiles.length === 0) {
                statusMessage.textContent = "No class introductions are available yet.";
                profileCount.textContent = "0 profiles";
                emptyState.hidden = false;
                emptyState.querySelector("h3").textContent = "The pond is quiet";
                emptyState.querySelector("p").textContent =
                    "No valid introduction submissions were returned. Check back after classmates submit their forms.";
                return;
            }

            emptyState.querySelector("h3").textContent = "No profiles found";
            emptyState.querySelector("p").textContent =
                "Try another search, or check back after more classmates submit their introductions.";
            renderProfiles();
        } catch (error) {
            state.profiles = [];
            profileGrid.replaceChildren();
            profileCount.textContent = "";
            emptyState.hidden = false;
            emptyState.querySelector("h3").textContent = "Yearbook could not load";
            emptyState.querySelector("p").textContent =
                "The class introduction service could not be reached. Check your connection and use the refresh button to try again.";
            statusMessage.textContent = "Unable to load introductions right now.";
        } finally {
            refreshButton.disabled = false;
            refreshButton.textContent = "Refresh yearbook";
        }
    }

    searchInput.addEventListener("input", function () {
        state.searchTerm = searchInput.value.trim();
        renderProfiles();
    });

    sortSelect.addEventListener("change", function () {
        state.sortOrder = sortSelect.value;
        renderProfiles();
    });

    refreshButton.addEventListener("click", loadProfiles);
    loadProfiles();
}());