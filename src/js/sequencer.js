let state = new Array(0);
let table = null;
let beats = 0;
let beat_len = 0;
let num_divs = 0;
let marker_div = 0;

const play_button = document.getElementById("play_sequence");
const stop_button = document.getElementById("stop_sequence");

play_button.addEventListener('click', play);
stop_button.addEventListener('click', stop);


function toggleBeat(cell, i, j) {
    // console.log("I: " + i.toString());
    // console.log("J: " + j.toString());
    if (state[i][j]) {
        cell.className = "";
        if (!(j % marker_div)) {
            cell.className = "beat";
        }
    }
    else {
        cell.className = "clicked"
    }
    state[i][j] = !state[i][j];
}

function makegrid() {
    table = document.getElementById("sequence_in");
    beats = parseInt(document.getElementById("num_beats").value);
    beat_len = parseInt(document.getElementById("beat_length").value);
    num_divs = 0;
    marker_div = 0;
    switch (beat_len) {
        case 2: num_divs = beats * 4; marker_div = 4; break;
        case 4: num_divs = beats * 2; marker_div = 2; break;
        case 8: num_divs = beats * 3; marker_div = 3; break;
        default: alert("Unknown beat length: " + beat_len.toString());
    }

    state = new Array(num_samples);
    for (let i = 0;  i < num_samples; i++) {
        state[i] = new Array(num_divs);
    }

    let beat_count = 1;
    for (let i = 0; i < num_samples + 1; i++) {    // TODO remove fixed number of samples
        let row = table.appendChild(document.createElement("tr"));
        for (let j = 0; j < num_divs + 1; j++) {
            let cell = row.appendChild(document.createElement("td"));
            // Place the sample name in the first column
            if (i == 0) {
                if (j && (j-1) % marker_div == 0) {
                    cell.innerHTML = beat_count.toString();
                    beat_count++;
                    cell.className = "beat";
                }
                continue
            }
            if (j == 0) {
                cell.innerHTML = "Sample " + i.toString();
                cell.className = "samp_label"
            }
            else {
                cell.addEventListener('click', function(cell, i, j){
                    return function(){toggleBeat(cell, i, j)}
                }(cell, i - 1, j - 1));
                cell.innerHTML = "";
            }
            // Denote beats
            if (j && (j - 1) % marker_div == 0) {
                cell.className = "beat";
            }

        }
    }
}


let playing = true;
let start_time = 0;
let note_time = 0;
let current_step = 0;
let dt = 0.2;


function scheduleNote() {
    if (!playing) {
        return false;
    }
    let current_time = context.currentTime;
    current_time -= start_time
    while (note_time < current_time + 0.200) {
        let play_time = note_time + start_time;
        playPatternStepAtTime(play_time);
        nextNote();
    }
    setTimeout(scheduleNote, 0);
}

function nextNote() {
    current_step++;
    console.log("Current Step: " + current_step.toString());
    if (current_step == num_divs) {
        current_step = 0;
    }
    note_time += dt
}

function playPatternStepAtTime(play_time) {
    for (let i = 0; i < num_samples; i++) {
        if (state[i][current_step]) {
            let source = context.createBufferSource();
            source.buffer = samples[i];
            source.connect(context.destination);
            source.start(play_time);
        }
    }
}

function play() {
    playing = true;
    note_time = 0.0;
    start_time = context.currentTime;
    scheduleNote();
}

function stop() {
    playing = false;
    current_step = 0;
}
