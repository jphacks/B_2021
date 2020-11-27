var input_options = new Vue({
    store: store,
    el: "#input_options",
    data:{
        recording_state: false,
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
        },
        file_input:function(e){
            console.log("--------fuke--------")
            console.log(e.target);
            let file_list = e.target.files;
            for(let i=0;i<file_list.length;i++){
                let reader = new FileReader();
                reader.readAsDataURL(file_list[i]);
                let now = this;
                reader.onload = function(){
                    console.log("data入れる--------")
                    console.log(reader.result);
                    //ファイル送り付ける
                    // let put_url = "https://kou.hongo.wide.ad.jp:3341/upload/" + document.getElementById("roomID").value + "/" + "audio" + "/" + file_list[i].name;
                    let put_url = "https://kou.hongo.wide.ad.jp:3341/upload"
                    //base64に切り出し
                    const base64EncodedFile = reader.result.split("base64,")[1];
                    let put_param = {"fileName":String(file_list[i].name),"roomName":document.getElementById("roomID").value,"soundType":"audio","base64Data":base64EncodedFile};
                    console.log(put_url)
                    console.log(put_param)
                    now.$store.commit("edit_nowplaying",{"nowplaying":"audio"});
                    axios.post(put_url, put_param).then(res=>{console.log(res);console.log("hellooooo")});
                    //base64decode
                    // let binary = atob(base64EncodedFile);
                    // let len = binary.length;
                    // let bytes = new Uint8Array(len);
                    // for (let i = 0; i < len; i++)        {
                    //     bytes[i] = binary.charCodeAt(i);
                    // }
                    // bytes = bytes.buffer;
                    // ctx.decodeAudioData(bytes, function (buf) {
                    //     let music_source = buf;
                    //     let file_param = {};
                    //     file_param['name'] = file_list[i].name;
                    //     file_param['file'] = music_source;
                    //     now.$store.commit('set_filemusic', file_param);
                    //     now.$store.commit('lane_add',{'name':file_param['name'],'type_value':'audio'})
                        
                    // });
                    
                    

                }

            }
        },
        record_start_btn: function(e){
            document.record_start();
            this.recording_state=true;
            document.getElementById("record_add_btn").setAttribute("disabled","");
            document.getElementById("record_play_btn").setAttribute("disabled","");    
        },
        record_stop_btn: function(e){
            document.record_stop();
            this.recording_state=false;
            document.getElementById("record_add_btn").removeAttribute("disabled");
            document.getElementById("record_play_btn").removeAttribute("disabled");
        },
        record_play_btn: function(e){
            document.record_play();
        },
        record_add_btn: function(e){
            document.getElementById("record_add_btn").setAttribute("disabled","");
            document.getElementById("record_play_btn").setAttribute("disabled","");    
            
            let recorded_buf = document.return_buf();
            let array_buf = document.return_arraybuf();
            let DD = new Date();
            let name = String(document.getElementById("who_make").value);
            let lane_name = String(DD.getHours())+":"+String(DD.getMinutes())+":"+String(DD.getSeconds()) +" by "+name;
            //音源投げつける
            console.log("-----録音arraybuf-------")
            console.log(array_buf)
            let base64String = btoa(String.fromCharCode(...new Uint8Array(array_buf)));
            let put_url = "https://kou.hongo.wide.ad.jp:3341/upload";
            let put_param = {"fileName":lane_name,"roomName":document.getElementById("roomID").value,"soundType":"voice","base64Data":base64String};
            axios.post(put_url, put_param).then(res=>{
                console.log(res);
                ctx.decodeAudioData(array_buf,(buf)=>{
                    this.$store.commit('lane_add', {
                        'type_value': 'recorded',
                        'name': lane_name,
                    });
                    this.$store.commit('recorded_buf_add', {
                        'name': lane_name,
                        'buf' : buf
                    });
                    this.$store.commit("edit_nowplaying",{"nowplaying":"recorded"});
                })
                
            });


        }
    }
});

