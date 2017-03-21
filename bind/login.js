var bindType = getUrlParam("bindType");//必须
var bindValue = getUrlParam("bindValue");//实际的绑定值,必须
var bindToken = getUrlParam("bindToken");//必须

var bindName = getUrlParam("bindName");//可选,提示绑定的第三方名称
var bindNickName = getUrlParam("bindNickName");//显示的名称,可为null,null时不显示

//登录
var login = function (name) {
    //显示登录中
    Loading.show("登录中");

    sendPost("/rest/user/loginBind", {
            bindType: bindType,
            bindValue: bindValue,
            bindToken: bindToken,
            name: name
        })
        .done(function (user, textStatus, jqXHR) {
            Login.set(jqXHR.getResponseHeader(Constants.LOGIN_TOKEN_KEY), user);
            TopTip.set("登录成功!", "success");
            nav("/index/index.html");
        })
        .fail(function (resp) {
            var data = eval('('+resp.responseText+')');
            var msg = Constants.CODE_MSGS[data.code];
            if (data.params) {
                for (var o in data.params) msg = msg.replace("{"+o+"}", data.params[o]);
            }
            //提示
            TopTip.show(msg || "登录失败!", "error");
        });
};

$(document).ready(function () {
    //检测绑定信息无效
    if (!bindType || !bindValue || !bindToken) {
        TopTip.set("绑定信息无效!", "error");
        nav("/index/index.html");
    }

    if (bindName) $(".bind-name").text(bindName);
    if (bindNickName) {
        $(".bind-nickname").text(bindNickName);
        $("#bind-item2").removeClass("hide");
    }else {
        $("#bind-item1").removeClass("hide");
    }

    //显示请求中
    Loading.show("请求中");
    //获取请求
    sendPost("/rest/user/getBinds", {
        bindType: bindType,
        bindValue: bindValue
    })
        .done(function (users) {
            var result = false;
            if (users && $.isArray(users)) {
                for (var i in users) {
                    result = true;
                    var name = users[i];
                    var ele = $('<input type="button" class="weui_btn weui_btn_primary btn_name" value="'+name+'">');
                    (function (name) {
                        ele.on("click", function () {
                            login(name);
                        });
                    })(name);
                    $("#container-names").append(ele);
                }
            }
            //没有一个元素时显示
            if (!result) $("#no-name").removeClass("hide");
        })
        .fail(function () {
            $("#no-name").removeClass("hide");
        })
    ;
});