//rest请求地址
var DOMAIN = "rest.account.kongkongye.com";
var PROTOCOL = "";
var URL = PROTOCOL+"//"+DOMAIN;

var Constants = {
    REG_NAME_MIN_LENGTH: 3,//注册时使用的用户名最小长度
    PWD_MIN_LENGTH: 3,
    PWD_MAX_LENGTH: 20,
    MD5_MAX_LENGTH_INNER: 15,
    MD5_MAX_LENGTH_OUTER: 20,
    MD5_MAX_LENGTH_TMP: 20,

    //验证码项目地址
    CODE_URL: "https://code.kongkongye.com",

    KEY_LOGIN_USER: "LoginUser",
    LOGIN_TOKEN_KEY: "LoginToken",
    LOGIN_INVALID: "LoginInvalid",

    //当前绑定
    //主要用来检测从绑定进入页面时,是否已经更换了绑定使用的账号,如果更换了,则清除本地登录信息
    CURRENT_BIND: "current_bind",
    
    //响应码对应的信息
    CODE_MSGS: {
        2: "请求有问题!",
        5: "需要登录!",
        6: "未登录",
        10: "登录失败!",
        11: "需要未登录!",
        12: "验证码错误!",
        13: "验证码已过期!",
        14: "未设置密码,无法用密码登录!",
        20: "用户名格式错误!",
        21: "用户名大小写不匹配!(请改为{realName})",
        22: "密码错误!",
        23: "邮箱错误!",
        24: "用户名已经存在!",
        25: "用户不存在!",
        30: "IP为空异常!",
        31: "网页已经过期了,请在公众号内重新请求链接!",
        32: "绑定类型不存在!",
        40: "此微信绑定账号已经达到上限{max}!"
    },

    //已经登录后禁止访问的网页(用location.pathname来检测匹配)
    //true表示禁止访问,false或不写表示不禁止访问
    HAS_LOGIN_BAN_PAGES: {
        "/bind/login.html": true,
        "/bind/register.html": true,
        "/login/login.html": true,
        "/register/register.html": true
    }
};