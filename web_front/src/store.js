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
        who_make: "",
        roomID: "",
        who_make_set:new Set(),
        who_make_num:{},
        note_color:["#00ff7f","#00ffff","#ffa500","#8a2be2","#ff00ff"],
        not_file:["sawtooth","sine"],


        lanes : {"sawtooth":["C4", "B3", "A3", "G3", "F3", "E3", "D3", "C3"],"sine":["C4", "B3", "A3", "G3", "F3", "E3", "D3", "C3"]},//キーデータ(ファイルとかはdummyで1レーン分になるようになってる)
        lanes_for_html:{"sawtooth":["sawtooth"], "sine":["sine"], "audio":[], "recorded":[]},//svgをv-forで回したいので
        file_length:{},//ファイルの曲の長さ(秒単位)
        file_data:{},//ファイルデータ
        
        recorded_buf: {},

        //for filter
        nowfilter:"allpass",
        filter_list:["allpass","highpass","lowpass"],
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
            state.file_length = {};
            state.file_data = {};
            state.lanes = {"sawtooth":["C4", "B3", "A3", "G3", "F3", "E3", "D3", "C3"],"sine":["C4", "B3", "A3", "G3", "F3", "E3", "D3", "C3"],"drum":["dummy"]};
            state.lanes_for_html = {"sawtooth":["sawtooth"], "sine":["sine"], "audio":[], "recorded":[]};
            state.file_length = {};
            state.file_data = {};
            state.nowfilter = "allpass";
            state.filter_list = ["allpass","highpass","lowpass"];
            state.recorded_buf = {};


        },
        note_add(state, param) {
            let who = param["note"]["who_make"];
            if(state.who_make_set.has(who)==false){
                state.who_make_set.add(who);
                state.who_make_num[who] = state.who_make_set.size -1;
            }
            state.notes[param["sound_type"]].push(param["note"]);
            //console.log(state.notes);
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
            for(let i in state.notes[param["nowplaying"]]){
                let note = state.notes[param["nowplaying"]][i];
                if((note.pitch == param["click_note_pitch"]) && (note.start_time == param["click_note_start_time"])){
                    console.log(i);
                    console.log(note.pitch);
                    console.log(param["click_note_pitch"]);
                    //ノーツの削除
                    state.notes[param["nowplaying"]].splice(i, 1);
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
                for(let type in state.notes){
                    for(var i in state.notes[type]){
                        var note = state.notes[type][i];
                        var start_time = note["start_time"];
                        var pitch_name = note["pitch"];
                        var note_length_sec = 60/state.bpm * note["nagasa"]/480;
                        let filter_by = note["filter_by"];
                        if(prev_position<=start_time && start_time<=new_position){

                            if(pitch_name=="recorded"){
                                console.log("-------in setposition--------------------")
                                console.log(type)
                                console.log(state.recorded_buf)
                                console.log(note);
                                play_tone(type, pitch_name, note_length_sec, state.nowfilter, state.recorded_buf[type]);
                            }

                            else if(pitch_name=="audio"){
                                play_tone(type,pitch_name,note_length_sec, state.nowfilter, state.file_data[type]);
                            }else{
                                play_tone(type,pitch_name,note_length_sec, state.nowfilter)

                            }
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
        },
        set_filemusic(state, param){
            //state.file_length[param['name']] = param['file'].length / param['file'].sampleRate;
            Vue.set(state.file_length, param['name'], param['file'].length / param['file'].sampleRate);
            console.log("----------store log-------")
            console.log(state.file_length[param['name']])
            // state.file_data[param['name']] = param['file'];
            Vue.set(state.file_data,param['name'],param['file']);

        },
        lane_add(state, param){

            // state.lanes[param['name']] = ["dummy"];
            Vue.set(state.lanes, param['name'],[param['type_value']]);
            // state.notes[param['name']] = [];
            Vue.set(state.notes, param['name'], []);
            //state.nowplaying = param["name"]
            state.lanes_for_html[param['type_value']].push(param['name']);
            //state.nowplaying = param['type_value'];
        },
        recorded_buf_add(state, param){
            let buf = param["buf"];
            let name = param["name"];
            state.recorded_buf[name] = buf;
 
        },
        delete_file(state,param){
            console.log(param["file_name"])
            let file_name = param["file_name"];
            delete state.lanes[param["file_name"]];
            delete state.file_data[param["file_name"]];
            delete state.file_length[param["file_name"]];
            state.lanes_for_html["audio"] = state.lanes_for_html["audio"].filter(file=>file!==file_name);
            
        },
        delete_recorded(state,param){
            let file_name = param['file_name'];
            delete state.lanes[param["file_name"]];
            delete state.file_data[param["file_name"]];
            state.lanes_for_html["recorded"] = state.lanes_for_html["recorded"].filter(file=>file!==file_name);
        }
        

    }
})
