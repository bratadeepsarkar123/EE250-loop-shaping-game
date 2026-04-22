const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('js/events.js', 'utf8');
const context = { window: {}, Math: Math };
vm.createContext(context);
vm.runInContext(code, context);

const Events = context.window.Events;
console.log("Events object:", Object.keys(Events));

let GS = {
    distanceTravelled: 0,
    disturbance: 0
};

console.log("Testing trigger...");
Events.trigger('wind', GS);
console.log("After wind:", GS);

Events.trigger('speedzone', GS);
console.log("After speedzone:", GS);

console.log("Testing tick...");
for (let i = 0; i < 200; i++) {
    Events.tick(GS);
}
console.log("After 200 ticks:", GS);
