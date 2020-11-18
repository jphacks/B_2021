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

function play_tone(sound_type, pitchname, soundLength){
    // ゲイン
    var gainNode = ctx.createGain();
    gainNode.gain.value = 0.3;
    // オシレーター
    var oscillator = ctx.createOscillator();
    // オシレーター→ゲイン→出力
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = sound_type;
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

// 録音
// 参考 https://python5.com/q/yivdsdor
// Safari 未対応
// マイクへのアクセス許可を得る
navigator.mediaDevices.getUserMedia({
    audio : true,
    video: false
}).then( stream => {
    let recorder = new MediaRecorder(stream);
    let audioBuffer;

    document.record_start = function(){
        console.log("start recording");
        recorder.start();
        // stop()後，データを処理する
        recorder.addEventListener("dataavailable", (e)=>{
            // 録音したデータを配列として取り出す
            e.data.arrayBuffer().then(arrayBuffer=>{
                // audioBufferに変換
                ctx.decodeAudioData(arrayBuffer, (buf)=>{
                    audioBuffer = buf;
                });
            });
            
        });
    }
    

    document.record_stop = function(){
        console.log("stop recording");
        recorder.stop();
    };
    
    document.record_play = function(){
        console.log("play recorded sound");
        bufsrc = ctx.createBufferSource();
        bufsrc.buffer = audioBuffer;
        bufsrc.connect(ctx.destination);
        bufsrc.start();
    };
});

