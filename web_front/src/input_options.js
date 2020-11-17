var input_options = new Vue({
    store: store,
    el: "#input_options",
    data:{
    },
    methods:{
        shosetu_henshu: function(event){
            let url_for_updateroom = "https://kou.hongo.wide.ad.jp:3341/change_num_of_bar";
            let params_n_bar = {};
            params_n_bar['name'] = this.$store.state.roomID;
            params_n_bar['num_of_bar'] = parseInt(document.getElementById("shosetu").value);
            axios.post(url_for_updateroom,params_n_bar).then(res=>{
                console.log(res);
            })
            this.$store.commit('set_n_bars',parseInt(document.getElementById("shosetu").value));
        },
        bpm_henshu : function(event){
            let url_for_updateroom = "https://kou.hongo.wide.ad.jp:3341/change_bpm";
            let params_bpm = {};
            params_bpm['name'] = this.$store.state.roomID;
            params_bpm['bpm'] = parseInt(document.getElementById("bpm").value);
            axios.post(url_for_updateroom,params_bpm).then(res=>{
                console.log(res);
            })
            this.$store.commit('set_bpm',parseInt(document.getElementById('bpm').value));
        }
    }
});

var input_id = new Vue({
    store: store,
    el: "#input_id",
    data:{
        intervalId:null,
    },
    methods:{
        enter(state, value){
            //---音声読み込み用処理---
            let music_request = new XMLHttpRequest();
            music_request.open("GET", "./audio/loop1.wav", true);
            music_request.responseType = "arraybuffer";
            let now = this;
            music_request.onload = ()=>{
                ctx.decodeAudioData(music_request.response, function (buf) {
                    let music_source = buf;
                    let file_param = {};
                    file_param['name'] = 'tmp';
                    file_param['file'] = music_source;
                    now.$store.commit('set_filemusic', file_param);
                  });
            }
            music_request.send();
            //---音声読み込み用処理---
            let who_make = document.getElementById("who_make").value;
            let roomID = document.getElementById("roomID").value;

            if(who_make=="" || roomID==""){
                console.log("error: empty entry is not allowed");
                return;
            }
            // room作成処理
            let create_room_url = "https://kou.hongo.wide.ad.jp:3341/create_room"
            let params_for_create_room = {};
            params_for_create_room['name'] = roomID;
            params_for_create_room['bpm'] = this.$store.state.bpm;
            params_for_create_room['num_of_bar'] = this.$store.state.n_bars;
            axios.post(create_room_url,params_for_create_room).then(res=>{
                console.log(res);
            })

            store.state.who_make = who_make;
            store.state.roomID = roomID;
            store.state.isInRoom = true;
            console.log("入室",store.state.who_make,store.state.roomID);
            document.getElementById("who_make").setAttribute("disabled","disabled");
            document.getElementById("roomID").setAttribute("disabled","disabled");
            this.intervalId = setInterval(this.postRequest, 1000);

        },
        quit(state, value){
            clearInterval(this.intervalId);
            store.state.who_make = "";
            store.state.roomID = "";
            store.state.isInRoom = false;
            this.$store.commit('shokika');
            console.log("退室");
            document.getElementById("who_make").removeAttribute("disabled","disabled");
            document.getElementById("roomID").removeAttribute("disabled","disabled");
        },
        postRequest : function(){
            console.log("hello postrequest")
            let params = {};
            params["room"]=document.getElementById("roomID").value;
            params = JSON.stringify(params);
            url = "https://kou.hongo.wide.ad.jp:3341/show_room";
            const headers = {
                'Content-Type': 'application/json'
            };
            let ctrl = this;
            const response = axios.post(url,params,{ headers: headers }).then(res=>{
                //ノーツの差分見て追加する処理
                let return_notes = res.data.sounds;
                let add_index_list = [];
                for(let i = 0;i < return_notes.length; i++){
                    let continue_flag = -1;
                    for(let index = 0;index<parseInt(Object.keys(ctrl.$store.state.notes).length);index++){
                        let key = index;
                        key = Object.keys(ctrl.$store.state.notes)[key];
                        if(return_notes[i]['sound_type']!=key){
                            continue
                        }
                        
                        for(let j = 0; j < ctrl.$store.state.notes[key].length; j++){
                            if((return_notes[i]['start']==ctrl.$store.state.notes[key][j]['start_time'])&&
                            (return_notes[i]['pitch_name']==ctrl.$store.state.notes[key][j]['pitch'])&&
                            (return_notes[i]['sound_type']==ctrl.$store.state.notes[key][j]['sound_type'])
                            ){
                                continue_flag = 1;
                                break;
                            }
                            
                        }
                        if(continue_flag == 1){
                            console.log("continue_flag")
                            console.log(return_notes[i])
                            break;
                        }
                        let new_note = new Note(return_notes[i]['pitch_name'], return_notes[i]['start'], return_notes[i]['length'], return_notes[i]['room'], return_notes[i]['made_by'], return_notes[i]['sound_type'])
                        new_note.object_id = return_notes[i]['id'];
                        ctrl.$store.commit('note_add',{"sound_type":new_note['sound_type'], "note":new_note});
                    }
                }
                //ノーツの差分見て削除する処理
                for(let index = 0;index<Object.keys(ctrl.$store.state.notes).length;index++){
                    let key = index;
                    key = Object.keys(ctrl.$store.state.notes)[key];
                    for(let i = 0;i < ctrl.$store.state.notes[key].length; i++){
                        let break_flag = -1;
                        for(let j = 0; j < return_notes.length; j++){
                            if((return_notes[j]['start']==ctrl.$store.state.notes[key][i]['start_time'])&&
                            (return_notes[j]['pitch_name']==ctrl.$store.state.notes[key][i]['pitch'])&&
                            (return_notes[j]['sound_type']==ctrl.$store.state.notes[key][i]['sound_type'])
                            ){
                                break_flag = 1;
                                break;
                            }
                            
                        }
                        if(break_flag == 1){
                            continue;
                        }
                        ctrl.$store.commit('delete_note',{click_note_pitch:ctrl.$store.state.notes[key][i]['pitch'],click_note_start_time:ctrl.$store.state.notes[key][i]['start_time']});
                    }
                }



            })
            let url_for_bpm_n_bars = "https://kou.hongo.wide.ad.jp:3341/status_room";
            let params_for_status_room = {};
            params_for_status_room["name"] = this.$store.state.roomID;
            ctrl = this;
            axios.post(url_for_bpm_n_bars,params_for_status_room).then(res=>{
                console.log(res.data.rooms[0])
                let res_bpm = res.data.rooms[0]['bpm'];
                let res_n_bars = res.data.rooms[0]['num_of_bar'];
                if(res_n_bars!=ctrl.$store.state.bpm){
                    ctrl.$store.commit('set_n_bars',res_n_bars);
                }
                if(res_bpm!=ctrl.$store.state.n_bars){
                    ctrl.$store.commit('set_bpm',res_bpm);
                }

            })

        },
    }
});
