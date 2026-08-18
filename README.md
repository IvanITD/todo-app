# Todo App

A browser todo list built with HTML, CSS, and vanilla JavaScript. No frameworks, build tools, or backend — todos are saved in the browser with `localStorage`.

**Live demo:** [https://ivanitd.github.io/todo-app/](https://ivanitd.github.io/todo-app/)  
**Version:** 1.1.0  
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
- Empty-state messages when a list has no items
- Todos persist across page refreshes
- **Show Completed Todos** and **Bin** toggles (pure CSS)
- Custom circular checkboxes and a gold/tan card layout
- Accessible labels on form controls

## How to use

1. Type a task and click **Add** (or press Enter).
2. Check the circle to complete it. Turn on **Show Completed Todos** to see that list.
3. Double-click the text to rename a task.
4. Click **X** to move a task to the **Bin**.
5. Open **Bin** to restore a task, restore all, delete one forever, or empty the bin.

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

## How the Completed Toggle Works

The **Show Completed Todos** control uses a hidden checkbox and a styled label as a button. When checked, CSS reveals the completed list:

```css
#completed-todo-container-checkbox:has(#completed-todo-checkbox:checked) ~ #completed-todo-list-container {
    display: block;
}
```

The toggle card and completed list are separate blocks under `<main>` — the list appears below the button, not inside the same card.

## How Persistence Works

After add, delete, complete, edit, or a bin action, the app saves two `localStorage` keys:

- `todos` — active and completed items as `{ text, isDone }`
- `binnedTodos` — bin items as `{ text, isDone }` (`isDone` remembers whether to restore to active or completed)

On load, both lists and the bin are rebuilt from that data. If nothing is saved, they start empty.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
