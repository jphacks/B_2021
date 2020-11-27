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

function play_tone(sound_type, pitchname, soundLength, filter_by,source=null){
    let filter = ctx.createBiquadFilter();
    filter.type = filter_by; 
    filter.frequency.value = 440;
    if(source==null){
        // ゲイン
        var gainNode = ctx.createGain();
        gainNode.gain.value = 0.3;
        // オシレーター
        var oscillator = ctx.createOscillator();
        // オシレーター→ゲイン→出力
        oscillator.connect(gainNode);
        gainNode.connect(filter);
        filter.connect(ctx.destination);

        oscillator.type = sound_type;
        oscillator.frequency.value = pitchname2freq[pitchname];

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + soundLength);
    }else{
        let buf = ctx.createBufferSource();
        buf.buffer = source;
        buf.connect(filter);
        filter.connect(ctx.destination);
        buf.start(0,0,soundLength);
    }
}
//var music_request, music_source;

// window.onload = function () {
//     music_request = new XMLHttpRequest();
//     music_request.open("GET", "./audio/megaton.m4a", true);
//     music_request.responseType = "arraybuffer";
//     music_request.onload = completeOnLoad;
//     music_request.send();
// };

// function completeOnLoad() {
//   //window.AudioContext = window.AudioContext || window.webkitAudioContext;
//   // オーディオをデコード
//   console.log("------response_data---------")
//   console.log(JSON.parse(JSON.stringify(music_request.response)));
//   ctx.decodeAudioData(music_request.response, function (buf) {
//     music_source = buf;

//   });


// }



// // wavファイルの読み込み
// function playdrum(){
//   // var drumElement = new Audio();
//   // drumElement.src="./audio/drum1.wav"
//   //   if(ctx.state === "suspended"){
//   //       ctx.resume();
//   //   }
    
//   //   let drum = ctx.createMediaElementSource(drumElement);

//   //   //drumElement.currentTime = 11000;
//   //   // 出力につなげる
//   //   drum.connect(ctx.destination);
//   //   drumElement.play();
//   console.log("sourceの秒数")
//   console.log(source.length/source.sampleRate)
//   let buf = ctx.createBufferSource();
//   buf.buffer = music_source;
//   buf.connect(ctx.destination);
//   console.log(buf)
//   console.log(typeof(buf))
//   //3~6秒を再生するよん
//   buf.start(0,30,40);
//   // buf.stop(ctx.currentTime+3)
//   console.log("--------------------playnow-----------------------")


//    return 0;
//};

// 録音
// 参考 https://python5.com/q/yivdsdor
// Safari 未対応
// マイクへのアクセス許可を得る
navigator.mediaDevices.getUserMedia({
    audio : true,
    video: false
}).then( stream => {
    let recorder = new MediaRecorder(stream);
    //console.log("---------------------audio初期化----------------------------------")
    let audioBuffer;
    let audio_array_buffer;

    document.record_start = function(){
        console.log("start recording");
        recorder.start();
        // stop()後，データを処理する
        recorder.addEventListener("dataavailable", (e)=>{
            // 録音したデータを配列として取り出す
            e.data.arrayBuffer().then(arrayBuffer=>{
                audio_array_buffer = arrayBuffer;
                // var output = new ArrayBuffer(audio_array_buffer.byteLength);
                // var outputBytes = new Uint8Array(output);
                // for (var i = 0; i < audio_array_buffer.length; i++){
                //     outputBytes[i] = audio_array_buffer[i];
                // }
                // audioBufferに変換
                ctx.decodeAudioData(arrayBuffer.slice(0), (buf)=>{
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

    document.return_buf = function(){
        console.log("------in return buf------")
        console.log(audioBuffer)
        return audioBuffer;
    }

    document.return_arraybuf = function(){
        console.log("------in arraybuf-------")
        console.log(audio_array_buffer)
        return audio_array_buffer;
    }
});

