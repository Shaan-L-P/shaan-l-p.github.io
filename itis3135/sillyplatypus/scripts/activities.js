/* Silly Platypus interactive features.
   This file powers the activity finder, temporary field journal,
   and sample kit price calculator on activities.html. */

document.addEventListener("DOMContentLoaded", function () {
    // Feature 1: filter activities by setting and experience level.
    const settingFilter = document.getElementById("activity-setting");
    const levelFilter = document.getElementById("activity-level");
    const activityCards = document.querySelectorAll(".activity-card");
    const activityStatus = document.getElementById("activity-status");

    function filterActivities() {
        if (!settingFilter || !levelFilter || !activityStatus) return;

        const selectedSetting = settingFilter.value;
        const selectedLevel = levelFilter.value;
        let visibleCount = 0;

        activityCards.forEach(function (card) {
            const settings = card.dataset.setting.split(" ");
            const levels = card.dataset.level.split(" ");
            const matchesSetting = selectedSetting === "all" || settings.includes(selectedSetting);
            const matchesLevel = selectedLevel === "all" || levels.includes(selectedLevel);
            const shouldShow = matchesSetting && matchesLevel;

            card.hidden = !shouldShow;
            if (shouldShow) visibleCount += 1;
        });

        activityStatus.textContent = visibleCount + (visibleCount === 1
            ? " activity matches your choices."
            : " activities match your choices.");
    }

    if (settingFilter && levelFilter) {
        settingFilter.addEventListener("change", filterActivities);
        levelFilter.addEventListener("change", filterActivities);
        filterActivities();
    }

    // Feature 2: add and remove journal entries in the current page session only.
    const observationForm = document.getElementById("observation-form");
    const observationList = document.getElementById("observation-list");
    const observationStatus = document.getElementById("observation-status");
    const observationDate = document.getElementById("observation-date");

    function localDateValue() {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return today.getFullYear() + "-" + month + "-" + day;
    }

    if (observationDate && !observationDate.value) {
        observationDate.value = localDateValue();
    }

    if (observationForm && observationList && observationStatus) {
        observationForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const title = document.getElementById("observation-title").value.trim();
            const dateValue = observationDate.value;
            const details = document.getElementById("observation-details").value.trim();

            if (!title || !dateValue || !details) {
                observationStatus.textContent = "Please complete all three journal fields.";
                return;
            }

            // Use textContent for visitor-entered text so it is displayed safely as text.
            const entry = document.createElement("li");
            const entryTitle = document.createElement("strong");
            const entryDate = document.createElement("time");
            const entryDetails = document.createElement("p");
            const removeButton = document.createElement("button");

            entryTitle.textContent = title;
            entryDate.dateTime = dateValue;
            entryDate.textContent = new Date(dateValue + "T12:00:00").toLocaleDateString();
            entryDetails.textContent = details;
            removeButton.type = "button";
            removeButton.className = "observation-remove";
            removeButton.dataset.removeObservation = "true";
            removeButton.textContent = "Remove entry";

            entry.appendChild(entryTitle);
            entry.appendChild(entryDate);
            entry.appendChild(entryDetails);
            entry.appendChild(removeButton);
            observationList.appendChild(entry);

            observationForm.reset();
            observationDate.value = localDateValue();
            observationStatus.textContent = "Your observation was added to this visit's journal.";
        });

        observationList.addEventListener("click", function (event) {
            const removeButton = event.target.closest("button[data-remove-observation]");
            if (removeButton) {
                removeButton.closest("li").remove();
                observationStatus.textContent = "Journal entry removed.";
            }
        });
    }

    // Feature 3: calculate a sample total and item summary for a custom kit.
    const starterKit = document.getElementById("kit-base");
    const extras = document.querySelectorAll('input[name="kit-extra"]');
    const totalOutput = document.getElementById("kit-total");
    const kitSummary = document.getElementById("kit-summary");

    function updateKitEstimate() {
        if (!starterKit || !totalOutput || !kitSummary) return;

        let total = Number(starterKit.value);
        const selectedNames = [];
        const selectedOption = starterKit.options[starterKit.selectedIndex];

        if (total > 0) selectedNames.push(selectedOption.dataset.name);

        extras.forEach(function (extra) {
            if (extra.checked) {
                total += Number(extra.value);
                selectedNames.push(extra.dataset.name);
            }
        });

        totalOutput.textContent = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(total);

        kitSummary.replaceChildren();
        if (selectedNames.length === 0) {
            const emptyMessage = document.createElement("li");
            emptyMessage.textContent = "No items selected yet.";
            kitSummary.appendChild(emptyMessage);
            return;
        }

        selectedNames.forEach(function (name) {
            const item = document.createElement("li");
            item.textContent = name;
            kitSummary.appendChild(item);
        });
    }

    if (starterKit && totalOutput && kitSummary) {
        starterKit.addEventListener("change", updateKitEstimate);
        extras.forEach(function (extra) {
            extra.addEventListener("change", updateKitEstimate);
        });
        updateKitEstimate();
    }
});