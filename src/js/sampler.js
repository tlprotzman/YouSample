let context = null;
let samples = [];
let num_samples= 0;

const load_button = document.getElementById("load_video");
const url_box = document.getElementById("video_url");
const play_button = document.getElementById("play_clip");
const sample_num = document.getElementById("clip_number");

window.addEventListener('load', init, false);
load_button.addEventListener('click', sampler);
play_button.addEventListener('click', play_sound);


function init() {
    play_button.disabled= true;
    try {
        console.log("Loading Audio Context");
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
    }
    catch(e) {
        console.log("Audio Context Failed to Load");
        alert("Web Audio API is not supported in this browser");
    }
}

function on_error() {
    alert("Whoops!");
}

function sampler() {
    const url = url_box.value;
    console.log("Loading URL", url, "into slot", num_samples);
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    // Decode asynchronously
    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            samples.push(buffer);
            num_samples++;
            play_button.disabled= false;
            sample_num.max = (num_samples - 1).toString();
        }, on_error);
    };
    request.send();
}

function play_sound() {
    console.log("Playing sound from buffer", sample_num.value);
    let source = context.createBufferSource();  // Create sound source
    source.buffer = samples[sample_num.value];                     // Which sound to play
    source.connect(context.destination);        // Connect to speaker
    source.start(0)                       // Start playing now
}



