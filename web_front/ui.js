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
        note_height: 30,
        note_width: 100,
        n_bars: 8,  // 小節数(横幅は小節数*4拍)

        playing_position: 0,

        screenx:"x座標",
        screeny:"y座標",
        click_x:0,
        click_y:0,
        clickup_x:0,
        clickup_y:0,
        notes:[]
    },
    methods:{
        test: function(event){

        },
        mouse:function(event){
            this.screenx = event.clientX;
            this.screeny = event.clientY;
            //document.getElementById("yellowbox").setAttribute("x",this.screenx-15)
            //document.getElementById("yellowbox").setAttribute("y",this.screeny-15)

        },
        mouse_down:function(event){
            //var drum1 = new Audio("./audio/drum1.wav");
            //drum1.currentTime = 0;
            //drum1.play();

            play_sinwave(); // audio.js
            
            this.click_x = event.offsetX;
            this.click_y = event.offsetY;
            this.notes.push(new Note(parseInt(this.click_y/this.note_height)*this.note_height,parseInt(this.click_x/this.note_width)*this.note_width,this.note_width,document.getElementById("table_id").value,document.getElementById("who_make").value))
        },
        mouse_up:function(event){
            this.clickup_x=event.clientX;
            this.clickup_y=event.clientY;
            // dict = {}
            // dict["x"] = Math.min(this.click_x, this.clickup_x);
            // dict["y"] = Math.min(this.click_y, this.clickup_y);
            // dict["width"] = Math.abs(this.click_x - this.clickup_x);
            // dict["height"] = Math.abs(this.click_y - this.clickup_y);
            // this.chohokei.push(dict);
        },

        note_click: function(event){
            let click_note_pitch = parseInt(event.offsetY/this.note_height) * this.note_height;
            let click_note_start_time = parseInt(event.offsetX/this.note_width) * this.note_width;
            //クリックしたノーツの検索
            let index = -1;
            for(let i = 0; i < this.notes.length; i++){
                if(this.notes[i].pitch == click_note_pitch && this.notes[i].start_time == click_note_start_time){
                    index = i;
                    break;
                }
            }
            //ノーツの削除
            this.notes.splice(index, 1);

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

        isPlaying: false,

        // シークバー
        total_length: 60000/manager.bpm*4*testdrum.n_bars,   // 全体の長さ(ms)
        seekX: 0,                // シークバーの位置
        seekbarWidth: 900,
        seeking: false
    },
    methods:{
        play: function(event){
            console.log("play");
            this.isPlaying = true;
            // ミリ秒単位で時刻を取得
            this.startTime = Math.floor(performance.now());
            // ループ処理
            // スコープが変わるのでthisを保持しておく
            ctrl = this;
            (function loop(){
                ctrl.nowTime = Math.floor(performance.now());
                ctrl.diffTime = ctrl.nowTime - ctrl.startTime;

                position = ctrl.pausePosition + ctrl.diffTime;
                ctrl.setNowPosition(position);
                if(ctrl.nowPosition >= ctrl.total_length){
                    ctrl.stop()
                    return
                }
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
            this.pausePosition = 0;
            this.setNowPosition(0);
        },
        pause: function(event){
            console.log("pause");
            cancelAnimationFrame(this.animateFrame);
            this.isPlaying = false;
            this.pausePosition = this.nowPosition;
        },
        seek: function(event){
            if(!this.seeking){return;}
            position = Math.floor(event.offsetX / this.seekbarWidth * this.total_length);
            this.setNowPosition(position);
            this.pausePosition = this.nowPosition;
            this.startTime = Math.floor(performance.now());
        },

        mousedown: function(event){
            this.pause();
            this.seeking = true;
            this.seek(event);
        },
        mouseup: function(event){
            this.seeking = false;
        },

        setNowPosition: function(position){
            this.nowPosition = position;
            testdrum.playing_position = this.nowPosition/this.total_length*testdrum.note_width*testdrum.n_bars*4;
            this.seekX = String(this.nowPosition/this.total_length*100) + "%";
        }
    }
});
