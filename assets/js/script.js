const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const completedList = document.getElementById("completed-todo-list");
const todoEmpty = document.getElementById("todo-empty");
const completedEmpty = document.getElementById("completed-empty");

// Functions

function createTodoItem(text) {
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
    return li;
}

function saveTodos() {
    const activeTodos = [...todoList.querySelectorAll("li")].map(function (li) {
        return {
            text: li.querySelector("span").textContent,
            isDone: false
        };
    });

    const completedTodos = [...completedList.querySelectorAll("li")].map(function (li) {
        return {
            text: li.querySelector("span").textContent,
            isDone: true
        };
    });

    const todos = activeTodos.concat(completedTodos);
    localStorage.setItem("todos", JSON.stringify(todos));
    updateEmptyMessages();
}

function updateEmptyMessages() {
    todoEmpty.hidden = todoList.querySelectorAll("li").length > 0;
    completedEmpty.hidden = completedList.querySelectorAll("li").length > 0;
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
            const checkbox = li.querySelector("input[type='checkbox']");

            if (todo.isDone) {
                checkbox.checked = true;
                completedList.append(li);
            } else {
                todoList.append(li);
            }
        });
    }

    updateEmptyMessages();
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
    todoList.append(li);
    saveTodos();

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
    saveTodos();
});

completedList.addEventListener("click", function (event) {
    const deleteButton = event.target.closest("button");
    if (!deleteButton) {
        return;
    }

    const li = deleteButton.closest("li");
    li.remove();
    saveTodos();
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

loadTodos();