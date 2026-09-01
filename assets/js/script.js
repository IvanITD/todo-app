const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoSearch = document.getElementById("todo-search");
const todoSearchClear = document.querySelector(".todo-search-clear");
const todoSearchIn = document.getElementById("todo-search-in");
const completedTodoCheckbox = document.getElementById("completed-todo-checkbox");
const binCheckbox = document.getElementById("bin-checkbox");
const todoSort = document.getElementById("todo-sort");
const todoTagFilter = document.getElementById("todo-tag-filter");
const todoList = document.getElementById("todo-list");
const completedList = document.getElementById("completed-todo-list");
const completedBinAll = document.getElementById("completed-bin-all");
const todoEmpty = document.getElementById("todo-empty");
const todoToasts = document.getElementById("todo-toasts");
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
const sortStorageKey = "todoSort";
const customOrderStorageKey = "todoCustomOrder";
const taskEditor = document.getElementById("task-editor");
const taskEditorBackdrop = document.getElementById("task-editor-backdrop");
const taskEditorClose = document.getElementById("task-editor-close");
const taskEditorTitle = document.getElementById("task-editor-title");
const taskEditorNotes = document.getElementById("task-editor-notes");
const taskEditorDue = document.getElementById("task-editor-due");
const taskEditorPriority = document.getElementById("task-editor-priority");
const taskEditorTag = document.getElementById("task-editor-tag");
const taskEditorRepeat = document.getElementById("task-editor-repeat");
const taskEditorRepeatFortnight = document.getElementById("task-editor-repeat-fortnight");
const taskEditorRepeatDays = document.getElementById("task-editor-repeat-days");
const taskEditorRemind = document.getElementById("task-editor-remind");
const taskEditorSubtasks = document.getElementById("task-editor-subtasks");
const taskEditorSubtaskInput = document.getElementById("task-editor-subtask-input");
const taskEditorSubtaskAdd = document.getElementById("task-editor-subtask-add");
const taskEditorSubtasksDone = document.getElementById("task-editor-subtasks-done");
const taskEditorSubtasksTotal = document.getElementById("task-editor-subtasks-total");
const taskEditorSubtasksProgressFill = document.getElementById("task-editor-subtasks-progress-fill");
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

function tomorrowDate() {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getTodoDetails(li) {
    return {
        id: ensureTodoId(li),
        notes: li.dataset.notes || "",
        dueDate: li.dataset.dueDate || "",
        lastCompleted: li.dataset.lastCompleted || "",
        priority: li.dataset.priority || "none",
        tag: li.dataset.tag || "none",
        repeat: li.dataset.repeat || "none",
        repeatDays: readRepeatDays(li),
        remind: li.dataset.remind || "off",
        subtasks: readSubtasks(li),
        createdAt: li.dataset.createdAt || ""
    };
}

function applyTodoDetails(li, details) {
    li.dataset.id =details.id || li.dataset.id || newTodoId();
    li.dataset.notes = details.notes || "";
    li.dataset.dueDate = details.dueDate || "";
    li.dataset.lastCompleted = details.lastCompleted || "";
    li.dataset.priority = details.priority || "none";
    li.dataset.tag = details.tag || "none";
    li.dataset.repeat = details.repeat || "none";
    li.dataset.remind = details.remind || "off";
    writeRepeatDays(li, details.repeatDays || []);
    writeSubtasks(li, details.subtasks || []);
    li.dataset.createdAt = details.createdAt || "";
    setDueHint(li);
    setTagChip(li);
    setLastDone(li);
    setRemindCaption(li);
}

function createTodoItem(text) {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("aria-label", "Complete todo item");

    const dragHandle = document.createElement("button");
    dragHandle.type = "button";
    dragHandle.className = "todo-drag-handle";
    dragHandle.dataset.action = "drag";
    dragHandle.setAttribute("aria-label", "Reorder task");
    dragHandle.setAttribute("aria-grabbed", "false");
    const textWrap = document.createElement("div");
    textWrap.className = "todo-text";
    const span = document.createElement("span");
    span.textContent = text;

    const caption = document.createElement("span");
    caption.className = "todo-caption";
    caption.hidden = true;

    const captions = document.createElement("div");
    captions.className = "todo-captions";
    captions.append(caption);

    textWrap.append(span, captions);

    const dueHint = document.createElement("span");
    dueHint.className = "todo-due-hint";
    dueHint.hidden = true;

    const tagChip = document.createElement("span");
    tagChip.className = "todo-tag";
    tagChip.hidden = true;

    const chips = document.createElement("div");
    chips.className = "todo-meta-chips";
    chips.append(tagChip, dueHint);

    const meta = document.createElement("div");
    meta.className = "todo-meta";
    meta.append(chips);

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

    li.append(dragHandle, checkbox, textWrap, meta, detailsButton, deleteButton);
    return li;
}

let draggedItem = null;
let dragPlaceholder = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let keyboardMoving = false;
function enableRowDrag(event) {
    const handle = event.target.closest(".todo-drag-handle");
    if (!handle || event.button !== 0 || keyboardMoving) {
        return;
    }

    event.preventDefault();
    draggedItem = handle.closest("li");
    const rect = draggedItem.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;

    dragPlaceholder = document.createElement("li");
    dragPlaceholder.className = "todo-drag-placeholder";
    dragPlaceholder.style.height = rect.height + "px";
    draggedItem.after(dragPlaceholder);

    draggedItem.classList.add("todo-dragging");
    draggedItem.style.width = rect.width + "px";
    draggedItem.style.left = rect.left + "px";
    draggedItem.style.top = rect.top + "px";

    document.addEventListener("mousemove", handleRowDragMove);
    document.addEventListener("mouseup", handleRowDragStop);
}

function handleRowDragMove(event) {
    event.preventDefault();
    if (!draggedItem || !dragPlaceholder) {
        return;
    }

    draggedItem.style.left = event.clientX - dragOffsetX + "px";
    draggedItem.style.top = event.clientY - dragOffsetY + "px";

    const list = dragPlaceholder.parentNode;
    const rows = [...list.querySelectorAll(":scope > li")];
    let marker = null;

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        if (row === draggedItem || row === dragPlaceholder || row.hidden) {
            continue;
        }

        const rect = row.getBoundingClientRect();
        if (event.clientY < rect.top + rect.height / 2) {
            marker = row;
            break;
        }
    }

    if (marker) {
        if (dragPlaceholder.nextElementSibling !== marker) {
            marker.before(dragPlaceholder);
        }
    } else if (list.lastElementChild !== dragPlaceholder) {
        list.append(dragPlaceholder);
    }
}

