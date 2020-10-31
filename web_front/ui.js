console.log("Hello, World!");

var hello = new Vue({
    el: "#test",
    data:{
        message: "Hello, World!"
    }
});

// クリックするとドラム音が鳴るボタンテスト
// 位置座標取得もつけた
var testdrum = new Vue({
    el: "#wrapper",
    data: {
        screenx:"x座標",
        screeny:"y座標"
    },
    template:`<div><svg viewbox="0 0 300 300" width="300" height="300" style="background-color: #aaaaaa;" @mousemove="mouse">
                <rect x="30" y="30" width="30" height="30" fill="#e0e010" @click="test" id="yellowbox"></rect>
                </svg><div>{{screenx+","+screeny}}</div></div>`,
    methods:{
            test: function(event){
            var drum1 = new Audio("./audio/drum1.wav");
            drum1.currentTime = 0;
            drum1.play();
        },
        mouse:function(event){
            this.screenx = event.clientX;
            this.screeny = event.clientY;
            document.getElementById("yellowbox").setAttribute("x",this.screenx-15)
            document.getElementById("yellowbox").setAttribute("y",this.screeny-15)
        }
    }
});

// コントローラ
var controller = new Vue({
    el: "#controller",
    data:{
        // requestAnimationFrame(cb)の返り値(requestID)が入る
        animateFrame: 0,
        // 時間管理
        startTime: 0,
        nowTime: 0,
        diffTime: 0,
        // 再生位置
        nowPosition: 0,
        pausePosition: 0,

        isPlaying: false
    },
    methods:{
        play: function(event){
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

                ctrl.nowPosition = ctrl.pausePosition + ctrl.diffTime;

                ctrl.animateFrame = requestAnimationFrame(loop);
            }());
        },
        stop: function(event){
            console.log("stop");
            cancelAnimationFrame(this.animateFrame);
            this.isPlaying = false;
            this.startTime = 0;
            this.nowTime = 0;
            this.diffTime = 0;
            this.nowPosition = 0;
            this.pausePosition = 0;
        },
        pause: function(event){
            console.log("pause");
            cancelAnimationFrame(this.animateFrame);
            this.isPlaying = false;
            this.pausePosition = this.nowPosition;
        }
    }
});
