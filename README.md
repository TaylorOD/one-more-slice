# C0saNostra Pizza

a pizza dispatch terminal inspired by snow crash. add toppings, fire the oven and inspect a slice before pickup.

call the courier after baking. she collects the box while rolling, skates up to the street and hooks a passing car. traffic keeps moving in both directions.

she has a magnetic wrist launcher, a courier bag, knee pads and a smartwheel board. the cable shoots out, catches the bumper and pulls her into a crouch. replay pickup runs it again without rebuilding the pizza.

reduced motion shows a still handoff instead of the moving chase.

black background, monospace and the same syntax colors as my website. the kitchen sits in a city at night. the pizza is still pizza.

pick a topping and tap the cheese. drag sideways to turn it, or use the arrow buttons. add a handful if you want less precision. the house special makes one for you.

share saves the toppings in the link. no account or database.

the pickup clock starts when you add toppings or bake a plain cheese pizza. you get 90 seconds. it stops when baking finishes. if it runs out, the courier waits. you can still finish the order.

## run it

```sh
npm install
npm run build
npm start
```

open http://localhost:5177

## tests

```sh
npm test
```

install the browser once with `npx playwright install chromium`, then run `npm run test:browser`. it builds the site and starts its own server on a free port.

github runs both sets of tests on every pr and before publishing. browser screenshots are saved with the workflow run, including failed runs.

## working on it

use node 24, which is also what github runs. install the exact dependencies with `npm ci`.

```sh
npm run lint
npm run format:check
npm test
npm run test:browser
```

`npm run format` formats the source. lint and formatting checks run in github too. screenshots are evidence to look at, not an automatic visual approval. check the part you changed on desktop and a phone before pushing.

## code layout

| file             | job                                                         |
| ---------------- | ----------------------------------------------------------- |
| `app.js`         | put the scene, city, kitchen and order controller together  |
| `scene.js`       | renderer, lighting, resize handling and camera framing      |
| `city.js`        | ground and buildings at roughly one metre per unit          |
| `geometry.js`    | small mesh helpers and shared sphere geometry               |
| `kitchen.js`     | oven, pizza, toppings and cooked appearance                 |
| `courier.js`     | street, courier, traffic and pickup animation               |
| `order.js`       | order state, transitions, controls and frame loop           |
| `order-view.js`  | ticket text, buttons, clock and delivery steps              |
| `pizza-input.js` | pointer capture, turning and topping placement              |
| `sharing.js`     | share dialog and clipboard fallback                         |
| `recipe.js`      | recipe encoding and validation without browser dependencies |

the normal order path is `prep → baking → baked → pickup → dispatched`. inspecting a slice toggles between `baked` and `sliced`. reset returns to `prep`, including during baking or pickup. replay starts another pickup with the same pizza.

the order controller owns state. scene files own geometry. the view reads state and updates the page. keep those boundaries when adding things.

toppings share their geometry and materials for the life of the page. clearing a topping removes its meshes without disposing shared resources. a new topping type should reuse resources too. the browser test counts gpu buffers across repeated orders to catch leaks.

the courier uses elapsed seconds rather than accumulated frame steps. reset, replay and a slow frame should all land on the same pose. the timeline checks use a paused browser clock so they also work on slower github runners.

the minimatch override keeps the lint tools on its patched release. it is a development dependency and is not shipped with the site.

## where it fits

keep it as a separate project at /one-more-slice/ with a pizza_delivery() link from the projects page. the homepage stays light. the game shares the site's colors and type, with a back home link.

the existing game is live at https://www.taylordorsett.com/one-more-slice/. changes deploy after merging to main.

the dist folder is the whole site. it works on static hosting. recipe links work once the site has a public address.

built with three.js. needs a browser with webgl.
