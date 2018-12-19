let state = new Array(0);
let table = null;
let beats = 0;
let beat_len = 0;
let num_bars = 0;
let num_divs = 0;
let marker_div = 0;
let measure_div =0;
let first_initialization = true;

let playing = true;
let start_time = 0;
let note_time = 0;
let current_step = 0;
let dt = 0.2;

const play_button = document.getElementById("play_sequence");
const stop_button = document.getElementById("stop_sequence");

play_button.addEventListener('click', play);
stop_button.addEventListener('click', stop);

class Tile  {
    constructor() {
        this.active = false;
        this.bar_line = false;
        this.current = false;
        this.cell = null;
    }
}

function updateTile(i, j) {
    let tile = state[i][j];
    if (tile.active) {
        tile.cell.className = "clicked";
    } else if (tile.current) {
        tile.cell.className = "current";
    } else if (tile.bar_line) {
        tile.cell.className = "beat";
    }
    else {
        tile.cell.className = "";
    }
}

function toggleBeat(cell, i, j) {
    state[i][j].active = !state[i][j].active;
    updateTile(i, j);
}

function make_grid() {
    if (!first_initialization) {
        if (!confirm("This will clear any pattern present! Are you sure?")) {
            return;
        }
    }
    first_initialization = false;
    table = document.getElementById("sequence_in");
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    beats = parseInt(document.getElementById("num_beats").value);
    beat_len = parseInt(document.getElementById("beat_length").value);
    num_bars = parseInt(document.getElementById("num_bars").value);
    num_divs = 0;
    marker_div = 0;
    switch (beat_len) {
        case 2: num_divs = num_bars * beats * 2; marker_div = 4; measure_div = 8; break;
        case 4: num_divs = num_bars * beats * 4; marker_div = 4; measure_div = 16; break;
        case 8: num_divs = num_bars * beats; marker_div = beats; measure_div = 6; break;
        default: alert("Unknown beat length: " + beat_len.toString());
    }

    state = new Array(num_samples + 1);
    for (let i = 0;  i < num_samples + 1; i++) {
        state[i] = new Array(num_divs + 1);
        for (let j = 0; j < num_divs + 1; j++) {
            state[i][j] = new Tile();
        }
    }

    let beat_count = 1;
    for (let i = 0; i < num_samples + 1; i++) {    // TODO remove fixed number of samples
        let row = table.appendChild(document.createElement("tr"));
        for (let j = 0; j < num_divs + 1; j++) {
            let cell = row.appendChild(document.createElement("td"));
            state[i][j].cell = cell;
            // Place the sample name in the first column
            if (i == 0) {
                if (j && (j-1) % marker_div == 0) {
                    cell.className = "beat";
                    state[i][j].bar_line = true;
                    if ((j-1) % measure_div == 0) {
                        cell.innerHTML = beat_count.toString();
                        beat_count++;
                    }
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
                }(cell, i, j));
                cell.innerHTML = "";
            }
            // Denote beats
            if (j && (j - 1) % marker_div == 0) {
                cell.className = "beat";
                state[i][j].bar_line = true;
            }

        }
    }
    update_bpm();
}

function markCurrentNote(note) {
    note++;
    let last_note = note - 1;
    if (last_note == 0) {
        last_note = num_divs;
    }
    for (let i = 0; i < num_samples + 1; i++) {
        state[i][note].current = true;
        updateTile(i, note);
        state[i][last_note].current = false;
        updateTile(i, last_note);
    }
}

function update_bpm() {
    let bpm = parseInt(document.getElementById("bpm").value);
    switch (beat_len) {
        case 2: dt = (60 / bpm) / 2; break;
        case 4: dt = (60 / bpm) / 4; break;
        case 6: dt = (60 / bpm) / 3; break;
        default: dt = (60 / bpm) / 4; break;
    }
}


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
        if (state[i+1][current_step+1].active) {
            samples[i].play(play_time);
            // let source = context.createBufferSource();
            // source.buffer = samples[i];
            // source.connect(context.destination);
            // source.start(play_time);
        }
    }
    markCurrentNote(current_step);
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
