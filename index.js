let volumeSlider = document.getElementById("volume-slider");
let attackSlider = document.getElementById("attack-slider");
let releaseSlider = document.getElementById("release-slider");
let filterSlider = document.getElementById("filter-slider");
let detuneSlider = document.getElementById("detune-slider");
let waveformDropdown = document.getElementById("waveform-dropdown");
let keys = Array.from(document.getElementById("keys").children);
let presetList = document.getElementById("preset-list");
let newPresetInput = document.getElementById("new-preset-input");
let saveButton = document.getElementById("save-button");

const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
const keyboardMap = {
    // Low Octave
    z: chooseNote(130.81),
    x: chooseNote(146.83),
    c: chooseNote(164.81),
    v: chooseNote(174.61),
    b: chooseNote(196),
    n: chooseNote(220),
    m: chooseNote(246.94),

    // Mid Octave
    a: chooseNote(261.63),
    s: chooseNote(293.66),
    d: chooseNote(329.63),
    f: chooseNote(349.23),
    g: chooseNote(392.00),
    h: chooseNote(440.00),
    j: chooseNote(493.88),
    k: chooseNote(523.25),
    l: chooseNote(587.33),

    // High Octave
    q: chooseNote(523.25),
    w: chooseNote(587.33),
    e: chooseNote(659.25),
    r: chooseNote(698.46),
    t: chooseNote(783.99),
    y: chooseNote(880),
    u: chooseNote(987.77),
    i: chooseNote(1046.5),
    o: chooseNote(1174.66),
    p: chooseNote(1318.51)
}
const heldKeys = new Set();

// AudioContext nodes
let ctx = new AudioContext();
let filter = ctx.createBiquadFilter();
let compressor = ctx.createDynamicsCompressor();
filter.connect(compressor);
filter.Q.value = -1;
compressor.connect(ctx.destination);

// Synth Settings
let volume = 0.9;
let attack = 0;
let release = 0.1;
let waveform = "sine";
let filterFrequency = 18000;
let detune = 0;
volumeSlider.value = volume;
attackSlider.value = attack;
releaseSlider.value = release;
filterSlider.value = 1;
detuneSlider.value = detune;
filter.frequency.value = filterFrequency;
waveformDropdown.value = waveform;

function playNote(frequency) {
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();

    osc.type = waveform;
    osc.frequency.value = frequency;

    gain.connect(filter);
    osc.connect(gain);
    osc.start();

    // AR Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + Number(attack));
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + Number(attack) + Number(release));
}

function chooseNote(frequency) {
    return function() {
        playNote(frequency + Number(detune));
        playNote(frequency - Number(detune));
    }
}

keys.forEach(function(note, i) {
    note.addEventListener("click", function() {
        playNote(notes[i] + Number(detune));
        playNote(notes[i] - Number(detune));
    })

    document.addEventListener("keydown", function(e) {
        let key = e.key.toLowerCase();
        if (heldKeys.has(key)) return;
        heldKeys.add(key);

        const action = keyboardMap[key];
        if (action) action();
    })

    document.addEventListener("keyup", function(e) {
        heldKeys.delete(e.key.toLowerCase());
    })
})

// Synth Sliders
function updateVolume() {
    volume = volumeSlider.value ** 3
}

function updateAttack() {
    attack = attackSlider.value ** 1.25;
}

function updateRelease() {
    release = releaseSlider.value;
}

function updateFilter() {
    filterFrequency = Math.pow(10000, filterSlider.value);
    filter.frequency.value = filterFrequency;
}

function updateDetune() {
    detune = detuneSlider.value;
}

function updateWaveform() {
    waveform = waveformDropdown.value;
}

volumeSlider.oninput = updateVolume;
attackSlider.oninput = updateAttack;
releaseSlider.oninput = updateRelease;
filterSlider.oninput = updateFilter;
detuneSlider.oninput = updateDetune;
waveformDropdown.oninput = updateWaveform;

// Presets
class Preset {
    constructor(name, volume, attack, release, filterFrequency, detune, waveform) {
        this.name = name;
        this.volume = volume;
        this.attack = attack;
        this.release = release;
        this.filterFrequency = filter;
        this.detune = detune;
        this.waveform = waveform;
    }
}

let presets = [];

function populatePresetList() {
    presetList.textContent = "";
    presets.forEach(preset => {
        let listElement = document.createElement("li");
        listElement.classList.add("preset-item");
        listElement.setAttribute("data-name", preset.name);
        listElement.setAttribute("data-volume", preset.volume);
        listElement.setAttribute("data-attack", preset.attack);
        listElement.setAttribute("data-release", preset.release);
        listElement.setAttribute("data-filterFrequency", preset.filterFrequency);
        listElement.setAttribute("data-detune", preset.detune);
        listElement.setAttribute("data-waveform", preset.waveform);
        listElement.textContent = preset.name;

        listElement.addEventListener("click", loadPreset);

        presetList.appendChild(listElement);
    });
    newPresetInput.value = "";
}

function savePreset() {
    if (newPresetInput.value === "") {
        return
    }
    let newPreset = new Preset(newPresetInput.value, volumeSlider.value, attackSlider.value, releaseSlider.value, filterSlider.value, detuneSlider.value, waveformDropdown.value);
    presets.push(newPreset);    
    populatePresetList()
}

function loadPreset(e) {
    let element = e.currentTarget;
    
    volumeSlider.value = Number(element.dataset.volume);
    attackSlider.value = Number(element.dataset.attack);
    releaseSlider.value = Number(element.dataset.release);
    filterSlider.value = Number(element.dataset.filterFrequency);
    detuneSlider.value = Number(element.dataset.detune);
    waveformDropdown.value = element.dataset.waveform;
    updateVolume();
    updateAttack();
    updateRelease();
    updateFilter();
    updateDetune();
    updateWaveform();
}

newPresetInput.addEventListener("keydown", function(e) {
    if (e.key === 'Enter') {
        savePreset();
    }
})
saveButton.addEventListener("click", savePreset);


populatePresetList();