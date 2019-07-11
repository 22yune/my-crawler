define("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/userService/getData.js", function (e, t, a) {
    "use strict";
    var c = e("function-widget-1:shareDir/context.js").getContext(), n = e("base:widget/libs/jquerypacket.js"),
        r = function (e) {
            n.ajax({
                type: e.type || "get",
                url: e.url,
                dataType: e.dataType || "json",
                timeout: 3e3,
                data: n.extend(e.data, {t: (new Date).getTime()}),
                success: function (t) {
                    var a = null;
                    try {
                        a = n.parseJSON(t) || t
                    } catch (c) {
                    }
                    0 === a.errno ? "function" == typeof e.succCallback && e.succCallback.call(e.succCallback, a) : i(e.failCallback, a)
                }
            }).error(function (t) {
                var a = null, c = null;
                t && (a = t.error_code, c = t.responseText);
                try {
                    c = n.parseJSON(t.responseText)
                } catch (r) {
                }
                i(e.failCallback, c)
            })
        }, i = function (e, t) {
            "function" == typeof e ? e.call(e, t) : (disk.DEBUG && console.log(""), c.ui.tip({
                mode: "caution",
                msg: "网络错误，请稍候重试"
            }))
        };
    a.exports = r
});
;define("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/userService/searchUserService.js", function (e, i, r) {
    "use strict";
    var c = e("function-widget-1:shareDir/context.js").getContext(),
        o = e("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/userService/getData.js"),
        a = e("base:widget/libs/jquerypacket.js"), t = function (e) {
            this.query = e.query, this.verifyCancelFunc = e.verifyCancelFunc, this.whenVerifyCodeDialog = e.whenVerifyCodeDialog, this.searchSuccFunc = e.searchSuccFunc, this.searchFailFunc = e.searchFailFunc, this.hasError = !1, this.flagFirst = !0, this.vcode = null, this.input = null, this.$shareDailog = a("#share")
        };
    t.SEARCH_RUL = "/api/user/search", t.prototype.searchUser = function () {
        this.flagFirst === !0 && c.ui.tip({mode: "loading", msg: "正在搜索用户", autoClose: !1});
        var e = this, i = {};
        i = null === e.vcode && null === e.input ? e.query : a.extend(e.query, {
            input: e.input,
            vcode: e.vcode
        }), o({
            url: t.SEARCH_RUL, data: i, succCallback: function (i) {
                e.flagFirst = !0, c.ui.hideTip(), "function" == typeof e.searchSuccFunc && e.searchSuccFunc.call(e.searchSuccFunc, i)
            }, failCallback: function (i) {
                var r = "网络错误，请稍候重试";
                c.ui.hideTip(), i && -19 === i.errno ? (e.isVerifyCode && (e.hasError = !0), e.showVerifyDialog(i.img, i.vcode)) : (i && -80 === i.errno && (r = "朋友虽好，可别贪多。明天再来搜吧"), c.ui.tip({
                    mode: "caution",
                    msg: r
                }), "function" == typeof e.searchFailFunc && e.searchFailFunc.call(e.searchFailFunc, i))
            }
        })
    }, t.prototype.showVerifyDialog = function (i, r) {
        var c = this, o = {img: i, vcode: r};
        e.async("function-widget-1:shareDir/util/dialogControl/dialogControl.js", function (e) {
            e.show({
                dialogName: "verifyCode",
                img: o.img,
                vcode: o.vcode,
                initErrText: c.hasError ? "验证码错误" : "",
                confirmCallback: function (e) {
                    c.vcode = e.vcode, c.input = e.input, c.isVerifyCode = !0, c.searchUser()
                }
            })
        }), "function" == typeof c.whenVerifyCodeDialog && c.whenVerifyCodeDialog.call(c.whenVerifyCodeDialog)
    }, r.exports = t
});
;define("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/userService/addFriendService.js", function (e, i, r) {
    "use strict";
    var o = e("function-widget-1:shareDir/context.js").getContext(), n = e("base:widget/libs/jquerypacket.js"),
        a = e("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/userService/getData.js"),
        c = function (e) {
            this.member = e.member, this.verifyCancelFunc = e.verifyCancelFunc, this.whenVerifyCodeDialog = e.whenVerifyCodeDialog, this.addSuccFunc = e.addSuccFunc, this.hasError = !1, this.flagFirst = !0, this.vcode = null, this.input = null, this.$shareDailog = n("#share")
        };
    c.ADD_FOLLOW = "/mbox/relation/addfollow", c.prototype.addFollow = function () {
        var e = this, i = {};
        i = null === e.vcode && null === e.input ? {uk: e.member.uk, type: "normal"} : {
            uk: e.member.uk,
            type: "normal",
            input: e.input,
            vcode: e.vcode
        }, a({
            url: c.ADD_FOLLOW, data: i, succCallback: function (i) {
                e.flagFirst = !0, "function" == typeof e.addSuccFunc ? e.addSuccFunc.call(e.addSuccFunc, i) : o.ui.tip({
                    mode: "success",
                    msg: "添加好友成功"
                })
            }, failCallback: function (i) {
                var r = o.accountBan(i.errno);
                if (r.isBan) return !1;
                var n = o.errorMsg(i.errno, "网络错误，请稍候重试"), a = !0, c = !1;
                if (i && -19 === i.errno) e.isVerifyCode && (e.hasError = !0), e.showVerifyDialog(i.img, i.vcode); else {
                    if (i) {
                        var t = i.errno;
                        switch (t) {
                            case 2117:
                                n = "好友超出限制了";
                                break;
                            case 2118:
                                n = "已经是好友";
                                break;
                            case 2115:
                                n = "不能添加自己为好友";
                                break;
                            default:
                                e.flagFirst || "function" != typeof e.verifyCancelFunc || e.verifyCancelFunc.call(e.verifyCancelFunc)
                        }
                    } else e.flagFirst || "function" != typeof e.verifyCancelFunc || e.verifyCancelFunc.call(e.verifyCancelFunc);
                    o.ui.tip({mode: "caution", msg: n, autoClose: a, hasClose: c})
                }
            }
        })
    }, c.prototype.showVerifyDialog = function (i, r) {
        var o = this, n = {img: i, vcode: r};
        e.async("function-widget-1:shareDir/util/dialogControl/dialogControl.js", function (e) {
            e.show({
                dialogName: "verifyCode",
                img: n.img,
                vcode: n.vcode,
                initErrText: o.hasError ? "验证码错误" : "",
                confirmCallback: function (e) {
                    o.vcode = e.vcode, o.input = e.input, o.isVerifyCode = !0, o.addFollow()
                }
            })
        }), "function" == typeof o.whenVerifyCodeDialog && o.whenVerifyCodeDialog.call(o.whenVerifyCodeDialog)
    }, r.exports = c
});
;define("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/searchFriend/searchResult.tpl.js", function (s, a, e) {
    "use strict";
    var p = [];
    p.push('<!--<p class="search-init">搜索结果<span id="searchBack" class="search-back">返回</span></p>-->'), p.push('<div class="search-result-area global-clearfix">'), p.push("<%if(data.records.length === 0 || !data.records) {%>"), p.push('<p class="search-no-result">没有找到你搜索的用户，检查下输入的帐号吧</p>'), p.push("<%} else {%>"), p.push("<%var item = data.records.shift()%>"), p.push('<p class="info-row">'), p.push('<a class="search-avatar" href="javascript:;">'), p.push('<img src="<%-item.avatar_url%>" width="52" height="52">'), p.push("</a>"), p.push("</p>"), p.push('<p class="info-row">'), p.push("<label>昵称：</label>"), p.push("<%if (item.remark) {%>"), p.push("<span><%-item.remark%></span>"), p.push("<%} else if (item.nick_name){%>"), p.push("<span><%-item.nick_name%></span>"), p.push("<%} else if (item.uname){%>"), p.push("<span><%-item.uname%></span>"), p.push("<%}%>"), p.push("</p>"), p.push('<p class="info-row info-row-gray">'), p.push("<label>百度帐号：</label>"), p.push('<span"><%-item.uname%></span>'), p.push("<%if(item.uk == myUk){%>"), p.push("<span>(自己)</span>"), p.push("<%} else if(item.follow_flag == 1){%>"), p.push("<span>(已是好友)</span>"), p.push("<%}%>"), p.push("</p>"), p.push("<%if(item.uk == myUk){%>"), p.push("<%}else if(item.follow_flag == 1){%>"), p.push('<div class="search-btn-area">'), p.push('<a class="g-button g-button-blue search-friend-btn sbtn" node-type="search-receiver-btn"><span class="g-button-right" style="padding-right:75px;"><span class="text">共享给TA</span></span></a>'), p.push("</div>"), p.push("<%}else{%>"), p.push('<div class="search-btn-area">'), p.push('<a class="g-button g-button-blue search-add-btn sbtn" node-type="search-add-btn"><span class="g-button-right" style="padding-right:75px;"><span class="text">加为好友</span></span></a>'), p.push("</div>"), p.push("<%}%>"), p.push("<%}%>"), e.exports = p.join("\n")
});
;define("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/userService/createGroupService.js", function (e, r, i) {
    "use strict";
    var a = e("function-widget-1:shareDir/context.js").getContext(), n = e("base:widget/libs/jquerypacket.js"),
        t = e("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/userService/getData.js"),
        o = function (e) {
            this.data = e.data, this.verifyCancelFunc = e.verifyCancelFunc, this.whenVerifyCodeDialog = e.whenVerifyCodeDialog, this.addSuccFunc = e.addSuccFunc, this.addFailFunc = e.addFailFunc, this.hasError = !1, this.flagFirst = !0, this.vcode = null, this.input = null, this.$shareDailog = n("#share")
        };
    o.createGroupUrl = "/mbox/group/create", o.prototype.createGroup = function () {
        var e = this, r = {};
        r = null === e.vcode && null === e.input ? e.data : n.extend(e.data, {
            input: e.input,
            vcode: e.vcode
        }), t({
            url: o.createGroupUrl, data: r, succCallback: function (r) {
                e.flagFirst = !0, "function" == typeof e.addSuccFunc ? e.addSuccFunc.call(e.addSuccFunc, r) : a.ui.tip({
                    mode: "sucess",
                    msg: "创建群组成功"
                })
            }, failCallback: function (r) {
                var i = r.errno, n = a.accountBan(i);
                if (n.isBan) return !1;
                var t = a.errorMsg(r.errno, "网络错误，请稍候重试"), o = !0, c = !1;
                r && -19 === r.errno ? (e.isVerifyCode && (e.hasError = !0), "function" == typeof e.whenVerifyCodeDialog && e.whenVerifyCodeDialog.call(e.whenVerifyCodeDialog, r)) : "function" == typeof e.addFailFunc ? e.addFailFunc.call(e.addFailFunc, r) : (r && 2101 === r.errno ? t = "你已达到创建2000群上限" : r && 2100 === r.errno ? t = "用户都已经被添加过" : r && 2119 === r.errno ? t = "群成员已满" : r && -60 === r.errno ? t = "群成员超过上限" : r && -20 === r.errno ? t = "获取验证码失败" : r && -73 === r.errno && (t = "创建群个数超过上限"), a.ui.tip({
                    mode: "caution",
                    msg: t,
                    autoClose: o,
                    hasClose: c
                }))
            }
        })
    }, i.exports = o
});
;define("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/shareNameInput.js", function (e, t, a) {
    var i = e("base:widget/libs/jquerypacket.js"), n = function (e, t) {
        var a = this;
        a.delimiter = /[;,；，]/gi, a.el = e, a.tapType = t, a.el.empty(), a.el.append('<div id="nameCards" class="name-cards"></div><input id="inputText" class="input-text" type="text" value="请输入或选择百度用户名" />'), a.input = a.el.find("#inputText"), a.nameCards = a.el.find("#nameCards"), a.userCount = 0, a.phoneCount = 0, a.mailCount = 0, a.lastLineTop = 0, a.userList = {}, a.phoneList = {}, a.mailList = {}
    };
    n.prototype = {
        render: function () {
            var e = this;
            e.inputWidth = e.el.width() - 20, e.input.css({width: e.inputWidth}).val(e.inputTips()), e.nameCards.bind("click", function () {
                e.input.focus(), e.el.addClass("focus")
            }), e.input.bind("keyup", function (t) {
                if (59 == t.which || 186 == t.which || 188 == t.which) {
                    var a = e.getNameList();
                    if (a.length) for (var i = 0, n = a.length; n > i; i++) a[i] && e.addCard({
                        id: "card-" + parseInt(Math.random() * Math.pow(10, 10) + 1),
                        name: a[i]
                    });
                    e.input.val("")
                }
            }).bind("keydown", function (t) {
                if (32 == t.which || 13 == t.which) {
                    var a = e.getNameList();
                    if (a.length) for (var n = 0, s = a.length; s > n; n++) a[n] && e.addCard({
                        id: "card-" + parseInt(Math.random() * Math.pow(10, 10) + 1),
                        name: a[n]
                    })
                }
                return 8 == t.which && "" == e.getNameList()[0] && i(".share-name-item").length > 0 ? (e.removeCard({elem: i(".share-name-item").last()}), !0) : void 0
            }).bind("blur", function () {
                var t = e.getNameList();
                if (t.length) for (var a = 0, n = t.length; n > a; a++) t[a] && e.addCard({
                    id: "card-" + parseInt(Math.random() * Math.pow(10, 10) + 1),
                    name: t[a]
                });
                0 == e.input.val().length && 0 == i(".share-name-item").length ? (e.input.val(e.inputTips()), e.input.css("color", "#999")) : e.input.val(""), e.el.removeClass("focus")
            }).bind("focus", function () {
                e.input.val() == e.inputTips() && e.input.val(""), e.input.css("color", "#333")
            }), e.el.bind("click", function () {
                e.input.val("").focus(), e.el.addClass("focus")
            }), e.el.off("click", ".remove-name").on("click", ".remove-name", function () {
                return e.removeCard({elem: i(this).closest(".share-name-item")}), !0
            })
        }, getTapType: function (e) {
            var t = this;
            t.tapType = e
        }, getUser: function (e) {
            var t = this;
            i.ajax({
                url: "/inbox/friend/queryuser",
                data: {query_uname: '{"' + e.name + '":0}'},
                type: "GET",
                context: e.id,
                dataType: "json",
                success: function (a) {
                    var n = i("#" + this.toString());
                    0 == a.errno ? i.each(a.user_list, function (a, s) {
                        if (s.wangpan_user) if (t.userList[s.uk]) {
                            n.remove();
                            var r = i('.share-name-item[uname="' + e.name + '（合作用户）"]');
                            r.addClass("blue"), setTimeout(function () {
                                r.removeClass("blue")
                            }, 1e3)
                        } else n.attr("uk", s.uk), t.userList[s.uk] = {
                            uk: s.uk,
                            name: s.uname
                        }, t.userCount += 1, t.getUserList.call(t, t.userList, t.userCount); else n.addClass("red"), t.hintShow.call(t, "以下红色显示的不是网盘用户，检查一下吧")
                    }) : (n.addClass("red"), t.hintShow.call(t, "以下红色显示的不是网盘用户，检查一下吧"))
                },
                error: function (e) {
                    e.errno || console.log("error : " + e)
                }
            })
        }, getNameList: function () {
            var e = this;
            return i.trim(e.input.val()).split(e.delimiter)
        }, addCard: function (e, t) {
            var a = this, n = !0, t = t || !1;
            if (e.name == a.inputTips()) return a.input.val(""), !0;
            i(".share-name-item.red").length ? a.hintShow.call(a, "以下红色显示的不是网盘用户，检查一下吧") : a.hintHide.call(a);
            var s = e.id ? 'id="' + e.id + '"' : "", r = e.mail || e.phone ? "(" + (e.mail || e.phone) + ")" : "";
            card = i('<a class="share-name-item" ' + s + ' href="javascript:;" hidefocus="hideFocus" uname="' + e.name + '"><span class="name">' + e.name + r + '</span><span class="remove-name"></span></a>');
            var o = function (e) {
                n = !1;
                var t = "";
                switch (a.tapType) {
                    case"friend":
                        t = i('.share-name-item[uname="' + e + '"]');
                        break;
                    case"phone":
                        t = i('.share-name-item[phone="' + e + '"]');
                        break;
                    case"mail":
                        t = i('.share-name-item[mail="' + e + '"]')
                }
                t.addClass("blue"), setTimeout(function () {
                    t.removeClass("blue")
                }, 1e3)
            };
            if (disk.DEBUG && console.log("t.userCount----------------" + a.userCount + "\n"), "friend" == a.tapType) if (a.userCount < 5) {
                if (!t) for (var u in a.userList) (a.userList[u].name == e.name || a.userList[u].uk == e.uk) && o(e.name);
                n && (a.nameCards.append(card), a.input.val("").focus(), e.uk ? (a.userList[e.uk] = e, a.userCount += 1, card.attr("uk", e.uk), a.getUserList.call(a, a.userList, a.userCount)) : a.getUser(e), a._reSize())
            } else a.userCount >= 5 && a.hintShow.call(a, "最多只能选5个好友分享"); else "phone" == a.tapType ? a.phoneCount < 5 ? (t || (a.phoneList[e.phone] || a.phoneList[e.name]) && o(e.phone || e.name), n && (a.nameCards.append(card), a.input.val("").focus(), /^(\+86)?\s*0?1[3-8]\d[\s\-]?\d{4}[\s\-]?\d{4}$/.test(e.phone || e.name) ? (a.phoneList[e.phone || e.name] = e, a.phoneCount += 1, card.attr("phone", e.phone || e.name), a.getUserList.call(a, a.phoneList, a.phoneCount)) : (card.addClass("red"), a.hintShow.call(a, "以下红色显示的手机号不正确，检查一下吧")), a._reSize())) : a.phoneCount >= 5 && a.hintShow.call(a, "最多只能选5个手机用户") : "mail" == a.tapType && (a.mailCount < 5 ? (t || (a.mailList[e.mail] || a.mailList[e.name]) && o(e.mail || e.name), n && (a.nameCards.append(card), a.input.val("").focus(), /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(e.mail || e.name) ? (a.mailList[e.mail || e.name] = e, a.mailCount += 1, card.attr("mail", e.mail || e.name), a.getUserList.call(a, a.mailList, a.mailCount)) : (card.addClass("red"), a.hintShow.call(a, "以下红色显示的邮箱不正确，检查一下吧")), a._reSize())) : a.mailCount >= 5 && a.hintShow.call(a, "最多只能选5个邮箱用户"))
        }, removeCard: function (e) {
            var t = this;
            if ("friend" == t.tapType) {
                var a = e.uk || e.elem.attr("uk"), n = e.elem || i('.share-name-item[uk="' + e.uk + '"]');
                a && (t.userList[a] && (delete t.userList[a], t.userCount -= 1), t.getUserList.call(t, t.userList, t.userCount))
            } else if ("phone" == t.tapType) {
                var s = e.phone || e.elem.attr("phone"), n = e.elem || i('.share-name-item[phone="' + e.phone + '"]');
                s && (t.phoneList[s] && (delete t.phoneList[s], t.phoneCount -= 1), t.getUserList.call(t, t.phoneList, t.phoneCount))
            } else if ("mail" == t.tapType) {
                var r = e.mail || e.elem.attr("mail"), n = e.elem || i('.share-name-item[mail="' + e.mail + '"]');
                r && (t.mailList[r] && (delete t.mailList[r], t.mailCount -= 1), t.getUserList.call(t, t.mailList, t.mailCount))
            }
            n.remove(), i(".share-name-item.red").length ? t.hintShow.call(t, "以下红色显示的不是网盘用户，检查一下吧") : t.hintHide.call(t), t._reSize()
        }, _getPosition: function () {
            if (!i(".share-name-item").length) return !1;
            var e = i(".share-name-item").last(), t = e.position();
            return {left: t.left, width: i(e).width()}
        }, _reSize: function () {
            var e = this, t = e._getPosition();
            if (t) {
                var a = t.left + t.width + 12;
                a + 50 > e.inputWidth && (a = 3)
            } else var a = 3;
            e.input.width(e.inputWidth - a);
            var i = e.input.position().top;
            i != e.lastLineTop && (e.lastLineTop = i, e.heightChange(i + 28))
        }, restore: function () {
            var e = this;
            e.nameCards.empty(), e.input.val(e.inputTips()), e.input.css("color", "#999"), e.userCount = 0, e.phoneCount = 0, e.mailCount = 0, e.userList = {}, e.phoneList = {}, e.mailList = {}, e._reSize()
        }, inputTips: function () {
            var e = this, t = "请输入百度帐号/邮箱添加好友";
            switch (e.tapType) {
                case"friend":
                    t = "请输入百度帐号/邮箱添加好友";
                    break;
                case"phone":
                    t = "请输入或选择手机号码";
                    break;
                case"mail":
                    t = "请输入或选择邮件地址"
            }
            return t
        }, changeTab: function (e) {
            var t, a = this;
            switch (a.nameCards.empty(), a.tapType = e, a.userCount = 0, a.phoneCount = 0, a.mailCount = 0, a.tapType) {
                case"friend":
                    t = a.userList, a.getUserList.call(a, a.userList, a.userCount);
                    break;
                case"phone":
                    t = a.phoneList, a.getUserList.call(a, a.phoneList, a.phoneCount);
                    break;
                case"mail":
                    t = a.mailList, a.getUserList.call(a, a.mailList, a.mailCount)
            }
            for (var i in t) a.addCard(t[i], !0);
            0 === a.nameCards.children().length && (a.input.val(a.inputTips()), a.input.css("color", "#999")), a._reSize()
        }, hintShow: function () {
        }, hintHide: function () {
        }, heightChange: function () {
        }, delSign: function () {
        }, addSign: function () {
        }, getUserList: function () {
        }
    }, n.prototype.constructor = n, a.exports = n
});
;define("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/groupList.js", function (t, i, e) {
    var s = t("base:widget/libs/jquerypacket.js"), n = t("base:widget/libs/underscore.js"),
        a = t("function-widget-1:shareDir/context.js").getContext(), o = function (t) {
            this._list = null, this._showlastListDetail = !1, o.IdPrefix = this._IdPrefix = function () {
                for (var t = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"], i = "", e = 0; 3 > e; e++) {
                    var s = Math.ceil(25 * Math.random());
                    i += t[s]
                }
                return "abc-"
            }(), this._tagsHash = {}, this.parseTitle = null, this.container = t.container, this.iShareSelectedList = t.iShareSelectedList, this.init()
        };
    o.TAG_RECENT = "recent", o.TAG_GROUP = "mboxOfGroup", o.TAG_FRIEND = "mboxOfFriend", o.TIPS_NO_OVER_ONE_CATEGORY = "无法同时选择群主和好友为收件人", o.containerList = [], o.prototype = {
        init: function () {
            for (var t = this, i = 0, e = o.containerList.length; e > i; i++) if (o.containerList[i] === t.container || o.containerList[i][0] === t.container[0]) return;
            o.containerList.push(this.container), this.bindEvent()
        }, bindEvent: function () {
            var t = this;
            this.container.delegate(".title", "click", function (i, e) {
                i.stopPropagation();
                {
                    var n = s(this).parent("li");
                    n.data("customtag")
                }
                if (0 === s(this).find(".number").length && 1 === s(this).next("ul").find("li").length && !t._showlastListDetail) {
                    var a, o, r = n.data("groupid");
                    a = t.findGroup(r), o = s(this).next("ul").find("li").text();
                    for (var l, d = s(this); !l && d.length;) {
                        if (d.data("customtag") && "" !== d.data("customtag")) {
                            l = d.data("customtag");
                            break
                        }
                        d = d.parents("li")
                    }
                    return void t.onListSelected(a, o, l)
                }
                n.find("ul:first").is(":visible") ? (disk.DEBUG && console.log("[LOG FROM GROUPLIST] will send `BeforeGroupOpen` event, customTag: " + n.data("customtag")), t.onBeforeGroupClose(n.data("customtag"), n.find("ul:first>li").length, n.attr("id")), n.find("ul:first").hide().next(".load-more").hide(), n.addClass("on").removeClass("open")) : (disk.DEBUG && console.log("[LOG FROM GROUPLIST] will send `BeforeGroupClose` event, customTag: " + n.data("customtag")), t.onBeforeGroupOpen(n.data("customtag"), n.find("ul:first>li").length, n.attr("id")), e === !0 ? n.find("ul:first").hide() : (n.find("ul:first").show(), n.removeClass("on").addClass("open")), n.find("ul:first>li").length && n.find(".load-more:first").show())
            }), this.container.delegate(".load-more", "click", function () {
                var i = s(this).parent();
                disk.DEBUG && console.log("[LOG FROM GROUPLIST] will send `LoadMore` event, customTag: " + i.data("customtag")), t.onLoadMore(i.data("customtag"), i.find("ul:first>li").length, i.attr("id"))
            }), this.container.delegate("li", "mouseenter", function (t) {
                t.stopPropagation(), 0 !== s(this).find("ul:first").length && s(this).find("ul:first").is(":visible") || s(this).addClass("on")
            }).delegate("li", "mouseleave", function (t) {
                t.stopPropagation(), s(this).removeClass("on")
            }), this.container.delegate("li", "click", function (i) {
                if (i.stopPropagation(), 1 === s(this).find("ul>li").length && !t._showlastListDetail) {
                    var e, n, a, r = s(this).data("groupid");
                    e = t.findGroup(r), n = s(this).find("ul>li").text();
                    for (var l = s(this); !a && l.length;) l.data("customtag") && "" !== l.data("customtag") ? a = l.data("customtag") : l = l.parents("li");
                    return void t.onListSelected(e, n, a)
                }
                if (0 === s(this).find("ul").length) {
                    var e, n, a, r = s(this).data("groupid"), l = s(this), d = l.find(".label");
                    for (void 0 != r ? e = t.findGroup(r) : (r = s(this).parents("li").data("groupid"), e = t.findGroup(r), n = s(this).text()); !a && l.length;) l.data("customtag") && "" !== l.data("customtag") ? a = l.data("customtag") : l = l.parents("li");
                    var u = s(this).data("is-group") === !0 ? o.TAG_GROUP : o.TAG_FRIEND;
                    t._useTips(!1), s(this).hasClass("step-2") ? (u = s(this).parents("li").data("customtag"), t.onListSelected(e, n, u)) : d.hasClass("label-on") === !1 ? t.iShareSelectedList.isCheckSelectedItemOk(u) === !0 && (d.addClass("label-on"), t.iShareSelectedList.stepSelectedItem(e, !0)) : (d.removeClass("label-on"), t.iShareSelectedList.stepSelectedItem(e, !1))
                }
            })
        }, loopDealSelectedItem: function (t, i, e, s) {
            var a = t.gid || t.uk,
                r = ".tree-list>li[data-customtag=" + o.TAG_RECENT + "],.tree-list>li[data-customtag=" + i + "]",
                l = this.container.find(r).find("li[data-uniqueId=" + a + "]"), d = this.findGroupId(o.TAG_FRIEND);
            if (e === !0) {
                if (i === o.TAG_FRIEND && 0 === l.length && s === !1) {
                    var u = this._renderFriendItem(t);
                    this.container.find(".tree-list>li[data-customtag=" + o.TAG_FRIEND + "]").find("ul").prepend(u), this._pushFriend(t)
                }
                i === o.TAG_FRIEND && s === !0 && (n.findWhere(this._list[parseInt(d)].list, {uk: t.uk}) || this._pushFriendData(t)), l.find(".label").addClass("label-on")
            } else l.find(".label").removeClass("label-on")
        }, _pushFriend: function (t) {
            this._pushFriendData(t), this._updateFriendNum()
        }, _pushFriendData: function (t) {
            var i = this.findGroupId(o.TAG_FRIEND);
            this._list[parseInt(i)].list.push(t)
        }, _updateFriendNum: function () {
            var t = this.findGroupId(o.TAG_FRIEND);
            s("#treeList-" + this._IdPrefix + t).find(".title .number").text("(" + this._list[parseInt(t)].list.length + ")")
        }, _removeSelectedIcon: function (t) {
            var i = t.find(".label");
            i.removeClass("label-on")
        }, getFriendGroupId: function () {
            var t = this.findGroupId(o.TAG_FRIEND), i = t + "," + this._list[parseInt(t)].list.length;
            return i
        }, _renderFriendItem: function (t) {
            var i = this.findGroupId(o.TAG_FRIEND), e = t.remark || t.priority_name || t.nick_name || t.uname || "未命名",
                s = '<li id="treeList-' + this._IdPrefix + t.id + '" data-customtag="' + o.TAG_FRIEND + '" data-groupId="' + i + "," + this._list[parseInt(i)].list.length + '" data-is-group="' + !1 + '" data-uniqueId="' + t.uk + '" class="step-1"><div class="label label-on"></div><div class="uinfo" title="' + a.tools.baseService.encodeHTML(e) + '"><img src="' + a.tools.baseService.encodeHTML(t.avatar_url) + '" class="avatar">' + a.tools.baseService.encodeHTML(e) + "</div></li>";
            return s
        }, _useTips: function (t, i) {
            if ("boolean" == typeof t) t ? s(".tips", ".share-dialog").show() : s(".tips", ".share-dialog").hide(); else if (s(".tips", ".share-dialog").show().find("span").html(t), "number" == typeof i) {
                var e = ".share-dialog";
                setTimeout(function () {
                    s(".tips", e).hide()
                }, i)
            }
        }, _render: function (t, i, e, n, a) {
            var r = this, l = this._tagsHash, d = "string" == typeof n && "" != n ? n.split(",").length : 0, u = d,
                h = "", f = i ? n : "";
            a = "number" != typeof a ? 0 : a;
            var c = function (e, n, a) {
                u = "string" == typeof n && "" != n ? n.split(",").length : 0, i && d == u || (h += "<ul>"), s.each(e, function (i, e) {
                    if (u = "" != n ? n.split(",").length : 0, "string" == typeof e || "number" == typeof e) h += '<li class="step-' + u + '">' + e + "</li>"; else if ("object" == typeof e) {
                        if (e.id = "string" == typeof n && n.length > 0 ? n + "," + (i + a) : "" + (i + a), e.customTag && (l[e.customTag] = e.id), "function" == typeof r.parseTitle && r.parseTitle(e), 0 !== u) {
                            var s = !1;
                            t === o.TAG_RECENT ? e.gid && (s = !0) : t === o.TAG_GROUP && (s = !0), h += '<li id="treeList-' + r._IdPrefix + e.id + '" data-customtag="' + (e.customTag ? e.customTag : t) + '" data-groupId="' + e.id + '" data-is-group="' + (s ? !0 : !1) + '" data-uniqueId="' + (e.gid || e.uk) + '" class="step-' + u + '"'
                        } else h += '<li id="treeList-' + r._IdPrefix + e.id + '" data-customtag="' + e.customTag + '" data-groupId="' + e.id + '" class="' + e.customTag + " step-" + u + '"';
                        "[object Array]" === Object.prototype.toString.call(e.list) || "number" == typeof e.allNo ? (e.open && (h += ' style="display:block;"'), h += ">", h += '<div class="title"><em class="icon"></em>' + e.title, e.showNo && (h += "我的邮箱联系人" === e.title || "我的手机联系人" === e.title ? "undefined" == typeof e.allNo ? '<span class="number g-hide js-total"></span>' : '<span class="number g-hide js-total"></span>' : "undefined" == typeof e.allNo ? '<span class="number">(' + (e.list ? e.list.length : 0) + ")</span>" : '<span class="number">(' + e.allNo + ")</span>"), h += "</div>", c(e.list || [], e.id, 0), ("undefined" == typeof e.list || e.list.length < e.allNo) && (e.open && !e.noMore ? h += '<div class="load-more" style="display:block;">加载更多</div>' : e.allNo && !e.noMore && (h += '<div class="load-more" style="display:none;">加载更多</div>'))) : (h += ">", h += e.title), h += "</li>"
                    }
                }), i && d == u || (h += "</ul>"), isFirst = !1
            };
            return c(i ? e : this._list, f, a), h
        }, updateList: function (t, i) {
            if ("string" != typeof i) {
                var e = this.findGroupId(i);
                if ("" !== e && "undefined" != typeof e) {
                    var n = this.findGroup(e), a = n.list;
                    return "[object Array]" === Object.prototype.toString.call(a) && a.length > 0 ? a = t : n.list = t, 1 === s("#treeList-" + this._IdPrefix + e + ">ul").length ? s("#treeList-" + this._IdPrefix + e + ">ul").html(this._render(!0, t, e)) : s("#treeList-" + this._IdPrefix + e).append("<ul>" + this._render(!0, t, e) + "</ul>"), void("number" == typeof n.allNo && s("#treeList-" + this._IdPrefix + e + ">ul>li").length < n.allNo ? s("#treeList-" + this._IdPrefix + e + ">.load-more").show() : s("#treeList-" + this._IdPrefix + e + ">.load-more").remove())
                }
            }
            "[object Array]" === Object.prototype.toString.call(t) && t.length > 0 && (this._list = t, this._tagsHash = {}, this.container.html(this._render()), s("ul:first", this.container).attr({
                id: "treeList-" + this._IdPrefix,
                "class": "tree-list"
            }), this.showFriendList())
        }, showListDetail: function () {
        }, showFriendList: function () {
            this.container.find(".title").eq(2).trigger("click", !0)
        }, insertList: function (t, i) {
            var e = this.findGroupId(i);
            if (e) {
                var n = this.findGroup(e), a = n.list, o = 0;
                "[object Array]" === Object.prototype.toString.call(a) && a.length > 0 ? (o = a.length, n.list = a.concat(t)) : n.list = t, 1 === s("#treeList-" + this._IdPrefix + e + ">ul").length ? s("#treeList-" + this._IdPrefix + e + ">ul").append(this._render(i, !0, t, e, o)) : s("#treeList-" + this._IdPrefix + e).append("<ul>" + this._render(i, !0, t, e) + "</ul>"), "number" == typeof n.allNo && s("#treeList-" + this._IdPrefix + e + ">ul>li").length < n.allNo ? s("#treeList-" + this._IdPrefix + e + ">.load-more").show() : s("#treeList-" + this._IdPrefix + e + ">.load-more").remove()
            } else if ("" == e || "undefined" == typeof e) if (this._list && this._list.length > 0) {
                var o = this._list.length;
                this._list = this._list.concat(t), s("#treeList-" + this._IdPrefix).append(this._render("rim", !0, t, "", o))
            } else console.log("[WARN] the list is null, pls. use the updatelist function")
        }, updateGroupNo: function (t, i) {
            var e = this.findGroupId(t);
            e && s("#treeList" + this._IdPrefix + e).find(".title:first .number").text("(" + i + ")")
        }, findGroupId: function (t) {
            var i;
            return this._tagsHash[t] ? i = this._tagsHash[t] : "string" != typeof t || 1 !== t.length && -1 == t.indexOf(",") || (i = t), i
        }, findGroup: function (t) {
            t += "";
            var i = t.split(","), e = this._list;
            return s.each(i, function (t, i) {
                e = e.list ? e.list[i] : e[i]
            }), e
        }, openGroup: function (t) {
            var i = this.findGroupId(t);
            i && s("#treeList" + this._IdPrefix + i).addClass("open")
        }, setSelected: function () {
        }, onListSelected: function () {
        }, onListCancelSelect: function () {
        }, onLoadMore: function () {
        }, onBeforeGroupOpen: function () {
        }, onBeforeGroupClose: function () {
        }
    }, e.exports = o
});
;define("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/shareSelectedList.js", function (e, i, t) {
    var s = e("base:widget/libs/underscore.js"), n = e("base:widget/libs/jquerypacket.js"),
        d = e("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/groupList.js"),
        s = e("base:widget/libs/underscore.js"), l = e("function-widget-1:shareDir/context.js").getContext(),
        a = function (e) {
            this.$container = e && e.$container, this.iFriendList = e && e.friendList, this.iFriendShare = e && e.iFriendShare, this.$el = n('<div class="selected-box"><p class="title" id="descTitle">已选择<span id="shareNum" class="share-num">0</span>个收件人<span id="defaultSelectedTip" style="display: none;">（默认创建群组）</span></p><ul class="select-list"><div class="none global-center"><span>你还没有选择好友</span></div></ul></div>'), this.$selectedList = this.$el.find(".select-list"), this.$shareNum = this.$el.find("#shareNum"), this.$defaultSelectedTip = this.$el.find("#defaultSelectedTip"), this.dSelectedList = null, this.init()
        };
    a.MAX_SELECTED_GROUP_NUM = 1, a.MAX_SELECTED_FRIEND_NUM = 49, a.singleton = null, a.obtain = function () {
        return null !== a.singleton ? a.singleton : void 0
    }, a.prototype = {
        init: function () {
            this.$container.html(this.$el), this.setSingleton(), this.event()
        }, setSingleton: function () {
            a.singleton = this
        }, setIFriendList: function (e) {
            this.iFriendList = e
        }, setIFriendShare: function (e) {
            this.iFriendShare = e
        }, event: function () {
            var e = this;
            this.$container.delegate('div[node-type="labelBox"]', "click", function () {
                var i = n(this).closest("li.item"), t = i.data("groupid"), s = e.iFriendList.findGroup(t);
                e.stepSelectedItem(s, !1)
            })
        }, stepSelectedItem: function (e, i, t) {
            i === !0 ? this.addSelectedItem(e, t) : this.removeSelectedItem(e), this.stepSelectedNum()
        }, _getItemDom: function () {
            var e = function (e) {
                var i, t = e.length >= 4 ? 4 : e.length, s = "";
                if (0 === t) s += '<img src="/box-static/function-widget-1/share/util/img/_nomd5/default-avatar.png" width="27" height="27" />'; else for (var n = 0; t > n; n++) i = e[n], s += '<img src="' + l.tools.baseService.encodeHTML(i.photo) + '" class="img-' + (n + 1) + '"/>';
                return '<div class="img-box img-box-' + t + ' g-clearfix">' + s + "</div>"
            };
            return function (i) {
                if (i.gid) return '<li data-uniqueid="' + (i.gid || i.uk) + '" data-groupid="' + i.id + '" class="item"><div class="label-box" node-type="labelBox"><div class="label label-dis"></div></div><div class="uinfo g-clearfix" title="' + l.tools.baseService.encodeHTML(i.name || i.dn || "未命名") + '">' + e(i.photoinfo) + '<span class="uname">' + l.tools.baseService.encodeHTML(i.name || i.dn || "未命名") + "</span></div></li>";
                var t = l.tools.baseService.encodeHTML(i.remark || i.priority_name || i.nick_name || i.uname || "未命名");
                return ['<li data-uniqueid="' + (i.gid || i.uk) + '" data-groupid="' + i.id + '" class="item">', '<div class="label-box" node-type="labelBox">', '<div class="label label-dis"></div>', "</div>", '<div class="uinfo g-clearfix" title="' + t + '">', '<img src="' + l.tools.baseService.encodeHTML(i.avatar_url) + '" width="23" height="23" class="avatar">', '<span class="uname">' + t + "</span>", "</div>", "</li>"].join("")
            }
        }(), addSelectedItem: function (e, i) {
            var t = e.gid ? d.TAG_GROUP : d.TAG_FRIEND;
            this.$container.find(".none").is(":visible") === !0 && this.$container.find(".none").hide(), s.findWhere(this.dSelectedList, {uk: e.uk}) || (this.dSelectedList = s.union(this.dSelectedList, [e]), this.$selectedList.append(this._getItemDom(e)), s.size(this.dSelectedList) >= 2 && this._showDefaultTip(), this.iFriendList.loopDealSelectedItem(e, t, !0, i))
        }, hasGroupData: function () {
            return void 0 === s.pluck(this.dSelectedList, "gid")[0] ? !1 : !0
        }, isCheckSelectedItemOk: function (e) {
            var i = !0;
            return 0 === this.dSelectedList.length ? !0 : (e === d.TAG_GROUP ? this.hasGroupData() === !1 ? (this.iFriendShare.onNeedTips("无法同时选择群组和好友为收件人"), i = !1) : this.dSelectedList.length >= a.MAX_SELECTED_GROUP_NUM && (this.iFriendShare.onNeedTips("无法选择多个群组作为收件人"), i = !1) : this.hasGroupData() === !0 ? (this.iFriendShare.onNeedTips("无法同时选择群组和好友为收件人"), i = !1) : this.dSelectedList.length >= a.MAX_SELECTED_FRIEND_NUM && (this.iFriendShare.onNeedTips("最多只能选择50个好友分享"), i = !1), i)
        }, _checkSelectedNum: function () {
            this.dSelectedList.length >= 50 && this.iFriendShare.onNeedTips("")
        }, addReceiver: function (e) {
            this.$selectedList.append(this._getItemDom(e))
        }, removeSelectedItem: function (e) {
            var i = e.gid ? d.TAG_GROUP : d.TAG_FRIEND;
            this.iFriendShare.onNeedTips(!1), this.dSelectedList = s.difference(this.dSelectedList, [e]), s.size(this.dSelectedList) < 2 && this._hideDefaultTip(), this.iFriendList.loopDealSelectedItem(e, i, !1), this.deleteSelectItemDom(e.gid || e.uk)
        }, deleteSelectItemDom: function (e) {
            this.$container.find("li[data-uniqueid=" + e + "]").remove(), 0 === this.dSelectedList.length && this.$selectedList.find(".none").show()
        }, stepSelectedNum: function () {
            this._renderSelectedNum(this.dSelectedList.length)
        }, _renderSelectedNum: function (e) {
            this.$shareNum.text(e)
        }, _clearSelectedList: function () {
            this.dSelectedList = [], this.$container.find(".select-list").html('<div class="none global-center"><span>你还没有选择好友</span></div>')
        }, _showDefaultTip: function () {
            this.$defaultSelectedTip.show()
        }, _hideDefaultTip: function () {
            this.$defaultSelectedTip.hide()
        }, reset: function () {
            this._clearSelectedList(), this._renderSelectedNum(0)
        }
    }, t.exports = a
});
;define("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/shareFriendSearchNew.js", function (e, t, i) {
    var a = e("base:widget/libs/jquerypacket.js"), r = e("base:widget/libs/underscore.js"),
        s = e("function-widget-1:shareDir/context.js").getContext(),
        n = e("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/searchFriend/searchResult.tpl.js"),
        c = e("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/userService/addFriendService.js"),
        o = e("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/groupList.js"),
        h = e("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/userService/searchUserService.js"),
        l = function (e) {
            var t = this;
            t.tapType = e.tapType, t.searchBox = e.$resultBox, t.iShareSelectedList = e.iShareSelectedList, t.resultData = [], t.pimData = [], t.$container = e.$container, t.elBox = a('<div style="line-height:34px;text-align: right;"><a id="searchFriendLink" href="javascript:void(0);">添加好友</a></div>'), t.el = a('<div class="share-friend-search g-clearfix"><div id="searchSubmit" class="module-icon-box"><div class="module-icon module-icon-search"></div></div><input type="text" id="searchInput" class="input"><div id="searchPlaceholder" class="placeholder"><span>输入百度帐号/邮箱添加好友</span></div><div id="searchSuggest" class="suggest"></div></div>'), t.input = t.el.find("#searchInput"), t.placeholder = t.el.find("#searchPlaceholder"), t.suggest = t.el.find("#searchSuggest"), t.searchIcon = t.el.find("#searchSubmit"), t.searchResult = t.searchBox.find("#searchResultParent"), t._mSearchData = null, t.event(), t.initData()
        };
    l.SEARCH_RUL = "/mbox/relation/query", l.prototype = {
        getPimData: function (e) {
            var t = this;
            t.pimData = e || []
        }, searchFriend: function (e) {
            {
                var t = this;
                a("#share")
            }
            new h({
                query: {need_relation: 1, user_list: a.stringify([e])}, searchSuccFunc: function (e) {
                    t.showSearchUser(e)
                }, searchFailFunc: function () {
                    t.restore()
                }
            }).searchUser()
        }, showSearchUser: function (e) {
            var t, i = this;
            0 !== e.records.length && (i._mSearchData = e.records[0]), t = s.tools.baseService.tmpl(n)({
                data: e,
                myUk: yunData.MYUK
            }), this.showSearchResult(t)
        }, showSearchResult: function (e) {
            this.searchResult.html(e), this.searchBox.show()
        }, searchPhone: function (e, t) {
            var i = this, a = [], r = [], s = [], n = [], c = i.pimData;
            if (/^\+?[\-\d]*$/.test(e)) {
                e = e.replace(/[\$\(\)\*\+\.\[\]\?\{\}\-\^]/gi, function (e) {
                    return "\\" + e
                });
                for (var o = 0, h = c.length; h > o; o++) {
                    var l = c[o].phone.join(","), d = c[o].dn;
                    new RegExp("^" + e).test(d) ? s.push(c[o]) : new RegExp(e).test(d) ? n.push(c[o]) : new RegExp(t).test(d) ? n.push(c[o]) : new RegExp("(^|\\s)" + e).test(l) ? a.push(c[o]) : new RegExp(e).test(l) ? r.push(c[o]) : new RegExp(t).test(l) && r.push(c[o])
                }
                i.resultData = s.concat(a, r, n)
            } else {
                e = e.replace(/[\$\(\)\*\+\.\[\]\?\{\}\\\|\-\<\>\/\^]/gi, function (e) {
                    return "\\" + e
                });
                for (var o = 0, h = c.length; h > o; o++) {
                    var d = c[o].dn;
                    new RegExp("^" + e, "i").test(d) ? s.push(c[o]) : new RegExp(e, "i").test(d) ? n.push(c[o]) : new RegExp(t, "i").test(d) && n.push(c[o])
                }
                i.resultData = s.concat(n)
            }
        }, searchMail: function (e, t) {
            var i = this, a = [], r = [], s = [], n = [], c = i.pimData;
            if (/^\+?[\-\d]*$/.test(e)) {
                e = e.replace(/[\$\(\)\*\+\.\[\]\?\{\}\-\^]/gi, function (e) {
                    return "\\" + e
                });
                for (var o = 0, h = c.length; h > o; o++) {
                    var l = c[o].email.join(","), d = c[o].dn;
                    new RegExp("^" + e).test(d) ? s.push(c[o]) : new RegExp(e).test(d) ? n.push(c[o]) : new RegExp(t).test(d) ? n.push(c[o]) : new RegExp("(^|\\s)" + e).test(l) ? a.push(c[o]) : new RegExp(e).test(l) ? r.push(c[o]) : new RegExp(t).test(l) && (c[o].listOrder = o, r.push(c[o]))
                }
                i.resultData = s.concat(a, n, r)
            } else {
                e = e.replace(/[\$\(\)\*\+\.\[\]\?\{\}\\\|\-\<\>\/\^]/gi, function (e) {
                    return "\\" + e
                });
                for (var o = 0, h = c.length; h > o; o++) {
                    var l = c[o].email.join(","), d = c[o].dn;
                    new RegExp("^" + e, "i").test(d) ? s.push(c[o]) : new RegExp(e, "i").test(d) ? n.push(c[o]) : new RegExp(t, "i").test(d) ? n.push(c[o]) : new RegExp("(^|\\s)" + e, "i").test(l) ? a.push(c[o]) : new RegExp(e, "i").test(l) ? r.push(c[o]) : new RegExp(t, "i").test(l) && r.push(c[o])
                }
                i.resultData = s.concat(a, n, r)
            }
        }, clearFun: function () {
            var e = this;
            e.input.val(""), e.input.focus(), e.resultData = [], e.searchBox.hide()
        }, restore: function () {
            var e = this;
            e.changeSearchIconStatus("toSearch"), e.input.val(""), e.placeholder.show(), e.resultData = [], e.searchBox.hide()
        }, changeSearchIconStatus: function (e) {
            var t = this.searchIcon.find(".module-icon");
            return "toSearch" === e ? void t.removeClass("module-icon-clear").addClass("module-icon-search") : "toClear" === e ? void t.removeClass("module-icon-search").addClass("module-icon-clear") : void(t.hasClass("module-icon-search") === !0 ? t.removeClass("module-icon-search").addClass("module-icon-clear") : t.removeClass("module-icon-clear").addClass("module-icon-search"))
        }, submitFun: function (e) {
            var t = this;
            if (e = e.trim().replace(/\s+/gi, " "), "" !== e) {
                for (var i, a = e.split(""), r = 0, s = a.length; s > r; r++) a[r] = a[r].replace(/[\$\(\)\*\+\.\[\]\?\{\}\\\|\-\<\>\/\^]/gi, function (e) {
                    return "\\" + e
                });
                switch (i = a.join(".*"), t.tapType) {
                    case"friend":
                        t.searchFriend(e);
                        break;
                    case"phone":
                        t.searchPhone(e, i);
                        break;
                    case"mail":
                        t.searchMail(e, i)
                }
            }
        }, _showSearchFriendLoading: function () {
            this.showSearchResult('<div class="loading">加载中...</div>')
        }, addFollow: function () {
            var e = this, t = {
                member: this._mSearchData, whenVerifyCodeDialog: function () {
                }, addSuccFunc: function () {
                    var t = e._mSearchData;
                    s.ui.tip({
                        mode: "success",
                        msg: "添加好友成功"
                    }), e.restore(), e.iShareSelectedList.isCheckSelectedItemOk(o.TAG_FRIEND) === !0 && (t.id = e.iShareSelectedList.iFriendList.getFriendGroupId(), e.iShareSelectedList.stepSelectedItem(t, !0, !1))
                }
            };
            new c(t).addFollow()
        }, event: function () {
            var e = this;
            e.elBox.find("#searchFriendLink").bind("click", function () {
                e.$container.html(e.el), s.log.send({type: "share_friend_add_link"})
            }), e.placeholder.bind("click", function () {
                e.placeholder.hide(), e.input.focus()
            }), e.input.bind("blur", function () {
                a.trim(e.input.val()) || (e.placeholder.show(), e.input.val(""))
            }).bind("keydown", function (t) {
                if (13 === t.keyCode) {
                    var i = e.input.val();
                    return a.trim(i) ? (e.changeSearchIconStatus("toClear"), e.submitFun.call(e, i), !1) : void a(this).blur()
                }
                e.changeSearchIconStatus("toSearch")
            }).bind("focus", function () {
                e.placeholder.hide()
            }), e.searchIcon.bind("click", function () {
                var t, i = a(this).find(".module-icon");
                if (i.hasClass("module-icon-search") === !0) {
                    if (t = e.input.val(), !a.trim(t)) return;
                    e.changeSearchIconStatus("toClear"), e.submitFun.call(e, t), s.log.send({type: "share_friend_search_friend"})
                } else e.changeSearchIconStatus("toSearch"), e.clearFun()
            }), e.searchBox.delegate("#searchBack", "click", function () {
                e.restore()
            }), e.searchBox.delegate('a[node-type="search-add-btn"]', "click", function () {
                e.addFollow(), s.log.send({type: "share_friend_add_friend"})
            }), e.searchBox.delegate('a[node-type="search-receiver-btn"]', "click", function () {
                var t;
                if (e.iShareSelectedList.iFriendList.onNeedTips(!1), e.iShareSelectedList.isCheckSelectedItemOk(o.TAG_FRIEND) === !0) {
                    t = e._mSearchData, e.restore();
                    var i = e.iShareSelectedList.iFriendList, a = i.findGroupId(o.TAG_FRIEND), n = function () {
                        var s = r.findWhere(i._list[parseInt(a, 10)].list, {uk: t.uk});
                        s ? e.iShareSelectedList.stepSelectedItem(s, !0, !0) : (t.id = e.iShareSelectedList.iFriendList.getFriendGroupId(), e.iShareSelectedList.stepSelectedItem(t, !0, !0))
                    };
                    i._list[parseInt(a, 10)].list ? n() : e.iShareSelectedList.iFriendList.onBeforeGroupOpen(o.TAG_FRIEND, 0, a, function () {
                        n()
                    })
                }
                s.log.send({type: "share_friend_add_receiver"})
            })
        }, initData: function () {
            var e = this;
            switch (e.tapType) {
                case"friend":
                    e.placeholder.text("输入百度帐号/邮箱添加好友");
                    break;
                case"phone":
                    e.placeholder.text("查找手机联系人");
                    break;
                case"mail":
                    e.placeholder.text("查找邮箱联系人")
            }
        }, changeTab: function (e) {
            var t = this;
            t.tapType = e, t.initData(), t.restore()
        }
    }, l.prototype.constructor = l, i.exports = l
});
;define("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/shareFriend.js", function (e, i, t) {
    var r = e("base:widget/libs/jquerypacket.js"), a = e("base:widget/libs/underscore.js"),
        n = e("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/shareFriendSearchNew.js"),
        o = e("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/shareSelectedList.js"),
        s = e("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/groupList.js"),
        c = e("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/shareNameInput.js"),
        l = e("function-widget-1:shareDir/util/dialogControl/addMember/shareService/service/userService/createGroupService.js"),
        d = e("function-widget-1:shareDir/context.js").getContext(), u = function (e) {
            var i = this;
            i.shareDialog = e && e.shareDialog, i.container = e && e.container, i.tapType = e && e.tapType, i.fileslist = e && e.fileslist, i.flag = e && e.flag, i.recentEmailData = [], i.recentPhoneDataData = []
        };
    u.operateMaxNum = 500, u.sortByUname = function () {
        var e = function (e, i) {
            var t = e.uname, r = i.uname;
            return t.localeCompare(r)
        };
        return function (i) {
            i.sort(e)
        }
    }(), u.prototype = {
        initFriendTabElement: function () {
            var e = this;
            e.el = r('<div id="sharefriendBox" class="share-friend-box"><p class="title"><span id="shareTitle">选择好友分享文件，一次最多50人</span></p><div class="content global-clearfix"><div class="left-side"><div id="contactBox" class="contact-box"><div id="friendBox" class="contact-group"></div><div id="phoneBox" class="contact-group"></div><div id="mailBox" class="contact-group"></div><div id="pimBox" class="pim-box"></div></div></div><div class="right-side"><div id="searchBox" class="search-box"></div><div id="selectedList"></div><!-- 搜索结果 --><div id="resultBox" class="result-box"><div id="searchResultParent" class="search-result-parent"></div></div></div></div></div>'), e.nameContent = e.el.find("#nameContent"), e.shareTitle = e.el.find("#shareTitle"), e.searchBox = e.el.find("#searchBox"), e.friendBox = e.el.find("#friendBox"), e.phoneBox = e.el.find("#phoneBox"), e.mailBox = e.el.find("#mailBox"), e.mBox = e.el.find("#mBox"), e.resultBox = e.el.find("#resultBox"), e.searchResult = e.el.find("#searchResultParent"), e.pimBox = e.el.find("#pimBox"), e.selectedList = e.el.find("#selectedList"), e.selectListData = [], e.descTitle = e.el.find("#descTitle"), e.desc = e.el.find("#desc"), e.descText = "描述一下分享的文件吧", e.descSize = e.desc.prev("label"), e.phoneData = {}, e.mailData = {}, e.mboxRecordsOfRecent = [], e.mboxRecordsOfFriend = [], e.mboxRecordsOfGroup = [], e.tongji = "", e.limit = 50, e.start = 0, e.ajaxUrl = "/inbox/friend/getfriendlist", e.container.html(e.el), e._mShareSelectedList = new o({$container: e.selectedList}), e.friendList = new s({
                container: e.friendBox,
                iShareSelectedList: e._mShareSelectedList
            }), e._mShareSelectedList.setIFriendList(e.friendList), e._mShareSelectedList.setIFriendShare(e), e.friendList.onNeedTips = e.onNeedTips, e._mShareFriendSearch = new n({
                tapType: e.tapType,
                $container: e.searchBox,
                $resultBox: e.el.find("#resultBox"),
                iShareSelectedList: e._mShareSelectedList
            }), e.searchBox.html(e._mShareFriendSearch.elBox), e.phoneList = new s({container: e.phoneBox}), e.mailList = new s({container: e.mailBox}), e.mboxList = new s({container: e.mBox}), e.resultList = new s({container: e.searchResult}), e.phoneList.parseTitle = e.mailList.parseTitle = e.mailList.parseTitle = e.resultList.parseTitle = function (e) {
                if ("string" == typeof e.uname || "string" == typeof e.dn || "number" == typeof e.uname || "number" == typeof e.dn) {
                    var i = e.avatar_url || e.hurl || "/box-static/function-widget-1/share/util/img/_nomd5/default-avatar.png";
                    e.title = '<div class="label"></div><div class="uinfo" title="' + d.tools.baseService.encodeHTML(e.name || e.uname || e.dn || "未命名") + '"><img src="' + d.tools.baseService.encodeHTML(i) + '" class="avatar"/>' + d.tools.baseService.encodeHTML(e.name || e.uname || e.dn || "未命名") + "</div>"
                }
                (e.phone || e.email) && (e.list = e.phone || e.email)
            }, e.friendList.parseTitle = function () {
                var e = function (e) {
                    var i, t = e.length >= 4 ? 4 : e.length, r = "";
                    if (0 === t) r += '<img src="/box-static/function-widget-1/share/util/img/_nomd5/default-avatar.png" width="27" height="27" />'; else for (var a = 0; t > a; a++) i = e[a], r += '<img src="' + i.photo + '" class="img-' + (a + 1) + '"/>';
                    return '<div class="img-box img-box-' + t + ' global-clearfix">' + r + "</div>"
                };
                return function (i) {
                    if (i.gid) i.title = '<div class="label"></div><div class="uinfo" title="' + d.tools.baseService.encodeHTML(i.name || i.uname || i.dn || "未命名") + '">' + e(i.photoinfo) + d.tools.baseService.encodeHTML(i.name || i.dn || "未命名") + "</div>"; else if ("string" == typeof i.remark || "string" == typeof i.nick_name || "string" == typeof i.priority_name || "string" == typeof i.uname) {
                        var t = i.avatar_url || i.hurl || "/box-static/function-widget-1/share/util/img/_nomd5/default-avatar.png";
                        i.title = '<div class="label"></div><div class="uinfo" title="' + d.tools.baseService.encodeHTML(i.remark || i.priority_name || i.nick_name || i.uname || "未命名") + '"><img src="' + d.tools.baseService.encodeHTML(t) + '" class="avatar"/>' + d.tools.baseService.encodeHTML(i.remark || i.priority_name || i.nick_name || i.uname || "未命名") + "</div>"
                    }
                }
            }()
        }, initOtherTabElement: function () {
            var e = this;
            e.el = r('<div id="sharefriendBox" class="share-phone-mail-box"><div class="right-side"><div id="searchBox" class="search-box"></div><div id="contactBox" class="contact-box"><div id="mBox" class="contact-group"></div><div id="friendBox" class="contact-group"></div><div id="phoneBox" class="contact-group"></div><div id="mailBox" class="contact-group"></div><div id="resultBox" class="contact-group"><p class="search-init">搜索结果<span id="searchBack" class="search-back">返回</span></p><div id="searchResult" class="search-result"></div></div><div id="pimBox" class="pim-box"></div></div></div><div class="left-side"><p class="title"><span id="shareTitle">将文件发到好友的收件箱，一次最多5人</span>(<span id="shareNu" class="nu">0</span>)</p><div id="nameContent" class="name-content clearfix"></div><p class="title" id="descTitle">描述：</p><p class="desc-box"><label>0/500</label><textarea id="desc" class="desc" maxlength="500">描述一下分享的文件吧</textarea></p></div></div>'), e.nameContent = e.el.find("#nameContent"), e.shareTitle = e.el.find("#shareTitle"), e.shareNu = e.el.find("#shareNu"), e.searchBox = e.el.find("#searchBox"), e.friendBox = e.el.find("#friendBox"), e.phoneBox = e.el.find("#phoneBox"), e.mailBox = e.el.find("#mailBox"), e.mBox = e.el.find("#mBox"), e.resultBox = e.el.find("#resultBox"), e.searchResult = e.el.find("#searchResult"), e.pimBox = e.el.find("#pimBox"), e.descTitle = e.el.find("#descTitle"), e.desc = e.el.find("#desc"), e.descText = "描述一下分享的文件吧", e.descSize = e.desc.prev("label"), e.phoneData = {}, e.mailData = {}, e.mboxRecords = [], e.tongji = "", e.limit = 50, e.start = 0, e.ajaxUrl = "/inbox/friend/getfriendlist", e._mShareNameInput = new c(e.nameContent, e.tapType), e.container.html(e.el), e.friendList = new s({container: e.friendBox}), e.phoneList = new s({container: e.phoneBox}), e.mailList = new s({container: e.mailBox}), e.mboxList = new s({container: e.mBox}), e.resultList = new s({container: e.searchResult}), e.friendList.parseTitle = e.phoneList.parseTitle = e.mailList.parseTitle = e.mailList.parseTitle = e.resultList.parseTitle = function (e) {
                if ("string" == typeof e.uname || "string" == typeof e.dn || "number" == typeof e.uname || "number" == typeof e.dn) {
                    var i = e.avatar_url || e.hurl || "/box-static/function-widget-1/share/util/img/_nomd5/default-avatar.png";
                    e.title = '<div class="uinfo" title="' + d.tools.baseService.encodeHTML(e.uname || e.dn || "未命名") + '"><img src="' + d.tools.baseService.encodeHTML(i) + '" class="avatar"/>' + d.tools.baseService.encodeHTML(e.uname || e.dn || "未命名") + "</div>"
                }
                (e.phone || e.email) && (e.list = e.phone || e.email)
            }
        }, updateFilesList: function (e) {
            this.fileslist = e
        }, showFriendList: function () {
            var e = function (e) {
                e.html('<div class="loading">加载中...</div>')
            };
            return function () {
                var i = this, t = [];
                e(i.friendBox), i._ajaxMboxRecentList(function () {
                    a.size(i.mboxRecordsOfRecent) > 0 && t.push({
                        title: "最近分享",
                        showNo: !0,
                        allNo: a.size(i.mboxRecordsOfRecent),
                        customTag: "recent",
                        noMore: !0
                    }), i._ajaxMboxGroupList(function () {
                        t.push({
                            title: "群组",
                            showNo: !0,
                            allNo: i.mboxRecordsOfGroup.length,
                            customTag: "mboxOfGroup",
                            noMore: !0
                        }), i._ajaxMboxFriendList(function () {
                            t.push({
                                title: "好友",
                                showNo: !0,
                                allNo: i.mboxRecordsOfFriend.length,
                                customTag: "mboxOfFriend"
                            }), i.friendList.updateList(t)
                        })
                    })
                })
            }
        }(), _showListDetail: function () {
            this.friendList.showListDetail()
        }, _ajaxMboxFriendList: function (e) {
            var i = this, t = "/mbox/relation/getfollowlist";
            r.ajax({
                url: t, data: {start: this.start, limit: 20}, type: "GET", dataType: "json", success: function (t) {
                    0 == t.errno ? (i.mboxRecordsOfFriend = i.mboxRecordsOfFriend.concat(t.records), i.start = i.mboxRecordsOfFriend.length, 1 === t.has_more ? i._ajaxMboxFriendList(e) : (u.sortByUname(i.mboxRecordsOfFriend), i.start = 0, e.call(i, i.mboxRecordsOfFriend))) : (console.log("error : " + t.errno), e.call(null, !1))
                }, error: function (i) {
                    e.call(null, !1), i.errno || console.log("error : " + i)
                }
            })
        }, _ajaxMboxRecentList: function (e) {
            var i = this;
            r.ajax({
                url: "/mbox/msg/historysession", type: "GET", dataType: "JSON", success: function (t) {
                    if (0 == t.errno) t.records && (i.mboxRecordsOfRecent = a.filter(t.records, function (e) {
                        return e.uk != yunData.MYUK
                    }), e.call(i, i.mboxRecordsOfGroup)); else {
                        var r = "网络错误，请稍候重试";
                        d.ui.tip({mode: "caution", msg: r})
                    }
                }, error: function () {
                    var e = "网络错误，请稍候重试";
                    d.ui.tip({mode: "caution", msg: e})
                }
            })
        }, _ajaxMboxGroupList: function () {
            var e = function () {
                var e = "网络错误，请稍候重试";
                d.ui.tip({mode: "caution", msg: e})
            };
            return function (i) {
                var t = this;
                r.ajax({
                    url: "/mbox/group/list",
                    data: {start: this.start, limit: 20, type: 0},
                    type: "GET",
                    dataType: "JSON",
                    success: function (e) {
                        0 == e.errno ? (e.records && (t.mboxRecordsOfGroup = t.mboxRecordsOfGroup.concat(e.records), t.start = t.mboxRecordsOfGroup.length), t.mboxRecordsOfGroup.length < e.count ? t._ajaxMboxGroupList(i) : (void 0 === e.records || 0 === e.records.length || t.mboxRecordsOfGroup.length >= e.count) && (t.start = 0, i.call(t, t.mboxRecordsOfGroup))) : console.log("error : " + e.errno)
                    },
                    error: function (i) {
                        i.errno || console.log("error : " + i), e()
                    }
                })
            }
        }(), fetchFriend: function (e, i) {
            var t = this, a = {};
            return e === s.TAG_FRIEND ? (t.friendList.insertList(t.mboxRecordsOfFriend, e), void("function" == typeof i && i.apply())) : e === s.TAG_GROUP ? (t.friendList.insertList(t.mboxRecordsOfGroup, e), void("function" == typeof i && i.apply())) : e === s.TAG_RECENT ? (t.friendList.insertList(t.mboxRecordsOfRecent, e), void("function" == typeof i && i.apply())) : (a.start = t.start, a.limit = t.limit, void r.ajax({
                url: t.ajaxUrl,
                data: a,
                type: "GET",
                dataType: "json",
                success: function (r) {
                    if (0 == r.errno) {
                        var a = r.friend_list || r.follow_list || r.fans_list || r.records;
                        u.sortByUname(a), t.friendList.insertList(a, e), "function" == typeof i && i.apply()
                    } else console.log("error : " + r.errno)
                },
                error: function (e) {
                    e.errno || console.log("error : " + e)
                }
            }))
        }, getRecentPimData: function (e) {
            var i = this, t = [];
            r.ajax({
                url: "/mbox/relation/getrecent",
                data: {start: i.start, limit: i.limit, type: e},
                type: "GET",
                dataType: "json",
                success: function (r) {
                    0 == r.errno ? (t.push({
                        title: "最近分享",
                        showNo: !0,
                        allNo: r.count,
                        customTag: "recentPim",
                        noMore: !0
                    }), 1 == e ? i.mailList.updateList(t) : i.phoneList.updateList(t), r.pim_data.length && (1 == e ? i.mailList.insertList(r.pim_data, "recentPim") : i.phoneList.insertList(r.pim_data, "recentPim")), r.pim_data.length && (1 === e ? i.recentEmailData = r.pim_data : i.recentPhoneData = r.pim_data)) : console.log("error : " + r.errno)
                },
                error: function (e) {
                    e.errno || console.log("error : " + e)
                }
            })
        }, _ajaxfetchPimData: function (e, i) {
            var t = this, a = [];
            i = i || "", r.ajax({
                url: "/inbox/friend/getpimbycursor",
                data: {limit: 1e3, type: e, cursor: i},
                type: "GET",
                dataType: "json",
                success: function (n) {
                    if (n && 0 == n.errno) if (n.use_pim) {
                        if (a.push({
                            title: 1 == e ? "我的邮箱联系人" : "我的手机联系人",
                            showNo: !0,
                            allNo: n.pim_count,
                            customTag: "rim"
                        }), "" === i && 0 !== n.list.length ? (1 == e ? t.mailList.insertList(a) : t.phoneList.insertList(a), t._ajaxfetchPimData.hasCacheTitle = !0) : "" !== i && 0 !== n.list.length && (t._ajaxfetchPimData.hasCacheTitle || (1 == e ? t.mailList.insertList(a) : t.phoneList.insertList(a), t._ajaxfetchPimData.hasCacheTitle = !0)), 0 !== n.list.length ? (1 == e ? t.mailData = n : t.phoneData = n, 1 == e ? t.mailList.insertList(n.list, "rim") : t.phoneList.insertList(n.list, "rim"), t._ajaxfetchPimData.cacheTotal = t._ajaxfetchPimData.cacheTotal + n.list.length, t.pimBox.empty(), void 0 !== n.cursor && "" !== n.cursor && t._ajaxfetchPimData(e, n.cursor), t._ajaxfetchPimData.cacheList = t._ajaxfetchPimData.cacheList.concat(n.list)) : 0 === n.list.length && void 0 !== n.cursor && "" !== n.cursor ? (t.pimBox.empty(), t._ajaxfetchPimData(e, n.cursor)) : 0 === t._ajaxfetchPimData.cacheList.length && t.pimBox.html("您的通讯录没有联系人<br>登陆手机端备份后导入"), void 0 === n.cursor) {
                            0 !== t._ajaxfetchPimData.cacheList.length && t._mShareFriendSearch.getPimData(t.recentEmailData.concat(t._ajaxfetchPimData.cacheList));
                            var o = r(1 == e ? "#mailBox" : "#phoneBox");
                            o.find(".js-total").text("(" + t._ajaxfetchPimData.cacheTotal + ")").show()
                        }
                    } else t.pimBox.html('<span id="pimLink" class="pim-link">' + (1 == e ? "一键导入邮箱联系人" : "一键导入手机联系人") + "</span>"); else disk.DEBUG && console.log("error : " + n.errno)
                },
                error: function (e) {
                    e.errno || console.log("error : " + e)
                }
            })
        }, getPimData: function (e) {
            {
                var i = this;
                1 == e ? i.mailData : i.phoneData
            }
            i._ajaxfetchPimData.hasCacheTitle = !1, i._ajaxfetchPimData.cacheTotal = 0, i._ajaxfetchPimData.cacheList = [], i._ajaxfetchPimData(e)
        }, getImportPimData: function () {
            var e = this;
            r.ajax({
                url: "/inbox/friend/importpim", type: "GET", dataType: "json", success: function (i) {
                    0 == i.errno ? e.getPimData("mail" == e.tapType ? 1 : 2) : -10 == i.errno ? e.onNeedTips('联系人过多无法导入，去<a href="https://tongxunlu.baidu.com" target="_blank">通讯录</a>查看') : console.log("error : " + i.errno)
                }, error: function (e) {
                    e.errno || console.log("error : " + e)
                }
            })
        }, getDesc: function () {
            var e = this, i = r.trim(e.desc.val());
            return "phone" != e.tapType && (e.descText = i, "" == i ? (e.desc.val("描述一下分享的文件吧"), e.desc.css("color", "#999"), e.descText = "描述一下分享的文件吧") : "描述一下分享的文件吧" == i && (e.desc.val(""), i = "")), i
        }, onNeedTips: function () {
        }, event: function () {
            var e = this;
            e.desc.bind("blur", function () {
                e.getDesc()
            }).bind("focus", function () {
                "phone" != e.tapType && e.desc.val(e.descText), "描述一下分享的文件吧" == e.desc.val() && e.desc.val(""), e.desc.css("color", "#333")
            }).bind("keyup", function () {
                var i = e.desc.val().length;
                e.descSize.text(i + "/500"), i > 500 && e.onNeedTips("描述不能超过500个字符")
            }), r("#searchBack").off("click").on("click", function () {
                e._mShareFriendSearch.restore(), e.initDataAndRender(), e.event(), e._mShareNameInput && e._mShareNameInput.render()
            }), e.mBox.off("click", "#pimLink").on("click", "#pimLink", function () {
                e.getImportPimData()
            }), this.container.delegate("li.item", "hover", function () {
                r(this).toggleClass("on")
            });
            var i = function (i) {
                e.ajaxUrl = "friend" == i ? "/inbox/friend/getfriendlist" : "follow" == i ? "/inbox/friend/getfollowlist" : "fans" == i ? "/inbox/friend/getfanslist" : "mboxOfFriend" == i ? "/mbox/relation/getfollowlist" : "mboxOfGroup" == i ? "/mbox/group/list" : "mbox/msg/historysession"
            };
            e.friendList.onBeforeGroupOpen = function (t, r, a, n) {
                0 == r && (i(t), e.start = r, e.fetchFriend(t, n))
            }, e.friendList.onLoadMore = function (t, r) {
                i(t), e.start = r, e.fetchFriend(t)
            }, "friend" !== e.tapType && (e.mailList.onListSelected = e.phoneList.onListSelected = e.resultList.onListSelected = function (i, t, r) {
                if (parseInt(e.shareNu.text()) < 5) {
                    var a = {};
                    switch (e.tapType) {
                        case"friend":
                            a = {uk: i.uk, name: i.uname};
                            break;
                        case"phone":
                            a = {phone: t || i.phone[0], name: i.dn, guid: i.guid}, e.tongji = r + "Phone";
                            break;
                        case"mail":
                            a = {mail: t || i.email[0], name: i.dn, guid: i.guid}, e.tongji = r + "Mail"
                    }
                    e._mShareNameInput.addCard(a)
                } else e.onNeedTips("最多只能选5个好友分享")
            }, e._mShareNameInput.hintShow = function (i) {
                e.onNeedTips(i)
            }, e._mShareNameInput.heightChange = function (i) {
                var t = 28 === i ? 68 : 45;
                e.desc.height(t)
            }, e._mShareNameInput.hintHide = function () {
            }, e._mShareNameInput.delSign = function () {
            }, e._mShareNameInput.addSign = function () {
            }, e._mShareNameInput.getUserList = function (i, t) {
                e.userData = i, 5 >= t && (e.nameContent[0] && e.nameContent.scrollTop(e.nameContent[0].scrollHeight), e.shareNu.text(t))
            })
        }, closePanel: function () {
            var e = this;
            e.userData = {}, e._mShareSelectedList && e._mShareSelectedList.reset(), e.desc.val("描述一下分享的文件吧"), e.descText = "描述一下分享的文件吧", e.desc.css("color", "#999"), e.start = 0, e.isAction = !0
        }, _setDialogVisible: function (e) {
            var i = this;
            e === !0 ? i.shareDialog.show() : i.shareDialog.hide()
        }, shareDataToFriendOrGroup: function () {
            var e = "/mbox/msg/send", i = 3, t = 4, n = 1, o = function (e) {
                var i, t, r = [];
                for (i = 0, t = e.length; t > i; i++) r.push(e[i].fs_id);
                return r
            }, s = function (e) {
                return a.pluck(e, "gid")
            }, c = function (e) {
                return a.pluck(e, "uk")
            }, f = function (e) {
                return a.pluck(e, "uname")
            }, h = function (e) {
                var i = "分享失败，重试一下吧";
                return i = 2135 == e.errno ? "对方拒绝接收消息" : 2102 == e.errno ? "群组不存在" : 2103 == e.errno ? "你已退出该群" : d.errorMsg(e.errno)
            }, m = function (e) {
                if ("BDYGJ" === e) return !0;
                var i = "邀请已发出，请等待对方加入";
                d.ui.tip({mode: "success", msg: i})
            };
            return function (a) {
                var p, g, v = this, x = v._mShareSelectedList.dSelectedList, b = v.fileslist;
                if (0 === b.length) return void v.onNeedTips("您还没有选择文件");
                if (b.length > u.operateMaxNum) return void v.onNeedTips("您选择的文件不能超过" + u.operateMaxNum + "个");
                if (0 === x.length) return void v.onNeedTips("您还没有选择好友或群");
                if (p = {
                    msg_type: n,
                    msg: a.mboxMsg,
                    fs_ids: r.stringify(o(b))
                }, a.input && a.vcode && (p.vcode = a.vcode, p.input = a.input), this._mShareSelectedList.hasGroupData() === !0) p.send_type = t, p.receiver = r.stringify(s(x)), "BDYGJ" === v.flag && BDHScript.throwEvent("shareStart", {gid: p.receiver}), r.ajax({
                    url: e,
                    data: p,
                    type: "GET",
                    dataType: "JSON",
                    success: function (e) {
                        if (d.ui.hideTip(), "BDYGJ" === v.flag && BDHScript.throwEvent("shareEnd", {
                            gid: p.receiver,
                            errno: e.errno,
                            msg_id: e.msg_id
                        }), 0 === e.errno) v.closePanel(), a.closeFun(), m(v.flag); else {
                            var i = e.errno, t = d.accountBan(i);
                            t.isBan && (d.ui.hideTip(), e.errno = t.errno), -74 === e.errno || -19 === e.errno ? a.paramTips(e) : (v._setDialogVisible(!0), v.onNeedTips(h(e)))
                        }
                    },
                    error: function () {
                        d.ui.tip({mode: "caution", msg: "邀请失败，请稍后重试"})
                    }
                }); else if (x.length >= 2) {
                    p.send_type = t;
                    var T = {user_list: r.stringify(c(x))};
                    a.vcode && a.input && (T = r.extend({}, T, {input: a.input, vcode: a.vcode})), g = new l({
                        data: T,
                        whenVerifyCodeDialog: function (e) {
                            a.paramTips(e)
                        },
                        addSuccFunc: function (i) {
                            p.receiver = r.stringify([i.gid]), d.ui.tip({
                                mode: "loading",
                                msg: "正在邀请好友，请稍候...",
                                autoClose: !1
                            }), "BDYGJ" === v.flag && BDHScript.throwEvent("shareStart", {gid: p.receiver}), r.ajax({
                                url: e,
                                data: p,
                                type: "GET",
                                dataType: "JSON",
                                success: function (e) {
                                    if (d.ui.hideTip(), "BDYGJ" === v.flag && BDHScript.throwEvent("shareEnd", {
                                        gid: p.receiver,
                                        errno: e.errno,
                                        msg_id: e.msg_id
                                    }), 0 === e.errno) v.closePanel(), a.closeFun(), m(v.flag); else if (-74 == e.errno || -19 == e.errno) a.paramTips(e); else {
                                        var i = d.accountBan(e.errno);
                                        i.isBan && (d.ui.hideTip(), e.errno = i.errno), v._setDialogVisible(!0), v.onNeedTips(h(e))
                                    }
                                },
                                error: function () {
                                    d.ui.tip({mode: "caution", msg: "邀请失败，请稍后重试"})
                                }
                            })
                        },
                        addFailFunc: function (e) {
                            var i = e.errno, t = d.accountBan(i);
                            if (t.isBan) return !1;
                            var a = d.errorMsg(e.errno, "网络错误，请稍候重试"), n = !0, o = !1;
                            if (e && 2101 === e.errno) a = "你已达到创建2000群上限"; else if (e && 2100 === e.errno) a = "用户都已经被添加过"; else if (e && 2119 === e.errno) a = "群成员已满"; else {
                                if (e && -60 === e.errno) return a = "群成员超过上限", d.ui.tip({
                                    mode: "caution",
                                    msg: a
                                }), r("#share").is(":visible") === !1 && v.shareDialog.show(), !0;
                                e && -20 === e.errno ? a = "获取验证码失败" : e && -73 === e.errno && (a = "创建群个数超过上限")
                            }
                            d.ui.tip({mode: "caution", msg: a, autoClose: n, hasClose: o})
                        }
                    }), g.createGroup()
                } else p.send_type = i, p.receiver = r.stringify(c(x)), p.receiver_name = r.stringify(f(x)), "BDYGJ" === v.flag && BDHScript.throwEvent("shareStart", {ukList: p.receiver}), r.ajax({
                    url: e,
                    data: p,
                    type: "GET",
                    dataType: "JSON",
                    success: function (e) {
                        if ("BDYGJ" === v.flag && BDHScript.throwEvent("shareEnd", {
                            ukList: p.receiver,
                            errno: e.errno,
                            msg_id: e.msg_id
                        }), 0 === e.errno) v.closePanel(), a.closeFun(), m(v.flag); else if (-74 === e.errno || -19 == e.errno) a.paramTips(e); else {
                            var i = d.accountBan(e.errno);
                            i.isBan && (d.ui.hideTip(), e.errno = i.errno), v.onNeedTips(h(e))
                        }
                    },
                    error: function () {
                        d.ui.tip({mode: "caution", msg: "邀请失败，请稍后重试"})
                    }
                })
            }
        }(), sending: function () {
            if (this.sendingStatus) return !0;
            var e = this;
            return this.sendingStatus = !0, setTimeout(function () {
                e.sendingStatus = !1
            }, 3e3), !1
        }, clearSending: function () {
            this.sendingStatus = !1
        }, shareData: function (e) {
            if (!this.sending()) {
                var i = this, t = [], a = [], n = 0, o = {}, s = d.log;
                if ("friend" === i.tapType) return void this.shareDataToFriendOrGroup(e);
                for (var c = 0, l = i.fileslist.length; l > c; c++) a.push(i.fileslist[c].fs_id);
                for (var c in i.userData) switch (i.tapType) {
                    case"friend":
                        n = 0, t.push(i.userData[c].uk);
                        break;
                    case"phone":
                        n = 2, o[i.userData[c].phone || i.userData[c].name] = i.userData[c].guid || "", t.push(i.userData[c].phone || i.userData[c].name);
                        break;
                    case"mail":
                        n = 1, o[i.userData[c].mail || i.userData[c].name] = i.userData[c].guid || "", t.push(i.userData[c].mail || i.userData[c].name)
                }
                if (!t.length) return void i.onNeedTips("您还没有选择好友");
                if (!a.length) return void i.onNeedTips("您还没有选择文件");
                if (a.length > 100) return void i.onNeedTips("您选择的文件不能超过100个");
                var u = {receiver: r.stringify(t), fs_ids: r.stringify(a), send_type: 1, msg_type: 2};
                e.vcode && e.input && (u.input = e.input, u.vcode = e.vcode), r.ajax({
                    url: "/mbox/msg/send?web=1",
                    data: u,
                    type: "POST",
                    dataType: "JSON",
                    success: function (t) {
                        0 == t.errno ? i._doShareSuccess(e) : i._doShareFail(e, t), i.clearSending()
                    },
                    error: function (e) {
                        e.errno || console.log("error : " + e), d.ui.tip({
                            mode: "caution",
                            msg: "分享失败，请稍后重试"
                        }), i.clearSending()
                    }
                }), "rimPhone" == i.tongji ? (s.send({
                    type: "sharePhone",
                    val: "手机联系人"
                }), i.tongji = "") : "rimMail" == i.tongji && (s.send({type: "shareMail", val: "邮箱联系人"}), i.tongji = "")
            }
        }, _doShareSuccess: function (e) {
            var i = this;
            i.closePanel(), e.closeFun();
            var t = "";
            "mail" === i.tapType ? t = "分享成功" : "phone" === i.tapType ? t = '分享成功，你可以在<a href="/share/manage#tabtype=phone">我的分享</a>中查看分享详情' : "friend" === i.tapType && (t = '分享成功，你可以在<a href="/mbox/homepage#share/type=session">分享</a>中查看分享详情'), d.ui.tip({
                mode: "success",
                msg: t
            })
        }, _doShareFail: function (e, i) {
            var t = "分享失败，重试一下吧", r = this;
            if (-52 == i.errno) t = "发送的文件名中有敏感词，优化一下吧"; else if (-60 == i.errno) t = "最多只能选5个好友分享"; else if (-61 == i.errno) t = "你分享的文件数太多了，分批分享吧"; else if (-62 == i.errno) {
                var a = i.fail_user.length ? i.fail_user.length > 1 ? i.fail_user[0].uname + "等" : i.fail_user[0].uname : "一部分收件人";
                t = a + "的网盘用户校验失败"
            } else if (-63 == i.errno) t = "服务器出错分享失败，重试一下吧"; else if (-64 == i.errno) t = "服务器出错分享失败，重试一下吧"; else if (-72 == i.errno) t = "文件不存在，请重新选择文件分享"; else if (-73 == i.errno) t = "您发送相同文件给相同人频率太快，请等一分钟后发送"; else if (-75 == i.errno) t = "你今天分享次数太多了，明天再来分享吧"; else if (-76 == i.errno) t = "你今天分享次数太多了，明天再来分享吧"; else if (-78 == i.errno) t = "描述中有敏感词，优化一下吧"; else if (-79 == i.errno) t = "描述不能超过500个字符"; else if (-80 == i.errno) {
                var a = i.freq_front.length ? i.freq_front.length > 1 ? i.freq_front[0].uname + "等" : i.freq_front[0].uname : "一部分收件人";
                t = "给" + a + "分享次数太多了，明天再来分享吧"
            } else if (-81 == i.errno) t = '绑定手机号码即可以一次分享给多个用户。 <a href="//passport.baidu.com/v2/accountsecurity?act=bindmobile" target="_blank">去绑定手机号</a>'; else if (-74 == i.errno || -19 == i.errno) e.paramTips(i); else if (-88 == i.errno) t = "分享内有敏感词，优化一下吧"; else {
                var n = d.accountBan(i.errno);
                n.isBan && (d.ui.hideTip(), i.errno = n.errno), t = d.errorMsg(i.errno, "网络错误，请稍候重试")
            }
            -74 != i.errno && -19 != i.errno && r.onNeedTips(t)
        }, initDataAndRender: function () {
            var e = this;
            switch (r(".contact-group").hide(), e.pimBox && e.pimBox.empty(), e.desc && e.desc.val(e.descText), e.tapType) {
                case"friend":
                    e.initFriendTabElement(), e._mShareSelectedList.reset(), e.desc.attr("readOnly", !1), e.descSize.show(), e.friendBox.show(), e.showFriendList();
                    break;
                case"phone":
                    e.shareTitle.text("将文件的下载地址免费发到好友手机，一次最多5人"), e.descTitle.text("短信内容："), e.desc.attr("readOnly", !0);
                    var i = yunData.MYNAME + " 给你分享了文件：" + location.protocol + "//pan.baidu.com/inbox....，有效时间：7天。【百度网盘】";
                    e.desc.val(i), e.descSize.hide(), e.phoneBox.show(), e.getRecentPimData(2);
                    break;
                case"mail":
                    e.initOtherTabElement(), e.shareTitle.text("将文件的下载地址发到好友的邮箱，一次最多5人"), e.descTitle.text("邮件内容："), e.desc.attr("readOnly", !1), e.descSize.show(), e.mailBox.show(), e.getRecentPimData(1)
            }
        }, render: function () {
            var e = this;
            e.initDataAndRender(), e.event(), e._mShareNameInput && e._mShareNameInput.render()
        }, changeTab: function (e) {
            var i = this;
            i.tapType = e, i.render(), i._mShareNameInput && i._mShareNameInput.changeTab(e), i._mShareFriendSearch && i._mShareFriendSearch.changeTab(e)
        }
    }, u.prototype.constructor = u, t.exports = u
});
;define("function-widget-1:share/util/shareFriend/createSnsShare.js", function (e, i, s) {
    function t(e) {
        this.container = e && e.container, this.getPublicInfo = e && e.onNeedPublicInfo, this.fileslist = e && e.fileslist, this.sendStatus = !1, this.publicInfo = null, this.publicLink = void 0, this.publicShareid = void 0, this.cover = null, this.init(), this.disabledShare = !1, this.shareError = 0
    }

    var a = e("base:widget/libs/jquerypacket.js"), n = e("base:widget/storage/storage.js"),
        r = e("function-widget-1:share/context.js").getContext;
    t.prototype = {
        sendAwardTaskRequest: function (e) {
            var i = {share_sina: 10, upload: 6};
            if (yunData.TASKKEY && yunData.TASKTIME) return "undefined" == typeof n || n.getItem(e + "_" + FileUtils.sysUID.replace(/@/g, "")) ? !1 : void a.ajax({
                type: "POST",
                timeout: 3e3,
                url: "/api/task/create",
                dataType: "json",
                data: {type: i[e], sign: yunData.TASKKEY, timestamp: yunData.TASKTIME},
                success: function (s) {
                    !s || 0 != s.errno && -36 != s.errno && -29 != s.errno || (disk.DEBUG && console.log("..........type=" + e + "data.errno" + s.errno), n.setItem(e + "_" + FileUtils.sysUID.replace(/@/g, ""), i[e]))
                }
            })
        }, createScript: function () {
            return script = document.createElement("script"), script.type = "text/javascript", document.body.appendChild(script), script
        }, init: function () {
            var e = this, i = this.createScript();
            i.id = "bdshare_js", i.setAttribute("data", "type=tools");
            var s = this.createScript();
            s.id = "bdshell_js", this.render(), s.src = "http://bdimg.share.baidu.com/static/js/shell_v2.js?cdnversion=" + Math.ceil(new Date / 36e5), this.cover.bind("click", function () {
                return e.disabledShare ? (e.onNeedTips(r().errorMsg(e.shareError)), !1) : void e.onNeedTips("初始化组件中，请稍后", 3e3)
            }), a("#bdshare a").mousedown(function (i) {
                if ("{}" === a("#bdshare").attr("data")) return e.onNeedTips("初始化组件中，请稍后···", 3e3), i.stopPropagation(), !1;
                e.cover.hide(), e.onNeedTips(!1), a.get("/share/chgpublicchannel?", {
                    shareid: e.publicLink,
                    public_channel: a(this).attr("_index"),
                    t: (new Date).getTime()
                }), e.sendStatus = !0;
                var s = {type: "share_to_sns"};
                switch (a(this).attr("_index")) {
                    case"0":
                        e.sendAwardTaskRequest("share_sina"), s.sns = "tsina";
                        break;
                    case"1":
                        s.sns = "qzone";
                        break;
                    case"2":
                        s.sns = "tqq";
                        break;
                    case"3":
                        s.sns = "renren";
                        break;
                    case"4":
                        s.sns = "t163"
                }
                r().log.send(s)
            }), this.getPublicInfo && (this.onNeedPublicInfo = this.getPublicInfo), this.fileslist && this.updateFilesList(this.fileslist)
        }, render: function () {
            var e = '<div id="bdshare" class="bdshare_t bds_tools get-codes-bdshare" data="{}"><span class="bd_shares share_title">将文件的公开下载地址分享到微博、QQ空间等</span><a class="bds_tsina bd_shares" _index="0"  href="javascript:void(0);"><em class="icon"></em>新浪微博</a><a class="bds_qzone bd_shares" _index="1" href="javascript:void(0);"><em class="icon"></em>QQ空间</a><a class="bds_tqq bd_shares" _index="2" href="javascript:void(0);"><em class="icon"></em>腾讯微博</a><a class="bds_renren bd_shares" _index="3" href="javascript:void(0);"><em class="icon"></em>人人网</a><a class="bds_t163 bd_shares" _index="4" href="javascript:void(0);"><em class="icon"></em>网易微博</a></div><div class="cover"></div>';
            this.container.html(e), this.cover = this.container.find(".cover")
        }, createPublicShare: function (e) {
            if (this.publicInfo = this.onNeedPublicInfo(), this.publicInfo || "undefined" != typeof this.publicShareid) this.publicInfo ? (this.publicLink = this.publicInfo.link, this.publicShareid = this.publicInfo.shareid, e()) : "undefined" != typeof this.publicShareid && e(); else {
                var i = this, s = {fid_list: [], schannel: 0, channel_list: "[]"};
                if (a.each(i.fileslist, function (e, i) {
                    null !== i.fs_id && "undefined" != typeof i.fs_id && s.fid_list.push(i.fs_id)
                }), s.fid_list.length <= 0) return setTimeout(function () {
                    var e = "分享的文件不存在，请刷新页面重试";
                    i.onNeedTips(e), r().ui.hideTip()
                }, 50), !1;
                s.fid_list = a.stringify(s.fid_list), a.post("/share/set?channel=chunlei&clienttype=0&web=1", s, function (s) {
                    if (0 === s.errno) i.publicLink = s.shorturl || s.link, i.publicShareid = s.shareid, e(); else {
                        var t = r().accountBan(s.errno);
                        t.isBan && (r().ui.hideTip(), s.errno = t.errno, i.disabledShare = !0, i.shareError = s.errno);
                        var a = r().errorMsg(s.errno, "创建分享失败，请稍后再试");
                        i.onNeedTips(a)
                    }
                }).error(function () {
                    i.onNeedTips("创建分享失败，请稍后再试")
                })
            }
        }, cancelPublicShare: function () {
            if (!this.publicInfo && this.publicShareid) {
                var e = this, i = "[" + this.publicShareid + "]";
                a.post("/share/cancel?channel=chunlei&clienttype=0&web=1", {shareid_list: i}, function () {
                }).error(function () {
                    disk.DEBUG && console.log("[LOG] cancel public share failure when skip the sns share")
                }), e.publicShareid = void 0
            }
        }, updateFilesList: function (e) {
            var i = this;
            this.sendStatus = !1, this.fileslist = e, this.publicInfo = null, this.selfLink = void 0, this.cover.show(), this.createPublicShare(function () {
                a("#bdshare").attr("data", "{}"), i.initShareData()
            })
        }, initShareData: function () {
            var e, i = this.fileslist, s = r().tools.baseService, t = this, n = [], c = [], h = i.length, o = "";
            for (e = 0; h > e; e++) c.push(i[e].fs_id);
            for (e in i) {
                if (1 >= e && n.push(s.parseDirFromPath(s.getNormalizedPath(i[e].path))), e > 1 && "" !== o) break;
                var d = i[e];
                "" === o && 3 === d.category && (o = d.thumb || d.thumbs && d.thumbs.url3 || ""), "" !== o || 4 !== d.category || d.path.match(/\.txt$/) || (o = d.docpreview + "&method=view&type=jpg")
            }
            n = n.join("”，“"), n.length > 80 && n.substring(0, 80), n = "“" + n + "”", i.length > 2 ? n = n + "等" + i.length + "个文件（夹）" : n += "文件", n = "Hi，我正在使用#百度网盘#，给大家分享" + n + "，快来看看吧~";
            var l = {text: n, comment: n, pic: o, searchPic: 0, url: t.publicLink};
            a("#bdshare").attr("data", a.stringify(l)), this.cover.hide()
        }, closePanel: function () {
            !this.sendStatus && this.publicShareid ? this.cancelPublicShare() : this.publicShareid = void 0
        }, onNeedPublicInfo: function () {
            return void 0
        }
    }, s.exports = t
});
;define("function-widget-1:share/util/shareFriend/createLinkShare.js", function (e, i, t) {
    function s(e) {
        this.container = e && e.container, this.publicInfo = null, this.status = s.STATUS_CREATE_PRIVATE, this.validity = s.VALIDITY_INITIALIZE, this.validityText = s.VALIDITY_TEXT_INITIALIZE, this.fileslist = e && e.fileslist || null, this.myClipboard = null, this.clipboardText = "", this.createsharetipsLdlj = "", this.init()
    }

    var a = e("base:widget/libs/jquerypacket.js"), n = e("function-widget-1:share/context.js").getContext,
        o = e("base:widget/clipboard/myClipboard.js"), r = window.yunData;
    s.STATUS_INITIALIZE = 0, s.STATUS_CREATE_PULICE = 1, s.STATUS_CREATE_PRIVATE = 2, s.VALIDITY_INITIALIZE = 7, s.VALIDITY_TEXT_INITIALIZE = "7天", s.prototype = {
        init: function () {
            var e = this;
            this.render(), this.bindEvent(), a(".dialog-share .create").click(function () {
                "public" === e.container.find('.share-method-line input[type="radio"]:checked').val() ? (e.status = s.STATUS_CREATE_PULICE, e.createShareLink(function () {
                    e.container.find(".create-link").attr("class", "create-link public-link has-create"), a(".dialog-share .create").hide(), a(".dialog-share .close .text").text("关闭"), a("#copyShare").next(".copy-tips").hide(), a(".share-validity-tip").css("right", "115px"), a(".open-share-warning").hide(), n().log.send({
                        name: "create_public_success",
                        value: "创建公开链接成功",
                        sendServerLog: !0
                    })
                }), n().log.send({
                    name: "create_public",
                    value: "创建公开链接",
                    sendServerLog: !0
                })) : (e.status = s.STATUS_CREATE_PRIVATE, e.createShareLink(function () {
                    e.container.find(".create-link").attr("class", "create-link private-link has-create"), a(".dialog-share .create").hide(), a(".dialog-share .close .text").text("关闭"), a("#copyShare").next(".copy-tips").hide(), a(".share-validity-tip").css("right", "150px"), a(".open-share-warning").hide(), n().log.send({
                        name: "create_private_success",
                        value: "创建私密链接成功",
                        sendServerLog: !0
                    })
                }), n().log.send({name: "create_private", value: "创建私密链接", sendServerLog: !0}))
            }), e.container.delegate(".copy-button", "click", function () {
                e.myClipboard.setText(e.clipboardText)
            }).delegate(".copy-button", "mouseenter", function () {
                a(this).addClass("button-hover")
            }).delegate(".copy-button", "mouseleave", function () {
                a(this).removeClass("button-hover")
            }).delegate(".copy-button", "mousedown", function () {
                a(this).addClass("button-active")
            }).delegate(".copy-button", "mouseup", function () {
                a(this).removeClass("button-active")
            }).delegate(".share-url", "mouseover", function () {
                a(this).select()
            })
        }, render: function () {
            var e = ' <div class="create-link"> <table class="validity-section"><tr><td class="first-child"><label>分享形式</label></td><td><div class="share-method-line"><input type="radio" id="share-method-private" name="share-method" value="private" checked=true /><span class="icon icon-radio-checked radio-icon"></span><label for="share-method-private"><b>有提取码</b><span>仅限拥有提取码者可查看，更加隐私安全</span></label></div></td></tr><tr><td class="first-child"><label>有效期</label></td><td class="choose-panel"><button class="g-button g-button-large-gray choose-value"><span class="text">7天</span><em class="icon icon-dropdown-select"></em></button><ul class="choose-list"><li value="0"><em>永久有效</em></li><li class="choose-checked" value="7"><em>7天</em><span class="icon">&#xe932;</span></li><li value="1"><em>1天</em></li></ul></td></tr></table>    <div class="create-success">         <span class="public">             <em class="icon"></em>            成功创建公开链接        </span>         <span class="private">             <em class="icon"></em>            成功创建私密链接        </span>     </div>     <div class="link-info">         <div class="copy-button-section">             <a class="g-button g-button-blue copy-button" id="copyShare">                 <span class="g-button-right">                    <span class="text public">复制链接</span>                     <span class="text private">复制链接及提取码</span>                 </span>            </a>            <div class="copy-tips">复制链接成功</div>        </div>        <div class="url"> <div class="share-url-border">         <input type="text" spellingcheck="false" readonly="readonly" class="share-url" value="" />          <span class="border-img"></span>         <span class="share-validity-tip">链接永久有效</span></div>        </div>         <div class="password">             <h4>提取码</h4> <input type="text" class="share-password" spellingcheck="false" readonly="readonly" value="" />         </div>     </div>     <div class="description">         <span class="public">             1.生成文件下载链接 <br/>            2.把链接通过QQ、微博、人人网、QQ空间等方式分享给好友         </span>         <span class="private">             可以将链接发送给你的QQ等好友         </span>     </div> </div>';
            this.container.html(e), "string" == typeof r.sampling && r.sampling.indexOf("company_pub") >= 0 && a(".open-share-warning").html("<p>公司内部文件建议有提取码分享 </p>");
            var i = r.pansuk;
            i && i.length > 0 && r.MYUK && a(".share-home-href").attr("href", "/share/home?uk=" + r.MYUK + "&suk=" + i)
        }, bindEvent: function () {
            var e = this;
            e.container.delegate(".share-method-line input[type=radio]", "click", function () {
                e.container.find(".radio-icon").removeClass("icon-radio-checked").addClass("icon-radio-non"), a(this).next(".radio-icon").removeClass("icon-radio-non").addClass("icon-radio-checked");
                var i = a(".share-public-panel");
                "public" === a(this).val() ? (i.css("color", "#ed5127"), i.find("b").css("color", "#ed5127"), i.find("a").css("color", "#ed5127"), a(".share-public-tip").css("display", "block")) : (i.css("color", "#8b909e"), i.find("b").css("color", "#424e67"), i.find("a").css("color", "#09AAFF"), a(".share-public-tip").css("display", "none"))
            }), e.container.delegate(".choose-value", "click", function () {
                e.container.find(".choose-list").toggle()
            }).delegate(".choose-value", "blur", function () {
                e.container.find(".choose-list").hide()
            }), e.container.delegate(".choose-list li", "mousedown", function () {
                e.validity = a(this).val(), e.validityText = a(this).find("em").text(), e.container.find(".choose-list li").removeClass("choose-checked"), e.container.find(".choose-list li span").remove(), a(this).addClass("choose-checked").append('<span class="icon">&#xe932;</span>'), e.container.find(".choose-value .text").text(e.validityText), e.container.find(".choose-list").hide()
            })
        }, initValidity: function () {
            this.status = s.STATUS_CREATE_PRIVATE, this.validity = s.VALIDITY_INITIALIZE, this.validityText = s.VALIDITY_TEXT_INITIALIZE, this.container.find(".create-link").attr("class", "create-link"), this.container.find(".share-method-line input[type=radio]").eq(0).prop("checked", !0), this.container.find(".radio-icon").removeClass("icon-radio-checked").addClass("icon-radio-non"), this.container.find(".share-method-line input[type=radio]").eq(0).next(".radio-icon").removeClass("icon-radio-non").addClass("icon-radio-checked"), this.container.find(".choose-list li").removeClass("choose-checked"), this.container.find(".choose-list li span").remove(), this.container.find(".choose-list li").eq(1).addClass("choose-checked").append('<span class="icon">&#xe932;</span>'), this.container.find(".choose-value .text").text(this.validityText), this.container.find(".share-validity-tip").text("链接永久有效"), this.container.find(".choose-list").hide()
        }, updateFilesList: function (e) {
            "[object Array]" === Object.prototype.toString.call(e) && (this.publicInfo = null, this.fileslist = e, this.initValidity())
        }, createShareLink: function (e) {
            if ("[object Array]" !== Object.prototype.toString.call(this.fileslist)) return void(disk.DEBUG && console.log("[WARN] the list is not array type , can not create share."));
            if (this.disabledShare) return this.onNeedTips(n().errorMsg(this.shareError)), !1;
            n().ui.tip({
                mode: "loading",
                msg: "正在创建分享链接，请稍候",
                autoClose: !1
            }), this.container.find(".share-validity-tip").text(this.validity && this.validity > 0 ? "链接" + this.validity + "天后失效" : "链接永久有效");
            var i = {schannel: 0, channel_list: "[]", period: this.validity};
            this.status === s.STATUS_CREATE_PRIVATE ? this.createPrivateShareLink(i, e) : this.createPublicShareLink(i, e)
        }, createPrivateShareLink: function (e, i) {
            var t = this, o = t.makePrivatePassword();
            if (a(".share-password", t.container).val(o), e.schannel = 4, e.pwd = o, e.fid_list = [], a.each(this.fileslist, function (i, t) {
                null !== t.fs_id && "undefined" != typeof t.fs_id && e.fid_list.push(t.fs_id)
            }), e.fid_list.length <= 0) {
                var r = "分享的文件不存在，请刷新页面重试";
                return this.onNeedTips(r), this.status = s.STATUS_INITIALIZE, n().ui.hideTip(), !1
            }
            e.fid_list = a.stringify(e.fid_list), a.post("/share/set?channel=chunlei&clienttype=0&web=1", e, function (s) {
                t.createCallBack(s, i, e.pwd)
            }).error(function () {
                t.onNeedTips("请求发生错误，请稍后再试")
            })
        }, createPublicShareLink: function (e, i) {
            var t = this;
            e.path_list = [], a.each(this.fileslist, function (i, t) {
                null !== t.path && "undefined" != typeof t.path && e.path_list.push(t.path)
            }), e.path_list = a.stringify(e.path_list), a.post("/share/pset?channel=chunlei&clienttype=0&web=1", e, function (e) {
                t.createCallBack(e, i)
            }).error(function () {
                t.onNeedTips("请求发生错误，请稍后再试")
            })
        }, createCallBack: function (e, i, t) {
            var o = this;
            if ("string" == typeof e && (e = a.parseJSON(e)), n().ui.hideTip(), 0 === e.errno) {
                o.status === s.STATUS_CREATE_PULICE && (o.publicInfo = {
                    link: e.shorturl || e.link,
                    shareid: e.shareid
                }), o.createsharetipsLdlj = e.createsharetips_ldlj ? " " + e.createsharetips_ldlj : "";
                var r = e.shorturl || e.link;
                "https:" === location.protocol && (r = r.replace("http:", "https:")), a(".share-url", o.container).val(r), i(), o.showQRCode(e.shorturl || "", t || ""), o.setClipboard()
            } else {
                var c = n().accountBan(e.errno);
                c.isBan && (n().ui.hideTip(), e.errno = c.errno, o.disabledShare = !0, o.shareError = e.errno);
                var l = n().errorMsg(e.errno, "请求发生错误，请稍后再试");
                o.onNeedTips(l), o.status = s.STATUS_INITIALIZE
            }
        }, getShortUrl: function (e) {
            var i = /\/s\/(1[0-9a-zA-Z\-_]+)/;
            return i.test(e) ? RegExp.$1 : ""
        }, showQRCode: function (e, i) {
            a("#share").css("width", "760px"), a("#share .dialog-extra").css("width", "530px"), a(".content-bd-right .QR-code").show(), a(".content-bd-right .QR-code .code").remove(), a("#share .QR-code .hide").hide();
            var t = this.getShortUrl(e);
            this.getQRCode(t, i)
        }, getQRCode: function (e, i) {
            var t = this, s = a("#share .QR-code .loading"), o = a("#share .QR-code .failure"),
                r = a("#share .QR-code .success"), c = a("#share .QR-code .down-btn");
            n().message.callPlugin("网盘链接管理-微信小程序二维码@com.baidu.pan", {
                shorturl: e,
                pwd: i,
                retryDom: a("#share .QR-code .retry"),
                fileList: this.fileslist,
                pendingCallback: function () {
                    s.show(), r.hide(), o.hide(), c.unbind("click"), c.attr("href", "javascript:;")
                },
                successCallback: function (e, a, l, d) {
                    n().log.send({
                        type: "wap_home_share_qrcode_create_success",
                        linktype: i && "" !== i ? "private" : "public",
                        qrcodetype: l,
                        discription: "创建外链弹框内二维码成功展示"
                    }), s.hide(), r.show(), o.hide(), e.className = "code", r.prepend(e), t.setQrCodeSuccessContent(r, l), -1 === d ? (c.attr("href", a), c.bind("click", function () {
                        n().log.send({
                            type: "wap_home_share_qrcode_click_download",
                            linktype: i && "" !== i ? "private" : "public",
                            qrcodetype: l,
                            discription: "创建外链弹框内二维码点击下载"
                        })
                    })) : "Edge" === d || d > 9 ? c.bind("click", function () {
                        n().log.send({
                            type: "wap_home_share_qrcode_click_download",
                            linktype: i && "" !== i ? "private" : "public",
                            qrcodetype: l,
                            discription: "创建外链弹框内二维码点击下载"
                        }), window.navigator.msSaveOrOpenBlob(a, "qrcode.png")
                    }) : c.hide()
                },
                failureCallback: function (e) {
                    n().log.send({
                        type: "wap_home_share_qrcode_create_failure",
                        linktype: i && "" !== i ? "private" : "public",
                        qrcodetype: e,
                        discription: "创建外链弹框内二维码创建失败"
                    }), s.hide(), r.hide(), o.show()
                },
                retryCallback: function (e) {
                    n().log.send({
                        type: "wap_home_share_qrcode_click_retry",
                        linktype: i && "" !== i ? "private" : "public",
                        qrcodetype: e,
                        discription: "创建外链弹框内二维码重试"
                    })
                }
            })
        }, setQrCodeSuccessContent: function (e, i) {
            var t = [], n = "";
            switch (i) {
                case"wechat":
                    t = ["将二维码分享给好友，", "对方微信扫一扫即可获取文件"], this.status === s.STATUS_CREATE_PRIVATE && a("#share .QR-code .success .private").show();
                    break;
                case"ordinary":
                    t = ["将二维码分享给好友，", "对方扫一扫即可获取文件"]
            }
            a.each(t, function (e, i) {
                n += "<p>" + i + "</p>"
            }), e.find(".content").html(n)
        }, makePrivatePassword: function () {
            var e = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "m", "n", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
                i = function (e, i) {
                    return Math.round((i - e) * Math.random() + e)
                }, t = function (t) {
                    for (var s = [], a = 1; t >= a; a++) s.push(e[i(0, e.length - 1)]);
                    return s.join("")
                };
            return t(4)
        }, setClipboard: function () {
            var e = this, i = a(".share-url", e.container).val();
            e.status === s.STATUS_CREATE_PRIVATE && (i = "链接: " + i + " 提取码: " + a(".share-password", e.container).val()), i += e.createsharetipsLdlj, e.myClipboard || (e.myClipboard = new o(a("#copyShare"))), e.myClipboard.setText(i), e.myClipboard.on("success", function () {
                a("#copyShare").next(".copy-tips").show()
            }), e.myClipboard.on("error", function () {
                n().ui.tip({mode: "caution", msg: "您的浏览器不支持自动复制，请选中链接后点击右键进行复制。", autoClose: !1, hasClose: !0})
            })
        }, getPublicInfo: function () {
            return this.publicInfo
        }
    }, t.exports = s
});
;define("function-widget-1:guide/util/promo/activity/couponText.js", function (i, s, o) {
    function n() {
        a.on("click", ".btn-consume", function () {
            t(this).parent().remove(), e.hide(), window.open("/buy/checkoutcounter?svip=1&from=coupon", "_blank")
        }), a.on("click", ".dialog-close,.btn-activity-over", function () {
            t(this).parent().remove(), e.hide()
        })
    }

    var e = i("system-core:system/uiService/canvas/canvas.js"), t = i("base:widget/libs/jquerypacket.js"),
        a = t("body"), c = [function (i) {
            if (0 === i.length) return "";
            for (var s = 0, o = [], n = 0, e = i.length; e > n; n++) {
                var t = parseFloat(i[n].value / 100, 10);
                s += t, o.push(t + "元")
            }
            return '<div class= "get-coupon-dialog"><span class="dialog-close">&times;</span><div class="coupon-value"><span>' + s + '</span>元</div><div class="coupon-type">超级会员优惠券</div><div class="coupon-msg">*优惠券包括：' + o.join("、") + '各一张</div><div class="btn-dialog btn-consume">立即使用</div></div>'
        }, function () {
            return '<div class="activity-over"><span class="dialog-close">&times;</span><div class="activity-over-msg">很遗憾，活动已结束。下次请早一点来哦~</div><div class="btn-dialog btn-activity-over">知道了</div></div>'
        }, function () {
            return '<div class="coupon-get-repeat"><span class="dialog-close"></span><div class="coupon-repeat-msg">您已领取过优惠券咯，快去使用吧~</div><div class="btn-dialog btn-coupon-repeat btn-consume">立即使用</div></div>'
        }];
    o.exports = function (i, s) {
        var o = c[i];
        o && (a.append(o(s)), e.addAnimate({opacity: .5}).show(), n())
    }, o.exports.NORMAL = 0, o.exports.OVER = 1, o.exports.REPEAT = 2
});
;define("function-widget-1:guide/util/promo/activity/vipCoupon.js", function (e, t, o) {
    function i() {
        a.getItem(d) || a.setItem(d, !0)
    }

    var n = e("base:widget/libs/jquerypacket.js"), s = e("function-widget-1:guide/util/promo/activity/couponText.js"),
        a = e("base:widget/storage/storage.js"), c = e("function-widget-1:guide/context.js").getContext,
        l = window.yunData, r = {}, u = +l.CURRACTIVITYCODE, g = 1e3 * +l.activity_end_time,
        m = "disk" === (/^\/(\w+?)\//.exec(location.pathname) || [])[1] ? "home" : "share";
    9 === u ? r = {
        title: "2017圣诞节领券活动",
        flag: "coupon_consume",
        name: "coupon_consume",
        storageKey: "christmas_2017",
        className: "coupon-banner",
        btnCloseClass: "coupon-consume-close",
        width: 288,
        height: 130,
        backgroundImage: "url(/box-static/function-widget-1/guide/util/promo/img/christmas_2017_12c1871.png)"
    } : 10 === u ? r = {
        flag: "svip_present",
        title: "超级会员满赠活动",
        name: "svip_buy_present",
        className: "gift-banner",
        btnCloseClass: "gift-close",
        width: 310,
        height: 144,
        backgroundImage: "url(../img/gift_banner_2nd.png)"
    } : 2 === +l.SHOWVIPAD && (r = {
        title: "百度网盘幸运转盘",
        flag: "lottery_showlove",
        name: "lotteryShowlove",
        storageKey: "lottery_showlove",
        className: "showlove-banner",
        btnCloseClass: "showlove-close",
        width: 216,
        height: 126,
        backgroundImage: "url(/box-static/function-widget-1/guide/util/promo/img/lottery-showlove_d2edb16.png)"
    });
    var d = (r.storageKey || "hide_couponbanner") + "_uk_" + l.MYUK;
    o.exports = {
        title: r.title,
        name: r.name,
        className: r.className,
        cssText: {width: r.width, height: r.height, backgroundImage: r.backgroundImage},
        href: r.href,
        btnCloseClass: r.btnCloseClass,
        isRender: function () {
            return !!r.title
        },
        clickCallback: function () {
            var e = c();
            if ("coupon_consume" === r.flag) n.ajax({
                url: "/rest/2.0/membership/activity/coupon?method=consume",
                method: "GET",
                dataType: "json",
                success: function (e) {
                    e.coupon_list && e.coupon_list.length && s(s.NORMAL, e.coupon_list)
                },
                error: function (t) {
                    var o = +(/error_code":(\d+)/.exec(t.responseText) || [])[1];
                    if (o) switch (o) {
                        case 39521:
                            s(s.OVER);
                            break;
                        case 39515:
                            s(s.REPEAT);
                            break;
                        case 39514:
                            e.ui.alert("您无权领取优惠券");
                            break;
                        case 39516:
                            e.ui.alert("优惠券已领光")
                    }
                }
            }), e.log.send({type: "disk_home_coupon_consume_click"}); else if ("svip_present" === r.flag) {
                var t = (new Date).getTime();
                if (!g) return;
                t > g ? s(s.OVER) : window.open("/buy/checkoutcounter?svip=1&activityfrom=give", "_blank"), e.log.send({
                    type: "disk_home_gift_banner_click_from_give",
                    from: "give"
                }), e.log.sendBaiduLog("disk_home_gift_banner_click", "网盘满赠广告位点击")
            } else "lottery_showlove" === r.flag && window.open("https://pan.baidu.com/huodong/lottery/showlove?from=" + m, "_blank");
            i()
        },
        closeCallback: i
    }
});
;define("function-widget-1:guide/util/ablityShow/slide/slide.js", function (o, e, u) {
    var t = o("base:widget/libs/jquerypacket.js"), i = {
        supportCss3: function (o) {
            for (var e = ["webkit", "Moz", "ms", "o"], u = [], t = document.documentElement.style, i = function (o) {
                return o.replace(/-(\w)/g, function (o, e) {
                    return e.toUpperCase()
                })
            }, s = 0; s < u.length; s++) u.push(i(e[s] + "-" + o));
            u.push(i(o));
            for (var n = 0; n < u.length; n++) if (u[n] in t) return !0;
            return !1
        }
    }, s = function (o) {
        var o = o || {}, e = {
            autoHideButton: o.autoHideButton || !1,
            autoRun: o.autoRun || !1,
            autoTime: o.autoTime || 3e3,
            autoStop: o.autoStop || !0,
            indexCallBack: "function" == typeof o.indexCallBack ? o.indexCallBack : function () {
                o.indexCallBack()
            },
            firstCallBack: "function" == typeof o.firstCallBack ? o.firstCallBack : function () {
            },
            lastCallBack: "function" == typeof o.lastCallBack ? o.lastCallBack : function () {
                o.lastCallBack()
            }
        }, u = {focusLeft: 0, focusIndex: 0, foucusLen: 0, autoTimer: null}, s = {
            moduleFocusSwitchNext: ".module-focus-switch .next",
            moduleFocusSwitchPrev: ".module-focus-switch .prev",
            moduleFocusUlLi: ".module-focus-ul li",
            moduleFocusUl: ".module-focus-ul",
            moduleFocusDiv: ".module-focus-div",
            moduleFocusFocusbarUl: ".module-focus-focusbar ul",
            moduleFocusFocusbarLi: ".module-focus-focusbar ul li",
            moduleFocusBoxClose: ".module-focus-box .close",
            moduleFocusBox: ".module-focus-box",
            beginBtn: ".module-focus-box .begin-btn",
            userAblityShow: ".module-focus-box .user-ablity-show",
            userAblityShow1: ".module-focus-box .user-ablity-show:eq(0)",
            userAblityShow2: ".module-focus-box .user-ablity-show:eq(1)",
            userAblityShow3: ".module-focus-box .user-ablity-show:eq(2)",
            userAblityShow4: ".module-focus-box .user-ablity-show:eq(3)"
        }, n = {
            startFocus: function () {
                var o = t(s.moduleFocusUlLi).length;
                u.foucusLen = o, n.setFocusIndex(0, n.focusCallBack), t(s.moduleFocusSwitchPrev).click(function () {
                    return u.focusIndex <= 0 ? !1 : (u.focusIndex -= 1, n.indexFunction(u.focusIndex), void n.setFocusIndex(u.focusIndex, n.focusCallBack))
                }), t(s.moduleFocusSwitchNext).click(function () {
                    return u.focusIndex >= u.foucusLen - 1 ? !1 : (u.focusIndex += 1, n.indexFunction(u.focusIndex), void n.setFocusIndex(u.focusIndex, n.focusCallBack))
                }), t("body").on("click", s.moduleFocusFocusbarLi, function () {
                    var o = t(this).index();
                    n.setFocusIndex(o, n.focusCallBack)
                }), t("body").on("mouseover", s.moduleFocusBox, function () {
                    n.stopAutoRun()
                }), t("body").on("mouseleave", s.moduleFocusUl, function () {
                    n.autoRun()
                })
            }, setFocusIndex: function (o, i) {
                u.focusIndex = o;
                for (var a = "", l = 0; l < u.foucusLen; l++) a += o === l ? '<li class="active"><a href="javascript:void(0);"></a> </li>' : '<li><a href="javascript:void(0);"></a> </li>';
                u.focusIndex === u.foucusLen - 1 ? (n.lastFunction(u.focusIndex), e.autoHideButton && (t(s.moduleFocusSwitchPrev).fadeIn(300), t(s.moduleFocusSwitchNext).fadeOut(300))) : 0 === u.focusIndex ? (n.firstFunction(u.focusIndex), e.autoHideButton && (t(s.moduleFocusSwitchNext).fadeIn(300), t(s.moduleFocusSwitchPrev).fadeOut(300))) : (t(s.moduleFocusSwitchNext).fadeIn(300), t(s.moduleFocusSwitchPrev).fadeIn(300)), t(s.moduleFocusFocusbarUl).find("li").length <= 0 ? t(s.moduleFocusFocusbarUl).html(a) : (t(s.moduleFocusFocusbarUl).find("li").removeClass("active"), t(s.moduleFocusFocusbarUl).find("li").eq(o).addClass("active"));
                var c = t(s.moduleFocusDiv).width();
                t(s.moduleFocusUl).animate({left: -c * o}, 500), "function" == typeof i && i(o)
            }, focusCallBack: function (o) {
                var e = i.supportCss3("animation");
                return e ? void(0 === o ? n.animate1() : 1 === o ? n.animate2() : 2 === o ? n.animate3() : 3 === o && n.animate4()) : (n.setNotSupportClass(), !1)
            }, lastFunction: function (o) {
                e.autoStop && n.stopAutoRun(), e.lastCallBack(o)
            }, firstFunction: function (o) {
                e.firstCallBack(o)
            }, indexFunction: function (o) {
                e.indexCallBack(o)
            }, autoRun: function () {
                e.autoRun && (u.autoTimer = setInterval(function () {
                    u.focusIndex += 1, n.setFocusIndex(u.focusIndex % u.foucusLen, n.focusCallBack)
                }, e.autoTime))
            }, stopAutoRun: function () {
                clearInterval(u.autoTimer)
            }, animate1: function () {
                t(s.userAblityShow1).find(".animate").removeClass("animate"), setTimeout(function () {
                    t(s.userAblityShow1).find(".img-slide-left").addClass("animate");
                    var o = t(s.userAblityShow1).find(".img-slide-left")[0], e = t(s.userAblityShow1).find(".click")[0];
                    return o || e ? void o.addEventListener("animationend", function () {
                        t(s.userAblityShow1).find(".click").addClass("animate"), setTimeout(function () {
                            t(s.userAblityShow1).find(".hover-img").addClass("animate"), t(s.userAblityShow1).find(".click").removeClass("animate")
                        }, 700)
                    }, !1) : !1
                }, 500)
            }, animate2: function () {
                t(s.userAblityShow2).find(".animate").removeClass("animate"), setTimeout(function () {
                    t(s.userAblityShow2).find(".img-slide-left").addClass("animate");
                    var o = t(s.userAblityShow2).find(".img-slide-left")[0],
                        e = t(s.userAblityShow2).find(".img-click")[0];
                    return o || e ? void o.addEventListener("animationend", function () {
                        t(s.userAblityShow2).find(".img-click").addClass("animate"), setTimeout(function () {
                            t(s.userAblityShow2).find(".hover-img2").addClass("animate"), t(s.userAblityShow2).find(".img-click").removeClass("animate")
                        }, 700)
                    }, !1) : !1
                }, 500)
            }, animate3: function () {
                t(s.userAblityShow3).find(".animate,.show").removeClass("animate").removeClass("show"), setTimeout(function () {
                    t(s.userAblityShow3).find(".img-slide-left").addClass("animate");
                    var o = t(s.userAblityShow3).find(".img-slide-left")[0],
                        e = t(s.userAblityShow3).find(".message-click")[0];
                    return o || e ? void o.addEventListener("animationend", function () {
                        t(s.userAblityShow3).find(".message-img-1").addClass("show"), t(s.userAblityShow3).find(".message-click").addClass("animate"), setTimeout(function () {
                            t(s.userAblityShow3).find(".message-img-1").addClass("animate"), t(s.userAblityShow3).find(".message-img-2").addClass("animate")
                        }, 700)
                    }, !1) : !1
                }, 500)
            }, animate4: function () {
                t(s.userAblityShow4).find(".animate").removeClass("animate"), t(s.userAblityShow4).find(".begin-btn").hide(), setTimeout(function () {
                    t(s.userAblityShow4).find(".begin-btn").fadeIn(300), t(s.userAblityShow4).find(".cloud").addClass("animate")
                }, 500)
            }, setNotSupportClass: function () {
                t(s.userAblityShow).find(".img-slide-left").addClass("not-support"), t(s.userAblityShow).find(".cloud").addClass("not-support"), t(s.userAblityShow).find(".hover-img2").addClass("not-support")
            }
        };
        n.startFocus(), n.autoRun()
    };
    u.exports = s
});
;define("function-widget-1:guide/util/marchActivityTip/marchActivityTip.js", function (t, e, i) {
    var n = t("base:widget/libs/jquerypacket.js"), o = t("base:widget/storage/storage.js"),
        c = t("function-widget-1:guide/context.js").getContext, a = o.getItem("sendMonthlyTipUserType"), s = "";
    1 == a || 5 == a ? s = '<div class="marchActivityTip-content march-activity-common">' : (2 == a || 3 == a || 4 == a) && (s = '<div class="marchActivityTip-content2 march-activity-common">');
    var r = s + '<div class="marchActivityTip-close"></div></div>', d = {
        showTip: function () {
            n("body").append(r), d.setStorage(), c().log.send({type: "web_send_monthly_tip_open_" + a, platform: "web"})
        }, bindEvent: function () {
            n(".march-activity-common").click(function () {
                c().log.send({
                    type: "web_send_monthly_tip_click_" + a,
                    platform: "web"
                }), window.open("/huodong/yearcard")
            }), n(".marchActivityTip-close").click(function () {
                c().log.send({type: "web_send_monthly_tip_close_" + a, platform: "web"}), d.delTip()
            })
        }, delTip: function () {
            n(".march-activity-common").remove()
        }, setStorage: function () {
            var t = new Date, e = t.getDate().toString(), i = (t.getMonth() + 1).toString(),
                n = t.getFullYear().toString(), c = n + i + e;
            o.setItem("sendMonthlyTip", c)
        }
    };
    i.exports.show = function () {
        console.log("show"), d.showTip(), d.bindEvent()
    }
});
;define("function-widget-1:guide/util/openFileTip/openFileTip.js", function (e, o, i) {
    function t(e) {
        var o = d().list, i = 0, t = 0, n = "";
        return o.mapFirstFileByCategory(e, function (e, o) {
            var r = o.offset(), s = r.top, d = r.left + 12;
            return i ? i > s && (i = s, t = d, n = e) : (i = s, t = d, n = e), !0
        }), i && t ? {fileExt: n, left: t, top: i} : null
    }

    var n = e("base:widget/libs/underscore.js"), r = e("base:widget/libs/jquerypacket.js"),
        s = e("base:widget/storage/storage.js"), d = e("function-widget-1:guide/context.js").getContext,
        a = "flag_show_functions_", f = [{
            category: [".mm", ".xmind", ".mmap"],
            message: "单击即可查看思维导图，免去下载烦恼~"
        }, {category: [".dxf", ".dwt", ".dwg", ".dws"], message: "单击即可查看CAD，免去下载烦恼~"}, {
            category: [".zip", ".rar"],
            message: "单击即可查看压缩包，免去下载烦恼~"
        }], l = {
            off: 142, $dom: null, renderAndEvent: function (e) {
                l.$dom = r('<div id="wizard-functions-intro" style="display:none;"><div class="intro-inner">' + e.message + '</div><div class="intro-bg"><i class="triangle-top"></i><a class="intro-close icon icon-close" hidefocus="true" href="javascript:void(0);"></a></div></div>'), r(document.body).append(l.$dom);
                var o = 0, i = e.left;
                if (i + l.$dom.find(".intro-bg").outerWidth() + 9 > r(window).width() && (i = i - l.$dom.find(".intro-bg").outerWidth() + 90, l.$dom.find(".triangle-top").addClass("right-triangle")), e.orientation && "top" === e.orientation) {
                    if (o = e.top - l.$dom.find(".intro-bg").outerHeight() - 9, 100 >= o) return !1;
                    l.$dom.find(".intro-bg").addClass("orientation-top")
                } else o = e.top + 9;
                l.$dom.css({
                    top: o,
                    left: i
                }).show(), r.isFunction(e.callBack) && e.callBack(!0), l.$dom.find(".intro-close").one("click", function () {
                    l.$dom.remove()
                }), r("body").one("click", function () {
                    l.$dom.remove()
                }), window.history && r(window).on("popstate", function () {
                    l.$dom.remove()
                }), d().message.listenSystem("list-view-scroll", function () {
                    setTimeout(function () {
                        l.$dom && l.$dom.remove()
                    })
                })
            }, showBubbleTip: function (e) {
                if (!e.message) throw new Error("[openFileTip] The message of tip is must!");
                if (!e.left) throw new Error("[openFileTip] The positionX of tip is must!");
                if (!e.top) throw new Error("[openFileTip] The positionY of tip is must!");
                this.renderAndEvent(e)
            }
        };
    i.exports.show = function () {
        var e = [];
        n.chain(f).filter(function (e) {
            return !s.getItem(a + e.category.join("_"))
        }).each(function (o) {
            [].push.apply(e, o.category)
        });
        var o = t(e);
        if (null !== o) {
            var i = o.fileExt, r = n.filter(f, function (e) {
                return n.indexOf(e.category, i) > -1
            })[0];
            if (r) {
                var d = r.message, c = a + r.category.join("_");
                l.showBubbleTip({
                    message: d, left: o.left, top: o.top, orientation: "top", callBack: function () {
                        s.setItem(c, !0)
                    }
                }), window.yunHeader && window.yunHeader.fontIe && window.yunHeader.fontIe.api && window.yunHeader.fontIe.api.doAddIcon()
            }
        }
    }
});
;define("function-widget-1:guide/util/classifyTip/classifyTip.js", function (i, s, a) {
    var n = i("base:widget/libs/jquerypacket.js");
    a.exports.show = function () {
        var i = n(".classify-button");
        if (i.length) {
            var s = n('<div class="module-classifyDialog"><div class="triangle"></div><div class="triangle2"></div><div class="module-content"><p class="content">全新智能分类，找图更便捷。</p><a class="known" href="javascript:void(0);">知道了</a></div></div>');
            i.append(s), s.on("click", "a.known", function (i) {
                n(i.target).parents(".module-classifyDialog").remove()
            })
        }
    }
});
;define("function-widget-1:guide/util/picNewTip/picNewTip.js", function (e, i, c) {
    var o = e("base:widget/libs/jquerypacket.js"), l = e("function-widget-1:guide/context.js").getContext;
    c.exports.show = function () {
        o("body").prepend('<div class="welcome-mask"></div><div class="welcome-box">    <div class="welcome-bg">        <div class="welcome-pic"></div>        <div class="welcome-word"></div>        <div class="welcome-begin"></div>    </div>    <div class="welcome-close"></div></div>'), o(".welcome-begin").on("click", function () {
            window.location.href = "/disk/timeline", l().log.send({type: "picNew_guide_close"})
        }), o(".welcome-close").on("click", function () {
            o(".welcome-box").remove(), o(".welcome-mask").remove()
        })
    }
});
;define("function-widget-1:guide/util/cardHolder/cardHolderTip/cardHolderTip.js", function (e, d, i) {
    var o = e("base:widget/libs/jquerypacket.js"), s = e("base:widget/storage/storage.js"), c = window.yunData, t = {
        base: function () {
            return ['<div class="module-cardtip-mask"></div>', '<div class="module-cardtip-box">', '<div class="card"></div>', '<div class="module-content">', '<div class="close icon icon-close"></div>', '<div class="words">', '<p class="tipsword">新增我的卡包，证件存储更加安全！</p>', '<p class="tip-button">知道了</p>', "</div>", "</div>"]
        }, render: function () {
            s.setItem(c.MYUK + "_card_tip", !0);
            var e = t.base();
            o("body").append(e.join(""))
        }, events: function () {
            o(".close").on("click", function () {
                o(".module-cardtip-mask").remove(), o(".module-cardtip-box").remove()
            }), o(".tip-button").on("click", function () {
                o(".module-cardtip-mask").remove(), o(".module-cardtip-box").remove()
            })
        }
    }, a = {
        show: function () {
            t.render("success"), t.events()
        }
    };
    i.exports = a
});
;define("function-widget-1:guide/util/cardHolder/cardHolderKeyImport/cardHolderKeyImport.js", function (e, t, n) {
    var o = e("function-widget-1:guide/context.js").getContext;
    n.exports.show = function (e, t) {
        o().message.callPlugin("一键导入证件@com.baidu.pan", {manual: !1, data: t})
    }
});
;define("function-widget-1:guide/util/cardHolder/cardHolderGiveSpace/cardHolderGiveSpace.js", function (e, d, c) {
    function a(e) {
        r().log.send({type: e, value: "", sendServerLog: !0})
    }

    function o(e) {
        i("body").append('<div class="module-cardguide-mask"></div><div class="module-cardguide-box"><div class="card"></div><div class="module-content"><div class="close icon icon-close"></div><div class="words"><p class="tipsword">' + e + '</p><p class="spaceword">在"我的卡包"中，新添加1张证件即可获得。</p><p class="space-button">去添加</p></div></div></div>')
    }

    function t(e) {
        function d() {
            i(".module-cardguide-mask").remove(), i(".module-cardguide-box").remove()
        }

        var c = r();
        i(".close").on("click", function () {
            n.setItem(s.MYUK + "_card_space", !0), c.log.send({
                type: "cardholder_activity_close_time",
                time: +new Date - e,
                url: "//update.pan.baidu.com/statistics",
                clienttype: "0",
                op_from: "webcardhandle",
                op: "cardholder"
            }), a("cardHolder_activity_close"), d()
        }), i(".space-button").on("click", function () {
            d(), a("cardHolder_activity_addBtn_click"), c.message.callPlugin("网盘二级密码@com.baidu.pan", {
                success: function () {
                    a("cardHolder_activity_addBtn_enter_cardholder"), c.router.push({
                        name: "cardHolder",
                        query: {path: "/cardholder", vmode: "list"}
                    })
                }
            })
        })
    }

    var i = e("base:widget/libs/jquerypacket.js"), s = window.yunData,
        r = e("function-widget-1:guide/context.js").getContext, n = e("base:widget/storage/storage.js");
    c.exports.show = function (e, d) {
        n.setItem(s.MYUK + "_card_space", !1), o(d), t(+new Date), a("cardHolder_activity_show")
    }
});
;define("function-widget-1:guide/util/promo/promo.js", function (a, e, s) {
    "use strict";
    var c = a("base:widget/libs/jquerypacket.js"), o = a("function-widget-1:guide/util/promo/activity/vipCoupon.js");
    s.exports.show = function () {
        var a = o.isRender();
        if (a) {
            var e = o.href ? '<a href="' + o.href + '" target="_blank"></a>' : "";
            c(document.body).append('<div class="coupon-banner-active">' + e + '<i class="banner-close"></i></div>');
            var s = c(".coupon-banner-active"), n = c(".banner-close");
            s.css(o.cssText), o.className && s.addClass(o.className), o.btnCloseClass && n.addClass(o.btnCloseClass), s.on("click", function () {
                o.clickCallback && o.clickCallback(), s.remove()
            }), n.on("click", function (a) {
                a.stopPropagation(), o.closeCallback && o.closeCallback(), s.remove()
            })
        }
    }
});
;define("function-widget-1:guide/util/directorTip/directorTip.js", function (e, t, o) {
    var n = e("base:widget/libs/jquerypacket.js"), i = e("base:widget/storage/storage.js"),
        a = e("function-widget-1:guide/context.js").getContext, c = window.yunData, r = c.MYNAME + "_director_guide",
        s = !1, d = {
            node: {panel: 'div[node-type="directorTip-panel"]', close: 'em[node-type="directorTip-close"]'},
            api: {categoryList: "/api/categorylist"},
            conf: {ajaxControl: !1, hasTips: !1},
            init: function () {
                s || (s = !0, d.preBuild(), d.getImageNum())
            },
            preBuild: function () {
                var e = '<div class="directorTip-panel" node-type="directorTip-panel"><em class="directorTip-close" node-type="directorTip-close"></em></div>';
                n("body").append(e), d.bindEvents()
            },
            bindEvents: function () {
                n(d.node.close).on("click", function () {
                    d.hide(), d.conf.hasTips = !1, i.setItem(r, 1)
                })
            },
            hide: function () {
                d.conf.hasTips && n(d.node.panel).hide()
            },
            show: function (e, t) {
                var o = n(d.node.panel);
                d.conf.hasTips && (o.css("top", e + 30), o.css("left", t - 150), o.show())
            },
            getImageNum: function () {
                var e = {category: 3, num: 100};
                d.sendAjax({url: d.api.categoryList, type: "POST", data: e}, function (e) {
                    e.info.length >= 100 && (d.conf.hasTips = !0)
                })
            },
            sendAjax: function (e, t, o) {
                d.conf.ajaxControl || (d.conf.ajaxControl = !0, n.ajax({
                    url: e.url,
                    type: e.type || "GET",
                    data: e.data || "",
                    dataType: "json",
                    success: function (e) {
                        d.conf.ajaxControl = !1, 0 === e.errno ? "function" == typeof t && t(e) : "function" == typeof o && o(e)
                    },
                    error: function (e) {
                        d.conf.ajaxControl = !1, "function" == typeof o && o(e)
                    }
                }))
            }
        };
    o.exports.show = function () {
        var e = a().Broker.getButtonBroker("listTools");
        e && e.on("filesSelect", function (e) {
            if (1 === e.length) {
                d.init();
                var t = n(".g-button .icon-director").parents(".g-button");
                if (0 === t.length) return !1;
                if (!t.is(":hidden")) {
                    var o = t.offset();
                    0 == o.top && 0 == o.left ? d.hide() : d.show(o.top, o.left)
                }
            }
        })
    }
});
;define("function-widget-1:guide/util/enterpriseTip/enterpriseTip.js", function (e, t, n) {
    "use strict";
    var i = e("base:widget/libs/jquerypacket.js"), s = e("base:widget/storage/storage.js"),
        r = e("function-widget-1:guide/context.js"), a = r.getContext, o = window.yunData, p = "/api/userflag",
        c = "enterpriseTip_" + o.MYUK,
        l = '<span node-type="icon-warn" class="icon-warn"></span><span class="enterprise-text">您的帐号近期登录设备过多，如非本人操作请<a class="enterprise-link modify-passwd">修改密码</a>。如需多人共享文件，请使用<a class="enterprise-link register-btn">百度企业网盘</a>。</span>',
        u = {
            buildTip: function () {
                var e = a(), t = e.toolbar.setTipContent({
                    content: l,
                    styleType: 1,
                    className: "enterprise-tip",
                    onClose: function () {
                        s.setItem(c, +new Date + "_1"), e.toolbar.prevDom(!1)
                    }
                });
                t.find(".modify-passwd").click(function () {
                    s.setItem(c, +new Date + "_1"), window.open("https://passport.baidu.com/v2/account/password", "_blank")
                }), t.find(".register-btn").click(function () {
                    e.log.sendBaiduLog("企业版共享帐号引导开通", "企业版共享帐号引导开通"), window.open("https://eyun.baidu.com/enterprise/register?from=yunanquan", "_blank")
                }), e.toolbar.prevDom(t, 2), e.log.send({type: "enterpriseTip_shareAccount"}), e.log.sendBaiduLog("企业版共享帐号引导", "企业版共享帐号引导展现")
            }, checkServer: function () {
                var e, t = s.getItem("getServerUserFlagApi"), n = 0;
                return t && (e = +t.split("_")[0], n = +t.split("_")[1]), {localWeek: e, isShow: n}
            }
        };
    n.exports.show = function () {
        var e = r.getYearWeek({timestamp: +new Date}), t = u.checkServer();
        e === t.localWeek ? t.isShow && u.buildTip() : i.ajax({
            url: p,
            type: "GET",
            data: {operation: "query", uk: o.MYUK},
            success: function (t) {
                var n = Number(null != t.flag);
                n && u.buildTip(), s.setItem("getServerUserFlagApi", e + "_" + n)
            }
        })
    }
});
;define("function-widget-1:guide/util/trialVipTip/trialVipTip.js", function (i, s, a) {
    var e = i("base:widget/libs/jquerypacket.js"), t = i("system-core:system/uiService/canvas/canvas.js");
    a.exports.show = function (i) {
        var s = i ? i.isVip : !1, a = "fail", n = '<span class="btn btn-fail"></span>';
        s && (a = "success", n = '<a class="btn btn-success" href="http://yun.baidu.com/buy/center?tag=1&from=homepage" target="_blank"></a>');
        var c = e('<div class="trialVipDialog"><div node-type="result" class="result ' + a + '">' + n + "</div></div>");
        e(document.body).append(c), t.addAnimate({opacity: .7}).show(), c.find(".btn").click(function () {
            c.remove(), t.hide()
        })
    }
});
;define("function-widget-1:guide/util/ablityShow/ablityShow.js", function (i, o, s) {
    var t = i("base:widget/libs/jquerypacket.js"),
        l = (i("base:widget/storage/storage.js"), i("function-widget-1:guide/context.js"), i("function-widget-1:guide/util/ablityShow/slide/slide.js")),
        c = ["<li>", '<div class="user-ablity-show">', '<div class="img">', '<img class="main-img img-slide-left" ', 'src="/box-static/function-widget-1/guide/util/ablityShow/img/_nomd5/ablity-1-1.png">', '<a class="click" href="javascript:void(0);"></a>', '<div class="arrow"></div>', '<div class="hover-img">', '<img class="main-img" src="/box-static/function-widget-1/guide/util/ablityShow/img/_nomd5/ablity-1-2.png"/>', '<div class="img-icons">', '<img src="/box-static/function-widget-1/guide/util/ablityShow/img/_nomd5/ablity-1-2-01.png"/>', '<img src="/box-static/function-widget-1/guide/util/ablityShow/img/_nomd5/ablity-1-2-02.png"/>', '<img src="/box-static/function-widget-1/guide/util/ablityShow/img/_nomd5/ablity-1-2-03.png"/>', '<img src="/box-static/function-widget-1/guide/util/ablityShow/img/_nomd5/ablity-1-2-04.png"/>', "</div>", "</div>", "</div>", '<div class="bottom">', '<div class="body-text">各种文件安全存储</div>', "<p>可以上传文档，图片，视频等各种文件到云端</p>", "</div>", "</div>", "</li>", "<li>", '<div class="user-ablity-show">', '<div class="img"><img class="main-img img-slide-left" ', 'src="/box-static/function-widget-1/guide/util/ablityShow/img/_nomd5/ablity-2-1.png"></div>', '<a class="img-click" href="javascript:void(0);"></a>', '<div class="img-arrow"></div>', '<div class="hover-img2">', '<img src="/box-static/function-widget-1/guide/util/ablityShow/img/_nomd5/ablity-2-2.png"/> </div>', '<div class="bottom">', '<div class="body-text">多种文件随时预览</div>', "<p>随时随地在线预览图片，文档，视频，压缩包等文件</p>", "</div>", "</div>", "</li>", "<li>", '<div class="user-ablity-show">', '<div class="img">', '<img class="main-img img-slide-left" ', 'src="/box-static/function-widget-1/guide/util/ablityShow/img/_nomd5/ablity-3-1.png">', '<a class="message-click" href="javascript:void(0);"></a>', '<div class="message-arrow"></div>', '<div class="message-box">', '<img class="message-img-1" src="/box-static/function-widget-1/guide/util/ablityShow/img/_nomd5/ablity-3-3.png"/>', '<img class="message-img-2" src="/box-static/function-widget-1/guide/util/ablityShow/img/_nomd5/ablity-3-2.png"/>', "</div>", "</div>", '<div class="bottom">', '<div class="body-text">云端文件便捷分享</div>', "<p>点击“分享”轻松便捷与好友分享云端文件</p>", "</div>", "</div>", "</li>", "<li>", '<div class="user-ablity-show last">', '<div class="img">', '<a class="g-button g-button-large g-button-blue begin-btn">', '<span class="g-button-right"><span class="text">立即体验</span></span>', "</a>", "</div>", '<div class="logo">', '<img src="/box-static/function-widget-1/guide/util/ablityShow/img/_nomd5/ablity-4-logo.png"/>', "</div>", '<div class="cloud">', '<img src="/box-static/function-widget-1/guide/util/ablityShow/img/_nomd5/ablity-4-cloud.png"/>', "</div>", "</li>"].join(""),
        d = function () {
            return ['<div class="module-mask-trans50"></div>', '<div class="module-focus-box">', '<div class="close icon icon-close"></div>', '<div class="module-focus-switch">', '<div class="prev"><a href="javascript:void(0);" ></a></div>', '<div class="next"><a href="javascript:void(0);" ></a></div>', "</div>", '<div class="module-focus-div">', '<ul class="module-focus-ul">' + c + "</ul>", "</div>", '<div class="module-focus-focusbar">', "<ul>", "</ul>", "</div>", "</div>"].join("")
        }, a = {
            obj: {focusLeft: 0, focusIndex: 0, foucusLen: 0},
            mod: {
                moduleFocusSwitchNext: ".module-focus-switch .next",
                moduleFocusSwitchPrev: ".module-focus-switch .prev",
                moduleFocusUlLi: ".module-focus-ul li",
                moduleFocusUl: ".module-focus-ul",
                moduleFocusDiv: ".module-focus-div",
                moduleFocusFocusbarUl: ".module-focus-focusbar ul",
                moduleFocusFocusbarLi: ".module-focus-focusbar ul li",
                moduleFocusBoxClose: ".module-focus-box .close",
                moduleFocusBox: ".module-focus-box",
                beginBtn: ".module-focus-box .begin-btn"
            },
            startFocus: function () {
                var i = t("body");
                i.append(d()).hide().fadeIn(300), l({
                    autoHideButton: !0, lastCallBack: function () {
                        setTimeout(function () {
                            t("body").on("click", ".module-mask-trans50", function () {
                                a.closeFocus()
                            })
                        }, 300)
                    }, indexCallBack: function () {
                        t("body").off("click", ".module-mask-trans50")
                    }, autoRun: !1
                }), i.on("click", a.mod.beginBtn, function () {
                    a.closeFocus()
                }), i.on("click", a.mod.moduleFocusBoxClose, function () {
                    a.closeFocus()
                })
            },
            setFocusIndex: function (i) {
                a.obj.focusIndex = i;
                for (var o = "", s = 0; s < a.obj.foucusLen; s++) o += i === s ? '<li class="active"><a href="javascript:void(0);"></a> </li>' : '<li><a href="javascript:void(0);"></a> </li>';
                t(a.mod.moduleFocusFocusbarUl).html(o);
                var l = t(a.mod.moduleFocusDiv).width();
                t(a.mod.moduleFocusUl).animate({left: -l * i}, 500)
            },
            closeFocus: function () {
                t(".module-mask-trans50").fadeOut(300, function () {
                    t(".module-mask-trans50").remove()
                }), t(a.mod.moduleFocusBox).fadeOut(300, function () {
                    t(a.mod.moduleFocusBox).remove()
                })
            }
        };
    s.exports.show = function () {
        a.startFocus()
    }
});
;define("function-widget-1:guide/util/shareDirTip/shareDirRootChange.js", function (t, e, i) {
    function o() {
        var t = s();
        if (0 === t.list.getCurrentList().length) {
            var e = t.ui.cacheManage.getCache().list, i = t.tools.topMountManager.FILE_IDENTITY.SHARE;
            a.sharedir = 0, t.tools.topMountManager.demount("list", e, "/", i), t.tools.topMountManager.removeConfByPath(i), t.router.push({
                name: "list",
                query: {path: "/"}
            })
        }
    }

    function n(t) {
        for (var e = t.length, i = t[0].filename, n = 0, a = /[\u4E00-\u9FA5]/, r = 0; r < i.length; r++) if (a.test(i[r]) ? n += 2 : n++, n > 40) {
            i = i.substr(0, r) + "...";
            break
        }
        var g = "";
        i.length > 0 ? (g += '"' + i + '"', g += e > 1 ? "等" + e + "个文件夹" : "文件夹", g += "已取消共享或将您移除，无法继续查看。") : g += "部分文件夹已取消共享或将您移除，无法继续查看。";
        var l = s().ui.window({
            title: "文件夹已被取消共享",
            lock: !0,
            close: !0,
            className: "sharedir-root-change-dialog",
            width: "450px",
            height: "200px",
            body: '<p class="dissmiss-text">' + g + "</p>",
            position: {xy: "center"},
            onClose: o,
            draggable: !1,
            buttons: [{
                type: "big",
                title: "知道了",
                color: "blue",
                position: "center",
                padding: ["30px", "30px"],
                click: function () {
                    l.hide(), o()
                }
            }]
        });
        l.show(), l.$dialog.find(".dissmiss-text").height() < 36 && l.height(180)
    }

    var s = t("function-widget-1:guide/context.js").getContext, a = window.yunData;
    i.exports.show = function (t, e) {
        n(e)
    }
});
;define("function-widget-1:guide/util/shareDirTip/setShareDismiss.js", function (t, e, i) {
    function s(t) {
        for (var e = 0, i = 0; i < t.length; i++) if (o.test(t[i]) ? e += 2 : e++, e > 40) return t.substr(0, i) + "...";
        return t
    }

    var n = t("function-widget-1:guide/context.js").getContext, o = /[\u4E00-\u9FA5]/;
    i.exports.show = function () {
        var t = n(), e = t.router.query.get("path"), i = s(e.substr(e.lastIndexOf("/") + 1)), o = t.ui.window({
            title: "文件夹已被取消共享",
            lock: !0,
            close: !0,
            className: "setshare-dismiss-dialog",
            width: "450px",
            height: "200px",
            body: '<p class="dissmiss-text">"' + i + '"文件夹因含非法违规内容，已被取消共享，共享成员已无法继续查看。</p>',
            position: {xy: "center"},
            draggable: !1,
            buttons: [{
                type: "big",
                title: "知道了",
                color: "blue",
                position: "center",
                padding: ["30px", "30px"],
                click: function () {
                    o.hide()
                }
            }]
        });
        o.show()
    }
});
;define("function-widget-1:guide/util/shareDirTip/shareDirTip.js", function (i, t, o) {
    var n = i("function-widget-1:guide/context.js").getContext,
        s = ['<div class="tip-body">', '<div class="dir-icon">', '<div class="dir-icon-holder"></div>', "</div>", '<p class="tip-body-title">&nbsp;新增共享文件夹！</p>', '<p class="tip-body-subtitle">和其他人一起共享和管理文件吧</p>', '<div class="know-button">', "<span>&nbsp;知道了</span>", "</div>", "</div>"].join("");
    o.exports.show = function () {
        var i = n().ui.window({
            title: "",
            lock: !0,
            noFooter: !0,
            close: !0,
            className: "guide-share-dir-tip",
            width: "500px",
            height: "390px",
            body: s,
            position: {xy: "center"},
            draggable: !1
        });
        i.show(), i.$dialog.on("click", ".know-button", function () {
            i.hide()
        })
    }
});
;define("function-widget-1:guide/util/capacityUpdateTip/capacityUpdateTip.js", function (t, a, e) {
    var i = t("base:widget/libs/jquerypacket.js"), c = t("function-widget-1:guide/context.js").getContext,
        p = t("base:widget/storage/storage.js"), o = window.yunData || {};
    e.exports.show = function () {
        var t = o.volAutoup, a = "capacity_update_uk_" + o.MYUK, e = function (t) {
            return "number" == typeof t || "string" == typeof t && /^[\d\.]+$/.test(t) ? 1024 > t ? Math.round(t) + "B" : 1048576 > t && t >= 1024 ? Math.round(t / 1024) + "KB" : 1073741824 > t && t >= 1048576 ? 10 * (t / 1024 / 1024).toFixed(1) / 10 + "M" : 10 * (t / 1024 / 1024 / 1024).toFixed(1) / 10 + "G" : "-"
        }, d = function () {
            var t = "";
            return t = 1 === +o.ISSVIP ? "svip" : 1 === +o.ISVIP ? "vip" : "no_vip"
        }();
        i("body").prepend('<div class="capacity-update-mask"></div><div class="capacity-update-box">    <div class="capacity-update-close"></div>    <div class="capacity-update-quota">        <span class="quota-text"></span>        <span class="quota-result"></span>    </div>    <div class="capacity-update-begin">去看看</div></div>'), i(".quota-result").text(e(t)), i(".capacity-update-begin").on("click", function () {
            window.location.href = "/buy/center?tag=3&from=homepage#/personalcenter/2", p.setItem(a, !0), c().log.send({type: "capacity_update_dialog_tosee_" + d})
        }), i(".capacity-update-close").on("click", function () {
            i(".capacity-update-box").remove(), i(".capacity-update-mask").remove(), p.setItem(a, !0), c().log.send({type: "capacity_update_dialog_close_" + d})
        }), c().log.send({type: "capacity_update_dialog_appear_" + d})
    }
});
;define("function-widget-1:download/util/interactionUtil.js", function (i, a, s) {
    function e() {
        var i = [];
        return i.push('<div class="module-download-dialog">'), i.push('<div class="content">'), i.push('<div id="' + _._mMsgId + '_videoGuideBox" class="videoGuide">'), i.push('<div class="guideHeader"></div>'), i.push('<div class="guidePreview"></div>'), i.push("</div>"), i.push('<div id="' + _._mMsgId + '" class="message global-center">加载中&hellip;</div>'), i.push('<div id="' + _._mClientHintId + '" class="g-clearfix download-manage-client-hint g-center"></div>'), i.push('<div class="dlg-ft">'), i.push('<div class="g-clearfix g-center">'), i.push('<div class="videoBtnBox">'), i.push('<a href="javascript:void(0);" id="' + _._mPositiveVideoId + '" class="g-button g-button-large g-button-blue-large">'), i.push('<span class="g-button-right">'), i.push('<span class="text">' + (yunData.ISSVIP && 1 === +yunData.ISSVIP ? '<em class="d-svip-icon"></em>超级会员极速下载' : 1 === +yunData.ISVIP ? '<em class="d-vip-icon"></em>会员高速下载' : "高速下载（推荐）") + "</span>"), i.push("</span>"), i.push("</a>"), i.push('<a href="javascript:;" id="' + _._mNegativeVideoId + '" class="g-button g-button-large g-button-gray-large">'), i.push('<span class="g-button-right">普通下载</span>'), i.push('<i class="lineheight-ie7"></i>'), i.push("</a>"), i.push("</div>"), i.push('<div class="normalBtnBox">'), i.push('<a href="javascript:;" id="' + _._mPositiveId + '" node-type="download-speedup" class="g-button g-button-large g-button-blue-large">'), i.push('<span class="g-button-right">'), i.push('<span class="text">' + (yunData.ISSVIP && 1 === +yunData.ISSVIP ? '<em class="d-svip-icon"></em>超级会员极速下载' : 1 === +yunData.ISVIP ? '<em class="d-vip-icon"></em>会员高速下载' : "高速下载（推荐）") + "</span>"), i.push("</span>"), i.push("</a>"), i.push('<a href="javascript:;"  id="' + _._mNegativeId + '" node-type="download-normal" class="g-button g-button-large g-button-gray-large">'), i.push('<span class="g-button-right">'), i.push('<span class="text">普通下载</span>'), i.push("</span>"), i.push("</a>"), i.push("</div>"), i.push("</div>"), i.push("</div>"), i.push("</div>"), i.push('<div class="dlg-ft01 b-rlv" id="show-acceleration-pack">'), i.push('<div class="g-clearfix center acceleration-pack">'), i.push('<span class="dowmload-imgs-style dowmload-imgs-style01"></span>'), i.push('<span class="dowmload-content-style">还想更快？购买网络加速包，最高</span>'), i.push('<span class="download-upspeed-style">提速40%</span>'), i.push('        <a href="javascript:;" id="goToBuy" class="g-button-small g-button abtn download-change-link-style">'), i.push('            <b class="g-button-right">立即提速</b>'), i.push("        </a>"), i.push("</div>"), i.push("</div>"), i.push('<div class="dlg-ft01 b-rlv" id="show-buyvip-pack" style="display:none;">'), i.push('    <div class="g-clearfix center buyvip-pack">'), i.push('        <span class="dowmload-imgs-style dowmload-imgs-style01"></span>'), i.push('        <span class="dowmload-content-style">开通百度网盘超级会员，专享极速下载特权</span>'), i.push('        <a href="javascript:;" id="goToBuyVip" class="g-button-small g-button abtn download-change-link-style">'), i.push('            <b class="g-button-right">立即提速</b>'), i.push("        </a>"), i.push("    </div>"), i.push("</div>"), i.join("")
    }

    function t(i) {
        var a = "/rest/2.0/membership/isp?method=query";
        1 === yunData.LOGINSTATUS && (w.isVideo || I.ajax({
            url: a,
            type: "POST",
            data: {user_id: 1},
            dataType: "json",
            success: function (a) {
                "function" == typeof i && i(a)
            }
        }))
    }

    function d() {
        if (1 !== +yunData.ISSVIP) {
            var i = I("#show-buyvip-pack");
            i.length > 0 && (i.fadeIn("200"), m().log.send({
                url: "//pan.baidu.com/api/analytics",
                type: "download_buyvip_view"
            }))
        }
    }

    function o() {
        var i = _.packName;
        return w.isNormalSingleFile ? w.list[0].server_filename : 1 === w.list.length ? i : i + "等（<strong>" + w.list.length + "</strong>）个文件"
    }

    function n(i) {
        var a, s, e, t, d = "", n = m().file.getIconAndPlugin, l = "";
        i === !0 ? (_.dialog.$dialog.find(".dialog-header-title").text("高速下载"), w.isVideo ? d += '<p class="download-mgr-dialog-title"></p>' : d = '<p class="download-mgr-dialog-icon"></p><p class="download-mgr-dialog-title">百度网盘客户端</p>', d += '<p class="download-mgr-dialog-text">快速、稳定下载大文件，请使用百度网盘客户端下载，还支持断点续传哟~</p>') : (d = '<span class="fileicon"></span>' + o(), l = o()), I("#" + _._mMsgId).attr({title: l}).html(d), t = I(".fileicon", "#" + _._mMsgId), y[r.INDEX_OF_FILENUM] !== r.FILE_NUM_SINGLE ? (e = w.list[0], a = m().file.getIconAndPlugin(e.path, 1, !0, !1, e.share).smallIcon) : (e = w.list instanceof Array ? w.list[0] : w.list, 1 === e.isdir ? a = n(e.path, 1, !1, !1, e.share).smallIcon : (s = e.path, a = n(s, 0).smallIcon)), t.addClass(a), t.css("margin-right", "8px")
    }

    function l() {
        var i = y[r.INDEX_OF_FILESIZE] === r.FILE_SIZE_MORE_LIMIT, a = I("#" + _._mMsgId + "_videoGuideBox"),
            s = a.find(".guideHeader"), e = a.find(".guidePreview"), t = w.list[0], d = !1,
            o = I("#" + _._mPositiveVideoId).parent(), l = I("#" + _._mPositiveId).parent();
        I("span", "#" + _._mNegativeVideoId).text("普通下载"), I(".g-button-right span", "#" + _._mPositiveVideoId).html(yunData.ISSVIP && 1 === +yunData.ISSVIP ? '<em class="d-svip-icon"></em>超级会员极速下载' : 1 === +yunData.ISVIP ? '<em class="d-vip-icon"></em>会员高速下载' : "高速下载（推荐）"), I("#" + _._mPositiveVideoId).attr("href", "javascript:;").css("display", ""), I("#" + _._mPositiveId).parent().hide(), i ? (_.videoGuideText = "你下载的文件过大，请使用百度网盘客户端或点击预览在线观看", I("#" + _._mNegativeVideoId).css("display", "none")) : (_.videoGuideText = "点击立即播放，无需下载即可在线观看视频", I("#" + _._mNegativeVideoId).css("display", ""));
        var p = I('<a target="_blank" class="playLink" href="/play/video#/video?path=' + encodeURIComponent(t.path) + '&t=-1"><div class="playBox"><i title="播放" class="playIcon"></i><span class="playText">点击播放</span></div></a>'),
            g = "";
        t.thumbs && t.thumbs.url2 && (g = t.thumbs.url2), e.html(p).attr("style", "background:url(" + g + ") 50% 50% no-repeat").show(), i ? s.html("<span>" + _.videoGuideText + "</span></div>").show() : s.html('<div class="decorLine"></div><span>' + _.videoGuideText + '</span><div class="decorLine lineR"></div>').show(), _.fromVideoCall ? (I(".text", "#" + _._mPositiveVideoId).text("安装最新版网盘客户端"), I("#" + _._mNegativeVideoId).css("display", "none"), d = !0) : (m().log.send({
            page: v.getDownloadLogmsg(),
            url: "//pan.baidu.com/api/analytics",
            type: "video_download_guide_window_" + (i ? "1" : "0")
        }), !i && m().log.send({type: w.logMsg.category + "-" + w.logMsg.actionRecommendPlugin})), "postInstall" === _.mode ? (o.hide(), l.show()) : (o.show(), l.hide()), n(d)
    }

    function p(i) {
        i ? (I("#" + _._mMsgId + "_videoGuideBox").show(), I("#" + _._mPositiveVideoId).parent().show()) : (I("#" + _._mMsgId + "_videoGuideBox").hide(), I("#" + _._mPositiveVideoId).parent().hide())
    }

    function g(i, a) {
        c(i, a), _.dialog && I("div.chromeUpgradeHelpTip", _.dialog.$dialog).remove(), p(w.isVideo), w.isVideo ? l() : (I("#" + _._mPositiveId).parent().show(), b[_.mode]())
    }

    function u() {
        _.dialog = m().ui.window({
            id: _.DIALOG_ID,
            title: "文件下载",
            body: e(),
            width: "568px"
        }), _.guanjiaDownloadUrl || h.getGuanjiaDownloadUrl(function (i) {
            _.guanjiaDownloadUrl = i.url, _.guanjiaVersion = i.version
        }), t(function (i) {
            i.isp_name && "" !== i.isp_name && 1 === +yunData.ISSVIP ? (_._mIspName = i.isp_name, I("#show-acceleration-pack").fadeIn("200"), m().log.send({
                page: v.getDownloadLogmsg(),
                url: "//pan.baidu.com/api/analytics",
                type: "check_isp_name"
            })) : d()
        })
    }

    function c(i, a) {
        y = i, w = a, _.packName = w.packName, _.mode = w.mode
    }

    var m = i("function-widget-1:download/util/context.js").getContext, I = i("base:widget/libs/jquerypacket.js"),
        r = i("function-widget-1:download/config.js"),
        h = (i("base:widget/libs/underscore.js"), i("function-widget-1:download/util/downloadGuanjiaUtil.js")),
        v = i("function-widget-1:download/util/downloadCommonUtil.js"), _ = {
            _mMsgId: disk.obtainId(),
            _mPositiveId: disk.obtainId(),
            _mNegativeId: disk.obtainId(),
            _mPositiveVideoId: disk.obtainId(),
            _mNegativeVideoId: disk.obtainId(),
            _mClientHintId: disk.obtainId(),
            _mDownloadTipsId: disk.obtainId(),
            dialog: null,
            DIALOG_ID: "moduleDownloadDialog",
            videoGuideText: "",
            _mIspName: null,
            mode: "",
            logMap: {preDownload: 0, preInstall: 1, postInstall: 2, postRetry: 3, directDownload: 4}
        }, w = {}, y = (_.logMap, ""), b = {
            preDownload: function () {
                _._mIspName && 1 === +yunData.ISSVIP ? I("#show-acceleration-pack").fadeIn("200") : 1 !== +yunData.ISSVIP && d(), I("#" + _._mClientHintId).css("display", "none"), I("#" + _._mMsgId).removeClass("download-mgr-tight"), n(), I(".g-button-right span", "#" + _._mPositiveId).html(yunData.ISSVIP && 1 === +yunData.ISSVIP ? '<em class="d-svip-icon"></em>超级会员极速下载' : 1 === +yunData.ISVIP ? '<em class="d-vip-icon"></em>会员高速下载' : "高速下载（推荐）"), I("#" + _._mPositiveId).attr("href", "javascript:;").css("display", ""), I(".g-button-right", "#" + _._mNegativeId).text("普通下载"), I("#" + _._mNegativeId).css("display", ""), _.dialog.$dialog.find(".dialog-header-title").text("文件下载"), m().log.send({type: w.logMsg.category + "-" + w.logMsg.actionRecommendPlugin}), _.dialog.show()
            }, preInstall: function () {
                var i = !0;
                I("#" + _._mMsgId).addClass("download-mgr-tight"), I("#" + _._mPositiveId).css("display", ""), I("#" + _._mPositiveVideoId).css("display", ""), I(".text", "#" + _._mPositiveId).text("安装最新版网盘客户端"), I(".text", "#" + _._mPositiveVideoId).text("安装最新版网盘客户端"), I("#" + _._mPositiveId).attr("href", "javascript:;"), I("#" + _._mPositiveVideoId).attr("href", "javascript:;"), I("#" + _._mNegativeId).css("display", "none"), I("#" + _._mNegativeVideoId).css("display", "none"), I("#" + _._mDownloadTipsId).css("display", "none"), I("#" + _._mClientHintId).css("display", "none"), _.dialog.$dialog.find(".dialog-header-title").text("文件下载"), r[r.INDEX_OF_FILENUM] === r.FILE_NUM_SINGLE ? y[r.INDEX_OF_FILESIZE] === r.FILE_SIZE_MORE_LIMIT ? (I("#" + _._mClientHintId).html("你下载的文件过大，请使用百度网盘客户端。").show(), i = !1) : (I("#show-acceleration-pack").hide(), I("#show-buyvip-pack").hide(), I("#" + _._mClientHintId).html("").hide()) : r[r.INDEX_OF_FILENUM] !== r.FILE_NUM_SINGLE ? ((y[r.INDEX_OF_FILESIZE] === r.FILE_SIZE_MORE_LIMIT || y[r.INDEX_OF_FILENUM] === r.FILE_NUM_MORE_100) && (I("#" + _._mClientHintId).html("你下载的文件过大或者过多，请使用百度网盘客户端下载。").show(), i = !1), y[r.INDEX_OF_ISDIR] === r.FILE_HASDIR ? (I("#" + _._mClientHintId).html("你下载的内容包含文件夹，请使用百度网盘客户端下载。").show(), i = !1) : I("#" + _._mClientHintId).html("").hide()) : I("#" + _._mClientHintId).html("").hide(), n(i), _.dialog.hide(), _.isVideoShow = !1
            }, postInstall: function (i) {
                "string" == typeof i && (_.guanjiaDownloadUrl = i), I("#" + _._mPositiveId).attr("href", _.guanjiaDownloadUrl), I("#" + _._mPositiveVideoId).attr("href", _.guanjiaDownloadUrl), I("#" + _._mClientHintId).css("display", "none"), I("#" + _._mMsgId).removeClass("download-mgr-tight").html("<p>安装完成后，重启浏览器即可高速下载</p>"), I("#" + _._mPositiveId).css("display", "none"), I("#" + _._mPositiveVideoId).css("display", "none"), I("#" + _._mNegativeId).css("display", ""), I("#" + _._mNegativeVideoId).css("display", ""), I("span", "#" + _._mNegativeId).text("知道了"), I("span", "#" + _._mNegativeVideoId).text("知道了"), I("#" + _._mNegativeId).show(), I("#" + _._mPositiveVideoId).parent().hide(), I("#" + _._mPositiveId).parent().show(), _.dialog.show(), w.isVideo && m().log.send({
                    page: v.getDownloadLogmsg(),
                    url: "//pan.baidu.com/api/analytics",
                    type: "video_download_guide_window_2"
                })
            }
        };
    u(), s.exports = {state: _, updateDialog: g, initDialog: u, updateMap: b}
});
;define("function-widget-1:download/service/guanjiaServerProxy.js", function (e, n, o) {
    var r = (e("function-widget-1:download/util/downloadCommonUtil.js"), e("base:widget/libs/jquerypacket.js")),
        t = e("base:widget/storage/storage.js"), s = e("function-widget-1:download/util/context.js").getContext, i = {
            conf: {
                URL_GETBROWSERID: "/api/invoker/get",
                URL_CHECKONLINE: "/api/invoker/online",
                URL_SENDDATA: "/api/invoker/send",
                URL_CHEKCGUANJIA: "/api/invoker/check",
                CHECK_MAX_NUM: 5,
                CHECK_NUM: 5,
                CHECK_EVERY_TIME: 2e3,
                browserId: null,
                isOnline: !1,
                guanjiaVersion: 0
            }, getBrowserIdByServer: function (e) {
                r.ajax({
                    url: i.conf.URL_GETBROWSERID, type: "GET", dataType: "json", success: function (n) {
                        n && 0 === n.errno ? (i.conf.browserId = n.browserId, t.setItem("browserId", n.browserId), s().log.send({
                            name: "getBrowserIdByServer",
                            value: "success"
                        }), "function" == typeof e && e(n.browserId)) : (s().ui.tip({
                            mode: "caution",
                            msg: "参数错误"
                        }), s().log.send({name: "getBrowserIdByServer", value: "failure"}))
                    }, error: function () {
                        s().ui.tip({mode: "caution", msg: "参数错误"}), s().log.send({
                            name: "getBrowserIdByServer",
                            value: "failure"
                        })
                    }
                })
            }, checkIsOnlineByServer: function (e, n) {
                r.ajax({
                    url: i.conf.URL_CHECKONLINE,
                    type: "GET",
                    data: {browserId: e},
                    dataType: "json",
                    success: function (e) {
                        e && 0 === e.errno ? ("" !== e.version && 2 !== e.online && (i.conf.guanjiaVersion = e.version, i.conf.isOnline = 1 === e.online ? !0 : !1), s().log.send({
                            name: "checkIsOnlineByServer",
                            value: "success"
                        }), "function" == typeof n && n(e)) : (s().ui.tip({
                            mode: "caution",
                            msg: "参数错误"
                        }), s().log.send({name: "checkIsOnlineByServer", value: "failure"}))
                    },
                    error: function () {
                        s().ui.tip({mode: "caution", msg: "参数错误"}), s().log.send({
                            name: "checkIsOnlineByServer",
                            value: "failure"
                        })
                    }
                })
            }, sendDataByServer: function (e, n, o) {
                r.ajax({
                    url: i.conf.URL_SENDDATA,
                    type: "POST",
                    data: {browserId: e, downloadInfo: n},
                    dataType: "json",
                    success: function (e) {
                        "function" == typeof o && o(e), s().log.send({name: "sendDataByServer", value: "success"})
                    },
                    error: function () {
                        s().ui.tip({mode: "caution", msg: "参数错误"}), s().log.send({
                            name: "sendDataByServer",
                            value: "failure"
                        })
                    }
                })
            }, checkGuanjiaStatusByServer: function (e, n, o) {
                r.ajax({
                    url: i.conf.URL_CHEKCGUANJIA,
                    type: "GET",
                    data: {browserId: e, seq: n},
                    dataType: "json",
                    success: function (r) {
                        0 === r.errno ? 1 === r.status ? (i.conf.CHECK_NUM = i.conf.CHECK_MAX_NUM, "function" == typeof o && o(e, n, r.status), s().log.send({
                            name: "checkGuanjiaStatusByServer",
                            value: "success"
                        })) : i.conf.CHECK_NUM > 0 ? setTimeout(function () {
                            i.checkGuanjiaStatusByServer(e, n, o), i.conf.CHECK_NUM--
                        }, i.conf.CHECK_EVERY_TIME) : ("function" == typeof o && o(e, n, r.status), i.conf.CHECK_NUM = i.conf.CHECK_MAX_NUM) : (s().ui.tip({
                            mode: "caution",
                            msg: "参数错误"
                        }), s().log.send({name: "checkGuanjiaStatusByServer", value: "failure"}))
                    },
                    error: function () {
                        s().ui.tip({mode: "caution", msg: "参数错误"}), s().log.send({
                            name: "checkGuanjiaStatusByServer",
                            value: "failure"
                        })
                    }
                })
            }
        };
    o.exports = {
        init: function (e) {
            i.conf.browserId = t.getItem("browserId"), i.conf.browserId ? i.checkIsOnlineByServer(i.conf.browserId, e) : i.getBrowserIdByServer(function (n) {
                i.checkIsOnlineByServer(n, e)
            })
        }, getBrowserId: function () {
            return i.conf.browserId
        }, checkIsOnline: function () {
            return i.conf.isOnline
        }, sendServer: function (e, n, o) {
            i.sendDataByServer(e, n, o)
        }, checkCallStatus: function (e, n, o) {
            i.checkGuanjiaStatusByServer(e, n, o)
        }, setVersion: function (e) {
            i.conf.guanjiaVersion = e
        }, getVersion: function () {
            return i.conf.guanjiaVersion
        }
    }
});
;define("function-widget-1:download/service/guanjiaConnector.js", function (o, e, n) {
    var t = o("function-widget-1:download/util/downloadCommonUtil.js"), i = o("base:widget/libs/jquerypacket.js"),
        c = o("base:widget/httpProxy/httpProxy.js"), a = o("base:widget/tools/tools.js"), r = {
            conf: {
                localUrl: "http://127.0.0.1",
                localPort: 1e4,
                currentPort: 1e4,
                portPollLimit: 10,
                guanjiaVersion: 0,
                localServerReady: !1,
                domIframeId: "guanjia-iframe-id",
                domHookId: "guanjia-hook-id",
                hook: null,
                minVersion: "5.3.4.5"
            }, setVersion: function (o) {
                r.conf.guanjiaVersion = o, "http:" !== location.protocol || t.isPlatformWindows() && !t.compareVersion(o, "5.4.7") || r.imageAccess("https://" + location.host + "/yun-static/common/images/default.gif", function () {
                    a.setCookie("secu", 1, 365, "/")
                })
            }, imageAccess: function (o, e, n) {
                var t = new Image;
                t.onload = function (o) {
                    "function" == typeof e && e.call(null, o)
                }, t.onerror = function (o) {
                    "function" == typeof n && n.call(null, o)
                }, t.src = o
            }, util: {
                init: function (o) {
                    r.conf.checkStartTime = o ? +new Date : 0, r.util.checkLocalServer(), t.getChromeVersion() <= 42 && setTimeout(function () {
                        r.util.localServerReady || r.util.installHook()
                    }, 1e3)
                }, checkLtIe8: function () {
                    var o = i.browser || {};
                    return o.msie && +o.version <= 8 ? !0 : !1
                }, checkLocalServer: function () {
                    if (!r.conf.localServerReady) for (var o = 0, e = function (e) {
                        var n = r.conf.localUrl + ":" + e + "/guanjia", a = {
                            url: n,
                            type: "GET",
                            data: {method: "GetVersion"},
                            dataType: "json",
                            timeout: 3e3,
                            success: function (o) {
                                try {
                                    o = i.parseJSON(o)
                                } catch (n) {
                                }
                                if (o && o.version) {
                                    if (t.isPlatformWindows() && !t.compareVersion(o.version, r.conf.minVersion)) return;
                                    r.conf.currentPort = e, r.setVersion(o.version), r.conf.localServerReady = !0
                                }
                            },
                            error: function () {
                                o++, o === r.conf.portPollLimit && +new Date - r.conf.checkStartTime < 3e3 && setTimeout(function () {
                                    r.util.checkLocalServer()
                                }, 400)
                            }
                        };
                        location.protocol.indexOf("https") > -1 || r.util.checkLtIe8() ? t.isPlatformMac() ? r.imageAccess(r.conf.localUrl + ":" + e + "/version.png", function () {
                            c.ajax(a)
                        }, a.error) : c.ajax(a) : i.ajax(a)
                    }, n = 0; n < r.conf.portPollLimit; n++) e(r.conf.localPort + n)
                }, installHook: function () {
                    var o, e, n = [];
                    return null !== r.conf.hook ? r.conf.hook : (o = document.getElementById(r.conf.domIframeId), o && document.body.removeChild(o), o = document.createElement("div"), o.style.width = "1px", o.style.height = "1px", o.style.position = "absolute", o.style.overflow = "hidden", o.style.left = "-999em", o.style.top = "-999em", o.id = r.conf.domIframeId, document.body.appendChild(o), n.push("undefined" != typeof window.attachEvent || window.ActiveXObject || "ActiveXObject" in window ? '<object id="' + r.conf.domHookId + '" classid="CLSID:8DCE7B6C-C3B9-4efd-9CC6-2D9F938B4A06" hidden="true" viewastext></OBJECT>' : -1 !== navigator.userAgent.indexOf("Trident/7.0") ? '<embed id="' + r.conf.domHookId + '" type="application/bd-npYunWebDetect-plugin" width="0" height="0">' : '<embed id="' + r.conf.domHookId + '" type="application/bd-npYunWebDetect-plugin" width="0" height="0">'), o.innerHTML = n.join(""), e = r.util.hasPlugin(), e && (r.conf.hook = document.getElementById(r.conf.domHookId), r.setVersion(r.conf.hook.GetVersion())), r.conf.hook)
                }, hasPlugin: function () {
                    var o = null;
                    try {
                        o = new ActiveXObject("YunWebDetect.YunWebDetect.1")
                    } catch (e) {
                        for (var n = null, t = navigator.plugins, i = 0, c = t.length; c > i; i++) if (n = t[i].name || t[i].filename, -1 != n.indexOf("BaiduYunGuanjia")) {
                            o = t[i];
                            break
                        }
                    }
                    return null != o
                }, checkPluginHook: function () {
                    return r.conf.installHook()
                }, sendData: function (o, e, n, a, l) {
                    if (r.conf.localServerReady) {
                        var u = r.conf.localUrl + ":" + r.conf.currentPort + "/guanjia?";
                        u += "method=" + o + "&uk=" + n + "&checkuser=" + (a ? 1 : 0);
                        var f = {
                            url: u, type: "POST", data: {filelist: e}, success: function () {
                            }, timeout: 3e3, error: function () {
                                l || t.openYunGuanjiaByScheme("baiduyunguanjia://guanjia", function () {
                                    r.conf.localServerReady = !1, r.util.init(!0), setTimeout(function () {
                                        r.util.sendData(o, e, n, a, !0)
                                    }, 3e3)
                                })
                            }
                        };
                        location.protocol.indexOf("https") > -1 || r.util.checkLtIe8() ? c.ajax(f) : i.ajax(f)
                    } else {
                        if (!r.conf.hook) return -2;
                        try {
                            "undefined" == typeof a ? r.conf.hook[o](e, n) : r.conf.hook[o](e, n, a)
                        } catch (s) {
                            return -2
                        }
                    }
                }
            }
        };
    r.setVersion(0), n.exports = {
        getVersion: function () {
            return r.conf.guanjiaVersion
        }, checkConnect: function () {
            return r.conf.localServerReady ? !0 : t.isChromeAndGreaterThan42() ? !1 : r.conf.hook && r.conf.guanjiaVersion
        }, callGuanjia: function (o, e, n, t) {
            return r.util.sendData(o, e, n, t)
        }, init: function (o) {
            r.util.init(o)
        }
    }
});
;define("function-widget-1:download/util/downloadGuanjiaUtil.js", function (n, i, t) {
    var e = n("function-widget-1:download/util/context.js").getContext,
        o = n("function-widget-1:download/util/downloadCommonUtil.js");
    t.exports = {
        getFormatedLinkList: function (n, i) {
            for (var t = {}, e = null, o = 0; o < i.length; o++) t[i[o].fs_id] = i[o].dlink;
            for (var u = 0; u < n.length; u++) e = n[u].fs_id, n[u].link = t[e];
            return n
        }, doError: function (n) {
            var i = navigator.userAgent.toLowerCase(), t = "启动百度网盘客户端失败，请安装最新版本";
            /x64/g.test(i) === !0 && /msie\s[678]/i.test(i) === !0 ? t = "加速下载暂不支持64位浏览器，请换个浏览器试试" : i.indexOf("se 2.x") > -1 ? t = "无法启动百度网盘客户端，请换个浏览器试试" : i.indexOf("360se") > -1 ? t = "无法启动百度网盘客户端，请换个浏览器试试" : void 0 === n ? t = "插件已被禁用，请查看浏览器插件设置" : -2 == n ? t = "启动百度网盘客户端失败，请重启浏览器后重试" : -4 == n && (t = "检测到百度网盘客户端已卸载，请重新安装后重试"), e().ui.tip({
                mode: "caution",
                msg: t
            })
        }, getGuanjiaDownloadUrl: function (n) {
            var i = {url: "", version: ""}, t = "5.4.4", e = function (n) {
                var i = n.split("V"), e = i[1], o = /^\d{1,2}\.\d{1,2}\.\d{1,2}$/;
                return o.test(e) === !0 ? e : t
            };
            return o.isPlatformMac() ? (i.url = "http://issuecdn.baidupcs.com/issue/netdisk/MACguanjia/BaiduNetdisk_mac_2.2.2.dmg", i.version = "2.2.2", "function" == typeof n ? n(i) : i) : void $.ajax({
                url: "/disk/cmsdata",
                data: {"do": "download"},
                type: "GET",
                dataType: "JSON",
                cache: !1,
                success: function (o) {
                    var u, s;
                    if (0 === o.errorno) if (o.content) try {
                        u = $.parseJSON(o.content), s = e(u.version), i.url = u.url, i.version = s
                    } catch (a) {
                        i.version = t
                    } else i.version = t; else i.version = t;
                    i.url = i.url || "http://issuecdn.baidupcs.com/issue/netdisk/yunguanjia/BaiduYunGuanjia_5.4.4.exe", "function" == typeof n && n(i)
                },
                error: function () {
                    i.url = "http://issuecdn.baidupcs.com/issue/netdisk/yunguanjia/BaiduYunGuanjia_5.4.4.exe", i.version = t, "function" == typeof n && n(i)
                }
            })
        }
    }
});
;define("function-widget-1:download/util/pcsUtil.js", function (t) {
    var e = t("base:widget/libs/jquerypacket.js"), s = {};
    s.testPCSCDNConnectivity = function (t) {
        s._getHostList(t)
    }, s._sList = null, s._sIndex = -1, s._sConnectedIndex = -1, s._sResult = 0, s._path = null, s._sRevision = 0, s._getHostList = function (t) {
        e.ajax({
            url: "https://d.pcs.baidu.com/rest/2.0/pcs/manage?method=listhost&t=" + (new Date).getTime(),
            method: "get",
            dataType: "jsonp",
            success: function (e) {
                e && e.list && (s._path = e.path, s._sList = e.list, s._sRevision = e.rev || 0, s._startTesting(t))
            },
            error: function () {
                "function" == typeof t && t.call(s, 0)
            }
        })
    }, s._startTesting = function (t) {
        s._sIndex++;
        var e = s._sList[s._sIndex];
        if (s._sIndex < s._sList.length) {
            var n = new Image;
            n.onload = function () {
                s._sConnectedIndex = s._sIndex, s._sResult += e.id, s._startTesting(t)
            }, n.onerror = function () {
                s._startTesting(t)
            }, n.src = "//" + e.host + (s._path || "/monitor.jpg?xcode=1a81b0bbd448fc368d78cc336e28561a") + (new Date).getTime()
        } else "function" == typeof t && t.call(s, 1, s._sConnectedIndex, s._sList, s._sResult, s._sRevision, s._path)
    }, s.testPCSCDNConnectivity()
});
;define("function-widget-1:download/config.js", function (_, E, I) {
    var L = {fileSizeSmall: 50, fileSizeLimit: 50, isDefaultSize: !0, isRequestServer: !1}, F = "0", D = "1", N = "0",
        i = "1", O = "2", e = "0", S = "1", o = "2", R = "0", M = "1", n = "0", T = "1", A = "0", P = "1", l = "2",
        a = "0", f = "1", C = [["01", "012", "0", "1", "01", "012", "01"], ["01", "012", "0", "0", "0", "0", "0"]],
        U = [["01", "012", "0", "0", "1", "012", "01"], ["01", "012", "0", "0", "01", "2", "01"], ["01", "012", "0", "0", "01", "012", "1"], ["01", "012", "2", "01", "01", "012", "01"], ["01", "012", "1", "01", "1", "012", "01"], ["01", "012", "1", "01", "01", "2", "01"]],
        d = [["01", "012", "0", "0", "0", "1", "0"], ["01", "012", "1", "01", "0", "01", "01"]];
    I.exports = {
        sizeConfig: L,
        PLATFORM_MAC: D,
        PLATFORM_WINDOWS: F,
        PRODUCT_PAN: N,
        PRODUCT_SHARE: i,
        PRODUCT_UNIONDIR: O,
        FILE_NUM_SINGLE: e,
        FILE_NUM_MULTIPLE: S,
        FILE_NUM_MORE_100: o,
        FILE_NODLINK: R,
        FILE_HASDLINK: M,
        FILE_NOTDIR: n,
        FILE_HASDIR: T,
        FILE_SIZE_LESS_SMALL: A,
        File_SIZE_BETWEEN_SMALL_AND_LIMIT: P,
        FILE_SIZE_MORE_LIMIT: l,
        FILE_TYPE_GENERAL: a,
        FILE_TYPE_CHROMEAPKEXE: f,
        directDownloadkeysConfig: C,
        guanjiaDownloadkeysConig: U,
        dialogDownloadkeysConfig: d,
        INDEX_OF_PLATFORM: 0,
        INDEX_OF_PRODUCT: 1,
        INDEX_OF_FILENUM: 2,
        INDEX_OF_DLINK: 3,
        INDEX_OF_ISDIR: 4,
        INDEX_OF_FILESIZE: 5,
        INDEX_OF_FILETYPE: 6
    }
});
;define("function-widget-1:download/util/downloadCommonUtil.js", function (e, t, n) {
    var o = e("base:widget/libs/jquerypacket.js"), r = e("function-widget-1:download/service/dlinkService.js"),
        i = e("base:widget/tools/service/tools.flash.js"),
        s = e("function-widget-1:download/util/context.js").getContext, a = {
            getFlashVersion: function () {
                var e = 0, t = navigator;
                if (t.plugins && t.plugins.length) {
                    for (var n = 0, o = t.plugins.length; o > n; n++) if (-1 !== t.plugins[n].name.indexOf("Shockwave Flash")) {
                        e = t.plugins[n].description.split("Shockwave Flash ")[1];
                        break
                    }
                } else if (window.ActiveXObject) try {
                    var r = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                    if (r) {
                        var i = r.GetVariable("$version"), s = /WIN ([\d\.\,]+)/g, a = s.exec(i);
                        a && (e = a[1])
                    }
                } catch (c) {
                }
                return e
            }, compareVersion: function (e, t, n) {
                return "string" == typeof e && (e = e.replace(/(^|\.)(\d)(?=\.|$)/g, "$10$2").replace(/\./g, ""), e = e.length <= 6 ? e += "00" : e, e = parseInt(e, 10)), "string" == typeof t && (t = t.replace(/(^|\.)(\d)(?=\.|$)/g, "$10$2").replace(/\./g, ""), t = t.length <= 6 ? t += "00" : t, t = parseInt(t, 10)), n ? e > t : e >= t
            }, getDownloadLogmsg: function () {
                var e;
                return e = r.getCurrentProduct() === r.PRODUCT_SHARE ? 2 : 1
            }, useToast: function (e) {
                s().ui.tip({mode: e.toastMode, msg: e.msg})
            }, useCloseToast: function () {
                s().ui.hideTip()
            }, getPackName: function (e) {
                var t, n = s().tools.baseService.parseDirFromPath(e[0].path), o = e[0].isdir;
                if ("number" == typeof e.length) {
                    var r = e.length > 1 ? "【批量下载】{%packName%}等.zip" : "{%packName%}.zip";
                    return 0 === o && (t = n.lastIndexOf("."), -1 !== t && (n = n.substring(0, t))), r.replace(/{%packName%}/g, n)
                }
                return s().tools.baseService.parseDirFromPath(e[0].path)
            }, isFile: function (e) {
                return 0 === e || void 0 === e ? !0 : !1
            }, isPlatformWindows: function () {
                var e = navigator.platform;
                return 0 === e.toLowerCase().indexOf("win")
            }, isPlatformMac: function () {
                var e = /Mac\D+(\d+).(\d*)/gi, t = e.exec(navigator.userAgent);
                return t && t[1] && (+t[1] > 10 || 10 === +t[1] && t[2] && +t[2] >= 10) ? !0 : !1
            }, getDownloadUrl: function (e) {
                return o.browser.msie ? e.dlink + "&response-cache-control=private" : e.dlink
            }, isChromeAndGreaterThan42: function () {
                var e = "42";
                return a.getChromeVersion() >= e ? !0 : !1
            }, getChromeVersion: function () {
                var e, t = navigator.userAgent.toLowerCase(), n = /chrome/, o = /safari\/\d{3}\.\d{2}$/,
                    r = /chrome\/(\S+)/;
                return n.test(t) && o.test(t) && r.test(t) ? e = RegExp.$1 : 0
            }, isChrome: function () {
                var e = navigator.userAgent.toLowerCase(), t = /chrome/;
                return t.test(e) ? !0 : !1
            }, ctrBrowserVersion: function (e, t, n) {
                var o = "get" + e.slice(0, 1).toUpperCase() + e.slice(1) + "Version", r = a[o], i = parseInt(r(), 10),
                    n = parseInt(n, 10);
                return "<" === t ? n > i : "==" === t || "===" === t ? i === n : "<=" === t ? n >= i : ">=" === t ? i >= n : ">" === t ? i > n : void 0
            }, shouldKeepAlive: function () {
                return location.protocol.indexOf("https") > -1 && (!i.checkFlashSupport() || a.isPlatformMac() && a.ctrBrowserVersion("firefox", ">", "50") || a.ctrBrowserVersion("chrome", "==", "59"))
            }, isFirefoxAndGreaterThan50: function () {
                var e = "50";
                return a.isFirefox() && a.getFirefoxVersion() > e ? !0 : !1
            }, getFirefoxVersion: function () {
                var e, t = navigator.userAgent.toLowerCase(), n = /firefox\/(\S+)/;
                return n.test(t) ? e = RegExp.$1 : 0
            }, isFirefox: function () {
                var e = navigator.userAgent.toLowerCase(), t = /firefox/;
                return t.test(e) ? !0 : !1
            }, toLogin: function () {
                var t = this;
                this.useToast({
                    toastMode: "loading",
                    msg: "请稍候..."
                }), e.async("base:widget/passAPI/passAPI.js", function (e) {
                    t.useCloseToast(), e.promise.done(function () {
                        e.passAPI.PassportInit.netdiskLogin({reload: !0}), e.passAPI.PassLoginDialog.onLoginSuccessCallback = function () {
                            e.passAPI.PassportInit.hide(), s().log.send({type: "download_share_single_size_limit_login_success"})
                        }
                    }), s().log.send({type: "download_share_single_size_limit_login_dialog_show"})
                })
            }, openYunGuanjiaByScheme: function (e, t) {
                var n = !1, r = function () {
                    n = !0
                };
                o(window).on("blur", r);
                var i = function () {
                    n && setTimeout(function () {
                        "function" == typeof t && t()
                    }, 100), n = !1, o(window).off("focus", i)
                };
                if (o(window).on("focus", i), a.isChrome()) {
                    var s = document.createElement("a"), c = null;
                    "function" == typeof MouseEvent ? c = new MouseEvent("click", {
                        bubbles: !0,
                        cancelable: !1
                    }) : (c = document.createEvent("MouseEvents"), c.initEvent("click", !0, !1)), s.href = e, s.dispatchEvent(c)
                } else {
                    var u = a.callClientIframe;
                    u || (u = document.createElement("iframe"), o(u).hide(), a.callClientIframe = u, document.body.appendChild(u)), u.src = e
                }
                setTimeout(function () {
                    o(window).off("blur", r), n || (o(window).off("focus", i), "function" == typeof t && t())
                }, 100)
            }, checkIsShare: function () {
                var e = s().router, t = e.currentRouteName;
                return "sharedir" === t ? !0 : "video" === t ? /^\/<share>\d+-\d+\//.test(e.query.get("path")) : !1
            }, getFileSizeType: function (e) {
                for (var t = 1048576, n = 0, o = 1 === e.length, r = 0, i = [], s = 0; s < e.length && !(n > 300 * t); s++) n += e[s].size;
                return n = Math.ceil(n / t), o ? (i = [0, 50, 100, 200, 300], i.sort(function (e, t) {
                    return n > e && t >= n ? r = e : n > t && (r = t), r
                })) : (i = [0, 100, 300], i.sort(function (e, t) {
                    return n > e && t >= n ? r = e : n > t && (r = t), r
                })), r
            }
        };
    n.exports = a
});
;define("function-widget-1:download/service/dialogDownload.js", function (e, o, t) {
    function i() {
        y.dialog.isInitEvent || (y.dialog.isInitEvent = !0, n()), c.updateDialog(w, I), y.dialog.show()
    }

    function n() {
        var e = r("#" + y.DIALOG_ID), o = r("#goToBuyVip");
        e.delegate("#" + y._mPositiveId, "click", function () {
            y.dialog.hide(), "postInstall" === y.mode ? (d().log.send({
                page: p.getDownloadLogmsg(),
                type: I.logMsg.category + "-" + I.logMsg.actionDownloadClient
            }), c.updateMap.postInstall()) : (y.mode = "preInstall", I.state = y, s.start(w, I), d().log.send({
                page: p.getDownloadLogmsg(),
                type: I.logMsg.category + "-" + I.logMsg.actionAccelerateDownload,
                fileSize: p.getFileSizeType(I.list)
            }))
        }), e.delegate("#" + y._mNegativeId, "click", function () {
            if (r("#" + y._mPositiveVideoId).attr("href").indexOf("javascript") > -1) {
                if ("share" === d().pageInfo.currentProduct && (!window.yunData || 1 !== Number(window.yunData.LOGINSTATUS))) return d().log.send({type: "download_share_login"}), window.yunHeader.login.util.loginNew(), window.yunHeader.on("loginSuccess", function () {
                    _.setItem("shareAutoDownload", "1"), d().log.send({type: "download_share_login_success"})
                }), !1;
                g.start(w, I), d().log.send({
                    page: p.getDownloadLogmsg(),
                    type: I.logMsg.category + "-" + I.logMsg.actionOrdinaryDownload,
                    fileSize: p.getFileSizeType(I.list)
                })
            } else r("#" + y._mPositiveVideoId).attr("href", "javascript:;"), d().log.send({
                page: p.getDownloadLogmsg(),
                type: I.logMsg.category + "-" + I.logMsg.actionDownReportIssue
            });
            return y.dialog.hide(), !1
        }), e.delegate("#" + y._mPositiveVideoId, "click", function () {
            var e = E[y.mode];
            d().log.send({
                url: "//pan.baidu.com/api/analytics",
                type: "video_download_guide_positive_" + e
            }), y.dialog.hide(), "postInstall" === y.mode ? (d().log.send({
                page: p.getDownloadLogmsg(),
                type: I.logMsg.category + "-" + I.logMsg.actionDownloadClient
            }), c.updateMap.postInstall()) : (y.fromVideoCall = !0, I.state = y, s.start(w, I), d().log.send({
                page: p.getDownloadLogmsg(),
                type: I.logMsg.category + "-" + I.logMsg.actionAccelerateDownload,
                fileSize: p.getFileSizeType(I.list)
            }))
        }), e.delegate("#" + y._mNegativeVideoId, "click", function () {
            I.state = y, g.start(w, I), y.dialog.hide(), d().log.send({
                url: "//pan.baidu.com/api/analytics",
                type: "video_download_guide_negative_0"
            }), d().log.send({
                page: p.getDownloadLogmsg(),
                type: I.logMsg.category + "-" + I.logMsg.actionOrdinaryDownload,
                fileSize: p.getFileSizeType(I.list)
            })
        }), e.delegate(".playLink", "click", function () {
            y.dialog.hide(), d().log.send({
                url: "//pan.baidu.com/api/analytics",
                type: "video_download_guide_playclick_" + E[y.mode]
            })
        }), e.delegate("#goToBuy", "click", function () {
            return d().log.send({
                url: "//pan.baidu.com/api/analytics",
                type: "cilick_isp_buy"
            }), window.open("/buy/center?tag=2&frm=dl#network"), !1
        }), o.click(function () {
            return d().log.send({
                url: "//pan.baidu.com/api/analytics",
                type: "download_buyvip_click"
            }), window.open(u.isSmallFlow("disk_index_jump_checkoutcounter") ? "//yun.baidu.com/buy/checkoutcounter?svip=1&tag=8&from=speedup#question=vip-speed" : "//yun.baidu.com/buy/center?tag=8&from=speedup#question=vip-speed"), !1
        })
    }

    function a(e) {
        var o = e, t = "";
        return t = o[l.INDEX_OF_FILENUM] !== l.FILE_NUM_SINGLE ? o[l.INDEX_OF_FILENUM] === l.FILE_NUM_MORE_100 || o[l.INDEX_OF_FILESIZE] === l.FILE_SIZE_MORE_LIMIT || o[l.INDEX_OF_ISDIR] === l.FILE_HASDIR ? "preInstall" : "preDownload" : o[l.INDEX_OF_ISDIR] === l.FILE_HASDIR ? "preInstall" : o[l.INDEX_OF_FILETYPE] === l.FILE_TYPE_CHROMEAPKEXE ? "preInstall" : o[l.INDEX_OF_FILESIZE] === l.FILE_SIZE_LESS_SMALL ? "directDownload" : o[l.INDEX_OF_FILESIZE] === l.File_SIZE_BETWEEN_SMALL_AND_LIMIT ? "preDownload" : "preInstall"
    }

    var l = e("function-widget-1:download/config.js"), d = e("function-widget-1:download/util/context.js").getContext,
        g = e("function-widget-1:download/service/downloadDirect.js"),
        s = e("function-widget-1:download/service/guanjiaDownloadController.js"),
        l = e("function-widget-1:download/config.js"), c = e("function-widget-1:download/util/interactionUtil.js"),
        r = (e("base:widget/libs/underscore.js"), e("base:widget/libs/jquerypacket.js")),
        u = e("base:widget/small-flow/small-flow-util.js"),
        p = e("function-widget-1:download/util/downloadCommonUtil.js"), _ = e("base:widget/storage/storage.js"), w = "",
        I = {}, y = c.state, E = y.logMap;
    t.exports = {
        start: function (e, o) {
            I = o, w = e, y.mode = a(e), y.fromVideoCall = !1, I.mode = y.mode, i()
        }, initDialogEvent: function (e, o) {
            I = o, w = e, y.dialog.isInitEvent || (y.dialog.isInitEvent = !0, n())
        }
    }
});
;define("function-widget-1:download/service/guanjiaDownloadController.js", function (i, n, a) {
    function e() {
        var i = v[f.INDEX_OF_PRODUCT], n = {};
        n[f.PRODUCT_SHARE] = j, n[f.PRODUCT_PAN] = t, n[f.PRODUCT_UNIONDIR] = o, U.ct = "pcygj", U.cv = E.guanjiaVersion, E.loadingTips = loadingTips = h().ui.tip({
            msg: "正在启动网盘客户端，请稍候...",
            mode: "loading",
            autoClose: !1
        }), n[i](), h().log.send({name: "callGuanjia", value: "success"})
    }

    function o() {
        var i = U.list[0].fs_id;
        j({
            path: U.list,
            product: "sf",
            hasDlink: !0,
            share_uk: yunData.MYUK,
            share_id: i,
            sign: yunData.sign1,
            timestamp: yunData.timestamp,
            isForBatch: !1,
            isForGuanjia: !0
        })
    }

    function t() {
        for (var i, n = [], a = [], e = null, o = 0, t = U.list.length; t > o; o++) i = {}, e = U.list[o], i.isdir = String(e.isdir), i.md5 = e.md5 || "", i.size = String(e.size || 0), i.server_path = e.path, i.uk = "", i.shareid = "", i.token = "", i.fs_id = e.fs_id, e.dlink || e.isdir ? i.link = e.dlink && c.getDownloadUrl(e) || "" : a.push(e.fs_id), n.push(i);
        a.length > 0 ? (h().ui.tip({
            mode: "loading",
            msg: "正在获取下载链接，请稍后...",
            autoClose: !1
        }), C.getDlinkPan(C.getFsidListData(U.list), "dlink", function (i) {
            0 === i.errno && (h().ui.hideTip(), n = p.getFormatedLinkList(n, i.dlink), g(n))
        }, "pcygj", E.guanjiaVersion)) : g(n)
    }

    function l() {
        if (E.guanjiaVersion = m.getVersion(), E.guanjiaVersion) e(); else {
            if (0 === T("div.chromeUpgradeHelpTip", E.dialog.$dialog).length) {
                var i = T('<div class="chromeUpgradeHelpTip" style="text-align: center;position:relative;margin-bottom:10px;">已安装新版客户端，<a style="color:#09AAFF;" href="javascript:void(0);" class="local_retry">点此启动客户端开始下载</a>（已启动，<a style="color:#fc6258;text-decoration:underline;" href="/disk/help#FAQ18" target="_blank">仍无法下载？</a>）</div>');
                T("div.dlg-ft", E.dialog.$dialog).after(i), T("div.chromeUpgradeHelpTip a.local_retry").bind("click", function () {
                    return c.openYunGuanjiaByScheme("baiduyunguanjia://guanjia/noui", function () {
                        E.MAX_CHECK_COUNT = 7, E.checkCount = E.MAX_CHECK_COUNT, E.mode = "preInstall", I.updateDialog(f, U), l()
                    }), !1
                })
            }
            E.checkCount > 0 ? (E.checkCount === E.MAX_CHECK_COUNT && (3 === E.MAX_CHECK_COUNT ? m.init() : m.init(!0), E.loadingTips = h().ui.tip({
                msg: "正在启动网盘客户端，请稍候...",
                mode: "loading",
                autoClose: !1
            })), E.checkCount--, setTimeout(function () {
                l()
            }, 500)) : E.first ? (E.first = !1, c.openYunGuanjiaByScheme("baiduyunguanjia://guanjia/noui", function () {
                E.MAX_CHECK_COUNT = 7, E.checkCount = E.MAX_CHECK_COUNT, l()
            })) : (E.dialog.show(), E.loadingTips.hide(), E.mode = "postInstall", h().log.send({
                name: "callGuanjia",
                value: "failure"
            })), h().log.send({
                page: c.getDownloadLogmsg(),
                type: v[f.INDEX_OF_FILENUM] === f.FILE_NUM_SINGLE && v[f.INDEX_OF_FILESIZE] === f.FILE_SIZE_MORE_LIMIT ? "DownloadPluginDisplayForceHugeOptions" : "DownloadPluginDisplayForceNonhugeOptions"
            })
        }
    }

    function s() {
        D.init(function () {
            E.guanjiaVersion = D.getVersion(), u()
        })
    }

    function d(i, n) {
        var a, e, o = (E.guanjiaVersion, !1), t = v[f.INDEX_OF_PRODUCT], l = {};
        l[f.PRODUCT_SHARE] = function () {
            var t = "share" === h().pageInfo.currentProduct,
                l = c.isPlatformWindows() && !c.compareVersion(E.guanjiaVersion, E.GUANJIA_VERSION_COMPARE);
            try {
                t && l ? (a = T.stringify({filelist: i}), e = m.callGuanjia(0 === yunData.SHARE_PUBLIC ? "DownloadPrivateShareItems" : "DownloadPublicShareItems", a)) : e = n ? m.callGuanjia("DownloadShareItems", n, yunData.MYUK, o) : 2, 0 > e && p.doError(e)
            } catch (s) {
                e = -2, p.doError(e)
            }
        }, l[f.PRODUCT_UNIONDIR] = l[f.PRODUCT_SHARE], l[f.PRODUCT_PAN] = function () {
            a = T.stringify({filelist: i});
            try {
                e = c.isPlatformWindows() && !c.compareVersion(E.guanjiaVersion, E.GUANJIA_VERSION_COMPARE) ? m.callGuanjia("DownloadSelfOwnItems", a, yunData.MYNAME) : m.callGuanjia("DownloadSelfOwnItems", a, yunData.MYUK + ""), 0 > e && p.doError(e)
            } catch (n) {
                e = -2, p.doError(e)
            }
        }, E.loadingTips && setTimeout(function () {
            E.loadingTips.hide()
        }, 5e3), h().log.send({name: "call_guanjia_local", value: "下载本地服务调起"}), l[t]()
    }

    function u() {
        var i = {}, n = v[f.INDEX_OF_PRODUCT];
        i[f.PRODUCT_SHARE] = function () {
            h().ui.tip({
                mode: "loading",
                msg: "正在获取下载链接，请稍后...",
                autoClose: !1
            }), U.isForGuanjia = !0, C.getDlinkShare(U, function (i) {
                h().ui.hideTip(), r(void 0, i.list)
            })
        }, i[f.PRODUCT_PAN] = function () {
            t()
        }, i[f.PRODUCT_UNIONDIR] = o, i[n](), E.loadingTips && E.loadingTips.hide()
    }

    function r(i, n) {
        var a = D.getBrowserId(), e = {}, o = {}, t = v[f.INDEX_OF_PRODUCT];
        if (o[f.PRODUCT_SHARE] = {
            method: "DownloadShareItems",
            uk: yunData.MYUK ? yunData.MYUK + "" : "0",
            checkuser: !1,
            filelist: n
        }, o[f.PRODUCT_PAN] = {
            method: "DownloadSelfOwnItems",
            uk: yunData.MYUK + "",
            filelist: i
        }, e = c.checkIsShare() ? {
            method: "DownloadShareItems",
            uk: yunData.MYUK ? yunData.MYUK + "" : "0",
            checkuser: !0,
            filelist: n
        } : o[t], 0 === T("div.chromeUpgradeHelpTip", E.dialog.$dialog).length) {
            var l = T('<div class="chromeUpgradeHelpTip" style="text-align: center;position:relative;margin-bottom:10px;">已安装新版客户端，仍无法下载，<a style="color:#fc6258;" href="/disk/help#FAQ18" target="_blank">查看原因</a></div>');
            T("div.dlg-ft", E.dialog.$dialog).after(l)
        }
        D.sendServer(a, T.stringify(e), function (i) {
            if (i && 0 === i.errno) {
                E.loadingTips = h().ui.tip({msg: "正在启动网盘客户端，请稍候...", mode: "loading", autoClose: !1});
                var n = i.seq, e = i.status;
                0 === e ? (E.loadingTips.hide(), h().log.send({
                    name: "callGuanjiaByServer",
                    value: "success"
                })) : 1 === e ? D.checkCallStatus(a, n, function (i, n, a) {
                    1 === a && E.loadingTips.hide(), 2 === a && (E.dialog.show(), E.loadingTips.hide(), E.mode = "postInstall")
                }) : 2 === e || 3 === e ? c.openYunGuanjiaByScheme("baiduyunguanjia://evoked-download/?browserId=" + a + "&seq=" + n, function () {
                    D.checkCallStatus(a, n, function (i, n, a) {
                        1 === a && E.loadingTips.hide(), 2 === a && (E.dialog.show(), E.loadingTips.hide(), E.mode = "postInstall")
                    })
                }) : (E.loadingTips && E.loadingTips.hide(), h().ui.tip({
                    mode: "caution",
                    msg: "服务器繁忙，请稍后重试"
                }), h().log.send({name: "callGuanjiaByServer", value: "failure"}))
            } else E.loadingTips && E.loadingTips.hide(), h().ui.tip({
                mode: "caution",
                msg: "参数错误"
            }), h().log.send({name: "callGuanjiaByServer", value: "failure"});
            h().log.send({name: "call_guanjia_server", value: "下载长连接方式调起"})
        })
    }

    function g(i, n) {
        c.shouldKeepAlive() ? r(i, n) : d(i, n)
    }

    var c = i("function-widget-1:download/util/downloadCommonUtil.js"),
        p = i("function-widget-1:download/util/downloadGuanjiaUtil.js"), f = i("function-widget-1:download/config.js"),
        h = i("function-widget-1:download/util/context.js").getContext,
        m = i("function-widget-1:download/service/guanjiaConnector.js"),
        D = i("function-widget-1:download/service/guanjiaServerProxy.js"),
        C = i("function-widget-1:download/service/dlinkService.js"),
        I = i("function-widget-1:download/util/interactionUtil.js"), T = i("base:widget/libs/jquerypacket.js"), v = "",
        U = {},
        E = {loadingTips: null, guanjiaVersion: null, first: !0, GUANJIA_VERSION_COMPARE: "4.8.0", MAX_CHECK_COUNT: 3},
        j = function () {
            var i = function (i, n, a, e) {
                a = a ? a + "" : "0";
                for (var o, t = [], l = [], s = (h().tools.baseService.getCookie("BDCLND"), null), d = 0, u = U.list.length; u > d; d++) o = {}, s = U.list[d], o.isdir = String(s.isdir), o.md5 = s.md5 || "", o.size = String(s.size || 0), o.server_path = s.path, o.uk = "", o.shareid = "", o.token = "", o.fs_id = s.fs_id, s.dlink || s.isdir ? o.link = s.dlink && c.getDownloadUrl(s) || "" : l.push(s.fs_id), t.push(o);
                l.length > 0 ? (h().ui.tip({
                    mode: "loading",
                    msg: "正在获取下载链接，请稍后..."
                }), C.getDlinkShare(e || U, function (i) {
                    h().ui.hideTip(), i.list && _.isString(i.list) ? g(void 0, i.list) : g(p.getFormatedLinkList(t, i.list))
                })) : (T.get("/share/autoincre", {
                    type: 1,
                    uk: yunData.SHARE_UK,
                    shareid: yunData.SHARE_ID,
                    sign: yunData.SIGN,
                    timestamp: yunData.TIMESTAMP
                }), g(t))
            };
            return function (n) {
                c.isPlatformWindows() && E.guanjiaVersion < E.GUANJIA_VERSION_COMPARE ? i(U, yunData.SHARE_ID, yunData.SHARE_UK, n) : (h().ui.tip({
                    mode: "loading",
                    msg: "正在获取下载链接，请稍后...",
                    autoClose: !1
                }), U.isForGuanjia = !0, C.getDlinkShare(n || U, function (i) {
                    h().ui.hideTip(), g(void 0, i.list)
                }))
            }
        }();
    a.exports = {
        start: function (i, n) {
            v = i, U = n, E.checkCount = E.MAX_CHECK_COUNT;
            for (var a in E) U.state ? U.state[a] = E[a] : I.state[a] = E[a];
            E = U.state ? U.state : I.state, E.mode = "preInstall", U.mode = E.mode, I.updateDialog(v, U), v[f.INDEX_OF_FILESIZE] === f.FILE_SIZE_MORE_LIMIT && h().log.send({
                page: c.getDownloadLogmsg(),
                type: U.logMsg.category + "-" + U.logMsg.actionCompulsoryPlugin
            }), E.dialog.hide(), c.shouldKeepAlive() ? s() : l()
        }
    }
});
;define("function-widget-1:download/service/downloadDirect.js", function (n, e, o) {
    function t(n) {
        var e = "";
        e = D.isNormalSingleFile ? "downloadfile|downloadSize_" + n[0].size + "|downloadFileLength_1|downloadFileCategory_." + n[0].path.split(".")[n[0].path.split(".").length - 1] : "downloadfile|downloadFileLength_" + n.length, h().log.send({
            page: w.getDownloadLogmsg(),
            type: e,
            pf: navigator.platform,
            fileSize: w.getFileSizeType(D.list),
            md5: n[0].md5 || "proxypcs"
        }), /chrome\/(\d+\.\d+)/i.test(navigator.userAgent) && h().log.send({
            name: "chromeStraightforwardDownload",
            sendServerLog: !1,
            value: "chrome"
        })
    }

    function i() {
        var n = g.browser, e = !1;
        return n.msie && parseInt(n.version, 10) <= 8 && (e = !0), e
    }

    function a(n) {
        var e = "", o = n.dlink;
        return f && f._sResult && (e = "&cflg=" + encodeURIComponent(f._sResult + ":" + f._sRevision), o += e), o && 0 === o.indexOf("http://") && "https:" === window.location.protocol && (o = o.replace("http://", window.location.protocol + "//")), g.browser.msie && (o += "&response-cache-control=private"), o
    }

    function d() {
        if (!L) {
            var n = document.createElement("div");
            n.className = "pcs-hide-ele", n.innerHTML = '<iframe src="javascript:;" id="pcsdownloadiframe" name="pcsdownloadiframe" style="display:none"></iframe><form target="pcsdownloadiframe" enctype="application/x-www-form-urlencoded" action="' + F + '" method="post" name="pcsdownloadform"><input name="method" value="batchdownload" type="hidden" /><input name="zipcontent" type="hidden" /><input name="zipname" type="hidden" /></form>', document.body.appendChild(n)
        }
        L = !0
    }

    function l(n) {
        var e = null;
        d(), e = document.getElementById("pcsdownloadiframe");
        var o = n.dlink.match(/(http|https):\/\/([^\/]*)\/.*/), t = o ? o[2] : "";
        e.onload = e.onreadystatechange = function () {
            h().log.send({
                type: n.logType || "webotherdownload",
                url: "//update.pan.baidu.com/statistics",
                clienttype: "0",
                op: "download",
                product: "pan",
                from: n.logFrom,
                success: 0,
                reason: "dlinkDownloadFailed",
                dlinkDomain: t
            })
        }, e.src = a(n)
    }

    function r(n) {
        if (i()) {
            var e = null, e = h().ui.confirm({
                title: "提示", body: "下载链接已生成，请点击下载。", sureText: "立即下载", onSure: function () {
                    e.hide(), l(n), h().log.send({page: w.getDownloadLogmsg(), type: "download_browser_lteq_ie8"})
                }
            });
            e.show()
        } else l(n)
    }

    function c(n, e) {
        var o = "batch" === e, t = {
            path: D.list,
            product: "sf",
            hasDlink: !0,
            share_uk: yunData.MYUK,
            share_id: n[0].fs_id,
            sign: yunData.sign1,
            timestamp: yunData.timestamp,
            isForBatch: o
        };
        v.getDlinkShare(t, function (n, e) {
            var t = "";
            o ? t += n.dlink + "&zipname=" + encodeURIComponent(w.getPackName(D.list)) : t = n[e || "list"][0].dlink, I.dlink = t, n.logType && (I.logType = n.logType), n.logFrom && (I.logFrom = n.logFrom), r(I)
        })
    }

    function s(n, e) {
        v.getDlinkPan(v.getFsidListData(n), e, function (o) {
            "batch" === e ? I.dlink = o.dlink + "&zipname=" + encodeURIComponent(w.getPackName(n)) : "dlink" === e && (I.dlink = o.dlink[0].dlink), r(I)
        })
    }

    function p(n, e) {
        D.isForBatch = "batch" === e, 1 === n.length ? v.getDlinkShare(D, function (n) {
            I.dlink = D.isForBatch ? n.dlink : n.list[0].dlink, r(I)
        }) : v.getDlinkShare(D, function (e) {
            I.dlink = e.dlink + "&zipname=" + encodeURIComponent(w.getPackName(n)), r(I)
        })
    }

    function m(n) {
        I = n[0];
        var e = "directDownloadIn" + b[y[1]];
        y[3] === k.FILE_HASDLINK && r(I), y[3] === k.FILE_NODLINK && (y[4] === k.FILE_HASDIR ? _[e](n, "batch") : _[e](n, "dlink"))
    }

    function u(n) {
        I = {};
        var e = "directDownloadIn" + b[y[1]];
        _[e](n, "batch")
    }

    var g = n("base:widget/libs/jquerypacket.js"), w = n("function-widget-1:download/util/downloadCommonUtil.js"),
        f = n("function-widget-1:download/util/pcsUtil.js"),
        h = (n("base:widget/libs/underscore.js"), n("function-widget-1:download/util/context.js").getContext),
        k = n("function-widget-1:download/config.js"), v = n("function-widget-1:download/service/dlinkService.js"),
        y = "", D = {}, I = {}, _ = {directDownloadInPan: s, directDownloadInShare: p, directDownloadInUniondir: c},
        b = {0: "Pan", 1: "Share", 2: "Uniondir"},
        F = "https://pcs.baidu.com/rest/2.0/pcs/file?method=batchdownload&app_id=250528", L = !1;
    o.exports = {
        start: function (n, e) {
            y = n, D = e;
            var o = D.list;
            y[2] === k.FILE_NUM_SINGLE && m(o), y[2] === k.FILE_NUM_MULTIPLE && u(o), t(o)
        }
    }
});
;define("function-widget-1:download/controller/downloadController.js", function (o, n, e) {
    function i(o) {
        I.sizeConfig.isRequestServer ? "function" == typeof o && o() : c.ajax({
            url: "/disk/cmsdata",
            data: {"do": "manual", ch: "download_limit"},
            type: "GET",
            dataType: "JSON",
            cache: !1,
            timeout: 5e3,
            success: function (n) {
                var e, i = I.sizeConfig.fileSizeLimit;
                if (0 === n.errorno && n.content) try {
                    e = c.parseJSON(n.content)[0], e.download_limit && (I.sizeConfig.fileSizeLimit = parseInt(e.download_limit, 10)), e.download_limit_chrome && w.isChromeAndGreaterThan42() && (I.sizeConfig.fileSizeLimit = parseInt(e.download_limit_chrome, 10)), I.sizeConfig.isDefaultSize = !1
                } catch (t) {
                    I.sizeConfig.fileSizeLimit = i
                }
                I.sizeConfig.isRequestServer = !0, "function" == typeof o && o()
            },
            error: function () {
                "function" == typeof o && o()
            }
        })
    }

    function t(o, n) {
        var e = [];
        o = o.length > 0 ? o : [""], n = n.length > 0 ? n : [""];
        for (var i = 0; i < o.length; i++) for (var t = 0; t < n.length; t++) e.push(o[i] + n[t]);
        return e
    }

    function a(o) {
        for (var n = [""], e = [], i = 0; i < o.length; i++) e.push(o[i].split(""));
        for (var a = 0; a < e.length; a++) n = t(n, e[a]);
        return n
    }

    function l(o) {
        for (var n = [], e = 0; e < o.length; e++) n = n.concat(a(o[e]));
        return n = g.uniq(n)
    }

    function r(o) {
        if ("string" != typeof o) return "";
        var n = C.exec(o);
        return n && n[1] ? n[1] : ""
    }

    function d(o) {
        for (var n = 0; n < o.length; n++) if (o[n].isdir && 1 === o[n].isdir) return !0;
        return !1
    }

    function s(o) {
        var n, e = o.list, i = "", t = "", a = "", l = "", s = "", c = "", g = "", u = 0;
        i = w.isPlatformWindows() ? I.PLATFORM_WINDOWS : I.PLATFORM_MAC, t = w.checkIsShare() ? I.PRODUCT_UNIONDIR : window.yunData.SHAREPAGETYPE ? I.PRODUCT_SHARE : I.PRODUCT_PAN, l = 1 === e.length ? I.FILE_NUM_SINGLE : e.length > 1 && e.length < 100 ? I.FILE_NUM_MULTIPLE : I.FILE_NUM_MORE_100, a = o.hasDlink ? I.FILE_HASDLINK : I.FILE_NODLINK, s = d(e) ? I.FILE_HASDIR : I.FILE_NOTDIR;
        for (var f = 0; f < e.length; f++) u += e[f].size;
        return u = Math.ceil(u / 1024 / 1024), c = u < I.sizeConfig.fileSizeSmall ? I.FILE_SIZE_LESS_SMALL : u >= I.sizeConfig.fileSizeSmall && u <= I.sizeConfig.fileSizeLimit ? I.File_SIZE_BETWEEN_SMALL_AND_LIMIT : I.FILE_SIZE_MORE_LIMIT, l === I.FILE_NUM_SINGLE && s === I.FILE_NOTDIR ? (n = e[0], g = w.isChrome() && ["exe", "apk"].indexOf(r(n.server_filename)) > -1 ? I.FILE_TYPE_CHROMEAPKEXE : I.FILE_TYPE_GENERAL) : g = I.FILE_TYPE_GENERAL, h = i + t + l + a + s + c + g
    }

    var c = o("base:widget/libs/jquerypacket.js"), g = o("base:widget/libs/underscore.js"),
        u = o("function-widget-1:download/service/downloadDirect.js"),
        f = o("function-widget-1:download/service/guanjiaDownloadController.js"),
        _ = o("function-widget-1:download/service/dialogDownload.js"),
        w = o("function-widget-1:download/util/downloadCommonUtil.js"),
        I = (o("function-widget-1:download/service/dlinkService.js"), o("function-widget-1:download/config.js")),
        E = o("function-widget-1:download/util/context.js").getContext, m = o("base:widget/storage/storage.js"), D = [],
        p = [], L = [], h = "";
    D = D.length ? D : l(I.directDownloadkeysConfig), p = p.length ? p : l(I.guanjiaDownloadkeysConig), L = L.length ? L : l(I.dialogDownloadkeysConfig);
    var S = {}, C = /\.(\w+)$/;
    e.exports = {
        download: function (o) {
            S = o;
            var n = S.list, e = n.length, t = g.filter(n, function (o) {
                return 1 !== +o.isdir
            }).length, a = "";
            if (!n.length) return void E().ui.tip({mode: "caution", msg: "您还没有选择下载的文件"});
            if (S.packName = E().tools.baseService.parseDirFromPath(n[0].path), 0 === e) return void w.useToast({
                toastMode: "caution",
                msg: "您还没有选择下载的文件"
            });
            t > 0 && E().log.send({name: "file_down_count", value: t, discription: "文件下载(不包含文件夹)"});
            var l = yunData.SHARE_UK ? "share-" : "";
            S.logMsg = {
                category: l + "singleFileDownloadCategory",
                singleFileCategory: l + "singleFileDownloadCategory",
                multipleFileCategory: l + "multipleFileDownloadCategory",
                actionRecommendPlugin: "actionRecommendPluginDialog",
                actionCompulsoryPlugin: "actionCompulsoryPluginDialog",
                actionDownloadByPlugin: "actionDownloadByPluginAction",
                actionDownloadClient: "downloadClientAction",
                actionInstallClient: "installClientAction",
                actionAccelerateDownload: "accelerateDownloadAction",
                actionOrdinaryDownload: "ordinaryDownloadAction",
                actionDownReportIssue: "downReportIssueAction",
                opt_value: 10
            }, i(function () {
                if (a = s(S), a[0] === I.PLATFORM_WINDOWS ? E().log.send({type: "download_platform_windows"}) : (a[0] !== I.PLATFORM_MAC && (E().log.send({type: "mock_pf_" + navigator.platform}), E().log.send({type: "download_platform_others"})), E().log.send({type: "download_platform_mac"})), a[I.INDEX_OF_PRODUCT] !== I.PRODUCT_SHARE && "mpage" !== S.product_second && (S.isVideo = S.packName && 1 === S.list.length ? 1 === +S.list[0].category : !1), S.isNormalSingleFile = a[I.INDEX_OF_ISDIR] === I.FILE_NOTDIR && a[I.INDEX_OF_FILENUM] === I.FILE_NUM_SINGLE, D.indexOf(h) > -1) {
                    if ("share" === E().pageInfo.currentProduct && (!window.yunData || 1 !== Number(window.yunData.LOGINSTATUS))) return E().log.send({type: "download_share_login"}), window.yunHeader.login.util.loginNew(), window.yunHeader.on("loginSuccess", function () {
                        m.setItem("shareAutoDownload", "1"), E().log.send({type: "download_share_login_success"})
                    }), !1;
                    u.start(a, S)
                } else if (p.indexOf(a) > -1 && !S.isVideo) S.mode = "preInstall", _.initDialogEvent(a, S), f.start(a, S); else {
                    if (!(L.indexOf(a) > -1 || S.isVideo)) throw new Error("unknow download key");
                    _.start(h, S)
                }
            })
        }
    }
});
;define("function-widget-1:download/service/dlinkService.js", function (t, e, r) {
    var a = t("base:widget/libs/jquerypacket.js"), o = t("base:widget/libs/underscore.js"),
        n = t("function-widget-1:download/util/context.js").getContext, i = t("base:widget/vip/vip.js"),
        s = t("base:widget/tools/service/tools.cookie.js").getCookie, d = window.yunData, c = {
            PRODUCT_PAN: "pan",
            PRODUCT_MBOX: "mbox",
            PRODUCT_SHARE: "share",
            currentProduct: null,
            dialog: null,
            sign: null,
            setCurrentProduct: function (t) {
                this.currentProduct = t
            },
            getCurrentProduct: function () {
                return this.currentProduct
            },
            URL_DLINK_PAN: "/api/download",
            URL_DLINK_SHARE: "/api/sharedownload",
            _doError: function (t, e) {
                var r = "", a = this, o = n().accountBan(t);
                return o.isBan ? !1 : (2 == t && (r = "下载失败，请稍候重试"), 116 === t && (r = "该分享不存在！"), -1 === t && (r = "您下载的内容中包含违规信息！"), 118 === t && (r = "没有下载权限！"), (113 === t || 112 === t) && (r = '页面已过期，请<a href="javascript:window.location.reload();">刷新</a>后重试'), -20 === t ? void a._showVerifyDialog() : (121 === t && (r = "你选择操作的文件过多，减点试试吧。"), (31326 === t || 31426 === t) && (r = e ? decodeURIComponent(e) : "下载失败"), r = r || "网络错误，请稍候重试", void n().ui.tip({
                    mode: "caution",
                    msg: r,
                    hasClose: !0,
                    autoClose: !1
                })))
            },
            getFsidListData: function (t) {
                return o.isArray(t) === !1 && (t = [t]), a.stringify(o.pluck(t, "fs_id"))
            },
            getPathListData: function (t) {
                return o.isArray(t) === !1 && (t = [t]), a.stringify(o.pluck(t, "path"))
            },
            base64Encode: function (t) {
                var e, r, a, o, n, i, s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                for (a = t.length, r = 0, e = ""; a > r;) {
                    if (o = 255 & t.charCodeAt(r++), r == a) {
                        e += s.charAt(o >> 2), e += s.charAt((3 & o) << 4), e += "==";
                        break
                    }
                    if (n = t.charCodeAt(r++), r == a) {
                        e += s.charAt(o >> 2), e += s.charAt((3 & o) << 4 | (240 & n) >> 4), e += s.charAt((15 & n) << 2), e += "=";
                        break
                    }
                    i = t.charCodeAt(r++), e += s.charAt(o >> 2), e += s.charAt((3 & o) << 4 | (240 & n) >> 4), e += s.charAt((15 & n) << 2 | (192 & i) >> 6), e += s.charAt(63 & i)
                }
                return e
            },
            getDlinkPan: function (t, e, r, o, s, c) {
                var u, p, l = this;
                if (null === l.sign) {
                    try {
                        p = new Function("return " + d.sign2)()
                    } catch (g) {
                        throw new Error(g.message)
                    }
                    if ("function" != typeof p) return void this._doError();
                    l.sign = l.base64Encode(p(d.sign5, d.sign1))
                }
                "[object Array]" === Object.prototype.toString.call(t) ? t = a.stringify(t) : "string" != typeof t || /^\[\S+\]$/.test(t) || (t = "[" + t + "]"), u = {
                    sign: l.sign,
                    timestamp: d.timestamp,
                    fidlist: t,
                    type: e,
                    vip: i.getVipValue()
                }, o && s && (u.ct = o, u.cv = s), "cardHolder" === n().router.currentRouteName && (u.src = "cardholder"), a.ajax({
                    url: this.URL_DLINK_PAN,
                    data: u,
                    dataType: "json",
                    type: c || "GET",
                    success: function (t, e, o) {
                        n().log.send({
                            type: "webdownload",
                            url: "//update.pan.baidu.com/statistics",
                            clienttype: "0",
                            op: "download",
                            from: u.type,
                            product: "pan",
                            success: t && 0 === +t.errno ? 1 : 0,
                            reason: t ? t.errno : 0,
                            ajaxstatus: o.status,
                            ajaxurl: "/api/download",
                            ajaxdata: a.stringify(e)
                        }), 0 == t.errno ? t.dlink && t.dlink.length > 0 ? "function" == typeof r && (t.logType = "webdownload", t.logFrom = u.type, r(t)) : l._doError() : l._doError(t.errno, t.errmsg)
                    },
                    error: function (t, e) {
                        n().log.send({
                            type: "webdownload",
                            url: "//update.pan.baidu.com/statistics",
                            clienttype: "0",
                            op: "download",
                            from: u.type,
                            product: "pan",
                            success: 0,
                            ajaxstatus: t.status,
                            ajaxurl: "/api/download",
                            ajaxdata: a.stringify(e)
                        }), l._doError()
                    }
                })
            },
            ajaxGetDlinkShare: function () {
                var t = {encrypt: 0};
                0 === d.SHARE_PUBLIC && (t.extra = a.stringify({sekey: decodeURIComponent(s("BDCLND"))}));
                var e = function () {
                    a.get("/share/autoincre", {
                        type: 1,
                        uk: d.SHARE_UK,
                        shareid: d.SHARE_ID,
                        sign: d.SIGN,
                        timestamp: d.TIMESTAMP
                    })
                };
                return function (r, o) {
                    var s = this, d = a.extend({}, t, r), c = d.sign, u = d.timestamp;
                    delete d.sign, delete d.timestamp, d.vip = i.getVipValue(), a.ajax({
                        type: "POST",
                        url: this.URL_DLINK_SHARE + "?sign=" + c + "&timestamp=" + u,
                        data: d,
                        dataType: "json",
                        success: function (t, r, i) {
                            return n().log.send({
                                type: "websharedownload",
                                url: "//update.pan.baidu.com/statistics",
                                clienttype: "0",
                                op: "download",
                                from: d.product,
                                product: "pan",
                                success: t && 0 === +t.errno ? 1 : 0,
                                reason: t ? t.errno : 0,
                                ajaxstatus: i.status,
                                ajaxurl: "/api/sharedownload",
                                ajaxdata: a.stringify(r)
                            }), t ? void(0 == t.errno ? (d.product === s.PRODUCT_SHARE && e(), "function" == typeof o && (t.logType = "websharedownload", t.logFrom = d.product, o(t))) : s._doError(t.errno, t.errmsg)) : void s._doError()
                        },
                        error: function (t, e) {
                            n().log.send({
                                type: "websharedownload",
                                url: "//update.pan.baidu.com/statistics",
                                clienttype: "0",
                                op: "download",
                                from: d.product,
                                product: "pan",
                                success: 0,
                                ajaxstatus: t.status,
                                ajaxurl: "/api/sharedownload",
                                ajaxdata: a.stringify(e)
                            }), s._doError()
                        }
                    })
                }
            }(),
            getDlinkShare: function () {
                var t = function (t) {
                    var e = {product: c.PRODUCT_SHARE, encrypt: 0, timestamp: "", sign: ""}, r = {};
                    return t.vcode_input && t.vcode_str && (r.vcode_input = t.vcode_input, r.vcode_str = t.vcode_str), t.type && (r.type = t.type), t.isForBatch === !0 && (r.type = "batch"), t.isForGuanjia === !0 && (r.encrypt = 1), t.ct && t.cv && (r.ct = t.ct, r.cv = t.cv), r = a.extend({}, e, r, {
                        uk: t.share_uk,
                        primaryid: t.share_id,
                        product: t.product,
                        fid_list: t.list ? c.getFsidListData(t.list) : "",
                        path_list: t.path ? c.getPathListData(t.path) : "",
                        sign: t.sign,
                        timestamp: t.timestamp
                    })
                };
                return function (e, r) {
                    this.arguments = arguments, this.ajaxGetDlinkShare(t(e), r)
                }
            }(),
            _showVerifyDialog: function () {
                var t = this;
                t.dialog = n().ui.verify({
                    title: "提示", prod: "pan", onSure: function (e, r) {
                        t.arguments[0].vcode_str = e, t.arguments[0].vcode_input = r, t.arguments.callee.apply(t, t.arguments)
                    }
                }), t.dialog.show()
            }
        };
    r.exports = c
});