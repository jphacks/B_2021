// コントローラ
var controller = new Vue({
    store: store,
    el: "#controller",
    data:{
        // requestAnimationFrame(cb)の返り値(requestID)が入る
        animateFrame: 0,
        // 時間管理
        startTime: 0,
        nowTime: 0,
        diffTime: 0,
        pausePosition: 0,

        // シークバー
        seekX: 0,                // シークバーの位置
        seekbarWidth: 900,
        seeking: false
    },
    methods:{
        play: function(event){
            console.log("play");
            this.$store.commit("setPlaying" , true);
            // ミリ秒単位で時刻を取得
            this.startTime = Math.floor(performance.now());
            // ループ処理
            // スコープが変わるのでthisを保持しておく
            ctrl = this;
            (function loop(){
                ctrl.nowTime = Math.floor(performance.now());
                ctrl.diffTime = ctrl.nowTime - ctrl.startTime;

                position = ctrl.pausePosition + (ctrl.diffTime * ctrl.$store.state.bpm / 60000 * 480);
                ctrl.$store.commit("setPosition",position);

                if(store.state.position >= ctrl.$store.state.total_length){
                    ctrl.stop()
                    return
                }

                ctrl.animateFrame = requestAnimationFrame(loop);
            }());
        },
        stop: function(event){
            console.log("stop");
            cancelAnimationFrame(this.animateFrame);
            this.$store.commit("setPlaying" , false);
            this.startTime = 0;
            this.nowTime = 0;
            this.diffTime = 0;
            this.pausePosition = 0;
            this.$store.commit("setPosition",0);
        },
        pause: function(event){
            console.log("pause");
            cancelAnimationFrame(this.animateFrame);
            this.$store.commit("setPlaying" , false);
            this.pausePosition = store.state.position;
        },
        jump_left: function(event){
            let playing = this.$store.state.isPlaying;
            if(playing){
                this.pause();
            }
            let position = Math.max(this.$store.state.position - 480*4, 0);
            this.$store.commit("setPosition",position);
            this.pausePosition = position;
            if(playing){
                this.play();
            }
        },
        jump_right: function(event){
            let playing = this.$store.state.isPlaying;
            if(playing){
                this.pause();
            }
            let position = Math.min(this.$store.state.position + 480*4, this.$store.state.total_length);
            this.$store.commit("setPosition",position);
            this.pausePosition = position;
            if(playing){
                this.play();
            }
        },
        seek: function(event){
            if(!this.seeking){return;}
            position = Math.floor(event.offsetX / this.seekbarWidth * this.$store.state.total_length);
            this.$store.commit("setPosition",position);
            this.pausePosition = store.state.position;
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


    }
});