function handleRowDragStop() {
    if (!draggedItem) {
        return;
    }

    document.removeEventListener("mousemove", handleRowDragMove);
    document.removeEventListener("mouseup", handleRowDragStop);

    if (dragPlaceholder) {
        dragPlaceholder.replaceWith(draggedItem);
        dragPlaceholder = null;
    }

    draggedItem.classList.remove("todo-dragging");
    draggedItem.style.width = "";
    draggedItem.style.left = "";
    draggedItem.style.top = "";
    draggedItem = null;
    setSortMode("manual");
    saveTodos();
}

function startKeyboardRowMove(handle) {
    if (keyboardMoving || draggedItem) {
        return;
    }

    const li = handle.closest("li");
    const rect = li.getBoundingClientRect();

    draggedItem = li;
    keyboardMoving = true;

    dragPlaceholder = document.createElement("li");
    dragPlaceholder.className = "todo-drag-placeholder";
    dragPlaceholder.style.height = rect.height + "px";
    li.after(dragPlaceholder);

    li.classList.add("todo-dragging");
    li.style.width = rect.width + "px";
    li.style.left = rect.left + "px";
    li.style.top = rect.top + "px";
    handle.setAttribute("aria-grabbed", "true");
}

function stopKeyboardRowMove(shouldSave) {
    if (!keyboardMoving || !draggedItem) {
        return;
    }

    const handle = draggedItem.querySelector(".todo-drag-handle");

    if (shouldSave && dragPlaceholder) {
        dragPlaceholder.replaceWith(draggedItem);
        dragPlaceholder = null;
        setSortMode("manual");
        saveTodos();
    } else if (dragPlaceholder) {
        dragPlaceholder.remove();
        dragPlaceholder = null;
    }

    draggedItem.classList.remove("todo-dragging");
    draggedItem.style.width = "";
    draggedItem.style.left = "";
    draggedItem.style.top = "";
    draggedItem = null;
    keyboardMoving = false;

    if (handle) {
        handle.setAttribute("aria-grabbed", "false");
        handle.focus();
    }
}

