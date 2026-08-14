const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const completedList = document.getElementById("completed-todo-list");

todoForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = todoInput.value.trim();
    if (text === "") {
        return;
    }

    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("aria-label", "Complete todo item");

    const span = document.createElement("span");
    span.textContent = text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "X";

    li.append(checkbox, span, deleteButton);
    todoList.append(li);

    todoInput.value = "";
    todoInput.focus();
});

todoList.addEventListener("click", function (event) {
    const deleteButton = event.target.closest("button");
    if (!deleteButton) {
        return;
    }

    const li = deleteButton.closest("li");
    li.remove();
});

completedList.addEventListener("click", function (event) {
    const deleteButton = event.target.closest("button");
    if (!deleteButton) {
        return;
    }

    const li = deleteButton.closest("li");
    li.remove();
});

todoList.addEventListener("change", function (event) {
    const checkbox = event.target.closest("input[type='checkbox']");
    if (!checkbox) {
        return;
    }

    const li = checkbox.closest("li");
    checkbox.checked = true;
    completedList.append(li);
});

completedList.addEventListener("change", function (event) {
    const checkbox = event.target.closest("input[type='checkbox']");
    if (!checkbox) {
        return;
    }

    const li = checkbox.closest("li");
    checkbox.checked = false;
    todoList.append(li);
});