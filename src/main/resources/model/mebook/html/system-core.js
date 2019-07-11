define("system-core:system/uiService/log/log.js", function (e, a, t) {
    function i(e) {
        e = e || {}, this.url = e.url || "/api/analytics", this.logObjectName = e.logObjectName || "fe_log_", this.sendBaseParamTag = !0, this.baseParam = {
            clienttype: 0,
            vmode: null,
            searchForm: null
        }, this.UrlLength = 900, this.data = null, this.eventData = {}, this.ajaxData = {}, this.mixData = {}, s(document).ajaxComplete(n.bind(this._ajaxCallback, this))
    }

    var n = e("base:widget/libs/underscore.js"), s = e("base:widget/libs/jquerypacket.js"),
        o = e("base:widget/tools/tools.js"), r = e("base:widget/router/Router.js").app, l = {
            pan: [/\/disk\/home/, /\/disk\/timeline/, /\/disk\/similarimages/, /\/netdisk\/home/, /\/disk\/searchtype/],
            share: [/\/share\/link/, /\/s\/1[a-zA-Z0-9]*/],
            mbox: [/\/mbox\/homepage/]
        };
    i.mid = 1, i.globalInit = 0, i.prototype = {
        _addMid: function (e, a) {
            return n.isObject(e) ? (e.mid = a || 1, e) : n.isString(e) ? {name: e, mid: a || 1} : void 0
        }, _checkLogExist: function (e) {
            if (!n.isObject(e)) throw new Error("[Log declare error]: The data of log must be a object !");
            if (!e.name) throw new Error("[Log declare error]: The name of log must !");
            return !!this.mixData[e.name]
        }, getFromPageType: function () {
            var e = location.pathname;
            if (e) for (var a in l) if (l.hasOwnProperty(a)) for (var t = l[a], i = 0; i < t.length; i++) if (t[i].test(e)) return a
        }(), _sendServerLog: function (e) {
            var a, t = e.url || this.url, i = (new Date).getTime(), n = {};
            if (this.sendBaseParamTag) for (a in this.baseParam) n[a] = "function" == typeof this.baseParam[a] ? this.baseParam[a]() : this.baseParam[a];
            var s = {version: "v5"};
            for (a in e) "type" === a && (e[a] = e[a].replace(/-/g, "_")), "url" !== a && (s[a] = "function" == typeof e ? e[a]() : e[a]);
            var o = this._getRequestUrl(i, t, n, s);
            if (e.sendPageFrom && s.type) {
                var r = this.getFromPageType;
                if (r) {
                    s.type += "_" + r;
                    var l = this._getRequestUrl(i, t, n, s);
                    o = o.concat(l)
                }
            } else if (e.logFrom && s.type) {
                s.type += "_" + e.logFrom;
                var l = this._getRequestUrl(i, t, n, s);
                o = o.concat(l)
            }
            for (var u = 0, d = o.length; d > u; u++) this._request(i, u, o[u])
        }, _request: function (e, a, t) {
            var i = this.logObjectName + "_" + e + "_" + a;
            window[i] = new Image;
            var n = window[i];
            n.onload = n.onerror = function () {
                window[i] = null
            }, n.src = t, n = null
        }, _getRequestUrl: function (e, a, t, i) {
            var s, o = [], l = [];
            if (-1 !== a.indexOf("update.pan.baidu.com")) {
                for (var u = "//update.pan.baidu.com/statistics?clienttype=0&version=v5", d = ["clienttype", "version"], c = ["op", "type"], h = 0; h < c.length; h++) u = u + "&" + c[h] + "=" + i[c[h]];
                for (var s in i) -1 === c.indexOf(s) && -1 === d.indexOf(s) && (u = u + "&" + s + "=" + i[s]);
                o.push(u)
            } else {
                if (t) {
                    t.vmode = r.query.get("vmode"), t.searchForm = "search" === r.currentRouteName && null !== r.query.get("key");
                    for (s in t) l.push(s + "=" + t[s])
                }
                l = l.join("&"), l = "" === l ? "" : "&" + l;
                var m = a + "?_lsid=" + e + "&_lsix=1" + l, g = 1;
                for (s in i) if (n.isArray(i[s])) {
                    for (var f = i[s], p = [], v = m.length + s.length + 2, _ = 0, y = f.length; y > _; _++) v += f[_].length + 1, v > this.UrlLength ? (o.push(m + "&" + s + "=" + p.join()), g++, p = [], v = m.length + s.length + 2, m = a + "?_lsid=" + e + "&_lsix=" + g + l, _--) : p.push(f[_]);
                    p.length > 0 && (m += "&" + s + "=" + p.join())
                } else m.length + s.length > this.UrlLength && (o.push(m), g++, m = a + "?_lsid=" + e + "&_lsix=" + g + l), m += "&" + s + "=" + i[s];
                o.push(m)
            }
            return o
        }, _ajaxCallback: function (e, a, t) {
            var i = this, o = t.url;
            for (var r in i.ajaxData) if (o.indexOf(r) > -1) {
                o = r;
                break
            }
            var l = i.ajaxData[o];
            if (l) {
                if (!l.callback) return void(l.logType && l.data && i._sendLogData(l.logType, l.data));
                var u = (new Date).getTime(), d = a.status, c = a.response || a.responseJSON || a.responseText, h = {};
                "string" == typeof c ? h = s.parseJSON(c) : n.isObject(c) && (h = c);
                var m = 0;
                e.timeStamp && u > e.timeStamp && (m = u - e.timeStamp), i._sendLogData(l.logType, l.callback(t, {
                    httpStatus: d,
                    responseData: h,
                    time: m
                }))
            }
        }, sendDpTimeLog: function (e) {
            e = e || {};
            var a = e.name || "default", t = {}, i = window.alog || function () {
            };
            t["z_" + a] = e.value || "", n.isFunction(i) && i("cus.fire", "time", t)
        }, sendDpDisLog: function (e) {
            e = e || {}, n.isArray(e) || (e = [e]);
            for (var a = window.alog || function () {
            }, t = 0, i = e.length; i > t; t++) {
                var s = e[t], o = s.name || "default", r = {};
                r["z_" + o] = s.value || "", a("cus.fire", "dis", r)
            }
        }, sendBaiduLog: function (e, a) {
            e = e || {};
            var t = window._hmt || [];
            if ("object" == typeof t) if ("string" == typeof e) t.push(["_trackEvent", e, a ? e + a : ""]); else if (e && "pageView" === e.name) t.push(["_trackPageview", e.value]); else if (e && n.isArray(e.value)) {
                var i = ["_trackEvent", e.name];
                i.push(e.value[0] ? e.name + "-" + e.value[0] : ""), i.push(e.value[1] ? e.name + "-" + e.value[1] : ""), i.push(e.mid), t.push(i)
            } else if (e && n.isObject(e.value)) {
                var i = ["_trackEvent", e.name], s = 0, o = [];
                for (var r in e.value) e.value.hasOwnProperty(r) && ("name" !== r || "mid" !== r) && 2 > s && (s++, o.push(e.value[r]));
                null != o[0] && i.push(e.name + "-" + o[0]) && null != o[1] && i.push(e.name + "-" + o[0] + "-" + o[1]), i.push(e.mid), t.push(i)
            } else {
                var i = ["_trackEvent", e.name];
                i.push(e.value ? e.name + "-" + e.value : ""), i.push("default"), i.push(e.mid), t.push(i)
            }
        }, sendUserReport: function (e) {
            var a = "/api/report/user";
            s.ajax(a, {
                type: "POST",
                data: {timestamp: Math.round(new Date / 1e3), action: o.getParam("from") || e || "web_home"}
            })
        }, _sendCountTypeLog: function (e) {
            if (e = e || {}, e.sendServerLog !== !1) {
                var a = {type: e.name, url: e.url};
                if (n.isArray(e.value)) a.value = e.value[0]; else if (n.isObject(e.value)) for (var t in e.value) !e.value.hasOwnProperty(t) || "name" === t && "mid" === t || (a[t] = e.value[t]); else a.value = e.value;
                this._sendServerLog(a)
            }
            this.sendBaiduLog(e)
        }, _sendLogData: function (e, a) {
            a = a || {}, e = e || "count", "count" === e ? this._sendCountTypeLog(a) : "time" === e ? this.sendDpTimeLog(a) : "dis" === e && this.sendDpDisLog(a)
        }, _eventHandle: function (e) {
            var a = this;
            n.each(e, function (e, t) {
                e.mid = ++i.mid, a.eventData[t] = e;
                var n = e.parentDom || s("body");
                "string" == typeof n && (n = s(n)), e.eventType || (e.eventType = "click"), "click" === e.eventType ? n.delegate(t, "mousedown", function (a) {
                    e.posX = a.clientX, e.posY = a.clientY
                }).delegate(t, "mouseup", function (t) {
                    if (e.callback && e.posX === t.clientX && e.posY === t.clientY) {
                        var i = e.callback(t, s);
                        i = a._addMid(i, e.mid), a._sendLogData(e.logType, i)
                    }
                }) : n.delegate(t, e.eventType, function (t) {
                    if (e.callback) {
                        var i = e.callback(t, s);
                        i = a._addMid(i, e.mid), a._sendLogData(e.logType, i)
                    }
                })
            })
        }, _ajaxHandle: function (e) {
            var a = this;
            n.each(e, function (e, t) {
                e.mid = ++i.mid, a.ajaxData[t] = e
            })
        }, _mixHandle: function (e) {
            var a = this;
            n.each(e, function (e, t) {
                e.mid = ++i.mid, a.mixData[t] = e
            })
        }, initDataHandle: function (e, a) {
            var t = this;
            n.isArray(e) || (e = [e]), n.each(e, function (e) {
                var n = e.mix, s = e.event, o = e.ajax;
                "global" === a && 1 === i.globalInit ? t._mixHandle(n) : (t._eventHandle(s), t._ajaxHandle(o), t._mixHandle(n))
            }), "global" === a && (i.globalInit = 1)
        }, send: function (e) {
            if (e.type) this._sendServerLog(e); else if (this._checkLogExist(e)) {
                var a = this._addMid(e, this.mixData[e.name].mid);
                this._sendLogData(this.mixData[e.name].logType, a)
            }
        }, add: function (e) {
            this.initDataHandle(e)
        }, define: function (e, a) {
            this.data || (this.data = e, this.initDataHandle(this.data, a))
        }
    }, i.instanceForSystem = new i, window.logConfigs = window.logConfigs || [], window.logConfigs.push({
        "event": {},
        "ajax": {},
        "mix": {
            "buttonCreate": {"logType": "time", "description": "button从创建到展现的时间"},
            "buttonHover": {"logType": "time", "description": "button状态变化的时间"}
        }
    }, {
        "mix": {
            "listAllSel": {"logType": "time", "description": "列表全选响应时间统计"},
            "listInitTime": {"logType": "time", "description": "列表初始化时间统计"},
            "listScrollTime": {"logType": "time", "description": "列表滚动响应时间统计"},
            "listAllSelCount": {"logType": "count", "description": "列表全选次数"}
        }
    }, {
        "event": {},
        "ajax": {},
        "mix": {"tipShow": {"logType": "time", "description": "tip展现时间"}}
    }), window.logConfigs && i.instanceForSystem.define(window.logConfigs, "global"), t.exports = i
});
;define("system-core:system/cache/listCache/log.js", function (i, e, s) {
    s.exports = {
        mix: {
            apilistCache: {logType: "count", description: "apilist接口命中缓存"},
            apilistRequest: {logType: "count", description: "apilist接口请求次数"}
        }
    }
});
;define("system-core:system/cache/listCache/listCache.js", function (e, a, t) {
    var n = !1, r = e("system-core:system/cache/listCache/log.js"), c = e("base:widget/libs/jquerypacket.js"),
        o = e("system-core:system/uiService/log/log.js").instanceForSystem;
    o.define(r);
    var i = {}, s = {};
    "object" == typeof window.cache ? i = window.cache : window.cache = i;
    var f = function () {
    };
    s.DEBUG = !0, f.cache = i, s.addCache = function (e, a, t) {
        var n = !1;
        if (i[e]) {
            if (!i[e].writeable) return void(s.DEBUG && console.warn("cache key:", e, " already exists"));
            n = !0
        }
        i[e] = n ? {config: t, data: i[e].data} : {config: t, data: {}}
    }, s.removeCache = function (e) {
        if (i[e]) {
            var a = i[e].config;
            "object" == typeof a.fileSystem && a.fileSystem.invalidCache()
        }
        i[e] = {}
    }, f.addCache = s.addCache, s.getCacheByName = function (e) {
        return i[e]
    }, s.getCacheConfig = function (e) {
        var a = s.getCacheByName(e);
        return a ? a.config : null
    }, f.getCacheConfig = s.getCacheConfig, s.updateCacheConfig = function (e, a, t) {
        var n = s.getCacheByName(e);
        return n && (n.config = t), null
    }, f.updateCacheConfig = s.updateCacheConfig, s.getCache = function (e) {
        var a = s.getCacheByName(e);
        return a ? a.data : null
    }, s.getDataByKey = function (e, a) {
        var t = s.getCacheByName(e);
        return t && t.data ? t.data[a] : null
    }, f.getDataByKey = s.getDataByKey, f.getCache = s.getCache, s.getCacheData = function (e, a, t, n, r) {
        var c, o, i, d = s.getCacheByName(e), l = s.getCacheConfig(e) || {}, h = l.parentPath || "", u = d.data[a],
            y = !0;
        if (l.forceRequestAPI === !0 ? y = !1 : "string" == typeof l.forceRequestAPI && l.forceRequestAPI === a && (y = !1), u && y || (u = d.data[a] = {
            list: [],
            names: {},
            hasMore: !0
        }), -1 === t ? u.list.length <= 0 && u.hasMore === !0 ? t = -1 : c = u.list : -2 === t ? (t = l.currentPage, u.hasMore === !1 && (c = [])) : (o = t * l.limit, u.hasMore === !1 && (c = [])), i = {
            cacheName: e,
            key: h + a,
            page: t,
            params: r || {},
            config: l,
            callback: n
        }, f.onBeforeGetCacheData(i), c && y) c = l.beforeListPush ? l.beforeListPush(c, e, a) : c, c = l.topMount ? l.topMount(e, d, a) : c, n.call(null, c, u.hasMore, i, null); else if (window.prefetchEnable) {
            var g = arguments;
            window.prefetchCallback = function () {
                s.getCacheData.apply(null, g)
            }
        } else i.page = i.page + 1, s.getData(i)
    }, f.getCacheData = s.getCacheData, s.onBeforeGetCacheData = function () {
    }, f.onBeforeGetCacheData = s.onBeforeGetCacheData, s.clearCacheDataByKey = function (e, a) {
        var t = s.getCacheByName(e);
        "undefined" != typeof a && delete t.data[a]
    }, f.clearCacheDataByKey = s.clearCacheDataByKey, s.clearCacheData = function (e) {
        var a = s.getCacheByName(e);
        a.data = {}
    }, f.clearCacheData = s.clearCacheData, s.hasMoreData = function (e, a) {
        var t, n = s.getCache(e);
        return n && (t = n[a]), t && t.hasMore
    }, f.hasMoreData = s.hasMoreData, s.removeByIndexs = function (e, a, t) {
        var n, r, c = s.getCache(e), o = c[a];
        if (t.sort(function (e, a) {
            return e - a
        }), o && (n = o.list)) for (var i = t.length - 1; i >= 0; i--) r = t[i], r < n.length && n.splice(r, 1)
    }, s.removeByIndex = function (e, a, t) {
        s.removeByIndexs(e, a, [t])
    }, s.removeByFileList = function () {
    }, f.removeByIndexs = s.removeByIndexs, f.removeByIndex = s.removeByIndex, s.getIndexsByFiles = function (e, a, t) {
        var n, r = s.getCache(e), c = r[a], o = [];
        if (t = t.slice(), c && (n = c.list)) for (var i = 0, f = t.length; f > i; i++) for (var d = 0, l = n.length; l > d; d++) if (t[i] === n[d]) {
            o.push(d);
            break
        }
        return o
    }, s.getIndexByFile = function (e, a, t) {
        return s.getIndexsByFiles(e, a, [t])
    }, f.getIndexByFile = s.getIndexByFile, f.getIndexsByFiles = s.getIndexsByFiles, s.updateData = function (e, a, t) {
        var n, r, c, o = s.getCache(e), i = o[a];
        if (i && (n = i.list)) for (var f = 0, d = t.length; d > f && (r = t[f], c = n[r.index], c); f++) for (var l in r.obj) r.obj.hasOwnProperty(l) && (c[l] = r.obj[l])
    }, f.updateData = s.updateData, s.addDatasByIndex = function (e, a, t) {
        var n, r, c, o = s.getCache(e), i = o[a];
        if (t.sort(function (e, a) {
            return parseInt(e.index, 10) - parseInt(a.index, 10)
        }), i && (c = i.list)) for (var f = 0, d = t.length; d > f; f++) n = t[f], r = n.index, 0 > r && (r = c.length), r = Math.min(r, c.length), c.splice(r, 0, n.obj)
    }, s.addDataBefore = function (e, a, t) {
        var n = [{index: 0, obj: t}];
        s.addDatasByIndex(e, a, n)
    }, s.addDataByIndex = function (e, a, t) {
        var n = [{index: t.index, obj: t.obj}];
        s.addDatasByIndex(e, a, n)
    }, s.addDataAfter = function (e, a, t) {
        var n = [{index: -1, obj: t}];
        s.addDatasByIndex(e, a, n)
    }, s.addDatasBefore = function (e, a, t) {
        for (var n = [], r = 0, c = t.length; c > r; r++) n.push({index: 0, obj: t[j]});
        s.addDatasByIndex(e, a, n)
    }, s.addDatasAfter = function (e, a, t) {
        for (var n = [], r = 0, c = t.length; c > r; r++) n.push({index: -1, obj: t[j]});
        s.addDatasByIndex(e, a, n)
    }, f.addDatasByIndex = s.addDatasByIndex, f.addDataBefore = s.addDataBefore, f.addDataByIndex = s.addDataByIndex, f.addDataAfter = s.addDataAfter, f.addDatasBefore = s.addDatasBefore, f.addDatasAfter = s.addDatasAfter, s.getData = function (e) {
        var a, t, n = {}, r = e.config, c = r.api;
        if (a = "function" == typeof r.getPageParams ? r.getPageParams(e.page, r.limit) : {
            page: e.page,
            num: r.limit
        }, t = r.getParamsBykey(e.key, s.getData, e)) {
            for (var o in r.params) r.params.hasOwnProperty(o) && (n[o] = r.params[o]);
            for (var o in a) a.hasOwnProperty(o) && (n[o] = a[o]);
            for (var o in t) t.hasOwnProperty(o) && (n[o] = t[o]);
            c || "function" != typeof r.getApi || (c = r.getApi(n)), s.fetchData(c, n, s.afterFetchData, e)
        }
    }, s.addDataToCache = function (e, a, t, n, r, c, o) {
        var i = s.getCacheByName(e), f = s.getCacheConfig(e), d = i.data[a];
        return d || (d = i.data[a] = {
            list: [],
            names: {},
            hasMore: !0
        }), d && d.list instanceof Array && (t = f.beforeListPush ? f.beforeListPush(t, e, a) : t, Array.prototype.push.apply(d.list, t)), d.names = o, d.hasMore = n, d.share = r, f.currentPage = c, 0 === f.currentPage ? (f.topMount && f.topMount(e, i, a), d.list) : t
    }, f.addDataToCache = s.addDataToCache, s.replaceFirstCache = function (e, a, t) {
        s.replaceCacheByIndex(e, a, t, 0)
    }, f.replaceFirstCache = s.replaceFirstCache, s.replaceCacheByIndex = function (e, a, t, n) {
        var r = {}, o = s.getCacheByName(e);
        r.server_filename = t.server_filename ? t.server_filename : t.path.substring(t.path.lastIndexOf("/") + 1), r.local_ctime = t.local_ctime || "-", r.local_mtime = t.local_mtime || "-", r.server_ctime = t.server_ctime || "-", r.server_mtime = t.server_mtime || "-", r.size = 0, r.path = t.path || "/", r.fs_id = t.fs_id, r.share = t.share ? t.share % 2 : 0, r.is_root = t.is_root, r.oper_id = t.oper_id ? t.oper_id : window.yunData.MYUK, r.dir_empty = 1, r.empty = 0, r.category = 6, o || (o = {
            list: [],
            hasMore: !0
        }), o.data[a] && o.data[a].list[n] && (c.extend(o.data[a].list[n], r), r = null);
        var i = o.config;
        "object" == typeof i.fileSystem && i.fileSystem.invalidCache()
    }, f.replaceCacheByIndex = s.replaceCacheByIndex, s.afterFetchSuccess = function (e, a) {
        var t = a.config, n = e[a.config.listKey || "list"], r = e.names, c = a.cacheName, o = a.key, i = t.limit,
            f = !1, d = e.share ? 1 : 0, l = null;
        n && n.length >= i && (f = !0), e.parent_oper && (l = {parent_oper: e.parent_oper}), "undefined" == typeof e.has_more || e.has_more || (f = !1), "searchGlobal" === c && n && "undefined" == typeof e.has_more && (f = e.list.length > 0), n = s.addDataToCache(c, o, n, f, d, a.page, r), "function" == typeof a.callback && a.callback.call(null, n, f, a, l)
    }, s.afterFetchData = function (e, a, t, n) {
        var r = n.config;
        1 === e ? s.afterFetchSuccess(a, n) : ("function" == typeof r.failCallBack && r.failCallBack(a, t, n), s.DEBUG && console.warn("fetch error"))
    }, s._fetchStrs = "", s.fetchData = function (e, a, t, r) {
        a = a || {};
        var i = e + c.stringify(a);
        if (s._fetchStrs === i) return void(n && console.log("fetch too much!"));
        s._fetchStrs = i, a.t = Math.random();
        var f = r.config;
        return a.page < 2 && "object" == typeof f.fileSystem && f.fileSystem.hasApi(e) ? void f.fileSystem.getApi(e, a).then(function (e) {
            s._fetchStrs = "", t.call(null, 1, e, a, r), o.send({name: "apilistCache", sendServerLog: !1})
        }, function () {
            s._fetchStrs = "", f.fileSystem = void 0, s.fetchData(e, a, t, r)
        }) : (c.getJSON(e, a, function (e) {
            var n;
            n = e && 0 === e.errno ? 1 : 0, s._fetchStrs = "", t.call(null, n, e, a, r)
        }).error(function (e) {
            var n;
            try {
                n = c.parseJSON(e.responseText)
            } catch (o) {
            }
            s._fetchStrs = "", t.call(null, 0, n, a, r)
        }), void o.send({name: "apilistRequest", sendServerLog: !1}))
    }, s.delayFetch = function () {
        return "" !== s._fetchStrs
    }, f.delayFetch = s.delayFetch, t.exports = f
});
;define("system-core:system/uiService/list/listView/recycleListView.js", function (t, i, s) {
    function e(t) {
        this._mFirstPosition = 0, this._mChildrenCount = 0, this._mWheelSensor = null, this._mViewRecycler = null, this._mMotionSensor = null, this._mChildren = [], this._mSmoothScroller = null, this._mSmoothScrollDelta = 0, this._mSmoothScrollRemaining = 0, this._mScrollDir = -1, this.LAYOUT_MODE_NORMAL = 0, this.LAYOUT_MODE_FORCE_TOP = 1, this.LAYOUT_MODE_FORCE_BOTTOM = 2, this.LAYOUT_MODE_SPECIFIC = 3, this.LAYOUT_MODE_FROM_SPECIFIC = 4, this._mLayoutMode = this.LAYOUT_MODE_NORMAL, this._mSpecificPosition = -1, this.childrenMarginTop = null, this._mIScrollbar = null, this._mPersistScrollDir = -1, this._mSyncTop = 0, this._mSyncPosition = -1, this._mSyncId = null, this._mDebugAlias = null, this.TOP = 0, this.BOTTOM = 1, this.NOTIFY_LIST_EMPTY = 0, this.NOTIFY_LIST_REPAINT = 1, this.NOTIFY_SYSTEM_LOCK = 2, this.WHEEL_TO_PIXEL_RATIO = 60, this.WHEEL_TO_PIXEL_RATIO_LOW = 60, this.SMOOTH_SCROLL_DURATION = 150, this.SMOOTH_SCROLL_INTERVAL = 5, this.PIXEL_RATIO_ON_DRAGGING_SCALE = 1, this._mScrollDir = -1, this._mWheelSensor = null, this.CLONE_VIEW_BUILD = 1, this.DATA_CHANGED = 2, this.BUILD = 4, this.SMOOTH_SCROLLING = 8, this.USING_SCROLLBAR = 16, this.USING_KEYBOARD_DISPATCHER = 32, this.USING_MOUSE_WHEEL_SENSOR = 64, this.CHECKED_ALL = 128, this.PRESERVE_CHECKED_STATE = 256, this.LOCKED = 512, this.USING_LOW_PIXEL_RATIO = 1024, this.USING_TOUCH_SENSOR = 2048, null != t && (n.call(this, t), this._mUI = {
            defaultScroll: t.defaultScroll,
            listContainer: t.listContainer
        }, this.init(t), this.initRecycleList(t))
    }

    var o = !1, h = t("base:widget/libs/jquerypacket.js"),
        n = t("system-core:system/uiService/list/listView/listView.js"),
        r = t("system-core:system/uiService/list/viewRecycler/viewRecycler.js"),
        l = (t("system-core:system/uiService/keyGuard/keyGuard.js"), t("system-core:system/baseService/timerService/timerService.js")),
        a = t("system-core:system/uiService/mouseWheelSensor/mouseWheelSensor.js"),
        _ = t("system-core:system/uiService/motionSensor/motionSensor.js"),
        m = t("system-core:system/uiService/iScrollbar/iScrollbar.js"),
        c = t("system-core:system/uiService/log/log.js").instanceForSystem;
    e.prototype = new n, e.prototype.constructor = e, h.extend(e.prototype, {
        initRecycleList: function (t) {
            "function" == typeof t.onComputeScrollbarState && (this.onComputeScrollbarState = t.onComputeScrollbarState), t.booleanFlagParams instanceof Array && this.setBooleanFlag(this[t.booleanFlagParams[0]], t.booleanFlagParams[1]), t.flagParams instanceof Array && this.setFlags(t.flagParams)
        }, setFlags: function (t) {
            var i = t.length;
            this.flags = 0;
            for (var s = 0; i > s; s++) this.flags |= this[t[s]]
        }, getView: function () {
            return null
        }, deactivate: function (t) {
            t ? (this._mUI.listContainer.style.display = "none", this.onSystemNotify(this.NOTIFY_LIST_EMPTY, !0, !0)) : (this._mUI.listContainer.style.display = "block", this.onSystemNotify(this.NOTIFY_LIST_EMPTY, !1, !0))
        }, setBackedData: function (t) {
            this.locked() || ((this.mPrivateFlags & this.BUILD) != this.BUILD && (this._build(), this.mPrivateFlags |= this.BUILD), this.resetList(), this.listsData = t, this.dataCount = null == t ? 0 : t.length, this.layout())
        }, setBooleanFlag: function (t, i) {
            i ? this.mPrivateFlags |= t : this.mPrivateFlags &= ~t
        }, setUsingScrollbar: function (t) {
            t ? this.mPrivateFlags |= this.USING_SCROLLBAR : this.mPrivateFlags &= ~this.USING_SCROLLBAR
        }, isUsingScrollbar: function () {
            return (this.mPrivateFlags & this.USING_SCROLLBAR) == this.USING_SCROLLBAR
        }, requestLayout: function () {
            this.locked() || (this.mPrivateFlags |= this.DATA_CHANGED, this._mLayoutMode = this.LAYOUT_MODE_SPECIFIC, this.mPrivateFlags |= this.PRESERVE_CHECKED_STATE, this.layout(), this.mPrivateFlags &= ~this.PRESERVE_CHECKED_STATE)
        }, kedData: function (t) {
            if (null == this.listsData || 0 == this.dataCount) return void this.setBackedData(t);
            if (!this.locked()) {
                for (var i = 0, s = t.length; s > i; i++) this.listsData.push(t[i]);
                this.dataCount = this.listsData.length, this.requestLayout()
            }
        }, updateBackedData: function (t, i) {
            if (!this.locked()) {
                if (this.listsData = t, this.dataCount = null == t ? 0 : t.length, this.mPrivateFlags |= this.DATA_CHANGED, this._mLayoutMode = this.LAYOUT_MODE_SPECIFIC, null != this._mSyncId) {
                    var s = this.lookupPositionForId(this._mSyncId);
                    -1 != s && (o && console.log("recover a position at ", s), this._mSyncPosition = s)
                }
                i === !0 ? this.mPrivateFlags |= this.PRESERVE_CHECKED_STATE : (this.mCheckedChildren.length = 0, this.onCheckeChanged()), this.layout(), i === !0 && (this.mPrivateFlags &= ~this.PRESERVE_CHECKED_STATE)
            }
        }, getIdForPosition: function () {
            return null
        }, lookupPositionForId: function () {
            return -1
        }, changeBackedData: function (t, i) {
            this.locked() || (i === !0 && this.resetList(), this.listsData = t, this.dataCount = null == t ? 0 : t.length, this.mPrivateFlags |= this.DATA_CHANGED, this._mLayoutMode = this.LAYOUT_MODE_FORCE_TOP, this.layout())
        }, dispatchDataChanged: function () {
            this.mPrivateFlags |= this.DATA_CHANGED
        }, getScrollTop: function () {
            return this._mFirstPosition * this.itemHeight + Math.abs(this.childrenMarginTop)
        }, getFirstPosition: function () {
            return this._mFirstPosition
        }, getFirstCheckedChild: function () {
            if (this.isAllItemChecked()) return this._mChildren[this._mFirstPosition - this._mFirstPosition];
            for (var t = 0, i = this.mCheckedChildren.length; i > t; t++) if (this.mCheckedChildren[t] === !0) return this._mChildren[t - this._mFirstPosition];
            return null
        }, getRenderingChildAt: function (t) {
            return 0 == this._mChildren.length ? null : 0 > t || t > this._mChildren.length - 1 ? null : this._mChildren[t]
        }, getRenderingChildByPosition: function (t) {
            var i = t - this._mFirstPosition;
            return this.getRenderingChildAt(i)
        }, getScrollbar: function (t) {
            var i = this, s = this._mIScrollbar;
            return null == s && t === !0 && (s = new m(this._mUI, {defaultScroll: this._mUI.defaultScroll}), s.onArrowScroll = function (t) {
                i.arrowScroll(t), i._mPersistScrollDir = -1
            }, s.onPersistArrowScrollStart = function (t) {
                i._mPersistScrollDir = t, i.arrowScroll(t)
            }, s.onPersistArrowScrollEnd = function () {
                i._mPersistScrollDir = -1
            }, s.onPageScroll = function (t) {
                i._mPersistScrollDir = -1, i.pageScroll(t)
            }, s.setUsingSimulateDraging(!0), s.onThumbStateChange = function (t, e) {
                var o = i.PIXEL_RATIO_ON_DRAGGING_SCALE * Math.abs(t - e),
                    h = o * i.itemHeight * i.dataCount / s.getTrackerHeight(), n = t - e > 0 ? a.FORWARD : a.BACKWARD;
                i.scrollBy(n, h)
            }, this._mIScrollbar = s), s
        }, onComputeScrollbarState: function (t, i, s) {
            var e = this._mUI.listContainer.parentNode.offsetHeight, o = this.itemHeight, h = t.getTrackerHeight(),
                n = 0 == this.dataCount ? 0 : h * e / (o * this.dataCount);
            n = Math.max(n, 20);
            var r = 0 == this.dataCount ? 0 : h * this.getScrollTop() / (o * this.dataCount);
            r = Math.min(r, h - n), r = Math.max(r, 0), t.setThumbState(r, n, !0), this.onComputeScrollbarChange(t, i, s)
        }, onComputeScrollbarChange: function () {
        }, awakeScrollbar: function (t) {
            if (t) {
                var i = this.getScrollbar(!0);
                i.isAwake() || i.awake(!0)
            } else {
                var i = this.getScrollbar();
                null != i && i.isAwake() && i.awake(!1)
            }
        }, scrollToPosition: function (t) {
            if (!this.locked()) {
                if (0 > t || t > this.dataCount) return !1;
                var i = t >= this._mFirstPosition;
                return this.mPrivateFlags |= this.DATA_CHANGED, this._mLayoutMode = this.LAYOUT_MODE_FROM_SPECIFIC, this._mSpecificPosition = t, this.childrenMarginTop = 0, this._mUI.listContainer.style.marginTop = "0", this.mPrivateFlags |= this.PRESERVE_CHECKED_STATE, this.layout(), this.mPrivateFlags &= ~this.PRESERVE_CHECKED_STATE, i ? this._fixTooHigh() : this._fixTooLow(), !0
            }
        }, pageScroll: function (t) {
            if (!this.locked()) {
                var i = this._mFirstPosition, s = -1;
                t == a.FORWARD ? (s = i + this._mChildren.length, s = Math.min(s, this.dataCount - 1)) : (s = i - this._mChildren.length, s = Math.max(s, 1)), this.scrollToPosition(s)
            }
        }, arrowScroll: function (t) {
            if (!this.locked()) {
                var i = this.WHEEL_TO_PIXEL_RATIO;
                (this.mPrivateFlags & this.USING_LOW_PIXEL_RATIO) == this.USING_LOW_PIXEL_RATIO && (i = this.WHEEL_TO_PIXEL_RATIO_LOW), this.smoothScroll(t, 1 * i)
            }
        }, resetList: function () {
            if (this._mChildren.length = 0, this.childrenMarginTop = 0, this._mUI.listContainer.style.marginTop = "0", this._mFirstPosition = 0, this.listsData = null, this.dataCount = 0, this._mSyncTop = 0, this._mSyncPosition = -1, this._mSyncId = null, this.mPrivateFlags &= ~this.CLONE_VIEW_BUILD, this.mPrivateFlags &= ~this.DATA_CHANGED, this._mViewRecycler && this._mViewRecycler.clear(), "TABLE" == this._mUI.listContainer.nodeName.toUpperCase()) for (var t = this._mUI.listContainer.rows, i = t.length, s = i - 1; s >= 0; s--) this._mUI.listContainer.deleteRow(s); else this._mUI.listContainer.innerHTML = ""
        }, getBackedData: function () {
            return this.listsData
        }, handleDataChanged: function () {
            (this.mPrivateFlags & this.PRESERVE_CHECKED_STATE) != this.PRESERVE_CHECKED_STATE && (this.mCheckedChildren.length = 0, this.mPrivateFlags &= ~this.CHECKED_ALL)
        }, addItemToFirst: function (t) {
            this.mCheckedChildren.unshift(t)
        }, lock: function (t, i) {
            var s = this.getScrollbar();
            t ? (this.mPrivateFlags |= this.LOCKED, null != s && s.lock(!0)) : (this.mPrivateFlags &= ~this.LOCKED, null != s && s.lock(!1)), i !== !0 && this.onSystemNotify(this.NOTIFY_SYSTEM_LOCK, t)
        }, onSystemNotify: function () {
        }, locked: function () {
            return (this.mPrivateFlags & this.LOCKED) == this.LOCKED
        }, fixTargetPositionVisible: function (t) {
            t += 1;
            var i = this._mFirstPosition, s = this.getViewCount(), e = -1;
            return i + 1 >= t ? e = t : t > i + s && (e = t - s + 1), e >= 0 ? (this.scrollToPosition(Math.min(e, this.dataCount)), !0) : !1
        }, hitInVisibleRegion: function (t) {
            return t >= this._mFirstPosition && t < this._mFirstPosition + this._mChildren.length
        }, _correctSyncPosition: function () {
            this.listsData.length > 0 && this._mSyncPosition > this.listsData.length - 1 && (this._mSyncPosition = -1)
        }, layout: function () {
            if (0 == this.dataCount) return this.resetList(), this.onPositionChanged(this._mFirstPosition, this._mChildren.length), this._turnPluginDriverOnOrOff(), this.onSystemNotify(this.NOTIFY_LIST_EMPTY, !0), void this.onSystemNotify(this.NOTIFY_LIST_REPAINT, !0);
            if (this.onSystemNotify(this.NOTIFY_LIST_EMPTY, !1), this.onSystemNotify(this.NOTIFY_LIST_REPAINT, !0), (this.mPrivateFlags & this.DATA_CHANGED) == this.DATA_CHANGED && this.handleDataChanged(), (this.mPrivateFlags & this.DATA_CHANGED) == this.DATA_CHANGED) for (var t = this._mChildren.length - 1; t >= 0; t--) this._mViewRecycler.add(this._mChildren.pop()); else for (var t = this._mChildren.length - 1; t >= 0; t--) this._mViewRecycler.addActiveView(this._mChildren.pop());
            switch (this._mUI.listContainer.style.marginTop = "0", this.childrenMarginTop = 0, this._mLayoutMode) {
                case this.LAYOUT_MODE_FROM_SPECIFIC:
                    var i = this._mSpecificPosition - 1;
                    this._mFirstPosition = i, this._fillFromTop(i), this._mSyncTop = 0, this._mSyncPosition = i, this._mSyncId = null;
                    break;
                case this.LAYOUT_MODE_SPECIFIC:
                    this._correctSyncPosition(), this._mFirstPosition = -1 == this._mSyncPosition ? 0 : this._mSyncPosition, this._mChildrenMarginTop = -Math.abs(this._mSyncTop), this._mUI.listContainer.style.marginTop = this.childrenMarginTop + "px", this._fillFromTop(this._mFirstPosition), this._fixTooHigh(), this._computeSyncState(), this._mSyncId = null;
                    break;
                default:
                    this._mFirstPosition = 0, this._fillFromTop(0), this._mSyncTop = 0, this._mSyncPosition = -1, this._mSyncId = null
            }
            this._mViewRecycler.scrapActiveViews(), this._mLayoutMode = this.LAYOUT_MODE_NORMAL, this._mSpecificPosition = -1, this.mPrivateFlags &= ~this.DATA_CHANGED, this.onPositionChanged(this._mFirstPosition, this._mChildren.length), this._turnPluginDriverOnOrOff()
        }, _turnPluginDriverOnOrOff: function () {
            var t = this.getScrollbar();
            if (t) {
                var i = !1, s = this._mFirstPosition + this._mChildren.length;
                if (this._mFirstPosition > 0 || s < this.dataCount) i = !0; else if (s == this.dataCount) {
                    var e = this.childrenMarginTop, o = this._mChildren.length * this.itemHeight + e,
                        h = this._mUI.listContainer.parentNode.offsetHeight;
                    o > h ? i = !0 : 0 !== o && "undefined" != typeof this.needOrNotLoadMore && this.needOrNotLoadMore()
                }
                t.awake(i)
            }
        }, _makeAndAddView: function (t) {
            var i = this._mViewRecycler.getActiveView(t);
            if (null == i) {
                var s = this._mViewRecycler.get(t), i = null;
                i = null != s ? this.getView(this._mUI.listContainer, s, t) : this.getView(this._mUI.listContainer, null, t)
            }
            if (null == i) throw new Error("can not obtain a view to build list item");
            return this.insertView(i, t), i
        }, insertView: function (t, i) {
            var s = i - this._mFirstPosition, e = 0 + this._mChildren.length - 1 >> 1;
            s > e ? this._mUI.listContainer.appendChild(t) : this._mUI.listContainer.insertBefore(t, this._mChildren[0])
        }, removeView: function (t) {
            return this._mUI.listContainer.removeChild(t)
        }, _fillFromTop: function (t) {
            if (this._mUI) {
                var i = this._mUI.listContainer.parentNode.offsetHeight, s = this.childrenMarginTop,
                    e = t - this._mFirstPosition, o = this.itemHeight, h = 0;
                if ((this.mPrivateFlags & this.CLONE_VIEW_BUILD) != this.CLONE_VIEW_BUILD) {
                    var n = this.getView(this._mUI.listContainer, null, 0);
                    this.insertView(n, 0), this._mChildren[0] = n, o = this.itemHeight = this.itemHeight || n.offsetHeight, h = o, t++, e++, this.mPrivateFlags |= this.CLONE_VIEW_BUILD
                } else h = e * o + s;
                for (var r = null; i > h && t < this.dataCount;) r = this._makeAndAddView(t), this._mChildren[e] = r, h += o, t++, e++
            }
        }, importCheckedState: function (t) {
            if (t instanceof e) {
                this.mCheckedChildren.length = 0;
                for (var i = 0, s = t.mCheckedChildren, o = s.length; o > i; i++) this.mCheckedChildren[i] = s[i];
                1 == this.isAllItemChecked() && 0 == t.isAllItemChecked() ? this.mPrivateFlags &= ~this.CHECKED_ALL : 0 == this.isAllItemChecked() && 1 == t.isAllItemChecked() && (this.mPrivateFlags |= this.CHECKED_ALL)
            }
        }, _fillFromBottom: function (t) {
            if (this._mUI) {
                for (var i = (this._mUI.listContainer.parentNode.offsetHeight, this.childrenMarginTop), s = this.itemHeight, e = i, o = null; t >= 0 && e >= 0;) o = this._makeAndAddView(t), i -= s, this._mUI.listContainer.style.marginTop = i + "px", this._mChildren.unshift(o), e -= s, t--;
                this.childrenMarginTop = i, this._mFirstPosition = t + 1
            }
        }, fillGap: function (t) {
            var i = this._mChildren.length;
            t == a.FORWARD ? (this._fillFromTop(this._mFirstPosition + i), this._fixTooHigh()) : (this._fillFromBottom(this._mFirstPosition - 1), this._fixTooLow())
        }, _fixTooLow: function () {
            var t = this._mChildren.length;
            if (!(0 >= t)) {
                var i = this.childrenMarginTop, s = this._mChildren.length * this.itemHeight + i,
                    e = this._mUI.listOuterHeight = this._mUI.listOuterHeight || this._mUI.listContainer.parentNode.offsetHeight,
                    o = i, h = o, n = this._mFirstPosition;
                0 == n && h > 0 && (n + t == this.dataCount || s > e) && (n + t == this.dataCount && (h = Math.min(h, s - e)), i -= h, this._mUI.listContainer.style.marginTop = i + "px", this.childrenMarginTop = i, n + t < this.dataCount && this._fillFromTop(n + t), this.onScrollToEdge(this.TOP))
            }
        }, _fixTooHigh: function () {
            var t = this._mChildren.length;
            if (!(0 >= t)) {
                var i = this.childrenMarginTop, s = this._mChildren.length * this.itemHeight + i,
                    e = this._mUI.listOuterHeight = this._mUI.listOuterHeight || this._mUI.listContainer.parentNode.offsetHeight,
                    o = i, h = e - s, n = this._mFirstPosition;
                (n > 0 || 0 > o) && h > 0 ? (0 == n && (h = Math.min(h, Math.abs(o))), i += h, this.childrenMarginTop = i, this._mUI.listContainer.style.marginTop = i + "px", n > 0 && (this._fillFromBottom(n - 1), this._adjustViewUpOrDown()), this.onScrollToEdge(this.BOTTOM)) : this._mFirstPosition + t == this.dataCount && s == e && this.onScrollToEdge(this.BOTTOM)
            }
        }, _adjustViewUpOrDown: function () {
            var t = this._mChildren.length;
            t > 0 && this.childrenMarginTop > 0 && (this.childrenMarginTop = 0, this._mUI.listContainer.style.marginTop = this.childrenMarginTop + "px")
        }, buildView: function () {
            return null
        }, onScrollToEdge: function () {
        }, onPositionChanged: function (t, i) {
            (this.mPrivateFlags & this.USING_SCROLLBAR) == this.USING_SCROLLBAR && (this.awakeScrollbar(!0), this.onComputeScrollbarState(this.getScrollbar(!0), t, i))
        }, onKeyboardArrowDown: function () {
            this.arrowScroll(a.FORWARD)
        }, onKeyboardArrowUp: function () {
            this.arrowScroll(a.BACKWARD)
        }, onKeyboardPageUp: function () {
            this.pageScroll(a.BACKWARD)
        }, onKeyboardPageDown: function () {
            this.pageScroll(a.FORWARD)
        }, onScroll: function (t, i) {
            var s = (new Date).getTime(), e = this._mFirstPosition, o = this._mChildren.length,
                h = this.childrenMarginTop, n = h, r = this._mChildren.length * this.itemHeight + h,
                l = this._mUI.listContainer.parentNode.offsetHeight;
            if (i = Math.min(i, l - 1), t == a.FORWARD && e + o == this.dataCount && l >= r && i >= 0) return 0 != i;
            if (t == a.BACKWARD && 0 == e && n >= 0 && i >= 0) return 0 != i;
            var _ = 0;
            if (t == a.FORWARD) for (var m = 0, S = this._mChildren.length; S > m && (m + 1) * this.itemHeight - Math.abs(h) < 0; m++) h += this.itemHeight, this._mUI.listContainer.style.marginTop = h + "px", this._mViewRecycler.add(this._mChildren.shift()), _++; else for (var m = this._mChildren.length - 1; m >= 0 && this.itemHeight * m + h > l; m--) this._mViewRecycler.add(this._mChildren.pop()), _++;
            t == a.FORWARD ? h -= i : h += i, this._mUI.listContainer.style.marginTop = h + "px", this.childrenMarginTop = h, t == a.FORWARD && (this._mFirstPosition += _), r = this._mChildren.length * this.itemHeight + h, (h > 0 || l > r) && this.fillGap(t), this.FLAG_PREVENT_DEFAULT && this._mWheelSensor.setPreventDefault(this.FLAG_PREVENT_DEFAULT), this._computeSyncState(), this.onPositionChanged(this._mFirstPosition, this._mChildren.length);
            var u = (new Date).getTime();
            c.send({name: "listScrollTime", value: u - s})
        }, _computeSyncState: function () {
            this._mSyncTop = this.childrenMarginTop, this._mSyncPosition = this._mFirstPosition;
            var t = this.getIdForPosition(this._mFirstPosition);
            null != t && (this._mSyncId = t)
        }, _computeSmoothScrollArgs: function (t) {
            var i = this.SMOOTH_SCROLL_DURATION;
            if (this._mSmoothScrollDelta = Math.ceil(t / (i / this.SMOOTH_SCROLL_INTERVAL)), this._mSmoothScrollDelta >= this.itemHeight) for (var s = 10, e = 0; this._mSmoothScrollDelta >= this.itemHeight;) {
                if (e >= s) throw new Error("pixelDelta arg is not considered as legal");
                i *= 2, this._mSmoothScrollDelta = Math.ceil(t / (i / this.SMOOTH_SCROLL_INTERVAL)), e++
            }
        }, _clearSmoothScrollArgs: function () {
            this.mPrivateFlags &= ~this.SMOOTH_SCROLLING, this._mSmoothScrollRemaining = this._mSmoothScrollDelta = 0, this._mScrollDir = -1
        }, stopSmoothScroll: function () {
            null != this._mSmoothScroller && (this._mSmoothScroller.interrupt(), this._clearSmoothScrollArgs())
        }, _setupSmoothScrollArgs: function (t) {
            var i = this;
            null == i._mSmoothScroller && (i._mSmoothScroller = new l(i.SMOOTH_SCROLL_INTERVAL, function () {
                var t = !1;
                Math.abs(i._mSmoothScrollRemaining) <= Math.abs(i._mSmoothScrollDelta) ? (t = i.onScroll(i._mScrollDir, i._mSmoothScrollRemaining), i._clearSmoothScrollArgs(), t || -1 == i._mPersistScrollDir ? -1 == i._mPersistScrollDir : i.arrowScroll(i._mPersistScrollDir)) : (i._mSmoothScrollRemaining -= i._mSmoothScrollDelta, t = i.onScroll(i._mScrollDir, i._mSmoothScrollDelta), this.start())
            })), i._computeSmoothScrollArgs(t), i._mSmoothScrollRemaining = t - i._mSmoothScrollDelta, i._mSmoothScroller.start();
            i.onScroll(i._mScrollDir, i._mSmoothScrollDelta);
            i.mPrivateFlags |= i.SMOOTH_SCROLLING
        }, smoothScroll: function (t, i) {
            this.locked() || (this._mScrollDir = t, this._setupSmoothScrollArgs(i))
        }, scrollBy: function (t, i) {
            this.locked() || this.onScroll(t, i)
        }, setUsingKeyboardDispatcher: function (t) {
            t ? this.mPrivateFlags |= this.USING_KEYBOARD_DISPATCHER : this.mPrivateFlags &= ~this.USING_KEYBOARD_DISPATCHER
        }, activateKeyguard: function (t, i) {
            return
        }, isUsingKeyboardDispatcher: function () {
            return (this.mPrivateFlags & this.USING_KEYBOARD_DISPATCHER) == this.USING_KEYBOARD_DISPATCHER
        }, setUsingMouseWheelSensor: function (t) {
            if (t) {
                this.mPrivateFlags |= this.USING_MOUSE_WHEEL_SENSOR;
                var i = this, s = new a(this._mUI.listContainer.parentNode);
                s.onWheelChanged = function (t, s) {
                    if (!i.locked()) {
                        var e = i.WHEEL_TO_PIXEL_RATIO;
                        (i.mPrivateFlags & i.USING_LOW_PIXEL_RATIO) == i.USING_LOW_PIXEL_RATIO && (e = i.WHEEL_TO_PIXEL_RATIO_LOW);
                        var o = s * e;
                        if ((i.mPrivateFlags & i.SMOOTH_SCROLLING) == i.SMOOTH_SCROLLING && i.stopSmoothScroll(), i._mScrollDir = t, 0 != i.itemHeight) {
                            i.onScroll(i._mScrollDir, o)
                        }
                    }
                }, s.sense(), this._mWheelSensor = s
            } else this.mPrivateFlags &= ~this.USING_MOUSE_WHEEL_SENSOR
        }, _build: function () {
            this._mViewRecycler = new r;
            var t = this.flags;
            "undefined" != typeof t && ((t & this.USING_MOUSE_WHEEL_SENSOR) == this.USING_MOUSE_WHEEL_SENSOR && this.setUsingMouseWheelSensor(!0), (t & this.USING_SCROLLBAR) == this.USING_SCROLLBAR && this.setUsingScrollbar(!0), (t & this.USING_KEYBOARD_DISPATCHER) == this.USING_KEYBOARD_DISPATCHER && this.setUsingKeyboardDispatcher(!0), (t & this.USING_TOUCH_SENSOR) == this.USING_TOUCH_SENSOR && _.hasMotionCampatibility() && (o && console.log("Motion Tracker Installed"), this.setUsingMotionSensor(!0)))
        }, setUsingMotionSensor: function (t) {
            if (t) {
                this.mPrivateFlags |= this.USING_TOUCH_SENSOR;
                var i = new _(this._mUI.listContainer, _.VERTICAL), s = this;
                i.onMotion = function (t, i, e, o) {
                    if (!s.locked() && ((s.mPrivateFlags & s.SMOOTH_SCROLLING) == s.SMOOTH_SCROLLING && s.stopSmoothScroll(), s._mScrollDir = o > 0 ? a.BACKWARD : a.FORWARD, 0 != s.itemHeight)) {
                        s.onScroll(s._mScrollDir, Math.abs(o))
                    }
                }, i.install(), this._mMotionSensor = i
            } else this.mPrivateFlags &= ~this.USING_TOUCH_SENSOR
        }, setDebugAlias: function (t) {
            this._mDebugAlias = t
        }, toString: function () {
            return this._mDebugAlias
        }
    }), s.exports = e
});
;define("system-core:system/uiService/list/listView/nativeListView.js", function (t, e, i) {
    "use strict";

    function s(t) {
        l.call(this, t), this.startIndex = 0, null != t && (this.init(t), this.initNativeList(t))
    }

    var n = t("base:widget/libs/jquerypacket.js"), o = t("base:widget/libs/underscore.js"),
        l = t("system-core:system/uiService/list/listView/listView.js"), a = {
            getScrollTop: function (t) {
                return t.scrollTop()
            }, getScrollBottom: function (t) {
                var e = t.height(), i = Math.max(t[0].scrollHeight, e), s = t.scrollTop(), n = Math.max(i - s - e, 0);
                return n
            }, getScrollPercent: function (t) {
                var e = t.height(), i = Math.max(t[0].scrollHeight, e), s = t.scrollTop(), n = s / (i - e);
                return n
            }, resolveHasScroll: function (t) {
                return a.getScrollTop(t) > 0 || a.getScrollBottom(t) > 0 ? !0 : !1
            }, getScrollBarWidth: function () {
                var t, e = document.createElement("div");
                return e.style.cssText = "display:block;width:40px;height:40px;overflow-x:hidden;overflow-y:scroll;position:absolute;left:-20px;top:0px;", document.body.appendChild(e), t = e.offsetWidth - e.clientWidth, e.parentNode.removeChild(e), t
            }
        };
    s.prototype = new l, s.prototype.constructor = s, n.extend(s.prototype, {
        initNativeList: function (t) {
            null != t.listContainer && (this.listContainer = t.listContainer), "string" == typeof t.childrenClass && (this.childrenClass = t.childrenClass), "string" == typeof t.listItemDomName && (this.listItemDomName = t.listItemDomName), "function" == typeof t.onScroll && (this.onScroll = t.onScroll), this.bindSubListEvent()
        }, bindSubListEvent: function () {
            var t = this, e = t.$listViewOuter, i = o.throttle(function () {
                a.getScrollPercent(e) >= .7 && t.needOrNotLoadMore()
            }, 80), s = function () {
                if ("complete" === document.readyState) {
                    t.onScroll(), i();
                    var s = window.event ? window.event : arguments[0];
                    t.FLAG_PREVENT_DEFAULT && s.wheelDelta < 0 && a.getScrollBottom(e) <= 0 && (s.preventDefault ? s.preventDefault() : s.returnValue = !1)
                }
            };
            "undefined" != typeof window.attachEvent ? e[0].attachEvent("onscroll", s) : "undefined" != typeof window.addEventListener && e[0].addEventListener("scroll", s, !1), window.sidebar && setTimeout(function () {
                e[0].scrollTo(1, 1)
            }, 1e3), "undefined" != typeof window.attachEvent ? e[0].attachEvent("onmousewheel", s) : "mousewheel" in window ? e[0].addEventListener("mousewheel", s, !1) : "undefined" != typeof window.addEventListener && e[0].addEventListener("DOMMouseScroll", s, !1)
        }, setBackedData: function (t) {
            this.locked() || (this.resetList(), this.listsData = [].concat(t), this.dataCount = null == t ? 0 : t.length, this.startIndex = 0, this.layout(t))
        }, appendBackedData: function (t) {
            return null == this.listsData || 0 === this.dataCount ? void this.setBackedData(t) : void(this.locked() || (this.startIndex = this.dataCount, this.listsData = this.listsData.concat(t), this.dataCount = this.listsData.length, this.layout(t)))
        }, updateBackedData: function (t) {
            this.locked() || (this.resetList(), this.listsData = [].concat(t), this.dataCount = null == t ? 0 : t.length, this.startIndex = 0, this.mPrivateFlags |= this.DATA_CHANGED, this.layout(t))
        }, importCheckedState: function (t) {
            if (t instanceof s) {
                this.mCheckedChildren.length = 0;
                for (var e = 0, i = t.mCheckedChildren, n = i.length; n > e; e++) this.mCheckedChildren[e] = i[e];
                this.isAllItemChecked() === !0 && t.isAllItemChecked() === !1 ? this.mPrivateFlags &= ~this.CHECKED_ALL : this.isAllItemChecked() === !1 && t.isAllItemChecked() === !0 && (this.mPrivateFlags |= this.CHECKED_ALL)
            }
        }, onScroll: function () {
        }, handleLockScroll: function (t) {
            return t.preventDefault && t.preventDefault(), t.returnValue = !1, t.stopPropagation && t.stopPropagation(), !1
        }, lock: function (t, e) {
            var i = this;
            t ? (this.mPrivateFlags |= this.LOCKED, this.$listViewOuter.on("mousewheel DOMMouseScroll scroll", i.handleLockScroll)) : (this.mPrivateFlags &= ~this.LOCKED, this.$listViewOuter.off("mousewheel DOMMouseScroll scroll", i.handleLockScroll)), e !== !0 && this.onSystemNotify(this.NOTIFY_SYSTEM_LOCK, t)
        }, resetList: function () {
            this.listsData = null, this.dataCount = 0, this.mPrivateFlags &= ~this.CLONE_VIEW_BUILD, this.mPrivateFlags &= ~this.DATA_CHANGED, this.listContainer.innerHTML = ""
        }, onLayoutChange: function () {
            this.onScroll()
        }, handleDataChanged: function () {
            (this.mPrivateFlags & this.PRESERVE_CHECKED_STATE) !== this.PRESERVE_CHECKED_STATE && (this.mCheckedChildren.length = 0, this.mPrivateFlags &= ~this.CHECKED_ALL)
        }, layout: function (t) {
            (this.mPrivateFlags & this.DATA_CHANGED) === this.DATA_CHANGED && this.handleDataChanged();
            var e = t.length || 0;
            if (e > 0) {
                for (var i = this.startIndex || 0, s = n("<div>"), o = this.buildView(), l = 0; e > l; l++) {
                    var a = this.getView(null, o.cloneNode(!0), l + i, t[l]);
                    s.append(a)
                }
                n(this.listContainer).append(s.children()), !this.itemHeight && (this.itemHeight = n(this.listContainer).find(this.listItemDomName).eq(0).outerHeight()), this.onLayoutChange()
            }
        }, getFirstPosition: function () {
            var t = this.$listViewOuter, e = n(this.listContainer), i = e.find(this.listItemDomName);
            if (i.length > 0) {
                var s = t.scrollTop(), o = Math.floor(s / this.itemHeight);
                return o
            }
            return -1
        }, getRenderingChildByPosition: function (t) {
            var e = this.getFirstPosition();
            return t >= 0 && t <= e + this.getViewCount() ? n(this.listContainer).find(this.childrenClass).eq(t).get(0) : null
        }, fixTargetPositionVisible: function (t) {
            t += 1;
            var e = this.getFirstPosition(), i = this.getViewCount(), s = -1;
            return e + 1 >= t ? s = t : t > e + i && (s = t - i + 1), s >= 0 ? (this.scrollToPosition(Math.min(s, this.dataCount)), !0) : !1
        }, scrollToPosition: function (t) {
            return this.locked() ? void 0 : 0 > t || t > this.dataCount ? !1 : (this.mPrivateFlags |= this.DATA_CHANGED, this.mPrivateFlags |= this.PRESERVE_CHECKED_STATE, this.$listViewOuter.scrollTop((t - 1) * this.itemHeight), this.mPrivateFlags &= ~this.PRESERVE_CHECKED_STATE, !0)
        }
    }), i.exports = s
});
;define("system-core:system/uiService/mouseWheelSensor/mouseWheelSensor.js", function (e, t, n) {
    var i = function (e) {
        this._mPrivateFlags = 0, this._mView = e, this.onWheelChanged = null
    };
    i.FORWARD = 1, i.BACKWARD = 2, i.FLAG_PREVENT_DEFAULT = !1, i.BUILD = 4, i.prototype = {
        _init: function () {
            if ((this._mPrivateFlags & i.BUILD) != i.BUILD) {
                var e = this, t = function () {
                    var t = window.event ? window.event : arguments[0], n = 0;
                    t.wheelDelta ? n = t.wheelDelta / 120 : t.detail && (n = -t.detail / 3), n && e._sendWheelChangedMessage(n > 0 ? i.BACKWARD : i.FORWARD, Math.abs(n)), i.FLAG_PREVENT_DEFAULT && (t.preventDefault ? t.preventDefault() : t.returnValue = !1)
                };
                "undefined" != typeof window.attachEvent ? this._mView.attachEvent("onmousewheel", t) : "onmousewheel" in window ? this._mView.addEventListener("mousewheel", t, !1) : "undefined" != typeof window.addEventListener && this._mView.addEventListener("DOMMouseScroll", t, !1), this._mPrivateFlags |= i.BUILD
            }
        }, sense: function () {
            this._init()
        }, setPreventDefault: function (e) {
            i.FLAG_PREVENT_DEFAULT = e
        }, _sendWheelChangedMessage: function (e, t) {
            "function" == typeof this.onWheelChanged && this.onWheelChanged.call(this, e, t)
        }
    }, n.exports = i
});
;define("system-core:system/baseService/timerService/timerService.js", function (t, i, e) {
    var n = function (t, i) {
        this._timer = null, this._interval = t, this._actionListener = i, this._isAlive = !1, this._startTime = 0
    };
    n.prototype = {
        isAlive: function () {
            return this._isAlive
        }, interrupt: function () {
            this._timer && clearTimeout(this._timer), this._timer = null, this._isAlive = !1, this._startTime = 0
        }, setActionListener: function (t) {
            "function" == typeof t && (this._actionListener = t)
        }, getActionListener: function () {
            return this._actionListener
        }, start: function () {
            var t = this;
            this._timer = setTimeout(function () {
                t.interrupt(), t._actionListener.call(t)
            }, this._interval), this._startTime = (new Date).getTime(), this._isAlive = !0
        }, getElapsed: function () {
            return (new Date).getTime() - this._startTime
        }, setInterval: function (t) {
            "number" == typeof t && (this._interval = t)
        }, getInterval: function () {
            return this._interval
        }
    }, e.exports = n
});
;define("system-core:system/uiService/iScrollbar/iScrollbar.js", function (t, e, i) {
    var r = t("base:widget/libs/jquerypacket.js"), s = t("system-core:system/baseService/timerService/timerService.js"),
        o = t("system-core:system/uiService/mouseWheelSensor/mouseWheelSensor.js"), n = function (t, e) {
            this._mUI = t, this._mConfig = e || {}, this._mThumbTop = 0, this._mClickTimer = null, this._mPrivateFlags = 0, this._mCoorX = -1, this._mCoorY = -1, this._mCoorWidth = 0, this._mCoorHeight = 0, this._mArrowScrollDir = -1, this._mDX = -1, this._mDY = -1, this._mConfig.defaultScroll && this._initDefaultScroll(), this._init()
        };
    n.FORWARD = 1, n.BACKWARD = 2, n.AWAKE = 4, n.THUMB_AWAKE = 8, n.COUNTING = 16, n.USING_SIMULATE_DRAG = 32, n.START_DRAGGING = 64, n.LOCKED = 128, n.HAS_BORDER = 256, n.CLICK_TIMEOUT = 300, n.prototype = {
        _initDefaultScroll: function () {
            var t = r(this._mUI.listContainer.parentNode);
            t.append('<div class="scrollbar" style="display:none" unselectable="on"><div id="scrollbarArrowUp" class="scrollbar-arrow scrollbar-arrow-up sprite" unselectable="on"></div><div class="scrollbar-tracker" unselectable="on"><div class="scrollbar-thumb" unselectable="on"></div></div><div id="scrollbarArrowDown" class="scrollbar-arrow scrollbar-arrow-down sprite" unselectable="on"></div></div>'), this._mUI.tracker = t.find(".scrollbar-tracker")[0], this._mUI.thumb = t.find(".scrollbar-thumb")[0], this._mUI.upArrow = t.find(".scrollbar-arrow-up")[0], this._mUI.downArrow = t.find(".scrollbar-arrow-down")[0], this._mUI.scrollbar = t.find(".scrollbar")[0]
        }, _init: function () {
            this._mPrivateFlags |= n.AWAKE, this._mPrivateFlags |= n.THUMB_AWAKE, this._mPrivateFlags |= n.HAS_BORDER;
            var t = this;
            this._mUI.tracker && (this._mUI.tracker.onclick = function (e) {
                if (!t.locked()) {
                    var i = e ? e : window.event, r = i.target || i.srcElement;
                    if (r != t._mUI.thumb) {
                        var s = parseInt(i.offsetY || i.layerY);
                        (s < t._mThumbTop || s > t._mThumbTop + t._mUI.thumb.offsetHeight) && (s > t._mThumbTop ? t.onPageScroll(o.FORWARD) : s < t._mThumbTop && t.onPageScroll(o.BACKWARD))
                    }
                }
            });
            var e = function (r) {
                if ((t._mPrivateFlags & n.COUNTING) == n.COUNTING) {
                    var s = r ? r : window.event, o = s.clientX, l = s.clientY;
                    (o < t._mCoorX || o > t._mCoorX + t._mCoorWidth || l < t._mCoorY || l > t._mCoorY + t._mCoorHeight) && (t.abruptPersistArrowScroll(), t.onPersistArrowScrollEnd(), t._unlisten(document, "mousemove", e), t._unlisten(document, "mouseup", i))
                }
            }, i = function () {
                if ((t._mPrivateFlags & n.COUNTING) == n.COUNTING) {
                    var r = t._mArrowScrollDir;
                    null != t._mClickTimer && t._mClickTimer.isAlive() ? (t._mClickTimer.interrupt(), t.onArrowScroll(r)) : t.onPersistArrowScrollEnd(r), t._mPrivateFlags &= ~n.COUNTING, t._unlisten(document, "mousemove", e), t._unlisten(document, "mouseup", i)
                }
            }, r = function (r) {
                if (!t.locked() && (t._mPrivateFlags & n.COUNTING) != n.COUNTING) {
                    var o = "up" == this.getAttribute("dir") ? n.BACKWARD : n.FORWARD;
                    t._mArrowScrollDir = o;
                    var l = r ? r : window.event;
                    t._mCoorX = l.clientX - parseInt(l.offsetX || l.layerX), t._mCoorY = l.clientY - parseInt(l.offsetY || l.layerY), t._mCoorWidth = this.offsetWidth, t._mCoorHeight = this.offsetHeight, null == t._mClickTimer ? t._mClickTimer = new s(n.CLICK_TIMEOUT, null) : t._mClickTimer.interrupt(), t._mClickTimer.setActionListener(function () {
                        t.onPersistArrowScrollStart(o)
                    }), t._mClickTimer.start(), t._mPrivateFlags |= n.COUNTING, t._listen(document, "mousemove", e), t._listen(document, "mouseup", i)
                }
            };
            if (this._mUI.upArrow && (this._mUI.upArrow.setAttribute("dir", "up"), this._mUI.upArrow.onmousedown = r), this._mUI.downArrow && (this._mUI.downArrow.setAttribute("dir", "down"), this._mUI.downArrow.onmousedown = r), this._mUI.thumb && this._mUI.tracker) {
                var l = function (e) {
                    if ((t._mPrivateFlags & n.START_DRAGGING) == n.START_DRAGGING) {
                        var i = e ? e : window.event, r = i.clientX, s = i.clientY;
                        t._onDragging(r, s)
                    }
                    i.preventDefault && i.preventDefault()
                }, a = function () {
                    (t._mPrivateFlags & n.COUNTING) == n.COUNTING && ((t._mPrivateFlags & n.START_DRAGGING) == n.START_DRAGGING && t._endDrag(), t._mPrivateFlags &= ~n.COUNTING, t._unlisten(document, "mousemove", l), t._unlisten(document, "mouseup", a))
                };
                this._mUI.thumb.onmousedown = function (e) {
                    if (!t.locked() && (t._mPrivateFlags & n.COUNTING) != n.COUNTING) {
                        var i = e ? e : window.event;
                        t._mDX = i.clientX, t._mDY = i.clientY, t._startDrag(), t._listen(document, "mouseup", a), t._listen(document, "mousemove", l), t._mPrivateFlags |= n.COUNTING, i.preventDefault && i.preventDefault()
                    }
                }
            }
        }, lock: function (t) {
            t ? (this._mPrivateFlags |= n.LOCKED, -1 == this._mUI.scrollbar.className.indexOf("locked") && (this._mUI.scrollbar.className += " locked")) : (this._mPrivateFlags &= ~n.LOCKED, this._mUI.scrollbar.className = this._mUI.scrollbar.className.replace(" locked", ""))
        }, locked: function () {
            return (this._mPrivateFlags & n.LOCKED) == n.LOCKED
        }, _startDrag: function () {
            this._mPrivateFlags |= n.START_DRAGGING
        }, _endDrag: function () {
            this._mPrivateFlags &= ~n.START_DRAGGING
        }, onPageScroll: function () {
        }, inSimulateDragging: function () {
            return (this._mPrivateFlags & n.USING_SIMULATE_DRAG) == n.USING_SIMULATE_DRAG
        }, _onDragging: function (t, e) {
            if (-1 != this._mDX && -1 != this._mDY) {
                var i = e - this._mDY, r = this._mThumbTop + i;
                r = Math.max(0, r), r = Math.min(r, this._mUI.tracker.offsetHeight - this._mUI.thumb.offsetHeight), this.inSimulateDragging() ? this.onThumbStateChange(r, this._mThumbTop) : this.setThumbState(r, null, !1)
            }
            this._mDX = t, this._mDY = e
        }, _listen: function (t, e, i) {
            "undefined" != typeof t.addEventListener ? t.addEventListener(e, i, !1) : "undefined" != typeof t.attachEvent ? t.attachEvent("on" + e, i) : t["on" + e] = i
        }, _unlisten: function (t, e, i) {
            "undefined" != typeof t.removeEventListener ? t.removeEventListener(e, i, !1) : "undefined" != typeof t.detachEvent ? t.detachEvent("on" + e, i) : t["on" + e] = null
        }, abruptPersistArrowScroll: function () {
            return this._mPrivateFlags &= ~n.COUNTING, null != this._mClickTimer && this._mClickTimer.isAlive() ? (this._mClickTimer.interrupt(), !0) : !1
        }, onPersistArrowScrollStart: function () {
        }, onPersistArrowScrollEnd: function () {
        }, onArrowScroll: function () {
        }, onScroll: function () {
        }, awakeThumb: function (t) {
            t ? (this._mPrivateFlags |= n.THUMB_AWAKE, this._mUI.thumb.style.display = "block") : (this._mPrivateFlags &= ~n.THUMB_AWAKE, this._mUI.thumb.style.display = "none")
        }, isThumbAwake: function () {
            return (this._mPrivateFlags & n.THUMB_AWAKE) == n.THUMB_AWAKE
        }, setThumbState: function (t, e, i) {
            if (!this.locked() && this.isThumbAwake()) {
                var r = this._mThumbTop;
                if (null != e) {
                    (this._mPrivateFlags & n.HAS_BORDER) == n.HAS_BORDER && (e -= 2, e = Math.max(0, e));
                    try {
                        this._mUI.thumb.style.height = e + "px"
                    } catch (s) {
                    }
                }
                try {
                    this._mUI.thumb.style.top = t + "px"
                } catch (s) {
                }
                this._mThumbTop = t, i !== !0 && this.onThumbStateChange(t, r)
            }
        }, onThumbStateChange: function () {
        }, getTrackerHeight: function () {
            return this._mUI.tracker.offsetHeight
        }, isAwake: function () {
            return (this._mPrivateFlags & n.AWAKE) == n.AWAKE
        }, awake: function (t) {
            t ? (this._mPrivateFlags |= n.AWAKE, this._mUI.scrollbar.style.display = "block") : (this._mPrivateFlags &= ~n.AWAKE, this._mUI.scrollbar.style.display = "none"), this.onAwake(t)
        }, onAwake: function () {
        }, reset: function () {
            this.setThumbState(0, 0, !1)
        }, setUsingSimulateDraging: function (t) {
            t ? this._mPrivateFlags |= n.USING_SIMULATE_DRAG : this._mPrivateFlags &= ~n.USING_SIMULATE_DRAG
        }, setBooleanFlags: function (t, e) {
            e ? this._mPrivateFlags |= t : this._mPrivateFlags &= ~t
        }, isInTheBottom: function () {
            if (0 === this._mUI.tracker.offsetHeight || 0 === this._mUI.thumb.offsetHeight) return !1;
            var t = this._mUI.tracker.offsetHeight - this._mUI.thumb.offsetHeight - this._mThumbTop;
            return 0 === Math.floor(Math.abs(t)) ? !0 : !1
        }, isInTheTop: function () {
            return this._mThumbTop < 5
        }
    }, i.exports = n
});
;define("system-core:system/uiService/list/viewRecycler/viewRecycler.js", function (e, i, t) {
    function s() {
        this._mRecycledViews = [], this._mActiveViews = [], this._mFirstPosition = 0
    }

    s.prototype = {
        add: function (e) {
            this._mRecycledViews.push(e), e.parentNode.removeChild(e)
        }, get: function () {
            return 0 == this._mRecycledViews.length ? null : this._mRecycledViews.pop()
        }, scrapActiveViews: function () {
            var e = this._mActiveViews, i = e.length;
            if (0 != i) {
                for (var t = 0, s = e.length; s > t; t++) this._mRecycledViews.push(e[t]);
                for (; this._mRecycledViews.length >= i;) {
                    var c = this._mRecycledViews.pop();
                    c && (c.parentNode.removeChild(c), c = null)
                }
            }
        }, getActiveView: function (e) {
            var i = e - this._mFirstPosition, t = this._mActiveViews;
            if (0 > i || i > t.length - 1) return null;
            var s = t[i];
            return t[i] = null, s
        }, preseveActiveViews: function (e, i) {
            var t = this._mActiveViews;
            t.length = e.length;
            for (var s = 0, c = e.length; c > s; s++) t[s] = e[s];
            this._mFirstPosition = i
        }, clear: function () {
            this._mRecycledViews.length = 0
        }
    }, t.exports = s
});
;define("system-core:system/uiService/motionSensor/motionSensor.js", function (t, i, n) {
    function o(t, i) {
        this._mPrivateFlags = 0, this._mCanvasView = t, this._mOrientation = i, this._mMotionPoint = [-1, -1], this._mLastMotionPoint = [-1, -1], this._mNativeSensors = []
    }

    o.MOTION_LISTENING = 1, o.INSTALLED = 2, o.MOTION_ACCEPT = 4, o.HORIZONTAL = 0, o.VERTICAL = 1, o.TOUCH_THRESHOLD = 5, o.hasMotionCampatibility = function () {
        return "ontouchstart" in document
    }, o.prototype = {
        onMotionStart: function () {
        }, onMotionEnd: function () {
        }, onMotion: function () {
        }, dispatchMotionStart: function (t, i) {
            this._mMotionPoint[0] = t, this._mMotionPoint[1] = i, this._mPrivateFlags |= o.MOTION_LISTENING, this.onMotionStart(this._mCanvasView, this._mMotionPoint)
        }, dispatchMotionMove: function (t, i) {
            var n = o.MOTION_LISTENING, s = o.MOTION_ACCEPT;
            if ((this._mPrivateFlags & n) == n) {
                var e = this._mMotionPoint[0], a = this._mMotionPoint[1],
                    r = -1 == this._mLastMotionPoint[0] ? e : this._mLastMotionPoint[0],
                    h = -1 == this._mLastMotionPoint[1] ? a : this._mLastMotionPoint[1];
                this._mLastMotionPoint[0] = t, this._mLastMotionPoint[1] = i;
                var m = t - r, _ = i - h;
                return (this._mPrivateFlags & s) == s ? void this.onMotion(this._mCanvasView, this._mLastMotionPoint, m, _, this._mOrientation) : void(this._motionAccept(e, a, t, i) && (this._mPrivateFlags |= o.MOTION_ACCEPT, this.onMotion(this._mCanvasView, this._mLastMotionPoint, m, _, this._mOrientation)))
            }
        }, dispatchMotionEnd: function () {
            var t = o.MOTION_LISTENING;
            (this._mPrivateFlags & t) == t && (this._mPrivateFlags &= ~(o.MOTION_LISTENING | o.MOTION_ACCEPT), this._mMotionPoint[0] = -1, this._mMotionPoint[1] = -1, this._mLastMotionPoint[0] = -1, this._mLastMotionPoint[1] = -1)
        }, getOrientation: function () {
            return this._mOrientation
        }, setOrientation: function (t) {
            this._mOrientation = t
        }, getInitialMotionPoint: function () {
            return this._mInitialPoint
        }, _motionAccept: function (t, i, n, s) {
            var e = n - t, a = s - i, r = Math.abs(e), h = Math.abs(a);
            return this._mOrientation === o.HORIZONTAL ? h > r ? !1 : r < o.TOUCH_THRESHOLD ? !1 : !0 : r > h ? !1 : h < o.TOUCH_THRESHOLD ? !1 : !0
        }, uninstall: function () {
            var t = o.INSTALLED;
            (this._mPrivateFlags & t) == t && (this._mPrivateFlags &= ~(o.MOTION_LISTENING | o.MOTION_ACCEPT | o.INSTALLED), this._mCanvasView.removeEventListener("touchstart", this._mNativeSensors[0], !1), this._mCanvasView.removeEventListener("touchmove", this._mNativeSensors[1], !1), document.removeEventListener("touchend", this._mNativeSensors[2], !1), document.removeEventListener("touchcancel", this._mNativeSensors[2], !1))
        }, install: function () {
            var t = o.INSTALLED, i = this;
            if ((i._mPrivateFlags & t) != t) {
                i._mPrivateFlags |= t;
                var n = function (t) {
                    var n = t.touches[0];
                    return i.dispatchMotionStart(n.clientX, n.clientY), !1
                };
                i._mCanvasView.addEventListener("touchstart", n, !1), i._mNativeSensors[0] = n;
                var s = function (t) {
                    var n = t.touches[0];
                    return i.dispatchMotionMove(n.clientX, n.clientY), t.preventDefault(), t.stopPropagation(), !1
                };
                i._mCanvasView.addEventListener("touchmove", s, !1), i._mNativeSensors[1] = s;
                var e = function () {
                    i.dispatchMotionEnd()
                };
                document.addEventListener("touchend", e, !1), document.addEventListener("touchcancel", e, !1), i._mNativeSensors[2] = e
            }
        }
    }, n.exports = o
});
;define("system-core:system/uiService/keyGuard/keyGuard.js", function (t, e, i) {
    function s() {
        this._mPrivateFlags = 0, this._mListeners = [], this._mHijacker = null, this._mHijackContext = null
    }

    var n = t("base:widget/libs/jquerypacket.js");
    s.EVENT_ARROW_UP = 38, s.EVENT_ARROW_DOWN = 40, s.EVENT_ARROW_LEFT = 37, s.EVENT_ARROW_RIGHT = 39, s.EVENT_PAGE_UP = 33, s.EVENT_PAGE_DOWN = 34, s.EVENT_ENTER = 13, s.EVENT_ESCAPE = 27, s.INSTALL = 1, s.EXCLUSIVE_LOCK = 2, s.prototype = {
        acquire: function (t, e) {
            if ((this._mPrivateFlags & s.EXCLUSIVE_LOCK) == s.EXCLUSIVE_LOCK) throw new Error("exclusive lock must be relase before anybody else try to acqiure keyguard service");
            if (this._install(), e) {
                this._mPrivateFlags |= s.EXCLUSIVE_LOCK;
                for (var i = 0, n = this._mListeners.length; n > i; i++) this._mListeners[i].onConnectivity(!1)
            }
            this._mListeners.push(t), t.onMount(!0)
        }, release: function (t) {
            for (var e = (this._mPrivateFlags & s.EXCLUSIVE_LOCK) == s.EXCLUSIVE_LOCK, i = !1, n = 0, _ = this._mListeners.length; _ > n; n++) if (t == this._mListeners[n]) {
                if (this._mListeners[n].onMount(!1), this._mListeners.splice(n, 1), !e) break
            } else i && this._mListeners[n].onConnectivity(!0);
            e && (this._mPrivateFlags &= ~s.EXCLUSIVE_LOCK), this._mHijacker = null, this._mHijackContext = null, 0 == this._mListeners.length && this._uninstall()
        }, hijackKeyEvent: function (t, e) {
            var i = (this._mPrivateFlags & s.EXCLUSIVE_LOCK) == s.EXCLUSIVE_LOCK;
            return i ? (this._mHijacker = t, this._mHijackContext = e, !0) : !1
        }, dispatchKeyEvent: function (t) {
            for (var e = (this._mPrivateFlags & s.EXCLUSIVE_LOCK) == s.EXCLUSIVE_LOCK, i = null, n = this._mListeners.length, _ = n - 1; _ >= 0; _--) {
                i = this._mListeners[_];
                var a = !0;
                a &= t.shiftKey, a &= t.ctrlKey, a &= t.altKey;
                var E = !1;
                if (!a) switch (t.keyCode) {
                    case s.EVENT_ARROW_UP:
                    case s.EVENT_ARROW_DOWN:
                    case s.EVENT_ARROW_LEFT:
                    case s.EVENT_ARROW_RIGHT:
                    case s.EVENT_PAGE_UP:
                    case s.EVENT_PAGE_DOWN:
                    case s.EVENT_ENTER:
                    case s.EVENT_ESCAPE:
                        E = i.onKeyAction(t.keyCode)
                }
                if (E || (this._mHijacker ? this._mHijacker.call(this._mHijackContext ? this._mHijackContext : this, t.keyCode, {
                    shift: t.shiftKey,
                    ctrl: t.ctrlKey,
                    alt: t.altKey
                }) : i.onKeyEvent(t.keyCode, {
                    shift: t.shiftKey,
                    ctrl: t.ctrlKey,
                    alt: t.altKey
                })), _ == n - 1 && e) break
            }
        }, _install: function () {
            if ((this._mPrivateFlags & s.INSTALL) != s.INSTALL) {
                var t = this;
                n(document).bind("keyup", function (e) {
                    t.dispatchKeyEvent(e)
                }), this._mPrivateFlags |= s.INSTALL
            }
        }, _uninstall: function () {
            (this._mPrivateFlags & s.INSTALL) == s.INSTALL && (n(document).unbind("keyup"), this._mPrivateFlags &= ~s.INSTALL)
        }
    }, i.exports = s
});
;define("system-core:system/uiService/list/listView/listView.js", function (t, e, i) {
    function n() {
        this.listsData = null, this.dataCount = 0, this.itemHeight = null, this.mPrivateFlags = 0, this.mCheckedChildren = [], this.CLONE_VIEW_BUILD = 1, this.DATA_CHANGED = 2, this.CHECKED_ALL = 128, this.PRESERVE_CHECKED_STATE = 256, this.LOCKED = 512, this.FLAG_PREVENT_DEFAULT = !1
    }

    var s = t("base:widget/libs/underscore.js");
    n.prototype = {
        init: function (t) {
            t = t || {}, "function" == typeof t.buildView && (this.buildView = t.buildView), "function" == typeof t.getView && (this.getView = t.getView), "function" == typeof t.needOrNotLoadMore && (this.needOrNotLoadMore = t.needOrNotLoadMore), "function" == typeof t.onComputeScrollbarChange && (this.onComputeScrollbarChange = t.onComputeScrollbarChange), "function" == typeof t.onCheckeChanged && (this.onCheckeChanged = t.onCheckeChanged), null != t.$listViewOuter && (this.$listViewOuter = t.$listViewOuter), this.bindEvent()
        }, bindEvent: function () {
        }, setBackedData: function () {
        }, appendBackedData: function () {
        }, updateBackedData: function () {
        }, getBackedData: function () {
            return this.listsData
        }, getElementsData: function () {
            return this.listsData
        }, getElementDataByPosition: function (t) {
            return this.listsData && t < this.dataCount ? this.listsData[t] : null
        }, handleDataChanged: function () {
            (this.mPrivateFlags & this.PRESERVE_CHECKED_STATE) !== this.PRESERVE_CHECKED_STATE && (this.mCheckedChildren.length = 0, this.mPrivateFlags &= ~this.CHECKED_ALL)
        }, dispatchDataChanged: function () {
            this.mPrivateFlags |= this.DATA_CHANGED
        }, getCount: function () {
            return this.dataCount
        }, getViewCount: function () {
            return this.viewCount ? this.viewCount : (this.viewCount = parseInt(this.$listViewOuter.height() / this.itemHeight, 10), this.viewCount)
        }, setItemChecked: function (t, e) {
            this.mCheckedChildren[t] = !!e, !e && this.isAllItemChecked() && (this.mPrivateFlags &= ~this.CHECKED_ALL), this.onCheckeChanged()
        }, _getFilesCount: function () {
            var t = this.listsData, e = t.length;
            if (s.isArray(t[0])) {
                var i = t[0].length;
                e = 1 === e ? i : e > 1 ? i * (e - 1) + s.last(t).length : 0
            }
            return e
        }, _patchCheckedChildren: function () {
            var t = this._getFilesCount();
            t !== this.mCheckedChildren.length && (this.mCheckedChildren.length = t, this.isAllItemChecked() && this._setAllChecked())
        }, _setAllChecked: function () {
            var t = this.getElementsData();
            if (null != t) for (var e = 0, i = t.length; i > e; e++) this.mCheckedChildren[e] = !t[e].disableCheck
        }, setItemsChecked: function (t) {
            t ? (this._setAllChecked(), this.mPrivateFlags |= this.CHECKED_ALL) : (this.mPrivateFlags &= ~this.CHECKED_ALL, this.mCheckedChildren.length = 0), this.onCheckeChanged()
        }, isItemChecked: function (t) {
            return !!this.mCheckedChildren[t]
        }, isAllItemChecked: function () {
            return (this.mPrivateFlags & this.CHECKED_ALL) === this.CHECKED_ALL
        }, getCheckedItems: function () {
            return this.listsData ? (this._patchCheckedChildren(), s.filter(this.listsData, function (t, e) {
                return !!this.mCheckedChildren[e]
            }, this)) : []
        }, getCheckedIndexs: function () {
            if (!this.listsData) return [];
            this._patchCheckedChildren();
            var t = [];
            return s.each(this.mCheckedChildren, function (e, i) {
                e && t.push(i)
            }), t
        }, getFirstCheckedIndex: function () {
            return this.listsData ? (this._patchCheckedChildren(), s.indexOf(this.mCheckedChildren, !0)) : -1
        }, onCheckeChanged: function () {
        }, importCheckedState: function () {
        }, resetList: function () {
        }, getFirstPosition: function () {
        }, addItemToFirst: function () {
        }, layout: function () {
        }, requestLayout: function () {
        }, locked: function () {
            return (this.mPrivateFlags & this.LOCKED) === this.LOCKED
        }, onScroll: function () {
        }, lock: function () {
        }, onSystemNotify: function () {
        }, fixTargetPositionVisible: function () {
        }, scrollToPosition: function () {
        }, setPreventDefault: function (t) {
            this.FLAG_PREVENT_DEFAULT = t
        }
    }, i.exports = n
});
;define("system-core:system/uiService/list/listView/recycleGridView.js", function (t, i, e) {
    function s(t) {
        r.call(this, t), null != t && this.initRecycleGridView(t)
    }

    var r = t("system-core:system/uiService/list/listView/recycleListView.js"),
        n = t("base:widget/libs/jquerypacket.js");
    s.prototype = new r, s.prototype.constructor = s, n.extend(s.prototype, {
        initRecycleGridView: function (t) {
            this._mGridStep = 0, this.itemHeight = 122, "number" == typeof t.columnWidth && (this.columnWidth = t.columnWidth)
        }, setConfig: function (t) {
            r.prototype.setConfig.call(this, t), this.setColumnsCount()
        }, setColumnsCount: function () {
            this._mGridStep = Math.max(parseInt(parseInt(this._mUI.listContainer.offsetWidth, 10) / this.columnWidth, 10), 1)
        }, getColumnsCount: function () {
            return this._mGridStep
        }, scrollToPositionEx: function (t) {
            var i = Math.floor(t / this._mGridStep) + 1;
            return i >= this.listsData.length && (i = this.listsData.length - 1), i = Math.max(1, i), this.scrollToPosition(i)
        }, fixTargetPositionVisible: function (t) {
            var i = Math.floor(t / this._mGridStep);
            return i >= this.listsData.length && (i = this.listsData.length - 1), r.prototype.fixTargetPositionVisible.call(this, i)
        }, getCountEx: function () {
            var t = 0;
            if (null == this.listsData) return t;
            for (var i = 0, e = this.listsData.length; e > i; i++) t += this.listsData[i].length;
            return t
        }, isFirstCheckedChildVisible: function () {
            for (var t = 0, i = this.mCheckedChildren.length; i > t; t++) if (this.isItemChecked(t)) return t / this._mGridStep >= this._mFirstPosition && t / this._mGridStep < this._mFirstPosition + this._mChildren.length;
            return !1
        }, getFirstCheckedChild: function () {
            for (var t = 0, i = this.mCheckedChildren.length; i > t; t++) if (this.mCheckedChildren[t] === !0) return Math.floor(t / this._mGridStep) >= this._mFirstPosition && Math.abs(Math.floor(t / this._mGridStep) - this._mFirstPosition) < this._mChildren.length ? this._mChildren[Math.floor(t / this._mGridStep) - this._mFirstPosition].childNodes[t % this._mGridStep] : null;
            return null
        }, getElementsData: function () {
            var t = [];
            if (!this.listsData) return t;
            for (var i = 0, e = this.listsData.length; e > i; i++) for (var s = 0, r = this.listsData[i].length; r > s; s++) t.push(this.listsData[i][s]);
            return t
        }, getGroupElementsData: function () {
            return this.listsData
        }, setItemChecked: function (t, i) {
            this.mCheckedChildren[t] = i;
            var e = (this.mPrivateFlags & this.CHECKED_ALL) == this.CHECKED_ALL;
            if (!i && e) {
                this.mPrivateFlags &= ~this.CHECKED_ALL;
                for (var s = 0, r = this.getElementsData().length; r > s; s++) s != t && (this.mCheckedChildren[s] = !0)
            }
            this.onCheckeChanged()
        }, getCheckedItems: function () {
            var t = [];
            if (!this.listsData) return t;
            if (this.isAllItemChecked()) {
                for (var i = 0, e = this.listsData.length; e > i; i++) for (var s = 0, r = this.listsData[i].length; r > s; s++) t.push(this.listsData[i][s]);
                return t
            }
            for (var n = this.listsData.length, i = 0, e = this.mCheckedChildren.length; e > i; i++) if (this.mCheckedChildren[i] === !0) {
                var h = Math.floor(i / this._mGridStep);
                if (h >= n) break;
                t.push(this.listsData[h][i % this._mGridStep])
            }
            return t
        }, operateGroupdData: function (t) {
            var i = null == t ? 0 : t.length;
            if (0 == i) return [];
            for (var e = new Array, s = 0, r = this._mGridStep; i > r;) {
                e[s] = [];
                for (var n = 0; r > n; n++) e[s].push(t[s * r + n]);
                s++, i -= r
            }
            i > 0 && (e[s] = []);
            for (var h = 0; i > 0;) e[s].push(t[s * r + h]), i--, h++;
            return e
        }, setBackedData: function (t) {
            t = this.operateGroupdData(t), r.prototype.setBackedData.call(this, t)
        }, appendBackedData: function (t) {
            return null == this.listsData || 0 == this.dataCount ? void this.setBackedData(t) : (t = this.operateGroupdData(t), void r.prototype.appendBackedData.call(this, t))
        }, updateBackedData: function (t, i) {
            t = this.operateGroupdData(t), r.prototype.updateBackedData.call(this, t, i)
        }, changeBackedData: function (t, i) {
            t = this.operateGroupdData(t), r.prototype.changeBackedData.call(this, t, i)
        }, getRenderingChildAt: function (t, i) {
            if (0 == this._mChildren.length) return null;
            if (0 > t || t > this._mChildren.length - 1) return null;
            var e = this._mChildren[t], s = n(e).children();
            return 0 > i || i > s.length - 1 ? null : s[i]
        }, getRenderingChildByPosition: function (t) {
            var i = Math.floor(t / this._mGridStep), e = t % this._mGridStep;
            return i -= this._mFirstPosition, this.getRenderingChildAt(i, e)
        }, getElementDataByPosition: function (t) {
            var i = this.getElementsData();
            return i && t < i.length ? i[t] : null
        }, getGridPosition: function (t, i) {
            return i + t * this._mGridStep
        }
    }), e.exports = s
});
;define("system-core:system/uiService/list/listView/nativeGridView.js", function (t, i, e) {
    "use strict";

    function a(t) {
        n.call(this, t), null != t && this.initNativeGridView(t)
    }

    var s = t("base:widget/libs/jquerypacket.js"),
        n = t("system-core:system/uiService/list/listView/nativeListView.js");
    a.prototype = new n, a.prototype.constructor = a, s.extend(a.prototype, {
        initNativeGridView: function (t) {
            this.mGridStep = 0, "number" == typeof t.columnWidth && (this.columnWidth = t.columnWidth)
        }, setColumnsCount: function () {
            var t = s(this.listContainer).width();
            this.mGridStep = Math.max(parseInt(parseInt(t, 10) / this.columnWidth, 10), 1)
        }, getColumnsCount: function () {
            return this.mGridStep
        }, fixTargetPositionVisible: function (t) {
            var i = Math.floor(t / this.mGridStep);
            return i >= this.listsData.length && (i = this.listsData.length - 1), n.prototype.fixTargetPositionVisible.call(this, i)
        }, getCountEx: function () {
            var t = 0;
            if (null === this.listsData) return t;
            for (var i = 0, e = this.listsData.length; e > i; i++) t += this.listsData[i].length;
            return t
        }, getElementsData: function () {
            var t = [];
            if (!this.listsData) return t;
            for (var i = 0, e = this.listsData.length; e > i; i++) for (var a = 0, s = this.listsData[i].length; s > a; a++) t.push(this.listsData[i][a]);
            return t
        }, getGroupElementsData: function () {
            return this.listsData
        }, getCheckedItems: function () {
            var t = [];
            if (!this.listsData) return t;
            for (var i = this.listsData.length, e = 0, a = this.mCheckedChildren.length; a > e; e++) if (this.mCheckedChildren[e] === !0) {
                var s = Math.floor(e / this.mGridStep);
                if (s >= i) break;
                t.push(this.listsData[s][e % this.mGridStep])
            }
            return t
        }, operateGroupdData: function (t) {
            var i = null == t ? 0 : t.length;
            if (0 === i) return [];
            for (var e = [], a = 0, s = this.mGridStep; i > s;) {
                e[a] = [];
                for (var n = 0; s > n; n++) e[a].push(t[a * s + n]);
                a++, i -= s
            }
            i > 0 && (e[a] = []);
            for (var r = 0; i > 0;) e[a].push(t[a * s + r]), i--, r++;
            return e
        }, setBackedData: function (t) {
            t = this.operateGroupdData(t), n.prototype.setBackedData.call(this, t)
        }, appendBackedData: function (t) {
            if (null == this.listsData || 0 === this.dataCount) return void this.setBackedData(t);
            var i = this.listsData[this.dataCount - 1];
            i.length % this.mGridStep !== 0 && (this.listsData.splice(-1), t = i.concat(t), this.fixLayoutByPosition(--this.dataCount)), t = this.operateGroupdData(t), n.prototype.appendBackedData.call(this, t)
        }, updateBackedData: function (t, i) {
            t = this.operateGroupdData(t), n.prototype.updateBackedData.call(this, t, i)
        }, changeBackedData: function (t, i) {
            t = this.operateGroupdData(t), n.prototype.changeBackedData.call(this, t, i)
        }, fixLayoutByPosition: function (t) {
            s(this.listContainer).find("dd").eq(t).remove()
        }, getRenderingChildAt: function (t, i) {
            if (0 > t || t > this.dataCount) return null;
            var e = s(this.listContainer).find("dd").eq(t), a = e.children();
            return 0 > i || i > a.length - 1 ? null : a[i]
        }, getRenderingChildByPosition: function (t) {
            var i = Math.floor(t / this.mGridStep), e = t % this.mGridStep;
            return this.getRenderingChildAt(i, e)
        }, getElementDataByPosition: function (t) {
            var i = this.getElementsData();
            return i && t < i.length ? i[t] : null
        }, getGridPosition: function (t, i) {
            return i + t * this.mGridStep
        }
    }), e.exports = a
});
;define("system-core:system/uiService/list/listViewManager/listViewManager.js", function (e, t, i) {
    "use strict";

    function s(e) {
        function t() {
            e.$listViewOuter.css("overflow-y", "auto"), n(e.listContainer).height("auto")
        }

        return "list" === e.viewMode ? "recycle" === e.type ? (e.currentList = new c(e), e.currentList) : (t(), e.currentList = new r(e), e.currentList) : "grid" === e.viewMode ? "recycle" === e.type ? (e.currentList = new l(e), e.currentList) : (t(), e.currentList = new o(e), e.currentList) : void 0
    }

    var n = e("base:widget/libs/jquerypacket.js"),
        r = e("system-core:system/uiService/list/listView/nativeListView.js"),
        c = e("system-core:system/uiService/list/listView/recycleListView.js"),
        o = e("system-core:system/uiService/list/listView/nativeGridView.js"),
        l = e("system-core:system/uiService/list/listView/recycleGridView.js");
    i.exports.init = function (e) {
        var t = n.extend({
            type: "native",
            viewMode: "list",
            listContainer: null,
            childrenClass: null,
            listItemDomName: null,
            $listViewOuter: e.listContainer && n(e.listContainer.parentNode),
            buildView: function () {
            },
            getView: function () {
            },
            needOrNotLoadMore: function () {
            },
            onCheckedChanged: function () {
            }
        }, e);
        if (null == t.listContainer) throw new Error("[DOM listContainer] is must");
        if (null == t.childrenClass) throw new Error("[childrenClass] is must");
        if (null == t.listItemDomName) throw new Error("[listItemDomName] is must");
        return s(t)
    }, i.exports.checkListByType = function (e, t) {
        return "recycle" === t ? e instanceof c || e instanceof l : e instanceof r || e instanceof o
    }, i.exports.checkListByViewMode = function (e, t) {
        return "list" === t ? e instanceof r || e instanceof c : e instanceof o || e instanceof l
    }
});
;define("system-core:system/uiService/list/listHeader.js", function (e, i, t) {
    function s(e) {
        if (e === !1) this.hasInit = !1; else {
            if (!e || !e.container) throw new Error("config.container is empty!");
            this.config = e, this.$container = n(e.container), this.canTriggerOrder = e.canTriggerOrder, this.init()
        }
    }

    var n = e("base:widget/libs/jquerypacket.js"),
        o = (e("system-core:system/uiService/log/log.js").instanceForSystem, {
            col: ".fufHyA",
            check: ".fydGNC",
            operate: ".KKtwaH",
            visibleOperate: "cazEfA",
            checked: "EzubGg",
            checkCountTips: ".MdLxwM",
            dataKey: "data-key",
            ascend: "JFaAINb",
            descend: "MCGAxG",
            checkbox: '[node-type~="fydGNC"]',
            gridCols: ".vwCPvP",
            listCols: ".QAfdwP"
        });
    s.prototype.init = function () {
        if (this.hasInit !== !1) {
            var e = this.$container;
            e.append(this.getHeaderDom()), this.config.columns && this.buildHeader(this.config), this.bindEvent()
        }
    }, s.prototype.buildHeader = function (e) {
        if (this.hasInit !== !1) {
            this.config = e;
            var i = this.$container.find(o.listCols), t = this.getHeaderColumnsDom();
            i.html(t), e.order && this.updateOrder(e.order, e.desc, !0)
        }
    }, s.prototype.bindEvent = function () {
        if (this.hasInit !== !1) {
            var e = this.$container, i = this;
            e.delegate(o.col, "click", function () {
                var e = n(this), t = e.index();
                return i.operateClick(t, e), !1
            }).delegate(o.check, "click", function () {
                var e = n(this), t = e.closest(o.col), s = t.index();
                return i.operateChecked(s, t), !1
            })
        }
    }, s.prototype.getHeaderDom = function () {
        if (this.hasInit !== !1) {
            var e = [];
            return e.push(r.buildBefore()), e.push(r.buildAfter()), e.join("")
        }
    }, s.prototype.getHeaderColumnsDom = function () {
        if (this.hasInit !== !1) {
            for (var e, i = this.config.columns, t = [], s = 0, n = i.length; n > s; s++) e = i[s], t.push(r.buildItem(e, 0 === s, s === n - 1));
            return t.join("")
        }
    }, s.prototype.operateClick = function (e, i) {
        if (this.hasInit !== !1) {
            var t, s = this.config, n = s.order, r = s.desc;
            t = i.attr(o.dataKey), t === n && (r = 0 === r ? 1 : 0), this.updateOrder(t, r, !1)
        }
    }, s.prototype.operateChecked = function (e, i) {
        if (this.hasInit !== !1) {
            var t = i.hasClass(o.checked);
            this.onCheckChanged(!t)
        }
    }, s.prototype.onCheckChanged = function () {
    }, s.prototype.updateOrder = function (e, i, t) {
        if (this.hasInit !== !1 && ("function" != typeof this.canTriggerOrder || this.canTriggerOrder() !== !1)) {
            var s, r = this.$container, c = r.find('li[data-key~="' + e + '"]'), a = c.index();
            if (c.length < 1) return !1;
            if (s = this.config.columns[a], s.order === !1 || "function" === n.type(s.order) && s.order() === !1) return !1;
            c.removeClass(o.ascend).removeClass(o.descend), c.siblings().removeClass(o.ascend).removeClass(o.descend), c.addClass(1 === i ? o.descend : o.ascend), this.config.order = e, this.config.desc = i, t || this.onOrderChange(e, i)
        }
    }, s.prototype.changeChecked = function (e, i) {
        if (this.hasInit !== !1) {
            var t = this.$container, s = t.find(o.checkbox).parent(), n = t.find(o.checkCountTips), r = e > 0, c = i;
            r ? t.addClass(o.visibleOperate) : t.removeClass(o.visibleOperate), c ? s.addClass(o.checked) : s.removeClass(o.checked), n.text(this.getCheckMsg(e))
        }
    }, s.prototype.getCheckMsg = function (e) {
        return this.hasInit !== !1 ? "已选中" + e + "个文件/文件夹" : void 0
    }, s.prototype.onOrderChange = function () {
    }, s.prototype.getOperateContainer = function () {
        return this.hasInit !== !1 ? this.$container.find(o.operate) : void 0
    }, s.prototype.changeVmode = function (e) {
        if (this.hasInit !== !1) {
            var i = this.$container, t = i.find(o.gridCols), s = i.find(o.listCols);
            "list" === e.type ? (t.hide(), s.show()) : "grid" === e.type && (t.show(), s.hide())
        }
    };
    var r = {
        buildItem: function (e, i, t) {
            var s = "", o = "fufHyA ", c = "";
            return e.visible === !1 && (s += "display:none;"), i && (o += "yfHIsP "), (e.order === !1 || "function" === n.type(e.order) && e.order() === !1) && (o += "BEPxaPb "), t && (o += "gObdAzb "), s += "width:" + e.width + "%;", e.checkbox && (c = r.buildCheckbox()), '<li data-key="' + e.key + '" class="' + o + '" style="' + s + '">' + c + '<span class="text">' + e.name + '</span><span class="xEuDywb"></span><span class="icon aHEytd icon-up"></span><span class="icon sFxCFbb icon-downtitle"></span></li>'
        }, buildBefore: function () {
            return '<div class="xGLMIab"><ul class="QAfdwP tvPMvPb" node-type="tvPMvPb">'
        }, buildAfter: function () {
            return "</ul>" + r.buildGridCols() + r.buildOperateArea() + "</div>"
        }, buildCheckbox: function () {
            return '<div node-type="fydGNC" class="Qxyfvg fydGNC"><span class="zbyDdwb"></span><span class="MIMvNNb">全选</span><span class="icon NbKJexb icon-checksmall"></span></div>'
        }, buildOperateArea: function () {
            return '<div class="FcQMwt global-clearfix"><span class="MdLxwM"></span><div class="KKtwaH"></div></div>'
        }, buildGridCols: function () {
            return '<ul class="vwCPvP tvPMvPb" node-type="tvPMvPb" style="display: none;"><li class="fufHyA yfHIsP">' + r.buildCheckbox() + "</li></ul>"
        }
    };
    t.exports = s
});
;define("system-core:system/uiService/historyListManage/historyListManage.js", function (t, i, s) {
    function e(t) {
        this.historyList = [], this.historyListTips = [], this.historyListParents = [], t || (t = {}), t.container ? (t.$container = o(t.container), t.renderDefaultDom = !0) : t.renderDefaultDom = !1, this.config = t, this.init()
    }

    var o = t("base:widget/libs/jquerypacket.js"), r = t("base:widget/tools/tools.js"),
        h = t("base:widget/historyManager/historyManager.js"),
        n = t("system-core:system/baseService/message/message.js"),
        a = '<ul class="FuIxtL" node-type="FuIxtL"><li><a data-deep="-1" href="javascript:;">返回上一级</a><span class="EKIHPEb">|</span></li><li node-type="tbAudfb"></li></ul>';
    e.prototype.init = function () {
        if (this.config.renderDefaultDom) {
            var t = this.config.$container;
            this.config && this.config.needSwitch && this.config.needSwitch === !0 && (t.find(".FcucHsb").before('<a class="FbaCPx"></a>'), this.$swicthButton = t.find(".FbaCPx"), /vmode=grid/.test(location.hash) && this.$swicthButton.addClass("ugcOHtb")), t.append(a), this.$historyList = t.find('ul[node-type="FuIxtL"]'), this.$historySubList = t.find('li[node-type="tbAudfb"]'), this.bindEvent()
        }
    }, e.prototype.bindEvent = function () {
        if (this.config.renderDefaultDom) {
            var t = this;
            t.$historyList.delegate("a", "click", function () {
                var i = o(this), s = parseInt(i.attr("data-deep"), 10);
                t._goHistoryByDeep(s)
            }), this.config && this.config.needSwitch === !0 && t.config.$container.delegate(".FbaCPx", "click", function () {
                o(this).toggleClass("ugcOHtb");
                var t = o(this).hasClass("ugcOHtb"), i = h.getCurrentParams(), s = h.getCurrentModule();
                i.vmode = t ? "grid" : "list", n.trigger("system-change-view-mode-loadingtip"), h.getDefault().addHistory(h.buildHistory(s, i))
            })
        }
    }, e.prototype._goHistoryByDeep = function (t) {
        -1 === t ? this.goPrev() : this.goToHistory(t + 1)
    }, e.prototype.addHistory = function (t, i) {
        this.historyList.push(t), this.historyListTips.push(i), this.historyChange()
    }, e.prototype.getPath = function () {
        var t = this.historyList.join("/");
        return ("/" + t + "/").replace(/^\/+/, "/")
    }, e.prototype.changeHistory = function (t, i, s) {
        t.length !== i.length || t.length <= 0 || (this.historyList = t, this.historyListTips = i, this.historyListParents = s || [], this.historyChange())
    }, e.prototype.goToHistory = function (t) {
        t >= this.historyList.length || 0 > t || (this.historyList.splice(t, this.historyList.length), this.historyListTips.splice(t, this.historyListTips.length), this.historyChange())
    }, e.prototype.goPrev = function () {
        this.goToHistory(this.historyList.length - 1, "isPrev")
    }, e.prototype.clear = function () {
        this.historyList.length = 0, this.historyListTips.length = 0, this.historyChange()
    }, e.prototype.historyChange = function () {
        this.renderHistoryDOM(), this.onHistoryChange(this.historyList, this.historyListTips, this.historyListParents)
    }, e.prototype.getFullPathStr = function (t, i) {
        return i = Math.min(t.length, i), t.slice(0, i + 1).join("/")
    }, e.prototype.renderHistoryDOM = function () {
        var t = 0;
        if (this.config.renderDefaultDom) {
            for (var i = [], s = 0; s < this.historyListTips.length; s++) o.inArray(this.historyListTips[s], this.historyListParents) < 0 ? i.push(this.historyListTips[s]) : t += 1;
            if (this.historyListParents.length > 0 && (this.historyListTips = i), !(this.historyListTips.length > 1)) return void this.$historyList.hide();
            this.$historyList.show();
            var e, h, n = [], a = 8, y = 4, g = this.historyListTips.slice();
            "" === g[g.length - 1] && (g.length = g.length - 1), g.length <= 2 ? a = 30 : g.length <= 3 && (a = 15);
            var l = Math.max(g.length - y, 0), p = g;
            if (g.length > y) {
                p = g.slice(l);
                var c = r.encodeHTML(this.getFullPathStr(g, g.length - y));
                n[n.length] = '<span title="' + c + '">...</span><span class="KLxwHFb">&gt;</span>'
            }
            for (var d = 0, f = p.length; f > d; d++) {
                e = p[d], h = e.length > a ? e.substring(0, a) + "..." : e, h = r.encodeHTML(h);
                var u = r.encodeHTML(this.getFullPathStr(g, d + l));
                n[n.length] = d !== f - 1 ? '<a href="javascript:;" title="' + u + '" data-deep="' + (d + l) + '">' + h + '</a><span class="KLxwHFb">&gt;</span>' : '<span title="' + u + '">' + h + "</span>"
            }
            this.$historySubList.html(n.join("")), this.changeHistoryList()
        }
    }, e.prototype.changeHistoryList = function () {
        this.$historyList.find(".fccMxxb").html(this.historyListTips[0]), this.onChangeHistoryList()
    }, e.prototype.onHistoryChange = function () {
    }, e.prototype.onChangeHistoryList = function () {
    }, s.exports = e
});
;define("system-core:system/uiService/tip/tip.js", function (i, e, s) {
    var t = i("base:widget/libs/jquerypacket.js"), o = i("base:widget/libs/underscore.js"),
        n = i("system-core:system/uiService/log/log.js").instanceForSystem, a = "module-tip", l = "module-yun-tip",
        p = "loading", c = "success", d = "caution", r = "failure", u = "none", m = 65, h = 74, f = 3e3,
        v = {mode: d, hasClose: !1, autoClose: !0, isVip: !1}, g = {
            $ele: null,
            timeoutId: 0,
            renderObj: null,
            showTipsAnimationFlag: !0,
            tipsAnimationTimeout: 0,
            checkOption: function (i) {
                var e = !0;
                return i.msg || i.body ? i.mode && this.checkMode(i.mode) === !1 ? !1 : e : !1
            },
            checkMode: function (i) {
                var e = !0;
                switch (i) {
                    case p:
                        e = !0;
                        break;
                    case c:
                        e = !0;
                        break;
                    case d:
                        e = !0;
                        break;
                    case r:
                        e = !0;
                        break;
                    case u:
                        e = !0;
                        break;
                    default:
                        e = !1
                }
                return e
            },
            destroy: function () {
                this.$ele.remove()
            },
            getRenderObj: function (i) {
                var e = {};
                return e.icon = "tip-icon-" + (i.mode || v.mode), e.mode = i.mode || v.mode, e.hasClose = i.hasClose || v.hasClose, e.autoClose = i.autoClose || v.autoClose, e.detailUrl = i.detailUrl || "", e.msg = i.msg, e.body = i.body, e.position = i.position || v.position, e.vipType = i.vipType, e.useAnimation = !!i.useAnimation, e
            },
            getRenderHtml: function () {
                var i = o.template('<div class="tip-inner"><% if (body != null) {%><div class="tip-body"><%= body %></div><%}else {%><% if (vipType == "svip" && (mode == "loading" || mode == "success")) {%><i class="sprite-svip-ic"></i><%}else if (vipType == "vip" && (mode == "loading" || mode == "success")) {%><i class="sprite-vip-ic"></i><%}else {%><i class="tip-icon <%- icon %>"></i><%}%><span class="tip-msg"><%= msg %></span><% if (hasClose) { %><i class="tip-close tip-icon tip-icon-close"></i><% } %><% } %></div>');
                return function (e) {
                    return i(e)
                }
            }(),
            getYunRenderHtml: function (i) {
                var e = "";
                "undefined" == typeof window.yunHeader && (e = "-noheader");
                var s = o.template('<div class="tip-inner"><% if (body != null) {%><div class="tip-body"><%= body %></div><%}else {%><% if (vipType == "svip" && (mode == "loading" || mode == "success")) {%><span class="tip-vip-icon sprite-svip-ic"></span><span class="tip-msg"><%= msg %></span><%}else if (vipType == "vip" && (mode == "loading" || mode == "success")) {%><span class="tip-vip-icon sprite-vip-ic"></span><span class="tip-msg"><%= msg %></span><%}else {%><% if (mode == "loading") {%><span class="tip-icon <%- icon %>"></span><%}else if (mode == "caution" || mode == "failure") {%><span class="tip-icon icon icon-tips-caution' + e + '"></span><%}else if (mode == "success") {%><span class="tip-icon icon icon-tips-success' + e + '"></span><%}else if (mode == "none") {%><span class="tip-icon none"></span><% } %><span class="tip-msg"><%= msg %></span><%}%><% if (detailUrl != "") { %><a class="tip-detail" href="<%- detailUrl %>"><span class="view">查看</span><span class="icon icon-tips-detail' + e + '"></span></a><% } %><% if (hasClose) { %><span class="tip-close tip-icon icon icon-tips-close' + e + '"></span><% } %><% } %></div>');
                return s(i)
            },
            setMsg: function (i) {
                this.$ele.find(".tip-msg").html(i);
                var e = this.$ele.width(), s = {marginLeft: -e / 2};
                this.$ele.css(s)
            },
            hide: function (i) {
                g.$ele && (g.$ele.is(":visible") && (clearTimeout(g.tipsAnimationTimeout), g.showTipsAnimationFlag = !1, g.tipsAnimationTimeout = setTimeout(function () {
                    g.showTipsAnimationFlag = !0
                }, 1e3)), i && i.hideTipsAnimationFlag ? g.$ele.animate({
                    top: "+=30",
                    opacity: .3
                }, 200, "swing", function () {
                    g.$ele.hide().css({top: "-=30", opacity: 1})
                }) : g.$ele.hide())
            },
            render: function (i) {
                var e = this.$ele.is(":visible");
                i ? this.renderByPosition(i) : this.renderByDefault(), g.renderObj.useAnimation && !e && g.showTipsAnimationFlag ? this.$ele.show().css({
                    top: "-=30",
                    opacity: .3
                }).animate({top: "+=30", opacity: 1}, 200, "swing") : this.$ele.show()
            },
            renderByDefault: function () {
                var i, e, s = t("body");
                this.$ele.appendTo(s), i = this.$ele.width(), e = window.yunData && "eyun" !== window.yunData.product ? {
                    top: h,
                    left: "50%",
                    marginLeft: -i / 2
                } : {top: m, left: "50%", marginLeft: -i / 2}, this.$ele.css(e)
            },
            renderByPosition: function (i) {
                var e, s, n = {};
                if (!o.isObject(i)) throw new Error("[TIP] The position of config is not a object !");
                if (i.of) {
                    if (i.of instanceof t) s = i.of; else {
                        if ("string" != typeof i.of) throw new Error("[tip] The position.of of tip is a string or jquery object !");
                        s = t(i.of)
                    }
                    null == s.css("position") && s.css("position", "relative")
                } else s = t("body");
                if (this.$ele.appendTo(s), e = this.$ele.width(), i.top || i.left || i.right || i.bottom) o.each(["top", "left", "bottom", "right"], function (e) {
                    void 0 !== i[e] && (n[e] = i[e])
                }); else if (i.center) {
                    var a = this.$ele.height();
                    n = {top: "50%", left: "50%", marginLeft: -e / 2, marginTop: -a / 2}
                } else n = {top: 65, left: "50%", marginLeft: -e / 2};
                this.$ele.css(n)
            },
            doAutoClose: function (i) {
                return this.timeoutId && clearTimeout(this.timeoutId), void 0 === i ? void(this.timeoutId = setTimeout(function () {
                    g.hide({hideTipsAnimationFlag: !0})
                }, f)) : "boolean" == typeof i ? void(i === !0 && (this.timeoutId = setTimeout(function () {
                    g.hide({hideTipsAnimationFlag: !0})
                }, f))) : void("number" == typeof i && (this.timeoutId = setTimeout(function () {
                    g.hide({hideTipsAnimationFlag: !0})
                }, i)))
            },
            buildTip: function (i) {
                var e = this.getRenderObj(i);
                g.renderObj = e;
                var s;
                if (window.yunData && "eyun" !== window.yunData.product) {
                    s = this.getYunRenderHtml(e), this.$ele.attr("class", l);
                    var o = t(s);
                    o.find(".tip-msg a").css({
                        textDecoration: "none",
                        color: "#fff"
                    }), ("caution" === e.mode || "failure" === e.mode) && this.$ele.addClass("red-yun-tips"), ("loading" === e.mode || "success" === e.mode) && ("vip" === e.vipType && (this.$ele.addClass("vip-yun-tips"), o.find(".tip-msg a").css({color: "#9c7c10"})), "svip" === e.vipType && (this.$ele.addClass("svip-yun-tips"), o.find(".tip-msg a").css({color: "#9c7c10"}))), s = t("<div>").append(o).html()
                } else s = this.getRenderHtml(e), this.$ele.attr("class", a);
                return "string" == typeof i.className && this.$ele.addClass(i.className), "success" === e.mode || "loading" === e.mode ? ("vip" === e.vipType || "svip" === e.vipType) && this.$ele.addClass("sprite-vip-tips") : this.$ele.hasClass("sprite-vip-tips") && this.$ele.removeClass("sprite-vip-tips"), this.$ele.html(s), this.render(i.position), this.doAutoClose(i.autoClose), this.event(), this
            },
            event: function () {
                var i = !1;
                return function () {
                    i === !1 && (this.$ele.delegate(".tip-close", "click", function () {
                        g.hide({hideTipsAnimationFlag: !0})
                    }), i = !0)
                }
            }()
        };
    s.exports = {
        show: function (i) {
            var e = (new Date).getTime();
            if (g.checkOption(i) === !0) {
                g.$ele || (g.$ele = t(window.yunData && "eyun" !== window.yunData.product ? '<div class="' + l + '"></div>' : '<div class="' + a + '"></div>'));
                var s = g.buildTip(i), o = (new Date).getTime() - e;
                return n.send({name: "tipShow", value: o}), s
            }
        }, hide: g.hide, tipStatus: function () {
            return g.$ele && "none" !== g.$ele.css("display") ? "show" : "hide"
        }
    }
});
;define("system-core:system/uiService/loading/loading.js", function (n, i, t) {
    function e(n) {
        for (var i, t = (document.body || document.documentElement).style, e = n.charAt(0).toUpperCase() + n.substr(1), o = [n, "Webkit" + e, "Moz" + e, "O" + e, "ms" + e, "Khtml" + e], s = 0, r = o.length; r > s; s++) if (i = o[s], i in t) return !0;
        return !1
    }

    function o(n, i, t, o) {
        n = n || "spinner", i = i || 65, o = o || "#09aaff";
        var s = "", r = "";
        return r = "undefined" == typeof t ? '<p class="loading-text">' + t + "</p>" : t === !1 ? "" : '<p class="loading-text">' + t + "</p>", s = e("stroke-dashoffset") ? '<svg class="spinner" width="' + i + 'px" height="' + i + 'px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6"stroke-linecap="round" cx="33" cy="33" r="30" style="stroke:' + o + '"></circle></svg>' : '<img src="/box-static/system-core/system/uiService/loading/img/_nomd5/loading.gif" width="' + i + '" height="' + i + '"/>', "spinner" === n ? s + r : ""
    }

    function s(n) {
        if (!(this instanceof s)) return new s(n);
        if (n || (n = {}), this.loadingContainer = null, this.config = {
            loadingType: n.loadingType || "spinner",
            size: n.size,
            text: n.text,
            color: n.color,
            $container: n.container || !1
        }, this.config.$container) {
            var i = this.tpl(), t = this.config.$container.find("loading-container"),
                e = '<div class="loading-container">' + i + "</div>";
            t.length ? t.replaceWith(e) : this.config.$container.append(e), this.loadingContainer = this.config.$container.find(".loading-container")
        }
    }

    s.prototype.tpl = function () {
        return o(this.config.loadingType, this.config.size, this.config.text, this.config.color)
    }, s.prototype.show = function () {
        this.loadingContainer.show()
    }, s.prototype.hide = function () {
        this.loadingContainer.hide()
    }, t.exports = s
});
;define("system-core:system/uiService/canvas/canvas.js", function (n, a, i) {
    var e = n("base:widget/libs/jquerypacket.js"), t = {
        $canvas: null, animateConfig: null, render: function () {
            var n = e('<div class="module-canvas"></div>');
            n.css({
                position: "fixed",
                _position: "absolute",
                left: 0,
                top: 0,
                zIndex: 50,
                background: "#000",
                filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=50)",
                "-moz-opacity": .5,
                "-khtml-opacity": .5,
                opacity: .5,
                width: "100%",
                height: "100%"
            }), this.$canvas = n, e("body").append(n), this.animateConfig && (n.animate(t.animateConfig, "normal"), this.resetAnimateConfig())
        }, bindCanvas: function () {
            var n = this;
            e(window).off("resize.canvas").on("resize.canvas", function () {
                var a = e(this), i = a.width(), t = a.height();
                n.$canvas.width(i), n.$canvas.height(t)
            })
        }, unbindCanvas: function () {
            e(window).off("resize.canvas")
        }, resetAnimateConfig: function () {
            this.animateConfig = null
        }, referCount: 0
    }, s = {
        show: function () {
            return t.$canvas ? t.animateConfig ? (t.$canvas.show(), t.$canvas.animate(t.animateConfig, "normal"), t.resetAnimateConfig()) : t.$canvas.show() : t.render(), t.referCount++, this
        }, hide: function (n) {
            return t.referCount--, t.referCount <= 0 && "keepCanvas" !== n && (t.referCount = 0, t.$canvas && t.$canvas.hide()), this
        }, addAnimate: function (n) {
            return t.animateConfig = n, this
        }
    };
    i.exports = s
});
;define("system-core:system/uiService/dialog/dialog.drag.js", function (e, o, a) {
    var i = e("base:widget/libs/jquerypacket.js"), t = {
        dialogs: {}, getDialogById: function (e) {
            return this.dialogs[e]
        }, hasBind: !1, events: function () {
            var e, o, a, d, n, s = this, g = !1, l = !1, r = function (t) {
                if (e) {
                    var s = i(window).scrollTop();
                    i.browser.msie && "6.0" === i.browser.version && !i.support.style && (s = 0);
                    var g = (e.dialogHeight + t.pageY - a, e.dialogWidth + t.pageX - o),
                        r = t.pageY - a - s < 0 ? 0 : t.pageY - a - s, f = t.pageX - o < 0 ? 0 : t.pageX - o;
                    g > n && (f = n - e.dialogWidth), r > d - 15 && (r = d - 15), e.position({
                        top: r,
                        left: f
                    }), l || (l = !0, o = t.pageX - e.$ele.find(".dialog-drag").offset().left, a = t.pageY - e.$ele.find(".dialog-drag").offset().top)
                }
            };
            i(document).on("mousedown", ".dialog-drag", function (t) {
                var g = i(t.target).attr("class");
                "select-text" !== g && (d = i(window).height(), n = i(window).width(), e = s.getDialogById(i(this).parent().data("dialogId")), l = !0, i(document).on("mousemove", r), o = t.pageX - i(this).offset().left + 3, a = t.pageY - i(this).offset().top + 3)
            }), i(document).on("mouseup", function () {
                g || (e = null, i(document).off("mousemove", r)), g = !1, l = !1
            }), i(document).on("mousedown", ".dialog", function () {
                i(this).data("dialogId")
            }), t.hasBind = !0
        }
    }, d = {
        enableDrag: function (e, o) {
            t.dialogs[e] = o, o.$dialog.find(".dialog-header").addClass("dialog-drag"), t.hasBind === !1 && t.events()
        }
    };
    a.exports = d
});
;define("system-core:system/uiService/button/button.js", function (t, n, i) {
    function e(t) {
        return this instanceof e ? (e._length++, this.startTime = (new Date).getTime(), this.dom = null, this.width = 0, this.height = 0, this.container = null, this.menu = {}, this.menuLength = 0, this.hasRedLightIconHtml = !1, this.id = "b" + e._length++, this.type = t.type || "default", this.config = t, this.config.buttonDefaultConfig = t.buttonDefaultConfig || {}, void this._init()) : new e(t)
    }

    var s = t("base:widget/libs/jquerypacket.js"), o = t("base:widget/libs/underscore.js"),
        a = (t("base:widget/tools/tools.js"), t("system-core:system/uiService/log/log.js").instanceForSystem);
    e._map = {}, e._length = 0, e._secondMenuCallbacks = {}, e.getButton = function (t) {
        return e._map["b" + t] ? e._map["b" + t] : null
    }, e.TPL = o.template('<a class="g-button<%- tips ? \' g-button-hastips\' : ""%>" data-button-id="<%- id %>" data-button-index="<%- index %>" href="<%- link %>" title="<%- tips ? tips : title %>"><span class="g-button-right"><% if (typeof icon !== "undefined") { %><em class="icon <%- icon %>" title="<%- tips ? "" : title %>"></em><% } %><span class="text"><%- title %></span></span><% if (tips !== "") { %><span class="g-button-tips"><%- tips%></span><% } %><% if (hasRedLightIconHtml) { %><i class="button-red-light-icon"></i><% } %></a>'), e.prototype = {
        constructor: e,
        _init: function () {
            this._initUserEvent(), this._renderButton(), e._map[this.id] = this
        },
        _renderButton: function () {
            var t = "javascript:;";
            if (/^(\/|(https?\:\/\/)?(([a-zA-Z0-9]|[\.\-])+){1,3}(cn|com|co|io|gov|org|tv|hk|tw|me))\/?/i.test(this.config.link) && (t = this.config.link), this.config.redLightIcon) this.hasRedLightIconHtml = !0; else if (this.config.menu) try {
                for (var n = 0; n < this.config.menu.length; n++) this.config.menu[n].symLink.config.redLightIcon && (this.hasRedLightIconHtml = !0, this.config.menu[n].hasRedLightIconHtml = !0)
            } catch (i) {
                this.hasRedLightIconHtml = !1
            }
            var o = {
                title: this.config.title || "",
                icon: this.config.icon,
                id: this.id,
                index: this.config.index,
                link: t,
                tips: this.config.tips || "",
                hasRedLightIconHtml: this.hasRedLightIconHtml
            }, d = e.TPL(o);
            if ("dropdown" === this.type) {
                var h = '<span class="g-dropdown-button"></span>';
                if (this.dom = s(h), this.dom.append(d), this.hasRedLightIconHtml && this.dom.find(".button-red-light-icon").addClass("tools-more-red-light-icon"), this.dom.menu = s('<span class="menu"></span>'), this.dom.append(this.dom.menu), this.dom.mainButton = this.dom.find(".g-button"), "object" == typeof this.config.menu && this.config.menu.length) {
                    var u = this._renderMenuList(this.config.menu);
                    this.dom.menu.append(u)
                }
            } else this.dom = s(d), this.dom.mainButton = this.dom;
            var r = this._caulateClassName();
            this.dom.mainButton.addClass(r), this._initSizeAndPosition(), this._initDomEvent(), this.isShow = !0, this.isEnable = !0, "none" === this.config.display && (this.dom[0].style.display = "none", this.isShow = !1);
            var c = (new Date).getTime() - this.startTime;
            a.send({name: "buttonCreate", value: c})
        },
        _initSizeAndPosition: function () {
            "left" === this.config.position ? this.dom.css("float", "left") : "right" === this.config.position && this.dom.css("float", "right");
            var t = 0, n = 0;
            this.dom.mainButton.find(".text").width("undefined" != typeof this.config.textWidth ? this.config.textWidth : "auto"), "undefined" != typeof this.config.iconMarginRight && this.dom.mainButton.find(".icon").css("margin-right", this.config.iconMarginRight);
            var i = this.dom.mainButton;
            this.config.padding instanceof Array && 2 === this.config.padding.length && (t = this.config.padding[0], n = this.config.padding[1], i.css("padding-left", t), i.find(".g-button-right").css("padding-right", n)), "string" == typeof this.config.margin && i.css("margin", this.config.margin)
        },
        _renderMenuOne: function (t) {
            var n = "b-menu" + this.menuLength++;
            this.menu[n] = t;
            var i = "", s = "", o = "", a = "";
            if ("none" === t.display && (s = ' style="display:none;"'), "function" == typeof t.display && (o = t.display()), t.hasRedLightIconHtml && (a = '<i class="button-red-light-icon"></i>'), t.symLink && t.symLink.config && "dropdown" === t.symLink.config.type && t.symLink.config.multiMenu) {
                t.symLink.config.menuLevel = 2;
                var d = new e(t.symLink.config);
                d.dom.addClass("g-dropdown-button-second"), d.dom.attr("menuLevel", 2);
                var h = d.dom[0].outerHTML;
                return d.id && t.symLink.config.menu && (e._secondMenuCallbacks[d.id] = t.symLink.config.menu), h = "<span" + s + ' data-menu-id="' + n + '" class="g-button-menu g-menu-hasIcon">' + h + "</span>"
            }
            return "string" == typeof t.icon ? (i = '<em class="icon ' + t.icon + '"></em>', "<a" + s + ' data-menu-id="' + n + '" class="g-button-menu g-menu-hasIcon" href="javascript:;">' + i + t.title + a + "</a>") : t.symLink && t.symLink.config.buttonClass && t.symLink.config.filesType ? "<a" + s + ' data-menu-id="' + n + '" data-excludetype="' + t.symLink.config.filesType + '"  class="g-button-menu ' + t.symLink.config.buttonClass + '" href="javascript:;">' + t.title + a + "</a>" : t.symLink && t.symLink.config.buttonClass && t.symLink.config.excludeDirType ? "<a" + s + ' data-menu-id="' + n + '" data-excludedir="' + t.symLink.config.excludeDirType + '"  class="g-button-menu ' + t.symLink.config.buttonClass + '" href="javascript:;">' + t.title + a + "</a>" : "<a " + s + ' data-menu-id="' + n + '" class="g-button-menu ' + o + '" href="javascript:;">' + t.title + a + "</a>"
        },
        _renderMenuList: function (t, n) {
            var i = "";
            if ("object" == typeof t) {
                if (t.length) for (var e = 0, o = t.length; o > e; e++) i += this._renderMenuOne(t[e])
            } else i = this._renderMenuOne(t);
            return n && s(n).html(i), i
        },
        _initDomEvent: function () {
            this.dom.undelegate();
            var t = this, n = (s(this.dom), function (n) {
                var i = (new Date).getTime();
                if (t.onMouseEnter(), "dropdown" === t.type) {
                    t.onBeforeOpen() === !1 || t.dom.hasClass("g-disabled") || t.dom.addClass("button-open"), "function" == typeof t.config.menu && t.config.menu(t.dom.menu, function (n) {
                        t._renderMenuList(n, t.dom.menu), t.config.resize === !0 && t.resizeButtonWidth()
                    });
                    var o = s(n.currentTarget);
                    if (o.length && o.parent().hasClass("g-dropdown-button-second")) {
                        var d = o.attr("data-button-id"), h = e._secondMenuCallbacks[d], u = o.parent().find(".menu");
                        o.parent().addClass("button-open"), "function" == typeof h && h(u, function (n) {
                            t._renderMenuList(n, u), t.config.resize === !0 && t.resizeButtonWidth()
                        })
                    }
                    s(this).hasClass("g-button-hastips") && s(".g-button-tips").css({visibility: "visible"});
                    var r = (new Date).getTime() - i;
                    a.send({name: "buttonHover", value: r})
                }
            }), i = function (n) {
                t.onMouseLeave(), s(this).hasClass("g-button-hastips") && s(".g-button-tips").css({visibility: "hidden"});
                var i = n.currentTarget;
                t.menuHideTimeout = setTimeout(function () {
                    var t = s(i), n = t.parent().attr("menuLevel");
                    t.length && t.parent().hasClass("g-dropdown-button-second") && 2 === +n && t.parent().removeClass("button-open")
                }, 100)
            }, o = function () {
                t.isEnable && t.onClick()
            };
            this.dom.bind("mouseleave", function () {
                "dropdown" === t.type && t.onBeforeClose() !== !1 && t.dom.removeClass("button-open")
            }).bind("mouseenter", n).bind("mouseleave", i).bind("click", o).delegate(".g-button", "mouseenter", n).delegate(".g-button", "mouseleave", i).delegate(".g-button", "click", o).delegate(".g-button-menu", "click", function (n) {
                if (n.stopPropagation(), !s(this).hasClass("g-disabled")) {
                    var i = s(this).data("menu-id"), e = t.menu[i];
                    e && "function" == typeof e.click && e.click()
                }
            }).delegate("g-dropdown-button-second", "mouseleave", function () {
                "dropdown" === t.type && t.onBeforeClose() !== !1 && t.dom.removeClass("button-open")
            }).delegate(".menu", "mouseenter", function (n) {
                var i = s(n.currentTarget);
                i.length && i.parent().hasClass("g-dropdown-button-second") && t.menuHideTimeout && clearTimeout(t.menuHideTimeout)
            }).delegate(".menu", "mouseleave", function (t) {
                var n = s(t.currentTarget);
                n.length && n.parent().hasClass("g-dropdown-button-second") && n.parent().removeClass("button-open")
            })
        },
        _initUserEvent: function () {
            "function" == typeof this.config.click && (this.onClick = this.config.click), "function" == typeof this.config.mouseEnter && (this.onMouseEnter = this.config.mouseEnter), "function" == typeof this.config.mouseLeave && (this.onMouseLeave = this.config.mouseLeave), "function" == typeof this.config.beforeOpen && (this.onBeforeOpen = this.config.beforeOpen), "function" == typeof this.config.beforeClose && (this.onBeforeClose = this.config.beforeClose), "function" == typeof this.config.visibleChange && (this.onVisibleChange = this.config.visibleChange), "dropdown" !== this.type ? (this.onBeforeOpen = null, this.onBeforeClose = null) : this.onBeforeOpen = this.onBeforeClose = function () {
            }
        },
        _caulateClassName: function () {
            var t = "", n = this.config.color;
            return t = "big" === this.type ? n ? "g-button-" + n + "-large" : "g-button-large" : "middle" === this.type ? n ? "g-button-" + n + "-middle" : "g-button-middle" : n ? "g-button-" + n : ""
        },
        appendTo: function (t) {
            return t = s(t), t.append(this.dom), this.resizeButtonWidth(), this.container = t, this
        },
        resizeButtonWidth: function () {
            if ("dropdown" === this.type) {
                for (var t, n = this.dom.menu[0].children, i = 0, o = this.dom.outerWidth(), a = 0, d = n.length; d > a; a++) t = e.caculateDropButtonWidth(s(n[a]), this.config), i < t.width && (i = t.width), this.dom.menu.width(i - 2), this.width = i, this.height = t.height;
                t = e.caculateDropButtonWidth(null, this.config), i < t.width && (i = t.width), o > i && (i = o), this.dom.menu.width(i - 2), this.width = i, this.height = t.height
            } else {
                var t = e.caculataButtonWidth(this.config);
                this.width = t.width, this.height = t.height
            }
        },
        change: function (t, n) {
            if (this.config = s.extend(this.config, t), t.type && t.type !== this.type || n) {
                var i = this.dom;
                this.type = t.type, this._init(), i.after(this.dom).remove(), this.resizeButtonWidth(), i = null
            } else {
                this.dom.mainButton.attr("class", "g-button " + this._caulateClassName());
                var e = this.dom.mainButton.find(".icon");
                e.length && !this.config.icon ? e.remove() : 0 === e.length && this.config.icon ? this.dom.mainButton.prepend('<em class="icon ' + this.config.icon + '"></em>') : e.length && e.attr("class", "icon " + this.config.icon), this.dom.mainButton.find(".text").text(this.config.title), this._initSizeAndPosition()
            }
            return this
        },
        addToMenu: function (t, n) {
            if ("dropdown" === this.type) {
                "object" != typeof t || t.length || (t = [t]);
                var i = this._renderMenuList(t)
            }
            return 0 === n ? this.dom.menu.prepend(i) : this.dom.menu.append(i), this.config.resize === !0 && this.resizeButtonWidth(), this
        },
        triggerClick: function (t) {
            this.isEnable && this.onClick(t)
        },
        removeFromMenu: function (t) {
            var n = s(this.dom.menu.find(".g-button-menu")[t]), i = n.data("menu-id");
            return n.remove(), delete this.menu[i], this.config.resize === !0 && this.resizeButtonWidth(), this
        },
        getMenuDom: function (t) {
            return "dropdown" === this.type ? s(this.dom.menu.find(".g-button-menu")[t]) : null
        },
        menuShow: function (t, n) {
            if ("dropdown" === this.type) {
                var i = s(this.dom.menu.find(".g-button-menu")[t]);
                return n === !1 ? i.hide() : i.css("display", "block"), this.config.resize === !0 && this.resizeButtonWidth(), i
            }
            return null
        },
        menuDisable: function (t, n) {
            if ("dropdown" === this.type) {
                var i = s(this.dom.menu.find(".g-button-menu")[t]);
                return n === !1 ? (i.hasClass("g-button-blue") && i.removeClass("g-blue-disabled"), i.removeClass("g-disabled")) : (i.hasClass("g-button-blue") && i.addClass("g-blue-disabled"), i.addClass("g-disabled"))
            }
            return null
        },
        hide: function () {
            return this.dom.hide(), this.isShow = !1, this
        },
        show: function () {
            return this.dom.css("display", "inline-block"), this.isShow = !0, this
        },
        disable: function (t) {
            return t === !1 ? (this.dom.hasClass("g-button-blue") && this.dom.removeClass("g-blue-disabled"), this.dom.hasClass("g-dropdown-button") && this.dom.find(".g-button-blue").removeClass("g-blue-disabled"), this.dom.removeClass("g-disabled"), this.isEnable = !0) : (this.dom.hasClass("g-button-blue") && this.dom.addClass("g-blue-disabled"), this.dom.hasClass("g-dropdown-button") && this.dom.find(".g-button-blue").addClass("g-blue-disabled"), this.dom.addClass("g-disabled"), this.isEnable = !1), this
        },
        onClick: function () {
        },
        onMouseEnter: function () {
        },
        onMouseLeave: function () {
        },
        onBeforeOpen: function () {
        },
        onBeforeClose: function () {
        },
        onVisibleChange: function () {
        }
    }, e.caculataButtonWidth = function (t) {
        var n = 2, i = t.title, e = t.icon, s = t.iconMarginRight, o = t.padding, a = t.textWidth;
        return n += a ? parseInt(a, 10) + 4 : 13 * i.length + 4, "string" == typeof e && (n += "undefined" != typeof s ? 20 + parseInt(s, 10) : 20), n += o ? parseInt(o[0], 10) + parseInt(o[1], 10) : 20, {
            width: n,
            height: 33
        }
    }, e.caculateDropButtonWidth = function (t, n) {
        var i = 2, e = n.title, s = n.icon, o = n.iconMarginRight, a = n.padding, d = n.textWidth,
            h = n.buttonDefaultConfig.paddingLeft, u = n.buttonDefaultConfig.paddingRight,
            r = n.buttonDefaultConfig.paddingHeight;
        return t ? "none" !== t.css("display") ? (i += t.hasClass("g-button-menu") && t.find(".g-dropdown-button-second").length > 0 ? 12 * t.find("a.g-button").text().length : 12 * t.text().length, i += a ? parseInt(a[0], 10) + parseInt(a[1], 10) : 24) : i = 0 : (i += d ? parseInt(d, 10) : 12 * e.length, "string" == typeof s && (i += "undefined" != typeof o ? 20 + parseInt(o, 10) : 24), i += a ? parseInt(a[0], 10) + parseInt(a[1], 10) : h && u ? h + u : 30), {
            width: i,
            height: r || 34
        }
    }, i.exports = e
});
;define("system-core:system/uiService/log/updateLog.js", function (e, t, o) {
    "use strict";

    function n(e) {
        for (var t in e) return !1;
        return !0
    }

    var r = e("base:widget/libs/jquerypacket.js"), i = e("system-core:system/uiService/log/log.js"),
        s = e("base:widget/storage/storage.js"), l = new i, a = 2592e5, g = 18e4, u = 3e4, m = {
            logCounter: {}, processLog: function (e) {
                if (null == e || null == e.op || null == e.from || null == e.type || null == e.detailKey || String(e.op).indexOf("@") > -1 || String(e.from).indexOf("@") > -1 || String(e.type).indexOf("@") > -1 || String(e.detailKey).indexOf("@") > -1) return !1;
                var t = m.logCounter, o = e.op, n = e.from, r = e.type, i = e.detailKey, s = [o, n, r, i].join("@");
                return t[s] = t[s] || {}, t[s].times = ++t[s].times || 1, t[s].timestamp = +new Date, !0
            }, processLogForSend: function (e) {
                var t = [];
                if (null != e && !n(e)) for (var o in e) if (e.hasOwnProperty(o)) {
                    var r = {}, i = o.split("@");
                    r.op = i[0], r.from = i[1], r.type = i[2], r.detailKey = i[3], r.times = e[o].times, r.timestamp = e[o].timestamp, t.push(r)
                }
                return t
            }, writeLocalStorage: function () {
                if ("undefined" != typeof s) {
                    var e = s.getItem("logReport");
                    if (e = e ? r.parseJSON(e) : {}, !n(m.logCounter)) {
                        for (var t in m.logCounter) m.logCounter.hasOwnProperty(t) && (null != e[t] ? e[t].times += m.logCounter[t].times : e[t] = m.logCounter[t]);
                        m.logCounter = {}, n(e) || (s.setItem("logReport", r.stringify(e)), s.setItem("logTimestamp", +new Date))
                    }
                    clearInterval(m.setLogTimer), m.setLogTimer = null
                }
            }, setLocalLog: function (e) {
                m.processLog(e) && (m.setLogTimer || (m.setLogTimer = setInterval(function () {
                    m.writeLocalStorage()
                }, u)), m.sendLogTimer || (m.sendLogTimer = setInterval(function () {
                    m.sendLocalLog()
                }, g)))
            }, sendLocalLog: function () {
                if ("undefined" != typeof s && s.getItem("logReport")) {
                    var e = r.parseJSON(s.getItem("logReport")), t = +s.getItem("logTimestamp");
                    if (+new Date - t < a && !n(e)) for (var o = m.processLogForSend(e), i = 0; i < o.length; i++) m.sendLog(o[i]);
                    s.removeItem("logReport"), s.setItem("logTimestamp", +new Date), clearInterval(m.sendLogTimer), m.sendLogTimer = null
                }
            }, sendLog: function (e) {
                var t = r.extend({url: "//update.pan.baidu.com/statistics", clienttype: "0", uk: yunData.MYUK}, e);
                l.send(t)
            }
        };
    setTimeout(function () {
        m.sendLocalLog(), r(window).bind("beforeunload", function () {
            m.writeLocalStorage()
        })
    }, 1e3), o.exports.sendLog = m.sendLog, o.exports.setLocalLog = m.setLocalLog
});
;define("system-core:system/cache/listCache/cacheManage.js", function (e, t, a) {
    function n(e, t, a) {
        if (i(e)) throw new Error('instance "' + e + '" is already exists!');
        this.cacheName = e, this.config = t, this.key = a, c.addCache(this.cacheName, this.key, this.config)
    }

    var c = e("system-core:system/cache/listCache/listCache.js"), r = {}, i = function (e) {
        if ("prototype" === e || "apply" === e || "call" === e || "name" === e) return !0;
        for (var t in n) if (t === e) return !0;
        return !1
    }, o = function () {
        for (var e in c) c.hasOwnProperty(e) && (n.prototype[e] = function (e) {
            return function () {
                var t = [].slice.call(arguments, 0), a = c[e], n = t.length, r = a.length, i = r - n,
                    o = [this.cacheName, this.key];
                i > -1 && 3 > i && (o = o.slice(0, i)), t = o.concat(t);
                var h = a.apply(null, t);
                return void 0 === h ? this : h
            }
        }(e))
    };
    o(), n.prototype.onBeforeGetCacheData = function (e) {
        c.onBeforeGetCacheData = e
    }, n.prototype.updateKey = function (e) {
        this.key = e
    }, n.replaceSingleCache = function (e, t, a, n) {
        return n ? c.replaceCacheByIndex(e, t, a, n) : c.replaceFirstCache(e, t, a)
    }, n.prototype.getKey = function () {
        return this.key
    }, n.prototype.getCache = n.getCache = function () {
        return c.cache
    }, n.removeCache = function (e) {
        var t = null;
        r[e] && (t = r[e].config, r[e] = null, "object" == typeof t.fileSystem && t.fileSystem.invalidCache());
        var a = n.getCache();
        a[e] && (t = a[e].config, "object" == typeof t.fileSystem && t.fileSystem.invalidCache()), a[e] = null
    }, n.removeCacheByPath = function (e, t, a) {
        var c = n.getCache();
        if (c[e] && c[e].data) {
            var r = c[e].data, i = new RegExp(a ? "^" + t + ".*" : "^" + t + "$");
            for (var o in r) r.hasOwnProperty(o) && i.test(o) && delete r[o]
        }
    }, n.checkShareByPath = function (e, t) {
        var a = n.getCache(), c = 0;
        if (a[e] && a[e].data) {
            var r = a[e].data;
            r[t] && r[t].share && (c = 1)
        }
        return c
    }, n.obtainCache = function (e, t, a) {
        return r[e] || (r[e] = new n(e, t, a)), r[e]
    }, n.prototype.selfAddDataToCache = function () {
        c.addDataToCache.apply(void 0, arguments)
    }, a.exports = n
});
;define("system-core:system/uiService/list/list.js", function (t, e, i) {
    function s(t, e) {
        if (!(this instanceof s)) return new s(t, e);
        if (this.$container = null, this.config = e, !t || (this.$container = o(t)).length <= 0) throw new Error("container is empty!");
        this.$loadingTips = null, this.$historyListRootPath = null, this.$emptyTips = null, this.$historyList = null, this.$listHeader = null, this.$listViewContainer = null, this.$gridViewContainer = null, this.historyList = null, this.currentKey = "", this.listHeader = null, this.listTools = null, this.listLoading = null, this.listView = null, this.gridView = null, this._currentView = null, this._normalListModule = "normal", this._recycleListModule = "recycle", this._currentListModule = this._normalListModule, this.cache = null, this.currentCacheName = null, this.listLimit = 100, this.tip = null, this.init()
    }

    var o = t("base:widget/libs/jquerypacket.js"),
        n = t("system-core:system/uiService/historyListManage/historyListManage.js"),
        r = t("system-core:system/uiService/list/listHeader.js"),
        a = t("system-core:system/uiService/loading/loading.js"),
        h = t("system-core:system/uiService/list/listViewManager/listViewManager.js"),
        l = t("system-core:system/uiService/log/log.js").instanceForSystem,
        c = t("system-core:system/baseService/message/message.js"), d = t("system-core:system/uiService/tip/tip.js"),
        u = function (t) {
            var e = new RegExp("(^|&)" + t + "=([^&]*)(&|$)", "i"), i = window.location.search.substr(1).match(e);
            return null != i ? decodeURIComponent(i[2]) : null
        }, g = {
            moduleHistory: '<div node-type="JDeHdxb" class="JDeHdxb"><span class="EgMMec">全部文件</span><span class="FcucHsb">获取更多数据...</span></div>',
            moduleHeader: '<div class="QxJxtg"></div>',
            moduleListContainer: '<div class="zJMtAEb" style="display:none"><div node-type="NHcGw" class="NHcGw"><div class="vdAfKMb"></div></div></div>',
            moduleGridContainer: '<div class="fyQgAEb"><div node-type="BNfIyPb" class="BNfIyPb"><div class="JKvHJMb"></div></div></div>',
            moduleEmptyTips: '<div class="wPQwLCb"></div>'
        }, p = {
            loadingTips: ".FcucHsb",
            historyListRootPath: ".EgMMec",
            emptyTips: ".wPQwLCb",
            historyList: ".JDeHdxb",
            listHeader: ".QxJxtg",
            listViewContainer: ".zJMtAEb",
            gridViewContainer: ".fyQgAEb",
            listView: ".vdAfKMb",
            gridView: ".JKvHJMb",
            moduleListView: ".NHcGw",
            moduleGridView: ".BNfIyPb"
        };
    s.prototype.init = function () {
        this.buildDom(), this.initPlugin(), this.bindEvent()
    }, s.prototype.buildDom = function () {
        var t = [], e = this.$container;
        t.push(g.moduleHistory), t.push(g.moduleHeader), t.push(g.moduleListContainer), t.push(g.moduleGridContainer), t.push(g.moduleEmptyTips), e.html(t.join("")), this.$loadingTips = e.find(p.loadingTips), this.$historyListRootPath = e.find(p.historyListRootPath), this.$emptyTips = e.find(p.emptyTips), this.$historyList = e.find(p.historyList), this.$listHeader = e.find(p.listHeader), this.$listViewContainer = e.find(p.listViewContainer), this.$gridViewContainer = e.find(p.gridViewContainer), this.$moduleListView = e.find(p.moduleListView), this.$moduleGridView = e.find(p.moduleGridView), this.resize(o(window).height() - e.offset().top)
    }, s.prototype.resize = function (t) {
        var e = this.getCurrentView();
        e && (this.isGridMode() ? (this.$container.height(t), e.setColumnsCount(), this.loadInitData()) : (this.resizeScrollBar(t), e.requestLayout()))
    }, s.prototype.resizeScrollBar = function (t) {
        var e = this.$container;
        if ("number" == typeof t || "string" == typeof t ? e.height(t) : t = e.height(), 0 === t) throw"[Error] list container's height is 0, need to set";
        this.$moduleGridView.height(t - 83), this.$moduleListView.height(t - 83), this.$moduleGridView.find(".scrollbar-tracker").height(t - 83 - 2), this.$moduleListView.find(".scrollbar-tracker").height(t - 83 - 2)
    }, s.prototype.getCurrentView = function () {
        return this._currentView
    };
    var y = null;
    s.prototype.changeCache = function (t) {
        this.cache = t, this.cache.onBeforeGetCacheData(function (t) {
            y = t
        }), this.historyList && this.historyList.clear()
    }, s.prototype.addHistory = function (t, e) {
        this.historyList && this.historyList.addHistory(t, e)
    }, s.prototype.getHistoryIds = function () {
        return this.historyList.historyList
    }, s.prototype.getHistoryList = function () {
        return this.historyList
    }, s.prototype.getHistoryPath = function () {
        var t = this.historyList.getPath();
        return /\S\/+$/.test(t) && (t = t.replace(/\/+$/, "")), t
    }, s.prototype.changeHistory = function (t, e, i) {
        this.historyList && this.historyList.changeHistory(t, e, i)
    }, s.prototype.historyChange = function (t, e) {
        if (0 !== t.length) {
            var i = this.currentKey;
            this.currentKey = t.join("/"), t.length > 1 && (this.currentKey = this.currentKey.substring(1));
            var s = i !== this.currentKey || this.currentCacheName !== this.cache.cacheName;
            s && ("/" !== this.currentKey || "" !== i || null !== this.currentCacheName && this.currentCacheName !== this.cache.cacheName || (s = !1)), this.currentCacheName = this.cache.cacheName, s && this.setItemsChecked(!1, !0), this.cache.updateKey(this.currentKey), this.$historyListRootPath.html(e[0]), this.loadInitData(), s && this.onHistoryChange(t, e)
        }
    }, s.prototype.getCurrentDataList = function () {
        return this.getCurrentView().getElementsData()
    }, s.prototype.refreshList = function () {
        this.historyList && this.historyList.historyChange()
    }, s.prototype.loadInitData = function () {
        var t = (new Date).getTime(), e = this;
        this.updateLoadingTips(s.LOAD_ING), this.getCurrentView().setBackedData([]), this.updateListLoading(s.LOAD_ING), this.cache.getCacheData(-1, function (i, o, n, r) {
            if (0 === i.length ? (e.$listHeader.hide(), e.updateListLoading(s.LOAD_EMPTY)) : (e.$listHeader.show(), e.updateListLoading()), e.updateLoadingTips(o ? s.LOAD_PART : s.LOAD_ALL, i.length), e.resizeScrollBar(), h.checkListByType(e.listView, "recycle") || i.length <= e.listLimit) e.getCurrentView().setBackedData(i); else {
                var a = i.slice(0, e.listLimit), d = i.slice(e.listLimit);
                e.getCurrentView().setBackedData(a), setTimeout(function () {
                    e.getCurrentView().appendBackedData(d), c.trigger("system-change-view-mode-loadingtip-close")
                }, 13)
            }
            var u = {key: n.key, cacheName: n.cacheName, flag: !0};
            e.onLoadedCallBack(i, r, u);
            var g = (new Date).getTime();
            l.send({name: "listInitTime", value: g - t})
        })
    }, s.prototype.loadMoreData = function () {
        var t = this;
        this.cache.hasMoreData() && (this.updateLoadingTips(s.LOAD_ING), this.cache.getCacheData(-2, function (e) {
            t.cache.getCacheData(-1, function (i, n, r, a) {
                if (o.stringify(y) === o.stringify(r)) {
                    if (i.length < 100 && n === !0) return void t.loadMoreData();
                    t.updateLoadingTips(n ? s.LOAD_PART : s.LOAD_ALL, i.length), t.resizeScrollBar(), t.updateListLoading(), h.checkListByType(t.listView, "recycle") ? t.getCurrentView().updateBackedData(i, !0) : t.getCurrentView().appendBackedData(e);
                    var l = {key: r.key, cacheName: r.cacheName, flag: n};
                    t.onLoadedCallBack(e, a, l), t.updateHeaderChecked()
                }
            })
        }))
    }, s.LOAD_ING = 0, s.LOAD_PART = 1, s.LOAD_ALL = 2, s.LOAD_FAILED = 3, s.LOAD_EMPTY = 4, s.prototype.updateListLoading = function (t) {
        var e = this, i = "", o = e.listLoading.tpl();
        switch (t) {
            case s.LOAD_ING:
                i = '<div class="gQNsDv">' + o + "</div>";
                break;
            case s.LOAD_FAILED:
        }
        return t === s.LOAD_EMPTY ? void this.listEmptyTip(this.$emptyTips) : void(i ? this.$emptyTips.html(i).css("visibility", "visible") : t === s.LOAD_FAILED ? (this.$emptyTips.css("visibility", "hidden"), "hide" === d.tipStatus() && d.show({
            mode: "caution",
            msg: "列表加载失败",
            hasClose: !0,
            autoClose: !1
        })) : (this.$emptyTips.css("visibility", "hidden"), "show" === d.tipStatus() && d.hide()))
    }, s.prototype.listEmptyTip = function (t) {
        t.html('<span class="ByxaQt">列表数据为空</span>').show()
    }, s.prototype.fixTargetPositionVisible = function (t) {
        var e = this.getCurrentView();
        return e.fixTargetPositionVisible(t)
    }, s.prototype.showErrorTips = function (t) {
        this.updateListLoading(s.LOAD_FAILED), this.updateLoadingTips(s.LOAD_FAILED, 0, t)
    }, s.prototype.updateLoadingTips = function (t, e) {
        var i = "";
        switch (t) {
            case s.LOAD_ING:
                i = "获取更多数据&hellip;";
                break;
            case s.LOAD_PART:
                i = "已加载" + e + "个";
                break;
            case s.LOAD_ALL:
                i = "已全部加载，共" + e + "个";
                break;
            case s.LOAD_FAILED:
                i = "加载失败"
        }
        this.$loadingTips.html(i)
    }, s.prototype.onHistoryChange = function () {
    }, s.prototype.onLoadedCallBack = function () {
    }, s.prototype.setViewModule = function (t) {
        if (!(null !== this.gridView && this._currentView === this.gridView && "grid" === t || null !== this.listView && this._currentView === this.listView && "list" === t)) {
            if ("grid" === t) this.$listViewContainer.hide(), this.$gridViewContainer.show(), null === this.gridView && this.initGridView(), this.gridView.setColumnsCount(), this._currentView = this.gridView, this.listView && this.gridView.importCheckedState(this.listView); else {
                if ("list" !== t) return;
                this.$gridViewContainer.hide(), this.$listViewContainer.show(), null === this.listView && this.initListView(), this._currentView = this.listView, this.gridView && this.listView.importCheckedState(this.gridView)
            }
            this.onViewModuleChange(t)
        }
    }, s.prototype.onViewModuleChange = function () {
    }, s.prototype.setListModule = function (t) {
        var e = this.cache && this.cache.config.params;
        if (this._currentListModule !== t || !("normal" === t && 0 === e.include || "recycle" === t && 1 === e.include)) {
            if (this._currentListModule = t, this.cache && "function" == typeof this.cache.getCacheConfig) {
                var i = this.cache.getCacheConfig();
                this.cache.clearCacheData(), i.params.include = t === this._normalListModule ? 0 : 1
            }
            this.onListModuleChange(t)
        }
    }, s.prototype.getListModule = function () {
        return this._currentListModule
    }, s.prototype.onListModuleChange = function () {
    }, s.prototype.isGridMode = function () {
        return h.checkListByViewMode(this.getCurrentView(), "grid")
    }, s.prototype.getCheckedItems = function () {
        return this.getCurrentView().getCheckedItems()
    }, s.prototype.getFirstPosition = function () {
        return this.getCurrentView().getFirstPosition()
    }, s.prototype.getDomByPosition = function (t) {
        return this.getCurrentView().getRenderingChildByPosition(t)
    }, s.prototype.getElementDataByPosition = function (t) {
        return this.getCurrentView().getElementDataByPosition(t)
    }, s.prototype.getCheckedIndexs = function () {
        return this.getCurrentView().getCheckedIndexs()
    }, s.prototype.setItemsChecked = function (t, e) {
        this.getCurrentView().setItemsChecked(t), e || this.getCurrentView().requestLayout()
    }, s.prototype.setEachItemChecked = function (t, e) {
        this.setItemsChecked(!1, !0);
        for (var i = 0; i < t.length; i++) this.getCurrentView().setItemChecked(t[i], e)
    }, s.prototype.setSingleItemChecked = function (t) {
        this.getCurrentView().setItemsChecked(!1), this.getCurrentView().setItemChecked(t, !0)
    }, s.prototype.setItemChecked = function (t, e) {
        this.getCurrentView().setItemChecked(t, e), this.getCurrentView().requestLayout()
    }, s.prototype.addItemToFirst = function (t) {
        this.getCurrentView().addItemToFirst(t)
    }, s.prototype.isItemChecked = function (t) {
        return this.getCurrentView().isItemChecked(t)
    }, s.prototype.addItemToFirst = function (t) {
        this.getCurrentView().addItemToFirst(t)
    }, s.prototype.getGridPostiion = function (t, e) {
        return this.getCurrentView() && "function" == typeof this.getCurrentView().getGridPosition ? this.getCurrentView().getGridPosition(t, e) : -1
    }, s.prototype.onOrderChange = function (t, e) {
        if (this.cache && "function" == typeof this.cache.getCacheConfig) {
            var i = this.cache.getCacheConfig();
            i.params.order = t, i.params.desc = e, this.checkLocalSort(t, e) ? this.localSort(this.cache, t, e) : this.cache.clearCacheDataByKey(), this.config.headerConfig && "function" == typeof this.config.headerConfig.operateOrderKey && this.config.headerConfig.operateOrderKey(i.params), this.refreshList(), this.onListOrderChange(t, e)
        }
    }, s.prototype.onListOrderChange = function () {
    }, s.prototype.changeHeaderConfig = function (t) {
        this.config.headerConfig = t, this.listHeader.buildHeader(t)
    }, s.prototype.checkLocalSort = function () {
        return !1
    }, s.prototype.localSort = function () {
    };
    var f = null;
    s.prototype.checkedChanged = function () {
        0 !== o("#export_menu").length && o("body").after(o("#export_menu")) && o("#export_menu").remove(), 0 !== o("#fast_download").length && o("body").after(o("#fast_download")) && o("#fast_download").remove(), this.updateHeaderChecked();
        var t = this.getCheckedItems();
        this.listTools && this.listTools.filesSelect(t), f ? (clearTimeout(f), f = null, f = setTimeout(function () {
            c.trigger("system-checked-changed", {data: t}), f = null
        }, 100)) : f = setTimeout(function () {
            c.trigger("system-checked-changed", {data: t}), f = null
        }, 100)
    }, s.prototype.setListTools = function (t) {
        t && (this.listTools = t, this.listTools.hide())
    }, s.prototype.updateHeaderChecked = function () {
        var t = this.getCheckedIndexs().length;
        this.listHeader && this.listHeader.changeChecked(t, this.isAllItemChecked()), this.onCheckeChanged(t)
    }, s.prototype.isAllItemChecked = function () {
        return this.getCurrentView().isAllItemChecked()
    }, s.prototype.isLocked = function () {
        return this.listView ? this.listView.locked() : this.gridView ? this.gridView.locked() : !1
    }, s.prototype.lock = function (t) {
        this.listView && this.listView.lock(t, !1), this.gridView && this.gridView.lock(t, !1), this.onLockChanged(t)
    }, s.prototype.onLockChanged = function () {
    }, s.prototype.onCheckeChanged = function () {
    }, s.prototype.onHeaderCheckChanged = function (t) {
        if (!this.getCurrentView().locked()) {
            var e, i, s, n, r = this.config.listConfig, a = this.config.gridConfig;
            if (null != r && (e = "." + r.listItemClass, i = r.itemActiveClass), null != a && (s = "." + a.gridItemClass, n = a.itemActiveClass), t) {
                var h = e && i && this.$listViewContainer.find(e);
                h && h.length && h.filter(function (t, e) {
                    return !o(e).has(".gxvMIQ").length
                }).addClass(i);
                var l = s && n && this.$gridViewContainer.find(s);
                l && l.length && l.filter(function (t, e) {
                    return !o(e).is(".gxvMIQ")
                }).addClass(n)
            } else e && i && this.$listViewContainer.find(e).removeClass(i), s && n && this.$gridViewContainer.find(s).removeClass(n);
            this.setItemsChecked(t, !0)
        }
    }, s.prototype.initPlugin = function () {
        var t = this;
        if (this.config.historyConfig) {
            var e = this.config.historyConfig;
            e.container = this.$container.find(p.historyList), this.historyList = new n(e), this.historyList.onHistoryChange = function (e, i) {
                t.historyChange.call(t, e, i)
            }, this.historyList.goToHistory = function (e) {
                t.goToHistory(e)
            }, this.historyList.onChangeHistoryList = function () {
                "function" == typeof t.onChangeHistoryList && t.onChangeHistoryList()
            }
        }
        var i = this.config.headerConfig;
        "undefined" == typeof i && (i = {}), i.container = this.$container.find(p.listHeader), i.containerSelector = p.listHeader, this.listHeader = new r(i), this.listHeader.onOrderChange = function (e, i) {
            t.onOrderChange.call(t, e, i)
        }, this.listHeader.getCheckMsg = function (e, i) {
            return t.getCheckMsg.call(t, e, i)
        }, this.listHeader.onCheckChanged = function (e) {
            t.onHeaderCheckChanged.call(t, e)
        }, this.config.defaultViewModle = this.config.defaultViewModle || "list", this.listLoading = new a({
            size: 26,
            text: !1
        }), this.setViewModule(this.config.defaultViewModle), c.listen("system-change-view-mode-loadingtip", function () {
            var e = t.getCurrentView() ? t.getCurrentView().getElementsData() : [];
            null == e && (e = []), !h.checkListByType(t.listView, "recycle") && e.length >= 1500 && (this.tip = d.show({
                mode: "loading",
                msg: "正在切换",
                autoClose: !1
            }))
        }), c.listen("system-change-view-mode-loadingtip-close", function () {
            this.tip && this.tip.hide()
        })
    }, s.prototype.updateOrder = function (t, e) {
        void 0 === e && (e = this.cache.getCacheConfig().params.desc ? 0 : 1), this.listHeader ? this.listHeader.updateOrder(t, e) : this.onOrderChange(t, e)
    }, s.prototype.checkLowBrowser = function () {
        var t = "8.0", e = navigator.userAgent;
        return (window.ActiveXObject || "ActiveXObject" in window) && /MSIE ([^;]+)/.test(e) && parseFloat(RegExp.$1, 10) <= t ? !0 : !1
    }, s.prototype.initListView = function () {
        var t = this, e = this.config.listViewBuilder, i = o.extend({
            type: "native",
            viewMode: "list",
            listContainer: this.$container.find(p.listView)[0],
            childrenClass: ".AuPKyz",
            listItemDomName: "dd",
            buildView: function (i, s, o) {
                return e.buildView.call(t.listView, i, s, o)
            },
            getView: function (i, s, o, n) {
                return e.getView.call(t.listView, i, s, o, n)
            },
            needOrNotLoadMore: function () {
                t.cache.hasMoreData() && t.loadMoreData()
            },
            onCheckeChanged: function () {
                t.checkedChanged()
            },
            onScroll: function () {
                "function" == typeof e.onScroll && e.onScroll.call(t.listView, this.getCount())
            }
        }, this.config.listConfig);
        (this.checkLowBrowser() || "recycle" === i.type || "recycle" === u("listtype")) && (i = o.extend(i, {
            type: "recycle",
            booleanFlagParams: ["USING_LOW_PIXEL_RATIO", !0],
            flagParams: ["USING_MOUSE_WHEEL_SENSOR", "USING_SCROLLBAR", "USING_KEYBOARD_DISPATCHER", "USING_TOUCH_SENSOR"],
            onComputeScrollbarChange: function (i, s, n) {
                if (i.isInTheTop() ? o(p.listHeader).addClass("AIxDxs").removeClass("QHwQDK") : o(p.listHeader).removeClass("AIxDxs").addClass("QHwQDK"), s > 0 && this.getCount() > 0) {
                    var r = parseFloat((s + n) / this.getCount(), 10);
                    r > .7 && t.loadMoreData()
                } else i.isInTheBottom() && t.cache.hasMoreData() && t.loadMoreData();
                "function" == typeof e.onScroll && e.onScroll.call(t.listView, this.getCount())
            }
        })), this.listView = h.init(i), this.listView.parent = t
    }, s.prototype.initGridView = function () {
        var t = this, e = this.config.gridViewBuilder, i = o.extend({
            type: "native",
            viewMode: "grid",
            listContainer: this.$container.find(p.gridView)[0],
            childrenClass: ".cEefyz",
            listItemDomName: "dd",
            columnWidth: this.config.gridConfig.columnWidth || 130,
            buildView: function (i, s, o) {
                return e.buildView.call(t.gridView, i, s, o)
            },
            getView: function (i, s, o) {
                return e.getView.call(t.gridView, i, s, o)
            },
            needOrNotLoadMore: function () {
                t.cache.hasMoreData() && t.loadMoreData()
            },
            onCheckeChanged: function () {
                t.checkedChanged()
            },
            onScroll: function () {
                "function" == typeof e.onScroll && e.onScroll.call(t.gridView, this.getCount())
            }
        }, this.config.gridConfig);
        (this.checkLowBrowser() || "recycle" === i.type || "recycle" === u("listtype")) && (i = o.extend(i, {
            type: "recycle",
            booleanFlagParams: ["USING_LOW_PIXEL_RATIO", !0],
            flagParams: ["USING_MOUSE_WHEEL_SENSOR", "USING_SCROLLBAR", "USING_KEYBOARD_DISPATCHER", "USING_TOUCH_SENSOR"],
            onComputeScrollbarChange: function (i, s, n) {
                if (i.isInTheTop() ? o(p.listHeader).addClass("AIxDxs").removeClass("QHwQDK") : o(p.listHeader).removeClass("AIxDxs").addClass("QHwQDK"), s > 0 && this.getCount() > 0) {
                    var r = parseFloat((s + n) / this.getCount(), 10);
                    r > .7 && t.loadMoreData()
                } else i.isInTheBottom() && t.cache.hasMoreData() && t.loadMoreData();
                "function" == typeof e.onScroll && e.onScroll.call(t.gridView, this.getCount())
            }
        })), this.gridView = h.init(i), this.gridView.parent = t
    }, s.prototype.bindEvent = function () {
    }, s.prototype.getColumnsCount = function () {
        return this.isGridMode() ? this.getCurrentView().getColumnsCount() : 1
    }, s.prototype.extend = function (t) {
        if ("object" == typeof t) for (var e in t) t.hasOwnProperty(e) && (this[e] = t[e])
    }, s.prototype.goToHistory = function () {
    }, i.exports = s
});
;define("system-core:system/uiService/page/page.js", function (e, a, t) {
    function i(e) {
        if (!(this instanceof i)) return new i(e);
        if ("object" != typeof e) throw"error: the param CONF is not a object";
        this._listLength = e.allNu || 0, this._everyPageNu = e.everyPageNu || 100, this._im_active = e.im_active || !1, this._pageContainer = e.pageContainer || null, this._pageType = e.pageType || !1, this._pageNuShow = e.pageNuShow || 7, this._pageBorder = e.pageBorder || !1, this._currentPageNu = 1, this._html = void 0, this._display = !1, this._visible = !0, this._activeTimeout = null, this._maxPageNu = 1, this._renderPage(1)
    }

    var s = e("base:widget/libs/underscore.js"), n = e("base:widget/libs/jquerypacket.js");
    i.prototype = {
        constructor: i, init: function () {
            var e = this._pageType ? "pagese " + (this._pageBorder ? "page-border" : "") : "paging",
                a = ['<div class="' + e + '">'];
            a.push('<a href="javascript:void(0)" class="page-home mou-evt">首页</a>'), a.push('<a href="javascript:void(0)" class="page-prev">上一页</a>'), this._pageType ? a.push('<span class="page-content"></span>') : (a.push('<span class="txt">第</span>'), a.push('<span class="page-input-wrap"><input type="text" class="page-input"/></span>'), a.push('<span class="txt">/<b class="page-all"></b>页</span>')), a.push('<a href="javascript:void(0)" class="page-next mou-evt">下一页</a>'), a.push('<a href="javascript:void(0)" class="page-end mou-evt" >末页</a>'), a.push("</div>"), this._html = a.join("\n"), null !== this._pageContainer && (!this._pageContainer instanceof n && (this._pageContainer = n(this._pageContainer)), this._initContainerDelegate())
        }, action: function (e, a) {
            this._renderPage(e || this._currentPageNu), (void 0 === a || a) && this.onActive(this._currentPageNu, (this._currentPageNu - 1) * this._everyPageNu, this._everyPageNu)
        }, _initContainerDelegate: function () {
            var e = this, a = s.bind(this.action, this);
            this._pageContainer.delegate(".page-home", "click", function () {
                n(this).hasClass("g-disabled") || 1 === e._currentPageNu || (e._currentPageNu = 1, a())
            }).delegate(".page-end", "click", function () {
                n(this).hasClass("g-disabled") || e._currentPageNu === e._maxPageNu || (e._currentPageNu = e._maxPageNu, a())
            }).delegate(".page-prev", "click", function () {
                n(this).hasClass("g-disabled") || 1 === e._currentPageNu || (e._currentPageNu--, a())
            }).delegate(".page-next", "click", function () {
                n(this).hasClass("g-disabled") || e._currentPageNu === e._maxPageNu || (e._currentPageNu++, a())
            }).delegate(".page-number", "click", function () {
                if (!n(this).hasClass("g-disabled")) {
                    var t = n(this).text();
                    e._currentPageNu = parseInt(t), a()
                }
            }).delegate(".page-input", "keyup", function () {
                if (e._im_active) {
                    var t = n(this).val(), i = parseInt(t);
                    i != t || 0 >= i || i > e._maxPageNu || (e._currentPageNu = i, clearTimeout(e._activeTimeout), e._activeTimeout = setTimeout(a, 1500))
                }
            }).delegate(".page-input", "change", function () {
                var t = n(this).val(), i = parseInt(t);
                i != t || 0 >= i || i > e._maxPageNu || (e._im_active && (clearTimeout(e._activeTimeout), e._im_active = !1, e._activeTimeout = setTimeout(function () {
                    e._im_active = !0
                }, 2e3)), e._currentPageNu = i, a())
            })
        }, _countMaxPageNu: function () {
            if (0 === this._listLength) return this._maxPageNu = 0, this._maxPageNu;
            var e = this._listLength / this._everyPageNu + (this._listLength % this._everyPageNu == 0 ? 0 : 1) || 1;
            return this._maxPageNu = Math.floor(e), this._maxPageNu
        }, setPageContainer: function (e) {
            return this._pageContainer = n(e), this._initContainerDelegate(), this
        }, _insertPage: function (e) {
            var a = "";
            if (this._maxPageNu <= this._pageNuShow) for (var t = 0; t < this._maxPageNu; t++) a += '<span class="page-number ' + (e == t + 1 ? "g-disabled" : "") + '">' + (t + 1) + "</span>"; else {
                a = '<span class="pe-ellipsis">...</span>';
                for (var t = 0; t < this._pageNuShow; t++) a += '<span class="page-number">' + (t + 1) + "</span>";
                a += '<span class="ne-ellipsis">...</span>'
            }
            n(".page-content", this._pageContainer).html(a), this._maxPageNu > this._pageNuShow ? this._countPage(e) : (n(".page-prev", this._pageContainer).addClass("none"), n(".page-next", this._pageContainer).addClass("none"))
        }, _countPage: function (e) {
            var a = (this._pageNuShow - 1) / 2, t = "";
            if (n(".page-prev", this._pageContainer).removeClass("none"), n(".pe-ellipsis", this._pageContainer).removeClass("none"), n(".page-next", this._pageContainer).removeClass("none"), n(".ne-ellipsis", this._pageContainer).removeClass("none"), e > a + 1 && this._maxPageNu - e > a) for (var i = 0; i < this._pageNuShow; i++) t = e + i - a == e ? "g-disabled" : "", n(".page-number", this._pageContainer).eq(i).text(e + i - a).addClass(t); else if (a + 1 >= e) n(".page-number", this._pageContainer).eq(e - 1).addClass("g-disabled"), n(".pe-ellipsis", this._pageContainer).addClass("none"), n(".page-prev", this._pageContainer).addClass("none"); else if (this._maxPageNu - e <= a) {
                for (var i = 0; i < this._pageNuShow; i++) t = this._maxPageNu - this._pageNuShow + i + 1 == e ? "g-disabled" : "", n(".page-number", this._pageContainer).eq(i).text(this._maxPageNu - this._pageNuShow + i + 1).addClass(t);
                n(".ne-ellipsis", this._pageContainer).addClass("none"), n(".page-next", this._pageContainer).addClass("none")
            }
        }, _renderPage: function (e) {
            return this._countMaxPageNu.call(this), e > this._maxPageNu ? void this._renderPage(this._maxPageNu) : 0 === this._listLength ? void this.setDisplay(!1) : this._maxPageNu <= 1 && this._display ? void this.setDisplay(!1) : (this._maxPageNu > 1 && !this._display ? this.setDisplay(!0) : this._maxPageNu > 1 && this._display && (this._pageType ? this._insertPage(e) : (n(".page-all", this._pageContainer).text(this._maxPageNu), n(".page-input", this._pageContainer).val(e))), n(".page-prev", this._pageContainer).removeClass("g-disabled"), n(".page-home", this._pageContainer).removeClass("g-disabled"), n(".page-next", this._pageContainer).removeClass("g-disabled"), n(".page-end", this._pageContainer).removeClass("g-disabled"), 1 == e && (n(".page-prev", this._pageContainer).addClass("g-disabled"), n(".page-home", this._pageContainer).addClass("g-disabled")), this._maxPageNu == e && (n(".page-next", this._pageContainer).addClass("g-disabled"), n(".page-end", this._pageContainer).addClass("g-disabled")), void(this._currentPageNu = e))
        }, setDisplay: function (e) {
            if (e) {
                if (1 == this._maxPageNu) return void this.setDisplay(!1);
                if ("undefined" == typeof this._html && this.init.call(this), null === this._pageContainer) return;
                this._pageContainer.html(this._html), this._pageType ? this._insertPage(1) : (n(".page-input", this._pageContainer).val(1), n(".page-all", this._pageContainer).text(this._maxPageNu))
            } else this._pageContainer.html("");
            this._display = e
        }, setVisible: function (e) {
            e ? this._pageContainer.show() : this._pageContainer.hide(), this._visible = e
        }, chageAllNu: function (e, a) {
            return this._listLength == e ? !1 : (this._listLength = e, this._countMaxPageNu(), this._currentPageNu > this._maxPageNu && (this._currentPageNu = this._maxPageNu), void this.action(null, !a))
        }, chageEveryPageNu: function (e) {
            return 1 > e || this._everyPageNu == e ? !1 : (this._everyPageNu = e, this._countMaxPageNu(), this._currentPageNu > this._maxPageNu && (this._currentPageNu = this._maxPageNu), void this.action())
        }, goNext: function () {
            this._pageContainer.find(".page-next").trigger("click")
        }, goPrev: function () {
            this._pageContainer.find(".page-prev").trigger("click")
        }, goTo: function (e, a) {
            return "number" == typeof e && e >= 0 && e <= this._maxPageNu ? (this._currentPageNu = e, void this.action(e, a)) : !1
        }, refreshCurrentPage: function (e, a) {
            e && (this._listLength = e), a && (this._everyPageNu = a), this.action()
        }, onActive: function () {
        }
    }, t.exports = i
});
;define("system-core:system/uiService/dialog/dialog.js", function (i, t, o) {
    function n(i) {
        return this instanceof n ? (i || (i = {}), this.buttonIns = [], this.buttonMap = {}, this.minimizeBottom = 0, this.animateName = i.animateName || "", this.dialogId = i.id || a.uniqueId("dialog"), i.className = i.className || "", this.status = n.STATUS_NORMAL, this.$dialog = e('<div class="' + n.MODULE_NAME + " dialog-" + this.dialogId + " " + i.className + " " + this.animateName + '" id="' + this.dialogId + '" />'), this.$dialog.data("dialogId", this.dialogId), this.$header = null, this.zIndex = i.zIndex || 0, this.$minHeader = null, this.setConfig(i), void this.init()) : new n(i)
    }

    var e = i("base:widget/libs/jquerypacket.js"), a = i("base:widget/libs/underscore.js"),
        s = i("system-core:system/uiService/dialog/dialog.drag.js"),
        l = i("system-core:system/uiService/button/button.js"), d = i("system-core:system/uiService/canvas/canvas.js");
    n.THEME_DEFAULT = "gray", n.THEME_BLUE = "blue", n.MODULE_NAME = "dialog", n.STATUS_NORMAL = "normal", n.STATUS_MIN = "min", n.STATUS_MAX = "max", n.MIN_ZINDEX = 51, n.MAX_ZINDEX = 70, n.zIndexTop = n.MIN_ZINDEX, n.DEFAULT_CONFIG = {
        title: "",
        titleIcon: "",
        theme: "",
        dialogClass: "",
        max: !1,
        back: !1,
        min: !1,
        close: !0,
        onClose: !1,
        width: "520px",
        minDialogWidth: "auto",
        draggable: !0,
        show: !1,
        lock: !0,
        body: "",
        noHeader: !1,
        noFooter: !0,
        position: {xy: "center", offset: null},
        beforeShow: null,
        beforeHide: null,
        afterShow: null,
        afterHide: null
    }, n.TEMPLATE_HEAD = '<div class="dialog-header"><% if (!titleIcon) { %><h3><span class="dialog-header-title"><em class="select-text"><%= title %></em></span></h3><% } else { %><h3 class="hasicon"><i class="<%- titleIcon %>"></i><span class="dialog-header-title"><em class="select-text"><%= title %></em></span></h3><% } %><div class="dialog-control"><% if (close) { %><span class="dialog-icon dialog-close icon icon-close"><span class="sicon">×</span></span><% } %><% if (max) { %><span class="dialog-icon dialog-max icon icon-maximizing"><span class="sicon">□</span></span><% } %><% if (min) { %><span class="dialog-icon dialog-min icon icon-minimize"><span class="sicon">-</span></span><% } %></div></div>', n.TEMPLATE_HEAD_FOR_MIN = '<div class="dialog-min-header"><% if (!titleIcon) { %><h3><span class="dialog-header-title"><em class="select-text"><%= title %></em></span></h3><% } else { %><h3 class="hasicon"><i class="<%- titleIcon %>"></i><span class="dialog-header-title"><em class="select-text"><%= title %></em></span></h3><% } %><div class="dialog-control"><% if (close) { %><span class="dialog-icon dialog-close icon icon-close"><span class="sicon">×</span></span><% } %><% if (min || max) { %><span class="dialog-icon dialog-back icon icon-maximizing"><span class="sicon">□</span></span><% } %></div></div>', n.TEMPLATE_FOOT = '<div class="dialog-footer g-clearfix"></div>', n.TEMPLATE_EXTRA = '<div class="dialog-extra g-clearfix"></div>', n.QUERY = {
        body: "body",
        dialogHeader: ".dialog-header",
        dialogMinHeader: ".dialog-min-header",
        dialogClose: ".dialog-close",
        dialogTitle: ".dialog-header-title .select-text",
        dialogBody: ".dialog-body",
        dialogFooter: ".dialog-footer",
        dialogExtra: ".dialog-extra"
    }, n.dialogList = [], n.prototype = {
        setConfig: function (i) {
            this.config = e.extend(!0, {}, n.DEFAULT_CONFIG, i)
        }, init: function () {
            n.dialogList.push(this), this._render(), this.config.show === !0 && this.show(), this._events()
        }, _render: function () {
            var i = '<div class="dialog-body"><%= body %></div>';
            this.config.dialogClass && this.$dialog.addClass(this.config.dialogClass), this.config.min && (i = n.TEMPLATE_HEAD_FOR_MIN + i), this.config.noHeader || (i = n.TEMPLATE_HEAD + i), this.config.buttons && (i += n.TEMPLATE_FOOT), this.config.extra && (i += n.TEMPLATE_EXTRA);
            var t = null;
            "object" == typeof this.config.body && (t = this.config.body, this.config.body = "");
            var o = a.template(i)(this.config);
            this.$dialog.html(o), t && this.$dialog.find(".dialog-body").append(t), this.createButtons(), this.setTheme(), this.setExtraContent(), this.config.width && (/([\d\.]+)\%$/.test(this.config.width) && (this.config.width = parseFloat(RegExp.$1) / 100 * e(window).width()), this.width(this.config.width)), this.config.height && (/([\d\.]+)\%$/.test(this.config.height) && (this.config.height = parseFloat(RegExp.$1) / 100 * e(window).height()), this.height(this.config.height)), this.$dialog.appendTo("body"), this.$header = this.$dialog.find(".dialog-header"), this.$minHeader = this.$dialog.find(".dialog-min-header")
        }, setTheme: function () {
            this.$dialog.addClass(this.config.theme ? this.config.theme === n.THEME_BLUE ? "dialog-" + n.THEME_BLUE : "dialog-" + n.THEME_DEFAULT : "dialog-" + n.THEME_DEFAULT)
        }, createButtons: function () {
            var i = this.config.buttons, t = this, o = null;
            t.buttonIns.length = 0, a.map(i, function (i) {
                o = new l(i), t.buttonIns.push(o), i.name && (t.buttonMap[i.name] = o);
                var e = o.dom;
                t.$dialog.find(n.QUERY.dialogFooter).append(e)
            })
        }, setExtraContent: function () {
            var i = this.config.extra;
            this.$dialog.find(n.QUERY.dialogExtra).append(i)
        }, setButtonDisable: function (i, t) {
            var o = this.buttonIns.length;
            if (void 0 === t) a.map(this.buttonIns, function (t) {
                t.disable(i)
            }); else for (var n = 0; o > n; n++) n == t && this.buttonIns[n].disable(i)
        }, _events: function () {
            var i = this;
            this.config.draggable === !0 && this.enableDrag(), this.$dialog.on("click.dialog", n.QUERY.dialogClose, function (t) {
                t.stopPropagation();
                var o = i.onClose.call(i, arguments);
                return a.isFunction(i.onClose) === !0 ? o !== !1 && ("keepCanvas" === o && i.hide("keepCanvas"), i.hide()) : i.hide(), !1
            }), a.each(["min", "back", "max"], function (t) {
                this.$dialog.on("click", ".dialog-" + t, function (o) {
                    o.stopPropagation(), "min" === t ? i.minimize() : "back" === t && i.restore()
                })
            }, this), this.$dialog.on("mousedown.dialog", function () {
                i.zIndex ? i._setIndex(i.zIndex) : i._top()
            })
        }, _top: function () {
            var i = function () {
                n.zIndexTop > n.MAX_ZINDEX && t()
            }, t = function () {
                var i = n.dialogList, t = n.MIN_ZINDEX;
                i.sort(function (i, t) {
                    return i.$dialog.css("zIndex") > t.$dialog.css("zIndex")
                }), a.map(i, function (i) {
                    i.$dialog.css("zIndex", t++)
                }), n.zIndexTop = t
            };
            return function () {
                this.zIndex !== n.zIndexTop && (n.zIndexTop++, this.zIndex = n.zIndexTop, this.$dialog.css("zIndex", n.zIndexTop), i())
            }
        }(), _setIndex: function (i) {
            this.$dialog.css("zIndex", i)
        }, _unbindEvents: function () {
            this.$dialog.off()
        }, delegate: function (i, t, o) {
            this.$dialog.delegate(i, t, o)
        }, topShow: function () {
            this._top(), this.show()
        }, show: function () {
            return this.$dialog.is(":visible") ? void 0 : ("function" == typeof this.config.beforeShow && this.config.beforeShow.call(this), a.isString(this.config.position.xy) ? this.position(this.config.position.xy, this.config.position.offset) : a.isArray(this.config.position.xy) && this.position({
                top: this.config.position.xy[0],
                left: this.config.position.xy[1]
            }), this.$dialog.show().css("visibility", "visible"), this.config.lock === !0 && this.lock(), this.zIndex ? this._setIndex(this.zIndex) : this._top(), /IE\s[67]/.test(navigator.userAgent) && e("body").css("zoom", 0), "function" == typeof this.config.afterShow && this.config.afterShow.call(this), this)
        }, getMinDom: function () {
            return this.$dialog.find(n.QUERY.dialogMinHeader)
        }, move: function () {
        }, setMinimizeBottom: function (i) {
            "number" == typeof i && (this.minimizeBottom = i)
        }, minimize: function () {
            var i = this;
            if (this.status === n.STATUS_MIN) return this;
            if ("bottom-left" === this.config.position.xy || "bottom-right" === this.config.position.xy) {
                var t = function () {
                    i.$dialog.find(n.QUERY.dialogHeader).hide(), "bottom-left" === i.config.position.xy ? i.$dialog.find(n.QUERY.dialogBody).css("height", "0") : i.$dialog.find(n.QUERY.dialogBody).hide(), i.$dialog.find(n.QUERY.dialogHeader).hide(), i.$dialog.find(n.QUERY.dialogMinHeader).show(), "auto" !== i.config.minDialogWidth && i.$dialog.width(i.config.minDialogWidth), i.dialogWidth = i.$dialog.outerWidth(), i.dialogHeight = i.$dialog.outerHeight();
                    var t = 0 === i.minimizeBottom ? 0 : i.minimizeBottom, o = function () {
                        i.config.min && "function" == typeof i.config.min && i.config.min.call(this), i.status = n.STATUS_MIN, i.onSizeChange({status: "minimize"})
                    };
                    /IE\s[67]/.test(navigator.userAgent) ? (i.$dialog.css({bottom: t}), o(), e("body").css("zoom", 1)) : i.$dialog.animate({bottom: t}, "fast", "linear", o)
                }, o = this.dialogHeight;
                i.$dialog.is(":visible") && !/IE\s[67]/.test(navigator.userAgent) ? this.$dialog.stop().animate({bottom: -o}, "fast", "linear", t) : (this.$dialog.css("bottom", -o), t(), e("body").css("zoom", 1))
            }
            return this
        }, restore: function () {
            var i = this;
            if (this.status === n.STATUS_NORMAL) return this;
            if ("bottom-left" === this.config.position.xy || "bottom-right" === this.config.position.xy) {
                var t = this.dialogHeight, o = function () {
                    i.$dialog.find(n.QUERY.dialogMinHeader).hide(), "bottom-left" === i.config.position.xy ? i.$dialog.find(n.QUERY.dialogBody).css("height", "auto") : i.$dialog.find(n.QUERY.dialogBody).show(), i.$dialog.find(n.QUERY.dialogHeader).show(), i.$dialog.find(n.QUERY.dialogFooter).show(), "auto" !== i.config.minDialogWidth && i.$dialog.width(i.config.width), i.dialogWidth = i.$dialog.outerWidth(), i.dialogHeight = i.$dialog.outerHeight();
                    var t = function () {
                        i.config.max && "function" == typeof i.config.max && i.config.max.call(this), i.status = n.STATUS_NORMAL, i.onSizeChange({status: "normal"})
                    };
                    /IE\s[67]/.test(navigator.userAgent) ? (i.$dialog.css({bottom: 0}), t(), e("body").css("zoom", 0)) : i.$dialog.animate({bottom: 0}, 300, "linear", t)
                };
                /IE\s[67]/.test(navigator.userAgent) ? (this.$dialog.css({bottom: -t}), o(), e("body").css("zoom", 0)) : this.$dialog.is(":animated") || this.$dialog.animate({bottom: -t}, "fast", "linear", o)
            }
            return this
        }, maximize: function () {
        }, isVisible: function () {
            return this.$dialog.is(":visible")
        }, hide: function (i) {
            return this.isVisible() ? ("function" == typeof this.config.beforeHide && this.config.beforeHide.call(this), this.$dialog.hide(), d.hide(i), /IE\s[67]/.test(navigator.userAgent) && e("body").css("zoom", 1), "function" == typeof this.config.afterHide && this.config.afterHide.call(this), this) : void 0
        }, destroy: function () {
            this.detachedElement = this.$dialog.detach()
        }, title: function (i) {
            return this.$dialog.find(n.QUERY.dialogTitle).text(i), this
        }, icon: function (i) {
            if (i) {
                var t = this.$header.find("h3 i"), o = this.$minHeader.find("h3 i");
                0 === t.length && (t = e("<i></i>"), this.$header.find("h3").addClass("hasicon").prepend(t)), 0 === o.length && (o = e("<i></i>"), this.$minHeader.find("h3").addClass("hasicon").prepend(o)), t.attr("class", i), o.attr("class", i)
            } else this.$header.find("h3").removeClass("hasicon"), this.$minHeader.find("h3").removeClass("hasicon");
            return this
        }, width: function (i) {
            return this.$dialog.width(i), this
        }, height: function (i) {
            return this.$dialog.height(i), this
        }, content: function (i) {
            this.$dialog.find(n.QUERY.dialogBody).html(i)
        }, find: function (i) {
            return this.$dialog.find(i)
        }, enableDrag: function () {
            s.enableDrag(this.dialogId, this)
        }, lock: function () {
            d.show()
        }, reset: function (i) {
            null === this.detachedElement && this.hide(), this.detachedElement.appendTo("body"), i && i(), this.hasInitialPosition && this.position(this.hasInitialPosition)
        }, position: function (i, t) {
            var o = {top: "auto", bottom: "auto", left: "auto", right: "auto"};
            if (this.dialogWidth = this.$dialog.outerWidth(), this.dialogHeight = this.$dialog.outerHeight(), "center" === i) {
                var a = e(window).height(), s = e(window).width();
                o = e.extend(o, {
                    top: (a - this.dialogHeight) / 2,
                    left: (s - this.dialogWidth) / 2,
                    bottom: "auto",
                    right: "auto"
                }), o.top < 0 && (o.top = 0)
            } else "bottom-left" === i ? (t || (t = {}), o = e.extend(o, {
                bottom: 0 + (t.bottom || 0),
                left: t.left || 0,
                top: "auto",
                right: "auto"
            })) : "bottom-right" === i ? (t || (t = {}), o = e.extend(o, {
                bottom: 0 + (t.bottom || 0),
                right: t.right || 0,
                top: "auto",
                left: "auto"
            })) : o = e.extend(o, i);
            this.$dialog.css(o), this.$dialog.css("zIndex", n.DEFAULT_ZINDEX++), void 0 === this.hasInitialPosition && (this.hasInitialPosition = o)
        }, onSizeChange: function () {
            return void 0
        }, onClose: function () {
            var i, t = this;
            return "function" == typeof this.config.onClose && (i = this.config.onClose.call(t)), i
        }
    }, n._confirmDialog = null, n.confirm = function (i, t, o, e, s, l) {
        var d;
        if (a.isObject(i) === !0) {
            if (!i.title) throw new Error("[context] 确认对话框名称是必须的！");
            if (!i.body) throw new Error("[context] 对话框内容是必须的！");
            d = i
        } else if (a.isString(i) === !0) {
            if (!t) throw new Error("[context] 对话框内容是必须的！");
            d = {title: i, body: t, onSure: o, onCancel: e, extra: s}
        }
        d.dialogDefaultConfig = l || {};
        var g = {
            id: "confirm",
            show: i.show || !0,
            title: d.title,
            width: i.width || n.DEFAULT_CONFIG.width,
            body: '<div style="text-align:center;padding:40px 22px 22px 22px;">' + d.body + "</div>",
            buttons: [{
                name: "confirm",
                title: d.sureText || "确定",
                type: d.dialogDefaultConfig.buttonType || "",
                color: "blue",
                padding: d.dialogDefaultConfig.buttonPadding || ["36px", "36px"],
                click: function () {
                    a.isFunction(d.onSure) === !0 ? d.onSure.call(n._confirmDialog, arguments) !== !1 && n._confirmDialog.hide() : n._confirmDialog.hide()
                }
            }, {
                name: "cancel",
                title: d.cancelText || "取消",
                type: d.dialogDefaultConfig.buttonType || "",
                padding: d.dialogDefaultConfig.buttonPadding || ["36px", "36px"],
                click: function () {
                    a.isFunction(d.onCancel) === !0 ? d.onCancel.call(n._confirmDialog, arguments) !== !1 && n._confirmDialog.hide() : n._confirmDialog.hide()
                }
            }],
            onClose: function () {
                a.isFunction(d.onClose) === !0 ? d.onClose.call(n._confirmDialog, arguments) !== !1 && n._confirmDialog.hide() : n._confirmDialog.hide()
            },
            className: i.className || ""
        };
        return (d.extra || a.isString(d.extra)) && (g.extra = d.extra), null === n._confirmDialog ? n._confirmDialog = new n(g) : (n._confirmDialog.setConfig(g), n._confirmDialog.createButtons(), n._confirmDialog.init()), n._confirmDialog.onCancel = d.onCancel, n._confirmDialog
    }, n._alertDialog = null, n.alert = function (i, t, o) {
        var e;
        if (a.isObject(i) === !0) {
            if (!i.body) throw new Error("[context] 警告内容是必须的！");
            e = i
        } else a.isString(i) === !0 && (e = {body: i, onSure: t});
        e.dialogDefaultConfig = o || {};
        var s = {
            title: e.title || "提示",
            body: '<div style="text-align:center;padding:22px;">' + e.body + "</div>",
            width: e.width || "540px",
            buttons: [{
                name: "confirm",
                title: e.sureText || "确定",
                type: e.dialogDefaultConfig.buttonType || "",
                color: e.dialogDefaultConfig.buttonColor || "",
                click: function () {
                    a.isFunction(e.onSure) === !0 ? e.onSure.call(n._alertDialog, arguments) !== !1 && n._alertDialog.hide() : n._alertDialog.hide()
                }
            }],
            onClose: function () {
                a.isFunction(e.onClose) === !0 ? e.onClose.call(n._alertDialog, arguments) !== !1 && n._alertDialog.hide() : n._alertDialog.hide()
            },
            className: i.className || ""
        };
        return s.noFooter = !1, null === n._alertDialog ? n._alertDialog = new n(s) : (n._alertDialog.setConfig(s), n._alertDialog.createButtons(), n._alertDialog.init()), n._alertDialog.show(), n._alertDialog
    }, n._verifyDialog = null, n.verify = function (i, t, o, s, l, d) {
        var g, c, r = "/api/getvcode?prod=pan", h = function (i) {
            e.get(r + "&t=" + Math.random(), function (t) {
                0 === t.errno ? (c = t.vcode, i(t.img)) : i(!1)
            }, "json")
        };
        a.isObject(i) === !0 ? (g = i, c = g.vcode) : a.isString(i) === !0 && (c = t.vcode, g = {
            title: i,
            img: t.img,
            onSure: o,
            onCancel: s,
            hasError: l
        }), g.dialogDefaultConfig = d || {}, g.title = g.title || "提示", g.body = ['<div class="download-verify" style="margin-top: 10px;padding: 0 28px;text-align: left;font-size: 12px;" id="downloadVerify">', '<div class="verify-body">', '请输入验证码：<input type="text" style="padding: 3px;width: 85px;height: 23px;border: 1px solid #C6C6C6;background-color: white;vertical-align: middle;" class="input-code" maxlength="4">', '<img class="img-code" style="margin-left: 10px;vertical-align: middle;" alt="验证码获取中" src="" width="100" height="30" />', '<a href="javascript:;" style="text-decoration: underline;" class="underline">换一张</a>', "</div>", '<div style="padding-left: 84px;height: 18px;color: #d80000;" class="verify-error">', g.hasError ? "验证码输入错误，请重新输入" : "", "</div>", "</div>"].join("");
        var f = {
            title: g.title,
            body: '<div style="text-align:center;padding:22px;">' + g.body + "</div>",
            width: i.width || n.DEFAULT_CONFIG.width,
            buttons: [{
                name: "confirm",
                title: g.sureText || "确定",
                type: g.dialogDefaultConfig.buttonType || "",
                color: "blue",
                padding: g.dialogDefaultConfig.buttonPadding || ["36px", "36px"],
                click: function () {
                    var i = e("#downloadVerify .input-code"), t = e("#downloadVerify .verify-error"),
                        o = e.trim(i.val());
                    return "" == o ? (t.text("请输入验证码"), void i.focus()) : 4 != o.length ? (t.text("验证码输入错误，请重新输入"), void i.focus()) : (t.text(""), void(a.isFunction(g.onSure) === !0 ? g.onSure(c, o, !0) !== !1 && n._verifyDialog.hide() : n._verifyDialog.hide()))
                }
            }, {
                name: "cancel",
                title: g.cancelText || "取消",
                type: g.dialogDefaultConfig.buttonType || "",
                padding: g.dialogDefaultConfig.buttonPadding || ["36px", "36px"],
                click: function () {
                    a.isFunction(g.onCancel) === !0 ? g.onCancel(arguments) !== !1 && n._verifyDialog.hide() : n._verifyDialog.hide()
                }
            }],
            onClose: function () {
                a.isFunction(g.onClose) === !0 ? g.onClose(arguments) !== !1 && n._verifyDialog.hide() : n._verifyDialog.hide()
            },
            className: i.className || ""
        };
        null === n._verifyDialog ? n._verifyDialog = new n(f) : (n._verifyDialog.setConfig(f), n._verifyDialog.createButtons(), n._verifyDialog.init());
        var u = e("#downloadVerify"), m = u.find(".input-code"), p = u.find(".img-code"), v = u.find(".verify-error");
        return u.find(".underline").click(function () {
            g.img && (h(function (i) {
                p.attr("src", i)
            }), m.focus())
        }), m.blur(function () {
            m.val() && v.text("")
        }).keydown(function (i) {
            if (13 == i.keyCode) {
                try {
                    n._verifyDialog.buttonIns[0].triggerClick()
                } catch (i) {
                }
                return !1
            }
        }).focus(), n._verifyDialog.onCancel = g.onCancel, g.img && g.vcode ? p.attr("src", g.img) : h(function (i) {
            i === !1 ? p.attr("alt", "验证码获取失败") : (g.img = i, p.attr("alt", "点击换一张"), p.attr("src", g.img))
        }), n._verifyDialog
    }, o.exports = n
});
;define("system-core:context/context.js", function (e, t, s) {
    function i(e) {
        e.prototype.file = {
            _defaultPath: "/", list: function (t, s, i) {
                var r = e.getList();
                r && r.cache && (t = t || this._defaultPath, r.cache.getCacheData(i || "list", t, -1, s))
            }, add: function (t, s, i) {
                var r = e.getList();
                if (i || (i = "list"), r && r.cache) {
                    var n, o;
                    if (t = t || this._defaultPath, f.isArray(s) === !0) for (o = s.length; o > 0; o--) n = s[o], r.cache.addDataBefore(i, t, n); else f.isObject(s) === !0 && (n = s, r.cache.addDataBefore(i, t, n))
                }
            }, remove: function (t) {
                var s = e.getList();
                if (s && s.cache) {
                    var i;
                    f.isArray(t) ? s.cache.removeByIndexs(t) : f.isObject(t) && (i = t, s.cache.removeByIndex(i))
                }
            }, update: function (t, s, i) {
                var r = e.getList();
                i || (i = "list"), r && r.cache && (t = t || this._defaultPath, f.isArray(s) === !0 ? r.cache.updateData(i, t, s) : f.isObject(s) === !0 && r.cache.updateData(i, t, [s]))
            }, watchCDNOfPCS: function (e) {
                if ("https:" !== location.protocol) {
                    var t = new Image, s = function (e) {
                        var t = new Image;
                        t.src = "http://dq.baidu.com/nocipher?pid=pcstest&ver=0&type=0&t=" + (new Date).getTime() + "&success=" + e
                    };
                    t.onload = function () {
                        s(0)
                    }, t.onerror = function () {
                        s(1)
                    }, t.src = "//cdn.baidupcs.com" + (e || "/monitor.jpg?xcode=1a81b0bbd448fc368d78cc336e28561a&t=") + (new Date).getTime()
                }
            }
        }
    }

    function r(e) {
        e.setList = function (t) {
            e.instanceForSystem && e.instanceForSystem.setList(t)
        }, e.getList = function () {
            return e.instanceForSystem && e.instanceForSystem.getList()
        }, e.constructorList.push(function () {
            this.listInstance = null
        }), e.prototype.setList = function (e) {
            this.listInstance = e
        }, e.prototype.getList = function () {
            return this.isSystem || this.listInstance ? this.listInstance : e.getList()
        }, e.prototype.list = {
            isLocked: function () {
                return e.getList().isLocked()
            }, goHistory: function (t) {
                return e.getList().goHistory("list", t)
            }, getHistoryPath: function () {
                return e.getList().getHistoryPath()
            }, getSelected: function () {
                return e.getList().getCheckedItems()
            }, getCurrentList: function () {
                return e.getList().getCurrentDataList()
            }, getCurrentPath: function () {
                return e.getList().currentKey
            }, refresh: function () {
                return e.getList().refreshList()
            }, removeCacheByPath: function (t) {
                return e.getList().removeCacheByPath(t)
            }, resize: function () {
                return e.getList().resize()
            }, mapFirstFileByCategory: function (t, s) {
                return e.getList().mapFirstFileByCategory(t, s)
            }, getIndexsByFiles: function (t) {
                return e.getList().getIndexsByFiles(t)
            }, showErrorTips: function (t, s) {
                e.getList().showErrorTips(t, s)
            }, getCurrentPageMode: function () {
                return e.getList().getCurrentPageMode()
            }, addItemToFirst: function (t) {
                return e.getList().addItemToFirst(t)
            }
        }
    }

    function n(t) {
        var s = e("system-core:system/uiService/dialog/dialog.js"), i = e("system-core:system/uiService/tip/tip.js"),
            r = e("system-core:system/uiService/page/page.js"), n = e("system-core:system/uiService/button/button.js"),
            o = e("system-core:system/uiService/loading/loading.js"),
            c = e("system-core:system/uiService/list/list.js"),
            a = e("system-core:system/cache/listCache/cacheManage.js");
        t.prototype.ui = {
            window: s,
            confirm: f.bind(s.confirm, s),
            alert: f.bind(s.alert, s),
            verify: f.bind(s.verify, s),
            tip: i.show,
            hideTip: i.hide,
            page: r,
            contextMenu: function (t, s, i) {
                e.async("system-core:system/uiService/rMenu/rMenu.js", function (e) {
                    e.bind(t, s, i)
                })
            },
            list: c,
            listCache: a.obtainCache,
            cacheManage: a,
            button: n,
            loading: o
        }
    }

    function o(e) {
        var t = {};
        e.prototype.extendErrorMsg = function (e) {
            y.isPlainObject(e) && y.extend(t, e)
        }, e.prototype.errorMsg = function (e, s) {
            return t[String(e)] || s || "未知错误[" + e + "]"
        }, e.prototype.overrideErrorMsg = function (e) {
            if (this.isSystem) throw new TypeError("cannot use system context instance");
            var t = this.errorMsg;
            return this.errorMsg = function (s, i) {
                var r = e[s];
                return r ? r : t(s, i)
            }, this
        }, e.prototype.accountBan = function (e, s) {
            var i = /^9[1-5]\d{2}$/, r = /^9(1|2|5)00$/, n = i.test(e);
            return n && this.ui.tip({
                msg: t[String(e)] || s,
                mode: "caution",
                autoClose: !1,
                hasClose: !r.test(e)
            }), {isBan: n, errno: e}
        }
    }

    function c(e) {
        var t = y.Callbacks();
        e.prototype.size = {
            resize: function (e) {
                f.isFunction(e) && t.add(e)
            }, window: function (e) {
                var s = y(window);
                e.width && f.isNumber(e.width) && s.width(e.width), e.height && f.isNumber(e.height) && s.height(e.height), t.fire()
            }, document: function (e) {
                var s = y(document);
                e.width && f.isNumber(e.width) && s.width(e.width), e.height && f.isNumber(e.height) && s.height(e.height), t.fire()
            }
        }
    }

    function a(e) {
        e.prototype.data = {
            quota: {
                get: function () {
                    return [100, 1e10]
                }, update: function (e) {
                    e(100, 1e10)
                }, hasEnoughSpacing: function () {
                    return !0
                }
            }
        }
    }

    function u(t, s) {
        var i = e("system-core:system/uiService/log/log.js");
        if (t.constructorList.push(function () {
            this.log = this.isSystem ? i.instanceForSystem : new i
        }), !s || s.useUpdateLog !== !1) {
            var r = e("system-core:system/uiService/log/updateLog.js");
            t.constructorList.push(function () {
                this.updateLog = r
            })
        }
    }

    function h(t) {
        var s = e("base:widget/tools/tools.js"), i = e("system-core:system/uiService/motionSensor/motionSensor.js"),
            r = e("system-core:system/uiService/keyGuard/keyGuard.js"),
            n = e("system-core:system/uiService/mouseWheelSensor/mouseWheelSensor.js");
        t.prototype.tools = {baseService: s, motionSensor: i, keyGuard: r, mouseWheelSensor: n}
    }

    function g(t) {
        var s = e("base:widget/storage/storage.js");
        t.prototype.report = function (e) {
            var t, i = new Date, r = i.getFullYear(), n = i.getMonth() + 1, o = i.getDate(), c = r + "-" + n + "-" + o,
                a = s.getItem("reportRecord_" + window.yunData.MYUK), u = {};
            if (a) try {
                u = y.parseJSON(a), t = u[e] && u[e] === c ? !1 : !0
            } catch (h) {
                u = {}, t = !0
            } else t = !0;
            t && (y.ajax({
                url: "/api/report/user",
                method: "POST",
                data: {action: e, timestamp: Math.floor(i.getTime() / 1e3)}
            }), u[e] = c, s.setItem("reportRecord_" + window.yunData.MYUK, y.stringify(u)))
        }
    }

    function d(e) {
        if (!e || e === m.EXTRA_TYPE.ALL) return m.use(i), m.use(r), m.use(n), m.use(o), m.use(c), m.use(u), m.use(a), m.use(h), void m.use(g);
        var t = null;
        switch (e) {
            case m.EXTRA_TYPE.LIST:
                t = r;
                break;
            case m.EXTRA_TYPE.FILE:
                t = i;
                break;
            case m.EXTRA_TYPE.ERROR:
                t = o;
                break;
            case m.EXTRA_TYPE.UI:
                t = n;
                break;
            case m.EXTRA_TYPE.SIZE:
                t = c;
                break;
            case m.EXTRA_TYPE.DATA:
                t = a;
                break;
            case m.EXTRA_TYPE.LOG:
                t = u;
                break;
            case m.EXTRA_TYPE.TOOLS:
                t = h;
                break;
            case m.EXTRA_TYPE.REPORT:
                t = g;
                break;
            default:
                return
        }
        m.use(t, {})
    }

    var f = e("base:widget/libs/underscore.js"), y = e("base:widget/libs/jquerypacket.js"),
        m = e("system-core:context/SystemContext.js");
    m.EXTRA_TYPE = {
        LIST: 1,
        FILE: 2,
        ERROR: 3,
        UI: 4,
        SIZE: 5,
        DATA: 6,
        LOG: 7,
        TOOLS: 8,
        REPORT: 9,
        OTHER: 255,
        ALL: 65535
    }, d(), new m(!0), s.exports = m
});
define("system-core:context/SystemContext.js", function (e, t, s) {
    function o(e) {
        var t = this;
        if (this.isSystem = !!e, r.each(o.constructorList, function (e) {
            e.call(t)
        }), e) {
            if (o.instanceForSystem) return o.instanceForSystem;
            o.instanceForSystem = this, this.message = i, this.pluginControl = c
        } else this.message = new i
    }

    var n = e("base:widget/libs/jquerypacket.js"), r = e("base:widget/libs/underscore.js"),
        i = e("system-core:system/baseService/message/message.js"), c = e("system-core:pluginHub/main.js"),
        a = e("base:widget/router/Router.js").app, u = 0;
    o.instanceForSystem = null, o.constructorList = [], o.extend = function (e, t) {
        if ("object" != typeof e) {
            if ("string" == typeof e && void 0 !== t) if ("object" == typeof t) {
                var s = o.prototype[e];
                if (s) for (var n in t) t.hasOwnProperty(n) && (s[n] = t[n])
            } else o.prototype[e] = t
        } else for (var r in e) e.hasOwnProperty(r) && (o.prototype[r] ? o.extend(r, e[r]) : o.prototype[r] = e[r])
    }, o.use = function (e, t) {
        e(o, t)
    }, r.extend(o.prototype, {
        addIconFont: !1,
        router: a,
        libs: {JQuery: n, $: n, underscore: r, _: r},
        pageInfo: {currentPage: "disk-home", currentProduct: "pan"},
        extend: o.extend,
        obtainId: function () {
            return "_system_id_" + ++u
        }
    }), s.exports = o
});
;define("system-core:pluginHub/invoker/pageLetInvoker.js", function (t, e, i) {
    function o(t) {
        var e = t.size.split("*");
        if (2 !== e.length) throw new Error("wrong size property: ERROR!");
        var i = e[0], o = e[1], n = "<div";
        void 0 !== t.index && (n += ' data-index="' + t.index + '"'), n += ' node-type="layout-absolute-box"', t.containerId && (n += ' id="' + t.containerId + '"'), t.className && (n += ' class="' + t.className + '"');
        var s = ' style="width: ' + i + "; height: " + o + "; background:" + (t.bg || "none") + "; z-index: " + (Number(t.zIndex) || 0) + "; ";
        return t.extra && a.each(t.extra, function (t, e) {
            s += e + ": " + t + "; "
        }), s += '">', r(n + s)
    }

    function n(t) {
        var e = t.selector, i = t.className, o = t.shortestDistance;
        this.count = 0, this.contentElement = r(e);
        var n = i || "absolute-container", s = this.absoluteContainer = r('<div class="' + n + '">').css({
            visibility: "hidden",
            position: "absolute",
            width: "100%"
        });
        this.contentElement.append(s), r(window).resize(a.debounce(function () {
            var t = s.offset().top, e = s.data("isMoved");
            o > t ? (s.data("isMoved", !0), s.css({
                position: "relative",
                bottom: 0
            })) : e && s.css({position: "absolute", bottom: ""})
        }, 500)), r(window).trigger("resize"), this.onPushPageLet = function (t) {
            var e = this.absoluteContainer.height();
            if (this.absoluteContainer.height(e + t.height()), this.count++, 1 === this.count) this.absoluteContainer.append(t); else {
                for (var i, o, n = +t.data("index"), s = this.absoluteContainer.find('div[node-type="layout-absolute-box"]'), a = 0, r = s.length; r > a; a++) if (i = s.eq(a), o = +i.data("index"), o > n) return void i.before(t);
                this.absoluteContainer.append(t)
            }
        }
    }

    function s() {
        this.ready = !1, this.layoutList = {}, this.autoExecCount = -1, this.initedCount = 0
    }

    var a = t("base:widget/libs/underscore.js"), r = t("base:widget/libs/jquerypacket.js");
    s.prototype.setArea = function (t, e) {
        this.layoutList[t] = {layout: e, isUsed: !1}, this.ready = !0
    }, s.prototype.onready = function () {
        r.each(this.layoutList, function (t, e) {
            e.isUsed && e.layout.absoluteContainer.css("visibility", "visible")
        })
    }, s.prototype.addLayout = function (t) {
        if (!this.ready || -1 === this.autoExecCount) throw new Error("please set area firstly");
        if (!t.area) throw new Error("no area property, ERROR!");
        var e = o(t);
        this.initedCount++;
        var i = this.layoutList[t.area];
        return i ? (i.isUsed = !0, i.layout.onPushPageLet(e), this.initedCount === this.autoExecCount && this.onready(), e) : null
    };
    var u = new s;
    i.exports.setAutoExecCount = function (t) {
        u.autoExecCount = t
    }, i.exports.setArea = function (t) {
        r.isArray(t) || (t = [t]), r.each(t, function (t, e) {
            u.setArea(e.name, new n(e))
        })
    }, i.exports.usePageLet = function () {
        return u.ready
    }, i.exports.invoke = function (t) {
        return u.addLayout(t)
    }
});
;define("system-core:pluginHub/data/Registry.js", function (e, n, t) {
    var r = e("base:widget/libs/underscore.js"), i = {};
    i.nameHash = {}, i.otherInfo = {}, i.fileHandle = {
        _: [],
        "*": []
    }, i.defaultFileHandle = {}, i.plugin = {}, i.preload = [], i.autoExecute = [], i.randomID = function () {
        var e = String.fromCharCode(i.prefix++);
        return i.prefix > 90 && (i.prefix = 65), e += Math.random().toString(16).substring(3).toUpperCase()
    }, i.prefix = 65, i.handleFile = function (e, n, t) {
        if (!t) return void i.fileHandle._.push(e);
        if ("*" === t) return void i.fileHandle["*"].push(e);
        t = String(t).replace(/"|\.|\*/g, "").split(",");
        for (var r, l, a = 0, u = t.length; u > a; a++) r = t[a], l = i.fileHandle[r] || (i.fileHandle[r] = []), l.push(e), 2 != n || i.defaultFileHandle[r] || (i.defaultFileHandle[r] = e)
    }, i.getPluginIdsByExtension = function (e) {
        if (!r.isArray(e) || !i.fileHandle[e[0]]) return null;
        for (var n = i.fileHandle[e[0]], t = n.length, l = 1, a = e.length; a > l; l++) {
            if ("undefined" == typeof i.fileHandle[e[l]]) {
                n = null;
                break
            }
            i.fileHandle[e[l]].length < t && (n = i.fileHandle[e[l]], t = t.length)
        }
        if (n) {
            n = r.assign(n);
            for (var u = 0, o = n.length; o > u; u++) for (var s = 0, f = e.length; f > s; s++) {
                var p = i.plugin;
                if (-1 === p[n[u]].filesType.indexOf(e[s]) || -1 === p[n[u]].type.indexOf("2")) {
                    n.splice(u, 1), --u, o = n.length;
                    break
                }
            }
        }
        return n
    }, i.getPluginsByIds = function (e) {
        return r.isArray(e) ? r.map(e, function (e) {
            return i.plugin[e]
        }) : []
    }, t.exports.register = function (e, n) {
        var t = i.randomID(), r = e.name, l = e.group, a = i.nameHash[l] || (i.nameHash[l] = {});
        return a[r] = t, i.plugin[t] = {
            pluginId: t,
            name: r,
            loaded: !1,
            type: e.type,
            filesType: e.filesType,
            entranceFile: e.entranceFile
        }, i.otherInfo[t] = {
            group: l,
            depsFiles: e.depsFiles,
            description: e.description,
            version: e.version,
            supportManage: "false" !== String(e.supportManage)
        }, n ? null : (i.handleFile(t, e.type, e.filesType), e.interface && (e.autoExecute = !0), e.autoExecute ? i.autoExecute.push(e) : e.preload && i.preload.push(e), t)
    }, t.exports.getAllPlugins = function () {
        return r.map(i.plugin, function (e) {
            return e
        })
    };
    var l = t.exports.getPluginById = function (e) {
        return i.plugin[e] || null
    };
    t.exports.getPluginByNameAndGroup = function (e, n) {
        if ("string" != typeof e) throw new Error("[regedit.js] The plugin name is must be a string !");
        if (!n) {
            var t = e.match(/^(.+)@(([\w\-]+\.)+[\w\-]+)$/);
            t && (e = t[1], n = t[2])
        }
        var r = i.nameHash[n] && i.nameHash[n][e];
        return l(r)
    }, t.exports.getPluginsByExtension = function (e) {
        var n = i.fileHandle["*"], t = r.filter(n, function (e) {
            return e.type.indexOf("2") > -1
        });
        "string" == typeof e && (e = e.replace(/"|\.|\*/g, "").split(","));
        var l = i.getPluginIdsByExtension(e);
        return null !== l && (t = t.concat(l)), i.getPluginsByIds(t)
    }, t.exports.getDefaultPluginIdByExtension = function (e) {
        return e = e.replace(/"|\.|\*/g, ""), i.defaultFileHandle[e] ? i.defaultFileHandle[e] : i.fileHandle[e] && i.fileHandle[e][0]
    }, t.exports.getOtherInfoById = function (e) {
        return i.otherInfo[e] || null
    }, t.exports.getAutoExecutePlugins = function () {
        return i.autoExecute
    }, t.exports.getPreloadPlugins = function () {
        return i.preload
    }
});
;define("system-core:system/baseService/message/message.js", function (e, t, s) {
    function n() {
        this.events = {}, this.instanceForSystem = n, this.isSystem = !1
    }

    var i = e("base:widget/libs/underscore.js"), r = /^plugin:.+$/;
    n.events = {}, n.isSystem = !0, n.prototype = {
        constructor: n, _define: function (e) {
            "string" == typeof e && (this.exist(e) || (this.events[e] = {handlers: []}))
        }, exist: function (e) {
            return this.events[e]
        }, listen: function (e, t, s) {
            if ("string" != typeof e) throw new Error("[message] The eventName must be a string !");
            if ("function" == typeof t) {
                this.exist(e) || this._define(e);
                var n = this.events[e];
                i.contains(n.handlers, t) || (s && (t.__isOnce__ = !0), n.handlers.push(t))
            }
        }, once: function (e, t) {
            this.listen(e, t, !0)
        }, remove: function (e, t) {
            this.exist(e) && (this.events[e].handlers = i.isFunction(t) ? i.filter(this.events[e].handlers, function (e) {
                return e !== t
            }) : [], 0 === this.events[e].handlers.length && delete this.events[e])
        }, triggerHandlers: function (e) {
            for (var t = this.events[e], s = t.handlers, n = [].slice.call(arguments, 1), i = 0, r = null, o = s.length; o > i; i++) r = s[i], null !== r && (r.__isOnce__ && (s[i] = null), r.apply(void 0, n))
        }, trigger: function (e) {
            return r.test(e) ? void n.doPlugins(arguments) : this.exist(e) ? void this.triggerHandlers.apply(this, arguments) : void n.doPlugins(arguments)
        }, callPlugin: function (e, t) {
            if ("string" != typeof e) throw new Error("[message] The pluginName must be a string !");
            n.trigger("plugin:" + e, t)
        }, callSystem: function (e, t) {
            if ("string" != typeof e) throw new Error("[message] The systemServiceName must be a string !");
            n.trigger(e, t)
        }, listenSystem: function (e, t, s) {
            n.listen(e, t, s)
        }
    }, i.extend(n, n.prototype, {
        doPlugins: function (e) {
            i.isArguments(e) || (e = arguments), e = [].slice.call(e, 0), e.unshift("managePlugins"), this.triggerHandlers.apply(this, e)
        }, trigger: function (e) {
            return this.exist(e) ? void this.triggerHandlers.apply(this, arguments) : void this.doPlugins(arguments)
        }, manage: function (e) {
            this.listen("managePlugins", e)
        }
    }), s.exports = n
});
;define("system-core:pluginHub/data/BrokerData.js", function (e, t, n) {
    function o(e, t) {
        e.pluginId = t, "object" == typeof e && "undefined" == typeof e.length ? "string" == typeof e.title && ("file" === e.type ? (delete e.type, p.contextMenu.file.push(e)) : (delete e.type, p.contextMenu.blank.push(e)), "share" === e.product && (delete e.product, p.contextMenu.share.push(e))) : e.length && ("undefined" != typeof e[0].index && (e.index = e[0].index), "file" === e[0].type ? (delete e[0].type, p.contextMenu.file.push(e)) : (delete e[0].type, p.contextMenu.blank.push(e)))
    }

    function u(e) {
        return p.button[e] || []
    }

    var i = e("base:widget/libs/underscore.js"),
        p = {button: {}, fileIcon: {}, "interface": [], contextMenu: {file: [], blank: [], share: []}};
    n.exports.pushPageLet = function (e, t) {
        p["interface"].push(i.extend({pluginId: e}, t))
    }, n.exports.pushButtonFunction = function (e, t) {
        if (!e) throw new Error("pushButtonFunction must be have a pluginId");
        i.isArray(t) || (t = [t]), i.each(t, function (t) {
            t.pluginId = e;
            var n = t.position;
            n && (t.position = void 0, i.each(n.split(","), function (e) {
                (p.button[e] || (p.button[e] = [])).push(t)
            }))
        })
    }, n.exports.pushFileHandle = function (e) {
        i.extend(p.fileIcon, e)
    }, n.exports.pushContextMenu = function (e, t) {
        if ("object" == typeof t && "undefined" == typeof t.length) o(t, e); else if (t.length) if (1 === t.length && "string" == typeof t[0].title) o(t, e); else for (var n = 0, u = t.length; u > n; n++) o(t[n], e)
    }, n.exports.getButton = u, n.exports.getAllData = function () {
        return p
    };
    var r = i.extend({getButton: u}, p);
    n.exports.getFaceData = function () {
        return r
    }, n.exports.getMenu = function (e) {
        return p.contextMenu[e] || []
    }
});
;define("system-core:pluginHub/invoker/invoker.js", function (e, n, t) {
    function i(e) {
        return (e.match(l) || e.match(f) || [""]).slice(1)
    }

    function s(n, t) {
        function i() {
            e.async(n.entranceFile, function (e) {
                n.loaded = !0, r.isFunction(t) && t(e)
            })
        }

        if (n.loaded) return i();
        var s = a.getOtherInfoById(n.pluginId).depsFiles;
        if ("" === s || void 0 === s) return void i();
        var u = [], o = [];
        r.isArray(s) || (s = [s]), r.each(s, function (e) {
            /^.+\.(css|less)$/.test(e) ? u.push(e) : /^.+\.js$/.test(e) && o.push(e)
        });
        var c = !!u.length, g = !!o.length;
        c && g ? e.loadCss(u, function () {
            e.async(o, function () {
                i()
            })
        }) : c ? e.loadCss(u, function () {
            i()
        }) : g ? e.async(o, function () {
            i()
        }) : i()
    }

    function u(e, n) {
        n || (n = {});
        var t = g.usePageLet();
        s(e, function (i) {
            var s = i[n.run || "start"];
            s || (s = i.start);
            var u = d[e.pluginId] || (d[e.pluginId] = new o(!1));
            return t ? void(e.interface ? s(u, {$container: g.invoke(e.interface)}) : s(u, n)) : s(u, n)
        })
    }

    var r = e("base:widget/libs/underscore.js"), o = e("system-core:context/SystemContext.js"),
        c = e("system-core:system/baseService/message/message.js"), a = e("system-core:pluginHub/data/Registry.js"),
        g = e("system-core:pluginHub/invoker/pageLetInvoker.js"), l = /^plugin:([A-Z0-9]+)$/,
        f = /^plugin:((\S+)@(\S+))$/, d = {}, v = t.exports.execPlugin = function (e, n) {
            if (e) {
                if (r.isString(e)) {
                    var t = i(e), s = t.length;
                    if (!s) return;
                    e = 3 === s ? a.getPluginByNameAndGroup(t[1], t[2]) : a.getPluginById(t)
                }
                e && e.pluginId && u(e, n)
            }
        };
    c.listen("managePlugins", v), t.exports.invoke = function (e) {
        if (e || (e = {}), e.canAutoExecute !== !1) {
            var n = a.getAutoExecutePlugins(), t = r.filter(n, function (e) {
                return !(e.interface && e.autoExecute)
            });
            g.usePageLet() ? g.setAutoExecCount(n.length - t.length) : n = t, r.each(n, u), setTimeout(function () {
                r.each(a.getPreloadPlugins(), s)
            }, 1e3)
        }
    }
});
;define("system-core:pluginHub/register/register.js", function (require, exports, module) {
    function preLoadManifest() {
        var manifests = window.manifest;
        return _.filter(manifests, function (manifest) {
            var ignore = manifest.ignore;
            return _.isString(ignore) && (ignore = eval(ignore)), !ignore
        })
    }

    var storage = require("base:widget/storage/storage.js"), tools = require("base:widget/tools/tools.js"),
        _ = require("base:widget/libs/underscore.js"), BrokerData = require("system-core:pluginHub/data/BrokerData.js"),
        Registry = require("system-core:pluginHub/data/Registry.js"), browserString = tools.client().browserString,
        browserName = browserString.match(/[a-zA-Z]+/);
    browserName && (browserName = new RegExp("(^|,)" + browserName[0] + "(,|$)")), module.exports.injectPlugin = function () {
        var e = preLoadManifest();
        if (e) for (var r, t, s, n = 0, o = e.length; o > n; n++) r = e[n], t = r.notSupport, s = "", t && (~t.indexOf(browserString) || browserName && browserName.test(t)) || "string" == typeof r.name && "string" == typeof r.group && (_.isObject(r.filesIcon) && BrokerData.pushFileHandle(r.filesIcon), !/^-\d$/.test(r.type) && r.entranceFile && (s = r.pluginId = Registry.register(r), r.interface && BrokerData.pushPageLet(s, r["interface"]), _.isArray(r.buttons) && BrokerData.pushButtonFunction(s, r.buttons), r.contextMenu && BrokerData.pushContextMenu(s, r.contextMenu)))
    }
});
;define("system-core:pluginHub/main.js", function (e, t, n) {
    var a = e("system-core:pluginHub/data/Registry.js"), s = e("system-core:pluginHub/data/BrokerData.js"),
        r = e("system-core:pluginHub/register/register.js"), i = e("system-core:pluginHub/invoker/pageLetInvoker.js");
    n.exports = {
        BrokerData: s, Registry: a, init: function (t) {
            r.injectPlugin(), e.async("system-core:pluginHub/invoker/invoker.js", function (e) {
                e.invoke(t)
            })
        }, setArea: i.setArea, getFaceData: s.getFaceData
    }, n.exports.setButtonContainer = function () {
    }, n.exports.pluginData = n.exports.getPluginData = function () {
        return a
    }, define("system-core:data/faceData.js", function (e, t) {
        t.getData = s.getFaceData
    }), define("system-core:data/regedit.js", function (e, t, n) {
        n.exports = a
    })
});
define("system-core:pluginHub/Broker/deps/processor.js", function (require, exports, module) {
    function handleMeta(metaValue, fileMetaList) {
        var isEqual = !0;
        /^!/.test(metaValue) && (metaValue = metaValue.slice(1), isEqual = !1), /^\$/.test(metaValue) && (metaValue = eval(metaValue.replace(/^\$/, "window.")));
        var canUse = !0;
        return $.each(fileMetaList, function (e, r) {
            return "*" === metaValue && void 0 !== r ? !0 : isEqual && metaValue !== r || !isEqual && metaValue === r ? canUse = !1 : void 0
        }), canUse
    }

    function condCheck(e, r) {
        var t = !1;
        return $.each(e, function (a) {
            var n = conditionTypes[a];
            return n && (t = n(e, r)), t ? !1 : void 0
        }), t
    }

    var $ = require("base:widget/libs/jquerypacket.js"), _ = require("base:widget/libs/underscore.js"),
        router = require("base:widget/router/Router.js").app, tools = require("base:widget/tools/tools.js"),
        conditionTypes = {
            filesType: function (e, r) {
                var t = r.length;
                if (!t) return !0;
                for (var a = e.filesType, n = a.split(","), i = !!e.filesTypeStrongMatch, u = "", o = 0, s = t; s > o; o++) {
                    var l = r[o];
                    if (u = tools.getFileCategory(l.server_filename || l.file_name), !u || 1 === +l.isdir) return !0;
                    if (i) {
                        if (!~n.indexOf(u, n)) return !0
                    } else if (!~a.indexOf(u)) return !0
                }
                return !1
            }, pageModule: function (e) {
                var r = e.pageModule, t = router.currentRouteName;
                return r && "*" !== r && -1 === r.indexOf(t)
            }, meta: function (e, r) {
                if (!r.length) return !0;
                var t = e.meta;
                _.isArray(t) || (t = [t]);
                var a = !0;
                return $.each(t, function (e, t) {
                    var n = !0;
                    return $.each(t, function (e, t) {
                        return handleMeta(t, _.pluck(r, e)) ? void 0 : n = !1
                    }), n ? a = !1 : void 0
                }), a
            }, filesLimit: function (e, r) {
                var t = e.filesLimit, a = r.length, n = "===", i = +t;
                if (_.isString(t) && /^[<>]=?/.test(t)) {
                    n = t.charAt(0);
                    var u = "=" === t.charAt(1);
                    u && (n += "=");
                    var o = 1 + Number(u);
                    i = parseInt(t.substring(o), 10)
                }
                var s = !0;
                return "===" === n && (s = a === t), "<" === n && (s = i > a), "<=" === n && (s = i >= a), ">" === n && (s = a > i), ">=" === n && (s = a >= i), !s
            }, excludeDirType: function (e, r) {
                var t = e.excludeDirType, a = r.length;
                if (t && a) for (var n = new RegExp("^" + t.replace(/,/g, "|") + "$"), i = 0, u = "", o = a; o > i; i++) if (u = r[i].path, u && n.test(u.substring(u.lastIndexOf("/") + 1))) return !0;
                return !1
            }, path: function (e) {
                var r = (location.hash.match(/path=([^?&=\/]+)/) || [, ""])[1];
                r = decodeURIComponent(r);
                var t = e.path, a = "equal", n = t;
                return t.indexOf("!") > -1 && (a = "noEqual", n = t.slice(1)), "equal" === a ? n !== r : n === r
            }
        };
    module.exports = function (e, r) {
        r || (r = []), _.isArray(e) || (e = [e]);
        var t = !1;
        return $.each(e, function (e, a) {
            return t = condCheck(a, r), t ? void 0 : !1
        }), t
    }
});
;define("system-core:pluginHub/Broker/deps/XButtonBox.js", function (require, exports, module) {
    function getBoxContext(t, n) {
        return '<div class="' + t + '" style="position:absolute;top:0;line-height:normal;padding-top:' + n + ';"></div>'
    }

    function XButtonBox(t, n) {
        return this instanceof XButtonBox ? (this.config = t = _.extend({
            name: "",
            className: "x-button-box",
            limit: 10,
            buttons: null,
            container: null,
            containerWidth: 0,
            alwaysShow: !1,
            autoWidth: !1,
            paddingLeft: !1,
            resize: !1,
            autoHide: !1,
            hideWhenAllButtonDisable: !1,
            cachePaddingLeft: !0
        }, t), this.events = n || {}, this.name = t.name, this.buttonsData = t.buttons || getButtons(this.name) || [], this.buttons = [], this.buttonsInMore = [], this.moreButton = null, this.$container = $(t.container).css({
            "white-space": "nowrap",
            position: "relative"
        }), this.$positionMark = $(MARK), this.$separateMask = $(separateMask), this.$box = $(getBoxContext(t.className, this.$container.css("padding-top"))), this.$container.append(this.$positionMark), this.$container.append(this.$box), this.$box.prepend(this.$separateMask), this.containerOffsetLeft = -1, this._initData(), XButtonBox.instances.push(this), this.config.autoHide && this.hide(), void this._emitEvent("ready")) : new XButtonBox(t, n)
    }

    function showRedLightIcon(t, n) {
        return t ? (_.isArray(t) || (t = [t]), _.some(t, function (t) {
            for (var o in t) if (t.hasOwnProperty(o)) {
                var i = t[o], e = n[o];
                if ("*" === i && (i = e), i !== e || void 0 === e) return !1
            }
            return !0
        })) : !1
    }

    var $ = require("base:widget/libs/jquerypacket.js"), _ = require("base:widget/libs/underscore.js"),
        processor = require("system-core:pluginHub/Broker/deps/processor.js"),
        context = require("system-core:context/SystemContext.js").instanceForSystem, Message = context.message,
        getButtons = context.pluginControl.BrokerData.getButton,
        MARK = '<div class="button-box-mark" style="display:inline-block;*display:inline;*zoom:1;width:1px;height:1px;line-height:0;"></div>',
        separateMask = '<div style="display:none;width:100%;height:100%;z-index:30;position:absolute;top:0;left:0;"></div>',
        GRAY_SHOW = "GRAY_SHOW", COOL_SHOW = "COOL_SHOW", SAD_HIDE = "SAD_HIDE";
    XButtonBox.instances = [], XButtonBox.filesSelect = function (t) {
        for (var n = 0, o = XButtonBox.instances.length; o > n; n++) XButtonBox.instances[n].filesSelect(t)
    }, XButtonBox.prototype.on = function (t, n) {
        if (t && _.isFunction(n)) {
            var o = this.events[t];
            o ? _.isArray(o) ? this.events[t].push(n) : this.events[t] = [o, n] : this.events[t] = [n]
        }
    }, XButtonBox.prototype.emit = XButtonBox.prototype._emitEvent = function (t) {
        if (t) {
            var n = this.events[t];
            if (n) {
                var o = this, i = [].slice.call(arguments, 1);
                _.isArray(n) ? _.each(n, function (t) {
                    t.apply(o, i)
                }) : n.apply(o, i)
            }
        }
    }, XButtonBox.prototype._initData = function () {
        var that = this;
        this.buttonsData = _.chain(this.buttonsData).sortBy("index").filter(function (button) {
            return button.yunData ? _.isString(button.yunData) ? eval(button.yunData) : _.isObject(button.yunData) ? _.isMatch(yunData, button.yunData) : !0 : !0
        }).each(function (t, n) {
            that._bindButtonEvents(t), that._makeButtonInstance(t, n)
        }).value(), this.buttonsRender(), this._initMoreButton(), this.config.resize && $(window).bind("resize", _.throttle(function () {
            that.$container.width() && that.$box.width() && that._buttonsArrangement()
        }, 300))
    }, XButtonBox.prototype._bindButtonEvents = function (t) {
        var n = null;
        if (t.click || t.link || "dropdown" === t.type ? _.isString(t.click) && (n = {
            run: t.click,
            config: t
        }) : n = {run: t.action, config: t}, n && (t.click = function (o) {
            o = "object" == typeof o ? $.extend({}, n, o) : n, Message.trigger("plugin:" + t.pluginId, o), _.isString(t.log) && context.log.send({type: t.log})
        }), _.each(["mouseEnter", "mouseLeave", "beforeOpen", "beforeClose"], function (n) {
            var o = t[n];
            _.isString(o) && (t[n] = function (n) {
                n = "object" == typeof n ? $.extend({}, {run: o}, n) : {run: o}, Message.trigger("plugin:" + t.pluginId, n)
            })
        }), _.isString(t.menu)) {
            var o = t.menu;
            t.menu = function (n, i) {
                Message.trigger("plugin:" + t.pluginId, {run: o, dom: n, format: i})
            }
        }
        return "dropdown" === t.type && "object" == typeof t.menu && t.menu.length && _.each(t.menu, function (n) {
            if (_.isString(n.click)) {
                var o = n.click;
                n.click = function (n) {
                    n = "object" == typeof n ? $.extend({}, {run: o}, n) : {run: o}, Message.trigger("plugin:" + t.pluginId, n)
                }
            }
        }), t
    }, XButtonBox.prototype._makeButtonInstance = function (t, n) {
        var o = t.conditions || {};
        /<%.+%>/.test(t.title) && (t.title = _.template(t.title)());
        var i = o.filesType, e = i && i.length < 2;
        e && (t.conditions = _.omit(o, "filesType"));
        var s = context.ui.button(t);
        s.index = n, s.inMore = !1, this.buttons.push(s), s.appendTo(this.$box), this.buttonsInMore.push({
            title: t.title,
            symLink: s,
            click: t.click,
            icon: t.icon,
            display: "none",
            isShow: !1
        })
    }, XButtonBox.prototype._initMoreButton = function () {
        this.moreButton = context.ui.button({
            type: "dropdown",
            title: "更多",
            resize: !0,
            display: "none",
            menu: this.buttonsInMore,
            icon: "icon-more"
        }).appendTo(this.$box), this.moreButton.dom.addClass("tools-more")
    }, XButtonBox.prototype._getContainerPadding = function () {
        var t = parseInt(this.$container.css("padding-right"), 10);
        return isNaN(t) ? 0 : t
    }, XButtonBox.prototype._getContainerWidth = function () {
        this.config.cachePaddingLeft === !1 ? this.containerOffsetLeft = this.$positionMark.position().left : -1 === this.containerOffsetLeft && (this.containerOffsetLeft = this.$positionMark.position().left);
        var t = this.containerOffsetLeft, n = this.config.paddingLeft;
        n = n === !1 ? t : n;
        var o = 0;
        o = this.$container.is(":hidden") ? $(".list-header-operate").innerWidth() : this.$container.innerWidth();
        var i = o - this._getContainerPadding() - (n || t);
        this.$box.css("padding-left", n), this.$box.width(this.config.autoWidth ? "auto" : i);
        var e = this.config.containerWidth;
        return e = _.isFunction(e) ? e() : e, 0 >= i && e ? e : i
    }, XButtonBox.prototype._getMoreBtnIndex = function () {
        function t(n) {
            var s = o.buttons[n];
            if (!s) return -1;
            s.status !== SAD_HIDE && (r -= s.width);
            var a = i - r;
            return a >= e ? n : t(n - 1)
        }

        for (var n, o = this, i = this._getContainerWidth(), e = this.moreButton.width, s = this.buttons.length, r = 0, a = 0, u = 0; s > u && (n = this.buttons[u], n.status !== SAD_HIDE && (r += n.width, a++), !(a > this.config.limit)) && !(r > i); u++) ;
        return s > u ? t(u) : 1 / 0
    }, XButtonBox.prototype._buttonsArrangement = function () {
        for (var t, n = this.buttons.length, o = this._getMoreBtnIndex(), i = 0, e = !1; n > i; i++) t = this.buttons[i], e || (e = i >= o), e && t.hide(), t.inMore = e, this.moreButton.menuShow(i, e && t.status !== SAD_HIDE), this.moreButton.menuDisable(i, t.status !== COOL_SHOW);
        var s = 1 / 0 !== o;
        s ? (this.moreButton.dom.prev().removeClass("last-button"), this.moreButton.show()) : (this.moreButton.dom.prev().addClass("last-button"), this.moreButton.hide())
    }, XButtonBox.prototype._disableButton = function (t, n) {
        var o = "";
        n === !1 ? (t.disable(!1).show(), o = COOL_SHOW) : "disable" === t.config.disabled ? (t.disable().show(), o = GRAY_SHOW) : (t.hide(), o = SAD_HIDE), t.status = o
    }, XButtonBox.prototype.getContent = function () {
        return this.$container.html()
    }, XButtonBox.prototype.triggerClick = function (t, n) {
        t = parseInt(t, 10);
        var o = this.buttons[t];
        o && o.triggerClick(n), this._emitEvent("buttonClick");
        var i = n && n.position && n.position[0];
        if (o.hasRedLightIconHtml && void 0 !== i) {
            var e = context.getList().getListItemDomByPostion(i), s = $(e).find(".operate"), r = s.find(".show-icon");
            r.length && r.removeClass("show-icon")
        }
    }, XButtonBox.prototype.filesSelect = function (t, n) {
        n && n.paddingLeft && (this.config.paddingLeft = n.paddingLeft), this.resizeButtons(t), this._emitEvent("filesSelect", t)
    }, XButtonBox.prototype.hide = function () {
        this.$box.hide()
    }, XButtonBox.prototype.show = function () {
        this.$box.show()
    }, XButtonBox.prototype.buttonsRender = function () {
        _.each(this.buttons, function (t) {
            if (t.dom.length) {
                var n = this.buttonsData[t.index];
                _.isFunction(n.render) ? n.render({
                    $dom: t.dom,
                    button: t
                }) : _.isString(n.render) && Message.trigger("plugin:" + n.pluginId, {
                    run: n.render,
                    $dom: t.dom,
                    button: t
                })
            }
        }, this)
    }, XButtonBox.prototype.lock = function (t) {
        t ? this.$separateMask.show() : this.$separateMask.hide()
    }, XButtonBox.prototype.resizeButtons = function (t) {
        var n = this.config.alwaysShow;
        n || (this.$box.addClass("opacity-button-box"), this.$box.css({visibility: "hidden", width: 0}));
        var o = !1, i = !0;
        _.each(this.buttons, function (n) {
            var e = n.config.conditions || {};
            if (e.change) {
                var s = n.index, r = t.length - e.change.filesCount, a = e.change.changeInfo, u = "eq";
                r > 0 ? u = "gt" : 0 > r && (u = "lt");
                var h = a[u];
                if (h) {
                    var c = this.buttonsInMore[s];
                    c.icon = h.icon, c.title = h.title;
                    var d = this.moreButton._renderMenuOne(c);
                    this.moreButton.dom.find("a.g-button-menu").eq(s).replaceWith(d), n.change(h)
                }
            }
            var l = processor(e, t);
            i = i && l, this._disableButton(n, l), !l && n.hasRedLightIconHtml && (o = this.checkItemRedLightIconShow(n, t))
        }, this), this.showRedPotAtMore(o), this._buttonsArrangement(), this.$box.removeClass("opacity-button-box"), t && t.length && this.$box.css("visibility", "visible"), this.config.hideWhenAllButtonDisable && i ? this.hide() : this.show(), this._emitEvent("resizeButtons")
    }, XButtonBox.prototype.checkItemRedLightIconShow = function (t, n) {
        if (1 === n.length) {
            var o = showRedLightIcon(t.config.redLightIcon, n[0]), i = t.inMore && t.status === COOL_SHOW, e = t.index,
                s = "b-menu" + e;
            this.buttonsInMore[e].showRedLightIcon = t.showRedLightIcon = o;
            var r = o ? "addClass" : "removeClass";
            return i ? this.moreButton.dom.find('[data-menu-id="' + s + '"] .button-red-light-icon')[r]("show-icon") : t.dom.find(".button-red-light-icon")[r]("show-icon"), i && o
        }
    }, XButtonBox.prototype.showRedPotAtMore = function (t) {
        this.moreButton.dom.find(".tools-more-red-light-icon")[t ? "addClass" : "removeClass"]("show-icon")
    }, module.exports = XButtonBox
});
;define("system-core:pluginHub/Broker/deps/XMenu.js", function (e, n, t) {
    function o(e, n) {
        var t = null;
        e.nextMenu || e.variableMenu || e.length ? "string" == typeof e.variableMenu && (t = e.variableMenu, e.variableMenu = function (e, o) {
            a.trigger("plugin:" + n, {dom: e, format: o, run: t})
        }) : e.action ? "string" == typeof e.action && (t = e.action, e.action = function (o) {
            a.trigger("plugin:" + n, {run: t, dom: o}), "string" == typeof e.log && u.log.send({type: e.log})
        }) : e.action = function () {
            a.trigger("plugin:" + n), "string" == typeof e.log && u.log.send({type: e.log})
        }, e.conditions && (e.display = function () {
            var n = u.getList().getCheckedItems(), t = e.conditions, o = s(t, n);
            return o === !0 ? "disable" === e.disabled ? "disable" : !1 : !0
        })
    }

    function i(e, n) {
        var t = n.middle ? n.middle.slice(0) : [], i = n.bottom ? n.bottom.slice(0) : [],
            s = n.top ? n.top.slice(0) : [];
        return r.chain(e).sortBy("index").filter(function (e) {
            var n = e.conditions;
            return n && n.templateVar ? r.isMatch(d, n.templateVar) : !0
        }).each(function (e) {
            "middle" === e.position ? t.push(e) : "bottom" === e.position ? i.push(e) : s.push(e), e.length ? r.each(e, function (n) {
                o(n, e.pluginId)
            }) : o(e, e.pluginId)
        }), s.push(t, i), s
    }

    var r = e("base:widget/libs/underscore.js"), s = e("system-core:pluginHub/Broker/deps/processor.js"),
        u = e("system-core:context/SystemContext.js").instanceForSystem, a = u.message, l = u.ui.contextMenu,
        c = u.pluginControl.BrokerData.getMenu, d = window.yunData;
    t.exports.bindContextMenu = function (e) {
        var n = e.target, t = e.config, o = e.type, r = e.events, s = o ? c(o) : [];
        t || (t = {middle: [], bottom: [], top: []});
        var u = i(s, t);
        n && u && r && l(n, u, {beforeMenu: r.beforeMenu, afterMenu: r.afterMenu, menuHide: r.menuHide})
    }
});
;define("system-core:pluginHub/Broker/Broker.js", function (e, n, r) {
    var t = e("base:widget/libs/underscore.js"), o = e("system-core:pluginHub/Broker/deps/XMenu.js"),
        u = e("system-core:pluginHub/Broker/deps/XButtonBox.js"), s = Object.create ? Object.create(null) : {};
    r.exports.initMenuBroker = function (e) {
        o.bindContextMenu(e)
    }, r.exports.initButtonBroker = function (e) {
        return t.isArray(e) || (e = [e]), t.each(e, function (e) {
            var n = e.config;
            n.name = e.name, s[e.name] = u(n, e.events)
        }), 1 === e.length ? s[e[0].name] : void 0
    }, r.exports.getButtonBroker = function (e) {
        return s[e]
    }
});
define("system-core:system/uiService/rMenu/rMenu.js", function (e, t, n) {
    var i = e("base:widget/libs/underscore.js"), o = e("base:widget/libs/jquerypacket.js"), a = {
        domConf: {},
        eventConf: {},
        menus: {},
        keyBoard: {},
        currentShowId: void 0,
        currentMenuTarget: null,
        tempHtml: "",
        tempForCurrentRenderId: void 0,
        subMenuShowTime: 200,
        subMenuLoad: null,
        zIndex: 100,
        onMenuHide: null
    }, l = function (e, t, n, i) {
        var o = function (e) {
            void 0 === e && (e = window.event), void 0 === e.stopPropagation && (e.stopPropagation = function () {
                e.cancelBubble = !0
            }), void 0 === e.preventDefault && (e.preventDefault = function () {
                e.returnValue = !1
            }), n(e)
        };
        e.addEventListener ? e.addEventListener(t, o, !!i) : e.attachEvent ? e.attachEvent("on" + t, o) : e["on" + t] = o
    };
    a.contextMenu = function (e, t, n, i) {
        if (e = e || window.event, a.currentMenuTarget = e.target || e.srcElement, a.eventConf = i, !i || "function" != typeof i.beforeMenu || i.beforeMenu.call(a.currentMenuTarget) !== !1) {
            e.cancelBubble = !0, e.stopPropagation && e.stopPropagation();
            var o = n.getAttribute("data-cid");
            o || (o = a.getRandomId(), n.setAttribute("data-cid", o)), a.domConf[o] || (a.tempForCurrentRenderId = o, a.domConf[o] = a.createMenu(t, o)), a.checkDisplay(a.domConf[o]), a.caculatePosition(e, a.domConf[o]), a.showMenu(o), i && "function" == typeof i.afterMenu && i.afterMenu.call(a.currentMenuTarget), i && "function" == typeof i.menuHide && (a.onMenuHide = i.menuHide)
        }
    }, a.getRandomId = function (e) {
        return (e || "m") + Math.random().toString().replace(".", "")
    }, a.renderOneList = function (e, t) {
        if (!e || !e.title) return "";
        e.id = a.getRandomId("i"), a.menus[e.id] = e;
        var n = "",
            i = "[object Array]" === Object.prototype.toString.call(e.nextMenu) && e.nextMenu.length ? ' class="has-more arrowicon"' : "",
            o = "function" == typeof e.display ? ' data-check-display="true"' : "";
        if ("function" == typeof e.variableMenu && (i = ' class="has-more arrowicon" data-variable-menu="true"'), n += '<li id="' + e.id + '"' + i + o + ' data-group="' + t + '">', "string" == typeof e.icon && e.icon.length) n += /background:url\(/.test(e.icon) ? '<em class="icon" style=\'' + e.icon + "'></em><em class=\"icon-hover\" style='" + e.icon + "'></em>" : '<em class="icon ' + e.icon + '"></em><em class="icon-hover ' + e.icon + '"></em>'; else if ("object" == typeof e.icon && e.icon.length) try {
            for (var l = 0; l < e.icon.length; l++) {
                var r = 0 === l ? "icon" : "icon-hover";
                n += /background:url\(/.test(e.icon[l]) ? '<em class="' + r + "\" style='" + e.icon[l] + "'></em>" : '<em class="' + r + " " + e.icon[l] + '"></em>'
            }
        } catch (c) {
        }
        if (n += e.title, e.keyboard && 1 === e.keyboard.length) {
            var s = e.keyboard.toUpperCase();
            a.keyBoard[a.tempForCurrentRenderId] || (a.keyBoard[a.tempForCurrentRenderId] = {}), a.keyBoard[a.tempForCurrentRenderId][s] || (n += "(" + s + ")", a.keyBoard[a.tempForCurrentRenderId][s] = e.id)
        }
        return "" !== i && (n += a.renderHtml(e.nextMenu)), n += "</li>"
    }, a.renderHtml = function (e, t) {
        var n = "", o = /"separate" data-group="\d+"><\/li>$/;
        if (i.isArray(e)) {
            t || (n += '<ul class="list">');
            var l = 0;
            i.each(e, function (e) {
                i.isArray(e) ? e.length ? (n.match(o) || (n += '<li class="separate" data-group="' + l++ + '"></li>'), i.each(e, function (e) {
                    n += a.renderOneList(e, l)
                }), n += '<li class="separate" data-group="' + l++ + '"></li>') : 0 === e.length && (n.match(o) || (n += '<li class="separate" data-group="' + l++ + '"></li>')) : n += a.renderOneList(e, l)
            }), n = n.replace(/<li\sclass="separate" data-group="\d+"><\/li>$/i, ""), n = n.replace(/^<li\sclass="separate" data-group="\d+"><\/li>/i, ""), t || (n += "</ul>")
        } else n += '<ul class="list"></ul>';
        return n
    }, a.createMenu = function (e) {
        var t = document.createElement("div");
        return t.className = "context-menu", t.id = a.tempForCurrentRenderId, document.body.appendChild(t), a.tempHtml = "", t.innerHTML = a.renderHtml(e), a.eventDelegate(t, ".has-more", "mouseover", a.showSubList), a.eventDelegate(t, ".has-more", "mouseout", a.hideSubList), a.eventDelegate(t, "li", "mouseover", a.hideSilibingsList), a.eventDelegate(t, "li", "click", a.listAction), a.eventDelegate(t, ".list", "click", a.variableMenuAction), a.eventDelegate(t, ".list", "mouseover", function (e) {
            e.stopPropagation()
        }), t.children[0].style.zIndex = a.zIndex, l(t, "contextmenu", function (e) {
            e.stopPropagation(), e.preventDefault()
        }), l(t, "click", function (e) {
            e.stopPropagation()
        }), l(t, "mouseover", function (e) {
            e.stopPropagation()
        }), l(t, "mouseout", function (e) {
            e.stopPropagation()
        }), l(t, "mousedown", function (e) {
            e.stopPropagation()
        }), l(t, "mouseup", function (e) {
            e.stopPropagation()
        }), t.children[0]
    }, a.asyncRenderSubList = function (e, t) {
        "object" == typeof e && e.length && (t.innerHTML = a.renderHtml(e, !0)), a.checkDisplay(t)
    }, a.showSubList = function (e) {
        clearTimeout(a.subMenuLoad);
        var t = this;
        this.className.match(/\sdisable(\s|$)/) || (a.subMenuLoad = setTimeout(function () {
            if ("true" === t.getAttribute("data-variable-menu")) {
                var n = t.id, i = a.menus[n].variableMenu(t.children[0], function (e) {
                    a.asyncRenderSubList(e, t.children[0])
                });
                a.asyncRenderSubList(i, t.children[0])
            }
            t.className.match(/\sopen(\s|$)/) || (t.className = t.className + " open", t.style.zIndex = a.zIndex + 3, a.checkDisplay(t.children[0]), a.caculatePosition(e, t.children[0], t))
        }, a.subMenuShowTime))
    }, a.hideSilibingsList = function () {
        var e;
        e = this === a ? a.domConf[a.currentShowId].children : this.parentElement.children;
        for (var t, n = 0, i = e.length; i > n; n++) t = e[n], t !== this && t.className.match(/\sopen(\s|$)/) && (t.className = t.className.replace(/\s+open(\s|$|\"|\')/g, "$1"), t.style.zIndex = a.zIndex + 2, t.children[0].style.display = "none", t.children[0].innerHTML = t.children[0].innerHTML.replace(/\s+open(\s|$|\"|\')/g, "$1").replace(/display\s*\:\s*block\s*;?/g, "display:none;"))
    }, a.listAction = function () {
        if (this.id && a.menus[this.id]) {
            var e = document.getElementById(this.id);
            if (e.className.match(/\sdisable(\s|$)/)) return;
            e.className.match(/(^|\s)has\-more(\s|$)/) || a.hideMenu(), "function" == typeof a.menus[this.id].action && (a.eventConf && "function" == typeof a.eventConf.listItemClickBefore && a.eventConf.listItemClickBefore.call(a.currentMenuTarget, a.menus[this.id], "click"), a.menus[this.id].action.call(a.currentMenuTarget, e))
        }
    }, a.variableMenuAction = function () {
        "true" === this.parentNode.getAttribute("data-variable-menu") && a.hideMenu()
    }, a.hideSubList = function () {
        clearTimeout(a.subMenuLoad)
    }, a.showMenu = function (e) {
        a.currentShowId && (a.domConf[e].style.display = "none"), a.domConf[e].style.display = "block";
        var t = o(a.domConf[e]).find(">li:visible").length;
        0 >= t && (a.domConf[e].style.display = "none"), a.currentShowId = e
    }, a.checkDisplay = function (e) {
        !e && a.currentShowId && (e = a.domConf[a.currentShowId]);
        for (var t, n = e.children, i = o(n[n.length - 1]).data("group"), l = o(e).find('>li[data-group="0"]').length, r = o(e).find('>li[data-group="' + i + '"]').length, c = 0, s = n.length; s > c; c++) if (t = n[c], "true" === t.getAttribute("data-check-display")) {
            var u = t.id;
            if ("function" == typeof a.menus[u].display) {
                var d = o(t).data("group"), m = a.menus[u].display.call(a.currentMenuTarget);
                if (m !== !1) {
                    var p = a.getPreviousHidenSeparate(t);
                    "disable" === m ? (p && (p.style.display = "block"), -1 === t.className.indexOf(" disable") && (t.className = t.className + " disable"), t.style.display = "block") : (1 === d && 1 >= l || p && (p.style.display = "block"), t.className = t.className.replace(/(\sdisable)+(?=\s|$)/gi, ""), t.style.display = "block")
                } else {
                    var h = a.getPreviousVisibleSeparate(t), f = a.getNextVisibleSeparate(t);
                    h && f && (h.style.display = "none"), t.style.display = "none", 0 === d && --l <= 1 && o(e).find('>li.separate[data-group="0"]').hide(), d === i && --r <= 1 && o(e).find('>li.separate[data-group="' + (i - 1) + '"]').hide()
                }
            }
        }
    }, a.getPreviousVisibleSeparate = function (e) {
        for (var t = e.previousElementSibling || e.previousSibling; t;) if ("none" === t.style.display) t = t.previousElementSibling || t.previousSibling; else {
            if ("separate" === t.className) break;
            t = null
        }
        return t
    }, a.getPreviousHidenSeparate = function (e) {
        for (var t = e.previousElementSibling || e.previousSibling; t;) if ("separate" === t.className) {
            if ("none" === t.style.display) break;
            t = null
        } else t = "none" === t.style.display ? t.previousElementSibling || t.previousSibling : null;
        return t
    }, a.getNextVisibleSeparate = function (e) {
        for (var t = e.nextElementSibling || e.nextSibling; t;) if ("none" === t.style.display) t = t.nextElementSibling || t.nextSibling; else {
            if ("separate" === t.className) break;
            t = null
        }
        return t
    }, a.caculatePosition = function (e, t, n) {
        var i = t.style.left, o = t.style.top;
        t.style.left = "-9999px", t.style.top = "-9999px", t.style.display = "block";
        var a = t.offsetWidth, l = t.offsetHeight, r = document.documentElement.clientWidth,
            c = document.documentElement.clientHeight;
        if (n) {
            var s = function () {
                for (var e = n, t = 0; e;) t += e.offsetTop, e = e.parentElement;
                return t
            }(), u = function () {
                for (var e = n, t = 0; e;) t += e.offsetLeft, e = e.parentElement;
                return t
            }(), d = n.offsetWidth, m = n.offsetHeight;
            o = c >= s + l ? -3 : s > l ? l - 2 - m : s + l - c - 3, i = r >= u + d + a ? d - 3 : -a + 3
        } else {
            var p = e.clientX, h = e.clientY;
            i = r >= p + a ? p : r - a, o = c >= h + l ? h : h > l ? h - l : c - l
        }
        t.style.left = i + "px", t.style.top = o + "px"
    }, a.hideMenu = function () {
        a.currentShowId && (a.domConf[a.currentShowId].style.display = "none", a.hideSilibingsList(), a.currentShowId = void 0, a.hideSubList(), "function" == typeof a.onMenuHide && a.onMenuHide.call(a.currentMenuTarget))
    }, a.keyBoardHandler = function (e) {
        var t = String.fromCharCode(e.keyCode);
        if (a.currentShowId && a.keyBoard[a.currentShowId]) {
            var n = a.keyBoard[a.currentShowId][t];
            if (n) {
                var i = document.getElementById(n);
                if (i.className.match(/\sdisable(\s|$)/)) return;
                if (i.className.match(/(^|\s)has\-more(\s|$)/)) return a.showSubList.call(i), void a.hideSilibingsList.call(i);
                "function" == typeof a.menus[n].action && (a.hideMenu(), a.eventConf && "function" == typeof a.eventConf.listItemClickBefore && a.eventConf.listItemClickBefore.call(a.currentMenuTarget, a.menus[n], "keyBoard"), a.menus[n].action.call(a.currentMenuTarget, i))
            }
        }
    }, a.eventMatcher = function (e, t, n, i) {
        var o = e, a = !1;
        for (n.stopPropagation = function () {
            a = !0
        }; o && o !== i && o !== document.body && !a;) {
            for (var l = 0, r = t.length; r > l; l++) {
                var c = t[l].selector;
                0 === c.indexOf(".") && -1 !== o.className.toLowerCase().indexOf(c.substring(1)) ? t[l].action.call(o, n) : -1 !== o.tagName.toLowerCase().indexOf(c) && t[l].action.call(o, n)
            }
            o = o.parentNode
        }
    }, a.eventDelegate = function (e, t, n, i) {
        e["delegateevent-" + n] ? e["delegateevent-" + n].push({
            selector: t,
            action: i
        }) : (e["delegateevent-" + n] = [{selector: t, action: i}], l(e, n, function (t) {
            var i = t.target || t.srcElement, o = e["delegateevent-" + n];
            a.eventMatcher(i, o, t, e)
        }))
    }, a.init = function () {
        var e = '.context-menu{position:absolute;font-size:13px!important;color:#000!important;top:0;left:0;-moz-user-select:none;-o-user-select:none;-webkit-user-select:none;user-select:none}.context-menu .arrowicon{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAyCAMAAACwGaE2AAAABlBMVEV6enr///+4gAnsAAAAAnRSTlP/AOW3MEoAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADImlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3OEZDMDgxQjNGQ0UxMUU0QUU2REY5MEI4NTk2OTIxNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3OEZDMDgxQzNGQ0UxMUU0QUU2REY5MEI4NTk2OTIxNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjc4RkMwODE5M0ZDRTExRTRBRTZERjkwQjg1OTY5MjE3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjc4RkMwODFBM0ZDRTExRTRBRTZERjkwQjg1OTY5MjE3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+lu+4FAAAAEZJREFUKM/d0kEKACAIRNHf/S8dSWoz4AVyo4/QRQwrircBLbgkEaRwSAOZc7nqC6FChYr5bb75xS9pCmS29FiyLHWWyGob38gCGXhjiW4AAAAASUVORK5CYII=) right center no-repeat}.context-menu .arrowicon.list-hover,.context-menu .arrowicon.open{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAyCAMAAACwGaE2AAAABlBMVEX///////9VfPVsAAAAAnRSTlP/AOW3MEoAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADImlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4MDFBMUNGRjNGQ0UxMUU0OEJERUM0MjlEMTI1MzU1NSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo4MDFBMUQwMDNGQ0UxMUU0OEJERUM0MjlEMTI1MzU1NSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjgwMUExQ0ZEM0ZDRTExRTQ4QkRFQzQyOUQxMjUzNTU1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjgwMUExQ0ZFM0ZDRTExRTQ4QkRFQzQyOUQxMjUzNTU1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+VaFCGQAAAEZJREFUKM/d0kEKACAIRNHf/S8dSWoz4AVyo4/QRQwrircBLbgkEaRwSAOZc7nqC6FChYr5bb75xS9pCmS29FiyLHWWyGob38gCGXhjiW4AAAAASUVORK5CYII=)}.context-menu ul,.context-menu li{list-style:none;padding:0;margin:0;font-size:13px!important;color:#5b667b!important}.context-menu .list{min-height:23px;padding:2px 0;position:absolute;background-color:#FFF;color:#000}.context-menu .list{border:1px solid #dde0e4;border-radius:5px;box-shadow:0 0 8px #ccc}.context-menu .list li{display:list-item;cursor:default;+width:65px;height:23px;line-height:23px;white-space:nowrap;position:relative;z-index:1;padding:0 27px 0 20px}.context-menu .list .disable,.context-menu .list .disable:hover{color:#c5cbd8!important;background:#FFF;opacity:.8;filter:alpha(opacity=80);-ms-filter:"alpha(Opacity=80)";filter:alpha(Opacity=80)}.context-menu .list li .icon,.context-menu .list li .icon-hover{position:absolute;display:block;width:16px;height:16px;top:3px;left:2px}.context-menu .list li .icon-hover{display:none}.context-menu .list li.list-hover,.context-menu .list .has-more.open{background-color:#4281F4;color:#FFF!important}.context-menu .list li.list-hover>.icon{display:none}.context-menu .list li.list-hover>.icon-hover{display:block}.context-menu .list .has-more{z-index:2}.context-menu .list .has-more .list{display:none;top:-3px;left:98%;z-index:2;border-radius:0;box-shadow:0 0 0}.context-menu .list .separate,.context-menu .list .separate.list-hover{padding:0;margin:5px 0;height:1px;line-height:0;font-size:0!important;background-color:#e9e9e9;cursor:default}.context-menu .list .arrow-down{height:16px;background-position:center -38px}.context-menu .list li:hover{background-color:#4281F4;color:#FFF!important}.context-menu .list li.separate:hover{background-color:#e9e9e9}.context-menu .list .arrow-up{height:16px;background-position:center 4px}',
            t = document.createElement("style");
        t.setAttribute("type", "text/css"), document.all ? t.styleSheet.cssText = e : t.innerHTML = e, document.getElementsByTagName("head").item(0).appendChild(t), l(document.body, "keydown", a.keyBoardHandler, !0), l(document.body, "mousedown", a.hideMenu)
    }, o.fn.rMenu = function (e, t) {
        o(this).each(function () {
            var n = this.getAttribute("data-cid");
            if (n && a.domConf[n]) {
                try {
                    a.domConf[n].parentElement.removeChild(a.domConf[n])
                } catch (i) {
                }
                delete a.domConf[n], delete a.eventConf[n], a.keyBoard = {}
            }
            this.oncontextmenu = function (n) {
                n = void 0 === n && window.event ? window.event : n, n.preventDefault ? n.preventDefault() : n.returnValue = !1, a.contextMenu(n, e, this, t)
            }
        })
    }, a.init(), n.exports.bind = function (e, t, n) {
        var i = e.getAttribute("data-cid");
        if (i && a.domConf[i]) {
            try {
                a.domConf[i].parentElement.removeChild(a.domConf[i])
            } catch (o) {
            }
            delete a.domConf[i], delete a.eventConf[i], a.keyBoard = {}
        }
        e.oncontextmenu = function (e) {
            return e = void 0 === e && window.event ? window.event : e, e.preventDefault ? e.preventDefault() : e.returnValue = !1, a.contextMenu(e, t, this, n), e.stopPropagation(), e.cancelable = !0, !1
        }
    }, n.exports.unbind = function (e) {
        e.oncontextmenu = null
    }
});