var input_id = new Vue({
    store: store,
    el: "#head_div",
    data:{
        intervalId:null,
    },
    methods:{
        enter(state, value){
            // //---音声読み込み用処理---
            // let music_request = new XMLHttpRequest();
            // music_request.open("GET", "./audio/loop1.wav", true);
            // music_request.responseType = "arraybuffer";
            // let now = this;
            // music_request.onload = ()=>{
            //     ctx.decodeAudioData(music_request.response, function (buf) {
            //         let music_source = buf;
            //         let file_param = {};
            //         file_param['name'] = 'drum';
            //         file_param['file'] = music_source;
            //         now.$store.commit('set_filemusic', file_param);
            //     });
            // }
            // music_request.send();
            // //---音声読み込み用処理---
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

            //twitter用url作成
            // 現在のurlをエンコード
            let url = encodeURIComponent(location.href);
            // ページ文言(タイトルとかdescription) ここではdescriptionを使用
            let txt = encodeURIComponent("JointSoundで気軽に音を奏でよう♪roomIDはこちら→【"+roomID+"】");
            // Twitter用のurl作成 ハッシュタグもtxtを使用
            let twUrl = 'https://twitter.com/intent/tweet?text='+ txt + '&hashtags=' + "JointSound" + '&url=' + url;
            this.$store.commit("edit_twiurl",{"url":twUrl});
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
                        let new_note = new Note(return_notes[i]['pitch_name'], return_notes[i]['start'], return_notes[i]['length'], return_notes[i]['room'], return_notes[i]['made_by'], return_notes[i]['sound_type'], return_notes[i]['filtered_by'])
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

            //音源の差分確認
            let dif_get_url = "https://kou.hongo.wide.ad.jp:3341/difference_listoftitle";
            let params_for_dif_get = {};
            params_for_dif_get["roomName"] = this.$store.state.roomID;
            params_for_dif_get["soundType"] = "audio";
            params_for_dif_get["current_list"] = this.$store.state.lanes_for_html["audio"];
            console.log(params_for_dif_get)
            axios.post(dif_get_url, params_for_dif_get).then(res=>{
                console.log("----音声差分-------")
                console.log(res.data);
                let add_list = res.data["add_list"];
                let remove_list = res.data["remove_list"];
                //remove処理
                //remove用のstore関数核
                //remove用commit
                for(let index in remove_list){
                    ctrl.$store.commit('delete_file',{"file_name":remove_list[index]});
                }

                //音源取得
                for(let file_name in add_list){
                    let get_url = "https://kou.hongo.wide.ad.jp:3341/upload/"+ this.$store.state.roomID + "/" + "audio/" + add_list[file_name];
                    axios.get(get_url).then(res=>{
                        let file_data = res.data["base64Data"];
                        console.log("-----get data------")
                        console.log(res.data)
                        //lane_addは先にやっておく(重複回避のため)
                        ctrl.$store.commit('lane_add',{'name':add_list[file_name],'type_value':'audio'});
                        //base64から復元
                        let binary = window.atob(file_data);
                        let len = binary.length;
                        let bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++)        {
                            bytes[i] = binary.charCodeAt(i);
                        }
                        bytes = bytes.buffer;
                        ctx.decodeAudioData(bytes, function (buf) {
                            let music_source = buf;
                            let file_param = {};
                            file_param['name'] = add_list[file_name];
                            file_param['file'] = music_source;
                            ctrl.$store.commit('set_filemusic', file_param);
                            console.log("--------------追加完了--------------------")
                            
                        });
                    })
                     
                }
                
            })

            //録音の差分確認
            dif_get_url = "https://kou.hongo.wide.ad.jp:3341/difference_listoftitle";
            params_for_dif_get = {};
            params_for_dif_get["roomName"] = this.$store.state.roomID;
            params_for_dif_get["soundType"] = "voice";
            params_for_dif_get["current_list"] = this.$store.state.lanes_for_html["recorded"];
            console.log(params_for_dif_get)
            axios.post(dif_get_url, params_for_dif_get).then(res=>{
                console.log("----音声差分-------")
                console.log(res.data);
                let add_list = res.data["add_list"];
                let remove_list = res.data["remove_list"];
                //remove処理
                //remove用のstore関数核
                //remove用commit
                for(let index in remove_list){
                    ctrl.$store.commit('delete_recorded',{"file_name":remove_list[index]});
                }

                //音源取得
                for(let file_name in add_list){
                    let get_url = "https://kou.hongo.wide.ad.jp:3341/upload/"+ this.$store.state.roomID + "/" + "voice/" + add_list[file_name];
                    axios.get(get_url).then(res=>{
                        let file_data = res.data["base64Data"];
                        console.log("-----get data------")
                        console.log(res.data)
                        //lane_addは先にやっておく(重複回避のため)
                        ctrl.$store.commit('lane_add',{'name':add_list[file_name],'type_value':'recorded'});
                        //base64から復元
                        let binary = window.atob(file_data);
                        let len = binary.length;
                        let bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++)        {
                            bytes[i] = binary.charCodeAt(i);
                        }
                        bytes = bytes.buffer;
                        console.log(bytes);
                        ctx.decodeAudioData(bytes, function (buf) {
                            let music_source = buf;
                            let file_param = {};
                            file_param['name'] = add_list[file_name];
                            file_param['buf'] = music_source;
                            ctrl.$store.commit('recorded_buf_add', file_param);
                            console.log("--------------追加完了--------------------")
                            
                        });
                    })
                     
                }
                
            })


        },
    }
});