function moveKeyboardRow(direction) {
    if (!keyboardMoving || !draggedItem || !dragPlaceholder) {
        return;
    }

    let target;
    if (direction < 0) {
        target = dragPlaceholder.previousElementSibling;
        while (target && (target === draggedItem || target.hidden)) {
            target = target.previousElementSibling;
        }
        if (target) {
            target.before(dragPlaceholder);
        }
    } else {
        target = dragPlaceholder.nextElementSibling;
        while (target && (target === draggedItem || target.hidden)) {
            target = target.nextElementSibling;
        }
        if (target) {
            target.after(dragPlaceholder);
        }
    }

    const rect = dragPlaceholder.getBoundingClientRect();
    draggedItem.style.top = rect.top + "px";
    draggedItem.style.left = rect.left + "px";
}

function handleGripKeyDown(event) {
    const handle = event.target.closest(".todo-drag-handle");
    if (!handle) {
        return;
    }

    if (event.key === " ") {
        event.preventDefault();
        if (keyboardMoving) {
            stopKeyboardRowMove(true);
        } else {
            startKeyboardRowMove(handle);
        }
        return;
    }

    if (!keyboardMoving) {
        return;
    }

    if (event.key === "Escape") {
        event.preventDefault();
        stopKeyboardRowMove(false);
        return;
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        moveKeyboardRow(-1);
        return;
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();
        moveKeyboardRow(1);
        return;
    }

    if (event.key === "Tab") {
        event.preventDefault();
    }
}

function setDueHint(li) {
    const dueHint = li.querySelector(".todo-due-hint");
    if (!dueHint) {
        return;
    }

    const dueDate = li.dataset.dueDate || "";
    const today = todayDate();

    dueHint.classList.remove("overdue");
    dueHint.classList.remove("tomorrow");

    if (dueDate === "") {
        dueHint.textContent = "";
        dueHint.hidden = true;
        return;
    }

    if (dueDate === today) {
        dueHint.textContent = "Today";
        dueHint.hidden = false;
        return;
    }

    if (dueDate < today) {
        dueHint.textContent = "Overdue";
        dueHint.classList.add("overdue");
        dueHint.hidden = false;
        return;
    }

    if (dueDate === tomorrowDate()) {
        dueHint.textContent = "Tomorrow";
        dueHint.classList.add("tomorrow");
        dueHint.hidden = false;
        return;
    }

    dueHint.textContent = "";
    dueHint.hidden = true;
}

function setTagChip(li) {
    const tagChip = li.querySelector(".todo-tag");
    if (!tagChip) {
        return;
    }

    const tag = li.dataset.tag || "none";
    tagChip.classList.remove("work", "home", "personal");

    if (tag === "none") {
        tagChip.textContent = "";
        tagChip.hidden = true;
        return;
    }

    tagChip.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
    tagChip.classList.add(tag);
    tagChip.hidden = false;
}

function formatLastDone(iso) {
    const parts = iso.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return "Last done " + date.getDate() + " " + months[date.getMonth()];
}

function lastDoneCaption(li) {
    const repeat = li.dataset.repeat || "none";
    const completed = li.dataset.lastCompleted || "";
    if (repeat === "none" || completed === "") {
        return "";
    }
    return formatLastDone(completed);
}

function setRowCaption(li) {
    const line = li.querySelector(".todo-caption");
    if (!line) {
        return;
    }

    const parts = [];
    const remind = remindCaption(li.dataset.remind || "off");
    const lastDone = lastDoneCaption(li);
    if (remind !== "") {
        parts.push(remind);
    }
    if (lastDone !== "") {
        parts.push(lastDone);
    }

    if (parts.length === 0) {
        line.textContent = "";
        line.hidden = true;
        return;
    }

    line.textContent = parts.join(" • ");
    line.hidden = false;
}

function setLastDone(li) {
    setRowCaption(li);
}

function remindCaption(remind) {
    if (remind === "ontime") {
        return "Due today";
    }
    if (remind === "15m") {
        return "In 15m";
    }
    if (remind === "30m") {
        return "In 30m";
    }
    if (remind === "1h") {
        return "In 1h";
    }
    if (remind === "1d") {
        return "In 1d";
    }
    return "";
}

function setRemindCaption(li) {
    setRowCaption(li);
}

const remindedKeys = new Set();

function remindToastMessage(remind) {
    if (remind === "15m") {
        return "due in 15 minutes";
    }
    if (remind === "30m") {
        return "due in 30 minutes";
    }
    if (remind === "1h") {
        return "due in 1 hour";
    }
    if (remind === "1d") {
        return "due in 1 day";
    }
    if (remind === "ontime") {
        return "due today";
    }
    return "";
}

