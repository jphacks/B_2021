// 参考
// https://ics.media/entry/200427/
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();


let sammpleSource;
let isPlaying = false;




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
