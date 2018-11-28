let context = null;
let samples = [];
let num_samples= 0;

const load_button = document.getElementById("load_video");
const url_box = document.getElementById("video_url");
const play_button = document.getElementById("play_clip");
const stop_button = document.getElementById("stop_clip");
const sample_num = document.getElementById("clip_number");
const playback_rate = document.getElementById("playback_speed");
const loop_sample = document.getElementById("loop_sample");

window.addEventListener('load', init, false);
load_button.addEventListener('click', sampler);
play_button.addEventListener('click', play_sound);
stop_button.addEventListener('click', stop_sound);



function init() {
    play_button.disabled = true;
    load_button.disabled = true;
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

function make_new_sample() {
    load_button.disabled = false;
    let button = document.createElement("button");       // Create new tab
    let node = document.createAttribute("id");          // Set tab id
    node.value = "sample" + num_samples.toString();
    button.setAttributeNode(node);
    node = document.createAttribute("class");           // Set tab class
    node.value="tab_v_links";
    button.setAttributeNode(node);
    node = document.createAttribute("onclick");
    node.value = "open_vertical_tab('sample" + num_samples.toString()+ "')";
    button.setAttributeNode(node);
    let text = document.createTextNode("Sample " + (num_samples + 1).toString()); // Set tab text
    button.appendChild(text);
    let element = document.getElementById("samples");
    element.appendChild(button);
    open_vertical_tab("sample" + num_samples.toString());
    num_samples++;

}

function sampler() {
    const url = url_box.value;
    console.log("Loading URL", url, "into slot", sample_num.value);
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    // Decode asynchronously
    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            if (sample_num.value >= num_samples) {
                samples.push(buffer);
            }
            else {
                samples[sample_num.value] = buffer;
            }
            play_button.disabled= false;
        }, on_error);
    };
    request.send();
}

function play_sound() {
    console.log("Playing sound from buffer", sample_num.value);
    let source = context.createBufferSource();  // Create sound source
    source.buffer = samples[sample_num.value];  // Which sound to play
    source.playbackRate.value = playback_rate.value;  // How fast to play it back
    source.loop = loop_sample.value;
    source.connect(context.destination);        // Connect to speaker
    source.start(0)                       // Start playing now
}

function stop_sound() {
    source
}