function remindIsDue(li) {
    const remind = li.dataset.remind || "off";
    const due = li.dataset.dueDate || "";
    if (remind === "off" || due === "") {
        return false;
    }

    const dueDate = dateFromIso(due);
    const now = new Date();

    if (remind === "ontime") {
        return now >= dueDate;
    }
    if (remind === "1d") {
        return now >= addDays(dueDate, -1);
    }
    if (remind === "1h") {
        return now >= new Date(dueDate.getTime() - 60 * 60 * 1000);
    }
    if (remind === "30m") {
        return now >= new Date(dueDate.getTime() - 30 * 60 * 1000);
    }
    if (remind === "15m") {
        return now >= new Date(dueDate.getTime() - 15 * 60 * 1000);
    }
    return false;
}

function checkReminders() {
    [...todoList.querySelectorAll("li")].forEach(function (li) {
        if (!remindIsDue(li)) {
            return;
        }

        const key = ensureTodoId(li) + "|" + li.dataset.dueDate + "|" + li.dataset.remind;
        if (remindedKeys.has(key)) {
            return;
        }

        remindedKeys.add(key);
        showTodoMessage(li, remindToastMessage(li.dataset.remind));
    });
}

function showToast(message) {
    const toast = document.createElement("p");
    toast.className = "todo-toast";
    toast.textContent = message;
    todoToasts.append(toast);

    window.setTimeout(function () {
        toast.classList.add("todo-toast-out");
        window.setTimeout(function () {
            toast.remove();
        }, 400);
    }, 2800);
}

function showTodoMessage(li, message) {
    const nameSpan = li.querySelector(".todo-text span") || li.querySelector("span");
    const name = nameSpan ? nameSpan.textContent.trim() : "";
    showToast(name ? name + " — " + message : message);
}

function formatShortDate(iso) {
    const parts = iso.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return date.getDate() + " " + months[date.getMonth()];
}

function dateFromIso(iso) {
    const parts = iso.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function isoFromDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addDays(date, count) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count);
}

function addMonths(date, count) {
    const day = date.getDate();
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + count, 1);
    const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
    return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(day, lastDay));
}

function nextOnDays(fromDate, dayKeys) {
    const keys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    let date = addDays(fromDate, 1);
    for (let i = 0; i < 400; i += 1) {
        if (dayKeys.includes(keys[date.getDay()])) {
            return date;
        }
        date = addDays(date, 1);
    }
    return addDays(fromDate, 1);
}

function nextRepeatDueDate(dueDate, repeat, repeatDays) {
    const today = dateFromIso(todayDate());
    const current = dateFromIso(dueDate);
    let next;
    let days = repeatDays;

    if (repeat === "daily") {
        days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    } else if (repeat === "weekly") {
        days = ["mon", "tue", "wed", "thu", "fri"];
    } else if (repeat === "weekend") {
        days = ["sat", "sun"];
    } else if (repeat === "fortnight") {
        next = addDays(current, 14);
        while (next <= today) {
            next = addDays(next, 14);
        }
        return isoFromDate(next);
    } else if (repeat === "monthly") {
        next = addMonths(current, 1);
        while (next <= today) {
            next = addMonths(next, 1);
        }
        return isoFromDate(next);
    }

    if (!days || days.length === 0) {
        return isoFromDate(addDays(current, 1));
    }

    next = nextOnDays(current, days);
    while (next <= today) {
        next = nextOnDays(next, days);
    }
    return isoFromDate(next);
}

function tryCompleteRepeatingTodo(li) {
    const repeat = li.dataset.repeat || "none";
    const days = readRepeatDays(li);
    if (repeat === "none" || (repeat === "custom" && days.length === 0)) {
        return "normal";
    }

    const due = li.dataset.dueDate || "";
    if (due !== "" && due > todayDate()) {
        showTodoMessage(li, "This is due " + formatShortDate(due) + ". Come back then.");
        return "blocked";
    }

    li.dataset.dueDate = nextRepeatDueDate(due || todayDate(), repeat, days);
    li.dataset.lastCompleted = todayDate();
    setDueHint(li);
    setLastDone(li);

    const nextDue = li.dataset.dueDate;
    let nextLabel = formatShortDate(nextDue);
    if (nextDue === todayDate()) {
        nextLabel = "today";
    } else if (nextDue === tomorrowDate()) {
        nextLabel = "tomorrow";
    }
    showTodoMessage(li, "Next due " + nextLabel);
    return "advanced";
}

function createSubtaskItem(text, isDone) {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(isDone);
    checkbox.setAttribute("aria-label", "Complete subtask");

    const span = document.createElement("span");
    span.textContent = text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "X";
    deleteButton.setAttribute("aria-label", "Delete subtask");

    li.append(checkbox, span, deleteButton);
    return li;
}

