console.log("Hello, World!");

var hello = new Vue({
    el: "#test",
    data:{
        message: "Hello, World!"
    }
});

// クリックするとドラム音が鳴るボタンテスト
var testdrum = new Vue({
    el: "#wrapper",
    data: {
    },
    methods: {
        test: function(event){
            var drum1 = new Audio("./audio/drum1.wav");
            drum1.currentTime = 0;
            drum1.play();
        }
    }
})