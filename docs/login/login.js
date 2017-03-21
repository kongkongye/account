var login = function () {
    //验证
    var result = true;
    if (!checkNameEmpty()) result = false;
    if (!checkPwdEmpty()) result = false;
    if (!result) return;

    //显示登录中
    Loading.show("登录中");

    //获取登录验证码
    var code;
    sendPost("/rest/code/text")
        .done(function (data) {
            code = data;

            //登录
            var name = $("#name").val();
            var pwd = MD5(code.value+MD5(name+MD5($("#pwd").val(), Constants.MD5_MAX_LENGTH_INNER), Constants.MD5_MAX_LENGTH_OUTER), Constants.MD5_MAX_LENGTH_TMP);

            sendPost("/rest/user/login", {
                name: name,
                pwd: pwd,
                codeId: code.id
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
        });
};

var checkNameEmpty = function () {
    var name = $("#name").val();

    //未输入名字
    if (!name) {
        showErrorLogin("#err_name", "用户名不能为空!");
        return false;
    }

    return true;
};
/**
 * @returns {boolean} 用户名是否合法
 */
var checkName = function () {
    var name = $("#name").val();

    //用户名正则
    if (name && !isValidName(name)) {
        showErrorLogin("#err_name", "用户名不合法!(只能包含字母,数字,下划线,且不能以数字开头)");
        return false;
    }else {
        clearErrorLogin("#err_name");
        return true;
    }
};

var checkPwdEmpty = function () {
    var pwd = $("#pwd").val();

    //未输入密码
    if (!pwd) {
        showErrorLogin("#err_pwd", "密码不能为空!");
        return false;
    }

    return true;
};
/**
 * @returns {boolean} 密码是否合法
 */
var checkPwd = function () {
    var pwd = $("#pwd").val();

    //密码长度
    if (pwd && !isValidPwd(pwd)) {
        showErrorLogin("#err_pwd", "密码长度必须在"+Constants.PWD_MIN_LENGTH+"-"+Constants.PWD_MAX_LENGTH+"之间!");
        return false;
    }

    //成功
    clearErrorLogin("#err_pwd");
    return true;
};

/**
 * 检测用户名是否不存在
 */
var checkNotExist = function () {
    var name = $("#name").val();
    if (isValidName(name)) {
        sendPost("/rest/user/getRealName", {
                name: name
            })
            .done(function (data) {
                if (data.realName !== name) showErrorLogin("#err_name", "用户名大小写不正确,请改为'"+data.realName+"'!");
            })
            .fail(function () {
                showErrorLogin("#err_name", "此用户名未注册!");
            });
    }
};

var errs = {
    "#err_name": false,
    "#err_pwd": false
};
var hasError = function () {
    for (o in errs) {
        if (errs[o]) return true;
    }
    return false;
};
var showErrorLogin = function (selector, errorMsg) {
    //显示错误
    showError(selector, errorMsg);

    //更新状态
    errs[selector] = true;

    //disable按钮
    var btn = $("#submitBtn");
    $(btn).addClass("weui_btn_disabled");
    $(btn).attr("disabled", true);
};
var clearErrorLogin = function (selector) {
    //清除错误
    clearError(selector);

    //更新状态
    errs[selector] = false;

    //检测enable按钮
    if (!hasError()) {
        var btn = $("#submitBtn");
        $(btn).removeClass("weui_btn_disabled");
        $(btn).removeAttr("disabled");
    }
};