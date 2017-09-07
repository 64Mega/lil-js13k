// Audio Engine
// --
// Really primitive and buggy, but it adds a bit of depth to the game.

let AUDIO = {
    context : new AudioContext(),
    osc : null,
    gain: null,
};

function aud_init() {
    AUDIO.osc = AUDIO.context.createOscillator();
    AUDIO.gain = AUDIO.context.createGain();
    AUDIO.gain.gain.exponentialRampToValueAtTime(
        0.00001, AUDIO.context.currentTime + 0.04
    );
    AUDIO.osc.type = "square";
    AUDIO.osc.connect(AUDIO.gain);
    AUDIO.gain.connect(AUDIO.context.destination);
    AUDIO.gain.gain.value = 0;
    AUDIO.osc.start(0);
}

function aud_beep(freq, stoptime) {
    AUDIO.osc.frequency.value = freq;
    AUDIO.gain.gain.value = 0.5;
    
    AUDIO.gain.gain.exponentialRampToValueAtTime(0.00001, AUDIO.context.currentTime + stoptime);
}

function aud_seq(notes, stoptimes) {
    for(let i = 0; i < notes.length; i++) {
        setTimeout(() => {
            aud_beep(notes[i], stoptimes);
        }, i*stoptimes*1000)
    }
}