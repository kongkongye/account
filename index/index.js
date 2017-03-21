var logout = function () {
    sendPost("/rest/user/logout")
        .done(function () {
            //删除登录信息
            Login.clear();
            //设置提示
            TopTip.set("注销成功!", "info");
            //刷新页面
            window.location.reload();
        })
    ;
};

var generateLoginCode = function () {
    //disabled
    Wait.add("loginCode_generate", "#loginCode_generate", "#loginCodeShow_time", 10);
    //发送请求
    sendPost("/rest/user/generateLoginCode").done(function (data) {
        $("#loginCodeShow").removeClass("hide");
        $("#loginCodeShow_code").text("登录码: "+data.msg);
        //3分钟倒计时
        Wait.add("loginCodeShow_codeWait", null, "#loginCodeShow_codeWait", 180, function () {
            $("#loginCodeShow").addClass("hide");
        });
    });
};

$(document).ready(function () {
    var user = Login.getLoginUser();
    if (user) {
        //设置用户信息
        $("#user_name").text(user.name);

        //显示用户信息区域
        $("#hasLogin").removeClass("hide");
    }else {
        //显示注册登录区域
        $("#notLogin").removeClass("hide");
    }
});
