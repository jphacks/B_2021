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
        mouse_down:function(event, type_value){
            // クリックでノーツを追加
            console.log(type_value);
            this.click_x = event.offsetX;
            this.click_y = event.offsetY;

            var tonenum = parseInt(this.click_y/this.note_height);
            //play_tone(this.$store.state.nowplaying, this.$store.state.lanes[this.$store.state.nowplaying][tonenum], 0.3); // audio.js
            //playdrum();
            // 時間は4分音符を480として規格化
            var start_time = parseInt((this.click_x/this.note_width)*480 /store.state.quantize)*store.state.quantize;
            var pitch_name = this.$store.state.lanes[type_value][parseInt(this.click_y/this.note_height)];
            var nagasa = store.state.edit_note_length;
            

            // ノーツが重なってはよくないからチェック
            for(let i in store.state.notes[type_value]){
                let note = store.state.notes[type_value][i];
                if(note["pitch"]==pitch_name && start_time<note["start_time"] && note["start_time"]<start_time+nagasa){
                    nagasa = note["start_time"]-start_time;
                    console.log("重なっている");
                }
            }
            
            // 配列に追加
            let note = new Note(pitch_name,start_time,nagasa,document.getElementById("roomID").value,document.getElementById("who_make").value,type_value, this.$store.state.nowfilter);

            //サーバーに情報送り付ける
            let params = {};
            let url = "https://kou.hongo.wide.ad.jp:3341/regist";
            params['pitch_name'] = pitch_name;
            params['start'] = start_time;
            params['length'] = nagasa;
            params['room'] = document.getElementById("roomID").value;
            params['made_by'] = document.getElementById("who_make").value;
            params['sound_type'] = type_value;
            params['filtered_by'] = this.$store.state.nowfilter;
            const headers = {
                'Content-Type': 'application/json'
            };
            let ctrl = this;
            axios.post(url, params).then(res=>{
                console.log(res.data.id);
                note.object_id = res.data.id;
                console.log(note);
                ctrl.$store.commit('note_add',{"note":note,"sound_type":type_value});

            });
            console.log("----note------")
            // ctrl.$store.commit('note_add',{"note":note,"sound_type":type_value});
            console.log(ctrl.$store.state.notes)

            
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

        note_click: function(event,type_value){
            let click_x = parseInt(event.target.getAttribute("x"))
            let click_y = parseInt(event.target.getAttribute("y"))
            if(this.$store.state.not_file.includes(type_value)){            
                var click_note_pitch = this.$store.state.lanes["sawtooth"][parseInt(click_y/this.note_height)];
                var click_note_start_time = parseInt(480*(click_x-3)/this.note_width);  // rectのstrokeの幅のせいで -3 している　どうにかならないか？
            }else{
                var click_note_pitch = this.$store.state.nowplaying;
                var click_note_start_time = parseInt(480*(click_x-3)/this.note_width);  // rectのstrokeの幅のせいで -3 している　どうにかならないか？
            }
            console.log(click_note_start_time);
            //クリックしたノーツの削除
            this.$store.commit('delete_note',{click_note_pitch:click_note_pitch,click_note_start_time:click_note_start_time,nowplaying:type_value});
            //サーバーから情報消す
            const params = {}
            let url = "https://kou.hongo.wide.ad.jp:3341/remove";
            params["id"] = event.target.getAttribute("id").slice(4);
            

            axios.post(url, params).then(res=>{
                console.log(res.data);
                
            });

            

        },
        neiro_click:function(event,type_value){
            if(!this.$store.state.not_file.includes(type_value)){
                let type = this.$store.state.nowplaying;
                if(type=="recorded"){
                    type = "voice";
                }
                let delete_url = "https://kou.hongo.wide.ad.jp:3341/upload/"+document.getElementById("roomID").value+"/"+type+"/"+type_value;
                axios.delete(delete_url).then(res=>{
                    console.log(res)
                })
            }
        }
    }
});
