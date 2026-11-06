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

## where it fits

keep it as a separate project at /one-more-slice/ with a pizza_delivery() link from the projects page. the homepage stays light. the game shares the site's colors and type, with a back home link.

the existing game is live at https://www.taylordorsett.com/one-more-slice/. changes deploy after merging to main.

the dist folder is the whole site. it works on static hosting. recipe links work once the site has a public address.

built with three.js. needs a browser with webgl.
