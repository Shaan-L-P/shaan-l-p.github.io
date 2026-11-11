
"use strict";

/*
 * Shaan Patel
 * ITIS3135 - Introduction Form
 *
 * This file handles:
 * - Form validation and submission
 * - Course addition, deletion, and numbering
 * - Image uploads and image previews
 * - Generation of HTML, JSON, and XML
 * - Form reset and clear functionality
 * - Creation of the generated introduction
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

    const pictureInput = document.getElementById("picture");
    const picturePreview = document.getElementById("picture-preview");
    const pictureAltInput = document.getElementById("pictureAlt");
    const captionInput = document.getElementById("caption");
    const pictureCaptionPreview = document.getElementById("picture-caption-preview");

    const generateHTMLButton = document.getElementById("generate-html");
    const generateJSONButton = document.getElementById("generate-json");
    const generateXMLButton = document.getElementById("generate-xml");

    const generatedDataContainer = document.getElementById("generated-data-container");
    const generatedDataOutput = document.getElementById("generated-data");

    const studentHeading = document.querySelector("body > h6");
    const originalStudentHeading = studentHeading
        ? studentHeading.textContent
        : "";

    const originalImage = "images/brooklyn-bridge.jpg";

    /*
     * Keep the original five courses so the Reset button
     * can restore them even if the user deletes them.
     */
    const originalCoursesHTML = coursesContainer.innerHTML;

    let uploadedImage = null;

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
     * Gets the value of an individual form field.
     */
    function getValue(name) {
        const field = form.elements.namedItem(name);

        return field && typeof field.value === "string"
            ? field.value.trim()
            : "";
    }

    /*
     * Updates the profile picture preview, alternative text,
     * and caption using the current form values.
     */
    function updatePicturePreview() {
        if (picturePreview) {
            picturePreview.src = uploadedImage || originalImage;
            picturePreview.alt = getValue("pictureAlt");
        }

        if (pictureCaptionPreview && captionInput) {
            pictureCaptionPreview.textContent = captionInput.value.trim();
        }
    }

    /*
     * Updates the course headings, field IDs, label connections,
     * and delete buttons.
     *
     * This function is defined before addCourse so it can be
     * called without triggering the no-use-before-define warning.
     */
    function updateCourseNumbers() {
        const courseEntries =
            coursesContainer.querySelectorAll(".course-entry");

        courseEntries.forEach(function (course, index) {
            const courseNumber = index + 1;
            const heading = course.querySelector("h4");

            if (heading) {
                heading.textContent = "Course " + courseNumber;
                heading.classList.add("course-title");
            }

            /*
             * Give each course field a unique ID and connect
             * its label to the corresponding input.
             */
            const fields = course.querySelectorAll(
                'input[name], textarea[name]'
            );

            fields.forEach(function (field) {
                const fieldId =
                    "course-" + courseNumber + "-" + field.name;

                field.id = fieldId;

                const label = field.previousElementSibling;

                if (label && label.tagName === "LABEL") {
                    label.htmlFor = fieldId;
                }
            });

            /*
             * Add a delete button if the course does not already
             * have one.
             */
            let deleteButton =
                course.querySelector(".delete-course-button");

            if (!deleteButton) {
                deleteButton = createElement(
                    "button",
                    "delete-course-button",
                    "Delete Course"
                );

                deleteButton.type = "button";

                deleteButton.addEventListener("click", function () {
                    const currentCourses =
                        coursesContainer.querySelectorAll(".course-entry");

                    if (currentCourses.length <= 1) {
                        alert("At least one course must remain.");
                        return;
                    }

                    course.remove();
                    updateCourseNumbers();
                });

                course.appendChild(deleteButton);
            }
        });
    }

    /*
     * Adds a new course to the form.
     */
    function addCourse() {
        const courseEntry = createElement("div", "course-entry");

        const heading = createElement(
            "h4",
            "course-title",
            "New Course"
        );

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
            const label = createElement(
                "label",
                "",
                field.label + " *"
            );

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

        coursesContainer.appendChild(courseEntry);

        updateCourseNumbers();
    }

    /*
     * Collects all course information.
     */
    function getCourses() {
        const courseEntries =
            coursesContainer.querySelectorAll(".course-entry");

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
     * Creates the complete display name.
     */
    function getDisplayName(data) {
        return [
            data.firstName,
            data.middleName,
            data.lastName
        ].filter(Boolean).join(" ");
    }

    /*
     * Updates the student heading outside the main content.
     */
    function updateStudentHeading(data) {
        if (!studentHeading) {
            return;
        }

        const displayName = getDisplayName(data);

        const preferredName = data.nickname
            ? " (" + data.nickname + ")"
            : "";

        const mascotName = data.adjectives + " " + data.animal;

        studentHeading.textContent =
            displayName + preferredName +
            " " + data.prettyNameDivider + " " + mascotName;
    }

    /*
     * Creates a paragraph with a bold heading and regular text.
     */
    function createInformationParagraph(label, value) {
        const paragraph = document.createElement("p");

        const strong = createElement(
            "strong",
            "",
            label + ": "
        );

        paragraph.appendChild(strong);
        paragraph.appendChild(document.createTextNode(value));

        return paragraph;
    }

    /*
     * Generates the introduction page using the collected form data.
     * The destination parameter determines where the content is placed.
     */
    function generateIntroduction(data, destination) {
        destination.replaceChildren();

        /*
         * Profile picture and caption.
         */
        const figure = createElement("figure", "profile-figure");

        const image = document.createElement("img");

        image.className = "profile-image";
        image.src = data.img;
        image.alt = data.pictureAlt;

        const caption = createElement(
            "figcaption",
            "",
            data.caption
        );

        figure.appendChild(image);
        figure.appendChild(caption);

        destination.appendChild(figure);

        /*
         * Personal, professional, and academic information.
         */
        destination.appendChild(
            createInformationParagraph(
                "Personal Background",
                data.personalInfo.personalBackground
            )
        );

        destination.appendChild(
            createInformationParagraph(
                "Professional Background",
                data.personalInfo.professionalBackground
            )
        );

        destination.appendChild(
            createInformationParagraph(
                "Academic Background",
                data.personalInfo.academicBackground
            )
        );

        /*
         * Computer and work information.
         */
        destination.appendChild(
            createElement(
                "h3",
                "",
                "Computer and Work Information"
            )
        );

        destination.appendChild(
            createInformationParagraph(
                "Primary Work Computer",
                data.personalInfo.primaryWorkComputer
            )
        );

        destination.appendChild(
            createInformationParagraph(
                "Primary Work Location",
                data.personalInfo.primaryWorkLocation
            )
        );

        destination.appendChild(
            createInformationParagraph(
                "Alternate Computer",
                data.personalInfo.alternateComputerLocation
            )
        );

        /*
         * Courses and their nested descriptions.
         */
        destination.appendChild(
            createElement("h3", "", "Courses")
        );

        destination.appendChild(
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

        destination.appendChild(courseList);

        /*
         * Interests.
         */
        destination.appendChild(
            createElement("h3", "", "Interests")
        );

        destination.appendChild(
            createElement(
                "p",
                "",
                data.personalInfo.interests
            )
        );

        /*
         * Optional additional information.
         */
        if (data.funnyItem) {
            destination.appendChild(
                createInformationParagraph(
                    "Funny Thing",
                    data.funnyItem
                )
            );
        }

        if (data.somethingToShare) {
            destination.appendChild(
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

        quote.appendChild(
            document.createTextNode(data.quote)
        );

        const quoteCredit = createElement(
            "span",
            "quote-credit",
            "- " + data.quoteAuthor
        );

        quote.appendChild(quoteCredit);
        destination.appendChild(quote);

        /*
         * Footer links supplied by the visitor.
         */
        const footerLinks = createElement(
            "section",
            "footer-links"
        );

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

            /*
             * Open external websites in a new tab.
             * Internal links stay in the current tab.
             */
            const destinationURL = new URL(
                link.url,
                window.location.href
            );

            if (destinationURL.origin !== window.location.origin) {
                anchor.target = "_blank";
                anchor.rel = "noopener noreferrer";
            }

            listItem.appendChild(anchor);
            linksList.appendChild(listItem);
        });

        footerLinks.appendChild(linksHeading);
        footerLinks.appendChild(linksList);

        destination.appendChild(footerLinks);
    }

    /*
     * Checks the form before generating HTML, JSON, or XML.
     */
    function getValidatedFormData() {
        if (!form.checkValidity()) {
            form.reportValidity();
            return null;
        }

        return collectFormData();
    }

    /*
     * Escapes HTML special characters.
     * This prevents user-entered text from being interpreted as markup.
     */
    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    /*
     * Generates a complete HTML document from the form data.
     */
    function generateHTML(data) {
        const temporaryContainer = document.createElement("div");

        generateIntroduction(data, temporaryContainer);

        const displayName = getDisplayName(data);

        const preferredName = data.nickname
            ? " (" + data.nickname + ")"
            : "";

        const mascotName = data.adjectives + " " + data.animal;

        const siteName =
            displayName + "'s " + mascotName + " | ITIS3135";

        const title = siteName + " | Introduction";

        const headingText =
            displayName + preferredName +
            " " + data.prettyNameDivider + " " + mascotName;

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(title)}</title>

    <style>
        body {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px 15px;
            background-color: #b8d8fb;
            color: #2a2a3a;
            font-family: Helvetica, Arial, sans-serif;
            line-height: 1.6;
        }

        h1, h2, h3, h6 {
            font-family: Montserrat, Helvetica, sans-serif;
            color: #244f73;
        }

        h1 {
            color: #2e3f9c;
            background-color: #b8c8fa;
            border-radius: 999px;
            padding: 20px 30px;
            text-align: center;
        }

        h2 {
            border-bottom: 4px dashed #2e3f9c;
            padding-bottom: 10px;
        }

        h6 {
            font-size: 1.5rem;
            text-align: center;
        }

        p, ol {
            font-size: 1.2rem;
            line-height: 1.6;
        }

        .profile-figure {
            text-align: center;
            margin: 20px auto 35px;
        }

        .profile-image {
            display: block;
            width: 100%;
            max-width: 300px;
            height: auto;
            margin: 0 auto;
            border-radius: 8px;
        }

        figcaption {
            margin-top: 8px;
            font-style: italic;
        }

        blockquote {
            margin: 30px 20px;
            padding: 20px 25px;
            border-left: 5px solid #2e3f9c;
            border-radius: 8px;
            background-color: #b8c8fa;
            font-size: 1.2rem;
        }

        .quote-credit {
            display: block;
            margin-top: 10px;
            font-style: italic;
            text-align: right;
        }

        a, a:visited {
            color: #2e3f9c;
            font-weight: bold;
        }

        a:hover, a:focus {
            color: #2e1f66;
        }

        footer {
            margin-top: 35px;
            padding-top: 20px;
            border-top: 4px dashed #2e3f9c;
        }
    </style>
</head>

<body>
    <header>
        <h1>${escapeHTML(siteName)}</h1>
    </header>

    <h6>${escapeHTML(headingText)}</h6>

    <main>
        <h2>Introduction</h2>
        ${temporaryContainer.innerHTML}
    </main>
</body>
</html>`;
    }

    /*
     * Generates formatted JSON from the form data.
     */
    function generateJSON(data) {
        return JSON.stringify(data, null, 4);
    }

    /*
     * Escapes XML special characters.
     */
    function escapeXML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    /*
     * Creates an XML element with the correct indentation.
     */
    function createXMLElement(name, value, indentation) {
        return indentation +
            "<" + name + ">" +
            escapeXML(value) +
            "</" + name + ">";
    }

    /*
     * Generates structured XML from the form data.
     */
    function generateXML(data) {
        const lines = [];

        lines.push('<?xml version="1.0" encoding="UTF-8"?>');
        lines.push("<introduction>");

        lines.push(createXMLElement(
            "firstName",
            data.firstName,
            "    "
        ));

        lines.push(createXMLElement(
            "middleName",
            data.middleName,
            "    "
        ));

        lines.push(createXMLElement(
            "nickname",
            data.nickname,
            "    "
        ));

        lines.push(createXMLElement(
            "lastName",
            data.lastName,
            "    "
        ));

        lines.push(createXMLElement(
            "acknowledgment",
            data.acknowledgment,
            "    "
        ));

        lines.push(createXMLElement(
            "acknowledgmentDate",
            data.acknowledgmentDate,
            "    "
        ));

        lines.push(createXMLElement(
            "prettyNameDivider",
            data.prettyNameDivider,
            "    "
        ));

        lines.push(createXMLElement(
            "adjectives",
            data.adjectives,
            "    "
        ));

        lines.push(createXMLElement(
            "animal",
            data.animal,
            "    "
        ));

        lines.push(createXMLElement(
            "img",
            data.img,
            "    "
        ));

        lines.push(createXMLElement(
            "pictureAlt",
            data.pictureAlt,
            "    "
        ));

        lines.push(createXMLElement(
            "caption",
            data.caption,
            "    "
        ));

        lines.push("    <personalInfo>");

        Object.keys(data.personalInfo).forEach(function (key) {
            lines.push(
                createXMLElement(
                    key,
                    data.personalInfo[key],
                    "        "
                )
            );
        });

        lines.push("    </personalInfo>");

        lines.push("    <courses>");

        data.courses.forEach(function (course) {
            lines.push("        <course>");

            lines.push(createXMLElement(
                "department",
                course.department,
                "            "
            ));

            lines.push(createXMLElement(
                "courseNumber",
                course.courseNumber,
                "            "
            ));

            lines.push(createXMLElement(
                "courseTitle",
                course.courseTitle,
                "            "
            ));

            lines.push(createXMLElement(
                "reasonForTaking",
                course.reasonForTaking,
                "            "
            ));

            lines.push("        </course>");
        });

        lines.push("    </courses>");

        lines.push(createXMLElement(
            "quote",
            data.quote,
            "    "
        ));

        lines.push(createXMLElement(
            "quoteAuthor",
            data.quoteAuthor,
            "    "
        ));

        lines.push(createXMLElement(
            "funnyItem",
            data.funnyItem,
            "    "
        ));

        lines.push(createXMLElement(
            "somethingToShare",
            data.somethingToShare,
            "    "
        ));

        lines.push("    <footerLinks>");

        data.footerLinks.forEach(function (link) {
            lines.push("        <link>");

            lines.push(createXMLElement(
                "label",
                link.label,
                "            "
            ));

            lines.push(createXMLElement(
                "url",
                link.url,
                "            "
            ));

            lines.push("        </link>");
        });

        lines.push("    </footerLinks>");
        lines.push("</introduction>");

        return lines.join("\n");
    }

    /*
     * Displays generated HTML, JSON, or XML in the output area.
     */
    function displayGeneratedOutput(output) {
        if (!generatedDataContainer || !generatedDataOutput) {
            alert("The generated output area could not be found.");
            return;
        }

        generatedDataOutput.value = output;
        generatedDataContainer.hidden = false;

        generatedDataContainer.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    /*
     * Handles image uploads.
     * The original image is used when no new image is selected.
     */
    if (pictureInput) {
        pictureInput.addEventListener("change", function () {
            const file = this.files[0];

            if (!file) {
                uploadedImage = null;
                updatePicturePreview();
                return;
            }

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file.");

                this.value = "";
                uploadedImage = null;

                updatePicturePreview();
                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {
                if (typeof event.target.result === "string") {
                    uploadedImage = event.target.result;
                    updatePicturePreview();
                }
            };

            reader.onerror = function () {
                alert("There was a problem reading your image.");

                uploadedImage = null;
                pictureInput.value = "";

                updatePicturePreview();
            };

            reader.readAsDataURL(file);
        });
    }

    /*
     * Updates the picture preview when the alternative text or
     * caption changes.
     */
    if (pictureAltInput) {
        pictureAltInput.addEventListener(
            "input",
            updatePicturePreview
        );
    }

    if (captionInput) {
        captionInput.addEventListener(
            "input",
            updatePicturePreview
        );
    }

    /*
     * Add delete buttons to the original five courses
     * and number them when the page initially loads.
     */
    updateCourseNumbers();
    updatePicturePreview();

    /*
     * Adds a new course when the Add Course button is clicked.
     */
    if (addCourseButton) {
        addCourseButton.addEventListener("click", function () {
            addCourse();
        });
    }

    /*
     * Clears all form fields without removing the course entries.
     */
    if (clearButton) {
        clearButton.addEventListener("click", function () {
            const fields = form.querySelectorAll("input, textarea");

            fields.forEach(function (field) {
                field.value = "";
            });

            uploadedImage = null;

            updatePicturePreview();

            /*
             * Clear previously generated code.
             */
            if (generatedDataOutput) {
                generatedDataOutput.value = "";
            }

            if (generatedDataContainer) {
                generatedDataContainer.hidden = true;
            }
        });
    }

    /*
     * Handles the native Reset button.
     * Restores the original five courses and their prefilled values.
     */
    form.addEventListener("reset", function () {
        window.setTimeout(function () {
            coursesContainer.innerHTML = originalCoursesHTML;

            updateCourseNumbers();

            uploadedImage = null;

            updatePicturePreview();

            if (studentHeading) {
                studentHeading.textContent = originalStudentHeading;
            }

            if (generatedDataOutput) {
                generatedDataOutput.value = "";
            }

            if (generatedDataContainer) {
                generatedDataContainer.hidden = true;
            }
        }, 0);
    });

    /*
     * Handles form submission and displays the generated introduction.
     */
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const introductionData = collectFormData();

        generateIntroduction(
            introductionData,
            generatedIntroduction
        );

        updateStudentHeading(introductionData);

        formContainer.hidden = true;
        resultContainer.hidden = false;

        if (generatedDataContainer) {
            generatedDataContainer.hidden = true;
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    /*
     * Allows visitors to return to the form and start over.
     */
    if (resetLink) {
        resetLink.addEventListener("click", function (event) {
            event.preventDefault();

            form.reset();

            formContainer.hidden = false;
            resultContainer.hidden = true;

            generatedIntroduction.replaceChildren();

            if (studentHeading) {
                studentHeading.textContent = originalStudentHeading;
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    /*
     * M13: Generate HTML.
     */
    if (generateHTMLButton) {
        generateHTMLButton.addEventListener("click", function () {
            const data = getValidatedFormData();

            if (!data) {
                return;
            }

            const htmlOutput = generateHTML(data);

            displayGeneratedOutput(htmlOutput);
        });
    }

    /*
     * M13: Generate JSON.
     */
    if (generateJSONButton) {
        generateJSONButton.addEventListener("click", function () {
            const data = getValidatedFormData();

            if (!data) {
                return;
            }

            const jsonOutput = generateJSON(data);

            displayGeneratedOutput(jsonOutput);
        });
    }

    /*
     * M13: Generate XML.
     */
    if (generateXMLButton) {
        generateXMLButton.addEventListener("click", function () {
            const data = getValidatedFormData();

            if (!data) {
                return;
            }

            const xmlOutput = generateXML(data);

            displayGeneratedOutput(xmlOutput);
        });
    }
});
