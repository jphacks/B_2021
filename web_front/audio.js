// 参考
// https://ics.media/entry/200427/
// https://so-zou.jp/web-app/tech/programming/javascript/media/audio/web-audio-api/?type=square&frequency=3000

window.AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

// オシレーターやってみる
const pitchname2freq = {
    "C3": 130.813,
    "D3": 146.832,
    "E3": 164.814,
    "F3": 174.614,
    "G3": 195.998,
    "A3": 220,
    "B3": 246.942,
    "C4": 261.626
}

function play_tone(pitchname, soundLength){
    // ゲイン
    var gainNode = ctx.createGain();
    gainNode.gain.value = 0.3;
    // オシレーター
    var oscillator = ctx.createOscillator();
    // オシレーター→ゲイン→出力
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);



    oscillator.type = "sawtooth";
    oscillator.frequency.value = pitchname2freq[pitchname];

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + soundLength);
}


var drumElement = new Audio("./audio/drum1.wav");
var drum = ctx.createMediaElementSource(drumElement);

// wavファイルの読み込み
function playdrum(){
    if(ctx.state === "suspended"){
        ctx.resume();
    }

    drumElement.currentTime = 11000;
    // 出力につなげる
    drum.connect(ctx.destination);
    drumElement.play();

    drumElement = new Audio("./audio/drum1.wav");
    drum = ctx.createMediaElementSource(drumElement);

    return 0;
};
