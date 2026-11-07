# working on snowcrust

## start here

src/app.js creates the renderer, kitchen and city, then starts the order controller.

src/order/order.js owns the order state and frame loop. scene modules build and update meshes. UI modules update the page or handle pointer input. keep those jobs separate.

the normal flow is prep, baking, baked, pickup, dispatched. inspecting a slice switches between baked and sliced. reset returns to prep, including during baking or pickup.

## change the pizza

src/kitchen/kitchen.js builds the pizza and shared ingredient models. ingredient-station.js uses those same models for the trays.

pizza-oven.js builds the oven. oven-motion.js owns its dimensions and loading path. browning starts after the whole pizza enters. the peel and pizza stay above the stone and fire through entry and exit.

pizza-peel.js builds the blade, collar and handle. topping-motion.js controls the small rebound when ingredients land. sauce-surface.js paints one texture shared by all slices and stops updating when the sauce settles.

toppings share geometry and materials for the life of the page. clearing an order removes meshes without disposing those shared resources. the browser checks watch GPU buffers across repeated orders.

## change delivery

src/delivery/courier.js builds the shop, rider, board, box and tow line. traffic-vehicles.js builds the car models.

courier-motion.js owns the path and timing. it uses elapsed seconds, so a slow frame or replay lands at the same pose. clearance tests cover the shop, counter and rear bumper. the box must meet the rider's hand without jumping.

keep new street props outside both traffic lanes and the pickup route. src/scene/franchise-details.js holds the kitchen and street reference details. [WORLD.md](WORLD.md) explains their sources and the game adaptations.

## change an order

src/order/orders.js holds callers, scoring and the round clock without browser dependencies. score is matched toppings divided by requested toppings plus extras, rounded to a whole number. taking a bite subtracts 10 points. time does not change the score.

src/ui/order-ticket.js renders the caller, counts, timer and receipt. order-view.js updates the controls and delivery steps. pizza-input.js handles turning and topping placement.

src/order/recipe.js validates old recipe links. a valid link replaces the pizza and resets its position. a broken link leaves the current order alone.

## tests and build

unit tests live in tests/unit. browser tests live in tests/browser and use a paused clock for animation checks.

scripts/run-browser-tests.js builds the site and starts its own server. screenshot output goes in artifacts/screenshots, not in the source tree. GitHub uploads that folder even when checks fail.

docs/screenshots keeps earlier PR evidence. it is an archive, not a visual baseline. new test runs do not overwrite it.

scripts/build.js replaces the generated dist folder and copies all of src. adding a source module does not need another entry in a build list. keep imports relative so the site works under /snowcrust/.

the minimatch override is for the development tools. it is not shipped with the site.
