const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const completedList = document.getElementById("completed-todo-list");
const todoEmpty = document.getElementById("todo-empty");
const completedEmpty = document.getElementById("completed-empty");
const binList = document.getElementById("bin-list");
const binEmpty = document.getElementById("bin-empty");
const binRestoreAll = document.getElementById("bin-restore-all");
const binEmptyAll = document.getElementById("bin-empty-all");
const binConfirm = document.getElementById("bin-confirm");
const binConfirmCancel = document.getElementById("bin-confirm-cancel");
const binConfirmEmpty = document.getElementById("bin-confirm-empty");
const themeToggle = document.getElementById("theme-toggle");
const themeStorageKey = "todoTheme";
const taskEditor = document.getElementById("task-editor");
const taskEditorBackdrop = document.getElementById("task-editor-backdrop");
const taskEditorClose = document.getElementById("task-editor-close");
const taskEditorTitle = document.getElementById("task-editor-title");
const taskEditorNotes = document.getElementById("task-editor-notes");
const taskEditorDue = document.getElementById("task-editor-due");
const taskEditorPriority = document.getElementById("task-editor-priority");
const taskEditorCreated = document.getElementById("task-editor-created");
const taskEditorDone = document.getElementById("task-editor-done");

let editorItem = null;

// Functions
function todayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getTodoDetails(li) {
    return {
        notes: li.dataset.notes || "",
        dueDate: li.dataset.dueDate || "",
        priority: li.dataset.priority || "none",
        createdAt: li.dataset.createdAt || ""
    };
}

function applyTodoDetails(li, details) {
    li.dataset.notes = details.notes || "";
    li.dataset.dueDate = details.dueDate || "";
    li.dataset.priority = details.priority || "none";
    li.dataset.createdAt = details.createdAt || "";
}

function createTodoItem(text) {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("aria-label", "Complete todo item");
    
    const span = document.createElement("span");
    span.textContent = text;

    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.className = "todo-details";
    detailsButton.dataset.action = "open-editor";
    detailsButton.setAttribute("aria-label", "Edit task details");
    detailsButton.textContent = "☰";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.dataset.action = "bin";
    deleteButton.textContent = "X";

    li.append(checkbox, span, detailsButton, deleteButton);
    return li;
}

function createBinnedItem(text, isDone, details) {
    const li = document.createElement("li");
    li.dataset.isDone = isDone ? "true" : "false";
    applyTodoDetails(li, details || {});

    const span = document.createElement("span");
    span.textContent = text;

    const restoreButton = document.createElement("button");
    restoreButton.type = "button";
    restoreButton.className = "bin-restore";
    restoreButton.dataset.action = "restore";
    restoreButton.textContent = "Restore";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "bin-delete";
    deleteButton.dataset.action = "delete-forever";
    deleteButton.textContent = "X";

    li.append(span, restoreButton, deleteButton);
    return li;
}

function saveTodos() {
    const activeTodos = [...todoList.querySelectorAll("li")].map(function (li) {
        return {
            text: li.querySelector("span").textContent,
            isDone: false,
            notes: li.dataset.notes || "",
            dueDate: li.dataset.dueDate || "",
            priority: li.dataset.priority || "none",
            createdAt: li.dataset.createdAt || ""
        };
    });

    const completedTodos = [...completedList.querySelectorAll("li")].map(function (li) {
        return {
            text: li.querySelector("span").textContent,
            isDone: true,
            notes: li.dataset.notes || "",
            dueDate: li.dataset.dueDate || "",
            priority: li.dataset.priority || "none",
            createdAt: li.dataset.createdAt || ""
        };
    });

    const todos = activeTodos.concat(completedTodos);
    localStorage.setItem("todos", JSON.stringify(todos));

    const binnedTodos = [...binList.querySelectorAll("li")].map(function (li) {
        return {
            text: li.querySelector("span").textContent,
            isDone: li.dataset.isDone === "true",
            notes: li.dataset.notes || "",
            dueDate: li.dataset.dueDate || "",
            priority: li.dataset.priority || "none",
            createdAt: li.dataset.createdAt || ""
        };
    });
    localStorage.setItem("binnedTodos", JSON.stringify(binnedTodos));
    updateEmptyMessages();
}

function updateEmptyMessages() {
    todoEmpty.hidden = todoList.querySelectorAll("li").length > 0;
    completedEmpty.hidden = completedList.querySelectorAll("li").length > 0;
    binEmpty.hidden = binList.querySelectorAll("li").length > 0;

    if (binList.querySelectorAll("li").length === 0) {
        binConfirm.hidden = true;
    }
}

function startEdit(span) {
    span.dataset.originalText = span.textContent;
    span.contentEditable = "true";
    span.focus();
}

function finishEdit(span) {
    span.contentEditable = "false";

    const text = span.textContent.trim();
    if (text === "") {
        span.textContent = span.dataset.originalText;
    } else {
        span.textContent = text;
    }

    saveTodos();
}

function handleListDblClick(event) {
    const span = event.target.closest("span");
    if (!span) {
        return;
    }

    startEdit(span);
}

function handleListKeyDown(event) {
    const span = event.target.closest("span");
    if (!span || span.contentEditable !== "true") {
        return;
    }

    if (event.key === "Enter") {
        event.preventDefault();
        span.blur();
    }

    if (event.key === "Escape") {
        span.textContent = span.dataset.originalText;
        span.blur();
    }
}

function handleListBlur(event) {
    const span = event.target.closest("span");
    if (!span || span.contentEditable !== "true") {
        return;
    }

    finishEdit(span);
}

