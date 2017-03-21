var bindType = getUrlParam("bindType");//必须
var bindValue = getUrlParam("bindValue");//实际的绑定值,必须
var bindToken = getUrlParam("bindToken");//必须

var bindName = getUrlParam("bindName");//可选,提示绑定的第三方名称
var bindNickName = getUrlParam("bindNickName");//显示的名称,可为null,null时不显示

var register = function () {
    //验证
    var result = true;
    if (!checkNameEmpty()) result = false;
    if (!result) return;

    //显示注册中
    Loading.show("注册中");

    //注册
    var name = $("#name").val();

    sendPost("/rest/user/registerBind", {
            name: name,
            type: bindType,
            bind: bindValue,
            token: bindToken
        })
        .done(function () {
            TopTip.set("注册成功!", "success");
            nav("/login/login.html");
        })
        .fail(function (resp) {
            var data = eval('('+resp.responseText+')');
            var msg = Constants.CODE_MSGS[data.code];
            if (data.params) {
                for (var o in data.params) msg = msg.replace("{"+o+"}", data.params[o]);
            }
            //提示
            TopTip.show(msg || "注册失败!", "error");
        });
};

var checkNameEmpty = function () {
    var name = $("#name").val();

    //未输入名字
    if (!name) {
        showErrorRegister("#err_name", "用户名不能为空!");
        return false;
    }

    return true;
};
/**
 * @returns {boolean} 用户名是否合法
 */
var checkName = function () {
    var name = $("#name").val();

    //注册时用户名最小长度
    if (name && name.length < Constants.REG_NAME_MIN_LENGTH) {
        showErrorRegister("#err_name", "注册的用户名长度最少为"+Constants.REG_NAME_MIN_LENGTH+"!");
        return false;
    }
    
    //用户名正则
    if (name && !isValidName(name)) {
        showErrorRegister("#err_name", "用户名不合法!(只能包含字母,数字,下划线,且不能以数字开头)");
        return false;
    }else {
        clearErrorRegister("#err_name");
        return true;
    }
};

/**
 * 检测用户名是否存在
 */
var checkExist = function () {
    var name = $("#name").val();
    if (isValidName(name)) {
        sendPost("/rest/user/getRealName", {
                name: name
            })
            .done(function () {
                showErrorRegister("#err_name", "此用户名已经被注册!");
            });
    }
};

var errs = {
    "#err_name": false
};
var hasError = function () {
    for (o in errs) {
        if (errs[o]) return true;
    }
    return false;
};
var showErrorRegister = function (selector, errorMsg) {
    //显示错误
    showError(selector, errorMsg);

    //更新状态
    errs[selector] = true;

    //disable按钮
    var btn = $("#submitBtn");
    $(btn).addClass("weui_btn_disabled");
    $(btn).attr("disabled", true);
};
var clearErrorRegister = function (selector) {
    //清除错误
    clearError(selector);

    //更新状态
    errs[selector] = false;

    //检测enable按钮
    if (!hasError()) {
        var btn = $("#submitBtn");
        $(btn).removeClass("weui_btn_disabled");
        $(btn).attr("disabled", false);
    }
};

$(document).ready(function () {
    //检测绑定信息无效
    if (!bindType || !bindValue || !bindToken) {
        TopTip.set("绑定信息无效!", "error");
        nav("/index/index.html");
    }

    $(".bind-name").text(bindName);
    if (bindNickName) {
        $(".bind-nickname").text(bindNickName);
        $("#bind-item2").removeClass("hide");
    }else {
        $("#bind-item1").removeClass("hide");
    }
});