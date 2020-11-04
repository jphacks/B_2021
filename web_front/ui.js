//状態管理
const store = new Vuex.Store({
    state: {
        notes:{"sawtooth":[],"sine":[]},
        nowplaying:"sine",

        bpm: 120,   // bpm
        n_bars: 8,   // 小節数
        edit_note_length: 480, // 編集する音符の長さ単位 初期設定は４分音符(480)
        quantize: 240,

        position: 0,    // 再生位置
        isPlaying: false,
        total_length: 480*4*8,   // 全体の長さ(ms)

        isInRoom: false,
        playerName: "",
        roomID: "",
    },
    
    mutations: {
        note_add(state, note) {
            state.notes[state.nowplaying].push(note);
        },
        all_delete(state){
            for(let key in state.notes){
                state.notes[key] = [];
            }
        },
        delete_note(state, param){
            for(let i in state.notes[state.nowplaying]){
                let note = state.notes[state.nowplaying][i]['note'];
                if((note.pitch == param["click_note_pitch"]) && (note.start_time == param["click_note_start_time"])){
                    console.log(i);
                    console.log(note.pitch);
                    console.log(param["click_note_pitch"]);
                    //ノーツの削除
                    state.notes[state.nowplaying].splice(i, 1);
                    break;
                }
            }
        },

        // 再生位置をセット
        setPosition(state, new_position){
            var prev_position = state.position;
            var new_position = new_position;

            // 再生中なら音を鳴らす
            // とりあえずnotes[]全探索で実装しました
            if(state.isPlaying){
                for(let key in state.notes){
                    for(var i in state.notes[key]){
                        var note = state.notes[key][i]["note"];
                        var start_time = note["start_time"];
                        var pitch_name = note["pitch"];
                        var note_length_sec = 60/state.bpm * note["nagasa"]/480;
                        if(prev_position<=start_time && start_time<=new_position){
                            play_tone(key,pitch_name,note_length_sec);
                        }
                    }
                }
            }

            // 状態の更新
            state.position = new_position;
            editor.margin_position = state.position/state.total_length*editor.note_width*state.n_bars*4;
            controller.seekX = String(state.position/state.total_length*100) + "%";
        },

        setPlaying(state, isPlaying){
            state.isPlaying = isPlaying;
        },
        set_n_bars(state, value){
            state.n_bars = value;
            state.total_length = 480*4*state.n_bars;
        },
        set_bpm(state, value){
            state.bpm = value;
        }
    }
})
// クリックするとドラム音が鳴るボタンテスト
// 位置座標取得もつけた
var editor = new Vue({
    store: store,
    el: "#editor",
    data :{
            note_height: 30,
            note_width: 100,
            margin_position: 0,
            screenx:"x座標",
            screeny:"y座標",
            click_x:0,
            click_y:0,
            clickup_x:0,
            clickup_y:0,
            intervalId:null,

            lanes : {"sawtooth":["C4", "B3", "A3", "G3", "F3", "E3", "D3", "C3"],"sine":["C4", "B3", "A3", "G3", "F3", "E3", "D3", "C3"]},
    },
    mounted(){
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
            // クリックでノーツを追加
            this.click_x = event.offsetX;
            this.click_y = event.offsetY;

            var tonenum = parseInt(this.click_y/this.note_height);
            play_tone(this.$store.state.nowplaying, this.lanes[this.$store.state.nowplaying][tonenum], 0.3); // audio.js
            
            // 時間は4分音符を480として規格化
            var start_time = parseInt((this.click_x/this.note_width)*480 /store.state.quantize)*store.state.quantize;
            var pitch_name = this.lanes["sawtooth"][parseInt(this.click_y/this.note_height)];
            var nagasa = store.state.edit_note_length;

            // ノーツが重なってはよくないからチェック
            for(let key in store.state.notes){
                for(let i in store.state.notes[key]){
                    let note = store.state.notes[key][i]["note"];
                    if(note["pitch"]==pitch_name && start_time<note["start_time"] && note["start_time"]<start_time+nagasa){
                        nagasa = note["start_time"]-start_time;
                    }
                }
            }
            // 配列に追加
            let note = new Note(pitch_name,start_time,nagasa,document.getElementById("roomID").value,document.getElementById("playerName").value);
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
            let click_x = parseInt(event.target.getAttribute("x"))
            let click_y = parseInt(event.target.getAttribute("y"))            
            let click_note_pitch = this.lanes["sawtooth"][parseInt(click_y/this.note_height)];
            let click_note_start_time = parseInt(480*(click_x-3)/this.note_width);  // rectのstrokeの幅のせいで -3 している　どうにかならないか？
            console.log(click_note_start_time);
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

var input_options = new Vue({
    store: store,
    el: "#input_options",
    data:{
    },
    methods:{
        shosetu_henshu: function(event){
            this.$store.commit('set_n_bars',parseInt(document.getElementById("shosetu").value));
        },
        bpm_henshu : function(event){
            this.$store.commit('set_bpm',parseInt(document.getElementById('bpm').value));
        }
    }
});

var input_id = new Vue({
    store: store,
    el: "#input_id",
    data:{
    },
    methods:{
        enter(state, value){
            let playerName = document.getElementById("playerName").value;
            let roomID = document.getElementById("roomID").value;

            if(playerName=="" || roomID==""){
                console.log("error: empty entry is not allowed");
                return;
            }
            store.state.playerName = playerName;
            store.state.roomID = roomID;
            store.state.isInRoom = true;
            console.log("入室",store.state.playerName,store.state.roomID);
            document.getElementById("playerName").setAttribute("disabled","disabled");
            document.getElementById("roomID").setAttribute("disabled","disabled");

        },
        quit(state, value){
            store.state.playerName = "";
            store.state.roomID = "";
            store.state.isInRoom = false;
            console.log("退室");
            document.getElementById("playerName").removeAttribute("disabled","disabled");
            document.getElementById("roomID").removeAttribute("disabled","disabled");
        }
    }
});
