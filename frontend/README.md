# Raptor Finance website
This project contains the website of Raptor Finance.

## How to build
Install Node.js, then run:

    npm install
    npm run build

You can run a development server using:

    npm start

Which will then open a server listening to http://localhost:3000

## Coding guidelines

### DO

* maintain the structural integrity of the project
* use existing components, if possible - for example `StaticHtml` for a new static page
* use NPM to add external dependencies (like Web3, JQuery, ...)
* stick to React.js best practices

### DON'T

* add external libraries by committing `.js` files directly into the repo (always use NPM)
* add static content anywhere else than `/src/content`
* commit directly on `main` without consent of lead developer

