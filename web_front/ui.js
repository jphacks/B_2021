console.log("Hello, World!");
var hello = new Vue({
    el: "#test",
    data:{
        message: "Hello, World!"
    }
});
//状態管理
const store = new Vuex.Store({
    state: {
        notes:[],

        bpm: 120,   // bpm
        n_bars: 8,   // 小節数

        position: 0,    // 再生位置
        isPlaying: false
    },
    
    mutations: {
        note_add(state, note) {
            state.notes.push(note);
        },
        delete_note(state, param){
            let index = -1;
            for(let i = 0; i < state.notes.length; i++){
                if((state.notes[i]['note'].pitch == param["click_note_pitch"]) && (state.notes[i]['note'].start_time == param["click_note_start_time"])){
                    index = i;
                    break;
                }
            }
            //ノーツの削除
            state.notes.splice(index, 1);
        },

        // 再生位置をセット
        setPosition(state, new_position){
            var prev_position = state.position;
            var new_position = new_position;

            // 再生中なら音を鳴らす
            // とりあえずnotes[]全探索で実装しました
            if(state.isPlaying){
                for(var i in state.notes){
                    var start_time = state.notes[i]["note"]["start_time"];
                    var pitch_name = state.notes[i]["note"]["pitch"];
                    if(prev_position<=start_time && start_time<=new_position){
                        console.log("a");
                        play_tone(pitch_name,0.3);
                    }
                }
            }

            // 状態の更新
            state.position = new_position;
            testdrum.playing_position = state.position/controller.total_length*testdrum.note_width*state.n_bars*4;
            controller.seekX = String(state.position/controller.total_length*100) + "%";
        },

        setPlaying(state, isPlaying){
            state.isPlaying = isPlaying;
        }
    }
})
// クリックするとドラム音が鳴るボタンテスト
// 位置座標取得もつけた
var testdrum = new Vue({
    store: store,
    el: "#wrapper",
    data :{
            note_height: 30,
            note_width: 100,
            playing_position: 0,
            screenx:"x座標",
            screeny:"y座標",
            click_x:0,
            click_y:0,
            clickup_x:0,
            clickup_y:0,
            intervalId:null,

            lanes : ["C4", "B3", "A3", "G3", "F3", "E3", "D3", "C3"],
    },
    // mounted(){
    //     this.intervalId = setInterval(await postRequest, 1000);
    //     async function postRequest(){
    //         let params = new FormData()
    //         params.append('value', this.$store.state.notes)
    //         const response = await axios.post("url",params).then(res=>{
    //             //仮の処理
    //             let return_notes = res.value;
    //             let add_index_list = [];
    //             for(let i = 0;i < return_notes.size; i++){
    //                 for(let j = 0; j < this.$store.state.notes.size; j++){
    //                     if((return_notes[i]['note']['start_time']==this.$store.state.notes[j]['note']['start_time'])&&(return_notes[i]['note']['pitch']==this.$store.state.notes[j]['note']['pitch'])){
    //                         break;
    //                     }
                        
    //                 }
    //                 this.$store.commit('note_add',return_notes[i]['note']);
    //             }
    //             for(let i = 0;i < this.$store.state.notes.size; i++){
    //                 for(let j = 0; j < return_notes.size; j++){
    //                     if((return_notes[j]['note']['start_time']==this.$store.state.notes[i]['note']['start_time'])&&(return_notes[j]['note']['pitch']==this.$store.state.notes[i]['note']['pitch'])){
    //                         break;
    //                     }
                        
    //                 }
    //                 this.$store.commit('delete_note',{click_note_pitch:this.$store.state.notes[i]['note']['pitch'],click_note_start_time:this.$store.state.notes[i]['note']['start_time']});
    //             }


    //         })
    //     }
        
    // },
    
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
            this.click_x = event.offsetX;
            this.click_y = event.offsetY;

            var tonenum = parseInt(this.click_y/this.note_height);
            play_tone(this.lanes[tonenum], 0.3); // audio.js
            
            // 時間は4分音符を480として規格化
            var start_time = parseInt(this.click_x/this.note_width)*480;
            var pitch_name = this.lanes[parseInt(this.click_y/this.note_height)];
            let note = new Note(pitch_name,start_time,this.note_width,document.getElementById("table_id").value,document.getElementById("who_make").value);
            //this.notes.push(new Note(parseInt(this.click_y/this.note_height)*this.note_height,parseInt(this.click_x/this.note_width)*this.note_width,this.note_width,document.getElementById("table_id").value,document.getElementById("who_make").value))
            this.$store.commit('note_add',{note:note});
            
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
            this.$store.commit('delete_note',{click_note_pitch:click_note_pitch,click_note_start_time:click_note_start_time});
            

        }
    }
});

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
        // 再生位置
        pausePosition: 0,

        // シークバー
        total_length: 60000/store.state.bpm*4*store.state.n_bars,   // 全体の長さ(ms)
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

                position = ctrl.pausePosition + ctrl.diffTime;
                ctrl.$store.commit("setPosition",position);

                if(store.state.position >= ctrl.total_length){
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
        seek: function(event){
            if(!this.seeking){return;}
            position = Math.floor(event.offsetX / this.seekbarWidth * this.total_length);
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
