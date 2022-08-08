import "./admin.scss";


const quillSettings = {
    theme: 'snow',
    placeholder: 'Content',
    modules: {
        toolbar: [
            [{ 'header': [2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image', 'video']
        ],
        history: {
            userOnly: true
        },
    }
};

const quill = new Quill('.new-announcement-editor__content', quillSettings);

document.querySelector(".new-announcement-editor__submit").addEventListener("click", () => {
    const title = document.querySelector(".new-announcement-editor__title").value;
    const content = quill.root.innerHTML;
    const announcement = {
        title: title,
        content: content,
    };
    fetch("/announcements/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(announcement),
    }).then(() => {
        window.location.href = "/admin";
    });
});

for (const editButton of document.querySelectorAll(".announcement__edit")) {
    editButton.addEventListener("click", () => {
        const idx = parseInt(editButton.dataset.idx);
        const contentBox = document.querySelector(`.announcement__content--${idx}`);
        const quill = new Quill(contentBox, quillSettings);
        const title = document.querySelector(".announcement__title--" + idx);
        const titleValue = title.innerHTML;
        const titleInput = document.createElement("input");
        titleInput.setAttribute("type", "text");
        titleInput.value = titleValue;
        title.replaceWith(titleInput);
        editButton.style.display = "none";

        const saveButton = document.createElement("button");
        saveButton.classList.add("btn", "btn-primary");
        saveButton.innerHTML = "Save";
        editButton.parentElement.parentElement.append(saveButton);

        saveButton.addEventListener('click', () => {
            fetch("/announcements/edit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idx: idx,
                    title: titleInput.value,
                    content: quill.root.innerHTML,
                }),
            }).then(() => {
                title.innerHTML = titleInput.value;
                titleInput.replaceWith(title);
                document.querySelector(`.accordion-button-${idx}`).innerHTML = titleInput.value;
                editButton.style.display = "unset";
                contentBox.innerHTML = quill.root.innerHTML;
                contentBox.classList.remove("ql-container", "ql-snow");
                document.querySelector(`.accordion-item-${idx} .ql-toolbar`).remove();
                saveButton.remove();
            });
        });
    });
}

for (const deleteButton of document.querySelectorAll(".announcement__delete")) {
    deleteButton.addEventListener("click", () => {
        const idx = parseInt(deleteButton.dataset.idx);
        fetch(`/announcements/delete/?idx=${idx}`, {
            method: "POST",
        }).then(() => {
            document.querySelector(`.accordion-item-${idx}`).remove();
        });
    });
}

{
    // const settings = JSON.parse(document.querySelector(".settings__tab").dataset.initialValues);
    for (const setting of settings) {
        const [name, value] = setting;
        const inputEl = document.getElementById(`${name}-input`);
        if (typeof value == "boolean")
            inputEl.checked = value;
        else
            inputEl.value = value;
    }
    document.querySelector(".settings__save-btn").addEventListener("click", () => {
        fetch("/admin/settings/set", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(settings.reduce((body, pair) => {
                const name = pair[0];
                const el = document.getElementById(`${name}-input`);
                body[name] = el.type === "checkbox" ? el.checked : el.value;
                return body;
            }, {})),
        })
    });
}