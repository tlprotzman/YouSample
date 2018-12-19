let context = null;
let samples = [];
let num_samples= 0;

const load_button = document.getElementById("load_video");
const url_box = document.getElementById("video_url");
const play_samp_button = document.getElementById("play_clip");
const sample_num = document.getElementById("clip_number");
const playback_rate = document.getElementById("playback_speed");


window.addEventListener('load', init, false);
load_button.addEventListener('click', sampler);
play_samp_button.addEventListener('click', play_sound);

class Sample {
    constructor(buffer) {
        this.buffer = buffer;
        this.startTime = 0;
        this.endTime = this.buffer.length;
        this.playbackSpeed = 1;
    }

    newSample(buffer) {
        this.buffer = buffer;
        this.startTime = 0;
        this.endTime = this.buffer.length;
    }

    play(when) {
        let source = context.createBufferSource();
        source.buffer = this.buffer;
        source.playbackRate.value = this.playbackSpeed;
        source.connect(context.destination);
        source.start(when);
    }
}

function init() {
    play_samp_button.disabled = true;
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
    return context
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
    console.log("Loading URL", url, "into slot", sample_num.value, "of", num_samples);
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    // Decode asynchronously
    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            console.log("Loaded!");
            if (sample_num.value + 1 >= num_samples) {
                samples.push(new Sample(buffer));
            }
            else {
                samples[sample_num.value].newSample(buffer);
            }
            play_samp_button.disabled= false;
        }, on_error);
    };
    request.send();
}

function play_sound() {
    let bank = sample_num.value;
    console.log("Playing sound from buffer", bank);
    samples[bank].playbackSpeed = playback_rate.value;
    samples[sample_num.value].play(0);
}




