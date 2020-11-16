//状態管理
const store = new Vuex.Store({
    state: {
        notes:{"sawtooth":[],"sine":[], "drum":[]},
        nowplaying:"sine",
        isNeiro:true,

        bpm: 120,   // bpm
        n_bars: 8,   // 小節数
        edit_note_length: 480, // 編集する音符の長さ単位 初期設定は４分音符(480)
        quantize: 240,

        position: 0,    // 再生位置
        isPlaying: false,
        total_length: 480*4*8,   // 全体の長さ(ms)

        isInRoom: false,
        who_make: "",
        roomID: "",
        who_make_set:new Set(),
        who_make_num:{},
        note_color:["#00ff7f","#00ffff","#ffa500","#8a2be2","#ff00ff"]
    },
    
    mutations: {
        shokika(state){
            state.notes = {"sawtooth":[],"sine":[]};
            state.nowplaying = "sine";
            state.bpm = 120;
            state.n_bars = 8;
            state.edit_note_length = 480;
            state.quantize = 240;
            state.position = 0;
            state.isPlaying = false;
            state.total_length = 480*4*8;
            state.isInRoom = false;
            state.who_make = "";
            state.roomID = "";
            state.who_make_set = new Set();
            state.who_make_num = {};

        },
        note_add(state, param) {
            let who = param["note"]["who_make"];
            if(state.who_make_set.has(who)==false){
                state.who_make_set.add(who);
                state.who_make_num[who] = state.who_make_set.size -1;
            }
            state.notes[param["sound_type"]].push(param["note"]);
        },
        all_delete(state){
            //サーバーから情報消す
            const params = {}
            let url = "https://kou.hongo.wide.ad.jp:3341/room_sound_all_remove";
            params['room'] = state.roomID;
            axios.post(url, params).then(res=>{
                console.log(res.data); 
            });
            
            
            for(let key in state.notes){
                state.notes[key] = [];
            }
        },
        delete_note(state, param){
            for(let i in state.notes[state.nowplaying]){
                let note = state.notes[state.nowplaying][i];
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
                        var note = state.notes[key][i];
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
            state.n_bars = parseInt(value);
            state.total_length = 480*4*state.n_bars;
        },
        set_bpm(state, value){
            state.bpm = parseInt(value);
        }
    }
})
