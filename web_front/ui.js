console.log("Hello, World!");

var hello = new Vue({
    el: "#test",
    data:{
        message: "Hello, World!"
    }
});

// クリックするとドラム音が鳴るボタンテスト
// 位置座標取得もつけた
let screenx = "";
let screeny = "";
var testdrum = new Vue({
    el: "#wrapper",
    data: {
        screenx:"x座標",
        screeny:"y座標"
    },
    methods: {
        test: function(event){
            var drum1 = new Audio("./audio/drum1.wav");
            drum1.currentTime = 0;
            drum1.play();
        },
        mouse:function(event){
            console.log("HELLO");
            this.screenx = event.clientX;
            this.screeny = event.clientY;
            console.log(event.clientX,event.clientY);
        }
    }
});

// コントローラ
var controller = new Vue({
    el: "#controller",
    data:{
        // requestAnimationFrame(cb)の返り値(requestID)が入る
        animateFrame: 0,

        startTime: 0,
        nowTime: 0,
        diffTime: 0,
        isPlaying: false
    },
    methods:{
        play: function(event){
            if(this.isPlaying){
                return;
            }
            console.log("play");
            this.isPlaying = true;
            // ミリ秒単位で時刻を取得
            this.startTime = Math.floor(performance.now());
            console.log(this.startTime);
            // ループ処理
            // スコープが変わるのでthisを保持しておく
            ctrl = this;
            (function loop(){
                ctrl.nowTime = Math.floor(performance.now());
                ctrl.diffTime = ctrl.nowTime - ctrl.startTime;
                ctrl.animateFrame = requestAnimationFrame(loop);
            }());
        },
        stop: function(event){
            if(!this.isPlaying){
                return;
            }
            console.log("stop");
            cancelAnimationFrame(this.animateFrame);
            this.isPlaying = false;
            this.startTime = 0;
            this.nowTime = 0;
            this.diffTime = 0;
        }
    }
});