function loadTodos() {
    const saved = localStorage.getItem("todos");
    if (saved) {
        const todos = JSON.parse(saved);

        todoList.innerHTML = "";
        completedList.innerHTML = "";

        todos.forEach(function (todo) {
            const li = createTodoItem(todo.text);
            applyTodoDetails(li, todo);
            const checkbox = li.querySelector("input[type='checkbox']");

            if (todo.isDone) {
                checkbox.checked = true;
                completedList.append(li);
            } else {
                todoList.append(li);
            }
        });
    }
    const savedBin = localStorage.getItem("binnedTodos");
    binList.innerHTML = "";
    if (savedBin) {
        const binnedTodos = JSON.parse(savedBin);
        binnedTodos.forEach(function (todo) {
            binList.append(createBinnedItem(todo.text, todo.isDone, todo));
        });
    }
    updateEmptyMessages();
}

function moveToBin(li) {
    const text = li.querySelector("span").textContent;
    const isDone = li.querySelector("input[type='checkbox']").checked;
    const details = getTodoDetails(li);
    li.remove();
    binList.append(createBinnedItem(text, isDone, details));
    saveTodos();
}

function restoreFromBin(li) {
    const text = li.querySelector("span").textContent;
    const isDone = li.dataset.isDone === "true";
    const todoItem = createTodoItem(text);
    applyTodoDetails(todoItem, getTodoDetails(li));

    if (isDone) {
        todoItem.querySelector("input[type='checkbox']").checked = true;
        completedList.append(todoItem);
    } else {
        todoList.append(todoItem);
    }

    li.remove();
    saveTodos();
}

function openTaskEditor(li) {
    editorItem = li;
    taskEditorTitle.value = li.querySelector("span").textContent;
    taskEditorNotes.value = li.dataset.notes || "";
    taskEditorDue.value = li.dataset.dueDate || "";
    taskEditorPriority.value = li.dataset.priority || "none";
    taskEditorCreated.textContent = li.dataset.createdAt || "-";
    taskEditorDone.checked = li.querySelector("input[type='checkbox']").checked;
    taskEditor.hidden = false;
}

function closeTaskEditor() {
    if (editorItem) {
        const text = taskEditorTitle.value.trim();
        if (text !== "") {
            editorItem.querySelector("span").textContent = text;
        }

        applyTodoDetails(editorItem, {
            notes: taskEditorNotes.value,
            dueDate: taskEditorDue.value,
            priority: taskEditorPriority.value,
            createdAt: editorItem.dataset.createdAt || todayDate()
        });

        const checkbox = editorItem.querySelector("input[type='checkbox']");
        const shouldBeDone = taskEditorDone.checked;

        if (shouldBeDone && !checkbox.checked) {
            checkbox.checked = true;
            completedList.append(editorItem);
        } else if (!shouldBeDone && checkbox.checked) {
            checkbox.checked = false;
            todoList.append(editorItem);
        }

        saveTodos();
    }
    editorItem = null;
    taskEditor.hidden = true;
}

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(themeStorageKey, theme);
    themeToggle.textContent = theme === "dark" ? "Light" : "Dark";
    themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );
}

// Button functionality

todoList.addEventListener("dblclick", handleListDblClick);
completedList.addEventListener("dblclick", handleListDblClick);
todoList.addEventListener("keydown", handleListKeyDown);
completedList.addEventListener("keydown", handleListKeyDown);
todoList.addEventListener("focusout", handleListBlur);
completedList.addEventListener("focusout", handleListBlur);

todoForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = todoInput.value.trim();
    if (text === "") {
        return;
    }

    const li = createTodoItem(text);
    applyTodoDetails(li, {
        notes: "",
        dueDate: "",
        priority: "none",
        createdAt: todayDate()
    });
    todoList.append(li);
    saveTodos();

    todoInput.value = "";
    todoInput.focus();
});

todoList.addEventListener("change", function (event) {
    const checkbox = event.target.closest("input[type='checkbox']");
    if (!checkbox) {
        return;
    }

    const li = checkbox.closest("li");
    checkbox.checked = true;
    completedList.append(li);
    saveTodos();
});

completedList.addEventListener("change", function (event) {
    const checkbox = event.target.closest("input[type='checkbox']");
    if (!checkbox) {
        return;
    }

    const li = checkbox.closest("li");
    checkbox.checked = false;
    todoList.append(li);
    saveTodos();
});

todoList.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) {
        return;
    }

    const li = button.closest("li");

    if (button.dataset.action === "open-editor") {
        openTaskEditor(li);
    }

    if (button.dataset.action === "bin") {
        moveToBin(li);
    }
});

completedList.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) {
        return;
    }

    const li = button.closest("li");

    if (button.dataset.action === "open-editor") {
        openTaskEditor(li);
    }

    if (button.dataset.action === "bin") {
        moveToBin(li);
    }
});

binList.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) {
        return;
    }

    const li = button.closest("li");

    if (button.dataset.action === "restore") {
        restoreFromBin(li);
    }

    if (button.dataset.action === "delete-forever") {
        li.remove();
        saveTodos();
    }
});

binRestoreAll.addEventListener("click", function () {
    [...binList.querySelectorAll("li")].forEach(restoreFromBin);
});

binEmptyAll.addEventListener("click", function () {
    if (binList.querySelectorAll("li").length === 0) {
        return;
    }

    binConfirm.hidden = false;
});

binConfirmCancel.addEventListener("click", function () {
    binConfirm.hidden = true;
});

binConfirmEmpty.addEventListener("click", function () {
    binList.innerHTML = "";
    binConfirm.hidden = true;
    saveTodos();
});

themeToggle.addEventListener("click", function () {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
});

taskEditorClose.addEventListener("click", closeTaskEditor);
taskEditorBackdrop.addEventListener("click", closeTaskEditor);

const savedTheme = localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
setTheme(savedTheme);

loadTodos();