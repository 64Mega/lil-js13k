// Simple full-keyboard listener

// Keycode constant lookups
// UP ARROW - 38
// RIGHT ARROW - 39
// DOWN ARROW - 40
// LEFT ARROW - 37
// SPACE BAR - 32
// LSHIFT - 16
// LCTRL - 17
// LALT - 18
// RETURN - 13
// TAB - 9

let KEYS = [];
let PRKS = [];
for(let i = 0; i < 255; i++) {
    KEYS[i] = 0;
    PRKS[i] = 0;
}

onkeydown = (e) => {
    KEYS[e.keyCode] = 1;
};

onkeyup = (e) => {
    KEYS[e.keyCode] = 0;
    PRKS[e.keyCode] = 0;
};

function pressed(k) {
    let a = KEYS[k];
    PRKS[k] === 0 && a === 1 ? PRKS[k] = 1 : a = false;
    return a;
}

function held(k) {
    return KEYS[k] > 0;
}