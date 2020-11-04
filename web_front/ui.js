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
    },
    
    mutations: {
        note_add(state, param) {
            state.notes[param["sound_type"]].push(param["note"]);
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
        let postRequest = function(){
            let params = new FormData();
            params.append("room", document.getElementById("table_id").value);
            url = "http://kou.hongo.wide.ad.jp:3341/show_room";
            const headers = {
                'Content-Type': 'application/json'
            };
            const response = axios.post(url,params,{ headers: headers }).then(res=>{
                //ノーツの差分見て追加する処理
                let return_notes = res.sounds;
                let add_index_list = [];
                for(let i = 0;i < return_notes.size; i++){
                    let continue_flag = -1;
                    for(let key in this.$state.store.notes){
                        if(return_notes[i]['sound_type']!=key){
                            break
                        }
                        for(let j = 0; j < this.$store.state.notes.size; j++){
                            if((return_notes[i]['start']==this.$store.state.notes[key][j]['note']['start_time'])&&
                            (return_notes[i]['pitch_name']==this.$store.state.notes[key][j]['note']['pitch'])&&
                            (return_notes[i]['sound_type']==this.$store.state.notes[key][j]['note']['sound_type'])
                            ){
                                continue_flag = 1;
                                break;
                            }
                            
                        }
                        if(continue_flag == 1){
                            break;
                        }
                        let new_note = new Note(return_notes[i]['frequency'], return_notes[i]['start'], return_notes[i]['nagasa'], return_notes[i]['room'], return_notes[i]['who_make'], return_notes[i]['sound_type'])
                        new_note.object_id = return_notes[i]['id'];
                        this.$store.commit('note_add',{"sound_type":return_notes[i]['music_type'], "note":new_note});
                    }
                }
                //ノーツの差分見て削除する処理
                for(key in this.$store.state.notes){
                    for(let i = 0;i < this.$store.state.notes[key].size; i++){
                        let break_flag = -1;
                        for(let j = 0; j < return_notes.size; j++){
                            if((return_notes[j]['start']==this.$store.state.notes[key][i]['note']['start_time'])&&
                            (return_notes[j]['pitch_name']==this.$store.state.notes[key][i]['note']['pitch'])&&
                            (return_notes[j]['sound_type']==this.$store.state.notes[key][i]['note']['sound_type'])
                            ){
                                break_flag = 1;
                                break;
                            }
                            
                        }
                        if(break_flag == 1){
                            break;
                        }
                        this.$store.commit('delete_note',{click_note_pitch:this.$store.state.notes[key][i]['note']['pitch'],click_note_start_time:this.$store.state.notes[key][i]['note']['start_time']});
                    }
                }


            })
        }
        this.intervalId = setInterval(postRequest, 1000);
        
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
            let note = new Note(pitch_name,start_time,nagasa,document.getElementById("table_id").value,document.getElementById("who_make").value);

            //サーバーに情報送り付ける
            const params = new FormData();
            let url = "http://kou.hongo.wide.ad.jp:3341/regist";
            params.append("frequency",pitch_name)
            params.append("start",start_time);
            params.append("nagasa",nagasa)
            params.append("room",document.getElementById("table_id").value)
            params.append("made_by",document.getElementById("who_make").value);
            params.append("sound_type",this.$store.state.nowplaying);
            const headers = {
                'Content-Type': 'application/json'
            };

            axios.post(url, params, { headers: headers }).then(res=>{
                note.id = res.data.id;
                this.$store.commit('note_add',{"note":note,"sound_type":this.$state.store.nowplaying});

            });
              

        

            



            
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
            //クリックしたノーツの削除
            this.$store.commit('delete_note',{click_note_pitch:click_note_pitch,click_note_start_time:click_note_start_time});
            //サーバーから情報消す
            const params = new FormData();
            let url = "http://kou.hongo.wide.ad.jp:3341/remove";
            const headers = {
                'Content-Type': 'application/json'
            };
            params.append("id",event.target.getAttribute("id").slice(4));
            

            axios.post(url, params, { headers: headers }).then(res=>{
                console.log(res.data);
                

            });

            

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