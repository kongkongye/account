//数组filter的polyfill
if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun/*, thisArg*/) {
        'use strict';

        if (this === void 0 || this === null) {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];

                // NOTE: Technically this should Object.defineProperty at
                //       the next index, as push can be affected by
                //       properties on Object.prototype and Array.prototype.
                //       But that method's new, and collisions should be
                //       rare, so use the more-compatible alternative.
                if (fun.call(thisArg, val, i, t)) {
                    res.push(val);
                }
            }
        }

        return res;
    };
}

var MD5 = function (msg, maxLength) {
    var result = SparkMD5.hash(msg);
    if (result.length > maxLength) result = result.substr(0, maxLength);
    return result;
};

/**
 * 获取url变量
 * @param name 变量名
 */
var getUrlParam = function(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    else return null;
};

/**
 * 跳转到指定url
 * @param rest 是否rest接口,是的话会加上rest域名前缀
 */
var nav = function (url, rest) {
    window.location.href = rest?URL+url:url;
};
/**
 * ajax get请求指定url
 * @param rest 是否rest接口,是的话会加上rest域名前缀
 * @return jqXHR
 */
var sendGet = function (url, data) {
    return sendAjax("GET", url, data, rest);
};
/**
 * ajax post请求指定url
 * @param rest 是否rest接口,是的话会加上rest域名前缀
 * @return jqXHR
 */
var sendPost = function (url, data) {
    return sendAjax("POST", url, data);
};
/**
 * 请求指定url
 * @param rest 是否rest接口,是的话会加上rest域名前缀
 * @param data 可选
 * @return jqXHR
 */
var sendAjax = function (method, url, data) {
    return $.ajax({
        method: method,
        url: URL+url,
        data: data?data:{}
    });
};

/**
 * 存储
 * @type {{get, set, del}}
 */
var Store = (function () {
    /**
     * @param local 是否永久存储,默认是session存储
     */
    var getStore = function (key, local) {
        if (local) return window.localStorage[key];
        else return window.sessionStorage[key];
    };

    /**
     * @param local 是否永久存储,默认是session存储
     */
    var setStore = function (key, value, local) {
        if (local) window.localStorage[key] = value;
        else window.sessionStorage[key] = value;
    };

    var setAllStore = function (key, value) {
        window.localStorage[key] = value;
        window.sessionStorage[key] = value;
    };

    /**
     * @param local 是否永久存储,默认是session存储
     */
    var delStore = function (key, local) {
        if (local) delete window.localStorage[key];
        else delete window.sessionStorage[key];
    };

    var delAllStore = function (key) {
        delete window.localStorage[key];
        delete window.sessionStorage[key];
    };

    return {
        get: getStore,
        set: setStore,
        setAll: setAllStore,
        del: delStore,
        delAll: delAllStore
    };
})();

/**
 * 顶端提示
 * @type {{set, show, clear}}
 */
var TopTip = (function () {
    var TOP_TIP_KEY = "TopTip";
    var TOP_TIP_LEVEL_KEY = "TopTipLevel";
    var TOP_TIP_LEVELS = {
        success: "tt_success",
        info: "tt_info",
        warn: "tt_warn",
        error: "tt_error"
    };
    $(document).ready(function () {
        $("body").append('<div id="toptip" class="weui_toptips js_tooltips"></div>');
        $("body").click(function () {
            clearTopTip();
        });
        //检测初始显示文字提示
        var msg = Store.get(TOP_TIP_KEY);
        if (msg) TopTip.show(msg, Store.get(TOP_TIP_LEVEL_KEY));
        //无论如何,删除提示
        Store.del(TOP_TIP_KEY);
        Store.del(TOP_TIP_LEVEL_KEY);
    });
    /**
     * 设置顶端提示
     */
    var setTopTip = function (msg, level) {
        Store.set(TOP_TIP_KEY, msg);
        Store.set(TOP_TIP_LEVEL_KEY, level);
    };
    /**
     * @param msg 提示信息
     * @param level 可选,'error'
     */
    var showTopTip = function (msg, level) {
        //文字
        var topTip = $("#toptip");
        topTip.text(msg);
        //等级
        for (var i in TOP_TIP_LEVELS) topTip.removeClass(TOP_TIP_LEVELS[i]);//先清
        if (level) {//再加
            var cls = TOP_TIP_LEVELS[level];
            if (cls) topTip.addClass(cls);
        }
        //显示
        topTip.addClass("block");
    };
    var clearTopTip = function () {
        $("#toptip").removeClass("block");
    };

    return {
        set: setTopTip,
        show: showTopTip,
        clear: clearTopTip
    }
})();

/**
 * 等待
 */
