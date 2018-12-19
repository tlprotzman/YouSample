let context = null;
let samples = [];
let num_samples= 0;

const load_button = document.getElementById("load_video");
const load_local = document.getElementById("load_local");
const url_box = document.getElementById("video_url");
const loc_box = document.getElementById("local_file")
const play_samp_button = document.getElementById("play_clip");
const sample_num = document.getElementById("clip_number");
const playback_rate = document.getElementById("playback_speed");
const reverse = document.getElementById("reverse");
const samp_name = document.getElementById("sample_name");
const samp_length = document.getElementById("samp_length");
const samp_start_time = document.getElementById("samp_start_time");
const samp_stop_time = document.getElementById("samp_stop_time");


window.addEventListener('load', init, false);
load_button.addEventListener('click', function() {sampler(true);});
load_local.addEventListener('click', function() {sampler(false);});
play_samp_button.addEventListener('click', play_sound);

window.addEventListener("beforeunload", function (e) {
    let confirmationMessage = 'It looks like you have been editing something. '
        + 'If you leave before saving, your changes will be lost.';

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});

class Sample {
    constructor(url, buffer) {
        this.url = url
        this.buffer = buffer;
        this.startTime = 0;
        this.endTime = this.buffer.duration;
        this.duration = this.buffer.duration;
        this.playbackSpeed = 1;
        this.reverse = false;
        this.wasReversed = false;
        this.name = "sample"
    }

    newSample(url, buffer) {
        this.buffer = buffer;
        this.startTime = 0;
        this.endTime = this.buffer.duration;
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
        if (this.reverse) {
            let length = this.endTime - this.startTime;
            source.start(when, this.duration - this.endTime, length);
        } else {
            let length = this.endTime - this.startTime;
            source.start(when, this.startTime, length);
        }
    }
}

function init() {
    play_samp_button.disabled = true;
    load_button.disabled = true;
    load_local.disabled = true;
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

function verify_min_time() {
    if (samples.length > sample_num.value) {
        samp_start_time.setAttribute("max", samples[sample_num.value].duration);
    }
}

function verify_max_time() {
    if (samples.length > sample_num.value) {
        samp_stop_time.setAttribute("min", samp_start_time.value);
        samp_stop_time.setAttribute("max", samples[sample_num.value].duration);
    }
}

function make_new_sample() {
    if (num_samples != samples.length) {
        return;
    }
    load_button.disabled = false;
    load_local.disabled = false;
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
        samp_length.innerText = "Sample Length: " +samples[bank].duration.toFixed(2);
        samp_start_time.value = 0;
        samp_stop_time.value = samples[bank].duration;
        reverse.value = samples[bank].reverse;
        verify_min_time();
        verify_max_time();
    }
    else {
        playback_rate.value = 1;
        reverse.value = 0;
        samp_name.value = "";
        play_samp_button.disabled = true;
    }
}

function sampler(web) {
    let request = new XMLHttpRequest();
    let url =""
    if (web) {
        url = url_box.value;
        let mod_url = "https://cors-escape.herokuapp.com/" + url;
        console.log("Loading URL", url, "into slot", sample_num.value, "of", num_samples);
        if (url.includes("http"))
            request.open('GET', mod_url, true);
        else
            request.open('GET', url, true);
    }
    else {
        url = URL.createObjectURL(loc_box.files[0]);
        console.log("Loading Local File", url, "into slot", sample_num.value, "of", num_samples);
        request.open('GET', url, true);
    }
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
            // play_samp_button.disabled= false;
            samples[samples.length - 1].name = "sample " + samples.length.toString();
            on_switch();
            // reverse.checked = false;
            // samp_length.innerText = "Sample Length: " + buffer.duration.toFixed(2);
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
    samples[bank].startTime = samp_start_time.value;
    samples[bank].endTime = samp_stop_time.value;
    samples[bank].play(0);
}




