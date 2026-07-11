# Todo App

A guided todo application built with HTML, CSS, and JavaScript. The project follows a phased approach — structure and styling first, then interactive behavior — making it a solid learning and portfolio piece.

**Author:** Ivan Ivanov  
**License:** [MIT](LICENSE)

## Features

### Completed (Phase 1 & 2)

- Active todo list with sample tasks
- Add-todo form (HTML structure in place)
- Completed todos section with strikethrough styling
- **Show Completed Todos** toggle — pure CSS show/hide using `:has()` and the sibling combinator
- Custom circular checkboxes with checkmark styling
- Card-style layout with a cohesive gold/tan theme (`#c7b99b`, `#8d7f60`)
- Accessible labels and `aria-label` attributes on form controls
- Semantic HTML (`<ul>` / `<li>` for lists)

### Planned (Phase 3)

- Add new todos via form submit
- Delete todos
- Mark todos as complete and move them to the completed list
- Uncheck completed todos to move them back to the active list

## Tech Stack

- HTML5
- CSS3 (Flexbox, custom checkboxes, `:has()` selector)
- Vanilla JavaScript (Phase 3 — not yet implemented)

No build tools, frameworks, or dependencies required.

## Status

Work in progress. This app will be hosted online later — deployment and access details will be added when ready.

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
        └── script.js       # App logic (Phase 3)
```

## Development Phases

| Phase | Focus | Status |
|-------|--------|--------|
| **Phase 1** | HTML structure, semantic markup, accessibility basics | Done |
| **Phase 2** | CSS styling, layout, completed toggle, custom checkboxes | Done |
| **Phase 3** | JavaScript — add, delete, complete, move todos | Planned |

## How the Completed Toggle Works

The **Show Completed Todos** control uses a hidden checkbox and a styled label as a button. When checked, CSS reveals the completed list:

```css
#completed-todo-container-checkbox:has(#completed-todo-checkbox:checked) ~ #completed-todo-list-container {
    display: block;
}
```

The toggle card and completed list are separate blocks under `<main>` — the list appears below the button, not inside the same card.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
