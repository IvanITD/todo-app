# Todo App

A browser todo list built with HTML, CSS, and vanilla JavaScript. No frameworks, build tools, or backend — todos are saved in the browser with `localStorage`.

**Live demo:** [https://ivanitd.github.io/todo-app/](https://ivanitd.github.io/todo-app/)  
**Version:** 1.4.0  
**Author:** Ivan Ivanov  
**License:** [MIT](LICENSE)

## Features

- Add todos from the form
- Move a todo to the **Bin** with the **X** button
- Restore one binned task, restore all, or delete one forever
- Empty the bin with an in-app confirm (Cancel or Empty bin)
- Check an item to move it to the completed list
- Uncheck a completed item to move it back
- Double-click todo text to edit (Enter or click away to save, Escape to cancel)
- **☰** opens a task editor overlay (name, notes, due date, priority, created date, completed)
- Search box filters active and completed todos by name (hidden, not deleted)
- Empty-state messages when a list has no items
- Todos persist across page refreshes
- Light / Dark theme toggle (saved in the browser; **Light** stays a visible chip on the dark header)
- **Show Completed Todos** and **Bin** toggles (pure CSS)
- Hover styles on Add, Bin, Restore All, Empty bin, and the theme toggle in both themes
- Custom circular checkboxes on the list and in the task editor, gold/tan card layout
- Accessible labels on form controls

## How to use

1. Type a task and click **Add** (or press Enter).
2. Use **Search todos** to show only names that match. Clear the box to see the full list again.
3. Check the circle to complete it. Turn on **Show Completed Todos** to see that list.
4. Double-click the text to rename a task, or click **☰** for the full editor (notes, due date, priority, and more). Close or click the dim backdrop to save.
5. Click **X** to move a task to the **Bin**.
6. Open **Bin** to restore a task, restore all, delete one forever, or empty the bin.
7. Click **Dark** / **Light** in the header to switch theme.

Each visitor’s list is stored only in their own browser.

## How to run locally

Open `index.html` in a browser, or use Live Server in your editor. No install step.

## Tech Stack

- HTML5
- CSS3 (Flexbox, custom checkboxes, `:has()` selector)
- Vanilla JavaScript (DOM events, `localStorage`)

## Project Structure

```
todo-app/
├── README.md
├── LICENSE
├── .gitignore
├── index.html              # App entry point
└── assets/
    ├── css/
    │   └── style.css       # All styles
    └── js/
        └── script.js       # App logic
```

## Development Phases

The app was built in phases — structure and styling first, then behavior, then persistence and a public release.

| Phase | Focus | Status |
|-------|--------|--------|
| **Phase 1** | HTML structure, semantic markup, accessibility basics | Done |
| **Phase 2** | CSS styling, layout, completed toggle, custom checkboxes | Done |
| **Phase 3** | JavaScript — add, delete, complete, move todos | Done |
| **Phase 4** | Persist todos, empty states, and inline edit | Done |
| **Phase 5** | GitHub Pages deploy and README for v1.0.0 | Done |
| **Phase 6** | Bin — restore, restore all, empty, delete forever | Done |
| **Phase 7** | Dark mode with saved theme | Done |
| **Phase 8** | Task editor overlay — notes, due date, priority, created date | Done |
| **Phase 9** | Search / filter by todo name | Done |

## How the Completed Toggle Works

The **Show Completed Todos** control uses a hidden checkbox and a styled label as a button. When checked, CSS reveals the completed list:

```css
#completed-todo-container-checkbox:has(#completed-todo-checkbox:checked) ~ #completed-todo-list-container {
    display: block;
}
```

The toggle card and completed list are separate blocks under `<main>` — the list appears below the button, not inside the same card.

## How the Task Editor Works

There is **one** overlay for the whole page (`#task-editor`), not a copy inside each todo. Clicking **☰** fills that panel from the chosen row and removes the `hidden` attribute. Close (or the backdrop) writes the fields back onto that row, then saves.

The overlay uses `hidden` to hide. CSS only applies `display: flex` when the attribute is off (`#task-editor:not([hidden])`), so `display` does not override `hidden`.

The **Completed** checkbox in the overlay uses the same circular style as the list (`appearance: none`, `border-radius: 50%`). Dark-theme button hovers are extra rules (`[data-theme="dark"] …:hover`) so they are not overwritten by the dark resting colors.

## How Search Works

`#todo-search` is **outside** the add form so Enter does not create a todo. On each keystroke, `filterTodos` compares the query to each row’s name (case-insensitive) and sets `li.hidden` on non-matches. Clearing the box shows every row again. Search does not change `localStorage`.

List rows use `display: flex`. That would override `hidden` the same way the overlay did, so flex is applied only with `#todo-list li:not([hidden])` (and the same for the completed list).

## How Persistence Works

After add, delete, complete, edit, bin, or closing the task editor, the app saves:

- `todos` — active and completed items as `{ text, isDone, notes, dueDate, priority, createdAt }`
- `binnedTodos` — bin items with the same shape (`isDone` remembers whether to restore to active or completed)
- `todoTheme` — `"dark"` or `"light"`

On load, both lists and the bin are rebuilt from that data. If nothing is saved, they start empty. Todos created before v1.3.0 still load; extra fields start empty until you open and close the editor once.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