var Wait = (function () {
    var waits = [];

    setInterval(function () {
        waits = waits.filter(function (item) {
            if (--item.left <= 0) {
                hide(item);
                //回调
                if (item.callback) item.callback(item);
                return false;
            }else {
                show(item);
                return true;
            }
        });

        // $.each(waits, function (index, item) {
        //     if (--item.left <= 0) {
        //         waits[index] = undefined;
        //         hide(item);
        //         //回调
        //         if (item.callback) item.callback(item);
        //     }else show(item);
        // });
    }, 1000);

    /**
     * 添加等待
     * @param id 唯一ID,用来比较删除旧元素
     * @param selector 要设置disabled状态的元素,可以为null或空
     * @param waitSelector 显示等待的元素
     * @param time 等待的时间,单位秒
     * @param callback 回调方法,会传入整个wait元素,可以为null
     */
    var add = function (id, selector, waitSelector, time, callback) {
        //删除旧的
        waits = waits.filter(function (item) {
            return item.id !== id;
        });

        selector = selector?$(selector):null;
        waitSelector = $(waitSelector);

        //设置disabled
        if (selector) {
            selector.attr("disabled", "disabled");
            selector.addClass("weui_btn_disabled");
        }
        //添加缓存
        var wait = {
            id: id,
            selector: selector,
            waitSelector: waitSelector,
            left: time,
            callback: callback
        };
        waits.push(wait);
        //显示
        show(wait);
    };

    /**
     * 显示等待时间
     * @param wait waits里保存的等待信息元素
     */
    var show = function (wait) {
        wait.waitSelector.removeClass("hide");
        wait.waitSelector.text(wait.left);
    };
    /**
     * 隐藏等待时间显示
     * @param wait waits里保存的等待信息元素
     */
    var hide = function (wait) {
        if (wait.selector) {
            wait.selector.removeAttr("disabled");
            wait.selector.removeClass("weui_btn_disabled");
        }
        wait.waitSelector.addClass("hide");
    };

    return {
        add: add
    };
})();

//===== (本地)登录 =====
var Login = (function () {
    var local = !!Store.get(Constants.CURRENT_BIND, true);

    /**
     * 检测是否已登录
     * @returns {boolean}
     */
    var isLogin = function () {
        return !!getLoginToken();
    };

    /**
     * 获取保存在本地的登录token
     * @return 无登录信息返回null
     */
    var getLoginToken = function () {
        return Store.get(Constants.LOGIN_TOKEN_KEY, local);
    };

    /**
     * 获取保存在本地的命令用户信息
     * @return {{}} json形式的,无登录信息返回null
     */
    var getLoginUser = function () {
        var loginUser = Store.get(Constants.KEY_LOGIN_USER, local);
        if (loginUser) return JSON.parse(loginUser);
        else return null;
    };

    /**
     * 设置登录
     * 保存登录信息到本地
     * @param token 登录token
     * @param user 可以是json对象或json字符串
     */
    var setLogin = function (token, user) {
        //先清除
        clearLogin();
        //再设置
        Store.set(Constants.LOGIN_TOKEN_KEY, token, local);
        Store.set(Constants.KEY_LOGIN_USER, $.isPlainObject(user)?JSON.stringify(user):user, local);
    };

    /**
     * 清除登录
     */
    var clearLogin = function () {
        Store.delAll(Constants.LOGIN_TOKEN_KEY);
        Store.delAll(Constants.KEY_LOGIN_USER);
    };

    return {
        isLogin: isLogin,
        getLoginToken: getLoginToken,
        getLoginUser: getLoginUser,
        set: setLogin,
        clear: clearLogin
    };
})();

//加载框
var Loading = (function () {
    var dom = $(
        '<div id="loadingToast" class="weui_loading_toast hide">'+
        '<div class="weui_mask_transparent"></div>'+
        '<div class="weui_toast">'+
        '<div class="weui_loading">'+
        '<div class="weui_loading_leaf weui_loading_leaf_0"></div>'+
        '<div class="weui_loading_leaf weui_loading_leaf_1"></div>'+
        '<div class="weui_loading_leaf weui_loading_leaf_2"></div>'+
        '<div class="weui_loading_leaf weui_loading_leaf_3"></div>'+
        '<div class="weui_loading_leaf weui_loading_leaf_4"></div>'+
        '<div class="weui_loading_leaf weui_loading_leaf_5"></div>'+
        '<div class="weui_loading_leaf weui_loading_leaf_6"></div>'+
        '<div class="weui_loading_leaf weui_loading_leaf_7"></div>'+
        '<div class="weui_loading_leaf weui_loading_leaf_8"></div>'+
        '<div class="weui_loading_leaf weui_loading_leaf_9"></div>'+
        '<div class="weui_loading_leaf weui_loading_leaf_10"></div>'+
        '<div class="weui_loading_leaf weui_loading_leaf_11"></div>'+
        '</div>'+
        '<p id="loadingContent" class="weui_toast_content">加载中</p>'+
        '</div>'+
        '</div>');

    var loadingContent = null;

    /**
     * 显示加载框
     * @param msg 要显示的内容
     */
    var show = function (msg) {
        if (loadingContent) loadingContent.text(msg);
        dom.removeClass("hide");
    };

    var hide = function () {
        dom.addClass("hide");
    };

    $(document).ready(function () {
        $("body").append(dom);
        loadingContent = $("#loadingContent");
    });

    return {
        show: show,
        hide: hide
    };
})();

