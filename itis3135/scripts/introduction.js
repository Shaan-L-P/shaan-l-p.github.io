
"use strict";

/*
 * Shaan Patel
 * ITIS3135 - Introduction Form
 *
 * This file handles form validation, course management,
 * image uploads, form submission, and generated introductions.
 */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("introduction-form");
    const formContainer = document.getElementById("form-container");
    const resultContainer = document.getElementById("result-container");
    const generatedIntroduction = document.getElementById("generated-introduction");
    const coursesContainer = document.getElementById("courses-container");

    const addCourseButton = document.getElementById("add-course");
    const clearButton = document.getElementById("clear-form");
    const resetLink = document.getElementById("reset-link");

    const originalImage = "images/brooklyn-bridge.jpg";

    let uploadedImage = null;
    let courseCounter = coursesContainer.querySelectorAll(".course-entry").length;

    /*
     * Creates an HTML element and safely adds text to it.
     */
    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined && text !== null) {
            element.textContent = text;
        }

        return element;
    }

    /*
     * Gets the value of a form field.
     */
    function getValue(name) {
        const field = form.elements.namedItem(name);
        return field ? field.value.trim() : "";
    }

    /*
     * Adds a new course to the form.
     */
    function addCourse() {
        courseCounter++;

        const courseEntry = createElement("div", "course-entry");

        const heading = createElement("h4", "", "Course " + courseCounter);
        courseEntry.appendChild(heading);

        const fields = [
            {
                name: "department",
                label: "Department",
                placeholder: "Example: ITIS"
            },
            {
                name: "courseNumber",
                label: "Course Number",
                placeholder: "Example: 3135"
            },
            {
                name: "courseTitle",
                label: "Course Name",
                placeholder: "Enter the course name"
            }
        ];

        fields.forEach(function (field) {
            const label = createElement("label", "", field.label + " *");
            const input = document.createElement("input");

            input.type = "text";
            input.name = field.name;
            input.placeholder = field.placeholder;
            input.required = true;

            courseEntry.appendChild(label);
            courseEntry.appendChild(input);
        });

        const reasonLabel = createElement(
            "label",
            "",
            "Reason for Taking the Course *"
        );

        const reasonInput = document.createElement("textarea");

        reasonInput.name = "reasonForTaking";
        reasonInput.placeholder = "Why are you taking this course?";
        reasonInput.required = true;

        courseEntry.appendChild(reasonLabel);
        courseEntry.appendChild(reasonInput);

        const deleteButton = createElement(
            "button",
            "delete-course-button",
            "Delete Course"
        );

        deleteButton.type = "button";

        deleteButton.addEventListener("click", function () {
            courseEntry.remove();
            updateCourseNumbers();
        });

        courseEntry.appendChild(deleteButton);
        coursesContainer.appendChild(courseEntry);
    }

    /*
     * Updates course headings after a course is deleted.
     */
    function updateCourseNumbers() {
        const courseEntries = coursesContainer.querySelectorAll(".course-entry");

        courseEntries.forEach(function (course, index) {
            course.querySelector("h4").textContent = "Course " + (index + 1);
        });

        courseCounter = courseEntries.length;
    }

    /*
     * Collects all course information.
     */
    function getCourses() {
        const courseEntries = coursesContainer.querySelectorAll(".course-entry");

        return Array.from(courseEntries).map(function (course) {
            return {
                department: course.querySelector('[name="department"]').value.trim(),
                courseNumber: course.querySelector('[name="courseNumber"]').value.trim(),
                courseTitle: course.querySelector('[name="courseTitle"]').value.trim(),
                reasonForTaking: course.querySelector('[name="reasonForTaking"]').value.trim()
            };
        });
    }

    /*
     * Collects the five footer links.
     */
    function getFooterLinks() {
        const links = [];

        for (let i = 1; i <= 5; i++) {
            links.push({
                label: getValue("link" + i + "Label"),
                url: getValue("link" + i + "Url")
            });
        }

        return links;
    }

    /*
     * Collects all introduction information into one data object.
     */
    function collectFormData() {
        return {
            firstName: getValue("firstName"),
            middleName: getValue("middleName"),
            nickname: getValue("nickname"),
            lastName: getValue("lastName"),

            acknowledgment: getValue("acknowledgment"),
            acknowledgmentDate: getValue("acknowledgmentDate"),

            prettyNameDivider: getValue("prettyNameDivider"),
            adjectives: getValue("adjectives"),
            animal: getValue("animal"),

            img: uploadedImage || originalImage,
            pictureAlt: getValue("pictureAlt"),
            caption: getValue("caption"),

            personalInfo: {
                statement: getValue("personalStatement"),
                personalBackground: getValue("personalStatement"),
                professionalBackground: getValue("professionalBackground"),
                academicBackground: getValue("academicBackground"),
                primaryWorkComputer: getValue("primaryWorkComputer"),
                primaryWorkLocation: getValue("primaryWorkLocation"),
                alternateComputerLocation: getValue("alternateComputerLocation"),
                interests: getValue("interests")
            },

            courses: getCourses(),

            quote: getValue("quote"),
            quoteAuthor: getValue("quoteAuthor"),

            funnyItem: getValue("funnyItem"),
            somethingToShare: getValue("somethingToShare"),

            footerLinks: getFooterLinks()
        };
    }

    /*
     * Creates a paragraph with a bold heading and regular text.
     */
    function createInformationParagraph(label, value) {
        const paragraph = document.createElement("p");
        const strong = createElement("strong", "", label + ": ");

        paragraph.appendChild(strong);
        paragraph.appendChild(document.createTextNode(value));

        return paragraph;
    }

    /*
     * Generates the introduction page using the collected form data.
     */
    function generateIntroduction(data) {
        generatedIntroduction.replaceChildren();

        const firstName = data.firstName;
        const lastName = data.lastName;

        const displayName = [firstName, data.middleName, lastName]
            .filter(Boolean)
            .join(" ");

        const preferredName = data.nickname
            ? " (" + data.nickname + ")"
            : "";

        const mascotName = data.adjectives + " " + data.animal;

        /*
         * Updates the browser tab title.
         */
        document.title =
            displayName + "'s " + mascotName +
            " | ITIS3135 | Introduction Form";

        /*
         * Student heading.
         */
        const studentHeading = createElement(
            "h6",
            "",
            displayName + preferredName +
            " " + data.prettyNameDivider + " " + mascotName
        );

        generatedIntroduction.appendChild(studentHeading);

        /*
         * Profile picture and caption.
         */
        const figure = createElement("figure", "profile-figure");

        const image = document.createElement("img");
        image.className = "profile-image";
        image.src = data.img;
        image.alt = data.pictureAlt;

        const caption = createElement("figcaption", "", data.caption);

        figure.appendChild(image);
        figure.appendChild(caption);

        generatedIntroduction.appendChild(figure);

        /*
         * Personal, professional, and academic information.
         */
        generatedIntroduction.appendChild(
            createInformationParagraph(
                "Personal Background",
                data.personalInfo.personalBackground
            )
        );

        generatedIntroduction.appendChild(
            createInformationParagraph(
                "Professional Background",
                data.personalInfo.professionalBackground
            )
        );

        generatedIntroduction.appendChild(
            createInformationParagraph(
                "Academic Background",
                data.personalInfo.academicBackground
            )
        );

        /*
         * Computer and work information.
         */
        generatedIntroduction.appendChild(
            createElement("h3", "", "Computer and Work Information")
        );

        generatedIntroduction.appendChild(
            createInformationParagraph(
                "Primary Work Computer",
                data.personalInfo.primaryWorkComputer
            )
        );

        generatedIntroduction.appendChild(
            createInformationParagraph(
                "Primary Work Location",
                data.personalInfo.primaryWorkLocation
            )
        );

        generatedIntroduction.appendChild(
            createInformationParagraph(
                "Alternate Computer",
                data.personalInfo.alternateComputerLocation
            )
        );

        /*
         * Courses and their nested descriptions.
         */
        generatedIntroduction.appendChild(
            createElement("h3", "", "Courses")
        );

        generatedIntroduction.appendChild(
            createElement("p", "", "Courses I'm Taking:")
        );

        const courseList = document.createElement("ol");

        data.courses.forEach(function (course) {
            const courseItem = document.createElement("li");

            courseItem.appendChild(
                document.createTextNode(
                    course.department + " " +
                    course.courseNumber + ": " +
                    course.courseTitle
                )
            );

            const reasonList = document.createElement("ol");
            const reasonItem = createElement(
                "li",
                "",
                course.reasonForTaking
            );

            reasonList.appendChild(reasonItem);
            courseItem.appendChild(reasonList);
            courseList.appendChild(courseItem);
        });

        generatedIntroduction.appendChild(courseList);

        /*
         * Interests.
         */
        generatedIntroduction.appendChild(
            createElement("h3", "", "Interests")
        );

        generatedIntroduction.appendChild(
            createElement("p", "", data.personalInfo.interests)
        );

        /*
         * Optional additional information.
         */
        if (data.funnyItem) {
            generatedIntroduction.appendChild(
                createInformationParagraph(
                    "Funny Thing",
                    data.funnyItem
                )
            );
        }

        if (data.somethingToShare) {
            generatedIntroduction.appendChild(
                createInformationParagraph(
                    "Something I Would Like to Share",
                    data.somethingToShare
                )
            );
        }

        /*
         * Quote and attribution.
         */
        const quote = document.createElement("blockquote");

        quote.appendChild(document.createTextNode(data.quote));

        const quoteCredit = createElement(
            "span",
            "quote-credit",
            "- " + data.quoteAuthor
        );

        quote.appendChild(quoteCredit);
        generatedIntroduction.appendChild(quote);

        /*
         * Footer links supplied by the visitor.
         */
        const footerLinks = createElement("section", "footer-links");

        const linksHeading = createElement(
            "h3",
            "",
            "My Links"
        );

        const linksList = document.createElement("ul");

        data.footerLinks.forEach(function (link) {
            const listItem = document.createElement("li");
            const anchor = document.createElement("a");

            anchor.textContent = link.label;
            anchor.href = link.url;
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";

            listItem.appendChild(anchor);
            linksList.appendChild(listItem);
        });

        footerLinks.appendChild(linksHeading);
        footerLinks.appendChild(linksList);

        generatedIntroduction.appendChild(footerLinks);
    }

    /*
     * Handles image uploads.
     * The original image is used when no new image is selected.
     */
    form.elements.picture.addEventListener("change", function () {
        const file = this.files[0];

        if (!file) {
            uploadedImage = null;
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            this.value = "";
            uploadedImage = null;
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            uploadedImage = event.target.result;
        };

        reader.onerror = function () {
            alert("There was a problem reading your image.");
            uploadedImage = null;
        };

        reader.readAsDataURL(file);
    });

    /*
     * Adds a new course when the Add Course button is clicked.
     */
    addCourseButton.addEventListener("click", function () {
        addCourse();
    });

    /*
     * Clears all form fields.
     */
    clearButton.addEventListener("click", function () {
        const fields = form.querySelectorAll("input, textarea");

        fields.forEach(function (field) {
            if (field.type !== "button" && field.type !== "submit" &&
                field.type !== "reset") {
                field.value = "";
            }
        });

        uploadedImage = null;

        updateCourseNumbers();
    });

    /*
     * Resets dynamically added courses after the native reset.
     * The original five courses and prefilled values are restored.
     */
    form.addEventListener("reset", function () {
        window.setTimeout(function () {
            const courseEntries =
                coursesContainer.querySelectorAll(".course-entry");

            courseEntries.forEach(function (course, index) {
                if (index >= 5) {
                    course.remove();
                }
            });

            updateCourseNumbers();
            uploadedImage = null;
        }, 0);
    });

    /*
     * Prevents the browser from performing its normal form submission.
     * The browser validates required fields before this event fires.
     */
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const introductionData = collectFormData();

        generateIntroduction(introductionData);

        formContainer.hidden = true;
        resultContainer.hidden = false;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    /*
     * Allows visitors to return to the form and start over.
     */
    resetLink.addEventListener("click", function (event) {
        event.preventDefault();

        form.reset();

        formContainer.hidden = false;
        resultContainer.hidden = true;

        generatedIntroduction.replaceChildren();

        document.title =
            "Shaan Patel's Silly Platypus | ITIS3135 | Introduction Form";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});
