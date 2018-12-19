let context = null;
let samples = [];
let num_samples= 0;

const load_button = document.getElementById("load_video");
const url_box = document.getElementById("video_url");
const play_samp_button = document.getElementById("play_clip");
const sample_num = document.getElementById("clip_number");
const playback_rate = document.getElementById("playback_speed");
const reverse = document.getElementById("reverse");
const samp_name = document.getElementById("sample_name");


window.addEventListener('load', init, false);
load_button.addEventListener('click', sampler);
play_samp_button.addEventListener('click', play_sound);

class Sample {
    constructor(url, buffer) {
        this.url = url
        this.buffer = buffer;
        this.startTime = 0;
        this.endTime = this.buffer.length;
        this.playbackSpeed = 1;
        this.reverse = false;
        this.wasReversed = false;
        this.name = "sample"
    }

    newSample(url, buffer) {
        this.buffer = buffer;
        this.startTime = 0;
        this.endTime = this.buffer.length;
        this.reverse = false;
        this.wasReversed = false;
    }

    play(when) {
        console.log("Reversed", this.reverse);
        let source = context.createBufferSource();
        if (this.reverse != this.wasReversed) {
            Array.prototype.reverse.call( this.buffer.getChannelData(0) );
            Array.prototype.reverse.call( this.buffer.getChannelData(1) );
            this.wasReversed = this.reverse;
        }
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
    if (num_samples != samples.length) {
        return;
    }
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

function on_switch() {
    let bank = sample_num.value;
    console.log(bank, samples.length);
    if (samples.length > bank) {
        play_samp_button.disabled = false;
        url_box.value = samples[bank].url;
        playback_rate.value = samples[bank].playbackSpeed;
        reverse.value = samples[bank].reverse;
        samp_name.value = samples[bank].name;
    }
    else {
        playback_rate.value = 1;
        reverse.value = 0;
        samp_name.value = "";
        play_samp_button.disabled = true;
    }
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
            if (sample_num.value >= samples.length) {
                samples.push(new Sample(url, buffer));
            }
            else {
                samples[sample_num.value].newSample(url, buffer);
            }
            play_samp_button.disabled= false;
            samp_name.value = "sample " + samples.length.toString();
            reverse.checked = false;
        }, on_error);
    };
    request.send();
}

function play_sound() {
    let bank = sample_num.value;
    console.log("Playing sound from buffer", bank);
    samples[bank].playbackSpeed = playback_rate.value;
    samples[bank].reverse = reverse.checked;
    samples[bank].name = samp_name.value;
    samples[bank].play(0);
}