function updateSubtaskProgress() {
    const items = taskEditorSubtasks.querySelectorAll("li");
    const total = items.length;
    let done = 0;

    items.forEach(function (li) {
        if (li.querySelector("input[type='checkbox']").checked) {
            done += 1;
        }
    });

    taskEditorSubtasksDone.textContent = String(done);
    taskEditorSubtasksTotal.textContent = String(total);
    taskEditorSubtasksProgressFill.style.width = total === 0 ? "0%" : (done / total) * 100 + "%";
}

function readSubtasks(li) {
    try {
        const parsed = JSON.parse(li.dataset.subtasks || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function writeSubtasks(li, subtasks) {
    li.dataset.subtasks = JSON.stringify(subtasks);
}

function readRepeatDays(li) {
    try {
        const parsed = JSON.parse(li.dataset.repeatDays || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function writeRepeatDays(li, days) {
    li.dataset.repeatDays = JSON.stringify(days);
}

function collectEditorRepeatDays() {
    return [...taskEditorRepeatDays.querySelectorAll(".task-editor-repeat-day")]
        .filter(function (button) {
            return button.getAttribute("aria-pressed") === "true";
        })
        .map(function (button) {
            return button.dataset.day;
        });
}

function setRepeatDayButtons(days) {
    const selected = days || [];
    taskEditorRepeatDays.querySelectorAll(".task-editor-repeat-day").forEach(function (button) {
        const isOn = selected.includes(button.dataset.day);
        button.setAttribute("aria-pressed", isOn ? "true" : "false");
    });
}

function setFortnightPressed(isOn) {
    taskEditorRepeatFortnight.setAttribute("aria-pressed", isOn ? "true" : "false");
}

function readEditorRemind() {
    const pressed = taskEditorRemind.querySelector('.task-editor-remind-option[aria-pressed="true"]');
    return pressed ? pressed.dataset.remind : "off";
}

function writeEditorRemind(value) {
    const remind = value || "off";
    taskEditorRemind.querySelectorAll(".task-editor-remind-option").forEach(function (option) {
        option.setAttribute("aria-pressed", option.dataset.remind === remind ? "true" : "false");
    });
}

function weekdayFromDueDate(dueDate) {
    if (!dueDate) {
        return "";
    }

    const parts = dueDate.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const keys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return keys[date.getDay()];
}

function daysForRepeat(repeat, dueDate) {
    if (repeat === "daily") {
        return ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    }
    if (repeat === "weekend") {
        return ["sat", "sun"];
    }
    if (repeat === "weekly") {
        return ["mon", "tue", "wed", "thu", "fri"];
    }
    if (repeat === "fortnight") {
        return ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    }
    if (repeat === "monthly") {
        const weekday = weekdayFromDueDate(dueDate);
        return weekday ? [weekday] : [];
    }
    if (repeat === "custom") {
        return null;
    }
    return [];
}

function applyRepeatFromDropdown() {
    const repeat = taskEditorRepeat.value;
    const nextDays = daysForRepeat(repeat, taskEditorDue.value);
    if (nextDays !== null) {
        setRepeatDayButtons(nextDays);
    }
    setFortnightPressed(repeat === "fortnight");
}

function dayKey(days) {
    return (days || []).slice().sort().join(",");
}

function matchRepeatFromControls() {
    const days = collectEditorRepeatDays();
    const key = dayKey(days);
    const allDays = "fri,mon,sat,sun,thu,tue,wed";
    const weekdays = "fri,mon,thu,tue,wed";
    const weekend = "sat,sun";
    const fortnightOn = taskEditorRepeatFortnight.getAttribute("aria-pressed") === "true";

    if (fortnightOn && key === allDays) {
        taskEditorRepeat.value = "fortnight";
        return;
    }

    if (fortnightOn) {
        setFortnightPressed(false);
    }

    if (key === "") {
        taskEditorRepeat.value = "none";
    } else if (key === allDays) {
        taskEditorRepeat.value = "daily";
    } else if (key === weekdays) {
        taskEditorRepeat.value = "weekly";
    } else if (key === weekend) {
        taskEditorRepeat.value = "weekend";
    } else {
        taskEditorRepeat.value = "custom";
    }
}

function collectEditorSubtasks() {
    return [...taskEditorSubtasks.querySelectorAll("li")].map(function (row) {
        return {
            text: row.querySelector("span").textContent,
            isDone: row.querySelector("input[type='checkbox']").checked
        };
    });
}

function fillEditorSubtasks(subtasks) {
    taskEditorSubtasks.innerHTML = "";
    subtasks.forEach(function (item) {
        taskEditorSubtasks.append(createSubtaskItem(item.text, item.isDone));
    });
    updateSubtaskProgress();
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
            id: ensureTodoId(li),
            text: li.querySelector("span").textContent,
            isDone: false,
            notes: li.dataset.notes || "",
            dueDate: li.dataset.dueDate || "",
            lastCompleted: li.dataset.lastCompleted || "",
            priority: li.dataset.priority || "none",
            tag: li.dataset.tag || "none",
            repeat: li.dataset.repeat || "none",
            repeatDays: readRepeatDays(li),
            remind: li.dataset.remind || "off",
            subtasks: readSubtasks(li),
            createdAt: li.dataset.createdAt || ""
        };
    });

    const completedTodos = [...completedList.querySelectorAll("li")].map(function (li) {
        return {
            id: ensureTodoId(li),
            text: li.querySelector("span").textContent,
            isDone: true,
            notes: li.dataset.notes || "",
            dueDate: li.dataset.dueDate || "",
            lastCompleted: li.dataset.lastCompleted || "",
            priority: li.dataset.priority || "none",
            tag: li.dataset.tag || "none",
            repeat: li.dataset.repeat || "none",
            repeatDays: readRepeatDays(li),
            remind: li.dataset.remind || "off",
            subtasks: readSubtasks(li),
            createdAt: li.dataset.createdAt || ""
        };
    });

    const todos = activeTodos.concat(completedTodos);
    localStorage.setItem("todos", JSON.stringify(todos));

    const binnedTodos = [...binList.querySelectorAll("li")].map(function (li) {
        return {
            id: ensureTodoId(li),
            text: li.querySelector("span").textContent,
            isDone: li.dataset.isDone === "true",
            notes: li.dataset.notes || "",
            dueDate: li.dataset.dueDate || "",
            lastCompleted: li.dataset.lastCompleted || "",
            priority: li.dataset.priority || "none",
            tag: li.dataset.tag || "none",
            repeat: li.dataset.repeat || "none",
            repeatDays: readRepeatDays(li),
            remind: li.dataset.remind || "off",
            subtasks: readSubtasks(li),
            createdAt: li.dataset.createdAt || ""
        };
    });
    localStorage.setItem("binnedTodos", JSON.stringify(binnedTodos));
    if (todoSort.value === "manual") {
        saveCustomOrder();
    }
    updateEmptyMessages();
    checkReminders();
}

function updateEmptyMessages() {
    todoEmpty.hidden = todoList.querySelectorAll("li").length > 0;
    completedEmpty.hidden = completedList.querySelectorAll("li").length > 0;
    binEmpty.hidden = binList.querySelectorAll("li").length > 0;

    if (binList.querySelectorAll("li").length === 0) {
        binConfirm.hidden = true;
    }
    sortTodos();
    filterTodos();
}

function filterTodos() {
    const query = todoSearch.value.trim().toLowerCase();
    const scope = todoSearchIn.value;

    function matchRow(li) {
        const text = li.querySelector("span").textContent.toLowerCase();
        const textMatch = query === "" || text.includes(query);
        const tag = todoTagFilter.value;
        const tagMatch = tag === "all" || li.dataset.tag === tag;
        li.hidden = !(textMatch && tagMatch);
    }

    function showAllRows(list) {
        list.querySelectorAll("li").forEach(function (li) {
            const tag = todoTagFilter.value;
            li.hidden = tag !== "all" && li.dataset.tag !== tag;
        });
    }

    if (scope === "all" || scope === "active") {
        todoList.querySelectorAll("li").forEach(matchRow);
    } else {
        showAllRows(todoList);
    }

    if (scope === "all" || scope === "completed") {
        completedList.querySelectorAll("li").forEach(matchRow);
    } else {
        showAllRows(completedList);
    }

    if (scope === "all" || scope === "bin") {
        binList.querySelectorAll("li").forEach(matchRow);
    } else {
        showAllRows(binList);
    }

    if (scope === "completed") {
        completedTodoCheckbox.checked = true;
    }

    if (scope === "bin") {
        binCheckbox.checked = true;
    }

    if (scope === "all" && query !== "") {
        completedList.querySelectorAll("li").forEach(function (li) {
            if (!li.hidden) {
                completedTodoCheckbox.checked = true;
            }
        });
        binList.querySelectorAll("li").forEach(function (li) {
            if (!li.hidden) {
                binCheckbox.checked = true;
            }
        });
    }
}

function priorityRank(priority) {
    if (priority === "high") {
        return 0;
    }
    if (priority === "medium") {
        return 1;
    }
    if (priority === "low") {
        return 2;
    }
    return 3;
}

function newTodoId() {
    return Date.now() + "-" + Math.random().toString(16).slice(2);
}

function ensureTodoId(li) {
    if (!li.dataset.id) {
        li.dataset.id = newTodoId();
    }
    return li.dataset.id;
}

function saveCustomOrder() {
    const order = {
        active: [...todoList.querySelectorAll("li")].map(ensureTodoId),
        completed: [...completedList.querySelectorAll("li")].map(ensureTodoId)
    };
    localStorage.setItem(customOrderStorageKey, JSON.stringify(order));
}

function applyCustomOrderToList(list, ids) {
    const rows = [...list.querySelectorAll("li")];
    const byId = {};

    rows.forEach(function (li) {
        byId[ensureTodoId(li)] = li;
    });

    ids.forEach(function (id) {
        if (byId[id]) {
            list.append(byId[id]);
            delete byId[id];
        }
    });

    rows.forEach(function (li) {
        if (byId[li.dataset.id]) {
            list.append(li);
        }
    });
}

function applyCustomOrder() {
    const saved = localStorage.getItem(customOrderStorageKey);
    if (!saved) {
        return;
    }

    let order;
    try {
        order = JSON.parse(saved);
    } catch (error) {
        return;
    }

    applyCustomOrderToList(todoList, order.active || []);
    applyCustomOrderToList(completedList, order.completed || []);
}

function setSortMode(mode) {
    const allowed = ["created", "due", "priority", "manual"];
    const next = allowed.indexOf(mode) === -1 ? "created" : mode;
    todoSort.value = next;
    localStorage.setItem(sortStorageKey, next);
}

function sortTodoList(list) {
    const mode = todoSort.value;
    if (mode === "manual") {
        return;
    }

    if (list.querySelector(".todo-completing")) {
        return;
    }

    const items = [...list.querySelectorAll("li")];

    items.sort(function (a, b) {
        if (mode === "due") {
            const dueA = a.dataset.dueDate || "9999-12-31";
            const dueB = b.dataset.dueDate || "9999-12-31";
            if (dueA < dueB) {
                return -1;
            }
            if (dueA > dueB) {
                return 1;
            }
            return 0;
        }

        if (mode === "priority") {
            return priorityRank(a.dataset.priority) - priorityRank(b.dataset.priority);
        }

        const createdA = a.dataset.createdAt || "9999-12-31";
        const createdB = b.dataset.createdAt || "9999-12-31";
        if (createdA < createdB) {
            return -1;
        }
        if (createdA > createdB) {
            return 1;
        }
        return 0;
    });

    items.forEach(function (li) {
        list.append(li);
    });
}

function sortTodos() {
    sortTodoList(todoList);
    sortTodoList(completedList);
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

    if (span.classList.contains("todo-due-hint") || span.classList.contains("todo-tag") || span.classList.contains("todo-caption")) {
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
    taskEditorTag.value = li.dataset.tag || "none";
    taskEditorRepeat.value = li.dataset.repeat || "none";
    if ((li.dataset.repeat || "none") === "custom") {
        setRepeatDayButtons(readRepeatDays(li));
        setFortnightPressed(false);
    } else {
        applyRepeatFromDropdown();
    }
    writeEditorRemind(li.dataset.remind || "off");
    fillEditorSubtasks(readSubtasks(li));
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
            lastCompleted: editorItem.dataset.lastCompleted || "",
            priority: taskEditorPriority.value,
            tag: taskEditorTag.value,
            repeat: taskEditorRepeat.value,
            repeatDays: collectEditorRepeatDays(),
            remind: readEditorRemind(),
            subtasks: collectEditorSubtasks(),
            createdAt: editorItem.dataset.createdAt || todayDate()
        });

        const checkbox = editorItem.querySelector("input[type='checkbox']");
        const shouldBeDone = taskEditorDone.checked;

        if (shouldBeDone && !checkbox.checked) {
            const result = tryCompleteRepeatingTodo(editorItem);
            if (result === "blocked" || result === "advanced") {
                checkbox.checked = false;
                taskEditorDone.checked = false;
            } else {
                finishActiveComplete(editorItem);
            }
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

todoSearch.addEventListener("input", filterTodos);
todoSearchClear.addEventListener("click", function () {
    todoSearch.value = "";
    todoSearch.focus();
    filterTodos();
});

taskEditorSubtaskAdd.addEventListener("click", function () {
    const text = taskEditorSubtaskInput.value.trim();
    if (text === "") {
        return;
    }

    taskEditorSubtasks.append(createSubtaskItem(text, false));
    updateSubtaskProgress();
    taskEditorSubtaskInput.value = "";
    taskEditorSubtaskInput.focus();
});

taskEditorSubtaskInput.addEventListener("keydown", function (event) {
    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();
    taskEditorSubtaskAdd.click();
})

taskEditorSubtasks.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) {
        return;
    }

    button.closest("li").remove();
    updateSubtaskProgress();
});

taskEditorSubtasks.addEventListener("change", updateSubtaskProgress);

taskEditorRepeat.addEventListener("change", applyRepeatFromDropdown);

taskEditorDue.addEventListener("change", function () {
    const repeat = taskEditorRepeat.value;
    if (repeat === "monthly") {
        applyRepeatFromDropdown();
    }
});

taskEditorRepeatDays.addEventListener("click", function (event) {
    const button = event.target.closest(".task-editor-repeat-day");
    if (!button) {
        return;
    }

    const isOn = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", isOn ? "false" : "true");
    matchRepeatFromControls();
});

taskEditorRepeatFortnight.addEventListener("click", function () {
    const isOn = taskEditorRepeatFortnight.getAttribute("aria-pressed") === "true";
    if (isOn) {
        setFortnightPressed(false);
        matchRepeatFromControls();
        return;
    }
    taskEditorRepeat.value = "fortnight";
    applyRepeatFromDropdown();
});

taskEditorRemind.addEventListener("click", function (event) {
    const button = event.target.closest(".task-editor-remind-option");
    if (!button) {
        return;
    }

    taskEditorRemind.querySelectorAll(".task-editor-remind-option").forEach(function (option) {
        option.setAttribute("aria-pressed", option === button ? "true" : "false");
    });
});

todoSearchIn.addEventListener("change", filterTodos);
todoSort.addEventListener("change", function () {
    const previous = localStorage.getItem(sortStorageKey) || "created";
    const next = todoSort.value;
    if (previous === "manual" && next !== "manual") {
        saveCustomOrder();
    }
    setSortMode(next);
    if (next === "manual") {
        applyCustomOrder();
    }
    sortTodos();
});
todoTagFilter.addEventListener("change", filterTodos);

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
        lastCompleted: "",
        priority: "none",
        tag: "none",
        repeat: "none",
        repeatDays: [],
        subtasks: [],
        createdAt: todayDate()
    });
    todoList.append(li);
    saveTodos();

    todoInput.value = "";
    todoInput.focus();
});

