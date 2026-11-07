# Snowcrust

make the pizza. get it out the door.

[play Snowcrust](https://www.taylordorsett.com/snowcrust/)

a small 3d pizza project set around C0saN0stra Pizza. take a call, match the toppings, bake it and send a RadiKS kourier into traffic.

Snowcrust is the project name. C0saN0stra Pizza is the restaurant.

## how it works

six callers order from a menu of 14 toppings. sauce and mozzarella are already on the base. the ticket shows the extras they want.

you get two minutes once prep starts. the ticket is already 28 minutes into the franchise's thirty minute guarantee. the clock keeps running through pickup. being late does not stop the order.

the customer scores the pizza from 0 to 100 based on the toppings. extras count against you. inspecting a slice lets you take a bite, which costs 10 points. delivery time is reported separately.

reset clears the pizza and timer but keeps the caller. next call changes the customer. replay shows the pickup again with the original score and time.

## run it

use Node 24.

    npm ci
    npm run build
    npm start

open [localhost:5177](http://localhost:5177). rebuild after changing the source. the server serves dist, so there is no automatic reload.

## check it

    npm run lint
    npm run format:check
    npm test
    npx playwright install chromium
    npm run test:browser

install Chromium once. on Linux, use npx playwright install with the --with-deps option if the browser needs system packages.

the browser checks build their own copy and start a server on a free port. they cover desktop, mobile, baking, pickup, scoring, reset, old recipe links and reduced motion. screenshots go in artifacts/screenshots.

use npm run format to format the code. look at the actual changed area on desktop and mobile before pushing. add screenshots to the PR.

## where things live

| folder         | what belongs there                                      |
| -------------- | ------------------------------------------------------- |
| src/kitchen/   | pizza, ingredients, oven, peel and cooking motion       |
| src/delivery/  | kourier, traffic and pickup motion                      |
| src/order/     | order flow, callers, score, timer and recipe data       |
| src/ui/        | page updates and pointer controls                       |
| src/scene/     | renderer, camera, city and shared scene helpers         |
| src/styles/    | page styles                                             |
| scripts/       | build, local server and browser test runner             |
| tests/unit/    | scoring, recipes and motion checks without a browser    |
| tests/browser/ | browser flows and screenshot helpers                    |
| docs/          | architecture, world references and saved PR screenshots |
| artifacts/     | generated test output, ignored by git                   |
| dist/          | generated site, ignored by git                          |

index.html is the page. src/app.js connects the scene, kitchen and order controller.

[architecture and editing guide](docs/ARCHITECTURE.md) / [world references](docs/WORLD.md)

## publishing

GitHub Actions runs the checks on PRs and on main. merging to main publishes through GitHub Pages.

the build copies the page, source and Three.js into dist. tests, docs and screenshots are not published. everything is static. there is no backend.

built with Three.js. needs WebGL. reduced motion uses a still handoff. old recipe links still work, but there is no share button.
