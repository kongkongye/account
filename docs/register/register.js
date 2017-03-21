var register = function () {
    //验证
    var result = true;
    if (!checkNameEmpty()) result = false;
    if (!checkPwdEmpty()) result = false;
    if (!checkPwd2Empty()) result = false;
    if (!checkCodeLength()) result = false;
    if (!result) return;

    //显示注册中
    Loading.show("注册中");

    //注册
    var name = $("#name").val();
    var pwd = MD5($("#pwd").val(), Constants.MD5_MAX_LENGTH_INNER);
    var imgCodeId = $("#imgCodeId").val();
    var imgCodeValue = $("#imgCodeValue").val();

    sendPost("/rest/user/register", {
            name: name,
            pwd: pwd,
            imgCodeId: imgCodeId,
            imgCodeValue: imgCodeValue
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
 * @returns {boolean} 验证码是否合法
 */
var checkCode = function () {
    var code = $("#imgCodeValue").val();

    //验证码长度
    if (code && code.length != 4) {
        showErrorRegister("#err_code", "验证码长度是4位!");
        return false;
    }

    clearErrorRegister("#err_code");
    return true;
};

var checkPwdEmpty = function () {
    var pwd = $("#pwd").val();

    //未输入密码
    if (!pwd) {
        showErrorRegister("#err_pwd", "密码不能为空!");
        return false;
    }

    return true;
};
var checkPwd2Empty = function () {
    var pwd2 = $("#pwd2").val();

    //未输入密码
    if (!pwd2) {
        showErrorRegister("#err_pwd", "确认密码不能为空!");
        return false;
    }

    return true;
};
var checkCodeLength = function () {
    var code = $("#imgCodeValue").val();

    //未输入验证码
    if (!code) {
        showErrorRegister("#err_code", "请输入验证码!");
        return false;
    }
    //验证码长度不对
    if (code.length != 4) {
        showErrorRegister("#err_code", "验证码长度是4位!");
        return false;
    }

    return true;
};
/**
 * @param first true表示pwd,false表示pwd2
 * @returns {boolean} 密码是否合法
 */
var checkPwd = function (first) {
    var pwd = $(first?"#pwd":"#pwd2").val();

    //检测显示删除按钮
    if (pwd) {
        if (first) $("#del-pwd").removeClass("hide");
        else $("#del-pwd2").removeClass("hide");
    }else {
        if (first) $("#del-pwd").addClass("hide");
        else $("#del-pwd2").addClass("hide");
    }

    //密码长度
    if (pwd && !isValidPwd(pwd)) {
        showErrorRegister("#err_pwd", "密码长度必须在"+Constants.PWD_MIN_LENGTH+"-"+Constants.PWD_MAX_LENGTH+"之间!");
        return false;
    }

    //成功
    clearErrorRegister("#err_pwd");
    return true;
};
/**
 * @returns {boolean} 密码与确认密码是否一致
 */
var checkPwdSame = function () {
    var pwd = $("#pwd").val();
    var pwd2 = $("#pwd2").val();

    if (pwd == pwd2) {
        //成功
        clearErrorRegister("#err_pwd");
        return true;
    }else {
        //不一致
        showErrorRegister("#err_pwd", "确认密码必须与密码一致!");
        return false;
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

//刷新验证码
var refreshCode = function () {
    $("#refresh-code").hide();
    setTimeout(function () {
        $("#refresh-code").show();
    }, 1200);

    sendPost("/rest/code/img")
        .done(function (data) {
            $("#imgCodeId").val(data.id);
            $("#code-img").attr("src", Constants.CODE_URL+"/images/"+data.id+"/");
        })
    ;
};

var errs = {
    "#err_name": false,
    "#err_pwd": false,
    "#err_code": false
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
    refreshCode();
});