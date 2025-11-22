let startModal = document.getElementById("start-modal");
let startButton = document.getElementById("start-button");
let volumeSlider = document.getElementById("volume-slider");
let attackSlider = document.getElementById("attack-slider");
let releaseSlider = document.getElementById("release-slider");
let filterSlider = document.getElementById("filter-slider");
let waveformDropdown = document.getElementById("waveform-dropdown");
let keys = Array.from(document.getElementById("keys").children);

const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

// AudioContext nodes
let ctx = new AudioContext();
let filter = ctx.createBiquadFilter();
let compressor = ctx.createDynamicsCompressor();
filter.connect(compressor);
compressor.connect(ctx.destination);

// Synth Settings
let volume = 0.9;
let attack = 0;
let release = 0.1;
let waveform = "sine";
let filterFrequency = 10000;
volumeSlider.value = volume;
attackSlider.value = attack;
releaseSlider.value = release;
filterSlider.value = filterFrequency;
waveformDropdown.value = waveform;


function playNote(frequency) {
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();

    osc.type = waveform;
    osc.frequency.value = frequency;
    filter.frequency.value = filterFrequency;
    filter.Q.value = -1;

    // Connections
    gain.connect(filter);
    osc.connect(gain);
    osc.start();

    // AR Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + Number(attack));
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + Number(attack) + Number(release));
}

keys.forEach(function(note, i) {
    note.addEventListener("click", function() {
        playNote(notes[i]);
    })
})

volumeSlider.oninput = function() {
    volume = volumeSlider.value;
}

attackSlider.oninput = function() {
    attack = attackSlider.value;
}

releaseSlider.oninput = function() {
    release = releaseSlider.value;
}

filterSlider.oninput = function() {
    console.log(filterFrequency);
    filterFrequency = Math.pow(10000, filterSlider.value);
}

waveformDropdown.oninput = function() {
    waveform = waveformDropdown.value;
}