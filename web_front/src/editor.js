// 編集画面
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
            lanes : {"sawtooth":["C4", "B3", "A3", "G3", "F3", "E3", "D3", "C3"],"sine":["C4", "B3", "A3", "G3", "F3", "E3", "D3", "C3"],"drum":["dummy"]},
    },
    mounted(){
        
        
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
            //play_tone(this.$store.state.nowplaying, this.lanes[this.$store.state.nowplaying][tonenum], 0.3); // audio.js
            //playdrum();
            // 時間は4分音符を480として規格化
            // 音源fileかそうでないかの判定
            if(this.$store.state.not_file.includes(this.$store.state.nowplaying)){
                var start_time = parseInt((this.click_x/this.note_width)*480 /store.state.quantize)*store.state.quantize;
                var pitch_name = this.lanes[this.$store.state.nowplaying][parseInt(this.click_y/this.note_height)];
                var nagasa = store.state.edit_note_length;
            }else{
                var start_time = parseInt((this.click_x/this.note_width)*480 /store.state.quantize)*store.state.quantize;
                var pitch_name = "dummy";
                var nagasa = this.$store.state.file_length[this.$store.state.nowplaying];
            }

            // ノーツが重なってはよくないからチェック
            for(let i in store.state.notes[this.$store.state.nowplaying]){
                let note = store.state.notes[this.$store.state.nowplaying][i];
                if(note["pitch"]==pitch_name && start_time<note["start_time"] && note["start_time"]<start_time+nagasa){
                    nagasa = note["start_time"]-start_time;
                    console.log("重なっている");
                }
            }
            
            // 配列に追加
            let note = new Note(pitch_name,start_time,nagasa,document.getElementById("roomID").value,document.getElementById("who_make").value);

            //サーバーに情報送り付ける
            let params = {};
            let url = "https://kou.hongo.wide.ad.jp:3341/regist";
            params['pitch_name'] = pitch_name;
            params['start'] = start_time;
            params['length'] = nagasa;
            params['room'] = document.getElementById("roomID").value;
            params['made_by'] = document.getElementById("who_make").value;
            params['sound_type'] = this.$store.state.nowplaying;
            const headers = {
                'Content-Type': 'application/json'
            };
            let ctrl = this;
            // axios.post(url, params).then(res=>{
            //     console.log(res.data.id);
            //     note.object_id = res.data.id;
            //     console.log(note);
            //     ctrl.$store.commit('note_add',{"note":note,"sound_type":ctrl.$store.state.nowplaying});

            // });
            console.log("----note------")
            console.log(note);
            ctrl.$store.commit('note_add',{"note":note,"sound_type":ctrl.$store.state.nowplaying});

            
        },
        mouse_down_for_file:function(event){

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
            if(this.$store.state.not_file.includes(this.$store.state.nowplaying)){            
                var click_note_pitch = this.lanes["sawtooth"][parseInt(click_y/this.note_height)];
                var click_note_start_time = parseInt(480*(click_x-3)/this.note_width);  // rectのstrokeの幅のせいで -3 している　どうにかならないか？
            }else{
                var click_note_pitch = "dummy";
                var click_note_start_time = parseInt(480*(click_x-3)/this.note_width);  // rectのstrokeの幅のせいで -3 している　どうにかならないか？
            }
            console.log(click_note_start_time);
            //クリックしたノーツの削除
            this.$store.commit('delete_note',{click_note_pitch:click_note_pitch,click_note_start_time:click_note_start_time});
            //サーバーから情報消す
            const params = {}
            let url = "https://kou.hongo.wide.ad.jp:3341/remove";
            params["id"] = event.target.getAttribute("id").slice(4);
            

            axios.post(url, params).then(res=>{
                console.log(res.data);
                
            });

            

        },
    }
});
