console.log("Hello, World!");

var hello = new Vue({
    el: "#test",
    data:{
        message: "Hello, World!"
    }
});

// クリックするとドラム音が鳴るボタンテスト
// 位置座標取得もつけた
let screenx = "";
let screeny = "";
var testdrum = new Vue({
    el: "#wrapper",
    data: {
        screenx:"x座標",
        screeny:"y座標"
    },
    methods: {
        test: function(event){
            var drum1 = new Audio("./audio/drum1.wav");
            drum1.currentTime = 0;
            drum1.play();
        },
        mouse:function(event){
            console.log("HELLO");
            this.screenx = event.clientX;
            this.screeny = event.clientY;
            console.log(event.clientX,event.clientY);
        }
    }
})