function finishActiveComplete(li) {
    if (li.classList.contains("todo-completing")) {
        return;
    }

    const checkbox = li.querySelector("input[type='checkbox']");
    checkbox.checked = true;
    li.classList.add("todo-completing");

    window.setTimeout(function () {
        li.classList.remove("todo-completing");
        completedList.append(li);
        saveTodos();
    }, 300);
}

todoList.addEventListener("change", function (event) {
    const checkbox = event.target.closest("input[type='checkbox']");
    if (!checkbox) {
        return;
    }

    const li = checkbox.closest("li");
    const result = tryCompleteRepeatingTodo(li);
    if (result === "blocked" || result === "advanced") {
        checkbox.checked = false;
        saveTodos();
        return;
    }

    finishActiveComplete(li);
});

todoList.addEventListener("mousedown", enableRowDrag);
completedList.addEventListener("mousedown", enableRowDrag);

todoList.addEventListener("keydown", handleGripKeyDown);
completedList.addEventListener("keydown", handleGripKeyDown);

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

completedBinAll.addEventListener("click", function () {
    [...completedList.querySelectorAll("li")].forEach(moveToBin);
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

themeToggle.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") {
        return;
    }
    event.preventDefault();
    themeToggle.click();
});

taskEditorClose.addEventListener("click", closeTaskEditor);
taskEditorBackdrop.addEventListener("click", closeTaskEditor);

const savedTheme = localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
setTheme(savedTheme);
setSortMode(localStorage.getItem(sortStorageKey) || "created");
loadTodos();

if (todoSort.value === "manual") {
    applyCustomOrder();
}

checkReminders();
window.setInterval(checkReminders, 60000);