//===== 错误显示 =====
/**
 * 显示错误
 * @param selector 错误显示元素选择器
 * @param errorMsg 错误信息
 */
var showError = function (selector, errorMsg) {
    $(selector).text(errorMsg);
    $(selector).removeClass("hide");
};
/**
 * 清除错误
 * @param selector 错误显示元素选择器
 */
var clearError = function (selector) {
    $(selector).addClass("hide");
};

/**
 * 检测是否是合法的用户名
 * 用户名不为空并且符合正则的情况下返回true
 * @param name
 * @returns {*|Array|{index: number, input: string}}
 */
var isValidName = function (name) {
    return name && name.match(/^[a-zA-Z_][a-zA-Z0-9_]{0,14}$/);
};

/**
 * 检测是否是合法的密码
 * 密码不为空并且长度符合的情况下返回true
 * @param pwd
 * @returns {*|boolean}
 */
var isValidPwd = function (pwd) {
    return pwd && pwd.length >= Constants.PWD_MIN_LENGTH && pwd.length <= Constants.PWD_MAX_LENGTH;
};

//当前绑定
//绑定登录使用永久存储localStorage(即假定绑定登录是安全的,本地登录token可以永久保留)
//非绑定登录使用会话存储sessionStorage
(function () {
    var current_bind = getUrlParam("current_bind");
    var oldBind = Store.get(Constants.CURRENT_BIND, true);

    if (current_bind) {
        if (oldBind) {
            if (current_bind != oldBind) {
                Login.clear();
            }
        }
        //始终设置成最新的
        Store.set(Constants.CURRENT_BIND, current_bind, true);
    }
})();

//注册通用ajax处理器
$(document).ajaxSend(function (e, jqXHR) {
    var token = Login.getLoginToken();
    if (token) jqXHR.setRequestHeader(Constants.LOGIN_TOKEN_KEY, token);
});
$(document).ajaxComplete(function(e, jqXHR) {
    //隐藏可能的加载框
    Loading.hide();

    //(通过响应头)检测会话失效
    if (Login.isLogin()) {
        var isLoginInvalid = jqXHR.getResponseHeader(Constants.LOGIN_INVALID) == "yes";
        if (isLoginInvalid) {
            //删除登录信息
            Login.clear();
            //设置提示
            TopTip.set("会话已经失效!", "warn");
            //重载
            window.location.reload();
        }
    }
});

//===== (密码)查看按钮 =====
//把eye-holder加到input元素(或其父元素)的class内即可自动添加按钮
$(document).ready(function () {
    $(".eye-holder").each(function (i, e) {
        var input = $("input", e);
        var eye = $('<i class="weui_cell_hd fa fa-eye fa-fw l-icon-eye" aria-hidden="true"></i>');
        if ($(e).hasClass("eye-holder-lg")) eye.addClass("fa-lg");
        //注册查看按钮点击事件
        eye.click(function () {
            if (input.prop("type") == "password") {
                input.prop("type", "text");
                eye.removeClass("fa-eye");
                eye.addClass("fa-eye-slash");
            }else {
                input.prop("type", "password");
                eye.addClass("fa-eye");
                eye.removeClass("fa-eye-slash");
            }
        });
        //添加
        $(e).after(eye);
    });
});

//===== 删除按钮 =====
//把del-holder加到input元素(或其父元素)的class内即可自动添加按钮
$(document).ready(function () {
    $(".del-holder").each(function (i, e) {
        var input = $("input", e);
        var del = $('<i class="weui_cell_hd fa fa-times-circle fa-fw l-icon-del hide" aria-hidden="true"></i>');
        //输入框有内容就隐藏删除按钮
        input.keyup(function () {
            if (input.val()) del.removeClass("hide");
        });
        //注册删除按钮点击事件
        del.click(function () {
            del.addClass("hide");
            //值清空
            input.val("");
            //触发值改变事件
            input.trigger($.Event("change"));
        });
        //添加
        $(e).after(del);
    });
});

//已登录后禁止访问的网页
$(document).ready(function () {
    if (Login.isLogin()) {
        var path = location.pathname;
        if (Constants.HAS_LOGIN_BAN_PAGES[path]) {
            TopTip.set("已登录,自动跳转到首页!", "warn");
            nav("/index/index.html");
        }
    }
});