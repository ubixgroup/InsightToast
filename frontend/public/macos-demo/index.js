(() => {
  var L_ = Object.create;
  var di = Object.defineProperty;
  var O_ = Object.getOwnPropertyDescriptor;
  var M_ = Object.getOwnPropertyNames;
  var B_ = Object.getPrototypeOf,
    G_ = Object.prototype.hasOwnProperty;
  var D = (e, t) => () => (e && (t = e((e = 0))), t);
  var f = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports),
    Xe = (e, t) => {
      for (var r in t) di(e, r, { get: t[r], enumerable: !0 });
    },
    hc = (e, t, r, i) => {
      if ((t && typeof t == "object") || typeof t == "function")
        for (let s of M_(t))
          !G_.call(e, s) &&
            s !== r &&
            di(e, s, { get: () => t[s], enumerable: !(i = O_(t, s)) || i.enumerable });
      return e;
    };
  var h = (e, t, r) => (
    (r = e != null ? L_(B_(e)) : {}),
    hc(t || !e || !e.__esModule ? di(r, "default", { value: e, enumerable: !0 }) : r, e)
  ),
    Qe = (e) => hc(di({}, "__esModule", { value: !0 }), e);
  var fc = f((l6, pc) => {
    "use strict";
    var uc = Object.getOwnPropertySymbols,
      J_ = Object.prototype.hasOwnProperty,
      V_ = Object.prototype.propertyIsEnumerable;
    function U_(e) {
      if (e == null) throw new TypeError("Object.assign cannot be called with null or undefined");
      return Object(e);
    }
    function W_() {
      try {
        if (!Object.assign) return !1;
        var e = new String("abc");
        if (((e[5] = "de"), Object.getOwnPropertyNames(e)[0] === "5")) return !1;
        for (var t = {}, r = 0; r < 10; r++) t["_" + String.fromCharCode(r)] = r;
        var i = Object.getOwnPropertyNames(t).map(function (n) {
          return t[n];
        });
        if (i.join("") !== "0123456789") return !1;
        var s = {};
        return (
          "abcdefghijklmnopqrst".split("").forEach(function (n) {
            s[n] = n;
          }),
          Object.keys(Object.assign({}, s)).join("") === "abcdefghijklmnopqrst"
        );
      } catch {
        return !1;
      }
    }
    pc.exports = W_()
      ? Object.assign
      : function (e, t) {
        for (var r, i = U_(e), s, n = 1; n < arguments.length; n++) {
          r = Object(arguments[n]);
          for (var o in r) J_.call(r, o) && (i[o] = r[o]);
          if (uc) {
            s = uc(r);
            for (var a = 0; a < s.length; a++) V_.call(r, s[a]) && (i[s[a]] = r[s[a]]);
          }
        }
        return i;
      };
  });
  var Tc = f((q) => {
    "use strict";
    var tn = fc(),
      Ct = 60103,
      gc = 60106;
    q.Fragment = 60107;
    q.StrictMode = 60108;
    q.Profiler = 60114;
    var xc = 60109,
      yc = 60110,
      Rc = 60112;
    q.Suspense = 60113;
    var vc = 60115,
      Sc = 60116;
    typeof Symbol == "function" &&
      Symbol.for &&
      ((ve = Symbol.for),
        (Ct = ve("react.element")),
        (gc = ve("react.portal")),
        (q.Fragment = ve("react.fragment")),
        (q.StrictMode = ve("react.strict_mode")),
        (q.Profiler = ve("react.profiler")),
        (xc = ve("react.provider")),
        (yc = ve("react.context")),
        (Rc = ve("react.forward_ref")),
        (q.Suspense = ve("react.suspense")),
        (vc = ve("react.memo")),
        (Sc = ve("react.lazy")));
    var ve,
      mc = typeof Symbol == "function" && Symbol.iterator;
    function H_(e) {
      return e === null || typeof e != "object"
        ? null
        : ((e = (mc && e[mc]) || e["@@iterator"]), typeof e == "function" ? e : null);
    }
    function mr(e) {
      for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, r = 1; r < arguments.length; r++)
        t += "&args[]=" + encodeURIComponent(arguments[r]);
      return (
        "Minified React error #" +
        e +
        "; visit " +
        t +
        " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
      );
    }
    var wc = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () { },
      enqueueReplaceState: function () { },
      enqueueSetState: function () { },
    },
      Cc = {};
    function _t(e, t, r) {
      (this.props = e), (this.context = t), (this.refs = Cc), (this.updater = r || wc);
    }
    _t.prototype.isReactComponent = {};
    _t.prototype.setState = function (e, t) {
      if (typeof e != "object" && typeof e != "function" && e != null) throw Error(mr(85));
      this.updater.enqueueSetState(this, e, t, "setState");
    };
    _t.prototype.forceUpdate = function (e) {
      this.updater.enqueueForceUpdate(this, e, "forceUpdate");
    };
    function _c() { }
    _c.prototype = _t.prototype;
    function rn(e, t, r) {
      (this.props = e), (this.context = t), (this.refs = Cc), (this.updater = r || wc);
    }
    var sn = (rn.prototype = new _c());
    sn.constructor = rn;
    tn(sn, _t.prototype);
    sn.isPureReactComponent = !0;
    var nn = { current: null },
      Dc = Object.prototype.hasOwnProperty,
      bc = { key: !0, ref: !0, __self: !0, __source: !0 };
    function Ec(e, t, r) {
      var i,
        s = {},
        n = null,
        o = null;
      if (t != null)
        for (i in (t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (n = "" + t.key), t))
          Dc.call(t, i) && !bc.hasOwnProperty(i) && (s[i] = t[i]);
      var a = arguments.length - 2;
      if (a === 1) s.children = r;
      else if (1 < a) {
        for (var l = Array(a), c = 0; c < a; c++) l[c] = arguments[c + 2];
        s.children = l;
      }
      if (e && e.defaultProps) for (i in ((a = e.defaultProps), a)) s[i] === void 0 && (s[i] = a[i]);
      return { $$typeof: Ct, type: e, key: n, ref: o, props: s, _owner: nn.current };
    }
    function z_(e, t) {
      return { $$typeof: Ct, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
    }
    function on(e) {
      return typeof e == "object" && e !== null && e.$$typeof === Ct;
    }
    function $_(e) {
      var t = { "=": "=0", ":": "=2" };
      return (
        "$" +
        e.replace(/[=:]/g, function (r) {
          return t[r];
        })
      );
    }
    var dc = /\/+/g;
    function en(e, t) {
      return typeof e == "object" && e !== null && e.key != null ? $_("" + e.key) : t.toString(36);
    }
    function xi(e, t, r, i, s) {
      var n = typeof e;
      (n === "undefined" || n === "boolean") && (e = null);
      var o = !1;
      if (e === null) o = !0;
      else
        switch (n) {
          case "string":
          case "number":
            o = !0;
            break;
          case "object":
            switch (e.$$typeof) {
              case Ct:
              case gc:
                o = !0;
            }
        }
      if (o)
        return (
          (o = e),
          (s = s(o)),
          (e = i === "" ? "." + en(o, 0) : i),
          Array.isArray(s)
            ? ((r = ""),
              e != null && (r = e.replace(dc, "$&/") + "/"),
              xi(s, t, r, "", function (c) {
                return c;
              }))
            : s != null &&
            (on(s) &&
              (s = z_(
                s,
                r +
                (!s.key || (o && o.key === s.key) ? "" : ("" + s.key).replace(dc, "$&/") + "/") +
                e
              )),
              t.push(s)),
          1
        );
      if (((o = 0), (i = i === "" ? "." : i + ":"), Array.isArray(e)))
        for (var a = 0; a < e.length; a++) {
          n = e[a];
          var l = i + en(n, a);
          o += xi(n, t, r, l, s);
        }
      else if (((l = H_(e)), typeof l == "function"))
        for (e = l.call(e), a = 0; !(n = e.next()).done;)
          (n = n.value), (l = i + en(n, a++)), (o += xi(n, t, r, l, s));
      else if (n === "object")
        throw (
          ((t = "" + e),
            Error(mr(31, t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t)))
        );
      return o;
    }
    function gi(e, t, r) {
      if (e == null) return e;
      var i = [],
        s = 0;
      return (
        xi(e, i, "", "", function (n) {
          return t.call(r, n, s++);
        }),
        i
      );
    }
    function Z_(e) {
      if (e._status === -1) {
        var t = e._result;
        (t = t()),
          (e._status = 0),
          (e._result = t),
          t.then(
            function (r) {
              e._status === 0 && ((r = r.default), (e._status = 1), (e._result = r));
            },
            function (r) {
              e._status === 0 && ((e._status = 2), (e._result = r));
            }
          );
      }
      if (e._status === 1) return e._result;
      throw e._result;
    }
    var Ac = { current: null };
    function Be() {
      var e = Ac.current;
      if (e === null) throw Error(mr(321));
      return e;
    }
    var X_ = {
      ReactCurrentDispatcher: Ac,
      ReactCurrentBatchConfig: { transition: 0 },
      ReactCurrentOwner: nn,
      IsSomeRendererActing: { current: !1 },
      assign: tn,
    };
    q.Children = {
      map: gi,
      forEach: function (e, t, r) {
        gi(
          e,
          function () {
            t.apply(this, arguments);
          },
          r
        );
      },
      count: function (e) {
        var t = 0;
        return (
          gi(e, function () {
            t++;
          }),
          t
        );
      },
      toArray: function (e) {
        return (
          gi(e, function (t) {
            return t;
          }) || []
        );
      },
      only: function (e) {
        if (!on(e)) throw Error(mr(143));
        return e;
      },
    };
    q.Component = _t;
    q.PureComponent = rn;
    q.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = X_;
    q.cloneElement = function (e, t, r) {
      if (e == null) throw Error(mr(267, e));
      var i = tn({}, e.props),
        s = e.key,
        n = e.ref,
        o = e._owner;
      if (t != null) {
        if (
          (t.ref !== void 0 && ((n = t.ref), (o = nn.current)),
            t.key !== void 0 && (s = "" + t.key),
            e.type && e.type.defaultProps)
        )
          var a = e.type.defaultProps;
        for (l in t)
          Dc.call(t, l) && !bc.hasOwnProperty(l) && (i[l] = t[l] === void 0 && a !== void 0 ? a[l] : t[l]);
      }
      var l = arguments.length - 2;
      if (l === 1) i.children = r;
      else if (1 < l) {
        a = Array(l);
        for (var c = 0; c < l; c++) a[c] = arguments[c + 2];
        i.children = a;
      }
      return { $$typeof: Ct, type: e.type, key: s, ref: n, props: i, _owner: o };
    };
    q.createContext = function (e, t) {
      return (
        t === void 0 && (t = null),
        (e = {
          $$typeof: yc,
          _calculateChangedBits: t,
          _currentValue: e,
          _currentValue2: e,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
        }),
        (e.Provider = { $$typeof: xc, _context: e }),
        (e.Consumer = e)
      );
    };
    q.createElement = Ec;
    q.createFactory = function (e) {
      var t = Ec.bind(null, e);
      return (t.type = e), t;
    };
    q.createRef = function () {
      return { current: null };
    };
    q.forwardRef = function (e) {
      return { $$typeof: Rc, render: e };
    };
    q.isValidElement = on;
    q.lazy = function (e) {
      return { $$typeof: Sc, _payload: { _status: -1, _result: e }, _init: Z_ };
    };
    q.memo = function (e, t) {
      return { $$typeof: vc, type: e, compare: t === void 0 ? null : t };
    };
    q.useCallback = function (e, t) {
      return Be().useCallback(e, t);
    };
    q.useContext = function (e, t) {
      return Be().useContext(e, t);
    };
    q.useDebugValue = function () { };
    q.useEffect = function (e, t) {
      return Be().useEffect(e, t);
    };
    q.useImperativeHandle = function (e, t, r) {
      return Be().useImperativeHandle(e, t, r);
    };
    q.useLayoutEffect = function (e, t) {
      return Be().useLayoutEffect(e, t);
    };
    q.useMemo = function (e, t) {
      return Be().useMemo(e, t);
    };
    q.useReducer = function (e, t, r) {
      return Be().useReducer(e, t, r);
    };
    q.useRef = function (e) {
      return Be().useRef(e);
    };
    q.useState = function (e) {
      return Be().useState(e);
    };
    q.version = "17.0.2";
  });
  var E = f((h6, Pc) => {
    "use strict";
    Pc.exports = Tc();
  });
  var V = f((dr) => {
    var Nc = function () {
      let e = arguments[0];
      for (let t = 1; t < arguments.length; t++) {
        let r = arguments[t];
        e = r ? r(e) : e;
      }
      return e;
    };
    dr.chain = Nc;
    dr.chain1 = Nc;
    var Q_ = (e, t) => {
      if (!t) return e;
      for (let r of t) e = r ? r(e) : e;
      return e;
    };
    dr.chain2 = Q_;
    var K_ =
      (...e) =>
        (...t) => {
          for (let r of e) if (!r(...t)) return !1;
          return !0;
        };
    dr.and = K_;
  });
  var gr = f((an) => {
    var Y_ = (e, t) => {
      let r = 0,
        i = e.length;
      for (; ;) {
        if (r === i) return -1 - r;
        let s = Math.floor((r + i) / 2),
          n = t(e[s]);
        if (n === 0) return s;
        n > 0 ? (r = s + 1) : (i = s);
      }
    };
    an.binarySearch = Y_;
    var j_ = (e, t) => (r) => {
      let i = t ? t(r) : r;
      return e === i ? 0 : e > i ? 1 : -1;
    };
    an.compareNum = j_;
  });
  var Se = f((cn) => {
    function ln(e, t) {
      if (e === t) return !0;
      if ((e == null && t == null) || e == null || t == null) return !1;
      if (typeof e == "object" && typeof t == "object") {
        for (let r in e) if (!ln(e[r], t[r])) return !1;
        for (let r in t) if (e[r] === void 0 && t[r] !== void 0) return !1;
        return !0;
      }
      return !1;
    }
    cn.equalDeep = ln;
    cn.equalDeep1 = ln;
  });
  var T = f((C) => {
    var { chain: eD } = V(),
      { binarySearch: tD, compareNum: rD } = gr(),
      iD = (e, t, r) => {
        let i, s;
        for (let n = 0; n < e.length; n++) {
          let o = e[n],
            a = t(o, n);
          if (a != null) {
            if (r !== void 0 && r === a) return o;
            if (i === void 0 || i > a) {
              let l = a;
              l != null && ((i = l), (s = o));
            }
          }
        }
        return s;
      };
    C.findMinE = iD;
    var sD = (e, t = (i) => i, r) => {
      let i, s;
      for (let n of e) {
        let o = t(n);
        if (r !== void 0 && r === o) return n;
        if (i === void 0 || i < o) {
          let a = o;
          a != null && ((i = a), (s = n));
        }
      }
      return s;
    };
    C.findMaxE = sD;
    var nD = (e, t) => {
      let r;
      for (let i of e) (r === void 0 || t(r, i) > 0) && (r = i);
      return r;
    };
    C.findMinECompare = nD;
    var oD = (e) => e?.[e.length - 1];
    C.last = oD;
    var aD = (e, t) => {
      for (let r = e.length - 1; r > -1; r--) if (t(e[r])) return r;
      return -1;
    };
    C.findLastIndex = aD;
    var lD = (e, t) => {
      for (let r = e.length - 1; r > -1; r--) {
        let i = e[r];
        if (t(i)) return i;
      }
    };
    C.findLast = lD;
    var cD = (e, t = (i) => i, { gt: r = kc.gt } = {}) => {
      if (e == null) return null;
      let i;
      for (let s of e) {
        if (s == null) continue;
        let n = t(s);
        (i === void 0 || r(i, n)) && n != null && (i = n);
      }
      return i === void 0 ? null : i;
    };
    C.findMinValue = cD;
    var kc = { le: (e, t) => e <= t, lt: (e, t) => e < t, ge: (e, t) => e >= t, gt: (e, t) => e > t },
      hD = (e, t = (i) => i, { lt: r = kc.lt } = {}) => {
        if (e == null) return null;
        let i;
        for (let s of e) {
          if (s == null) continue;
          let n = t(s);
          (i === void 0 || r(i, n)) && n != null && (i = n);
        }
        return i === void 0 ? null : i;
      };
    C.findMaxValue = hD;
    var uD = (e, t) => {
      let r, i;
      for (let s = 0; s < e.length; s++) {
        let n = e[s];
        if (r === void 0 || r > t(n)) {
          let o = t(n);
          o != null && ((r = o), (i = s));
        }
      }
      return i;
    };
    C.findMinIndex = uD;
    function pD(e, t, r) {
      return [...e.slice(0, r), t, ...e.slice(r)];
    }
    C.insertAt = pD;
    function fD(e, t) {
      return [...e.slice(0, t), ...e.slice(t + 1)];
    }
    C.removeAt = fD;
    function mD(e) {
      return (t) => (e.push(t), () => Fc(e, t));
    }
    C.addRemove = mD;
    function Ic(e, t) {
      return e.filter((r) => !~t.indexOf(r));
    }
    C.withoutAll = Ic;
    C.removeAll = Ic;
    function Fc(e, t) {
      if (e == null) return;
      let r = e.indexOf(t);
      r !== -1 && e.splice(r, 1);
    }
    C.remove1Mutate = Fc;
    function dD(e, t) {
      if (e == null) return;
      let r = e.findIndex(t);
      if (r !== -1) return e.splice(r, 1)[0];
    }
    C.findRemove1Mutate = dD;
    function gD(e, t) {
      if (t != null) return t.filter((r) => r !== e);
    }
    C.without = gD;
    function hn(e, t = (r) => r) {
      if (!e) return e;
      let r = [],
        i = [];
      for (let s of e) {
        let n = t(s);
        ~i.indexOf(n) || (r.push(s), i.push(n));
      }
      return r;
    }
    C.unique = hn;
    C.unique1 = hn;
    function xD(e, t = (r) => r) {
      if (!e) return e;
      let r = [];
      for (let i of e) {
        let s = t(i),
          n = tD(r, rD(s, t));
        n < 0 && r.splice(-n - 1, 0, i);
      }
      return r;
    }
    C.uniqueB = xD;
    function yD(e, t = (r) => r) {
      if (!e) return e;
      let { equalDeep1: r } = Se(),
        i = [],
        s = [];
      for (let n of e) {
        let o = t(n);
        ~s.findIndex((a) => r(a, o)) || (i.push(n), s.push(o));
      }
      return i;
    }
    C.uniqueDeep = yD;
    function RD(e, t, r) {
      if (e == null) return {};
      let i = {};
      for (let s = 0; s < e.length; s++) {
        let n = e[s];
        if (i.hasOwnProperty(n[t])) throw `Property existed [${n[t]}]`;
        i[n[t]] = r ? n[r] : n;
      }
      return i;
    }
    C.indexAttr = RD;
    function vD(e, t, r) {
      if (e == null) return {};
      let i = {};
      for (let s = 0; s < e.length; s++) {
        let n = e[s];
        if (i.hasOwnProperty(t(n))) throw `Property existed [${t(n)}]`;
        i[t(n)] = r ? r(n) : n;
      }
      return i;
    }
    C.index = vD;
    function SD(e, t, r) {
      if (e == null) return {};
      let i = {};
      for (let s = 0; s < e.length; s++) {
        let n = e[s],
          o = i[n[t]];
        o == null && ((o = []), (i[n[t]] = o)), o.push(r ? n[r] : n);
      }
      return i;
    }
    C.indexAttrMulti = SD;
    function qc(e, t = (i) => i, r = (i, s) => (i > s ? 1 : -1)) {
      if (e == null) return null;
      let i = e.slice();
      return (
        i.sort((s, n) => {
          let o = t(s),
            a = t(n);
          return o === a ? 0 : o == null ? -1 : a == null ? 1 : r(o, a);
        }),
        i
      );
    }
    C.sort = qc;
    C.sort1 = qc;
    function wD(e, t) {
      if (e == null) return null;
      let r = e.slice(0);
      return (
        r.sort((i, s) => {
          for (let n of t) {
            let o = n(i),
              a = n(s);
            if (o > a) return 1;
            if (o < a) return -1;
          }
          return 0;
        }),
        r
      );
    }
    C.sortMulti = wD;
    function CD(e) {
      if (e == null) return null;
      let t = e.slice(0);
      return t.reverse(), t;
    }
    C.reverse = CD;
    function Lc(e) {
      if (isNaN(e)) throw "[createArray] Length is not a number: " + e;
      let t = new Array(e);
      for (let r = 0; r < t.length; r++) t[r] = r;
      return t;
    }
    C.createArray = Lc;
    C.createArray1 = Lc;
    function _D(e, t) {
      let r = [];
      for (let i = e; i < t; i++) r.push(i);
      return r;
    }
    C.createArray2 = _D;
    function DD(e, t) {
      t = t.slice(0);
      for (let r of e) ~t.indexOf(r) || t.push(r);
      return t;
    }
    C.addListToSet = DD;
    function bD(e, t) {
      return ~t.indexOf(e) || t.push(e), t;
    }
    C.addToSetMutate = bD;
    function ED(e, t, r) {
      let i = e[t];
      i == null && ((i = []), (e[t] = i)), i.push(r);
    }
    C.addToListMap = ED;
    function AD(e, t, r) {
      e[t] = [...(e[t] || []), ...r];
    }
    C.concatToListMap = AD;
    var TD = (e, t, r) => {
      e = e.slice(0);
      let i = [];
      for (let s = 0; s < e.length; s++) {
        let n = e[s],
          o = t(n);
        for (let a = s + 1; a < e.length; a++) {
          let l = e[a];
          t(l) === o && ((n = r(n, l)), e.splice(a, 1), a--);
        }
        i.push(n);
      }
      return i;
    };
    C.merge = TD;
    function PD(...e) {
      let t = {};
      for (let r of e) for (let i in r) t.hasOwnProperty(i) ? (t[i] = [...t[i], ...r[i]]) : (t[i] = r[i]);
      return t;
    }
    C.mergeListMap = PD;
    function ND(e, t, r) {
      return e.map((i) => {
        let s = t.indexOf(i);
        return s > -1 ? r[s] : i;
      });
    }
    C.replace = ND;
    function kD(e, t, r) {
      if (e == null) return null;
      let i = e.findIndex(r);
      return i === -1 ? e : un(i, e, t);
    }
    C.replaceFind = kD;
    function ID(e, t, r) {
      if (e == null) return null;
      let i = e.findIndex(r);
      return i === -1 ? e : un(i, e, t(e[i]));
    }
    C.replaceFind_f = ID;
    var FD = (e, t, r) => {
      let i = e.findIndex(t);
      return i === -1 ? [...e, r] : [...e.slice(0, i), r, ...e.slice(i + 1)];
    };
    C.upsert = FD;
    function qD(e, t, r) {
      if (e == null) return null;
      let i = e.findIndex(t);
      return i === -1 ? e : Mc(i, e, r);
    }
    C.changeFind = qD;
    var LD = (e, t) => {
      for (let r = 0; r < e.length; r++) {
        let i = e[r],
          s = t(i, r);
        if (s != null) return s;
      }
      return null;
    };
    C.findValue = LD;
    function OD(e, t, r) {
      return e == null ? null : e.map((i) => (t(i) ? r(i) : i));
    }
    C.replaceBy = OD;
    function MD(e, t, r) {
      return e.map((i) => (i === t ? r : i));
    }
    C.replace1 = MD;
    function BD(e, t) {
      if (e == null) return [];
      let r = [],
        i = [];
      for (let s of e) (t(s) ? r : i).push(s);
      return [r, i];
    }
    C.split = BD;
    function GD(e, t) {
      if (e == null) return [];
      let r = [];
      for (let i = 0; i < e.length; i++) {
        let s = e[i];
        t(s) && (r.push(s), e.splice(i, 1), i--);
      }
      return r;
    }
    C.extract = GD;
    function Oc(e) {
      if (e == null) return [];
      let t = [];
      for (let r of e) r && (t = t.concat(r));
      return t;
    }
    C.flatten1 = Oc;
    C.flatten11 = Oc;
    var JD = (e, t) => t.filter((r, i) => i !== e);
    C.removeIndex = JD;
    var un = (e, t, r) => t.map((i, s) => (s !== e ? i : r));
    C.replaceIndex = un;
    var VD = (e, t, r) => [...t.slice(0, e), ...r, ...t.slice(e + 1)];
    C.replaceIndex2 = VD;
    var Mc = (e, t, r) => t.map((i, s) => (s !== e ? i : r(i)));
    C.changeIndex = Mc;
    function UD(e, t) {
      let r = {};
      for (let i = 0; i < e.length; i++) r[t(i)] = e[i];
      return r;
    }
    C.toMap = UD;
    function Bc(e, t = (r) => r) {
      return e == null ? 0 : e.reduce((r, i, s) => r + (t(i, s) || 0), 0);
    }
    C.sum = Bc;
    C.sum1 = Bc;
    var WD = (e) => {
      let t = typeof e == "function" ? e : () => e,
        r = 0;
      return () => {
        r++;
        let i = t();
        return r >= i.length && (r = 0), i[r];
      };
    };
    C.switchAmong = WD;
    var HD = (e, t) => {
      let r = [],
        i = 0;
      return (
        t.forEach((s, n) => {
          let o = n === t.length - 1 ? e.length : i + Math.floor(s * e.length);
          r.push(e.slice(i, o)), (i = o);
        }),
        r
      );
    };
    C.divide = HD;
    var zD = ({ get: e, set: t }, r, i) => {
      let s = e(i),
        n = e(r);
      t(s, r), t(n, i);
    };
    C.swap = zD;
    var Gc = (e, t) => {
      if (e == null || e.length === 0) return [];
      if (e.length === 1) return e[0].map((n) => t([n]));
      let [r, ...i] = e,
        s = [];
      for (let n of r) s = [...s, ...Gc(i, (o) => t([n, ...o]))];
      return s;
    };
    C.crossMap = Gc;
    var $D = (e) => {
      let t = [];
      for (let r = 0; r < e.length; r++) {
        let i = e[r];
        if (!(t.indexOf(i) > -1)) {
          for (let s = r + 1; s < e.length; s++)
            if (e[s] === i) {
              t.push(i);
              break;
            }
        }
      }
      return t;
    };
    C.findDuplicateds = $D;
    var ZD = (e, { by: t = (i) => i, compare: r = (i, s) => i === s }) => {
      let i = [];
      for (let s = 0; s < e.length; s++) {
        let n = e[s];
        if (i.some((l) => l.dups.includes(n))) continue;
        let o = t(n),
          a;
        for (let l = s + 1; l < e.length; l++) {
          let c = e[l],
            u = t(c);
          r(o, u) && (a || (a = [n]), a.push(c));
        }
        a && i.push({ by: o, dups: a });
      }
      return i;
    };
    C.findDuplicateds2 = ZD;
    var XD = (e) =>
      eD(
        e.map((t) => JSON.stringify(t)),
        hn,
        (t) => t.map((r) => JSON.parse(r))
      );
    C.jsonUnique = XD;
    var QD = (e, t) => {
      if (e == null || e.length < 2) return e;
      let r = [];
      for (let i = 0; i < e.length; i++) {
        let s = e[i];
        i > 0 && r.push(t), r.push(s);
      }
      return r;
    };
    C.joinArr = QD;
    var KD = (e, t, r = (i, s) => i === s) => {
      t == null && (t = []), e == null && (e = []);
      let i = [],
        s = [];
      for (let n of t) e.find((o) => r(o, n)) == null && s.push(n);
      for (let n of e) t.find((o) => r(n, o)) == null && i.push(n);
      return { added: i, removed: s };
    };
    C.compareCol = KD;
    var YD = (e) => {
      e = e.slice(0);
      let t = e.length,
        r = (i, s) => {
          let n = e[i];
          (e[i] = e[s]), (e[s] = n);
        };
      for (; t !== 0;) {
        let i = Math.floor(Math.random() * t);
        t--, r(t, i);
      }
      return e;
    };
    C.shuffle = YD;
    var Jc = (e) => e == null || e.length === 0;
    C.isEmpty = Jc;
    var jD = (e) => !Jc(e);
    C.isNotEmpty = jD;
    var eb = (e, t) => {
      if (e.length !== t.length) return !1;
      for (let r of e) if (t.indexOf(r) === -1) return !1;
      return !0;
    };
    C.setEqual = eb;
    var tb = (e) => {
      if (e === null) return null;
      for (let t of e) if (t !== null) return !1;
      return !0;
    };
    C.isAllNull = tb;
    var rb = (e, t) =>
      t == null ? e == null : e == null || e.length > t.length ? !0 : Vc(t.slice(0, e.length), e);
    C.arrStartsWith = rb;
    var Vc = (e, t) => {
      if (e === t) return !0;
      if (e == null) return t == null;
      if (t == null || e.length !== t.length) return !1;
      for (let r = 0; r < e.length; r++) if (e[r] !== t[r]) return !1;
      return !0;
    };
    C.arrEquals = Vc;
    function ib(e, t, r) {
      return r.map((i, s) => (s === e ? r[t] : s === t ? r[e] : i));
    }
    C.flip = ib;
    var sb = (e, t) => {
      let r = e.findIndex(t);
      if (r === 0) return e;
      if (r === -1) throw 2365342;
      return [e[r], ...e.slice(0, r), ...e.slice(r + 1)];
    };
    C.toFirst = sb;
  });
  var Hc = f((d6, Wc) => {
    "use strict";
    var Uc = Object.getOwnPropertySymbols,
      nb = Object.prototype.hasOwnProperty,
      ob = Object.prototype.propertyIsEnumerable;
    function ab(e) {
      if (e == null) throw new TypeError("Object.assign cannot be called with null or undefined");
      return Object(e);
    }
    function lb() {
      try {
        if (!Object.assign) return !1;
        var e = new String("abc");
        if (((e[5] = "de"), Object.getOwnPropertyNames(e)[0] === "5")) return !1;
        for (var t = {}, r = 0; r < 10; r++) t["_" + String.fromCharCode(r)] = r;
        var i = Object.getOwnPropertyNames(t).map(function (n) {
          return t[n];
        });
        if (i.join("") !== "0123456789") return !1;
        var s = {};
        return (
          "abcdefghijklmnopqrst".split("").forEach(function (n) {
            s[n] = n;
          }),
          Object.keys(Object.assign({}, s)).join("") === "abcdefghijklmnopqrst"
        );
      } catch {
        return !1;
      }
    }
    Wc.exports = lb()
      ? Object.assign
      : function (e, t) {
        for (var r, i = ab(e), s, n = 1; n < arguments.length; n++) {
          r = Object(arguments[n]);
          for (var o in r) nb.call(r, o) && (i[o] = r[o]);
          if (Uc) {
            s = Uc(r);
            for (var a = 0; a < s.length; a++) ob.call(r, s[a]) && (i[s[a]] = r[s[a]]);
          }
        }
        return i;
      };
  });
  var ih = f((G) => {
    "use strict";
    var gn = Hc(),
      Ee = typeof Symbol == "function" && Symbol.for,
      xr = Ee ? Symbol.for("react.element") : 60103,
      cb = Ee ? Symbol.for("react.portal") : 60106,
      hb = Ee ? Symbol.for("react.fragment") : 60107,
      ub = Ee ? Symbol.for("react.strict_mode") : 60108,
      pb = Ee ? Symbol.for("react.profiler") : 60114,
      fb = Ee ? Symbol.for("react.provider") : 60109,
      mb = Ee ? Symbol.for("react.context") : 60110,
      db = Ee ? Symbol.for("react.forward_ref") : 60112,
      gb = Ee ? Symbol.for("react.suspense") : 60113,
      xb = Ee ? Symbol.for("react.memo") : 60115,
      yb = Ee ? Symbol.for("react.lazy") : 60116,
      zc = typeof Symbol == "function" && Symbol.iterator;
    function yr(e) {
      for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, r = 1; r < arguments.length; r++)
        t += "&args[]=" + encodeURIComponent(arguments[r]);
      return (
        "Minified React error #" +
        e +
        "; visit " +
        t +
        " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
      );
    }
    var $c = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () { },
      enqueueReplaceState: function () { },
      enqueueSetState: function () { },
    },
      Zc = {};
    function Dt(e, t, r) {
      (this.props = e), (this.context = t), (this.refs = Zc), (this.updater = r || $c);
    }
    Dt.prototype.isReactComponent = {};
    Dt.prototype.setState = function (e, t) {
      if (typeof e != "object" && typeof e != "function" && e != null) throw Error(yr(85));
      this.updater.enqueueSetState(this, e, t, "setState");
    };
    Dt.prototype.forceUpdate = function (e) {
      this.updater.enqueueForceUpdate(this, e, "forceUpdate");
    };
    function Xc() { }
    Xc.prototype = Dt.prototype;
    function xn(e, t, r) {
      (this.props = e), (this.context = t), (this.refs = Zc), (this.updater = r || $c);
    }
    var yn = (xn.prototype = new Xc());
    yn.constructor = xn;
    gn(yn, Dt.prototype);
    yn.isPureReactComponent = !0;
    var Rn = { current: null },
      Qc = Object.prototype.hasOwnProperty,
      Kc = { key: !0, ref: !0, __self: !0, __source: !0 };
    function Yc(e, t, r) {
      var i,
        s = {},
        n = null,
        o = null;
      if (t != null)
        for (i in (t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (n = "" + t.key), t))
          Qc.call(t, i) && !Kc.hasOwnProperty(i) && (s[i] = t[i]);
      var a = arguments.length - 2;
      if (a === 1) s.children = r;
      else if (1 < a) {
        for (var l = Array(a), c = 0; c < a; c++) l[c] = arguments[c + 2];
        s.children = l;
      }
      if (e && e.defaultProps) for (i in ((a = e.defaultProps), a)) s[i] === void 0 && (s[i] = a[i]);
      return { $$typeof: xr, type: e, key: n, ref: o, props: s, _owner: Rn.current };
    }
    function Rb(e, t) {
      return { $$typeof: xr, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
    }
    function vn(e) {
      return typeof e == "object" && e !== null && e.$$typeof === xr;
    }
    function vb(e) {
      var t = { "=": "=0", ":": "=2" };
      return (
        "$" +
        ("" + e).replace(/[=:]/g, function (r) {
          return t[r];
        })
      );
    }
    var jc = /\/+/g,
      yi = [];
    function eh(e, t, r, i) {
      if (yi.length) {
        var s = yi.pop();
        return (s.result = e), (s.keyPrefix = t), (s.func = r), (s.context = i), (s.count = 0), s;
      }
      return { result: e, keyPrefix: t, func: r, context: i, count: 0 };
    }
    function th(e) {
      (e.result = null),
        (e.keyPrefix = null),
        (e.func = null),
        (e.context = null),
        (e.count = 0),
        10 > yi.length && yi.push(e);
    }
    function fn(e, t, r, i) {
      var s = typeof e;
      (s === "undefined" || s === "boolean") && (e = null);
      var n = !1;
      if (e === null) n = !0;
      else
        switch (s) {
          case "string":
          case "number":
            n = !0;
            break;
          case "object":
            switch (e.$$typeof) {
              case xr:
              case cb:
                n = !0;
            }
        }
      if (n) return r(i, e, t === "" ? "." + pn(e, 0) : t), 1;
      if (((n = 0), (t = t === "" ? "." : t + ":"), Array.isArray(e)))
        for (var o = 0; o < e.length; o++) {
          s = e[o];
          var a = t + pn(s, o);
          n += fn(s, a, r, i);
        }
      else if (
        (e === null || typeof e != "object"
          ? (a = null)
          : ((a = (zc && e[zc]) || e["@@iterator"]), (a = typeof a == "function" ? a : null)),
          typeof a == "function")
      )
        for (e = a.call(e), o = 0; !(s = e.next()).done;)
          (s = s.value), (a = t + pn(s, o++)), (n += fn(s, a, r, i));
      else if (s === "object")
        throw (
          ((r = "" + e),
            Error(
              yr(31, r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r, "")
            ))
        );
      return n;
    }
    function mn(e, t, r) {
      return e == null ? 0 : fn(e, "", t, r);
    }
    function pn(e, t) {
      return typeof e == "object" && e !== null && e.key != null ? vb(e.key) : t.toString(36);
    }
    function Sb(e, t) {
      e.func.call(e.context, t, e.count++);
    }
    function wb(e, t, r) {
      var i = e.result,
        s = e.keyPrefix;
      (e = e.func.call(e.context, t, e.count++)),
        Array.isArray(e)
          ? dn(e, i, r, function (n) {
            return n;
          })
          : e != null &&
          (vn(e) &&
            (e = Rb(
              e,
              s + (!e.key || (t && t.key === e.key) ? "" : ("" + e.key).replace(jc, "$&/") + "/") + r
            )),
            i.push(e));
    }
    function dn(e, t, r, i, s) {
      var n = "";
      r != null && (n = ("" + r).replace(jc, "$&/") + "/"), (t = eh(t, n, i, s)), mn(e, wb, t), th(t);
    }
    var rh = { current: null };
    function Ge() {
      var e = rh.current;
      if (e === null) throw Error(yr(321));
      return e;
    }
    var Cb = {
      ReactCurrentDispatcher: rh,
      ReactCurrentBatchConfig: { suspense: null },
      ReactCurrentOwner: Rn,
      IsSomeRendererActing: { current: !1 },
      assign: gn,
    };
    G.Children = {
      map: function (e, t, r) {
        if (e == null) return e;
        var i = [];
        return dn(e, i, null, t, r), i;
      },
      forEach: function (e, t, r) {
        if (e == null) return e;
        (t = eh(null, null, t, r)), mn(e, Sb, t), th(t);
      },
      count: function (e) {
        return mn(
          e,
          function () {
            return null;
          },
          null
        );
      },
      toArray: function (e) {
        var t = [];
        return (
          dn(e, t, null, function (r) {
            return r;
          }),
          t
        );
      },
      only: function (e) {
        if (!vn(e)) throw Error(yr(143));
        return e;
      },
    };
    G.Component = Dt;
    G.Fragment = hb;
    G.Profiler = pb;
    G.PureComponent = xn;
    G.StrictMode = ub;
    G.Suspense = gb;
    G.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Cb;
    G.cloneElement = function (e, t, r) {
      if (e == null) throw Error(yr(267, e));
      var i = gn({}, e.props),
        s = e.key,
        n = e.ref,
        o = e._owner;
      if (t != null) {
        if (
          (t.ref !== void 0 && ((n = t.ref), (o = Rn.current)),
            t.key !== void 0 && (s = "" + t.key),
            e.type && e.type.defaultProps)
        )
          var a = e.type.defaultProps;
        for (l in t)
          Qc.call(t, l) && !Kc.hasOwnProperty(l) && (i[l] = t[l] === void 0 && a !== void 0 ? a[l] : t[l]);
      }
      var l = arguments.length - 2;
      if (l === 1) i.children = r;
      else if (1 < l) {
        a = Array(l);
        for (var c = 0; c < l; c++) a[c] = arguments[c + 2];
        i.children = a;
      }
      return { $$typeof: xr, type: e.type, key: s, ref: n, props: i, _owner: o };
    };
    G.createContext = function (e, t) {
      return (
        t === void 0 && (t = null),
        (e = {
          $$typeof: mb,
          _calculateChangedBits: t,
          _currentValue: e,
          _currentValue2: e,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
        }),
        (e.Provider = { $$typeof: fb, _context: e }),
        (e.Consumer = e)
      );
    };
    G.createElement = Yc;
    G.createFactory = function (e) {
      var t = Yc.bind(null, e);
      return (t.type = e), t;
    };
    G.createRef = function () {
      return { current: null };
    };
    G.forwardRef = function (e) {
      return { $$typeof: db, render: e };
    };
    G.isValidElement = vn;
    G.lazy = function (e) {
      return { $$typeof: yb, _ctor: e, _status: -1, _result: null };
    };
    G.memo = function (e, t) {
      return { $$typeof: xb, type: e, compare: t === void 0 ? null : t };
    };
    G.useCallback = function (e, t) {
      return Ge().useCallback(e, t);
    };
    G.useContext = function (e, t) {
      return Ge().useContext(e, t);
    };
    G.useDebugValue = function () { };
    G.useEffect = function (e, t) {
      return Ge().useEffect(e, t);
    };
    G.useImperativeHandle = function (e, t, r) {
      return Ge().useImperativeHandle(e, t, r);
    };
    G.useLayoutEffect = function (e, t) {
      return Ge().useLayoutEffect(e, t);
    };
    G.useMemo = function (e, t) {
      return Ge().useMemo(e, t);
    };
    G.useReducer = function (e, t, r) {
      return Ge().useReducer(e, t, r);
    };
    G.useRef = function (e) {
      return Ge().useRef(e);
    };
    G.useState = function (e) {
      return Ge().useState(e);
    };
    G.version = "16.14.0";
  });
  var $ = f((x6, sh) => {
    "use strict";
    sh.exports = ih();
  });
  var z = f((nh) => {
    var { Fragment: _b } = $(),
      Db = (e) =>
        e == null || Array.isArray(e)
          ? e
          : e.type && (e.type.$_r2_fragment || e.type === _b) && e.key == null
            ? ((e = e.props.children), e == null || Array.isArray(e) ? e : [e])
            : [e];
    nh.ensureArray = Db;
  });
  var ie = f((Ri) => {
    var Sn = () => Object.create(bb);
    Ri.IterList = Sn;
    var oh = function (e) {
      let t = this.first;
      for (; t;) e(t.value), (t = t.next);
    },
      bb = {
        empty() {
          this.last = this.first = null;
        },
        shift() {
          let e = this.first.value;
          return (
            this.last === this.first ? (this.last = this.first = null) : (this.first = this.first.next), e
          );
        },
        unshift(e) {
          let t = { value: e, next: this.first };
          return (this.first = t), this.last || (this.last = t), t;
        },
        cutAfterEntry(e) {
          e === this.last || ((e.next = null), (this.last = e));
        },
        isEmpty() {
          return !this.first;
        },
        isNotEmpty() {
          return this.first;
        },
        push(e) {
          let t = { value: e, next: null };
          return this.first || (this.first = t), this.last && (this.last.next = t), (this.last = t), t;
        },
        pushList(e) {
          if (e)
            if (this.first) {
              let t = e.first;
              t && ((this.last.next = t), (this.last = e.last));
            } else (this.first = e.first), (this.last = e.last);
        },
        pushEntries(e, t) {
          t && (t.next = null),
            this.first
              ? (this.last && (this.last.next = e), (this.last = t ?? e))
              : ((this.first = e), (this.last = t ?? e));
        },
        lastValue() {
          return this.last.value;
        },
        toArray() {
          let e = [];
          return oh.call(this, e.push.bind(e)), e;
        },
        hasMultiple() {
          return this.first && this.first.next;
        },
        pushEntry(e) {
          this.last && (this.last.next = e), (this.last = e), this.first || (this.first = e), (e.next = null);
        },
        forEach: oh,
        indexOf(e) {
          let t = this.first,
            r = 0;
          for (; ;) {
            if (t.value === e) return r;
            if (((t = t.next), r++, t == null)) return -1;
          }
        },
        entryAt(e) {
          let t = this.first;
          for (let r = 0; r < e; r++) t = t.next;
          return t;
        },
      },
      Eb = (e) => {
        let t = Sn();
        return t.push(e), t;
      };
    Ri.singleIterList = Eb;
    var Ab = (e) => {
      let t = Sn();
      return e.forEach((r) => t.push(r)), t;
    };
    Ri.arrayToIterList = Ab;
  });
  var wn = f((ah) => {
    var { singleIterList: Tb } = ie(),
      Pb = (e, t) => {
        let r = Tb(e);
        for (; r.isNotEmpty();) {
          let i = r.shift();
          t(i), r.pushList(i.childNodes);
        }
      };
    ah.eachNodeRecursively = Pb;
  });
  var Rr = f((lh) => {
    var { last: Nb } = T(),
      { ensureArray: kb } = z(),
      { eachNodeRecursively: Ib } = wn(),
      Fb = ({ controllers: e }) => {
        let t = {
          activeController: qb,
          controllers: e,
          level: 0,
          createUpdate: (r) => ({ node: t, request: { elements: r } }),
          destroy: () => {
            for (let r of e) r.rootDestroy?.();
            Ib(t, (r) => r.activeController.selfDispose?.()), (t.childNodes = null);
          },
        };
        return t;
      };
    lh.createRootNode = Fb;
    var qb = { applyUpdates: ({ updateRequests: e }) => ({ propagation: { elements: kb(Nb(e).elements) } }) };
  });
  var hh = f((ch) => {
    var { sort: Lb } = T(),
      { binarySearch: Ob, compareNum: Mb } = gr(),
      { chain: Bb } = V(),
      Gb = (e) => {
        e = Lb(e, (r) => r.node.level);
        let t = (r) => {
          let i = [];
          for (let s = 0; s < e.length; s++) {
            let n = e[s];
            if (n.node === r) i.push(n.request), e.splice(s, 1), s--;
            else if (n.level > r.level) break;
          }
          return i;
        };
        return {
          isEmpty: () => !e.length,
          extractRequests: t,
          shift: () => {
            let r = e.shift(),
              i = t(r.node);
            return { node: r.node, requests: [r.request].concat(i) };
          },
          appendUpdate: (r) => {
            let i = Bb(
              Ob(
                e,
                Mb(r.node.level, (s) => s.node.level)
              ),
              (s) => (s > -1 ? s : -s - 1)
            );
            e.splice(i, 0, r);
          },
        };
      };
    ch.UpdateGroup = Gb;
  });
  var vr = f((uh) => {
    var { IterList: Jb } = ie(),
      Vb = (e) => {
        let t = Object.create(Ub);
        return (t.list = e), t;
      };
    uh.CutPoint = Vb;
    var Ub = {
      peek() {
        return (this.prevEntry ? this.prevEntry.next : this.list.first)?.value;
      },
      reset() {
        this.prevEntry = null;
      },
      cut() {
        if (!this.prevEntry) this.list.shift();
        else {
          let e = this.prevEntry.next;
          (this.prevEntry.next = e.next), e.next == null && (this.list.last = this.prevEntry);
        }
      },
      cutToNewList() {
        if (this.prevEntry) {
          let e = Jb();
          return (
            e.pushEntries(this.prevEntry.next, this.list.last), this.list.cutAfterEntry(this.prevEntry), e
          );
        } else throw "Why need to cut, it's still starting";
      },
      isFirst() {
        return this.prevEntry == null;
      },
      endReached() {
        return (this.prevEntry ? this.prevEntry.next : this.list.first) == null;
      },
      forward() {
        return (
          (this.prevEntry = this.prevEntry ? this.prevEntry.next : this.list.first),
          this.prevEntry.next == null
        );
      },
      insert(e) {
        if (this.prevEntry == null) this.prevEntry = this.list.unshift(e);
        else if (this.prevEntry.next == null) this.prevEntry = this.list.push(e);
        else {
          let t = { value: e, next: this.prevEntry.next };
          (this.prevEntry.next = t), (this.prevEntry = t);
        }
      },
    };
  });
  var mh = f((fh) => {
    var { CutPoint: Wb } = vr(),
      { IterList: ph } = ie(),
      Hb = (e, t, { onCreateNode: r, onUpdateNode: i }) => {
        if (!e?.length) return null;
        if (t?.isNotEmpty()) {
          let s = Wb(t),
            n = 0,
            o = ph();
          for (let a of e) {
            let l = s?.peek();
            l && i(l, a, n)
              ? (s.cut(), t.isEmpty() && (s = null), o.push(l))
              : (s?.forward() && (s = null), o.push(r(a))),
              n++;
          }
          return o;
        } else {
          let s = ph();
          for (let n of e) s.push(r(n));
          return s;
        }
      };
    fh.directMatcher = Hb;
  });
  var yh = f((xh) => {
    var { IterList: dh } = ie(),
      { CutPoint: gh } = vr(),
      zb = (e) => {
        let t = dh(),
          r = dh();
        return (
          r.pushList(e),
          t.push({ index: 0, list: r }),
          {
            findAndRemove: (i) => {
              let s = gh(t);
              for (; !s.endReached();) {
                let n = s.peek(),
                  o = gh(n.list);
                for (let a = 0; !o.endReached(); a++) {
                  let l = o.peek();
                  if (i(l, n.index + a)) {
                    if ((o.cut(), a === 0))
                      n.list.isEmpty()
                        ? s.cut()
                        : (n.index++, s.isFirst() || (s.cut(), t.unshift(n)));
                    else if (!o.endReached()) {
                      let c = o.cutToNewList(),
                        u = { index: n.index + a + 1, list: c };
                      t.unshift(u);
                    }
                    return !0;
                  } else o.forward();
                }
                s.forward();
              }
            },
            eachList: (i) => t.forEach((s) => i(s.list)),
          }
        );
      };
    xh.IndexedExhaustBasket = zb;
  });
  var vh = f((Rh) => {
    var { IndexedExhaustBasket: $b } = yh(),
      { IterList: Zb } = ie(),
      Xb = (e, t, { onUpdateNode: r, onCreateNode: i }) => {
        if (!e) return null;
        let s = $b(t),
          n = Zb();
        for (let o of e)
          s.findAndRemove((l, c) => {
            if (r(l, o, c)) return n.push(l), !0;
          }) || n.push(i(o));
        return t.empty(), s.eachList(t.pushList.bind(t)), n;
      };
    Rh.rearrangeMatcher = Xb;
  });
  var Cn = f((wh) => {
    var { directMatcher: Sh } = mh(),
      { rearrangeMatcher: Qb } = vh(),
      { IterList: Kb } = ie(),
      Yb = (e, t, { onCreateNode: r, onUpdateNode: i, onRemoveNode: s }) => {
        let n = jb(e.childNodes) ?? Sh,
          o = e.childNodes ?? Kb(),
          a = n(t, o, {
            onCreateNode: r,
            onUpdateNode: (l, c, u) => {
              if (l?.activeController.acceptPropagation(c)) return i(l, c, u), l;
            },
          });
        o?.forEach(s), (e.childNodes = a);
      };
    wh.reconcilation = Yb;
    var jb = (e) => (!e || e.isEmpty() || eE(e) ? Sh : Qb),
      eE = (e) => {
        let t = e.first;
        for (let r = 0; t && r < 30; r++) {
          if (t.value.activeController.key == null) return !0;
          t = t.next;
        }
      };
  });
  var _h = f((Ch) => {
    var { IterList: tE } = ie(),
      { CutPoint: rE } = vr(),
      iE = (e, t) => {
        let r = tE(),
          i = rE(r),
          s = (a) => i.insert(a),
          n = !1;
        for (
          t(
            e
              ? (a, l) => {
                n ? s(l) : a < e ? l(a + 1) : ((n = !0), s(l));
              }
              : (a, l) => s(l)
          );
          !r.isEmpty();

        )
          (n = !1), i.reset(), r.shift()(0);
      };
    Ch.safeStack = iE;
  });
  var bh = f((Dh) => {
    var sE = (e, { parentNode: t, onRequestUpdate: r, isSchedulerEmpty: i }) => {
      let s = (m) => ({ node: p, request: m }),
        n = (m) => r(s(m)),
        o = t.controllers.findIndex((m) => m.matchElement(e));
      if (o === -1)
        throw (console.error("e", e), console.error("controllers", t.controllers), "Can't resolve controller");
      let a = null,
        l = t.controllers.map((m, d) => (d === o ? null : (m.createPassiveChild?.(a) ?? m))),
        c = t.controllers[o],
        u =
          c.createActiveChild?.(e, {
            createUpdateRequest: s,
            onRequestUpdate: n,
            findPassiveController: (m) => {
              for (let d = 0; d < l.length; d++) {
                if (d === o) continue;
                let g = m(l[d]);
                if (g) return g;
              }
            },
            isSchedulerEmpty: i,
          }) ?? c;
      l[o] = u;
      let p = { activeController: u, controllers: l, level: t.level + 1 };
      return p;
    };
    Dh.createChildNode = sE;
  });
  var Ah = f((Eh) => {
    var nE = (e, t) => {
      let r = !1,
        i = e.map((s) => {
          if (s.createLoop) return (r = !0), s.createLoop(t);
        });
      return r ? i : null;
    };
    Eh.createLoopers = nE;
  });
  var Sr = f((Ph) => {
    var { UpdateGroup: oE } = hh(),
      { reconcilation: aE } = Cn(),
      { eachNodeRecursively: lE } = wn(),
      { safeStack: cE } = _h(),
      { createChildNode: hE } = bh(),
      { createLoopers: uE } = Ah(),
      pE = ({ updates: e, onRequestUpdate: t, isSchedulerEmpty: r }) => {
        let i = oE(e);
        e = null;
        let s = [];
        for (; !i.isEmpty();) {
          let { node: n, requests: o } = i.shift(),
            a = fE(
              { node: n, params: { updateRequests: o }, isHost: !0 },
              { updateGroup: i, onRequestUpdate: t, isSchedulerEmpty: r }
            );
          a && s.push(a);
        }
        return s.length ? () => s.forEach((n) => n()) : null;
      };
    Ph.renderUpdates = pE;
    var fE = (e, t) => {
      let r = [];
      return (
        cE(300, (i) => {
          _n(e, t, { addCommit: (n) => r.push(n), onRequest: i });
        }),
        r.length
          ? () => {
            r.forEach((i) => i());
          }
          : null
      );
    },
      Th = ({ node: e, params: t, isHost: r, onDone: i }, s, n, o = 0) => {
        let a = e.activeController.applyUpdates(t);
        if (!a) {
          i?.();
          return;
        }
        let { propagation: l, jumpUpdates: c, onCommit: u } = a,
          { updateGroup: p, onRequestUpdate: m, isSchedulerEmpty: d } = s;
        if ((u && n.addCommit(u), c?.forEach(p.appendUpdate), l)) {
          let g = uE(e.controllers, r);
          aE(e, l.elements, {
            onCreateNode: (y) => {
              let x = hE(y, { parentNode: e, onRequestUpdate: m, isSchedulerEmpty: d });
              return (
                n.onRequest(o, (R) => {
                  _n(
                    {
                      node: x,
                      params: { isFirstRun: !0 },
                      onDone:
                        g &&
                        (() => {
                          g.forEach((w, b) => {
                            w?.onCreated(x.controllers[b]);
                          });
                        }),
                    },
                    s,
                    n,
                    R
                  );
                }),
                x
              );
            },
            onUpdateNode: (y, x, R) => {
              let w = p.extractRequests(y);
              n.onRequest(o, (b) => {
                _n(
                  {
                    node: y,
                    params: { propagationRequest: { element: x }, updateRequests: w },
                    onDone:
                      g &&
                      (() => {
                        g.forEach((k, M) => {
                          k?.onUpdated(y.controllers[M], R);
                        });
                      }),
                  },
                  s,
                  n,
                  b
                );
              });
            },
            onRemoveNode: (y) => {
              n.onRequest(o, () => {
                g?.forEach((x, R) => {
                  x?.onRemove(y.controllers[R]);
                }),
                  lE(y, (x) => x.activeController.selfDispose?.());
              });
            },
          }),
            (g || i) &&
            n.onRequest(o, () => {
              g?.forEach((y) => y?.finish()), i?.();
            });
        } else i?.();
      },
      _n = function (e) {
        if (!e.node.activeController.applyUpdates) return;
        let t = e.node.controllers.find((r) => r.handleException)?.handleException;
        if (t)
          try {
            Th.apply(null, arguments);
          } catch (r) {
            t(r);
          }
        else Th.apply(null, arguments);
      };
  });
  var Dn = f((Nh) => {
    var mE = (e) => {
      let t = [],
        r = null;
      return {
        addUpdate: (i) => {
          t.push(i),
            r == null &&
            (r = dE(() => {
              for (; t.length;) {
                let s = t.slice(0);
                (t.length = 0), e(s);
              }
              r = null;
            }));
        },
        isEmpty: () => !t.length,
      };
    };
    Nh.createScheduler = mE;
    var dE = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;
  });
  var Ih = f((kh) => {
    var { createRootNode: gE } = Rr(),
      { renderUpdates: xE } = Sr(),
      { ensureArray: yE } = z(),
      { createScheduler: RE } = Dn(),
      vE = (e) => {
        let t = gE({ controllers: e }),
          r = (s) => {
            xE({ updates: s, onRequestUpdate: (o) => i.addUpdate(o), isSchedulerEmpty: i.isEmpty })?.();
          },
          i = RE(r);
        return {
          render: (s) => {
            (s = yE(s)), r([t.createUpdate(s)]);
          },
          unmount: () => t.destroy(),
        };
      };
    kh.createRoot = vE;
  });
  var bn = f((Fh) => {
    var SE = ({ createNewAttrUpdater: e }) => {
      let t = {};
      return {
        update: (r) => {
          for (let i in r) {
            let s = t[i];
            s ? s.update(r[i]) : (t[i] = e(i, r[i]));
          }
          for (let i in t) r[i] == null && (t[i].dispose(), delete t[i]);
        },
        dispose: () => {
          for (let r in t) t[r].dispose();
        },
      };
    };
    Fh.AttrsUpdater = SE;
  });
  var j = f((Z) => {
    var qh = (e, t) => {
      if (e == null) return null;
      let r = {};
      for (let i in e) r[t(i, e[i])] = e[i];
      return r;
    };
    Z.mapKeys = qh;
    var wE = (e) => qh(e, (t) => t);
    Z.clone = wE;
    var CE = (e) => {
      if (e == null) return null;
      for (let t in e) return e[t];
    };
    Z.singleValue = CE;
    var _E = (e, t) => {
      if (e == null) return null;
      let r = {};
      for (let i in e) {
        let s = t(e[i], i);
        s != null && (r[i] = s);
      }
      return r;
    };
    Z.mapValues = _E;
    var Lh = (e, t) => {
      if (e == null) return null;
      let r = {};
      for (let i in e) ~t.indexOf(i) || (r[i] = e[i]);
      return r;
    };
    Z.omit = Lh;
    Z.omit1 = Lh;
    function DE(e, t) {
      let r = {};
      for (let i in e) t(e[i], i) && (r[i] = e[i]);
      return r;
    }
    Z.filterValues = DE;
    function bE(e, t) {
      let r = [];
      for (let i in e) r.push(t(e[i], i));
      return r;
    }
    Z.oMapToArr = bE;
    function EE(e, t, r = (i) => i) {
      let i = {};
      for (let s = 0; s < e.length; s++) {
        let n = e[s];
        i[r(n, s)] = t(n, s);
      }
      return i;
    }
    Z.arrMapToO = EE;
    function AE(e) {
      if (e == null) return !0;
      for (let t in e) if (e.hasOwnProperty(t)) return !1;
      return !0;
    }
    Z.isEmpty = AE;
    var { equalDeep: Oh } = Se();
    Z.equalDeep = Oh;
    Z.equalDeep1 = Oh;
    var TE = (e, t) => {
      let r = {},
        i = {};
      for (let s in e) t(s) ? (r[s] = e[s]) : (i[s] = e[s]);
      return [r, i];
    };
    Z.splitKeys = TE;
    var PE = (e) => {
      for (let t in e) delete e[t];
    };
    Z.deleteAll = PE;
    var NE = (e, t) => {
      if (e == null) return e;
      let r = {};
      for (let i of t) r[i] = e[i];
      return r;
    };
    Z.keepOnly = NE;
    var kE = (e, t) => new Proxy(e, { get: (r, i) => (t.hasOwnProperty(i) ? t[i] : r[i]) });
    Z.override = kE;
    var IE = (e) => {
      for (let t of Object.keys(e)) delete e[t];
    };
    Z.emptyObject = IE;
  });
  var wr = f((Mh) => {
    var FE = (e) => {
      let t = !1,
        r;
      return function () {
        return t || ((t = !0), (r = e.apply(this, arguments))), r;
      };
    };
    Mh.cache0 = FE;
  });
  var An = f((En) => {
    var Bh = (e) => typeof e == "number" || typeof e == "string";
    En.validTextElement = Bh;
    var qE = (e, t) => ({
      getDom: () => e,
      acceptPropagation: Bh,
      applyUpdates: ({ propagationRequest: r }) => {
        r && r.element !== t && ((t = r.element), (e.data = t));
      },
    });
    En.createActiveTextController = qE;
  });
  var Cr = f((Gh) => {
    var LE = { SVG: "http://www.w3.org/2000/svg", MATH: "http://www.w3.org/1998/Math/MathML" },
      OE = (e) => LE[e.toUpperCase()];
    Gh.getNamespace = OE;
  });
  var Vh = f((Jh) => {
    var { IterList: ME } = ie(),
      { CutPoint: BE } = vr(),
      { binarySearch: GE, compareNum: JE } = gr(),
      VE = () => {
        let e = Object.create(UE);
        return (e.list2 = ME()), (e.pointer = BE(e.list2)), e;
      };
    Jh.IncGroups = VE;
    var UE = {
      push(e) {
        if (this.list2.isEmpty()) this.list2.push([e]);
        else {
          this.pointer.reset();
          let t = 0,
            r = !1;
          for (; !this.pointer.endReached();) {
            let i = this.pointer.peek();
            if (e > i[0] && e < i[i.length - 1]) {
              let s = -GE(i, JE(e)) - 1;
              this.pointer.forward(), this.pointer.insert(i.slice(s)), i.splice(s, i.length - s);
              break;
            }
            if ((this.pointer.forward(), e > i[i.length - 1])) {
              let s = e - i[i.length - 1];
              t = t === 0 ? s : Math.min(s, t);
            }
          }
          if (r) this.list2.push([e]);
          else {
            let i = this.list2.lastValue();
            e - i[i.length - 1] === t ? i.push(e) : this.list2.push([e]);
          }
        }
      },
      hasMultiple() {
        return this.list2.hasMultiple();
      },
      toArray() {
        let e = [];
        return (
          this.list2.forEach((t) => {
            e.push({ count: t.length, pos: t[0] });
          }),
          e
        );
      },
    };
  });
  var Wh = f((Uh) => {
    var { isEmpty: WE } = j(),
      { findMinE: HE } = T();
    function zE({ start: e, getKey: t, heuristicCostEstimate: r, getNeighbors: i }) {
      let s = {},
        n = t(e),
        o = { [n]: e },
        a = {},
        l = {};
      l[n] = 0;
      let c = {};
      for (c[n] = r(e); !WE(o);) {
        let u = o[HE(Object.keys(o), (m) => c[m])],
          p = t(u);
        if (r(u) === 0) return $E(p, a);
        delete o[p], (s[p] = u);
        for (let m of i(u)) {
          let d = t(m.node);
          if (s.hasOwnProperty(d)) continue;
          let g = l[p] + m.cost;
          if (isNaN(m.cost)) throw `Cost is required [${d}]`;
          if (!o.hasOwnProperty(d)) o[d] = m.node;
          else if (g >= l[d]) continue;
          (a[d] = { key: p, ...m }), (l[d] = g);
          let y = r(m.node);
          if (isNaN(y)) throw `heuristicCostEstimate is required [${d}]`;
          c[d] = l[d] + y;
        }
      }
    }
    Uh.aStar = zE;
    function $E(e, t) {
      let r = [];
      for (; t.hasOwnProperty(e);) {
        let i = t[e];
        (e = i.key), r.splice(0, 0, i.action);
      }
      return r;
    }
  });
  var Tn = f((Hh) => {
    var ZE = (e, t, r) => {
      let i = r.slice();
      return e < t ? (i.splice(t, 0, r[e]), i.splice(e, 1)) : (i.splice(e, 1), i.splice(t, 0, r[e])), i;
    };
    Hh.moveElement = ZE;
  });
  var Zh = f(($h) => {
    var { aStar: XE } = Wh(),
      { createArray: zh } = T(),
      { moveElement: QE } = Tn(),
      KE = (e) =>
        XE({
          start: { items: zh(e.length), movables: zh(e.length) },
          getKey: ({ items: t, movables: r }) => t.toString() + "|" + r.toString(),
          heuristicCostEstimate: (t) => {
            let r = 0;
            for (let i = t.items.length; i--;) {
              let s = e[t.items[i]];
              for (let n = t.items.length; --n > i;) {
                let o = e[t.items[n]];
                o.pos < s.pos && (r += Math.min(s.count, o.count));
              }
            }
            return r;
          },
          getNeighbors: ({ items: t, movables: r }) => YE(r, t, e),
        });
    $h.aStarMethod = KE;
    function YE(e, t, r) {
      let i = [];
      for (let s of e) {
        let n = e.filter((a) => a !== s),
          o = t.indexOf(s);
        for (let a = t.length + 1; a--;)
          a === o ||
            a === o + 1 ||
            i.push({
              node: { items: QE(o, a, t), movables: n },
              cost: r[s].count,
              action: { from: o, to: a },
            });
      }
      return i;
    }
  });
  var Kh = f((Qh) => {
    var { sort: jE } = T(),
      { chain: Xh } = V(),
      { binarySearch: eA, compareNum: tA } = gr(),
      rA = (e) => {
        let t = e.map((l, c) => ({ index: c, item: l })),
          r = jE(t.slice(), (l) => l.item.count),
          i = [],
          s = [],
          n = (l, c) => {
            s.push({ from: l.index, to: c });
            let u, p;
            c > l.index
              ? ((u = { from: l.index, to: c }), (p = -1), (l.index = c - 1))
              : ((u = { from: c, to: l.index }), (p = 1), (l.index = c));
            for (let m of t) m !== l && m.index >= u.from && m.index < u.to && (m.index += p);
          },
          o = (l, c) => {
            let u = Xh(c === 0 ? 0 : i[c - 1].index, (p) => p + Math.floor((i[c].index - p) / 2));
            n(l, u);
          },
          a = (l, c) => {
            let u = Xh(
              c === i.length ? t.length : i[c].index,
              (p) => p - Math.floor((p - i[c - 1].index) / 2)
            );
            n(l, u);
          };
        for (let l = r.length; l--;) {
          let c = r.pop();
          if (!i.length) i.push(c);
          else {
            let u =
              -eA(
                i,
                tA(c.item.pos, (p) => p.item.pos)
              ) - 1;
            u !== i.length && i[u].index < c.index
              ? o(c, u)
              : u !== 0 && i[u - 1].index > c.index && a(c, u),
              i.splice(u, 0, c);
          }
        }
        return s;
      };
    Qh.pivotSortMethod = rA;
  });
  var jh = f((Yh) => {
    var { aStarMethod: iA } = Zh(),
      { pivotSortMethod: sA } = Kh(),
      nA = (e) => (e.length < 20 ? iA(e) : sA(e));
    Yh.findReorderPath = nA;
  });
  var ru = f((tu) => {
    var { IncGroups: oA } = Vh(),
      { findReorderPath: aA } = jh(),
      { moveElement: lA } = Tn(),
      { IterList: cA } = ie(),
      { chain: hA } = V(),
      { last: eu } = T(),
      uA = () => {
        let e = null,
          t = null;
        return {
          push: (r, i) => {
            t == null && ((t = []), (e = oA())), t.push(r), e.push(i);
          },
          compile: () => {
            if (t?.length)
              if (e.hasMultiple()) {
                let r = e.toArray(),
                  i = aA(r),
                  s = r.map((o) => {
                    let a = t.slice(0, o.count);
                    return t.splice(0, o.count), a;
                  }),
                  n = pA(s, i);
                return {
                  beforeDomRange: hA(n.first.value.current, (o) => ({
                    from: o[0][0].from,
                    to: eu(eu(o)).to,
                  })),
                  actions: n,
                };
              } else return { beforeDomRange: { from: t[0].from, to: t[t.length - 1].to } };
            else return null;
          },
        };
      };
    tu.ReorderPlan = uA;
    function pA(e, t) {
      let r = cA();
      for (let i = 0; i < t.length; i++) {
        let s = t[i];
        (e = lA(s.from, s.to, e)),
          r.unshift({
            current: e,
            move: { from: s.to > s.from ? s.to - 1 : s.to, to: s.to < s.from ? s.from + 1 : s.from },
          });
      }
      return r;
    }
  });
  var vi = f((iu) => {
    var fA = (e) => ({ from: e, to: e });
    iu.singleDomRange = fA;
  });
  var nu = f((_r) => {
    var { singleIterList: su } = ie(),
      { singleDomRange: mA } = vi(),
      dA = (e) => ({ removes: su(e) });
    _r.wrapRemove = dA;
    var gA = (e) => ({ domRanges: { afterRemove: e, afterReorder: e, afterInsert: e } });
    _r.wrapInertPassive = gA;
    var xA = (e) => {
      let t = mA(e);
      return { addings: { toEnds: su(e) }, domRanges: { afterRemove: null, afterReorder: null, afterInsert: t } };
    };
    _r.wrapNewDom = xA;
    var yA = (e) => ({ domRanges: { afterRemove: e, afterReorder: e, afterInsert: e } });
    _r.wrapUpdateDom = yA;
  });
  var Si = f((ou) => {
    var RA = (e, t) => (t == null ? (e ?? null) : e == null ? t : (e.pushList(t), e));
    ou.mergeList = RA;
  });
  var cu = f((lu) => {
    var { IterList: vA } = ie(),
      { mergeList: au } = Si(),
      SA = () => Object.create(wA);
    lu.AddingsBuilder = SA;
    var wA = {
      push(e) {
        e.domRanges?.afterReorder &&
          this.toEnds &&
          (this.inserts || (this.inserts = vA()),
            this.inserts.push({ doms: this.toEnds, beforeDom: e.domRanges.afterReorder.from }),
            (this.toEnds = null)),
          e.addings &&
          ((this.inserts = au(this.inserts, e.addings.inserts)),
            (this.toEnds = au(this.toEnds, e.addings.toEnds)));
      },
      build() {
        return !this.inserts && !this.toEnds ? null : { inserts: this.inserts, toEnds: this.toEnds };
      },
    };
  });
  var pu = f((uu) => {
    var { mergeList: Pn } = Si(),
      { AddingsBuilder: CA } = cu(),
      _A = () => {
        let e = Object.create(DA);
        return (
          (e.addingsB = CA()),
          (e.reorderActions = null),
          (e.removes = null),
          (e.onDones = null),
          (e.domRangesB = bA()),
          e
        );
      };
    uu.UpBuilder = _A;
    var DA = {
      push(e) {
        this.addingsB.push(e),
          (this.reorderActions = Pn(this.reorderActions, e.reorderActions)),
          (this.onDones = Pn(this.onDones, e.onDones)),
          (this.removes = Pn(this.removes, e.removes)),
          this.domRangesB.push(e.domRanges);
      },
      build() {
        return {
          addings: this.addingsB.build(),
          reorderActions: this.reorderActions,
          removes: this.removes,
          onDones: this.onDones,
          domRanges: this.domRangesB.build(),
        };
      },
    },
      hu = (e, t) => (t ? (e ? ((e.to = t.to), e) : Object.assign({}, t)) : e),
      bA = () => {
        let e = null,
          t = null;
        return {
          push: (r) => {
            r && ((e = hu(e, r.afterReorder)), (t = hu(t, r.afterInsert)));
          },
          build: () => (!e && !t ? null : { afterReorder: e, afterInsert: t }),
        };
      };
  });
  var Dr = f((xu) => {
    var { IterList: Nn } = ie(),
      { ReorderPlan: fu } = ru(),
      { singleDomRange: mu } = vi(),
      { wrapNewDom: EA, wrapUpdateDom: AA, wrapInertPassive: TA, wrapRemove: du } = nu(),
      { UpBuilder: PA } = pu(),
      { mergeList: gu } = Si(),
      NA = (e) => {
        let t = Object.create(kA);
        return (
          (t.onDone = e),
          (t.reorderPlan = null),
          (t.onDones = null),
          (t.entries = Nn()),
          (t.upBuilder = PA()),
          (t.finish = t.finish.bind(t)),
          t
        );
      };
    xu.PassiveLoop = NA;
    var kA = {
      onCreated(e) {
        if (e.getDom) {
          let t = e.getDom();
          this.upBuilder.push(EA(t)), this.entries.push(t);
        } else {
          let t = e.retrieveUpdatePackage();
          if (t) {
            this.upBuilder.push(t);
            let r = this.entries.push(t.domRanges?.afterInsert?.from);
            this.onDones || (this.onDones = Nn()),
              this.onDones.push(() => e.mounting.setMounted(r, t.domRanges?.afterInsert));
          } else e.mounting.setMounted(this.entries.push(null), null);
        }
      },
      onUpdated(e, t) {
        let r;
        if (e.getDom) {
          let i = e.getDom(),
            s = mu(i);
          (r = AA(s)),
            this.reorderPlan || (this.reorderPlan = fu()),
            this.reorderPlan.push(s, t),
            this.entries.push(i);
        } else
          (r = e.retrieveUpdatePackage()),
            r || (r = TA(e.mounting.getDomRange())),
            this.entries.pushEntry(e.mounting.getEntry()),
            this.onDones || (this.onDones = Nn()),
            this.onDones.push(() => {
              e.mounting.setDomRange(r.domRanges?.afterInsert);
            }),
            r.domRanges?.afterRemove &&
            (this.reorderPlan || (this.reorderPlan = fu()),
              this.reorderPlan.push(r.domRanges.afterRemove, t));
        this.upBuilder.push(r);
      },
      onRemove(e) {
        if (e.getDom) this.upBuilder.push(du(mu(e.getDom())));
        else {
          let t = e.mounting.getDomRange();
          t && this.upBuilder.push(du(t));
        }
      },
      finish() {
        let e = this.upBuilder.build();
        this.onDones && (e.onDones = gu(e.onDones, this.onDones));
        let t = this.reorderPlan?.compile();
        return (
          t &&
          ((e.reorderActions = gu(e.reorderActions, t.actions)),
            (e.domRanges.afterRemove = t.beforeDomRange)),
          this.onDone?.(e),
          e
        );
      },
    };
  });
  var wi = f((kn) => {
    var IA = (e, t, r) => {
      if (e && !t) throw 230596574;
      for (let i; ;) {
        if (!e) return;
        if (e === t) {
          r(e);
          return;
        } else (i = e), (e = e.nextSibling), r(i);
      }
    };
    kn.iterDoms = IA;
    var FA = (e, t, r) => {
      for (let i; ;) {
        if (!t) return;
        if (t === e) {
          r(t);
          return;
        } else (i = t), (t = t.previousSibling), r(i);
      }
    };
    kn.iterDomsR = FA;
  });
  var Ci = f((vu) => {
    var { iterDoms: yu } = wi(),
      { last: Ru } = T(),
      qA = (e, t, r) => {
        if (
          (r.removes?.forEach((i) => {
            yu(i.from, i.to, (s) => s.remove());
          }),
            r.reorderActions?.forEach((i) => {
              let s =
                i.move.to === i.current.length
                  ? Ru(Ru(i.current)).to.nextSibling
                  : i.current[i.move.to][0].from;
              for (let n of i.current[i.move.from])
                yu(n.from, n.to, (o) => {
                  s ? e.insertBefore(o, s) : e.appendChild(o);
                });
            }),
            r.addings && !window.noAdd)
        ) {
          let i;
          if (
            (r.addings.inserts?.forEach((s) => {
              (i = document.createDocumentFragment()),
                s.doms.forEach((n) => {
                  i.appendChild(n);
                }),
                e.insertBefore(i, s.beforeDom);
            }),
              r.addings.toEnds)
          ) {
            (i = document.createDocumentFragment()),
              r.addings.toEnds.forEach((n) => {
                i.appendChild(n);
              });
            let s = r.domRanges.afterReorder ? r.domRanges.afterReorder.to.nextSibling : t?.();
            s ? e.insertBefore(i, s) : e.appendChild(i);
          }
          delete r.addings;
        }
        r.onDones?.forEach((i) => i());
      };
    vu.execUp = qA;
  });
  var br = f((Su) => {
    var LA = (e, t, r) => {
      let { types: i } = In();
      return i.find((s) => s.check(e)).toChild(e, t, r);
    };
    Su.createActiveChild = LA;
  });
  var Cu = f((Fn) => {
    var { ensureArray: OA } = z(),
      { matchElement: MA } = Er(),
      { getNamespace: BA } = Cr(),
      { createPassiveController: GA } = _i(),
      { PassiveLoop: JA } = Dr(),
      { execUp: VA } = Ci(),
      { createActiveChild: UA } = br(),
      { iterDoms: WA } = wi(),
      HA = ({ props: e, dom: t }) => {
        let r = e.children;
        e = null;
        let i,
          s,
          n = BA(t.tagName);
        return {
          acceptPropagation: wu,
          matchElement: MA,
          mounting: {
            getDomRange: () => null,
            getEntry: () => i,
            setDomRange: () => { },
            setMounted: (o) => {
              i = o;
            },
          },
          retrieveUpdatePackage: () => ({ domRanges: {} }),
          applyUpdates: ({ propagationRequest: o }) => (
            o && (r = o.element.props.children), { propagation: { elements: OA(r) } }
          ),
          createLoop: () =>
            JA((o) => {
              (s = o.domRanges.afterInsert), VA(t, null, o);
            }),
          createActiveChild: (o, a) => UA(o, { namespace: n, parentDom: t }, a),
          createPassiveChild: (o) => GA({ namespace: n, parentDom: t }, o),
          selfDispose: () => {
            s && WA(s.from, s.to, (o) => o.remove());
          },
        };
      };
    Fn.PortalController = HA;
    var wu = (e) => e && e.$$r2_portal;
    Fn.validPortalElement = wu;
  });
  var Tu = f((Au) => {
    var { PassiveLoop: Di } = Dr(),
      { remove1Mutate: zA } = T(),
      { IterList: _u, singleIterList: $A } = ie(),
      { iterDoms: ZA } = wi(),
      XA = (e) => {
        let t = null,
          r = e ? Du() : Eu();
        return {
          setMuting: (i) => {
            (e = i), e ? (r = KA(r, (s) => (r = s))) : (r = QA(r, (s) => (r = s)));
          },
          escalateUpdate: (i, s) => r.escalateUpdate(i, s),
          published: {
            mounting: {
              getDomRange: () => r.getDomRange(),
              setDomRange: (i) => r.setDomRange(i),
              getEntry: () => t,
              setMounted: (i, s) => {
                (t = i), r.setDomRange(s);
              },
            },
            retrieveUpdatePackage: () => r.retrieveUpdatePackage(),
            createLoop: () => r.createLoop(),
          },
        };
      };
    Au.EvilLord = XA;
    var Du = (e = []) => ({
      getDoms: () => e,
      getDomRange: () => null,
      setDomRange: () => { },
      createLoop: () =>
        Di((t) => {
          bu(t, e), t.onDones?.forEach((r) => r());
        }),
      retrieveUpdatePackage: () => ({ domRanges: {} }),
      escalateUpdate: (t, r) => {
        if (
          (t.addings?.inserts?.forEach((i) => {
            let s = e.indexOf(i.beforeDom);
            if (s > -1) e.splice(s, 0, ...i.doms);
            else throw "I don't know where you are";
          }),
            t.addings.toEnds?.isNotEmpty())
        ) {
          let i = r(),
            s = e.indexOf(i);
          s > -1
            ? e.splice(s, 0, ...t.addings.toEnds.toArray())
            : t.addings.toEnds.forEach((n) => e.push(n));
        }
      },
    }),
      bu = (e, t) => {
        e.addings?.inserts?.forEach(() => {
          throw 24235;
        }),
          e.addings?.toEnds?.forEach(t.push.bind(t)),
          e.reorderActions?.forEach(() => {
            throw 34624690;
          }),
          e.removes?.forEach((r) => zA(t, r));
      },
      QA = (e, t) => {
        let r = e.getDoms(),
          i = _u();
        return {
          getDomRange: () => null,
          setDomRange: () => { },
          retrieveUpdatePackage: () => {
            let s = r.length ? { from: r[0], to: r[r.length - 1] } : null;
            t(Eu(s));
            let n = _u();
            return (
              r.forEach(n.push.bind(n)),
              { onDones: i, addings: { toEnds: n }, domRanges: { afterInsert: s } }
            );
          },
          createLoop: () =>
            Di((s) => {
              bu(s, r), i.pushList(s.onDones);
            }),
        };
      },
      KA = (e, t) => {
        let r = e.getDomRange(),
          i = null;
        return {
          getDomRange: () => r,
          setDomRange: () => r,
          retrieveUpdatePackage: () => (
            i.onDones.push(() => {
              let s = [],
                n = i.domRanges.afterInsert;
              n && ZA(n.from, n.to, (o) => s.push(o)), t(Du(s));
            }),
            { removes: $A(r), onDones: i.onDones, domRanges: {} }
          ),
          createLoop: () =>
            Di((s) => {
              (i = s), s.onDones.forEach((n) => n());
            }),
        };
      },
      Eu = (e = null) => {
        let t = null;
        return {
          getDomRange: () => e,
          setDomRange: (r) => {
            e = r;
          },
          retrieveUpdatePackage: () => {
            let r = t;
            return (t = null), r;
          },
          createLoop: () =>
            Di((r) => {
              t = r;
            }),
        };
      };
  });
  var Nu = f((qn) => {
    var { matchElement: YA } = Er(),
      { createActiveChild: jA } = br(),
      { createPassiveController: eT } = _i(),
      { ensureArray: tT } = z(),
      { EvilLord: rT } = Tu(),
      iT = ({ muting: e, next: t }, r) => {
        let i = rT(e),
          s = { ...r, isMuted: () => e || r.isMuted?.(), escalateUpdate: i.escalateUpdate };
        return {
          ...i.published,
          applyUpdates: ({ propagationRequest: n }) => (
            n && ((t = n.element.next), n.element.muting !== e && ((e = n.element.muting), i.setMuting(e))),
            { propagation: { elements: tT(t()) } }
          ),
          matchElement: YA,
          createActiveChild: (n, o) => jA(n, s, o),
          createPassiveChild: (n) => eT(s, n),
          acceptPropagation: Pu,
        };
      };
    qn.MutedController = iT;
    var Pu = (e) => e && e.$_r2_muted_dom;
    qn.validMutedElement = Pu;
  });
  var In = f((ku) => {
    var { createActiveDomController: sT, validDomElement: nT } = bi(),
      { createActiveTextController: oT, validTextElement: aT } = An(),
      { validPortalElement: lT, PortalController: cT } = Cu(),
      { getNamespace: hT } = Cr(),
      { validMutedElement: uT, MutedController: pT } = Nu(),
      fT = [
        {
          check: nT,
          toChild: (e, { namespace: t } = {}, r) => {
            t = t ?? hT(e.type);
            let i = t ? document.createElementNS(t, e.type) : document.createElement(e.type);
            return sT(i, { namespace: t }, e, r);
          },
        },
        { check: aT, toChild: (e) => oT(document.createTextNode(e), e) },
        { check: lT, toChild: cT },
        { check: uT, toChild: pT },
      ];
    ku.types = fT;
  });
  var Er = f((Iu) => {
    var { cache0: mT } = wr(),
      dT = mT(() => {
        let { types: e } = In();
        return e;
      }),
      gT = (e) => dT().find((t) => t.check(e));
    Iu.matchElement = gT;
  });
  var qu = f((Fu) => {
    var xT = (e) => {
      let t = null,
        r = null,
        i = (n) => {
          RT(n, r) || (e.reindexDomRange?.(r, n), (r = n));
        },
        s = () => yT(t) ?? e.resolveNextDom?.();
      return {
        resolveNextDom: s,
        childParams: {
          resolveNextDom: s,
          reindexDomRange: (n, o) => {
            if (!o && !r) throw "Should never happen";
            if (o && !r) e.reindexDomRange?.(r, o), (r = o);
            else if (!o && r) {
              if (n) {
                if (n.to === r.to)
                  if (n.from === r.from) e.reindexDomRange?.(r, o), (r = o);
                  else {
                    let a = { from: r.from, to: n.from.previousSibling };
                    e.reindexDomRange?.(r, a), (r = a);
                  }
                else if (n.from === r.from) {
                  let a = { from: n.to.nextSibling, to: r.to };
                  e.reindexDomRange?.(r, a), (r = a);
                }
              }
            } else {
              let a = !1,
                l = !1;
              if (
                (n?.from === r.from && o.from !== r.from && (a = !0),
                  n?.to === r.to && o.to !== r.to && (l = !0),
                  a || l)
              ) {
                let c = { from: a ? o.from : r.from, to: l ? o.to : r.to };
                e.reindexDomRange?.(r, c), (r = c);
              }
            }
          },
        },
        setAndVerifyDomRange: i,
        published: {
          getDomRange: () => r,
          getEntry: () => t,
          setDomRange: (n) => {
            r = n;
          },
          setMounted: (n, o) => {
            (t = n), (r = o);
          },
        },
      };
    };
    Fu.Mounting = xT;
    var yT = (e) => {
      let t = e.next;
      for (; t;) {
        if (t.value) return t.value;
        t = t.next;
      }
    },
      RT = (e, t) => (!e && !t ? !0 : !e || !t ? !1 : !(e.from !== t.from || e.to !== t.to));
  });
  var _i = f((Mu) => {
    var { matchElement: vT } = Er(),
      { createActiveChild: ST } = br(),
      { PassiveLoop: Lu } = Dr(),
      { execUp: wT } = Ci(),
      { Mounting: CT } = qu(),
      Ou = (e) => {
        let t = CT(e),
          r = Object.assign({}, e, t.childParams),
          i = null;
        return {
          mounting: t.published,
          retrieveUpdatePackage: () => {
            let s = i;
            return (i = null), s;
          },
          createLoop: (s) =>
            Lu(
              s
                ? (n) => {
                  t.setAndVerifyDomRange(n.domRanges?.afterInsert),
                    e.isMuted?.()
                      ? e.escalateUpdate(n, t.resolveNextDom)
                      : wT(e.parentDom, t.resolveNextDom, n);
                }
                : (n) => {
                  i = n;
                }
            ),
          matchElement: vT,
          createActiveChild: (s, n) => ST(s, r, n),
          createPassiveChild: (s) => Ou(r, s),
        };
      };
    Mu.createPassiveController = Ou;
  });
  var Ln = f((Bu) => {
    var _T =
      (e) =>
        (t, { dom: r, skip1stPass: i }) => (
          e === "fillRule" && (e = "fill-rule"),
          t != null && !i && r.setAttribute(e, t),
          {
            update: (s) => {
              s !== t && ((t = s), t != null ? r.setAttribute(e, t) : r.removeAttribute(e));
            },
            dispose: () => {
              t != null && r.removeAttribute(e);
            },
          }
        );
    Bu.defaultType = _T;
  });
  var Ju = f((Gu) => {
    var DT = [
      "height",
      "width",
      "top",
      "left",
      "bottom",
      "right",
      "paddingLeft",
      "paddingRight",
      "paddingTop",
      "paddingBottom",
      "marginLeft",
      "marginRight",
      "marginTop",
      "marginBottom",
      "fontSize",
    ];
    Gu.pxAttrs = DT;
  });
  var Wu = f((Uu) => {
    var { AttrsUpdater: bT } = bn(),
      { arrMapToO: ET } = j(),
      { pxAttrs: AT } = Ju(),
      TT = (e, { dom: t, skip1stPass: r }) => {
        let i = () => bT({ createNewAttrUpdater: (n, o) => (kT[n] ?? PT(n))(o, { dom: t, skip1stPass: r }) }),
          s = i();
        return (
          s.update(e),
          {
            update: (n) => {
              n ? (s || (s = i()), s.update(n)) : (s.dispose(), (s = null));
            },
            dispose: () => {
              t.removeAttribute("style");
            },
          }
        );
      };
    Uu.styleType = TT;
    var PT = (e) => (
      (e = Vu[e] ?? e),
      (t, { dom: r, skip1stPass: i }) => {
        let s = r.style,
          n = (() => {
            let o = e.startsWith("--");
            return (a) => {
              o ? s.setProperty(e, a) : (s[e] = a);
            };
          })();
        return (
          i || n(t),
          {
            update: (o) => {
              t !== o && ((t = o), n(t));
            },
            dispose: () => {
              r.style.removeProperty(e);
            },
          }
        );
      }
    ),
      Vu = { float: "cssFloat", zIndex: "z-index", paddingTop: "padding-top" },
      NT = (e) => (
        (e = Vu[e] ?? e),
        (t, { dom: r, skip1stPass: i }) => (
          i || (r.style[e] = typeof t == "number" ? t + "px" : t),
          {
            update: (s) => {
              t !== s && ((t = s), (r.style[e] = typeof t == "number" ? t + "px" : t));
            },
            dispose: () => {
              r.style.removeProperty(e);
            },
          }
        )
      ),
      kT = ET(AT, NT);
  });
  var zu = f((Hu) => {
    var { cache0: IT } = wr(),
      FT = ({ isSchedulerEmpty: e, dom: t }) => {
        let r,
          i,
          s = IT(() => {
            let n = (o) => {
              i && r
                ? ((r.value = t.value), i.value(o), e() && (t.value = r.value))
                : i
                  ? i.value(o)
                  : (t.value = r.value);
            };
            t.addEventListener("input", n, { capture: !0 });
          });
        return {
          value: (n) => (
            (r = { value: n }),
            (n = null),
            (t.value = r.value),
            s(),
            {
              update: (o) => {
                r.value !== o &&
                  ((r.value = o), r.value.length === o.length ? qT(o, t) : (t.value = r.value));
              },
              dispose: () => {
                (r = null), t.removeAttribute("value");
              },
            }
          ),
          onChange: (n) => (
            (i = { value: n }),
            (n = null),
            s(),
            {
              update: (o) => {
                i.value = o;
              },
              dispose: () => {
                i = null;
              },
            }
          ),
        };
      };
    Hu.valueOnchange = FT;
    var qT = (e, t) => {
      let r = {};
      (r.selectionStart = t.selectionStart),
        (r.selectionEnd = t.selectionEnd),
        (r.scrollLeft = t.scrollLeft),
        (r.scrollTop = t.scrollTop),
        (t.value = e),
        (t.selectionStart = r.selectionStart),
        (t.selectionEnd = r.selectionEnd),
        (t.scrollLeft = (() => {
          let i = t.scrollWidth - t.clientWidth;
          return r.selectionEnd === e.length && r.scrollLeft > i - 7 ? i : r.scrollLeft;
        })()),
        (t.scrollTop = r.scrollTop);
    };
  });
  var Zu = f(($u) => {
    var LT =
      (e) =>
        (t, { dom: r, skip1stPass: i }) => (
          i || (r[e] = t),
          {
            update: (s) => {
              t !== s && ((t = s), (r[e] = t));
            },
            dispose: () => {
              r.removeAttribute(e);
            },
          }
        );
    $u.booleanType = LT;
  });
  var Ei = f((te) => {
    var { chain: fJ } = V(),
      Xu = (e, t = 2) => {
        for (e = "" + e; e.length < t;) e = "0" + e;
        return e;
      };
    te.paddingLeft = Xu;
    te.paddingLeft1 = Xu;
    var OT = (e, t = 2) => Qu(e, { length: t });
    te.paddingRight = OT;
    var Qu = (e, { length: t = 2, padChar: r = "0" } = {}) => (
      typeof e != "string" && (e = "" + e), e + r.repeat(Math.max(0, t - e.length))
    );
    te.paddingRight2 = Qu;
    var MT = function (e) {
      let t = "";
      for (let r = e.length - 1; r > -1; r--) t += e[r];
      return t;
    };
    te.reverse = MT;
    var Ku = function (e) {
      let t = 0,
        r,
        i;
      if (e.length === 0) return t;
      for (r = 0; r < e.length; r++) (i = e.charCodeAt(r)), (t = (t << 5) - t + i), (t |= 0);
      return t < 0 ? -t : t;
    };
    te.hashCode = Ku;
    var BT = (e, t) => e[Ku(t) % e.length];
    te.selectByHash = BT;
    var GT = (...e) => {
      for (let t = 0; ; t++) {
        if (e[0] == null ? t === 0 : t === e[0].length) return e[0];
        for (let r of e) if (r != null && r[t] !== e[0][t]) return e[0].substring(0, t);
      }
    };
    te.commonStart = GT;
    var JT = (e) => e[0].toUpperCase() + e.substring(1);
    te.upperCase1 = JT;
    var VT = (e) => e[0].toLowerCase() + e.substring(1);
    te.lowerCase1 = VT;
    var Yu = (e) => e != null && typeof e == "string" && e.trim() !== "";
    te.isNotBlank = Yu;
    var UT = (e) => e.replace(/\s{2,}/g, " ");
    te.deepTrim = UT;
    var WT = (e) => !Yu(e);
    te.isBlank = WT;
    var HT = (e, t) => {
      let r = 0,
        i = 0;
      for (let s; (s = t.indexOf(e, r)) > -1;) i++, (r = s + e.length);
      return i;
    };
    te.countHappens = HT;
    var zT = (e, t) => {
      let r = "";
      for (let i = 0; i < t; i++) r += e;
      return r;
    };
    te.createString = zT;
  });
  var ep = f((ju) => {
    var $T =
      (e, t) =>
        (r, { dom: i }) => {
          let s = (n) => r(n);
          return (
            i.addEventListener(e, s, t),
            {
              update: (n) => (r = n),
              dispose: () => {
                i.removeEventListener(e, s);
              },
            }
          );
        };
    ju.eventType = $T;
  });
  var rp = f((tp) => {
    var { upperCase1: ZT } = Ei(),
      { arrMapToO: XT } = j(),
      { eventType: QT } = ep(),
      KT = [
        { name: "blur" },
        { name: "click" },
        { name: "double click", domEventName: "dblclick" },
        { name: "drag over" },
        { name: "drag enter" },
        { name: "drag leave" },
        { name: "drop" },
        { name: "mouse down" },
        { name: "mouse up" },
        { name: "mouse move" },
        { name: "mouse enter" },
        { name: "mouse leave" },
        { name: "mouse over" },
        { name: "mouse out" },
        { name: "context menu" },
        { name: "wheel" },
        { name: "touch start", options: { passive: !0 } },
        { name: "touch end", options: { passive: !0 } },
        { name: "touch cancel", options: { passive: !0 } },
        { name: "touch move", options: { passive: !0 } },
        { name: "focus" },
        { name: "input" },
      ],
      YT = ({ name: e, domEventName: t }) => t || e.split(" ").join("").toLowerCase(),
      jT = (e) =>
        "on" +
        e
          .split(" ")
          .map((r) => ZT(r))
          .join(""),
      e2 = XT(
        KT,
        (e) => QT(YT(e), e.options),
        (e) => jT(e.name)
      );
    tp.eventTypes = e2;
  });
  var sp = f((ip) => {
    var { arrMapToO: t2 } = j(),
      { defaultType: r2 } = Ln(),
      { styleType: i2 } = Wu(),
      { valueOnchange: s2 } = zu(),
      { booleanType: n2 } = Zu(),
      { eventTypes: o2 } = rp(),
      a2 = { className: r2("class"), ...t2(["disabled", "checked", "readonly"], n2), ...o2, style: i2 },
      l2 = ({ isSchedulerEmpty: e, dom: t }) => {
        let r = s2({ isSchedulerEmpty: e, dom: t });
        return { getType: (i) => r[i] ?? a2[i] };
      };
    ip.AttrTypes = l2;
  });
  var bi = f((Mn) => {
    var { AttrsUpdater: c2 } = bn(),
      { omit: np } = j(),
      { ensureArray: h2 } = z(),
      { createPassiveController: u2 } = _i(),
      { matchElement: p2 } = Er(),
      { createActiveChild: f2 } = br(),
      { isValidElement: m2 } = $(),
      { AttrTypes: d2 } = sp(),
      { defaultType: g2 } = Ln(),
      { PassiveLoop: x2 } = Dr(),
      { execUp: y2 } = Ci(),
      op = (e) => e && m2(e) && typeof e.type == "string";
    Mn.validDomElement = op;
    var R2 = (
      e,
      { namespace: t } = {},
      { props: r = {}, key: i, ref: s, type: n } = {},
      { skipRawAttrs: o, isSchedulerEmpty: a } = {}
    ) => {
      let l = r.children,
        c = d2({ isSchedulerEmpty: a, dom: e }),
        u = c2({ createNewAttrUpdater: (p, m) => (c.getType(p) ?? g2(p))(m, { dom: e, skip1stPass: o }) });
      return (
        u.update(np(r, ["children"]), { skipRawAttrs: o }),
        (r = void 0),
        {
          getDom: () => e,
          key: i,
          acceptPropagation: (p) => op(p) && p.key === i && n === p.type,
          matchElement: p2,
          applyUpdates: ({ propagationRequest: p }) => (
            p && ((l = p.element.props.children), (s = p.element.ref)),
            s && On(null, s),
            p && u.update(np(p.element.props, ["children"])),
            s && On(e, s),
            { propagation: { elements: h2(l) } }
          ),
          createLoop: () =>
            x2((p) => {
              y2(e, null, p);
            }),
          createActiveChild: (p, m) => f2(p, { namespace: t, parentDom: e }, m),
          createPassiveChild: (p) => u2({ namespace: t, parentDom: e }, p),
          selfDispose: () => {
            s && On(null, s);
          },
        }
      );
    };
    Mn.createActiveDomController = R2;
    var On = (e, t) => {
      if (t != null)
        if (typeof t == "function") t(e);
        else if (t.hasOwnProperty("current")) t.current = e;
        else throw (console.log("ref", t), "Unsupported ref " + t);
    };
  });
  var Bn = f((ap) => {
    var { createActiveDomController: v2 } = bi(),
      { getNamespace: S2 } = Cr(),
      w2 = ({ dom: e }) => ({
        ...v2(e, { namespace: e && S2(e.tagName) }),
        rootDestroy: () => {
          for (let t; (t = e.lastChild);) t.remove();
        },
      });
    ap.DomRootController = w2;
  });
  var cp = f((Vn) => {
    var { Fragment: C2 } = $(),
      { ensureArray: lp } = z(),
      Jn = (e) => {
        let t = lp(e.props.children),
          r = e.key;
        return (
          (e = null),
          {
            matchElement: Gn.matchElement,
            createActiveChild: Jn,
            key: r,
            acceptPropagation: (i) => Gn.matchElement(i) && i.key === r,
            applyUpdates: ({ propagationRequest: i }) => (
              i && (t = lp(i.element.props.children)), { propagation: { elements: t } }
            ),
          }
        );
      };
    Vn.FragmentActiveController = Jn;
    var Gn = { matchElement: (e) => e && e.type && (e.type.$_r2_fragment || e.type === C2), createActiveChild: Jn };
    Vn.FragmentController = () => Gn;
  });
  var fp = f((pp) => {
    var hp = (e) => ({
      matchElement: (t) => t && Array.isArray(t),
      createActiveChild: hp,
      acceptPropagation: up.matchElement,
      applyUpdates: ({ propagationRequest: t }) => (t && (e = t.element), { propagation: { elements: e } }),
    }),
      up = (() => ({ matchElement: (e) => e && Array.isArray(e), createActiveChild: hp }))();
    pp.ArrayController = () => up;
  });
  var bt = f((mp) => {
    var _2 = (() => {
      let e = (() => { }).__proto__;
      return (t) => t.__proto__ === e;
    })();
    mp.isPureFunction = _2;
  });
  var xp = f((gp) => {
    var { isValidElement: D2 } = $(),
      { isPureFunction: b2 } = bt(),
      { ensureArray: E2 } = z(),
      { isEmpty: A2, omit: T2 } = j(),
      dp = ({ handleException: e, legacyContexts: t } = {}) => ({
        matchElement: (r) => r && D2(r) && typeof r.type == "function" && !b2(r.type) && !r.type.$_r2_shadow,
        handleException: e,
        createActiveChild: (r, i) =>
          P2(r, { legacyContexts: t }, e ? Object.assign({}, i, { handleException: e }) : i),
      });
    gp.ComponentController = dp;
    var P2 = (e, { legacyContexts: t }, { onRequestUpdate: r, handleException: i, findPassiveController: s }) => {
      let n = e.type,
        { key: o, ref: a } = e,
        l = N2(n.defaultProps),
        c = L2(t, n.contextTypes),
        u = new n(e.props, c.getContext());
      (u.props = l(e.props)),
        (u._r2_findPassiveController = s),
        n.childContextTypes &&
        u.getChildContext &&
        (t = (t ?? []).concat([
          F2({ getChildContext: () => u.getChildContext(), childContextTypes: n.childContextTypes }),
        ])),
        (e = null),
        (u.updater = {
          enqueueSetState: (m, d, g) => {
            r({ type: "setState", value: d, cb: g });
          },
          enqueueForceUpdate: (m, d) => {
            r({ type: "forceUpdate", cb: d });
          },
        }),
        (i = u.componentDidCatch ? k2(u, n) : i);
      let p = dp({ handleException: i, legacyContexts: t });
      return Object.assign({}, p, {
        key: o,
        createPassiveChild: () => p,
        applyUpdates: ({ propagationRequest: m, updateRequests: d = [], isFirstRun: g }) => {
          let y = [],
            x = !1,
            R = u.state,
            w = u.props,
            b = u.context;
          g &&
            (u.componentWillMount || u.UNSAFE_componentWillMount) &&
            (u.componentWillMount ?? u.UNSAFE_componentWillMount)?.apply(u);
          let k = I2(u);
          k && y.push(k);
          for (let F of d)
            F.type === "setState"
              ? typeof F.value == "function"
                ? (R = Object.assign({}, R, F.value(R)))
                : (R = Object.assign({}, R, F.value))
              : F.type === "forceUpdate" && (x = !0),
              F.cb && y.push(F.cb);
          if (
            (m && ((w = m.element.props), (b = c.getContext()), (a = m.element.ref)),
              n.getDerivedStateFromProps)
          ) {
            let F = n.getDerivedStateFromProps(w, R);
            F && (R = Object.assign({}, R, F));
          }
          (w = l(w)),
            !g &&
            u.componentWillReceiveProps != null &&
            w !== u.props &&
            n.getDerivedStateFromProps == null &&
            u.componentWillReceiveProps(w, b);
          let M = !g && !x && !(u.shouldComponentUpdate?.(w, R, b) ?? !0);
          return (
            M || ((u.context = b), (u.props = w), (u.state = R)),
            a && (a(null), y.push(() => a(u))),
            g && u.componentDidMount && y.push(u.componentDidMount.bind(u)),
            {
              propagation: M || !u.render ? null : { elements: E2(u.render()) },
              onCommit: y.length && (() => y.forEach((F) => F())),
            }
          );
        },
        acceptPropagation: (m) => p.matchElement(m) && m.key === o && m.type === n,
        selfDispose: () => {
          a?.(null), u.componentWillUnmount?.(), c.dispose?.();
        },
      });
    },
      N2 = (e) => (t) => (t === void 0 ? e : t),
      k2 = (e, t) => (r) => {
        t && t.getDerivedStateFromError != null && e.setState(t.getDerivedStateFromError(r)),
          e.componentDidCatch != null && e.componentDidCatch(r);
      },
      I2 = (e) => {
        if (!e.componentDidUpdate) return null;
        let t = e.props,
          r = e.state,
          i = e.getSnapshotBeforeUpdate?.(t, r);
        return () => {
          e.componentDidUpdate(t, r, i);
        };
      },
      F2 = ({ getChildContext: e, childContextTypes: t }) => ({ childContextTypes: t, getChildContext: e }),
      q2 = { getContext: () => ({}) },
      L2 = (e, t) => {
        if (!t || !e?.length) return q2;
        let r = (() => {
          let i = [],
            s = t;
          for (let n = e.length - 1; !A2(s) && n > -1; n--) {
            let o = e[n],
              a = Object.keys(s).filter((l) => o.childContextTypes[l]);
            (s = T2(s, a)),
              i.push({
                setValues: (l) => {
                  let c = o.getChildContext();
                  for (let u of a) l[u] = c[u];
                },
              });
          }
          return i;
        })();
        return {
          getContext: () => {
            let i = {};
            for (let s of r) s.setValues(i);
            return i;
          },
        };
      };
  });
  var vp = f((Rp) => {
    var O2 = () => ({ acceptPropagation: yp.matchElement }),
      yp = (() => ({ matchElement: (e) => e == null || e === !1 || e === !0, createActiveChild: O2 }))();
    Rp.NullController = () => yp;
  });
  var Un = f((wp) => {
    var { remove1Mutate: M2 } = T(),
      B2 = () => {
        let e = [];
        return {
          eachValue: (t) => e.forEach((r) => t(r.getValue())),
          matchElement: Sp,
          createActiveChild: (t) => {
            let r = G2(t);
            return e.push(r), r.setDispose(() => M2(e, r)), r;
          },
        };
      };
    wp.ShadowReturnRootController = B2;
    var G2 = (e) => {
      let t = e.props.collectValue,
        r = e.key;
      e = void 0;
      let i;
      return {
        setDispose: (s) => (i = s),
        getValue: () => t,
        key: r,
        acceptPropagation: (s) => Sp(s) && r === s.key,
        applyUpdates: ({ propagationRequest: s }) => (s && (t = s.element.props.collectValue), {}),
        selfDispose: () => i(),
      };
    },
      Sp = (e) => e && typeof e == "object" && e.$_r2_return;
  });
  var Wn = f((_p) => {
    var Cp = ({ collectValue: e }) => ({ $_r2_return: !0, props: { collectValue: e } });
    Cp.$_r2_return = !0;
    _p.ShadowReturn = Cp;
  });
  var Hn = f((Dp) => {
    var J2 = (e) => {
      let t = null;
      return e.eachValue((r) => (t = r(t))), t;
    };
    Dp.extractShadowValues = J2;
  });
  var $n = f((bp) => {
    var { ShadowReturn: zn } = Wn(),
      V2 = {
        accept: (e) => zn({ collectValue: U2(e) }),
        acceptName: (e) => (t) => zn({ collectValue: W2(e, t) }),
        acceptValue: (e) => zn({ collectValue: H2(e) }),
      };
    bp.renderShadowParams = V2;
    var U2 = (e) => (t) => (t ? (t.push(e), t) : [e]),
      W2 = (e, t) => (r) => (r == null ? { [e]: t } : ((r[e] = t), r)),
      H2 = (e) => (t) => e;
  });
  var Xn = f((Zn) => {
    var { isValidElement: z2 } = $(),
      { ensureArray: $2 } = z(),
      { ShadowReturnRootController: Z2 } = Un(),
      { createRootNode: X2 } = Rr(),
      { renderUpdates: Q2 } = Sr(),
      { ShadowReturn: TJ } = Wn(),
      { chain: K2 } = V(),
      { extractShadowValues: Ep } = Hn(),
      { renderShadowParams: Y2 } = $n(),
      j2 = (e, { onRequestUpdate: t, createUpdateRequest: r, isSchedulerEmpty: i, findPassiveController: s }) => {
        let n = K2(
          s((o) => o.getAllContexts?.()),
          (o) =>
            o?.map((a) =>
              Object.assign({}, a, {
                registerListener: (l) =>
                  a.registerListener((c) => {
                    let u = l(c);
                    return r(u);
                  }),
              })
            )
        );
        return Ap(e, { onRequestUpdate: t, contexts: n, isSchedulerEmpty: i });
      },
      Ap = (e, { onRequestUpdate: t, contexts: r, isSchedulerEmpty: i }) => {
        let { renderShadow: s, next: n } = e.props,
          o = e.key;
        e = void 0;
        let a = Z2(),
          { createBaseControllers: l } = Ar(),
          c = X2({ controllers: [...l({ contexts: r }), a] });
        return Object.assign({}, Ai, {
          key: o,
          acceptPropagation: (u) => Ai.matchElement(u) && o === u.key,
          createPassiveChild: () => Ai,
          applyUpdates: ({ propagationRequest: u, updateRequests: p, isFirstRun: m }) => {
            u && ((s = u.element.props.renderShadow), (n = u.element.props.next));
            let d = !u && !m ? p : [c.createUpdate(s(Y2))].concat(p ?? []),
              g = Q2({ updates: d, onRequestUpdate: t, isSchedulerEmpty: i });
            return { propagation: { elements: $2(n?.(Ep(a))) }, onCommit: g };
          },
          getValues: () => Ep(a),
          selfDispose: () => c.destroy(),
        });
      };
    Zn.ShadowActiveController1 = Ap;
    var eP = () => ({ matchElement: (e) => e && z2(e) && e.type.$_r2_shadow, createActiveChild: j2 }),
      Ai = eP();
    Zn.ShadowController = () => Ai;
  });
  var Np = f((Pp) => {
    var { isValidElement: tP } = $(),
      { ensureArray: rP } = z(),
      { addRemove: iP } = T(),
      { isPureFunction: sP } = bt(),
      Tp = ({ contexts: e = [] } = {}) => ({
        matchElement: (t) =>
          t &&
          tP(t) &&
          (t.type.$$typeof === Symbol.for("react.provider") || (sP(t.type) && t.type._contextRef)),
        getAllContexts: () => e,
        registerContextListener: ({ context: t, createUpdateRequest: r }) => {
          let i = e.find((s) => s.context === t);
          if (i) {
            let s = i.registerListener(r);
            return { getValue: i.getValue, removeListener: s };
          }
        },
        createActiveChild: (t) => nP(t, e),
      });
    Pp.ContextController = Tp;
    var nP = (e, t) => {
      let { key: r, type: i } = e,
        { children: s, value: n } = e.props;
      e = null;
      let o = [],
        a = t
          .filter((c) => c.context !== i)
          .concat([{ context: i, getValue: () => n, registerListener: iP(o) }]),
        l = Tp({ contexts: a });
      return Object.assign({}, l, {
        key: r,
        acceptPropagation: (c) => l.matchElement(c) && c.key === r && c.type.Provider === i.Provider,
        applyUpdates: ({ propagationRequest: c }) => (
          c && ((s = c.element.props.children), (n = c.element.props.value)),
          { propagation: { elements: rP(s) }, jumpUpdates: o.map((u) => u(n)) }
        ),
      });
    };
  });
  var Ip = f((kp) => {
    var { isValidElement: oP } = $(),
      { ensureArray: aP } = z(),
      { isPureFunction: lP } = bt(),
      cP = (e, { createUpdateRequest: t, findPassiveController: r }) => {
        let { key: i, type: s } = e,
          { children: n } = e.props;
        e = null;
        let o = r((c) => c.registerContextListener?.({ context: hP(s), createUpdateRequest: t })),
          a = o?.getValue();
        return Object.assign({}, Ti, {
          key: i,
          acceptPropagation: (c) => Ti.matchElement(c) && c.key === i && c.type._context === s._context,
          createPassiveChild: () => Ti,
          applyUpdates: ({ propagationRequest: c, updateRequests: u }) => (
            c && (n = c.element.props.children),
            o && u?.length && (a = o.getValue()),
            { propagation: { elements: aP(n(a)) } }
          ),
          selfDispose:
            o &&
            (() => {
              o?.removeListener();
            }),
        });
      },
      hP = (e) => (e._context ? e._context.Provider : e.Provider),
      uP = () => ({
        matchElement: (e) =>
          e &&
          oP(e) &&
          (e.type.$$typeof === Symbol.for("react.context") || (lP(e.type) && e.type.contextType)),
        createActiveChild: cP,
      }),
      Ti = uP();
    kp.ConsumerController = () => Ti;
  });
  var qp = f((Fp) => {
    var pP = ({ onRequestUpdate: e }) => {
      let t;
      return {
        setup1: () => {
          let r = [];
          return {
            hook: (i) => {
              r.push(i);
              let s = r.length - 1;
              return [i, (n) => e({ type: "setState", newValue: n, stateIndex: s })];
            },
            commit: () => {
              r.length && (t = r);
            },
          };
        },
        setup2: (r) => {
          if (!t) return null;
          for (let s of r) s.type === "setState" && (t[s.stateIndex] = s.newValue);
          let i = 0;
          return () => {
            let s = i++;
            return [t[s], (n) => e({ type: "setState", newValue: n, stateIndex: s })];
          };
        },
      };
    };
    Fp.StateHook = pP;
  });
  var Op = f((Lp) => {
    var FJ = $(),
      fP = (e, t, r, i) => {
        let s = i.current;
        try {
          return (i.current = e), t();
        } finally {
          r?.(), (i.current = s);
        }
      };
    Lp.swapDispatcher = fP;
  });
  var Bp = f((Mp) => {
    var { arrEquals: mP } = T(),
      dP = () => {
        let e;
        return {
          setup1: () => {
            let t = [];
            return {
              hook: (r, i) => {
                t.push({ fn: r, watches: i });
              },
              commit: () => {
                t.length &&
                  (t.forEach((r) => {
                    r.cleanup = r.fn();
                  }),
                    (e = t));
              },
            };
          },
          setup2: () => {
            if (!e) return;
            let t = 0,
              r = [];
            return {
              hook: (i, s) => {
                let n = t++,
                  o = e[n];
                (o.fn = i),
                  r.push(() => {
                    mP(o.watches, s) || ((o.watches = s), o.cleanup?.(), (o.cleanup = o.fn()));
                  });
              },
              commit: () => {
                r.forEach((i) => i());
              },
            };
          },
          dispose: () => {
            e?.forEach((t) => {
              t.cleanup?.();
            });
          },
        };
      };
    Mp.EffectHook = dP;
  });
  var Jp = f((Gp) => {
    var gP = ({ createUpdateRequest: e, findPassiveController: t }) => {
      let r;
      return {
        setup1: () => {
          let i = [];
          return {
            hook: (s) => {
              let n = t((l) =>
                l.registerContextListener?.({
                  context: s,
                  createUpdateRequest: () => e({ type: "context", index: a }),
                })
              ),
                o = n?.getValue();
              i.push({ value: o, context: n });
              let a = i.length - 1;
              return o;
            },
            commit: () => {
              i.length && (r = i);
            },
          };
        },
        setup2: (i) => {
          if (!r) return;
          for (let n of i)
            if (n.type === "context") {
              let o = r[n.index];
              o.value = o.context?.getValue();
            }
          let s = 0;
          return () => {
            let n = s++;
            return r[n].value;
          };
        },
        dispose: () => {
          r?.forEach((i) => i.context?.removeListener());
        },
      };
    };
    Gp.ContextHook = gP;
  });
  var Up = f((Vp) => {
    var xP = ({ onRequestUpdate: e }) => {
      let t;
      return {
        setup1: () => {
          let r = [];
          return {
            hook: (i, s, n) => {
              let o = n ? n(s) : s;
              r.push({ reducer: i, value: o });
              let a = r.length - 1;
              return [o, (l) => e({ type: "reducer", action: l, reducerIndex: a })];
            },
            commit: () => {
              r.length && (t = r);
            },
          };
        },
        setup2: (r) => {
          if (!t) return;
          for (let s of r)
            if (s.type === "reducer") {
              let n = t[s.reducerIndex];
              n.value = n.reducer(n.value, s.action);
            }
          let i = 0;
          return () => {
            let s = i++;
            return [t[s].value, (n) => e({ type: "reducer", action: n, reducerIndex: s })];
          };
        },
      };
    };
    Vp.ReducerHook = xP;
  });
  var Hp = f((Wp) => {
    var { arrEquals: yP } = T(),
      RP = () => {
        let e;
        return {
          setup1: () => {
            let t = [];
            return {
              hook: (r, i) => {
                let s = r();
                return t.push({ fn: r, value: s, watches: i }), s;
              },
              commit: () => {
                t.length && (e = t);
              },
            };
          },
          setup2: () => {
            if (!e) return;
            let t = 0;
            return (r, i) => {
              let s = t++,
                n = e[s];
              return (n.fn = r), yP(n.watches, i) || ((n.watches = i), (n.value = n.fn())), n.value;
            };
          },
        };
      };
    Wp.MemoHook = RP;
  });
  var $p = f((zp) => {
    var vP = () => {
      let e;
      return {
        setup1: () => {
          let t = [];
          return {
            hook: (r) => {
              t.push(r);
              let i = t.length - 1;
              return Object.assign((s) => (t[i] = s), { current: r });
            },
            commit: () => {
              t.length && (e = t);
            },
          };
        },
        setup2: () => {
          if (!e) return;
          let t = 0;
          return () => {
            let r = t++,
              i = e[r];
            return Object.assign((s) => (e[r] = s), { current: i });
          };
        },
      };
    };
    zp.RefHook = vP;
  });
  var Kp = f((Qp) => {
    var SP = $(),
      { ensureArray: Zp } = z(),
      { StateHook: wP } = qp(),
      { swapDispatcher: Xp } = Op(),
      { EffectHook: CP } = Bp(),
      { ContextHook: _P } = Jp(),
      { ReducerHook: DP } = Up(),
      { MemoHook: bP } = Hp(),
      { RefHook: EP } = $p(),
      AP = ({ onRequestUpdate: e, createUpdateRequest: t, findPassiveController: r }) => {
        let i = SP.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        if (!i) return null;
        let s = wP({ onRequestUpdate: e }),
          n = DP({ onRequestUpdate: e }),
          o = CP(),
          a = bP(),
          l = EP(),
          c = _P({ createUpdateRequest: t, findPassiveController: r });
        return {
          run1: (u) => {
            let p = o.setup1(),
              m = a.setup1(),
              d = n.setup1(),
              g = s.setup1(),
              y = c.setup1(),
              x = l.setup1(),
              R = m.hook;
            return Xp(
              {
                useState: g.hook,
                useReducer: d.hook,
                useEffect: p.hook,
                useMemo: R,
                useCallback: (w, b) => R(() => w, b),
                useContext: y.hook,
                useRef: x.hook,
              },
              () => ({ propagation: { elements: Zp(u()) } }),
              () => {
                g.commit(), d.commit(), p.commit(), m.commit(), x.commit(), y.commit();
              },
              i.ReactCurrentDispatcher
            );
          },
          run2: (u, p) => {
            let m = o.setup2(),
              d = a.setup2(),
              g = c.setup2(u);
            return Xp(
              {
                useState: s.setup2(u),
                useReducer: n.setup2(u),
                useEffect: m?.hook,
                useMemo: d,
                useCallback: (y, x) => d(() => y, x),
                useContext: g,
                useRef: l.setup2?.(),
              },
              () => ({ propagation: { elements: Zp(p()) } }),
              m?.commit,
              i.ReactCurrentDispatcher
            );
          },
          dispose: () => {
            o.dispose(), c.dispose();
          },
        };
      };
    Qp.createHooksSupport = AP;
  });
  var jp = f((Yp) => {
    var { isValidElement: TP } = $(),
      { isPureFunction: PP } = bt(),
      { createHooksSupport: NP } = Kp(),
      kP = (e, { onRequestUpdate: t, createUpdateRequest: r, findPassiveController: i }) => {
        let s = e.type,
          n = e.key,
          o = e.props,
          a = e.ref;
        e = null;
        let l = NP({ onRequestUpdate: t, createUpdateRequest: r, findPassiveController: i });
        return Object.assign({}, Qn, {
          key: n,
          applyUpdates: ({ propagationRequest: c, updateRequests: u = [], isFirstRun: p }) => (
            c && ((o = c.element.props), (a = c.element.ref)),
            l ? (p ? l.run1(() => s(o, a)) : l.run2(u, () => s(o, a))) : s(o, a)
          ),
          selfDispose: l?.dispose,
          acceptPropagation: (c) => Qn.matchElement(c) && c.key === n && c.type === s,
        });
      },
      IP = () => ({
        matchElement: (e) => e && TP(e) && typeof e.type == "function" && PP(e.type),
        createActiveChild: kP,
      }),
      Qn = IP();
    Yp.FunctionalController = () => Qn;
  });
  var tf = f((ef) => {
    var FP = ({ muting: e, next: t }) => ({ $_r2_muted_dom: !0, muting: e, next: t });
    ef.MutedDom = FP;
  });
  var nf = f((sf) => {
    var { isValidElement: qP } = $(),
      { ensureArray: Pi } = z(),
      { remove1Mutate: LP } = T(),
      { MutedDom: rf } = tf(),
      OP = (e, { onRequestUpdate: t }) => {
        let r = Pi(e.props.children),
          i = Pi(e.props.fallback),
          s = e.key;
        e = null;
        let n = [],
          o = !1,
          a = () => {
            let l = !!n.find((c) => c.isStillWaiting());
            l !== o && ((o = l), t());
          };
        return Object.assign({}, Kn, {
          key: s,
          acceptPropagation: (l) => Kn.matchElement(l) && l.key === s,
          applyUpdates: ({ propagationRequest: l }) => (
            l && ((r = Pi(l.element.props.children)), (i = Pi(l.element.props.fallback))),
            {
              propagation: {
                elements: o
                  ? [rf({ muting: !0, next: () => r }), i]
                  : [rf({ muting: !1, next: () => r }), null],
              },
            }
          ),
          registerSuspensePoint: (l) => (
            n.push(l),
            {
              requestReevaluation: a,
              dispose: () => {
                LP(n, l);
              },
            }
          ),
        });
      },
      MP = () => ({
        matchElement: (e) => e && qP(e) && e.type === Symbol.for("react.suspense"),
        createActiveChild: OP,
      }),
      Kn = MP();
    sf.SuspenseController = () => Kn;
  });
  var af = f((of) => {
    var { ensureArray: BP } = z(),
      GP = (e, { onRequestUpdate: t, findPassiveController: r }) => {
        let { wait: i, next: s } = e.props;
        e = null;
        let n;
        i()
          .then((a) => {
            (n = { value: a }), t();
          })
          .catch((a) => {
            n = { error: a };
          }),
          (i = null);
        let o = r((a) => a.registerSuspensePoint?.({ isStillWaiting: () => n == null }));
        return Object.assign({}, Yn, {
          acceptPropagation: Yn.matchElement,
          applyUpdates: ({ propagationRequest: a, updateRequests: l, isFirstRun: c }) => (
            a && (s = a.element.props.next),
            {
              propagation: { elements: n && BP(s(n)) },
              onCommit: (c || l) && (() => o.requestReevaluation()),
            }
          ),
          selfDispose: o?.dispose,
        });
      },
      JP = () => ({ matchElement: (e) => e && e.$_r2_wait, createActiveChild: GP }),
      Yn = JP();
    of.WaitController = () => Yn;
  });
  var cf = f((lf) => {
    var { isValidElement: VP, createElement: UP } = $(),
      WP = (e) => {
        let t = e.type,
          r = e.key,
          i = e.props,
          s = e.ref;
        return (
          (e = null),
          Object.assign({}, jn, {
            key: r,
            applyUpdates: ({ propagationRequest: n }) => (
              n && ((i = n.element.props), (s = n.element.ref)),
              { propagation: { elements: [UP(t.render, Object.assign({}, i, { ref: s }))] } }
            ),
            acceptPropagation: (n) => jn.matchElement(n) && n.key === r && n.type === t,
          })
        );
      },
      HP = () => ({
        matchElement: (e) => e && VP(e) && e.type.$$typeof === Symbol.for("react.forward_ref"),
        createActiveChild: WP,
      }),
      jn = HP();
    lf.ForwardRefController = () => jn;
  });
  var uf = f((hf) => {
    var { isValidElement: zP } = $(),
      { isPureFunction: $P } = bt(),
      { ensureArray: ZP } = z(),
      XP = () => ({
        matchElement: (e) => e && zP(e) && typeof e.type == "function" && !$P(e.type) && e.type.$_r2_state,
        createActiveChild: (e, t) => QP(e, t),
      }),
      Ni = XP();
    hf.StateController = () => Ni;
    var QP = (e, { onRequestUpdate: t }) => {
      let r = e.props.getInitValue ? e.props.getInitValue() : e.props.initValue,
        i = e.props.next;
      return (
        (e = null),
        Object.assign({}, Ni, {
          createPassiveChild: () => Ni,
          applyUpdates: ({ propagationRequest: s, updateRequests: n }) => {
            s && (i = s.element.props.next);
            let o = null;
            if (n)
              for (let a of n)
                a.type === "change" ? (r = a.fn(r)) : (r = a.value),
                  a.cb && (o || (o = []), o.push(a.cb));
            return {
              propagation: {
                elements: ZP(
                  i({
                    value: r,
                    onChange: (a, l) => t({ value: a, cb: l }),
                    change: (a, l) => t({ type: "change", fn: a, cb: l }),
                  })
                ),
              },
              onCommit: o?.length && (() => o.forEach((a) => a())),
            };
          },
          acceptPropagation: Ni.matchElement,
        })
      );
    };
  });
  var ff = f((pf) => {
    var KP = (e) => ({
      extractRequests: (r) => {
        let i = null;
        for (let s = 0; s < e.length; s++) {
          let n = e[s];
          n.node === r && (i || (i = []), i.push(n.request), e.splice(s, 1), s--);
        }
        return i;
      },
    });
    pf.SequenceUpdateGroup = KP;
  });
  var gf = f((df) => {
    var { reconcilation: YP } = Cn(),
      { ShadowActiveController1: jP } = Xn(),
      { SequenceUpdateGroup: mf } = ff(),
      { findMinValue: eN } = T(),
      tN = (e) => (e.rootUpdate ? rN(e) : iN(e));
    df.renderSequenceUpdates = tN;
    var rN = ({
      rootNode: e,
      rootUpdate: t,
      childUpdates: r,
      collectValues: i,
      onRequestUpdate: s,
      isSchedulerEmpty: n,
    }) => {
      let o = mf(r),
        a = [],
        l = null;
      return (
        (e.elementList = t.list),
        YP(e, t.list, {
          onCreateNode: (c) => {
            let u = sN(c, l, { contexts: e.contexts, onRequestUpdate: s, isSchedulerEmpty: n }),
              p = u.activeController.applyUpdates({ isFirstRun: !0 });
            return p.onCommit && a.push(p.onCommit), (l = i(l, u.activeController.getValues())), u;
          },
          onUpdateNode: (c, u) => {
            let p = o.extractRequests(c),
              m = c.activeController.applyUpdates({
                propagationRequest: {
                  element: { props: { renderShadow: ({ acceptValue: d }) => u.render(l, d) } },
                },
                updateRequests: p,
              });
            m.onCommit && a.push(m.onCommit), (l = i(l, c.activeController.getValues()));
          },
          onRemoveNode: (c) => {
            c.activeController.selfDispose();
          },
        }),
        { onCommit: a.length ? () => a.forEach((c) => c()) : null, values: l }
      );
    },
      iN = ({ rootNode: e, childUpdates: t, collectValues: r }) => {
        let i = mf(t),
          s = eN(t, (l) => e.childNodes.indexOf(l.node)),
          n = null;
        {
          let l = e.childNodes.first;
          for (let c = 0; c < s; c++) {
            let u = l.value;
            (n = r(n, u.activeController.getValues())), (l = l.next);
          }
        }
        let o = [],
          a = e.childNodes.entryAt(s);
        for (let l = s; a; l++) {
          let c = a.value,
            u = i.extractRequests(c),
            p = c.activeController.applyUpdates({
              propagationRequest: {
                element: {
                  props: { renderShadow: ({ acceptValue: m }) => e.elementList[l].render(n, m) },
                },
              },
              updateRequests: u,
            });
          p.onCommit && o.push(p.onCommit), (n = r(n, c.activeController.getValues())), (a = a.next);
        }
        return { onCommit: o.length ? () => o.forEach((l) => l()) : null, values: n };
      },
      sN = (e, t, { contexts: r, onRequestUpdate: i, isSchedulerEmpty: s }) => {
        let n = (l) => ({ node: a, request: l }),
          a = {
            activeController: {
              ...jP(
                { props: { renderShadow: ({ acceptValue: l }) => e.render(t, l) } },
                {
                  contexts: r,
                  onRequestUpdate: (l) => i(n(l)),
                  createUpdateRequest: n,
                  isSchedulerEmpty: s,
                }
              ),
              key: e.key,
              acceptPropagation: (l) => l.key === e.key,
            },
          };
        return a;
      };
  });
  var Rf = f((Ii) => {
    var { isValidElement: nN } = $(),
      { ensureArray: oN } = z(),
      { renderSequenceUpdates: aN } = gf(),
      lN = (e, { onRequestUpdate: t, createUpdateRequest: r, isSchedulerEmpty: i, findPassiveController: s }) => {
        let { list: n, next: o, collectValues: a = (p, m) => [...(p ?? []), m] } = e.props,
          l = e.key;
        e = void 0;
        let c = s((p) => p.getAllContexts?.()),
          u = xf({
            contexts: c?.map((p) =>
              Object.assign({}, p, {
                registerListener: (m) =>
                  p.registerListener((d) => {
                    let g = m(d);
                    return r(g);
                  }),
              })
            ),
          });
        return Object.assign({}, ki, {
          key: l,
          acceptPropagation: (p) => ki.matchElement(p) && l === p.key,
          createPassiveChild: () => ki,
          applyUpdates: ({ propagationRequest: p, updateRequests: m, isFirstRun: d }) => {
            p && ((n = p.element.props.list), (o = p.element.props.next));
            let { onCommit: g, values: y } = aN({
              rootNode: u,
              rootUpdate: p || d ? { list: n } : null,
              childUpdates: m,
              onRequestUpdate: t,
              isSchedulerEmpty: i,
              collectValues: a,
            });
            return { propagation: { elements: oN(o?.(y)) }, onCommit: g };
          },
          selfDispose: () => yf(u),
        });
      },
      cN = () => ({ matchElement: (e) => e && nN(e) && e.type.$_r2_sequence, createActiveChild: lN }),
      ki = cN();
    Ii.SequenceController = () => ki;
    var xf = ({ contexts: e }) => ({ childNodes: null, contexts: e });
    Ii.createRootSequenceNode = xf;
    var yf = (e) => {
      e.childNodes.forEach((t) => t.activeController.selfDispose());
    };
    Ii.destroySequenceNode = yf;
  });
  var Ar = f((vf) => {
    var { FragmentController: hN } = cp(),
      { ArrayController: uN } = fp(),
      { ComponentController: pN } = xp(),
      { NullController: fN } = vp(),
      { ShadowController: mN } = Xn(),
      { ContextController: dN } = Np(),
      { ConsumerController: gN } = Ip(),
      { FunctionalController: xN } = jp(),
      { SuspenseController: yN } = nf(),
      { WaitController: RN } = af(),
      { ForwardRefController: vN } = cf(),
      { StateController: SN } = uf(),
      { SequenceController: wN } = Rf(),
      CN = ({ contexts: e } = {}) => [
        hN(),
        mN(),
        wN(),
        uN(),
        SN(),
        dN({ contexts: e }),
        gN(),
        pN(),
        xN(),
        vN(),
        fN(),
        yN(),
        RN(),
      ];
    vf.createBaseControllers = CN;
  });
  var eo = f((Sf) => {
    var { createRoot: _N } = Ih(),
      { DomRootController: DN } = Bn(),
      { createBaseControllers: bN } = Ar(),
      EN = (e) => {
        for (let t; (t = e.firstChild);) t.remove();
        return _N([DN({ dom: e }), ...bN()]);
      };
    Sf.createRootWithDom = EN;
  });
  var Cf = f((wf) => {
    var { createRootWithDom: AN } = eo(),
      TN = (e, t) => {
        AN(t).render(e);
      };
    wf.renderToDom = TN;
  });
  var Fi = f((_f) => {
    var PN = (e, t) => {
      let { types: r } = to();
      return r.find((i) => i.check(e)).toChild(e, t);
    };
    _f.createActiveChild = PN;
  });
  var Df = f((ro) => {
    var { isValidElement: NN } = $(),
      { ensureArray: kN } = z(),
      { matchElement: IN } = qi(),
      { createActiveChild: FN } = Fi(),
      { PassiveController: qN } = Li(),
      LN = (e) => e && NN(e) && typeof e.type == "string";
    ro.validDomElement = LN;
    var ON = (e) => ({
      dom: e,
      matchElement: IN,
      applyUpdates: () => ({ propagation: { elements: kN(e.props.children) } }),
      createActiveChild: FN,
      createPassiveChild: qN,
    });
    ro.createActiveDomController = ON;
  });
  var bf = f((io) => {
    var { PassiveController: MN } = Li(),
      { createActiveChild: BN } = Fi(),
      { matchElement: GN } = qi(),
      JN = (e) => typeof e == "number" || typeof e == "string";
    io.validTextElement = JN;
    var VN = (e) => ({
      text: e,
      matchElement: GN,
      applyUpdates: () => ({}),
      createActiveChild: BN,
      createPassiveChild: MN,
    });
    io.createActiveTextController = VN;
  });
  var to = f((Ef) => {
    var { createActiveDomController: UN, validDomElement: WN } = Df(),
      { createActiveTextController: HN, validTextElement: zN } = bf(),
      $N = [
        { check: WN, toChild: UN },
        { check: zN, toChild: HN },
      ];
    Ef.types = $N;
  });
  var qi = f((Af) => {
    var { cache0: ZN } = wr(),
      XN = ZN(() => {
        let { types: e } = to();
        return e;
      }),
      QN = (e) => XN().find((t) => t.check(e));
    Af.matchElement = QN;
  });
  var Li = f((Pf) => {
    var { matchElement: KN } = qi(),
      { createActiveChild: YN } = Fi(),
      Tf = () => ({ matchElement: KN, createActiveChild: YN, createPassiveChild: Tf });
    Pf.PassiveController = Tf;
  });
  var kf = f((Nf) => {
    var { PassiveController: jN } = Li(),
      ek = () => jN();
    Nf.DomMemoryRootController = ek;
  });
  var Lf = f((qf) => {
    var { IterList: tk } = ie(),
      { createActiveTextController: If } = An(),
      { singleDomRange: rk } = vi(),
      { DomRootController: ik } = Bn(),
      { createActiveDomController: sk } = bi(),
      { getNamespace: nk } = Cr(),
      ok = (e, t, r, i) => {
        Ff(e, {
          controllerIndex: r,
          createLooper: (s) => {
            let n = tk(),
              o = null;
            return {
              eachChild: (a) => {
                if (a.getDom) {
                  let l = a.getDom();
                  n.push(l), o ? (o.to = l) : (o = rk(l));
                } else {
                  let l = a.mounting.getDomRange();
                  l && (o ? (o.to = l.to) : (o = { ...l })),
                    a.mounting.setMounted(n.push(l?.from), l);
                }
              },
              finish: () => o,
            };
          },
          perNode: (s, n, o) => {
            if (!s.dom && s.text == null)
              if (n) {
                let a = n.parentNode.createPassiveChild(),
                  l = o({ ...n, parentNode: a });
                return a.mounting.setDomRange(l), a;
              } else {
                let a = ik({ dom: t }),
                  l = { value: t.firstChild };
                return o({ parentNode: a, parentDom: t, currentDom: l }), a;
              }
            else if (s.text != null) {
              let a = s.text.toString();
              s = null;
              let l = n.currentDom.value;
              if (l.data !== a && l.data.startsWith(a)) {
                let c = document.createTextNode(a);
                return n.parentDom.insertBefore(c, l), (l.data = l.data.substring(a.length)), If(c, a);
              } else return (n.currentDom.value = l.nextSibling), If(l, a);
            } else {
              let a = n.currentDom.value;
              n.currentDom.value = a.nextSibling;
              let l = sk(a, { namespace: n.namespace ?? nk(a.tagName) }, s.dom, {
                skipRawAttrs: !0,
                isSchedulerEmpty: i.isEmpty,
              }),
                c = { value: a.firstChild };
              return o({ parentNode: l, parentDom: a, currentDom: c }), l;
            }
          },
        });
      };
    qf.swapControllers = ok;
    var Ff = (e, { controllerIndex: t, perNode: r, createLooper: i, params: s }) => {
      let n = r(e.controllers[t], s, (o, a) => {
        let l = i(a);
        return (
          e.childNodes?.forEach((c) => {
            let u = Ff(c, { controllerIndex: t, perNode: r, params: o, createLooper: i });
            l.eachChild(u);
          }),
          l.finish()
        );
      });
      return e.controllers[t] === e.activeController && (e.activeController = n), (e.controllers[t] = n), n;
    };
  });
  var Bf = f((Mf) => {
    var { ensureArray: ak } = z(),
      { createRootNode: lk } = Rr(),
      { createBaseControllers: ck } = Ar(),
      { renderUpdates: Of } = Sr(),
      { createScheduler: hk } = Dn(),
      { DomMemoryRootController: uk } = kf(),
      { swapControllers: pk } = Lf(),
      fk = (e, t) => {
        let { rootNode: r, scheduler: i, onCommit: s } = mk(e);
        pk(r, t, 0, i), s?.();
      };
    Mf.hydrate = fk;
    var mk = (e) => {
      e = ak(e);
      let t = lk({ controllers: [uk(), ...ck()] }),
        r = hk((s) => {
          Of({ updates: s, onRequestUpdate: (o) => r.addUpdate(o), isSchedulerEmpty: r.isEmpty })?.();
        }),
        i = Of({
          updates: [t.createUpdate(e)],
          onRequestUpdate: (s) => r.addUpdate(s),
          isSchedulerEmpty: r.isEmpty,
        });
      return { rootNode: t, scheduler: r, onCommit: i };
    };
  });
  var Jf = f((Gf) => {
    var dk = (e, t) => ({ $$r2_portal: !0, dom: t, props: { children: e } });
    Gf.createPortal = dk;
  });
  var Uf = f((Vf) => {
    var gk = (e) => e._r2_findPassiveController((t) => t.mounting.getDomRange()?.from);
    Vf.findDOMNode = gk;
  });
  var Hf = f((u3, Wf) => {
    var { renderToDom: xk } = Cf(),
      { hydrate: yk } = Bf(),
      { createPortal: Rk } = Jf(),
      { findDOMNode: vk } = Uf(),
      { createRootWithDom: Sk } = eo(),
      wk = { render: xk, createRoot: Sk, hydrate: yk, createPortal: Rk, findDOMNode: vk };
    Wf.exports = wk;
  });
  var S = f((so) => {
    function zf() {
      return $f(arguments, {}, 0);
    }
    so.cs = zf;
    so.cs1 = zf;
    var $f = (e, t, r) => {
      let i = e[r],
        s,
        n;
      return (
        Array.isArray(i)
          ? ((s = i[0]), (n = i[1]))
          : typeof i == "object"
            ? ((s = i.name), (n = i.load))
            : (n = i),
        n(
          t,
          e.length <= r + 1
            ? null
            : (o) => {
              let a;
              return s != null ? ((a = Object.assign({}, t)), (a[s] = o)) : (a = t), $f(e, a, r + 1);
            }
        )
      );
    };
  });
  var Zf = f((Mi) => {
    var { cs: Ck } = S(),
      { Component: _k, createElement: Dk } = $(),
      no = ({ list: e, collectValues: t, next: r }) => Ck(({ }) => Dk(Oi, { next: r, list: e, collectValues: t }));
    Mi.Sequence = no;
    Mi.Sequence1 = no;
    Mi.Sequence2 = no;
    var Oi = class extends _k {
      render() {
        return this.props.fakeNext();
      }
    };
    Oi.$_r2_sequence = !0;
  });
  var Qf = f((Xf) => {
    var { addToListMap: bk } = T(),
      { isEmpty: Ek } = j(),
      Ak = (e, { getDeps: t = (i) => i.deps, getName: r = (i) => i.name }) => {
        Tk(e, { getDeps: t, getName: r });
        let i = e.slice(0),
          s = {},
          n = [],
          o = (a) => {
            let l = t(a);
            return l ? l.find((c) => !n.find((u) => r(u) === c)) : null;
          };
        for (; i.length;) {
          let a = i.shift(),
            l = o(a);
          if (l) bk(s, l, a);
          else {
            n.push(a);
            let c = s[r(a)];
            c && (delete s[r(a)], i.push(...c));
          }
        }
        if (!Ek(s)) throw "Circular dependencies: " + Object.keys(s);
        return n;
      };
    Xf.sortModules = Ak;
    var Tk = (e, { getDeps: t, getName: r }) => {
      for (let i of e) {
        let n = t(i)?.find((o) => !e.find((a) => r(a) === o));
        if (n) throw `Unknown required dependency [${n}] in [${r(i)}]`;
      }
      for (let i = 0; i < e.length; i++) {
        let s = e[i];
        for (let n = i + 1; n < e.length; n++) {
          let o = e[n];
          if (r(s) != null && r(s) === r(o)) throw `Duplicated name: ${r(s)}`;
        }
      }
    };
  });
  var jf = f((R3, Yf) => {
    "use strict";
    var Kf = Object.getOwnPropertySymbols,
      Pk = Object.prototype.hasOwnProperty,
      Nk = Object.prototype.propertyIsEnumerable;
    function kk(e) {
      if (e == null) throw new TypeError("Object.assign cannot be called with null or undefined");
      return Object(e);
    }
    function Ik() {
      try {
        if (!Object.assign) return !1;
        var e = new String("abc");
        if (((e[5] = "de"), Object.getOwnPropertyNames(e)[0] === "5")) return !1;
        for (var t = {}, r = 0; r < 10; r++) t["_" + String.fromCharCode(r)] = r;
        var i = Object.getOwnPropertyNames(t).map(function (n) {
          return t[n];
        });
        if (i.join("") !== "0123456789") return !1;
        var s = {};
        return (
          "abcdefghijklmnopqrst".split("").forEach(function (n) {
            s[n] = n;
          }),
          Object.keys(Object.assign({}, s)).join("") === "abcdefghijklmnopqrst"
        );
      } catch {
        return !1;
      }
    }
    Yf.exports = Ik()
      ? Object.assign
      : function (e, t) {
        for (var r, i = kk(e), s, n = 1; n < arguments.length; n++) {
          r = Object(arguments[n]);
          for (var o in r) Pk.call(r, o) && (i[o] = r[o]);
          if (Kf) {
            s = Kf(r);
            for (var a = 0; a < s.length; a++) Nk.call(r, s[a]) && (i[s[a]] = r[s[a]]);
          }
        }
        return i;
      };
  });
  var dm = f((v3, mm) => {
    "use strict";
    var ao = jf(),
      se = typeof Symbol == "function" && Symbol.for,
      Pr = se ? Symbol.for("react.element") : 60103,
      Fk = se ? Symbol.for("react.portal") : 60106,
      qk = se ? Symbol.for("react.fragment") : 60107,
      Lk = se ? Symbol.for("react.strict_mode") : 60108,
      Ok = se ? Symbol.for("react.profiler") : 60114,
      Mk = se ? Symbol.for("react.provider") : 60109,
      Bk = se ? Symbol.for("react.context") : 60110,
      Gk = se ? Symbol.for("react.forward_ref") : 60112,
      Jk = se ? Symbol.for("react.suspense") : 60113;
    se && Symbol.for("react.suspense_list");
    var Vk = se ? Symbol.for("react.memo") : 60115,
      Uk = se ? Symbol.for("react.lazy") : 60116;
    se && Symbol.for("react.fundamental");
    se && Symbol.for("react.responder");
    se && Symbol.for("react.scope");
    var em = typeof Symbol == "function" && Symbol.iterator;
    function Tr(e) {
      for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, r = 1; r < arguments.length; r++)
        t += "&args[]=" + encodeURIComponent(arguments[r]);
      return (
        "Minified React error #" +
        e +
        "; visit " +
        t +
        " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
      );
    }
    var sm = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () { },
      enqueueReplaceState: function () { },
      enqueueSetState: function () { },
    },
      nm = {};
    function Et(e, t, r) {
      (this.props = e), (this.context = t), (this.refs = nm), (this.updater = r || sm);
    }
    Et.prototype.isReactComponent = {};
    Et.prototype.setState = function (e, t) {
      if (typeof e != "object" && typeof e != "function" && e != null) throw Error(Tr(85));
      this.updater.enqueueSetState(this, e, t, "setState");
    };
    Et.prototype.forceUpdate = function (e) {
      this.updater.enqueueForceUpdate(this, e, "forceUpdate");
    };
    function om() { }
    om.prototype = Et.prototype;
    function fo(e, t, r) {
      (this.props = e), (this.context = t), (this.refs = nm), (this.updater = r || sm);
    }
    var mo = (fo.prototype = new om());
    mo.constructor = fo;
    ao(mo, Et.prototype);
    mo.isPureReactComponent = !0;
    var am = { current: null },
      lo = { current: null },
      lm = Object.prototype.hasOwnProperty,
      cm = { key: !0, ref: !0, __self: !0, __source: !0 };
    function tm(e, t, r) {
      var i,
        s = {},
        n = null,
        o = null;
      if (t != null)
        for (i in (t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (n = "" + t.key), t))
          lm.call(t, i) && !cm.hasOwnProperty(i) && (s[i] = t[i]);
      var a = arguments.length - 2;
      if (a === 1) s.children = r;
      else if (1 < a) {
        for (var l = Array(a), c = 0; c < a; c++) l[c] = arguments[c + 2];
        s.children = l;
      }
      if (e && e.defaultProps) for (i in ((a = e.defaultProps), a)) s[i] === void 0 && (s[i] = a[i]);
      return { $$typeof: Pr, type: e, key: n, ref: o, props: s, _owner: lo.current };
    }
    function Wk(e, t) {
      return { $$typeof: Pr, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
    }
    function co(e) {
      return typeof e == "object" && e !== null && e.$$typeof === Pr;
    }
    function Hk(e) {
      var t = { "=": "=0", ":": "=2" };
      return (
        "$" +
        ("" + e).replace(/[=:]/g, function (r) {
          return t[r];
        })
      );
    }
    var hm = /\/+/g,
      Bi = [];
    function um(e, t, r, i) {
      if (Bi.length) {
        var s = Bi.pop();
        return (s.result = e), (s.keyPrefix = t), (s.func = r), (s.context = i), (s.count = 0), s;
      }
      return { result: e, keyPrefix: t, func: r, context: i, count: 0 };
    }
    function pm(e) {
      (e.result = null),
        (e.keyPrefix = null),
        (e.func = null),
        (e.context = null),
        (e.count = 0),
        10 > Bi.length && Bi.push(e);
    }
    function ho(e, t, r, i) {
      var s = typeof e;
      (s === "undefined" || s === "boolean") && (e = null);
      var n = !1;
      if (e === null) n = !0;
      else
        switch (s) {
          case "string":
          case "number":
            n = !0;
            break;
          case "object":
            switch (e.$$typeof) {
              case Pr:
              case Fk:
                n = !0;
            }
        }
      if (n) return r(i, e, t === "" ? "." + oo(e, 0) : t), 1;
      if (((n = 0), (t = t === "" ? "." : t + ":"), Array.isArray(e)))
        for (var o = 0; o < e.length; o++) {
          s = e[o];
          var a = t + oo(s, o);
          n += ho(s, a, r, i);
        }
      else if (
        (e === null || typeof e != "object"
          ? (a = null)
          : ((a = (em && e[em]) || e["@@iterator"]), (a = typeof a == "function" ? a : null)),
          typeof a == "function")
      )
        for (e = a.call(e), o = 0; !(s = e.next()).done;)
          (s = s.value), (a = t + oo(s, o++)), (n += ho(s, a, r, i));
      else if (s === "object")
        throw (
          ((r = "" + e),
            Error(
              Tr(31, r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r, "")
            ))
        );
      return n;
    }
    function uo(e, t, r) {
      return e == null ? 0 : ho(e, "", t, r);
    }
    function oo(e, t) {
      return typeof e == "object" && e !== null && e.key != null ? Hk(e.key) : t.toString(36);
    }
    function zk(e, t) {
      e.func.call(e.context, t, e.count++);
    }
    function $k(e, t, r) {
      var i = e.result,
        s = e.keyPrefix;
      (e = e.func.call(e.context, t, e.count++)),
        Array.isArray(e)
          ? po(e, i, r, function (n) {
            return n;
          })
          : e != null &&
          (co(e) &&
            (e = Wk(
              e,
              s + (!e.key || (t && t.key === e.key) ? "" : ("" + e.key).replace(hm, "$&/") + "/") + r
            )),
            i.push(e));
    }
    function po(e, t, r, i, s) {
      var n = "";
      r != null && (n = ("" + r).replace(hm, "$&/") + "/"), (t = um(t, n, i, s)), uo(e, $k, t), pm(t);
    }
    function Je() {
      var e = am.current;
      if (e === null) throw Error(Tr(321));
      return e;
    }
    var fm = {
      Children: {
        map: function (e, t, r) {
          if (e == null) return e;
          var i = [];
          return po(e, i, null, t, r), i;
        },
        forEach: function (e, t, r) {
          if (e == null) return e;
          (t = um(null, null, t, r)), uo(e, zk, t), pm(t);
        },
        count: function (e) {
          return uo(
            e,
            function () {
              return null;
            },
            null
          );
        },
        toArray: function (e) {
          var t = [];
          return (
            po(e, t, null, function (r) {
              return r;
            }),
            t
          );
        },
        only: function (e) {
          if (!co(e)) throw Error(Tr(143));
          return e;
        },
      },
      createRef: function () {
        return { current: null };
      },
      Component: Et,
      PureComponent: fo,
      createContext: function (e, t) {
        return (
          t === void 0 && (t = null),
          (e = {
            $$typeof: Bk,
            _calculateChangedBits: t,
            _currentValue: e,
            _currentValue2: e,
            _threadCount: 0,
            Provider: null,
            Consumer: null,
          }),
          (e.Provider = { $$typeof: Mk, _context: e }),
          (e.Consumer = e)
        );
      },
      forwardRef: function (e) {
        return { $$typeof: Gk, render: e };
      },
      lazy: function (e) {
        return { $$typeof: Uk, _ctor: e, _status: -1, _result: null };
      },
      memo: function (e, t) {
        return { $$typeof: Vk, type: e, compare: t === void 0 ? null : t };
      },
      useCallback: function (e, t) {
        return Je().useCallback(e, t);
      },
      useContext: function (e, t) {
        return Je().useContext(e, t);
      },
      useEffect: function (e, t) {
        return Je().useEffect(e, t);
      },
      useImperativeHandle: function (e, t, r) {
        return Je().useImperativeHandle(e, t, r);
      },
      useDebugValue: function () { },
      useLayoutEffect: function (e, t) {
        return Je().useLayoutEffect(e, t);
      },
      useMemo: function (e, t) {
        return Je().useMemo(e, t);
      },
      useReducer: function (e, t, r) {
        return Je().useReducer(e, t, r);
      },
      useRef: function (e) {
        return Je().useRef(e);
      },
      useState: function (e) {
        return Je().useState(e);
      },
      Fragment: qk,
      Profiler: Ok,
      StrictMode: Lk,
      Suspense: Jk,
      createElement: tm,
      cloneElement: function (e, t, r) {
        if (e == null) throw Error(Tr(267, e));
        var i = ao({}, e.props),
          s = e.key,
          n = e.ref,
          o = e._owner;
        if (t != null) {
          if (
            (t.ref !== void 0 && ((n = t.ref), (o = lo.current)),
              t.key !== void 0 && (s = "" + t.key),
              e.type && e.type.defaultProps)
          )
            var a = e.type.defaultProps;
          for (l in t)
            lm.call(t, l) &&
              !cm.hasOwnProperty(l) &&
              (i[l] = t[l] === void 0 && a !== void 0 ? a[l] : t[l]);
        }
        var l = arguments.length - 2;
        if (l === 1) i.children = r;
        else if (1 < l) {
          a = Array(l);
          for (var c = 0; c < l; c++) a[c] = arguments[c + 2];
          i.children = a;
        }
        return { $$typeof: Pr, type: e.type, key: s, ref: n, props: i, _owner: o };
      },
      createFactory: function (e) {
        var t = tm.bind(null, e);
        return (t.type = e), t;
      },
      isValidElement: co,
      version: "16.11.0",
      __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
        ReactCurrentDispatcher: am,
        ReactCurrentBatchConfig: { suspense: null },
        ReactCurrentOwner: lo,
        IsSomeRendererActing: { current: !1 },
        assign: ao,
      },
    },
      rm = { default: fm },
      im = (rm && fm) || rm;
    mm.exports = im.default || im;
  });
  var W = f((S3, gm) => {
    "use strict";
    gm.exports = dm();
  });
  var ne = f((xm) => {
    var { createElement: Zk, Component: Xk } = W(),
      Qk = ({ getInitValue: e, initValue: t, props: r, next: i }) =>
        Zk(go, { getInitValue: e, initValue: t, props: r, next: i });
    xm.Static = Qk;
    var go = class extends Xk {
      constructor(t, r) {
        super(t, r),
          (this.value = t.getInitValue
            ? t.getInitValue({ getLatestProps: () => this.props.props })
            : t.initValue !== void 0
              ? t.initValue
              : t.value);
      }
      render() {
        let { next: t } = this.props;
        return t(this.value) ?? null;
      }
    };
  });
  var xo = f((ym) => {
    var { Sequence: Kk } = Zf(),
      { chain: Yk, chain2: jk } = V(),
      { sortModules: eI } = Qf(),
      { cs: tI } = S(),
      { Static: rI } = ne(),
      iI = ({ moduleList: e, next: t }) =>
        tI(
          [
            "indice",
            (r, i) =>
              rI({
                getInitValue: () =>
                  Yk(
                    e,
                    (s) => s.map((n, o) => ({ key: o, feed: n })),
                    (s) => eI(s, { getDeps: (n) => n.feed.deps, getName: (n) => n.feed.name }),
                    (s) => s.map(({ key: n }) => n)
                  ),
                next: i,
              }),
          ],
          ({ indice: r }) =>
            Kk({
              list: r.map((i) => {
                let s = e[i];
                return {
                  key: i,
                  render: (n, o) =>
                    s.load(n?.map ?? {}, (a) => o({ value: a, feed: s, name: s.name })),
                };
              }),
              collectValues: (i, s) => {
                if (s == null) throw "[swamp] error: node does not produce value, is next() called?";
                let { value: n, feed: o, name: a } = s,
                  l = (c) =>
                    jk(
                      c,
                      o.expo?.map((u) => (p) => u(p, n))
                    );
                return i
                  ? ((i.exported = l(i.exported)), (i.map[a] = n), i)
                  : { exported: l(null), map: { [a]: n } };
              },
              next: ({ exported: i }) => t(i),
            })
        );
    ym.Swamp = iI;
  });
  var P = f((Gi) => {
    var { createElement: Rm, Fragment: vm } = W(),
      Sm = (...e) => Rm(vm, {}, ...e);
    Gi.fragments = Sm;
    Gi.fragments1 = Sm;
    var sI = (e) => Rm(vm, {}, ...e);
    Gi.fragments2 = sI;
  });
  var Ji = f((wm) => {
    var nI = W(),
      { addRemove: yo } = T(),
      Ro = class extends nI.Component {
        constructor(t, r, i) {
          super(t, r, i),
            (this.onUnmounts = []),
            (this.onChangeds = []),
            (this.onMounts = []),
            (this.mounted = !1),
            (this.onMount = yo(this.onMounts)),
            (this.onUnmount = yo(this.onUnmounts)),
            (this.onChanged = yo(this.onChangeds));
        }
        componentDidMount() {
          (this.mounted = !0), this.onMounts.forEach((t) => t());
        }
        componentWillUnmount() {
          (this.mounted = !1), this.onUnmounts.forEach((t) => t());
        }
        componentDidUpdate(t) {
          this.onChangeds.forEach((r) => r(t));
        }
        setState(t, r) {
          this.mounted ? super.setState(t, r) : ((this.state = Object.assign(this.state, t)), r && r());
        }
        forceUpdate() {
          this.mounted && super.forceUpdate();
        }
        onChanged1(t) {
          if (t()) return;
          let i = this.onChanged(() => {
            t() && i();
          });
        }
      };
    wm.FComponent = Ro;
  });
  var X = f((Cm) => {
    var { FComponent: oI } = Ji(),
      { createElement: aI } = W(),
      lI = ({ fn: e, action: t, props: r, onMounted: i, next: s }) =>
        aI(vo, { action: t ?? e, props: r, onMounted: i, next: s });
    Cm.Invoke = lI;
    var vo = class extends oI {
      constructor(t, r) {
        super(t, r),
          t.action && t.action({ getLatestProps: () => this.props.props, isMounted: () => this.mounted }),
          t.onMounted &&
          (console.log("[Quan warning] Invoke onMounted is deprecated"),
            this.onMount(() => {
              setTimeout(() => {
                this.props.onMounted({
                  getLatestProps: () => this.props.props,
                  isMounted: () => this.mounted,
                });
              }, 0);
            }));
      }
      render() {
        let { next: t } = this.props;
        return t ? t() : null;
      }
    };
  });
  var oe = f((st) => {
    function _m(e, t) {
      if (t == null) return e;
      for (let r of t) {
        if (e == null) return e;
        let [i] =
          typeof r == "string"
            ? r.indexOf("!") > 0
              ? r.split("!")
              : [r]
            : typeof r == "function"
              ? [r(e)]
              : [r];
        e = e[i];
      }
      return e;
    }
    st.getPath = _m;
    function Vi(e, t, r) {
      if (t.length === 0) return r;
      let [i, ...s] = t,
        [n, o] =
          typeof i == "string"
            ? i.indexOf("!") > 0
              ? i.split("!")
              : [i]
            : typeof i == "function"
              ? [i(e)]
              : [i],
        a = () => (o === "arr" ? [] : {});
      if (Array.isArray(e)) {
        let l = e ? e.slice(0) : [];
        return (l[n] = Vi((e && e[n]) || a(), s, r)), l;
      } else return Object.assign({}, e, { [n]: Vi((e && e[n]) || a(), s, r) });
    }
    st.setPath = Vi;
    function Dm(e, t, r) {
      if (t.length === 0) return r;
      let [i, ...s] = t;
      return Object.assign({}, e, { [i]: Dm((e && e[i]) || {}, s, r) });
    }
    st.setPathO = Dm;
    function bm(e, t, r) {
      let i = _m(e, t),
        s = r(i);
      return s !== i ? Vi(e, t, s) : e;
    }
    st.changePath = bm;
    st.cnv = bm;
    var Em = (e, t) => {
      if (e == null) return null;
      let [r, ...i] = t,
        s = ((n) => (typeof n == "object" ? e.find((o) => !Object.keys(n).find((a) => n[a] !== o[a])) : e[n]))(
          r
        );
      return i.length ? Em(s, i) : s;
    };
    st.locate = Em;
  });
  var me = f((Am) => {
    var cI = (e, t) => e.processId === t.processId && e.windowId === t.windowId && e.modalId === t.modalId;
    Am.matchKey = cI;
  });
  var Nr = f((Tm) => {
    var hI = W(),
      { createElement: uI } = W(),
      pI = ({ action: e, props: t, next: r }) => uI(So, { action: e, props: t, next: r });
    Tm.OnMounted = pI;
    var So = class extends hI.Component {
      componentDidMount() {
        setTimeout(() => {
          this.props.action({ getLatestProps: () => this.props.props });
        }, 0);
      }
      render() {
        let { next: t } = this.props;
        return t ? t() : null;
      }
    };
  });
  var ae = f((Pm) => {
    var fI = W(),
      { createElement: mI } = W(),
      dI = ({ action: e, props: t, next: r }) => mI(wo, { action: e, props: t, next: r });
    Pm.OnUnmounted = dI;
    var wo = class extends fI.Component {
      componentWillUnmount() {
        this.props.action({ getLatestProps: () => this.props.props });
      }
      render() {
        let { next: t } = this.props;
        return t ? t() : null;
      }
    };
  });
  var Im = f((km) => {
    var Nm = W(),
      gI = ({ fn: e, action: t, props: r, next: i }) =>
        Nm.createElement(Co, { action: t ?? e, props: r, next: i });
    km.OnUpdate = gI;
    var Co = class extends Nm.Component {
      componentDidUpdate(t) {
        this.props.action({ prevProps: t.props });
      }
      render() {
        let { next: t } = this.props;
        return t?.() ?? null;
      }
    };
  });
  var de = f((Fm) => {
    var { Static: xI } = ne(),
      yI = ({ getInitValue: e, next: t }) =>
        xI({
          getInitValue: () => {
            let r = e?.();
            return { get: () => r, set: (i) => (r = i) };
          },
          next: t,
        });
    Fm.Static2 = yI;
  });
  var Lm = f((_o) => {
    var { Component: RI, createElement: vI } = W(),
      qm = ({ next: e, getInitValue: t, initValue: r }) => vI(Ui, { next: e, getInitValue: t, initValue: r });
    _o.State = qm;
    _o.State1 = qm;
    var Ui = class extends RI {
      constructor(t, r) {
        super(t, r), (this.state = { value: t.getInitValue ? t.getInitValue() : t.initValue });
      }
      componentWillUnmount() {
        this.unmounted = Date.now();
      }
      setState(t, r) {
        !this.unmounted || Date.now() - this.unmounted > 3e3
          ? super.setState(t, r)
          : console.log("[WARNING] Set state when unmounted");
      }
      render() {
        let { next: t } = this.props,
          { value: r } = this.state;
        return (
          t?.({
            value: r,
            onChange: (i, s) => {
              this.setState({ value: i }, s);
            },
            change: (i, s) => {
              this.setState((n) => ({ ...n, value: i(n.value) }), s);
            },
          }) ?? null
        );
      }
    };
    Ui.$_r2_state = !0;
  });
  var A = f((Om) => {
    var { State: SI } = Lm();
    Om.UseState = SI;
  });
  var Bm = f((Mm) => {
    var { extractShadowValues: wI } = Hn(),
      { createRootNode: CI } = Rr(),
      { createBaseControllers: _I } = Ar(),
      { ShadowReturnRootController: DI } = Un(),
      { renderUpdates: bI } = Sr(),
      EI = ({ onRequestRerendering: e }) => {
        let t = [],
          r = [],
          i = DI(),
          s = CI({ controllers: [..._I(), i] }),
          n = !1,
          o = (a) => {
            let l = bI({
              updates: a,
              onRequestUpdate: (c) => {
                t.push(c), !n && e();
              },
              isSchedulerEmpty: () => !t.length,
            });
            return l && r.push(l), wI(i);
          };
        return {
          runRendering: ({ fullRerender: a, elements: l }) => {
            for (n = !0; ;) {
              let c = t;
              t = [];
              let u = o([...((a && [s.createUpdate(l)]) || []), ...c]);
              if (!t.length) return (n = !1), u;
            }
          },
          dispose: () => {
            s.destroy();
          },
          commit: () => {
            for (let a of r) a();
            r.length = 0;
          },
        };
      };
    Mm.createRenderingCycle = EI;
  });
  var Q = f((Jm) => {
    var { Component: AI, createElement: TI } = $(),
      { cs: Do } = S(),
      { fragments: PI } = P(),
      { OnMounted: NI } = Nr(),
      { OnUnmounted: kI } = ae(),
      { OnUpdate: II } = Im(),
      { Static: FI } = ne(),
      { Static2: Gm } = de(),
      { UseState: qI } = A(),
      { chain: LI } = V(),
      { ensureArray: OI } = z(),
      { renderShadowParams: MI } = $n(),
      { createRenderingCycle: BI } = Bm(),
      GI = ({ renderShadow: e, next: t }) =>
        Do(
          ({ }, r) => TI(Wi, { fakeNext: r, next: t, renderShadow: e }),
          ["rerender", (r, i) => JI({ next: i })],
          ["lastRenderedShadow", (r, i) => VI({ value: e, next: i })],
          [
            "cycle",
            ({ rerender: r }, i) =>
              FI({ getInitValue: () => BI({ onRequestRerendering: r.invoke }), next: i }),
          ],
          ({ cycle: r, lastRenderedShadow: i }) =>
            PI(
              NI({ action: r.commit }),
              II({ fn: r.commit }),
              kI({ action: r.dispose }),
              LI(r.runRendering({ fullRerender: i !== e, elements: OI(e(MI)) }), (s) => t?.(s) ?? null)
            )
        );
    Jm.Shadow = GI;
    var JI = ({ next: e }) =>
      Do(
        ["rerender", (t, r) => qI({ next: r })],
        ["requested", (t, r) => Gm({ getInitValue: () => !1, next: r })],
        ({ requested: t, rerender: r }) => (
          t.get() && t.set(!1),
          e({
            invoke: () => {
              t.get() || (t.set(!0), r.onChange(null));
            },
          })
        )
      ),
      Wi = class extends AI {
        render() {
          return this.props.fakeNext();
        }
      };
    Wi.$_r2_shadow = !0;
    var VI = ({ value: e, next: t }) =>
      Do(["ref", (r, i) => Gm({ next: i })], ({ ref: r }) => {
        let i = r.get();
        return r.set(e), t(i);
      });
  });
  var Ao = f((Eo) => {
    var { Component: UI, createElement: WI } = W(),
      Vm = ({ next: e }) => WI(bo, { next: e });
    Eo.Rerender = Vm;
    Eo.Rerender1 = Vm;
    var bo = class extends UI {
      render() {
        let { next: t } = this.props;
        return t({
          forceUpdate: (r) => this.forceUpdate(r),
          invoke: (r) => {
            setTimeout(() => this.forceUpdate(r), 0);
          },
          scheduleRerender: (r) => {
            setTimeout(() => this.forceUpdate(r), 0);
          },
        });
      }
    };
  });
  var Ne = f((Um) => {
    var { cs: HI } = S(),
      { Static: zI } = ne(),
      { Rerender: $I } = Ao(),
      { fragments: ZI } = P(),
      { Invoke: XI } = X(),
      QI = ({ duration: e, onDone: t, next: r }) =>
        HI(
          ["start", (i, s) => zI({ getInitValue: () => performance.now(), next: s })],
          ["rerender", (i, s) => $I({ next: s })],
          ({ rerender: i, start: s }) =>
            ZI(
              r(Math.min(1, (performance.now() - s) / e)),
              XI({
                props: t,
                action: ({ getLatestProps: n }) => {
                  let o = () => {
                    i.forceUpdate(),
                      (performance.now() - s) / e < 1 ? requestAnimationFrame(o) : n()?.();
                  };
                  requestAnimationFrame(o);
                },
              })
            )
        );
    Um.TransitionProgress = QI;
  });
  var nt = f((Wm) => {
    function KI(e) {
      return -(Math.cos(Math.PI * e) - 1) / 2;
    }
    Wm.easeInOutSine = KI;
  });
  var kr = f((Hm) => {
    Hm.desktopGap = 70;
  });
  var Zm = f(($m) => {
    var { cs: zm } = S(),
      { Shadow: YI } = Q(),
      { UseState: jI } = A(),
      { TransitionProgress: eF } = Ne(),
      { easeInOutSine: tF } = nt(),
      { equalDeep: rF } = Se(),
      { desktopGap: iF } = kr(),
      sF = ({ includeWindow: e, next: t }) =>
        zm(
          ["state", (r, i) => jI({ next: i })],
          [
            "transitioning",
            ({ state: r }, i) =>
              YI({
                renderShadow: ({ acceptValue: s }) =>
                  zm(
                    ({ }, n) => (r.value ? n() : s()),
                    [
                      "progress",
                      (n, o) =>
                        eF({
                          duration: 300,
                          onDone: () => {
                            r.value.onDone(), r.onChange(null);
                          },
                          next: (a) => s({ progress: tF(a) }),
                        }),
                    ]
                  ),
                next: i,
              }),
          ],
          ({ state: r, transitioning: i }) =>
            t({
              mode: i
                ? {
                  desktopTransition: { ...i, desktopIndex: r.value.desktopIndex },
                  hideDock: i.progress,
                  windowsOverride: (() => {
                    let s = { width: window.innerWidth, height: window.innerHeight };
                    return (n, o) =>
                      rF(r.value.windowKey, n.key)
                        ? {
                          ps: o && {
                            pos: {
                              x: (1 - i.progress) * o.pos.x,
                              y: (1 - i.progress) * o.pos.y,
                            },
                            size: {
                              width:
                                o.size.width +
                                (s.width - o.size.width) * i.progress,
                              height:
                                o.size.height +
                                (s.height - o.size.height) * i.progress,
                            },
                          },
                          fullScreen: !0,
                          ignoreUpdate: !0,
                        }
                        : e(n.key)
                          ? {
                            ps: o && {
                              pos: {
                                x: o.pos.x - i.progress * (s.width + iF),
                                y: o.pos.y,
                              },
                              size: o.size,
                            },
                            ignoreUpdate: !0,
                          }
                          : { hidden: !0, ignoreUpdate: !0 };
                  })(),
                }
                : null,
              start: ({ window: s, desktopIndex: n, onDone: o }) =>
                r.onChange({ windowKey: s.key, desktopIndex: n, onDone: o }),
            })
        );
    $m.MaximizeAnimation = sF;
  });
  var Km = f((Qm) => {
    var { chain: nF } = V(),
      oF = ({ boxes: e, ratio: t }) => {
        let r = aF(e.shift());
        for (; e.length;) {
          let i = e.shift();
          r.expansion == null
            ? (r = { ...r, expansion: Xm({ saved: r.saved, box: i, ratio: t }) })
            : r.expansion.addBox(i) ||
            ((r = { saved: r.expansion.finalize(r.saved), expansion: null }),
              (r = { ...r, expansion: Xm({ saved: r.saved, box: i, ratio: t }) }));
        }
        return r.expansion && (r = { saved: r.expansion.finalize(r.saved), expansion: null }), r.saved;
      };
    Qm.arrangeBoxes = oF;
    var aF = (e) => ({
      saved: {
        boxes: [{ key: e.key, pos: { x: -e.size.width / 2, y: -e.size.height / 2 } }],
        rect: { pos: { x: -e.size.width / 2, y: -e.size.height / 2 }, size: e.size },
      },
      expansion: null,
    }),
      Xm = ({ saved: e, box: t, ratio: r }) =>
        e.rect.size.width / e.rect.size.height > r
          ? -e.rect.pos.y < e.rect.size.height / 2
            ? lF({ saved: e, box: t, ratio: r })
            : cF({ saved: e, box: t, ratio: r })
          : -e.rect.pos.x < e.rect.size.width / 2
            ? hF({ saved: e, box: t, ratio: r })
            : uF({ saved: e, box: t, ratio: r }),
      lF = ({ saved: e, box: t }) =>
        Hi(
          { saved: e, box: t },
          {
            getMain: (r) => r.height,
            getCross: (r) => r.width,
            applyMainPos: (r, i) => ({ x: r.x, y: r.y - i }),
            applyCrossPos: (r, i) => ({ x: r.x + i, y: r.y }),
            applyRect: (r, i) => ({
              pos: { x: r.pos.x, y: r.pos.y - i },
              size: { width: r.size.width, height: r.size.height + i },
            }),
          }
        ),
      cF = ({ saved: e, box: t }) =>
        Hi(
          { saved: e, box: t },
          {
            getMain: (r) => r.height,
            getCross: (r) => r.width,
            applyMainPos: (r, i, s) => ({ x: r.x, y: r.y + s.size.height }),
            applyCrossPos: (r, i) => ({ x: r.x + i, y: r.y }),
            applyRect: (r, i) => ({
              pos: { x: r.pos.x, y: r.pos.y },
              size: { width: r.size.width, height: r.size.height + i },
            }),
          }
        ),
      hF = ({ saved: e, box: t }) =>
        Hi(
          { saved: e, box: t },
          {
            getMain: (r) => r.width,
            getCross: (r) => r.height,
            applyMainPos: (r, i) => ({ x: r.x - i, y: r.y }),
            applyCrossPos: (r, i) => ({ x: r.x, y: r.y + i }),
            applyRect: (r, i) => ({
              pos: { x: r.pos.x - i, y: r.pos.y },
              size: { width: r.size.width + i, height: r.size.height },
            }),
          }
        ),
      uF = ({ saved: e, box: t }) =>
        Hi(
          { saved: e, box: t },
          {
            getMain: (r) => r.width,
            getCross: (r) => r.height,
            applyMainPos: (r, i, s) => ({ x: r.x + s.size.width, y: r.y }),
            applyCrossPos: (r, i) => ({ x: r.x, y: r.y + i }),
            applyRect: (r, i) => ({
              pos: { x: r.pos.x, y: r.pos.y },
              size: { width: r.size.width + i, height: r.size.height },
            }),
          }
        ),
      Hi = ({ saved: e, box: t }, r) => {
        let { getMain: i, getCross: s, applyRect: n, applyMainPos: o, applyCrossPos: a } = r,
          l = [t],
          c = i(t.size),
          u = s(e.rect.size) - s(t.size);
        return {
          addBox: (p) => {
            let m = s(p.size);
            return m > u || i(p.size) > c ? null : (l.push(p), (u -= m), !0);
          },
          finalize: (p) => {
            let m = u / 2;
            return {
              boxes: [
                ...p.boxes,
                ...l.map((d) => {
                  let g = {
                    key: d.key,
                    pos: nF(
                      p.rect.pos,
                      (x) => o(x, i(d.size), p.rect),
                      (x) => a(x, m)
                    ),
                  },
                    y = s(d.size);
                  return (m += y), g;
                }),
              ],
              rect: n(p.rect, c),
            };
          },
        };
      };
  });
  var ge = f((ot) => {
    var pF = (e, t) => (t ? { x: e.x + (t.x ?? 0), y: e.y + (t.y ?? 0) } : e);
    ot.addVector = pF;
    var fF = (e, t) => (t ? { x: e.x + (t.x ?? 0), y: e.y + (t.y ?? 0), z: e.z + (t.z ?? 0) } : e);
    ot.addVector3 = fF;
    var mF = (e, t) => Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2));
    ot.distance = mF;
    var dF = (e, t) => Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2) + Math.pow(e.z - t.z, 2));
    ot.distance3 = dF;
    var gF = (e, t) => ({ x: t(e.x), y: t(e.y) });
    ot.applyBothXY = gF;
    var xF = (e, t) => ({ x: e.x - t.x, y: e.y - t.y });
    ot.diffPoints = xF;
  });
  var To = f((Ym) => {
    var yF = (e, t) => Math.min(e.width / t.width, e.height / t.height);
    Ym.minRatio = yF;
  });
  var ed = f((jm) => {
    var { sort: RF } = T(),
      { arrangeBoxes: vF } = Km(),
      { addVector: SF } = ge(),
      { minRatio: wF } = To(),
      CF = ({ boxes: e, size: t, gap: r }) => {
        (t = { width: t.width + r, height: t.height + r }),
          (e = RF(e, (s) => -Math.max(s.size.width, s.size.height)));
        let i = 1;
        for (let s = 0; ; s++) {
          let n = e.map(({ key: c, size: u }) => ({
            key: c,
            size: { width: u.width * i + r, height: u.height * i + r },
          })),
            { rect: o, boxes: a } = vF({ boxes: n, ratio: t.width / t.height }),
            l = wF(t, o.size);
          if (s === 4 || l >= 1) {
            let c = {
              x: (t.width - o.size.width) / 2 - o.pos.x,
              y: (t.height - o.size.height) / 2 - o.pos.y,
            };
            return { scale: i, boxes: a.map(({ key: u, pos: p }) => ({ key: u, pos: SF(p, c) })) };
          }
          i = i * l - 0.01;
        }
      };
    jm.fitScaleBoxes = CF;
  });
  var Po = f((td) => {
    var { keepOnly: _F } = j(),
      { fitScaleBoxes: DF } = ed(),
      { addVector: bF } = ge(),
      EF = ({ windows: e, gap: t, rect: r }) => {
        let i = _F(r, ["width", "height"]),
          { scale: s, boxes: n } = DF({ boxes: e, size: i, gap: t });
        return { windows: n.map((o) => ({ ...o, pos: bF(o.pos, r) })), scale: s };
      };
    td.arrangeWindows = EF;
  });
  var rd = f((we) => {
    var { distance: zi } = ge(),
      AF = (e, t) => {
        let { min: r, abs: i } = Math;
        return e.x < t.x + t.width && e.x >= t.x
          ? e.y < t.y + t.height && e.y >= t.y
            ? 0
            : r(i(t.y - e.y), i(t.height + e.y - t.y))
          : e.y < t.y + t.height && e.y >= t.y
            ? r(i(t.x - e.x), i(t.width + e.x - t.x))
            : r(
              zi(e, { x: t.x, y: t.y }),
              zi(e, { x: t.x + t.width, y: t.y }),
              zi(e, { x: t.x, y: t.y + t.height }),
              zi(e, { x: t.x + t.width, y: t.y + t.height })
            );
      };
    we.distancePR = AF;
    var TF = (e) => ({ x: e.x + e.width / 2, y: e.y + e.height / 2 });
    we.center = TF;
    var PF = (e) => ({ x: e.x, y: e.y, width: 0, height: 0 });
    we.byPoint = PF;
    var NF = (e, t) => t.y >= e.y && t.y <= e.y + e.height && t.x >= e.x && t.x <= e.x + e.width;
    we.inside = NF;
    var kF = (e, t) => ({ x: e.x - t, y: e.y - t, width: e.width + t * 2, height: e.height + t * 2 });
    we.expandRect = kF;
    var IF = (e, t) => ({ x: e.x * t, y: e.y * t, width: e.width * t, height: e.height * t });
    we.scaleRect = IF;
    var FF = (e, t) => ({ x: e.x + t.x, y: e.y + t.y, width: e.width, height: e.height });
    we.moveRect = FF;
    var qF = (e, t) => ({ x: e.x, y: e.y + t, width: e.width, height: e.height - t });
    we.rectShrinkTop = qF;
    var LF = (e, t) => ({ x: e.x, y: e.y, width: e.width, height: e.height - t });
    we.rectShrinkBottom = LF;
    var OF = (e, t) => ({ x: e.x + t, y: e.y, width: e.width - t, height: e.height });
    we.rectShrinkLeft = OF;
    var MF = (e, t) => ({ x: e.x, y: e.y, width: e.width - t, height: e.height });
    we.rectShrinkRight = MF;
  });
  var No = f((id) => {
    var { chain: BF } = V(),
      { rectShrinkTop: GF, rectShrinkLeft: JF, rectShrinkRight: VF, rectShrinkBottom: UF } = rd(),
      WF = ({ topMargin: e = 50 }) =>
        BF(
          { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight },
          (t) => GF(t, e + 20),
          (t) => JF(t, 12),
          (t) => VF(t, 12),
          (t) => UF(t, 100)
        );
    id.getWindowsBoundary = WF;
  });
  var ko = f((sd) => {
    var HF = (e, t, r) => e + (t - e) * r;
    sd.progressNumber = HF;
  });
  var ad = f((od) => {
    var { progressNumber: nd } = ko(),
      zF = (e, t, r) => ({ x: nd(e.x, t.x, r), y: nd(e.y, t.y, r) });
    od.progressPos = zF;
  });
  var $i = f((ld) => {
    var { Shadow: $F } = Q(),
      { cs: ZF } = S(),
      { TransitionProgress: XF } = Ne(),
      { easeInOutSine: QF } = nt(),
      { progressNumber: KF } = ko(),
      { progressPos: YF } = ad(),
      jF = ({ state: e, onDone: t, next: r }) =>
        $F({
          renderShadow: ({ acceptValue: i }) =>
            ZF(
              ({ }, s) => (e.value ? s() : i()),
              [
                "progress",
                (s, n) =>
                  XF({
                    onDone: () => {
                      t(), e.onChange(null);
                    },
                    duration: 300,
                    next: n,
                  }),
              ],
              ({ progress: s }) => {
                let n = QF(s),
                  o = KF(e.value.fromScale, e.value.toScale, n),
                  a = e.value.windows?.map((l) => ({
                    key: l.key,
                    scale: o,
                    pos: YF(l.fromPos, l.toPos, n),
                  }));
                return i({ windows: a, progress: s, active: n });
              }
            ),
          next: r,
        });
    ld.WindowsTrans = jF;
  });
  var hd = f((cd) => {
    var { cs: eq } = S(),
      { arrangeWindows: tq } = Po(),
      { equalDeep: rq } = Se(),
      { UseState: iq } = A(),
      { getWindowsBoundary: sq } = No(),
      { WindowsTrans: nq } = $i(),
      oq = ({ getWindows: e, onEntered: t, next: r }) =>
        eq(
          ["transitioning", (i, s) => iq({ next: s })],
          [
            "trans",
            ({ transitioning: i }, s) =>
              nq({
                state: i,
                onDone: () =>
                  t({
                    windows: i.value.windows?.map((n) => ({ key: n.key, pos: n.toPos })),
                    scale: i.value.toScale,
                  }),
                next: s,
              }),
          ],
          ({ transitioning: i, trans: s }) =>
            r({
              activate: () => {
                let n = e(),
                  o = n?.length
                    ? tq({
                      windows: n.map((a) => ({ key: a.key, size: a.ps.size })),
                      gap: 12,
                      rect: sq({}),
                    })
                    : null;
                i.onChange({
                  windows: n?.map(({ key: a, ps: l }) => ({
                    key: a,
                    fromPos: l.pos,
                    toPos: o.windows.find((c) => rq(c.key, a)).pos,
                  })),
                  fromScale: 1,
                  toScale: o?.scale ?? 1,
                });
              },
              active: s?.active,
              display: i.value && { active: s.active, windows: s.windows },
            })
        );
    cd.EnterManual = oq;
  });
  var Io = f((ud) => {
    var { omit: aq } = j(),
      { equalDeep: lq } = Se(),
      cq =
        ({ windows: e, scale: t, miniWindows: r }) =>
          (i, s) => ({
            ...(() => {
              let n = e.find((a) => a.key.processId === i.key.processId && a.key.windowId === i.key.windowId);
              if (n) {
                let a = n.scale ?? t;
                return { ps: s && { pos: n.pos, size: s.size }, scale: a, shortShadow: !0 };
              }
              let o = r?.find((a) => lq(a.key, i.key));
              return o ? aq(o, ["key"]) : { hidden: !0 };
            })(),
            ignoreUpdate: !0,
            inert: !0,
          });
    ud.WindowsOverride = cq;
  });
  var pd = D(() => { });
  var B = f((Fo) => {
    var { createElement: hq, Fragment: uq } = W(),
      pq = (e) => (t, r) => fd({ key: e, next: r });
    Fo.keyed = pq;
    var fd = ({ key: e, next: t }) => hq(uq, { key: e }, t());
    Fo.keyed1 = fd;
  });
  var qo,
    Zi,
    md,
    dd,
    gd,
    fq,
    xd = D(() => {
      (qo = h(E())), (Zi = h(S()));
      pd();
      (md = h(B())),
        (dd = h(Se())),
        (gd = ({ getWindows: e, windows: t, onSelectWindow: r, scale: i }) =>
          (0, Zi.cs)(() => {
            let s = e();
            return qo.createElement(
              "div",
              { className: "window-handles window-handles-4y3" },
              t?.map((n) =>
                (0, Zi.cs)((0, md.keyed)(JSON.stringify(n.key)), () =>
                  fq({
                    pos: n.pos,
                    size: s.find((o) => (0, dd.equalDeep)(o.key, n.key)).ps.size,
                    scale: i,
                    onSelect: () => r(n.key),
                  })
                )
              )
            );
          })),
        (fq = ({ size: e, pos: t, scale: r, onSelect: i }) =>
          (0, Zi.cs)(() =>
            qo.createElement("div", {
              className: "window",
              style: { left: t.x - 5, top: t.y - 5, width: e.width * r + 10, height: e.height * r + 10 },
              onClick: (s) => {
                i(), s.stopPropagation();
              },
            })
          ));
    });
  var Lo = f((yd) => {
    yd.expandedHeight = 120;
  });
  var Sd = f((vd) => {
    var { cs: mq } = S(),
      { WindowsTrans: dq } = $i(),
      { UseState: gq } = A(),
      { arrangeWindows: xq } = Po(),
      { getWindowsBoundary: yq } = No(),
      { equalDeep: Rd } = Se(),
      { expandedHeight: Rq } = Lo(),
      vq = ({ main: e, getWindows: t, next: r }) =>
        mq(
          ["transitioning", (i, s) => gq({ next: s })],
          [
            "trans",
            ({ transitioning: i }, s) =>
              dq({
                state: i,
                onDone: () =>
                  e.onChange({
                    windows: i.value.windows?.map((n) => ({ key: n.key, pos: n.toPos })),
                    scale: i.value.toScale,
                  }),
                next: s,
              }),
          ],
          ({ transitioning: i, trans: s }) =>
            r({
              trans: s,
              start: () => {
                let n = t(),
                  o = n?.length
                    ? xq({
                      windows: e.value.windows.map((a) => ({
                        key: a.key,
                        size: n.find((l) => Rd(l.key, a.key)).ps.size,
                      })),
                      gap: 12,
                      rect: yq({ topMargin: Rq }),
                    })
                    : null;
                i.onChange({
                  windows: (e.value.windows ?? []).map(({ key: a, pos: l }) => ({
                    key: a,
                    fromPos: l,
                    toPos: o.windows.find((c) => Rd(c.key, a)).pos,
                  })),
                  fromScale: e.value.scale,
                  toScale: o?.scale ?? 1,
                });
              },
            })
        );
    vd.ExpandHeaderTrans = vq;
  });
  var At = f((_d) => {
    var { getPath: Sq, setPath: wd, changePath: Cd } = oe(),
      wq = (e, t) => ({
        value: Sq(e.value, t),
        onChange: (r, i) => {
          e.change ? e.change((s) => wd(s, t, r), i) : e.onChange(wd(e.value, t, r), i);
        },
        change: (r, i) => {
          e.change ? e.change((s) => Cd(s, t, r), i) : e.onChange(Cd(e.value, t, r), i);
        },
      });
    _d.scope = wq;
  });
  var pe = f((Oo) => {
    var { changePath: Dd } = oe(),
      bd = (e, t, r) => {
        e.change ? e.change((i) => Dd(i, t, r)) : e.onChange(Dd(e.value, t, r));
      };
    Oo.spc = bd;
    Oo.scnv = bd;
  });
  var Fd = {};
  Xe(Fd, { MainDisplay: () => Cq });
  var uV,
    Ed,
    Ad,
    pV,
    Td,
    Pd,
    Nd,
    kd,
    Id,
    Cq,
    qd = D(() => {
      (uV = h(E())), (Ed = h(S())), (Ad = h(A())), (pV = h(Io()));
      xd();
      (Td = h(Sd())),
        (Pd = h(At())),
        (Nd = h(pe())),
        (kd = h(P())),
        (Id = h(X())),
        (Cq = ({ getWindows: e, onSelectWindow: t, next: r }) =>
          (0, Ed.cs)(
            ["state", (i, s) => (0, Ad.UseState)({ next: s })],
            [
              "expandHeaderTrans",
              ({ state: i }, s) =>
                (0, Td.ExpandHeaderTrans)({ getWindows: e, main: (0, Pd.scope)(i, ["main"]), next: s }),
            ],
            [
              "level1",
              ({ state: i, expandHeaderTrans: s }, n) =>
                r({
                  onHeaderExpanded: () => {
                    (0, Nd.spc)(i, [], (o) => o && { ...o, headerExpanded: !0 });
                  },
                  activate: (o) => i.onChange({ main: o }),
                  deactivate: () => i.onChange(null),
                  exitMissionControl: () => i.onChange(null),
                  main: i.value?.main,
                  active: !!i.value?.main,
                  next: n,
                }),
            ],
            ({ state: i, expandHeaderTrans: s }, n) =>
              (0, kd.fragments)(
                i.value?.headerExpanded && (0, Id.Invoke)({ action: () => s.start() }),
                n()
              ),
            ({ state: i, expandHeaderTrans: s, level1: { exitManual: n, next: o } }) =>
              o({
                display: i.value && {
                  active: 1,
                  ...(s.trans
                    ? { windows: s.trans.windows }
                    : { windows: i.value.main.windows, scale: i.value.main.scale }),
                  renderTop: () =>
                    !s.trans &&
                    gd({
                      getWindows: e,
                      windows: i.value.main.windows,
                      onSelectWindow: (a) => {
                        t(a), n.startExiting();
                      },
                      scale: i.value.main.scale,
                    }),
                },
              })
          ));
    });
  var Od = f((Ld) => {
    var { OnUnmounted: _q } = ae(),
      { Invoke: Dq } = X(),
      { fragments: bq } = P(),
      { cs: Eq } = S(),
      { Static2: Aq } = de(),
      { remove1Mutate: Tq, last: Pq } = T(),
      Nq = ({ eventName: e, surCheck: t }) => {
        let r = [],
          i = null,
          s = () => {
            let o = (a) => {
              t(a) && (a.stopPropagation(), a.preventDefault(), Pq(r)(a));
            };
            window.addEventListener(e, o), (i = () => window.removeEventListener(e, o));
          },
          n = (o) => (
            r.push(o),
            r.length === 1 && s(),
            () => {
              Tq(r, o), r.length === 0 && i();
            }
          );
        return ({ action: o }) =>
          Eq(["cleanup", (a, l) => Aq({ next: l })], ({ cleanup: a }) =>
            bq(
              Dq({
                props: o,
                fn: ({ getLatestProps: l }) => {
                  let c = n(() => l()());
                  a.set(c);
                },
              }),
              _q({ action: () => a.get()() })
            )
          );
      };
    Ld.GlobalEventQueue = Nq;
  });
  var Ce = f((Tt) => {
    var Md = (e) => Mo(Bo(e));
    Tt.keyCombo = Md;
    Tt.keyCombo1 = Md;
    var kq = (e, t) => Mo(t)(e);
    Tt.matchEvent = kq;
    var Mo = (e) => {
      let { masks: t = [], key: r, keyCode: i } = e,
        s = t.reduce((n, o) => ({ ...n, [o]: !0 }), { shift: !1, alt: !1, meta: !1, ctrl: !1 });
      return (n) =>
        Object.keys(s).find((o) => n[o + "Key"] !== s[o])
          ? !1
          : i != null
            ? i === n.keyCode
            : r === n.key.toLowerCase();
    };
    Tt.eventMatcher = Mo;
    var Bo = (e) => {
      e = e.toLowerCase();
      let t = /(\^|ctrl\+|control\+|shift\+|alt\+|meta\+)(.+)/i.exec(e);
      if (t) {
        let r = Bo(t[2]);
        return { masks: [Fq[t[1]], ...r.masks], key: r.key, keyCode: r.keyCode };
      } else return { masks: [], key: e === "space" ? " " : e.toLowerCase(), keyCode: Iq(e.toLowerCase()) };
    };
    Tt.parsePattern = Bo;
    var Iq = (e) => {
      if (e === "space") return 32;
      if (e === "comma" || e === ",") return 188;
      if (isNaN(e)) {
        if (e.length === 1) return e.toUpperCase().charCodeAt(0);
      } else return 48 + +e;
    },
      Fq = {
        "^": "ctrl",
        "ctrl+": "ctrl",
        "control+": "ctrl",
        "shift+": "shift",
        "alt+": "alt",
        "meta+": "meta",
      };
  });
  var Ir = f((Go) => {
    var { GlobalEventQueue: Bd } = Od(),
      { eventMatcher: qq } = Ce(),
      Lq = Bd({ eventName: "keydown", surCheck: (e) => e.key === "Escape" });
    Go.OnGlobalKeyDownEscape = Lq;
    var Oq = (e, t) => {
      let r = {};
      return (i) => {
        let s = t(i);
        if (r.hasOwnProperty(s)) return r[s];
        {
          let n = e(i);
          return (r[s] = n), n;
        }
      };
    },
      Mq = Oq(
        (e) => {
          let t = qq(e);
          return Bd({ eventName: "keydown", surCheck: t });
        },
        (e) => JSON.stringify(e)
      ),
      Bq = ({ keyCombo: e, action: t }) => Mq(e)({ action: t });
    Go.GlobalShortCut = Bq;
  });
  var Ud = f((Vd) => {
    var { cs: Gd } = S(),
      { equalDeep: Gq } = Se(),
      { UseState: Jq } = A(),
      { fragments: Jd } = P(),
      { WindowsTrans: Vq } = $i(),
      { OnGlobalKeyDownEscape: Uq } = Ir(),
      Wq = ({ getWindows: e, main: t, onExited: r, next: i }) =>
        Gd(
          ["transitioning", (s, n) => Jq({ next: n })],
          [
            "startExiting",
            ({ transitioning: s }, n) =>
              n(() => {
                s.onChange({
                  windows: e()?.map(({ key: o, ps: a }) => {
                    let l = t.windows.find((c) => Gq(c.key, o));
                    return { key: o, fromPos: l.pos, toPos: a.pos };
                  }),
                  fromScale: t.scale,
                  toScale: 1,
                });
              }),
          ],
          ({ startExiting: s }, n) => Jd(t && Gd(({ }, o) => Jd(Uq({ action: s }), o)), n()),
          ["trans", ({ transitioning: s }, n) => Vq({ state: s, onDone: r, next: n })],
          ({ trans: s, startExiting: n }) =>
            i({
              startExiting: n,
              active: s?.active,
              display: s && { active: 1 - s.active, windows: s.windows },
            })
        );
    Vd.ExitManual = Wq;
  });
  var Wd = D(() => { });
  function Hq(e) {
    if (e.sheet) return e.sheet;
    for (var t = 0; t < document.styleSheets.length; t++)
      if (document.styleSheets[t].ownerNode === e) return document.styleSheets[t];
  }
  function zq(e) {
    var t = document.createElement("style");
    return (
      t.setAttribute("data-emotion", e.key),
      e.nonce !== void 0 && t.setAttribute("nonce", e.nonce),
      t.appendChild(document.createTextNode("")),
      t.setAttribute("data-s", ""),
      t
    );
  }
  var Hd,
    zd = D(() => {
      Hd = (function () {
        function e(r) {
          var i = this;
          (this._insertTag = function (s) {
            var n;
            i.tags.length === 0
              ? i.insertionPoint
                ? (n = i.insertionPoint.nextSibling)
                : i.prepend
                  ? (n = i.container.firstChild)
                  : (n = i.before)
              : (n = i.tags[i.tags.length - 1].nextSibling),
              i.container.insertBefore(s, n),
              i.tags.push(s);
          }),
            (this.isSpeedy = r.speedy === void 0 ? !0 : r.speedy),
            (this.tags = []),
            (this.ctr = 0),
            (this.nonce = r.nonce),
            (this.key = r.key),
            (this.container = r.container),
            (this.prepend = r.prepend),
            (this.insertionPoint = r.insertionPoint),
            (this.before = null);
        }
        var t = e.prototype;
        return (
          (t.hydrate = function (i) {
            i.forEach(this._insertTag);
          }),
          (t.insert = function (i) {
            this.ctr % (this.isSpeedy ? 65e3 : 1) === 0 && this._insertTag(zq(this));
            var s = this.tags[this.tags.length - 1];
            if (!1) var n;
            if (this.isSpeedy) {
              var o = Hq(s);
              try {
                o.insertRule(i, o.cssRules.length);
              } catch { }
            } else s.appendChild(document.createTextNode(i));
            this.ctr++;
          }),
          (t.flush = function () {
            this.tags.forEach(function (i) {
              return i.parentNode && i.parentNode.removeChild(i);
            }),
              (this.tags = []),
              (this.ctr = 0);
          }),
          e
        );
      })();
    });
  var K,
    Pt,
    L,
    Xi,
    Nt,
    kt,
    $d,
    Qi,
    It = D(() => {
      (K = "-ms-"),
        (Pt = "-moz-"),
        (L = "-webkit-"),
        (Xi = "comm"),
        (Nt = "rule"),
        (kt = "decl"),
        ($d = "@import"),
        (Qi = "@keyframes");
    });
  function Qd(e, t) {
    return (((((((t << 2) ^ ee(e, 0)) << 2) ^ ee(e, 1)) << 2) ^ ee(e, 2)) << 2) ^ ee(e, 3);
  }
  function Ki(e) {
    return e.trim();
  }
  function Kd(e, t) {
    return (e = t.exec(e)) ? e[0] : e;
  }
  function O(e, t, r) {
    return e.replace(t, r);
  }
  function Fr(e, t) {
    return e.indexOf(t);
  }
  function ee(e, t) {
    return e.charCodeAt(t) | 0;
  }
  function Ke(e, t, r) {
    return e.slice(t, r);
  }
  function le(e) {
    return e.length;
  }
  function Ft(e) {
    return e.length;
  }
  function qt(e, t) {
    return t.push(e), e;
  }
  function Yd(e, t) {
    return e.map(t).join("");
  }
  var Zd,
    at,
    Xd,
    lt = D(() => {
      (Zd = Math.abs), (at = String.fromCharCode), (Xd = Object.assign);
    });
  function qr(e, t, r, i, s, n, o) {
    return {
      value: e,
      root: t,
      parent: r,
      type: i,
      props: s,
      children: n,
      line: Yi,
      column: Lt,
      length: o,
      return: "",
    };
  }
  function Bt(e, t) {
    return Xd(qr("", null, null, "", null, null, 0), e, { length: -e.length }, t);
  }
  function e0() {
    return H;
  }
  function t0() {
    return (H = ce > 0 ? ee(Mt, --ce) : 0), Lt--, H === 10 && ((Lt = 1), Yi--), H;
  }
  function he() {
    return (H = ce < jd ? ee(Mt, ce++) : 0), Lt++, H === 10 && ((Lt = 1), Yi++), H;
  }
  function _e() {
    return ee(Mt, ce);
  }
  function Lr() {
    return ce;
  }
  function Gt(e, t) {
    return Ke(Mt, e, t);
  }
  function Ot(e) {
    switch (e) {
      case 0:
      case 9:
      case 10:
      case 13:
      case 32:
        return 5;
      case 33:
      case 43:
      case 44:
      case 47:
      case 62:
      case 64:
      case 126:
      case 59:
      case 123:
      case 125:
        return 4;
      case 58:
        return 3;
      case 34:
      case 39:
      case 40:
      case 91:
        return 2;
      case 41:
      case 93:
        return 1;
    }
    return 0;
  }
  function ji(e) {
    return (Yi = Lt = 1), (jd = le((Mt = e))), (ce = 0), [];
  }
  function es(e) {
    return (Mt = ""), e;
  }
  function Jt(e) {
    return Ki(Gt(ce - 1, Jo(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
  }
  function r0(e) {
    for (; (H = _e()) && H < 33;) he();
    return Ot(e) > 2 || Ot(H) > 3 ? "" : " ";
  }
  function i0(e, t) {
    for (; --t && he() && !(H < 48 || H > 102 || (H > 57 && H < 65) || (H > 70 && H < 97)););
    return Gt(e, Lr() + (t < 6 && _e() == 32 && he() == 32));
  }
  function Jo(e) {
    for (; he();)
      switch (H) {
        case e:
          return ce;
        case 34:
        case 39:
          e !== 34 && e !== 39 && Jo(H);
          break;
        case 40:
          e === 41 && Jo(e);
          break;
        case 92:
          he();
          break;
      }
    return ce;
  }
  function s0(e, t) {
    for (; he() && e + H !== 47 + 10;) if (e + H === 42 + 42 && _e() === 47) break;
    return "/*" + Gt(t, ce - 1) + "*" + at(e === 47 ? e : he());
  }
  function n0(e) {
    for (; !Ot(_e());) he();
    return Gt(e, ce);
  }
  var Yi,
    Lt,
    jd,
    ce,
    H,
    Mt,
    ts = D(() => {
      lt();
      (Yi = 1), (Lt = 1), (jd = 0), (ce = 0), (H = 0), (Mt = "");
    });
  function l0(e) {
    return es(rs("", null, null, null, [""], (e = ji(e)), 0, [0], e));
  }
  function rs(e, t, r, i, s, n, o, a, l) {
    for (
      var c = 0,
      u = 0,
      p = o,
      m = 0,
      d = 0,
      g = 0,
      y = 1,
      x = 1,
      R = 1,
      w = 0,
      b = "",
      k = s,
      M = n,
      F = i,
      J = b;
      x;

    )
      switch (((g = w), (w = he()))) {
        case 40:
          if (g != 108 && J.charCodeAt(p - 1) == 58) {
            Fr((J += O(Jt(w), "&", "&\f")), "&\f") != -1 && (R = -1);
            break;
          }
        case 34:
        case 39:
        case 91:
          J += Jt(w);
          break;
        case 9:
        case 10:
        case 13:
        case 32:
          J += r0(g);
          break;
        case 92:
          J += i0(Lr() - 1, 7);
          continue;
        case 47:
          switch (_e()) {
            case 42:
            case 47:
              qt($q(s0(he(), Lr()), t, r), l);
              break;
            default:
              J += "/";
          }
          break;
        case 123 * y:
          a[c++] = le(J) * R;
        case 125 * y:
        case 59:
        case 0:
          switch (w) {
            case 0:
            case 125:
              x = 0;
            case 59 + u:
              d > 0 &&
                le(J) - p &&
                qt(d > 32 ? a0(J + ";", i, r, p - 1) : a0(O(J, " ", "") + ";", i, r, p - 2), l);
              break;
            case 59:
              J += ";";
            default:
              if ((qt((F = o0(J, t, r, c, u, s, a, b, (k = []), (M = []), p)), n), w === 123))
                if (u === 0) rs(J, t, F, F, k, n, p, a, M);
                else
                  switch (m) {
                    case 100:
                    case 109:
                    case 115:
                      rs(
                        e,
                        F,
                        F,
                        i && qt(o0(e, F, F, 0, 0, s, a, b, s, (k = []), p), M),
                        s,
                        M,
                        p,
                        a,
                        i ? k : M
                      );
                      break;
                    default:
                      rs(J, F, F, F, [""], M, 0, a, M);
                  }
          }
          (c = u = d = 0), (y = R = 1), (b = J = ""), (p = o);
          break;
        case 58:
          (p = 1 + le(J)), (d = g);
        default:
          if (y < 1) {
            if (w == 123) --y;
            else if (w == 125 && y++ == 0 && t0() == 125) continue;
          }
          switch (((J += at(w)), w * y)) {
            case 38:
              R = u > 0 ? 1 : ((J += "\f"), -1);
              break;
            case 44:
              (a[c++] = (le(J) - 1) * R), (R = 1);
              break;
            case 64:
              _e() === 45 && (J += Jt(he())), (m = _e()), (u = p = le((b = J += n0(Lr())))), w++;
              break;
            case 45:
              g === 45 && le(J) == 2 && (y = 0);
          }
      }
    return n;
  }
  function o0(e, t, r, i, s, n, o, a, l, c, u) {
    for (var p = s - 1, m = s === 0 ? n : [""], d = Ft(m), g = 0, y = 0, x = 0; g < i; ++g)
      for (var R = 0, w = Ke(e, p + 1, (p = Zd((y = o[g])))), b = e; R < d; ++R)
        (b = Ki(y > 0 ? m[R] + " " + w : O(w, /&\f/g, m[R]))) && (l[x++] = b);
    return qr(e, t, r, s === 0 ? Nt : a, l, c, u);
  }
  function $q(e, t, r) {
    return qr(e, t, r, Xi, at(e0()), Ke(e, 2, -2), 0);
  }
  function a0(e, t, r, i) {
    return qr(e, t, r, kt, Ke(e, 0, i), Ke(e, i + 1, -1), i);
  }
  var c0 = D(() => {
    It();
    lt();
    ts();
  });
  function Vo(e, t) {
    switch (Qd(e, t)) {
      case 5103:
        return L + "print-" + e + e;
      case 5737:
      case 4201:
      case 3177:
      case 3433:
      case 1641:
      case 4457:
      case 2921:
      case 5572:
      case 6356:
      case 5844:
      case 3191:
      case 6645:
      case 3005:
      case 6391:
      case 5879:
      case 5623:
      case 6135:
      case 4599:
      case 4855:
      case 4215:
      case 6389:
      case 5109:
      case 5365:
      case 5621:
      case 3829:
        return L + e + e;
      case 5349:
      case 4246:
      case 4810:
      case 6968:
      case 2756:
        return L + e + Pt + e + K + e + e;
      case 6828:
      case 4268:
        return L + e + K + e + e;
      case 6165:
        return L + e + K + "flex-" + e + e;
      case 5187:
        return L + e + O(e, /(\w+).+(:[^]+)/, L + "box-$1$2" + K + "flex-$1$2") + e;
      case 5443:
        return L + e + K + "flex-item-" + O(e, /flex-|-self/, "") + e;
      case 4675:
        return L + e + K + "flex-line-pack" + O(e, /align-content|flex-|-self/, "") + e;
      case 5548:
        return L + e + K + O(e, "shrink", "negative") + e;
      case 5292:
        return L + e + K + O(e, "basis", "preferred-size") + e;
      case 6060:
        return L + "box-" + O(e, "-grow", "") + L + e + K + O(e, "grow", "positive") + e;
      case 4554:
        return L + O(e, /([^-])(transform)/g, "$1" + L + "$2") + e;
      case 6187:
        return O(O(O(e, /(zoom-|grab)/, L + "$1"), /(image-set)/, L + "$1"), e, "") + e;
      case 5495:
      case 3959:
        return O(e, /(image-set\([^]*)/, L + "$1$`$1");
      case 4968:
        return (
          O(O(e, /(.+:)(flex-)?(.*)/, L + "box-pack:$3" + K + "flex-pack:$3"), /s.+-b[^;]+/, "justify") +
          L +
          e +
          e
        );
      case 4095:
      case 3583:
      case 4068:
      case 2532:
        return O(e, /(.+)-inline(.+)/, L + "$1$2") + e;
      case 8116:
      case 7059:
      case 5753:
      case 5535:
      case 5445:
      case 5701:
      case 4933:
      case 4677:
      case 5533:
      case 5789:
      case 5021:
      case 4765:
        if (le(e) - 1 - t > 6)
          switch (ee(e, t + 1)) {
            case 109:
              if (ee(e, t + 4) !== 45) break;
            case 102:
              return (
                O(
                  e,
                  /(.+:)(.+)-([^]+)/,
                  "$1" + L + "$2-$3$1" + Pt + (ee(e, t + 3) == 108 ? "$3" : "$2-$3")
                ) + e
              );
            case 115:
              return ~Fr(e, "stretch") ? Vo(O(e, "stretch", "fill-available"), t) + e : e;
          }
        break;
      case 4949:
        if (ee(e, t + 1) !== 115) break;
      case 6444:
        switch (ee(e, le(e) - 3 - (~Fr(e, "!important") && 10))) {
          case 107:
            return O(e, ":", ":" + L) + e;
          case 101:
            return (
              O(
                e,
                /(.+:)([^;!]+)(;|!.+)?/,
                "$1" +
                L +
                (ee(e, 14) === 45 ? "inline-" : "") +
                "box$3$1" +
                L +
                "$2$3$1" +
                K +
                "$2box$3"
              ) + e
            );
        }
        break;
      case 5936:
        switch (ee(e, t + 11)) {
          case 114:
            return L + e + K + O(e, /[svh]\w+-[tblr]{2}/, "tb") + e;
          case 108:
            return L + e + K + O(e, /[svh]\w+-[tblr]{2}/, "tb-rl") + e;
          case 45:
            return L + e + K + O(e, /[svh]\w+-[tblr]{2}/, "lr") + e;
        }
        return L + e + K + e + e;
    }
    return e;
  }
  var Uo = D(() => {
    It();
    lt();
  });
  function Ye(e, t) {
    for (var r = "", i = Ft(e), s = 0; s < i; s++) r += t(e[s], s, e, t) || "";
    return r;
  }
  function h0(e, t, r, i) {
    switch (e.type) {
      case $d:
      case kt:
        return (e.return = e.return || e.value);
      case Xi:
        return "";
      case Qi:
        return (e.return = e.value + "{" + Ye(e.children, i) + "}");
      case Nt:
        e.value = e.props.join(",");
    }
    return le((r = Ye(e.children, i))) ? (e.return = e.value + "{" + r + "}") : "";
  }
  var Wo = D(() => {
    It();
    lt();
  });
  function u0(e) {
    var t = Ft(e);
    return function (r, i, s, n) {
      for (var o = "", a = 0; a < t; a++) o += e[a](r, i, s, n) || "";
      return o;
    };
  }
  function p0(e) {
    return function (t) {
      t.root || ((t = t.return) && e(t));
    };
  }
  function f0(e, t, r, i) {
    if (e.length > -1 && !e.return)
      switch (e.type) {
        case kt:
          e.return = Vo(e.value, e.length);
          break;
        case Qi:
          return Ye([Bt(e, { value: O(e.value, "@", "@" + L) })], i);
        case Nt:
          if (e.length)
            return Yd(e.props, function (s) {
              switch (Kd(s, /(::plac\w+|:read-\w+)/)) {
                case ":read-only":
                case ":read-write":
                  return Ye([Bt(e, { props: [O(s, /:(read-\w+)/, ":" + Pt + "$1")] })], i);
                case "::placeholder":
                  return Ye(
                    [
                      Bt(e, { props: [O(s, /:(plac\w+)/, ":" + L + "input-$1")] }),
                      Bt(e, { props: [O(s, /:(plac\w+)/, ":" + Pt + "$1")] }),
                      Bt(e, { props: [O(s, /:(plac\w+)/, K + "input-$1")] }),
                    ],
                    i
                  );
              }
              return "";
            });
      }
  }
  var m0 = D(() => {
    It();
    lt();
    ts();
    Wo();
    Uo();
  });
  var d0 = D(() => {
    It();
    lt();
    c0();
    Uo();
    ts();
    Wo();
    m0();
  });
  var g0 = D(() => { });
  function Zq(e) {
    var t = Object.create(null);
    return function (r) {
      return t[r] === void 0 && (t[r] = e(r)), t[r];
    };
  }
  var x0,
    Ho = D(() => {
      x0 = Zq;
    });
  var Xq,
    Qq,
    Kq,
    y0,
    Yq,
    jq,
    eL,
    tL,
    R0,
    zo = D(() => {
      zd();
      d0();
      g0();
      Ho();
      (Xq = function (t, r, i) {
        for (var s = 0, n = 0; (s = n), (n = _e()), s === 38 && n === 12 && (r[i] = 1), !Ot(n);) he();
        return Gt(t, ce);
      }),
        (Qq = function (t, r) {
          var i = -1,
            s = 44;
          do
            switch (Ot(s)) {
              case 0:
                s === 38 && _e() === 12 && (r[i] = 1), (t[i] += Xq(ce - 1, r, i));
                break;
              case 2:
                t[i] += Jt(s);
                break;
              case 4:
                if (s === 44) {
                  (t[++i] = _e() === 58 ? "&\f" : ""), (r[i] = t[i].length);
                  break;
                }
              default:
                t[i] += at(s);
            }
          while ((s = he()));
          return t;
        }),
        (Kq = function (t, r) {
          return es(Qq(ji(t), r));
        }),
        (y0 = new WeakMap()),
        (Yq = function (t) {
          if (!(t.type !== "rule" || !t.parent || t.length < 1)) {
            for (
              var r = t.value, i = t.parent, s = t.column === i.column && t.line === i.line;
              i.type !== "rule";

            )
              if (((i = i.parent), !i)) return;
            if (!(t.props.length === 1 && r.charCodeAt(0) !== 58 && !y0.get(i)) && !s) {
              y0.set(t, !0);
              for (var n = [], o = Kq(r, n), a = i.props, l = 0, c = 0; l < o.length; l++)
                for (var u = 0; u < a.length; u++, c++)
                  t.props[c] = n[l] ? o[l].replace(/&\f/g, a[u]) : a[u] + " " + o[l];
            }
          }
        }),
        (jq = function (t) {
          if (t.type === "decl") {
            var r = t.value;
            r.charCodeAt(0) === 108 && r.charCodeAt(2) === 98 && ((t.return = ""), (t.value = ""));
          }
        }),
        (eL = [f0]),
        (tL = function (t) {
          var r = t.key;
          if (r === "css") {
            var i = document.querySelectorAll("style[data-emotion]:not([data-s])");
            Array.prototype.forEach.call(i, function (y) {
              var x = y.getAttribute("data-emotion");
              x.indexOf(" ") !== -1 && (document.head.appendChild(y), y.setAttribute("data-s", ""));
            });
          }
          var s = t.stylisPlugins || eL,
            n = {},
            o,
            a = [];
          (o = t.container || document.head),
            Array.prototype.forEach.call(
              document.querySelectorAll('style[data-emotion^="' + r + ' "]'),
              function (y) {
                for (var x = y.getAttribute("data-emotion").split(" "), R = 1; R < x.length; R++)
                  n[x[R]] = !0;
                a.push(y);
              }
            );
          var l,
            c = [Yq, jq];
          {
            var u,
              p = [
                h0,
                p0(function (y) {
                  u.insert(y);
                }),
              ],
              m = u0(c.concat(s, p)),
              d = function (x) {
                return Ye(l0(x), m);
              };
            l = function (x, R, w, b) {
              (u = w), d(x ? x + "{" + R.styles + "}" : R.styles), b && (g.inserted[R.name] = !0);
            };
          }
          var g = {
            key: r,
            sheet: new Hd({
              key: r,
              container: o,
              nonce: t.nonce,
              speedy: t.speedy,
              prepend: t.prepend,
              insertionPoint: t.insertionPoint,
            }),
            nonce: t.nonce,
            inserted: n,
            registered: {},
            insert: l,
          };
          return g.sheet.hydrate(a), g;
        }),
        (R0 = tL);
    });
  function rL(e) {
    for (var t = 0, r, i = 0, s = e.length; s >= 4; ++i, s -= 4)
      (r =
        (e.charCodeAt(i) & 255) |
        ((e.charCodeAt(++i) & 255) << 8) |
        ((e.charCodeAt(++i) & 255) << 16) |
        ((e.charCodeAt(++i) & 255) << 24)),
        (r = (r & 65535) * 1540483477 + (((r >>> 16) * 59797) << 16)),
        (r ^= r >>> 24),
        (t =
          ((r & 65535) * 1540483477 + (((r >>> 16) * 59797) << 16)) ^
          ((t & 65535) * 1540483477 + (((t >>> 16) * 59797) << 16)));
    switch (s) {
      case 3:
        t ^= (e.charCodeAt(i + 2) & 255) << 16;
      case 2:
        t ^= (e.charCodeAt(i + 1) & 255) << 8;
      case 1:
        (t ^= e.charCodeAt(i) & 255), (t = (t & 65535) * 1540483477 + (((t >>> 16) * 59797) << 16));
    }
    return (
      (t ^= t >>> 13),
      (t = (t & 65535) * 1540483477 + (((t >>> 16) * 59797) << 16)),
      ((t ^ (t >>> 15)) >>> 0).toString(36)
    );
  }
  var v0,
    S0 = D(() => {
      v0 = rL;
    });
  var iL,
    w0,
    C0 = D(() => {
      (iL = {
        animationIterationCount: 1,
        borderImageOutset: 1,
        borderImageSlice: 1,
        borderImageWidth: 1,
        boxFlex: 1,
        boxFlexGroup: 1,
        boxOrdinalGroup: 1,
        columnCount: 1,
        columns: 1,
        flex: 1,
        flexGrow: 1,
        flexPositive: 1,
        flexShrink: 1,
        flexNegative: 1,
        flexOrder: 1,
        gridRow: 1,
        gridRowEnd: 1,
        gridRowSpan: 1,
        gridRowStart: 1,
        gridColumn: 1,
        gridColumnEnd: 1,
        gridColumnSpan: 1,
        gridColumnStart: 1,
        msGridRow: 1,
        msGridRowSpan: 1,
        msGridColumn: 1,
        msGridColumnSpan: 1,
        fontWeight: 1,
        lineHeight: 1,
        opacity: 1,
        order: 1,
        orphans: 1,
        tabSize: 1,
        widows: 1,
        zIndex: 1,
        zoom: 1,
        WebkitLineClamp: 1,
        fillOpacity: 1,
        floodOpacity: 1,
        stopOpacity: 1,
        strokeDasharray: 1,
        strokeDashoffset: 1,
        strokeMiterlimit: 1,
        strokeOpacity: 1,
        strokeWidth: 1,
      }),
        (w0 = iL);
    });
  function Or(e, t, r) {
    if (r == null) return "";
    if (r.__emotion_styles !== void 0) return r;
    switch (typeof r) {
      case "boolean":
        return "";
      case "object": {
        if (r.anim === 1) return (ke = { name: r.name, styles: r.styles, next: ke }), r.name;
        if (r.styles !== void 0) {
          var i = r.next;
          if (i !== void 0)
            for (; i !== void 0;) (ke = { name: i.name, styles: i.styles, next: ke }), (i = i.next);
          var s = r.styles + ";";
          return s;
        }
        return oL(e, t, r);
      }
      case "function": {
        if (e !== void 0) {
          var n = ke,
            o = r(e);
          return (ke = n), Or(e, t, o);
        }
        break;
      }
      case "string":
        if (!1) var a, l;
        break;
    }
    if (t == null) return r;
    var c = t[r];
    return c !== void 0 ? c : r;
  }
  function oL(e, t, r) {
    var i = "";
    if (Array.isArray(r)) for (var s = 0; s < r.length; s++) i += Or(e, t, r[s]) + ";";
    else
      for (var n in r) {
        var o = r[n];
        if (typeof o != "object")
          t != null && t[o] !== void 0
            ? (i += n + "{" + t[o] + "}")
            : _0(o) && (i += $o(n) + ":" + D0(n, o) + ";");
        else if (Array.isArray(o) && typeof o[0] == "string" && (t == null || t[o[0]] === void 0))
          for (var a = 0; a < o.length; a++) _0(o[a]) && (i += $o(n) + ":" + D0(n, o[a]) + ";");
        else {
          var l = Or(e, t, o);
          switch (n) {
            case "animation":
            case "animationName": {
              i += $o(n) + ":" + l + ";";
              break;
            }
            default:
              i += n + "{" + l + "}";
          }
        }
      }
    return i;
  }
  var sL,
    nL,
    E0,
    _0,
    $o,
    D0,
    b0,
    ke,
    is,
    Zo = D(() => {
      S0();
      C0();
      Ho();
      (sL = /[A-Z]|^ms/g),
        (nL = /_EMO_([^_]+?)_([^]*?)_EMO_/g),
        (E0 = function (t) {
          return t.charCodeAt(1) === 45;
        }),
        (_0 = function (t) {
          return t != null && typeof t != "boolean";
        }),
        ($o = x0(function (e) {
          return E0(e) ? e : e.replace(sL, "-$&").toLowerCase();
        })),
        (D0 = function (t, r) {
          switch (t) {
            case "animation":
            case "animationName":
              if (typeof r == "string")
                return r.replace(nL, function (i, s, n) {
                  return (ke = { name: s, styles: n, next: ke }), s;
                });
          }
          return w0[t] !== 1 && !E0(t) && typeof r == "number" && r !== 0 ? r + "px" : r;
        });
      (b0 = /label:\s*([^\s;\n{]+)\s*(;|$)/g),
        (is = function (t, r, i) {
          if (t.length === 1 && typeof t[0] == "object" && t[0] !== null && t[0].styles !== void 0)
            return t[0];
          var s = !0,
            n = "";
          ke = void 0;
          var o = t[0];
          o == null || o.raw === void 0 ? ((s = !1), (n += Or(i, r, o))) : (n += o[0]);
          for (var a = 1; a < t.length; a++) (n += Or(i, r, t[a])), s && (n += o[a]);
          var l;
          b0.lastIndex = 0;
          for (var c = "", u; (u = b0.exec(n)) !== null;) c += "-" + u[1];
          var p = v0(n) + c;
          return { name: p, styles: n, next: ke };
        });
    });
  function Xo(e, t, r) {
    var i = "";
    return (
      r.split(" ").forEach(function (s) {
        e[s] !== void 0 ? t.push(e[s] + ";") : (i += s + " ");
      }),
      i
    );
  }
  var aL,
    A0,
    Qo = D(() => {
      aL = !0;
      A0 = function (t, r, i) {
        var s = t.key + "-" + r.name;
        if (
          ((i === !1 || aL === !1) && t.registered[s] === void 0 && (t.registered[s] = r.styles),
            t.inserted[r.name] === void 0)
        ) {
          var n = r;
          do {
            var o = t.insert(r === n ? "." + s : "", n, t.sheet, !0);
            n = n.next;
          } while (n !== void 0);
        }
      };
    });
  function T0(e, t) {
    if (e.inserted[t.name] === void 0) return e.insert("", t, e.sheet, !0);
  }
  function P0(e, t, r) {
    var i = [],
      s = Xo(e, i, r);
    return i.length < 2 ? r : s + t(i);
  }
  var lL,
    cL,
    N0,
    k0 = D(() => {
      zo();
      Zo();
      Qo();
      (lL = function (t) {
        var r = R0(t);
        (r.sheet.speedy = function (a) {
          this.isSpeedy = a;
        }),
          (r.compat = !0);
        var i = function () {
          for (var l = arguments.length, c = new Array(l), u = 0; u < l; u++) c[u] = arguments[u];
          var p = is(c, r.registered, void 0);
          return A0(r, p, !1), r.key + "-" + p.name;
        },
          s = function () {
            for (var l = arguments.length, c = new Array(l), u = 0; u < l; u++) c[u] = arguments[u];
            var p = is(c, r.registered),
              m = "animation-" + p.name;
            return T0(r, { name: p.name, styles: "@keyframes " + m + "{" + p.styles + "}" }), m;
          },
          n = function () {
            for (var l = arguments.length, c = new Array(l), u = 0; u < l; u++) c[u] = arguments[u];
            var p = is(c, r.registered);
            T0(r, p);
          },
          o = function () {
            for (var l = arguments.length, c = new Array(l), u = 0; u < l; u++) c[u] = arguments[u];
            return P0(r.registered, i, cL(c));
          };
        return {
          css: i,
          cx: o,
          injectGlobal: n,
          keyframes: s,
          hydrate: function (l) {
            l.forEach(function (c) {
              r.inserted[c] = !0;
            });
          },
          flush: function () {
            (r.registered = {}), (r.inserted = {}), r.sheet.flush();
          },
          sheet: r.sheet,
          cache: r,
          getRegisteredStyles: Xo.bind(null, r.registered),
          merge: P0.bind(null, r.registered, i),
        };
      }),
        (cL = function e(t) {
          for (var r = "", i = 0; i < t.length; i++) {
            var s = t[i];
            if (s != null) {
              var n = void 0;
              switch (typeof s) {
                case "boolean":
                  break;
                case "object": {
                  if (Array.isArray(s)) n = e(s);
                  else {
                    n = "";
                    for (var o in s) s[o] && o && (n && (n += " "), (n += o));
                  }
                  break;
                }
                default:
                  n = s;
              }
              n && (r && (r += " "), (r += n));
            }
          }
          return r;
        }),
        (N0 = lL);
    });
  var Ie,
    v5,
    S5,
    _,
    w5,
    C5,
    _5,
    D5,
    I0,
    b5,
    E5,
    U = D(() => {
      zo();
      Zo();
      Qo();
      k0();
      (Ie = N0({ key: "css" })),
        (v5 = Ie.flush),
        (S5 = Ie.hydrate),
        (_ = Ie.cx),
        (w5 = Ie.merge),
        (C5 = Ie.getRegisteredStyles),
        (_5 = Ie.injectGlobal),
        (D5 = Ie.keyframes),
        (I0 = Ie.css),
        (b5 = Ie.sheet),
        (E5 = Ie.cache);
    });
  var O0 = f((L0) => {
    var { OnMounted: hL } = Nr(),
      { Static: uL } = ne(),
      { OnUnmounted: pL } = ae(),
      { cs: F0 } = S(),
      { fragments: fL } = P(),
      { UseState: mL } = A(),
      dL = ({ next: e }) =>
        F0(
          ["size", (t, r) => mL({ getInitValue: q0, next: r })],
          ({ size: t }, r) =>
            F0(
              ["listener", (i, s) => uL({ getInitValue: () => () => t.onChange(q0()), next: s })],
              ({ listener: i }) =>
                fL(
                  hL({ action: () => window.addEventListener("resize", i, !0) }),
                  pL({ action: () => window.removeEventListener("resize", i, !0) }),
                  r()
                )
            ),
          ({ size: t }) => e(t.value)
        );
    L0.ObserveWindowSize2 = dL;
    var q0 = () => ({ width: document.documentElement.clientWidth, height: document.documentElement.clientHeight });
  });
  var B0 = f((M0) => {
    var { cs: gL } = S(),
      { chain: xL } = V(),
      yL = ({ items: e, getGap: t, maxWidth: r, next: i }) =>
        gL(() => {
          let s = (a) =>
            a.reduce(
              (l, c, u) => {
                let p = u === 0 ? 0 : t(l.last, c);
                return { totalWidth: l.totalWidth + c.maxWidth, totalGap: l.totalGap + p, last: c };
              },
              { last: null, totalWidth: 0, totalGap: 0 }
            ),
            n = s(e),
            o =
              n.totalWidth + n.totalGap < r
                ? 1
                : xL(n.totalWidth + n.totalGap - r, (a) => 1 - a / n.totalWidth);
          return i({
            totalWidth: n.totalWidth + n.totalGap,
            getPsAt: (a) => ({
              pos: (() => {
                let { last: l, totalWidth: c, totalGap: u } = s(e.slice(0, a)),
                  p = a === 0 ? 0 : t(l, e[a]);
                return c + u + p;
              })(),
            }),
          });
        });
    M0.ZoomLine = yL;
  });
  var V0 = f((J0) => {
    var { cs: G0 } = S(),
      { UseState: RL } = A(),
      { Shadow: vL } = Q(),
      { easeInOutSine: SL } = nt(),
      { TransitionProgress: wL } = Ne(),
      CL = ({ next: e }) =>
        G0(
          ["state", (t, r) => RL({ next: r })],
          [
            "transitioning",
            ({ state: t }, r) =>
              vL({
                renderShadow: ({ acceptValue: i }) =>
                  G0(
                    ({ }, s) => (t.value ? s() : i()),
                    () =>
                      wL({
                        duration: t.value.duration ?? 300,
                        onDone: () => {
                          t.value.onDone(), t.onChange(null);
                        },
                        next: (s) => i({ progress: SL(s) }),
                      })
                  ),
                next: r,
              }),
          ],
          ({ state: t, transitioning: r }) =>
            e({ start: ({ onDone: i }) => t.onChange({ onDone: i }), active: r, progress: r?.progress })
        );
    J0.TransAni = CL;
  });
  var Ko = f((U0) => {
    var { equalDeep: _L } = j(),
      DL = (e, t) => t.windows?.find((r) => _L(e, r.key));
    U0.doesWindowBelong = DL;
  });
  var Mr = f((jo) => {
    var { doesWindowBelong: W0 } = Ko(),
      { equalDeep: bL } = j(),
      EL = (e) => {
        if (e.type === "fullScreen")
          return { windowsOverride: (t) => Yo(t, e), hideDock: !0, hideHeader: !0, hideBackground: !0 };
        if (e.type === "desktop") return { windowsOverride: (t) => Yo(t, e) };
        throw 23425565;
      };
    jo.DesktopDisplay = EL;
    var Yo = (e, t) => {
      if (t.type === "fullScreen")
        return bL(e.key, t.windowKey)
          ? { fullScreen: !0 }
          : W0(e.key, t)
            ? {}
            : { hidden: !0, ignoreUpdate: !0 };
      if (t.type === "desktop") return W0(e.key, t) ? {} : { hidden: !0, ignoreUpdate: !0 };
      throw 2345234634;
    };
    jo.DesktopWindowDisplay = Yo;
  });
  var ea = f((F5, AL) => {
    AL.exports = "/macos-demo/40-6NYMWZ35.jpg";
  });
  var j0 = {};
  Xe(j0, { Header: () => TL });
  var Ae,
    Gr,
    H0,
    z0,
    ra,
    $0,
    Z0,
    X0,
    Q0,
    K0,
    Y0,
    TL,
    PL,
    NL,
    kL,
    Br,
    ta,
    eg = D(() => {
      (Ae = h(E())), (Gr = h(S()));
      Wd();
      H0 = h(A());
      U();
      (z0 = h(O0())),
        (ra = h(Lo())),
        ($0 = h(To())),
        (Z0 = h(B())),
        (X0 = h(B0())),
        (Q0 = h(V0())),
        (K0 = h(j())),
        (Y0 = h(Mr())),
        (TL = ({ desktops: e, getAllWindows: t, active: r, onExpand: i, next: s }) =>
          (0, Gr.cs)(
            ({ }, n) => (r ? n() : s()),
            ["ws", (n, o) => (0, z0.ObserveWindowSize2)({ next: o })],
            ["expanded", (n, o) => (0, H0.UseState)({ next: o })],
            ["expandAni", (n, o) => (0, Q0.TransAni)({ next: o })],
            [
              "checkExpand",
              ({ expanded: n, expandAni: o }, a) =>
                a(
                  n.value
                    ? void 0
                    : () => {
                      i(),
                        o.start({
                          onDone: () => {
                            n.onChange(!0);
                          },
                        });
                    }
                ),
            ],
            [
              "height",
              ({ expandAni: n, expanded: o }, a) =>
                a(
                  n.active
                    ? 50 + (ra.expandedHeight - 50) * n.progress
                    : o.value
                      ? ra.expandedHeight
                      : 50
                ),
            ],
            ["top", ({ height: n }, o) => o((1 - r) * -n)],
            ["thumb", ({ expanded: n, expandAni: o, ws: a }, l) => l(NL({ ws: a }))],
            [
              "desktopsControl",
              ({ expanded: n, expandAni: o, ws: a, checkExpand: l, top: c, height: u, thumb: p }, m) =>
                PL({
                  getAllWindows: t,
                  desktops: e,
                  top: c,
                  thumb: p,
                  showThumb: n.value || o.active,
                  height: u,
                  ws: a,
                  next: m,
                }),
            ],
            ({ expanded: n, checkExpand: o, top: a, height: l, desktopsControl: c }) =>
              s({
                getMiniWindows: c.getMiniWindows,
                renderHeader: ({ onExitMissionControl: u }) =>
                  Ae.createElement(
                    "div",
                    {
                      className: _("header header-48v", { expanded: n.value, active: r === 1 }),
                      onMouseEnter: o,
                    },
                    Ae.createElement(
                      "div",
                      { className: "transitionable", style: { top: a, height: l } },
                      Ae.createElement(
                        "div",
                        {
                          className: "adding",
                          onClick: (p) => {
                            p.stopPropagation(), e.addDesktop();
                          },
                        },
                        Ae.createElement("div", { className: "plus" }, "+")
                      )
                    ),
                    c.render({ onExitMissionControl: u })
                  ),
              })
          )),
        (PL = ({ desktops: e, getAllWindows: t, top: r, showThumb: i, thumb: s, height: n, ws: o, next: a }) =>
          (0, Gr.cs)(
            [
              "zoomLine",
              ({ }, l) =>
                (0, X0.ZoomLine)({
                  items: e.state.value.desktops.map((c) => ({ key: c, maxWidth: Br })),
                  maxWidth: o.width,
                  getGap: () => (i ? 30 : -36),
                  next: l,
                }),
            ],
            ["leftStart", ({ zoomLine: l }, c) => c((o.width - l.totalWidth) / 2)],
            ["top", (l, c) => c(r + n - 120 + 8)],
            ({ zoomLine: l, leftStart: c, top: u }) =>
              a({
                getMiniWindows: ({ onExitMissionControl: p }) => {
                  let m = t();
                  return e.state.value.desktops
                    .map((d, g) =>
                      g === e.state.value.current
                        ? []
                        : (d.windows ?? []).map((y) => {
                          let x = l.getPsAt(g),
                            R = m.find((b) => (0, K0.equalDeep)(b.key, y.key)),
                            w = s.size.width / o.width;
                          return {
                            key: R.key,
                            boundaryScale: w,
                            boundaryPos: { x: c + x.pos + s.hPadding, y: u + s.vPadding },
                            boundaryTransitioning: ["left"],
                            boundaryBlocking: {
                              onClick: (b) => {
                                e.setCurrent(g), p();
                              },
                            },
                            ...(0, Y0.DesktopWindowDisplay)(R, d),
                            hidden: !i,
                          };
                        })
                    )
                    .flat();
                },
                render: ({ onExitMissionControl: p }) =>
                  (0, Gr.cs)(
                    ({ }, m) => Ae.createElement("div", { className: "desktops" }, m()),
                    [
                      "desktopH",
                      ({ }, m) =>
                        e.state.value.desktops.map((d, g) =>
                          m({ desktop: d, i: g, ps: l.getPsAt(g) })
                        ),
                    ],
                    ({ desktopH: m }, d) => (0, Z0.keyed1)({ key: m.i, next: d }),
                    ({ desktopH: m }) =>
                      Ae.createElement(
                        "div",
                        {
                          className: _("desktop", {
                            active: e.state.value.current === m.i,
                            thumb: i,
                          }),
                          style: { width: Br, top: u, left: c + m.ps.pos },
                          onClick: (d) => {
                            e.state.value.current !== m.i &&
                              (d.stopPropagation(), e.setCurrent(m.i), p());
                          },
                        },
                        kL({ thumb: s, hidden: !i }),
                        Ae.createElement(
                          "div",
                          { className: "line2" },
                          Ae.createElement(
                            "div",
                            { className: "label" },
                            "Desktop",
                            e.state.value.desktops.length === 1 ? "" : " " + (m.i + 1)
                          )
                        )
                      )
                  ),
              })
          )),
        (NL = ({ ws: e }) => {
          let t = (0, $0.minRatio)({ width: Br, height: ta }, e),
            r = { width: e.width * t, height: e.height * t };
          return {
            size: r,
            vPadding: r.height < ta ? (ta - r.height) / 2 : 0,
            hPadding: r.width < Br ? (Br - r.width) / 2 : 0,
          };
        }),
        (kL = ({ thumb: { size: e, vPadding: t }, hidden: r }) =>
          (0, Gr.cs)(({ }) =>
            Ae.createElement(
              "div",
              {
                className: "line1",
                style: {
                  ...(t && { paddingTop: t, paddingBottom: t }),
                  visibility: r ? "hidden" : "visible",
                },
              },
              Ae.createElement("div", {
                className: "thumbnail",
                style: { backgroundImage: `url("${ea()}")`, height: e.height, width: e.width },
              })
            )
          )),
        (Br = 130),
        (ta = 90);
    });
  var rg = f((tg) => {
    var { EnterManual: IL } = hd(),
      { MainDisplay: FL } = (qd(), Qe(Fd)),
      { ExitManual: qL } = Ud(),
      { Swamp: LL } = xo(),
      { Header: OL } = (eg(), Qe(j0)),
      ML = ({ desktops: e, getWindows: t, getAllWindows: r, onSelectWindow: i, next: s }) =>
        LL({ moduleList: BL({ desktops: e, getWindows: t, getAllWindows: r, onSelectWindow: i }), next: s });
    tg.Services = ML;
    var Jr = (e) => (t, r) => ({ ...t, [e]: t?.[e] || r?.[e] }),
      ia = (e, t) => ({
        ...e,
        display: (e?.display || t?.display) && {
          ...(e?.display || t?.display),
          windows: [...(e?.display?.windows ?? []), ...(t?.display?.windows ?? [])],
        },
      }),
      BL = ({ desktops: e, getWindows: t, getAllWindows: r, onSelectWindow: i }) => [
        {
          name: "enterManual",
          load: ({ mainDisplay: s }, n) => IL({ getWindows: t, onEntered: (o) => s.activate(o), next: n }),
          deps: ["mainDisplay"],
          expo: [ia, Jr("activate")],
        },
        {
          name: "mainDisplay",
          load: ({ }, s) => FL({ getWindows: t, onSelectWindow: i, next: s }),
          expo: [Jr("exitMissionControl")],
        },
        {
          load: ({ exitManual: s, mainDisplay: n }, o) => n.next({ exitManual: s, next: o }),
          deps: ["exitManual"],
          expo: [ia],
        },
        {
          name: "exitManual",
          load: ({ mainDisplay: s }, n) =>
            qL({ getWindows: t, main: s.main, onExited: () => s.deactivate(), next: n }),
          deps: ["mainDisplay"],
          expo: [ia, Jr("startExiting")],
        },
        {
          load: ({ exitManual: s, enterManual: n, mainDisplay: o }, a) =>
            OL({
              getAllWindows: r,
              desktops: e,
              active: s.active ? 1 - s.active : (n.active ?? (o.active && 1)),
              onExpand: o.onHeaderExpanded,
              next: a,
            }),
          deps: ["exitManual", "enterManual"],
          expo: [Jr("getMiniWindows"), Jr("renderHeader")],
        },
      ];
  });
  var ss = f((ig) => {
    var { cache0: GL } = wr(),
      JL = GL(() => localStorage.DEV_QUAN);
    ig.isDevQuan = JL;
  });
  var ng = f((sg) => {
    var { Component: VL } = W(),
      sa = class extends VL {
        constructor(t, r) {
          super(t, r), this.setupTimeout();
        }
        setupTimeout() {
          this.clear && this.clear();
          let t = this.props.delay || this.props.getRefreshTime() - Date.now(),
            r = setTimeout(() => {
              (this.clear = null), this.forceUpdate(), this.setupTimeout();
            }, t);
          this.clear = () => clearTimeout(r);
        }
        componentWillUnmount() {
          this.clear && this.clear();
        }
        componentDidUpdate(t) {
          ((this.props.getRefreshTime && t.getRefreshTime() !== this.props.getRefreshTime()) ||
            (this.props.delay && t.delay !== this.props.delay)) &&
            this.setupTimeout();
        }
        render() {
          let { render: t, next: r } = this.props;
          return r ? r() : t();
        }
      };
    sg.TimedRefresh = sa;
  });
  var oa = f((ag) => {
    var { TimedRefresh: UL } = ng(),
      { FComponent: WL } = Ji(),
      { cs: HL } = S(),
      { createElement: og } = W(),
      zL = ({ time: e, props: t, skippable: r, action: i }) =>
        HL(
          ({ }, s) => og(UL, { delay: 24 * 60 * 60 * 1e3, next: s }),
          ({ }) =>
            e - Date.now() < 24 * 60 * 60 * 1e3 && og(na, { time: e, props: t, skippable: r, action: i })
        );
    ag.TimedAction = zL;
    var na = class extends WL {
      constructor(t, r) {
        super(t, r),
          this.onMount(() => {
            this.setupTimeout(),
              this.onUnmount(() => {
                this.clear && this.clear();
              });
          });
      }
      setupTimeout() {
        this.clear && this.clear(), (this.clear = null);
        let t = this.props.time - Date.now();
        if ((t < 0 && (this.props.skippable || (t = 0)), t < 0)) return;
        let r = setTimeout(() => {
          (this.clear = null), this.props.action({ getLatestProps: () => this.props.props });
        }, t);
        this.clear = () => clearTimeout(r);
      }
      componentDidUpdate(t) {
        t.time !== this.props.time && this.setupTimeout();
      }
      render() {
        return null;
      }
    };
  });
  var aa = f((lg) => {
    var { TimedAction: $L } = oa(),
      { Static: ZL } = ne(),
      { cs: XL } = S(),
      { createElement: QL } = W(),
      KL = ({ delay: e = 500, action: t }) =>
        XL(["s", (r, i) => ZL({ getInitValue: () => Date.now(), next: i })], ({ s: r }) =>
          QL($L, { time: r + e, action: t })
        );
    lg.TimeoutAction = KL;
  });
  var vg = f((Rg) => {
    var { cs: gg } = S(),
      { Shadow: YL } = Q(),
      { UseState: jL } = A(),
      { TransitionProgress: eO } = Ne(),
      { easeInOutSine: tO } = nt(),
      { DesktopWindowDisplay: xg } = Mr(),
      { desktopGap: yg } = kr(),
      rO = ({ desktops: e, next: t }) =>
        gg(
          ["state", (r, i) => jL({ next: i })],
          [
            "transitioning",
            ({ state: r }, i) =>
              YL({
                renderShadow: ({ acceptValue: s }) =>
                  gg(
                    ({ }, n) => (r.value ? n() : s()),
                    [
                      "progress",
                      (n, o) =>
                        eO({
                          duration: 300,
                          onDone: () => {
                            r.value.onDone(), r.onChange(null);
                          },
                          next: (a) => s({ progress: tO(a) }),
                        }),
                    ]
                  ),
                next: i,
              }),
          ],
          ({ state: r, transitioning: i }) =>
            t({
              mode: i
                ? (() => {
                  let s = e.state.value.desktops[r.value.fromDesktopIndex],
                    n = e.state.value.desktops[r.value.desktopIndex];
                  return {
                    desktopTransition: { ...i, desktopIndex: r.value.desktopIndex },
                    active: i.progress,
                    windowsOrder: [
                      ...(e.state.value.desktops[r.value.desktopIndex].windows ?? []),
                      ...(e.state.value.desktops[e.state.value.current].windows ?? []),
                    ],
                    hideDock:
                      s.type === "fullScreen"
                        ? n.type === "fullScreen"
                          ? !0
                          : 1 - i.progress
                        : n.type === "fullScreen"
                          ? i.progress
                          : !1,
                    windowsOverride: (() => {
                      let o = { width: window.innerWidth, height: window.innerHeight },
                        a = r.value.desktopIndex > r.value.fromDesktopIndex;
                      return (l) =>
                        e.doesWindowBelong(l.key, r.value.fromDesktopIndex)
                          ? {
                            ...xg(l, s),
                            boundaryPos: {
                              x: i.progress * (o.width + yg) * (a ? -1 : 1),
                              y: 0,
                            },
                            ignoreUpdate: !0,
                          }
                          : e.doesWindowBelong(l.key, r.value.desktopIndex)
                            ? {
                              ...xg(l, n),
                              boundaryPos: {
                                x: (i.progress - 1) * (o.width + yg) * (a ? -1 : 1),
                                y: 0,
                              },
                              ignoreUpdate: !0,
                            }
                            : { hidden: !0, ignoreUpdate: !0 };
                    })(),
                  };
                })()
                : null,
              start: ({ desktopIndex: s, fromDesktopIndex: n, onDone: o }) =>
                r.onChange({ desktopIndex: s, fromDesktopIndex: n, onDone: o }),
            })
        );
    Rg.SwitchAnimation = rO;
  });
  var Cg = f((wg) => {
    var { cs: Sg } = S(),
      { Shadow: iO } = Q(),
      { UseState: sO } = A(),
      { TransitionProgress: nO } = Ne(),
      { easeInOutSine: oO } = nt(),
      { equalDeep: aO } = Se(),
      { desktopGap: lO } = kr(),
      cO = ({ doesWindowBelong: e, next: t }) =>
        Sg(
          ["state", (r, i) => sO({ next: i })],
          [
            "transitioning",
            ({ state: r }, i) =>
              iO({
                renderShadow: ({ acceptValue: s }) =>
                  Sg(
                    ({ }, n) => (r.value ? n() : s()),
                    [
                      "progress",
                      (n, o) =>
                        nO({
                          duration: 300,
                          onDone: () => {
                            r.value.onDone(), r.onChange(null);
                          },
                          next: (a) => s({ progress: oO(a) }),
                        }),
                    ]
                  ),
                next: i,
              }),
          ],
          ({ state: r, transitioning: i }) =>
            t({
              mode: i
                ? {
                  desktopTransition: { ...i, desktopIndex: r.value.desktopIndex },
                  hideDock: 1 - i.progress,
                  windowsOverride: (() => {
                    let s = { width: window.innerWidth, height: window.innerHeight };
                    return (n, o) =>
                      aO(r.value.windowKey, n.key)
                        ? {
                          ps: o && {
                            pos: { x: i.progress * o.pos.x, y: i.progress * o.pos.y },
                            size: {
                              width:
                                o.size.width +
                                (s.width - o.size.width) * (1 - i.progress),
                              height:
                                o.size.height +
                                (s.height - o.size.height) * (1 - i.progress),
                            },
                          },
                          fullScreen: !0,
                          ignoreUpdate: !0,
                        }
                        : e(n.key, r.value.desktopIndex)
                          ? {
                            ps: o && {
                              pos: {
                                x: o.pos.x - (1 - i.progress) * (s.width + lO),
                                y: o.pos.y,
                              },
                              size: o.size,
                            },
                            ignoreUpdate: !0,
                          }
                          : { hidden: !0, ignoreUpdate: !0 };
                  })(),
                }
                : null,
              start: ({ window: s, desktopIndex: n, onDone: o }) =>
                r.onChange({ windowKey: s.key, desktopIndex: n, onDone: o }),
            })
        );
    wg.UnmaximizeAnimation = cO;
  });
  var ns = f((Pg) => {
    Pg.headerHeight = 29;
  });
  var Vt = f((ca) => {
    var Ng = (e) => {
      let t = e.clientX,
        r = e.clientY;
      return { x: t, y: r };
    };
    ca.getELoc = Ng;
    ca.getEPos = Ng;
  });
  var Ut = f((kg) => {
    var { cs: hO } = S(),
      { OnUnmounted: uO } = ae(),
      { Static2: pO } = de(),
      { fragments: fO } = P(),
      { Invoke: mO } = X(),
      dO = typeof window > "u" ? null : window,
      gO = ({
        eventName: e,
        fn: t,
        action: r,
        useCapture: i = !1,
        passive: s = !1,
        target: n = dO,
        next: o = void 0,
      }) =>
        hO(["listener", (a, l) => pO({ next: l })], ({ listener: a }) =>
          fO(
            n &&
            mO({
              props: { action: r ?? t },
              action: ({ getLatestProps: l }) => {
                let c = (u) => {
                  let { action: p } = l();
                  p(u);
                };
                n.addEventListener(e, c, { capture: i, passive: s }), a.set(c);
              },
            }),
            uO({
              action: () => {
                let l = a.get();
                l && n.removeEventListener(e, l, { capture: i, passive: s });
              },
            }),
            o?.()
          )
        );
    kg.GlobalEvent = gO;
  });
  var Ve = f((Ig) => {
    var { GlobalEvent: xO } = Ut(),
      yO = ({ action: e, check: t, useCapture: r }) =>
        xO({ eventName: "keydown", useCapture: r, action: (i) => t(i) && e(i) });
    Ig.GlobalKeyDown2 = yO;
  });
  var ct = f((Fg) => {
    var { GlobalEvent: RO } = Ut(),
      vO = ({ action: e }) => RO({ eventName: "mousemove", fn: e });
    Fg.GlobalMouseMove = vO;
  });
  var Ue = f((qg) => {
    var { GlobalEvent: SO } = Ut(),
      wO = ({ action: e }) => SO({ eventName: "mouseup", fn: e });
    qg.GlobalMouseUp = wO;
  });
  var Mg = f((Og) => {
    var { fragments: CO } = P(),
      { keyed: _O } = B(),
      { scope: DO } = At(),
      { cs: Lg } = S(),
      { UseState: bO } = A(),
      { Invoke: EO } = X(),
      AO = ({ fetch: e, next: t, keepOutdatedValue: r, disabled: i, props: s, _key: n }) =>
        Lg(["loaded", (o, a) => bO({ next: a })], ({ loaded: o }) => {
          let a = o.value == null || o.value.key !== n;
          return CO(
            a &&
            !i &&
            Lg(_O(n), () =>
              EO({
                props: s,
                fn: async ({ isMounted: l, getLatestProps: c }) => {
                  let u = await e({ getLatestProps: c });
                  (!l() && o.value) || o.onChange({ value: u, key: n });
                },
              })
            ),
            t &&
            t({
              loading: a,
              ...DO(o, ["value"]),
              value: !o.value || (n !== o.value.key && !r) ? void 0 : o.value.value,
              reload: async () => {
                let l = await e();
                o.onChange({ value: l, key: n });
              },
            })
          );
        });
    Og.Load2 = AO;
  });
  var Wt = f((ha) => {
    var { Load2: TO } = Mg(),
      { cs: PO } = S(),
      Bg = ({ fetch: e, keepOutdatedValue: t = !1, disabled: r, next: i, props: s, _key: n }) =>
        PO(
          [
            "load2",
            ({ }, o) => TO({ keepOutdatedValue: t, disabled: r, fetch: e, next: o, _key: n, props: s }),
          ],
          ({ load2: o }) => i && i(o.value)
        );
    ha.Load = Bg;
    ha.Load1 = Bg;
  });
  var ht = f((ua) => {
    var NO = (e, t) => ({ x: e.x - t.x, y: e.y - t.y });
    ua.subtractVector = NO;
    var kO = (e, t) => ({ x: e.x - t.x, y: e.y - t.y, z: e.z - t.z });
    ua.subtractVector3 = kO;
  });
  var We,
    os = D(() => {
      We = (e) => ({ top: e.y, left: e.x });
    });
  var as = f((d7, IO) => {
    IO.exports = "/macos-demo/folder-icon-1-P3AYSFP5.webp";
  });
  var ls = f((ga) => {
    var FO = (e) => e[Math.floor(Math.random() * e.length)];
    ga.selectRandom = FO;
    function qO(e = 10) {
      let t = "",
        r = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      for (let i = 0; i < e; i++) t += r.charAt(Math.floor(Math.random() * r.length));
      return t;
    }
    ga.randomId = qO;
  });
  var tx = f((ex) => {
    var LO = (e) => {
      let t = {};
      return (r) => (t.hasOwnProperty(r) || (t[r] = e(r)), t[r]);
    };
    ex.cache1 = LO;
  });
  var Vr = f((zt) => {
    var { cache1: OO } = tx(),
      { cs: rx } = S(),
      { createContext: MO, createElement: Ra } = W(),
      va = OO(() => MO(null)),
      ix = (e, t, r) => Ra(va(e).Provider, { value: t }, r(t));
    zt.provideContext = ix;
    var BO = (e, t) => rx(...Object.keys(e).map((r) => (i, s) => Ra(va(r).Provider, { value: e[r] }, s())), t);
    zt.provideContextM = BO;
    var Sa = (e, t) => [t || e, (r, i) => Ra(va(e).Consumer, {}, i)];
    zt.consumeContext = Sa;
    zt.consumeContext1 = Sa;
    var GO = (e, t, r) => rx(Sa(e), (i) => ix(e, t(i[e]), r));
    zt.changeContext = GO;
  });
  var sx = D(() => { });
  var nx = D(() => { });
  var De,
    ox,
    ax,
    lx,
    xe,
    pt = D(() => {
      (De = h(E())), (ox = h(S()));
      nx();
      U();
      (ax = h(A())),
        (lx = h(Ue())),
        (xe = ({ windowControl: e, onClose: t, disableMinimize: r = !1, disableMaximize: i = !1 }) =>
          (0, ox.cs)(["almost", (s, n) => (0, ax.UseState)({ next: n })], ({ almost: s }) =>
            De.createElement(
              "div",
              {
                className: _("window-controls window-controls-3i0", {
                  focused: e.focused,
                  almost: s.value,
                }),
                onMouseDown: (n) => n.stopPropagation(),
              },
              s.value && (0, lx.GlobalMouseUp)({ action: () => s.onChange(null) }),
              De.createElement(
                "button",
                {
                  className: _("close", { almost: s.value === "close" }),
                  onClick: t,
                  onMouseDown: () => s.onChange("close"),
                },
                De.createElement(
                  "svg",
                  { width: "7", height: "7", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
                  De.createElement("path", {
                    strokeWidth: "1.2",
                    strokeLinecap: "round",
                    d: "M1.182 5.99L5.99 1.182m0 4.95L1.182 1.323",
                  })
                )
              ),
              De.createElement(
                "button",
                {
                  className: _("minimize", { almost: s.value === "minimize", disabled: r }),
                  onMouseDown: () => s.onChange("minimize"),
                  onClick: () => e.onMinimize(),
                },
                De.createElement(
                  "svg",
                  { width: "6", height: "1", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
                  De.createElement("path", {
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    d: "M.61.703h5.8",
                  })
                )
              ),
              De.createElement(
                "button",
                {
                  className: _("stretch", { almost: s.value === "stretch", disabled: i }),
                  onMouseDown: () => s.onChange("stretch"),
                  onClick: () => (e.fullScreen ? e.onUnmaximize() : e.onMaximize()),
                },
                De.createElement(
                  "svg",
                  {
                    viewBox: "0 0 13 13",
                    xmlns: "http://www.w3.org/2000/svg",
                    fillRule: "evenodd",
                    clipRule: "evenodd",
                    strokeLinejoin: "round",
                    strokeMiterlimit: "2",
                  },
                  De.createElement("path", {
                    d: "M4.871 3.553L9.37 8.098V3.553H4.871zm3.134 5.769L3.506 4.777v4.545h4.499z",
                  }),
                  De.createElement("circle", { cx: "6.438", cy: "6.438", r: "6.438", fill: "none" })
                )
              )
            )
          ));
    });
  var $t,
    cx,
    hx,
    ux = D(() => {
      ($t = h(E())), (cx = h(S()));
      sx();
      pt();
      hx = ({ onClose: e }) =>
        (0, cx.cs)(() => ({
          id: "about",
          renderWindowLogic: ({ next: t }) =>
            t({
              initSize: { width: 285, height: 486 },
              initPos: { x: 100, y: 100 },
              render: ({ size: r, control: i }) =>
                $t.createElement(
                  "div",
                  { className: "about-modal-27s", ...i.dragging },
                  xe({ windowControl: i, disableMinimize: !0, disableMaximize: !0, onClose: e }),
                  $t.createElement(
                    "div",
                    { className: "info", onMouseDown: (s) => s.stopPropagation() },
                    $t.createElement(
                      "div",
                      { className: "line" },
                      $t.createElement("div", { className: "label" }, "Author"),
                      $t.createElement("div", { className: "value" }, "quanla2003@gmail.com")
                    )
                  )
                ),
            }),
        }));
    });
  var px = D(() => { });
  var fx = D(() => { });
  var mx,
    wa,
    dx,
    gx,
    xx,
    hs,
    yx,
    Zt,
    JO,
    VO,
    UO,
    us = D(() => {
      (mx = h(S())),
        (wa = h(A())),
        (dx = h(de())),
        (gx = h(P())),
        (xx = h(ae())),
        (hs = h(j())),
        (yx = h(X())),
        (Zt = ({
          translate: e = (n) => n,
          getDefaultValue: t = null,
          defaultValue: r = { width: 1024, height: 768 },
          compare: i = hs.equalDeep,
          next: s,
        }) =>
          (0, mx.cs)(
            ["size", (n, o) => (0, wa.UseState)({ next: o })],
            ["dom", (n, o) => (0, wa.UseState)({ next: o })],
            ["nativeObserver", (n, o) => (0, dx.Static2)({ next: o })],
            ({ size: n, nativeObserver: o, dom: a }) => {
              let l = n.value ? n.value.translated : t ? t() : r;
              return (0, gx.fragments)(
                a.value &&
                (0, yx.Invoke)({
                  props: { size: n, value: l },
                  action: ({ getLatestProps: c }) => {
                    o.set(
                      UO({
                        dom: a.value,
                        onResize: (u) => {
                          let { size: p, value: m } = c(),
                            d = e(u);
                          (!p.value || !i(d, m)) && p.onChange({ translated: d });
                        },
                      })
                    );
                  },
                }),
                s({
                  ref: (c) => {
                    !c || a.value || a.onChange(c);
                  },
                  value: l,
                }),
                (0, xx.OnUnmounted)({ action: () => o.get()?.destroy() })
              );
            }
          )),
        (JO = ({ dom: e, onResize: t }) => {
          let r = null,
            i = (n) => ({ width: n.width, height: n.height }),
            s = setInterval(() => {
              let n = e.getBoundingClientRect(),
                o = i(n);
              (r == null || !(0, hs.equalDeep)(o, r)) && ((r = o), t(o));
            }, 1e3);
          return {
            destroy: () => {
              clearInterval(s);
            },
          };
        }),
        (VO = ({ dom: e, onResize: t }) => {
          let r = null,
            i = (n) => ({ width: n.width, height: n.height }),
            s = window.ResizeObserver
              ? new window.ResizeObserver(() => {
                let n = e.getBoundingClientRect(),
                  o = i(n);
                (r == null || !(0, hs.equalDeep)(o, r)) && ((r = o), t(o));
              })
              : null;
          return (
            s?.observe(e),
            {
              destroy: () => {
                s?.unobserve(e);
              },
            }
          );
        }),
        (UO = (() => (typeof window.ResizeObserver < "u" ? VO : JO))());
    });
  var vx = f((Rx) => {
    var WO = (e, t = 18) =>
      !e || e.length <= t
        ? e
        : e.substring(0, Math.floor(t / 2)) + "..." + e.substring(e.length - Math.ceil(t / 2));
    Rx.ellipsisMiddle = WO;
  });
  var Sx,
    wx,
    Ca,
    Cx,
    _x,
    Dx,
    ps,
    _a = D(() => {
      (Sx = h(S())),
        (wx = h(A())),
        (Ca = h(Vt())),
        (Cx = h(P())),
        (_x = h(ct())),
        (Dx = h(ge())),
        (ps = ({ onClick: e, clickFirst: t, onDragStart: r, next: i }) =>
          (0, Sx.cs)(["state", (s, n) => (0, wx.UseState)({ next: n })], ({ state: s }) =>
            (0, Cx.fragments)(
              i({
                handle: {
                  onMouseDown: (n) => {
                    n.altKey || n.metaKey || n.ctrlKey || n.shiftKey
                      ? e(n)
                      : (t && e(n), s.onChange({ oriPos: (0, Ca.getELoc)(n) }));
                  },
                  ...(s.value && {
                    onMouseUp: (n) => {
                      t || e(n), s.onChange(null);
                    },
                  }),
                },
              }),
              s.value &&
              (0, _x.GlobalMouseMove)({
                action: (n) => {
                  (0, Dx.distance)((0, Ca.getELoc)(n), s.value.oriPos) > 5 &&
                    (r(n), s.onChange(null));
                },
              })
            )
          ));
    });
  var Da = f((Ex) => {
    var { cs: bx } = S(),
      { UseState: HO } = A(),
      { Load: zO } = Wt(),
      { fragments: $O } = P(),
      { keyed: ZO } = B(),
      { Static: XO } = ne(),
      { OnUnmounted: QO } = ae(),
      KO = ({ dir: e, fs: t, next: r }) =>
        bx(
          ["refreshed", (i, s) => HO({ initValue: 0, next: s })],
          [
            "files",
            ({ refreshed: i }, s) =>
              zO({ _key: JSON.stringify([i.value, e]), fetch: () => t.readdir(e), next: s }),
          ],
          ({ refreshed: i }, s) =>
            $O(
              s(),
              bx(
                ZO(JSON.stringify(e)),
                [
                  "watcher",
                  (n, o) =>
                    XO({
                      getInitValue: () =>
                        t.watch(e, {}, () => {
                          i.change((a) => a + 1);
                        }),
                      next: o,
                    }),
                ],
                ({ watcher: n }) => QO({ action: () => n.close() })
              )
            ),
          ({ files: i }) => r(i)
        );
    Ex.WatchFiles = KO;
  });
  var Ax = D(() => { });
  var Px = f((Tx) => {
    var YO = (...e) => {
      let t = Math.min(...e.map((i) => i.x)),
        r = Math.min(...e.map((i) => i.y));
      return {
        x: t,
        y: r,
        width: Math.max(...e.map((i) => i.x)) - t,
        height: Math.max(...e.map((i) => i.y)) - r,
      };
    };
    Tx.pointsToRect = YO;
  });
  var Nx,
    fs,
    ba = D(() => {
      Nx = h(j());
      os();
      fs = (e) => ({ ...We(e), ...(0, Nx.keepOnly)(e, ["width", "height"]) });
    });
  var kx,
    Ix,
    Ea,
    Fx,
    qx,
    Lx,
    Ox,
    Mx,
    Bx,
    Aa,
    Gx,
    Jx,
    Vx = D(() => {
      kx = h(E());
      Ax();
      (Ix = h(S())),
        (Ea = h(P())),
        (Fx = h(Vt())),
        (qx = h(ct())),
        (Lx = h(Ue())),
        (Ox = h(pe())),
        (Mx = h(de())),
        (Bx = h(A())),
        (Aa = h(Px())),
        (Gx = h(ht()));
      ba();
      Jx = ({ next: e }) =>
        (0, Ix.cs)(
          ["state", (t, r) => (0, Bx.UseState)({ next: r })],
          ["containerDomRef", (t, r) => (0, Mx.Static2)({ next: r })],
          ({ state: t, containerDomRef: r }) => {
            let i = () =>
              t.value
                .getFiles((0, Aa.pointsToRect)(t.value.startPos, t.value.pos))
                .concat(t.value.extraSelecteds);
            return (0, Ea.fragments)(
              e({
                active: !!t.value,
                getFiles: i,
                start: ({ startPos: s, extraSelecteds: n, getFiles: o, onDone: a }) => {
                  let l = r.get().getBoundingClientRect(),
                    c = (u) => (0, Gx.subtractVector)(u, l);
                  t.onChange({
                    startPos: c(s),
                    pos: c(s),
                    translatePos: c,
                    extraSelecteds: n,
                    getFiles: o,
                    onDone: a,
                  });
                },
                containerDomRef: r.set,
                render: () =>
                  t.value &&
                  kx.createElement("div", {
                    className: "drag-select-5sk",
                    style: { ...fs((0, Aa.pointsToRect)(t.value.startPos, t.value.pos)) },
                  }),
              }),
              t.value &&
              (0, Ea.fragments)(
                (0, Lx.GlobalMouseUp)({
                  action: () => {
                    t.value.onDone(i()), t.onChange(null);
                  },
                }),
                (0, qx.GlobalMouseMove)({
                  action: (s) =>
                    (0, Ox.spc)(t, ["pos"], () => t.value.translatePos((0, Fx.getELoc)(s))),
                })
              )
            );
          }
        );
    });
  var Ia = f((I) => {
    var { chain: ds } = V(),
      { findMinValue: jO, findMaxValue: e4 } = T(),
      Ta = T().sum,
      { sort: Ux } = T(),
      t4 = (e) => {
        if (e == null || e.length === 0) return null;
        let t = { from: e[0], to: e[0] };
        for (let r = 1; r < e.length; r++) {
          let i = e[r];
          i < t.from ? (t.from = i) : i > t.to && (t.to = i);
        }
        return t;
      };
    I.calculateRange = t4;
    var Wx = (e, t, { ge: r, lt: i } = gs) =>
      t == null ? !1 : (t.from == null || r(e, t.from)) && (t.to == null || i(e, t.to));
    I.inRange = Wx;
    var Hx = (e, t) => ({ from: Math.min(e, t), to: Math.max(e, t) + 1 });
    I.createRangeGross = Hx;
    var r4 = (e) => {
      e = e.slice(0);
      for (let t = 0; t < e.length; t++)
        for (let r = t + 1; r < e.length; r++) {
          let i = e[t],
            s = e[r];
          be(i, s) && (r--, (e[t] = Hx(i, s)), e.splice(r, 1));
        }
      return e;
    };
    I.orRanges = r4;
    var i4 = (e) => new Array(e.to - e.from).fill(0).map((t, r) => r + e.from);
    I.toArr = i4;
    var s4 = (e) => {
      let t = { from: 0, to: 0 };
      for (let r of e) (t.from += r.from), (t.to += r.to);
      return t;
    };
    I.sumRanges = s4;
    var n4 = (e) => ({ from: e, to: e + 1 });
    I.rangeSingle = n4;
    var o4 = (e) => ({ from: e, to: e });
    I.range0 = o4;
    var a4 = (e, t) => (t > 0 ? { from: e, to: e + t } : { from: e, to: e });
    I.toRange = a4;
    var l4 = (e) => (e == null ? 0 : e.to - e.from);
    I.rangeLength = l4;
    var c4 = (e, t) => t.find((r) => be(e, r));
    I.conflict12 = c4;
    var be = (e, t, { ge: r } = gs) => (
      e["r1 is null"],
      t["r2 is null"],
      !(
        (e.from != null && t.to != null && r(e.from, t.to)) ||
        (t.from != null && e.to != null && r(t.from, e.to))
      )
    );
    I.conflict = be;
    var h4 = (...e) => {
      let t = [];
      for (; (e = e.filter((i) => i != null && i.length > 0)), e.length !== 0;) {
        e = Ux(e, (i) => i[0].from);
        let r = e[0][0];
        e[0] = e[0].slice(1);
        for (let i = 1; i < e.length; i++) p4(e[i], r);
        t.push(r);
      }
      return t;
    };
    I.merge = h4;
    var u4 = (e) => ({ from: Math.min(...e.map((t) => t.from)), to: Math.max(...e.map((t) => t.to)) });
    I.rangesGross = u4;
    var p4 = (e, t) => {
      for (; e.length > 0;) {
        let r = e[0];
        if (r.from <= t.to) (t.to = Math.max(t.to, r.to)), e.splice(0, 1);
        else break;
      }
    },
      f4 = (e, t, r) => {
        if (e == null) return null;
        let i = [];
        for (let s of e) i = [...i, ...zx(s, t, r)];
        return i;
      };
    I.exclude = f4;
    var zx = (e, t, r) => {
      let i = [e];
      for (let s of t)
        for (let n = i.length - 1; n > -1; n--) {
          let o = i[n];
          i.splice(n, 1, ...ms(o, s, r));
        }
      return i;
    };
    I.exclude12 = zx;
    var gs = { le: (e, t) => e <= t, lt: (e, t) => e < t, ge: (e, t) => e >= t },
      ms = (e, t, r) => {
        if (!be(e, t, r)) return [e];
        let { le: i, ge: s, lt: n } = r || gs;
        return t.to == null || (e.to != null && i(e.to, t.to))
          ? t.from != null && (e.from == null || n(e.from, t.from))
            ? [{ ...e, from: e.from, to: t.from }]
            : []
          : t.from == null || (e.from != null && s(e.from, t.from))
            ? [{ ...e, from: t.to, to: e.to }]
            : [
              { ...e, from: e.from, to: t.from },
              { ...e, from: t.to, to: e.to },
            ];
      };
    I.exclude11 = ms;
    var $x = (e) => Ux(e, (t) => t.from);
    I.sortRanges = $x;
    var m4 = (e, t) => (e == null ? t == null : t == null ? !1 : e.from === t.from && e.to === t.to);
    I.equalRanges = m4;
    var d4 = (e, t, { le: r } = gs) => {
      if (t == null) return e;
      if (e == null) return [t];
      for (let i = 0; i < e.length; i++) {
        let s = e[i];
        if (t.from == null || (t.to != null && r(t.to, s.from))) return [...e.slice(0, i), t, ...e.slice(i)];
      }
      return [...e, t];
    };
    I.insertSorted = d4;
    var g4 = (e, t) => ({ from: e.from + t, to: e.to + t });
    I.rangeAdd = g4;
    var Pa = (e) => {
      if (e == null) return null;
      let t = [];
      for (let r of e) t = y4([r], t);
      return $x(t);
    };
    I.fragmentRanges = Pa;
    var x4 = (e, t) => {
      let r = [t];
      for (let i = r.length - 1; e.length && i > -1; i--) {
        let s = r[i],
          n = [];
        for (let o of e)
          be(s, o) ? (r.splice(i, 1, ...ms(s, o), Zx(s, o)), (n = [...n, ...ms(o, s)])) : n.push(o);
        e = n;
      }
      return { oris: r, remains: e };
    },
      y4 = (e, t) => {
        let r = t.slice(0);
        for (let i = r.length - 1; i > -1; i--) {
          let { oris: s, remains: n } = x4(e, r[i]);
          (e = n), r.splice(i, 1, ...s);
        }
        return (r = [...r, ...e]), r;
      },
      Zx = (e, t) => (be(e, t) ? { from: Math.max(e.from, t.from), to: Math.min(e.to, t.to) } : null);
    I.commonRange = Zx;
    var Na = (e) =>
      e &&
      ds(Pa(e.map((t) => t.range)), (t) =>
        t.map((r) => ({ range: r, weight: Ta(e.map((i) => (be(r, i.range) ? i.weight : 0))) }))
      );
    I.sumRangeWeights = Na;
    var R4 = (e, t, r) =>
      !e || !t
        ? null
        : ds(Pa([...e.map((i) => i.range), ...t.map((i) => i.range)]), (i) =>
          i.map((s) => ({
            range: s,
            weight: r(
              Ta(e.map((n) => (be(s, n.range) ? n.weight : 0))),
              Ta(t.map((n) => (be(s, n.range) ? n.weight : 0)))
            ),
          }))
        );
    I.combineRangeWeights = R4;
    var v4 = (e, t) => {
      let r = t.find((i) => Wx(e, i.range));
      return r && r.weight;
    };
    I.getWeight = v4;
    var S4 = (e, t) => ds(Na(t), (r) => jO(r.filter((i) => e == null || be(e, i.range)).map((i) => i.weight)) || 0);
    I.getMinRangeWeight = S4;
    var w4 = (e, t) => ds(Na(t), (r) => e4(r.filter((i) => e == null || be(e, i.range)).map((i) => i.weight)) || 0);
    I.getMaxRangeWeight = w4;
    var ka = (e, t) => ({ from: e.from - t, to: e.to + t });
    I.expandRange = ka;
    I.extendsRange = ka;
    I.shrinkRange = (e, t) => ka(e, -t);
    var C4 = (e, t) => ({ from: e.from != null ? e.from + t : null, to: e.to != null ? e.to + t : null });
    I.moveRange = C4;
    var _4 = (e, t) => (be(e, t) ? 0 : Math.min(Math.abs(e.from - t.to), Math.abs(t.from - e.to)));
    I.distanceRange = _4;
  });
  var Kx = f((Qx) => {
    var { conflict: Xx, toRange: xs } = Ia(),
      D4 = (e, t) => Xx(xs(e.x, e.width), xs(t.x, t.width)) && Xx(xs(e.y, e.height), xs(t.y, t.height));
    Qx.doesRectTouchRect = D4;
  });
  var jx = f((Yx) => {
    var b4 = (e, t) => ({ x: e.x - t.width / 2, y: e.y - t.height / 2, width: t.width, height: t.height });
    Yx.getRectFromCenter = b4;
  });
  var ty = f((ey) => {
    var { arrEquals: E4 } = T(),
      { doesRectTouchRect: A4 } = Kx(),
      { getRectFromCenter: T4 } = jx(),
      P4 = ({ size: e, files: t }) => {
        if (t == null) return null;
        let r = { width: 140, height: 140 },
          i = Math.floor(e.height / r.height),
          s = t?.map((n, o) => {
            let a = Math.floor(o / i),
              l = o % i;
            return { file: n, pos: { x: e.width - (a + 0.5) * r.width, y: (l + 0.5) * r.height } };
          });
        return {
          getFilePos: (n) => s.find((o) => E4(o.file, n)).pos,
          getFiles: (n) => s.filter(({ pos: o }) => A4(T4(o, r), n)).map(({ file: o }) => o),
          poses: s,
        };
      };
    ey.FilePoses = P4;
  });
  var ny = f((sy) => {
    var { subtractVector: ry } = ht(),
      { addVector: iy } = ge(),
      N4 = ({ files: e, getFilePos: t, mousePos: r }) => ({
        files: e.map((i) => {
          let s = t(i);
          return {
            file: i,
            thumbnail: (() => ({ centerPos: iy(ry(s, r), { x: 0, y: 0 }), width: 80, height: 80 }))(),
            name: (() => ({
              centerPos: iy(ry(s, r), { x: 0, y: 60 }),
              fontSize: 11,
              lineHeight: 19,
              fontWeight: "bold",
            }))(),
          };
        }),
      });
    sy.getDndArrangement = N4;
  });
  var ly = f((ay) => {
    var { fragments: k4 } = P(),
      { GlobalKeyDown2: I4 } = Ve(),
      { last: F4 } = T(),
      q4 = ({ selecteds: e, filePoses: t }) =>
        k4(
          ys({ key: "ArrowDown", d: L4, selecteds: e, filePoses: t }),
          ys({ key: "ArrowUp", d: B4, selecteds: e, filePoses: t }),
          ys({ key: "ArrowRight", d: O4, selecteds: e, filePoses: t }),
          ys({ key: "ArrowLeft", d: M4, selecteds: e, filePoses: t })
        );
    ay.KeyNav = q4;
    var L4 = { d1: "y", d2: "x", inc: !0 },
      O4 = { d1: "x", d2: "y", inc: !0 },
      M4 = { d1: "x", d2: "y", inc: !1 },
      B4 = { d1: "y", d2: "x", inc: !1 },
      ys = ({ key: e, d: t, selecteds: r, filePoses: i }) =>
        I4({
          check: (s) => s.key === e,
          action: () => {
            let s = (() => {
              if (r.value?.length) {
                let n = i.getFilePos(F4(r.value));
                return oy(
                  i.poses.filter(({ pos: o }) => (o[t.d1] - n[t.d1]) * (t.inc ? 1 : -1) > 0),
                  [
                    ({ pos: o }) => o[t.d1] * (t.inc ? 1 : -1),
                    ({ pos: o }) => Math.abs(o[t.d2] - n[t.d2]),
                  ]
                );
              } else
                return oy(i.poses, [
                  ({ pos: n }) => n[t.d1] * (t.inc ? 1 : -1),
                  ({ pos: n }) => n[t.d2] * (t.inc ? 1 : -1),
                ]);
            })()?.file;
            s && r.onChange([s]);
          },
        }),
      oy = (e, t) => {
        let r = null;
        for (let i of e)
          if (r == null) r = i;
          else
            for (let s of t) {
              let n = s(r);
              if (s(i) < n) {
                r = i;
                break;
              }
            }
        return r;
      };
  });
  var Xt,
    Rs,
    Qt,
    Fa,
    cy,
    qa,
    La,
    Oa,
    Ma,
    hy,
    je,
    uy,
    py,
    fy,
    my,
    dy,
    gy,
    xy,
    yy = D(() => {
      Xt = h(E());
      U();
      fx();
      us();
      (Rs = h(S())),
        (Qt = h(P())),
        (Fa = h(Vt())),
        (cy = h(X())),
        (qa = h(B())),
        (La = h(Ve())),
        (Oa = h(Ce())),
        (Ma = h(Wt())),
        (hy = h(de()));
      os();
      (je = h(T())), (uy = h(ge())), (py = h(vx()));
      _a();
      fy = h(Da());
      Vx();
      (my = h(ty())),
        (dy = h(ny())),
        (gy = h(ly())),
        (xy = ({
          dir: e,
          system: t,
          openFile: r,
          selecteds: i,
          openDir: s,
          focused: n,
          clipboard: o,
          resolveThumbnail: a,
          fileDnD: l,
        }) =>
          (0, Rs.cs)(
            ["size", (c, u) => Zt({ next: u })],
            ["files", ({ }, c) => (0, fy.WatchFiles)({ dir: e, fs: t.fs, next: c })],
            [
              "filePoses",
              ({ size: c, files: u }, p) =>
                p(
                  (0, my.FilePoses)({
                    size: { ...c.value, height: c.value.height - 73 - 10 },
                    files: u,
                  })
                ),
            ],
            ["dragSelect", (c, u) => Jx({ next: u })],
            ["containerDomRef", (c, u) => (0, hy.Static2)({ next: u })],
            ({ filePoses: c }, u) =>
              (0, Qt.fragments)(u(), n && (0, gy.KeyNav)({ selecteds: i, filePoses: c })),
            [
              "dropPoint",
              ({ }, c) =>
                l.renderDropPoint({
                  onDrop: (u) => {
                    for (let p of u) {
                      let m = [...e, (0, je.last)(p)];
                      (0, je.arrEquals)(m, p) || t.fs.rename(p, m);
                    }
                  },
                  next: c,
                }),
            ],
            ({ files: c }, u) =>
              (0, Qt.fragments)(
                u(),
                i.value?.map(
                  (p) =>
                    !c?.includes(p) &&
                    (0, Rs.cs)((0, qa.keyed)(p), () =>
                      (0, cy.Invoke)({ action: () => i.change((m) => m.filter((d) => d !== p)) })
                    )
                )
              ),
            ({ size: c, dragSelect: u, containerDomRef: p, filePoses: m, dropPoint: d }, g) =>
              Xt.createElement(
                "div",
                {
                  className: _("icon-view-5dm", { focused: n }),
                  ref: (y) => {
                    c.ref(y), p.set(y), u.containerDomRef(y);
                  },
                  onMouseDown: (y) => {
                    y.target.classList.contains("icon-view-5dm") &&
                      u.start({
                        startPos: (0, Fa.getELoc)(y),
                        extraSelecteds: y.metaKey || y.shiftKey || y.ctrlKey ? i.value : [],
                        getFiles: (x) => m.getFiles(x),
                        onDone: (x) => i.onChange(x),
                      });
                  },
                  ...d.handle,
                },
                g()
              ),
            ({ dragSelect: c }, u) => (0, Qt.fragments)(u(), c.render()),
            [
              "isSelected",
              ({ dragSelect: c }, u) =>
                u(
                  (() => {
                    if (c.active) {
                      let p = c.getFiles();
                      return (m) => p?.some((d) => d === m);
                    } else return (p) => i.value?.some((m) => m === p);
                  })()
                ),
            ],
            ({ }, c) =>
              (0, Qt.fragments)(
                c(),
                n &&
                (0, Qt.fragments)(
                  (0, La.GlobalKeyDown2)({
                    check: (0, Oa.keyCombo)("meta+c"),
                    action: (u) => {
                      u.preventDefault(), o.writeFiles(i.value?.map((p) => [...e, p]));
                    },
                  }),
                  (0, La.GlobalKeyDown2)({
                    check: (0, Oa.keyCombo)("meta+v"),
                    action: (u) => {
                      u.preventDefault();
                      let p = o.getFiles();
                      for (let m of p ?? []) {
                        let d = [...e, (0, je.last)(m)];
                        (0, je.arrEquals)(d, m) || t.fs.copyFile(m, d);
                      }
                    },
                  })
                )
              ),
            ({ files: c, filePoses: u, isSelected: p, containerDomRef: m }) =>
              c?.map((d) =>
                (0, Rs.cs)(
                  (0, qa.keyed)(d),
                  ["lstat", ({ }, g) => (0, Ma.Load)({ fetch: () => t.fs.lstat([...e, d]), next: g })],
                  [
                    "thumbnail",
                    ({ lstat: g }, y) =>
                      (0, Ma.Load)({
                        _key: g == null,
                        fetch: () =>
                          g == null
                            ? null
                            : g.isDirectory()
                              ? as()
                              : a([...e, d], { fs: t.fs }),
                        next: y,
                      }),
                  ],
                  [
                    "dragOrClick",
                    (g, y) =>
                      ps({
                        clickFirst: !0,
                        onClick: (x) => {
                          x.altKey || x.metaKey || x.ctrlKey
                            ? i.change((R) =>
                              R.find((w) => w === d)
                                ? R.filter((w) => w !== d)
                                : [...R, d]
                            )
                            : i.value?.includes(d) || i.onChange([d]);
                        },
                        onDragStart: (x) => {
                          let R = i.value?.includes(d) ? i.value : [d],
                            w = (0, Fa.getELoc)(x),
                            b = m.get().getBoundingClientRect();
                          l.startDragging({
                            pos: w,
                            files: R.map((k) => [...e, k]),
                            arrangement: {
                              type: "icon",
                              ...(0, dy.getDndArrangement)({
                                files: R,
                                getFilePos: (k) =>
                                  (0, uy.addVector)(u.getFilePos(k), b),
                                mousePos: w,
                              }),
                            },
                          });
                        },
                        next: y,
                      }),
                  ],
                  [
                    "dropPoint",
                    ({ }, g) =>
                      l.renderDropPoint({
                        onDrop: (y) => {
                          for (let x of y) {
                            let R = [...e, d, (0, je.last)(x)];
                            (0, je.arrEquals)(R, x) || t.fs.rename(x, R);
                          }
                        },
                        next: g,
                      }),
                  ],
                  ({ lstat: g, thumbnail: y, dragOrClick: x, dropPoint: R }) =>
                    Xt.createElement(
                      "div",
                      {
                        className: _("file", { selected: p(d) || R.active }),
                        onDoubleClick: () => {
                          g.isDirectory() ? s([...e, d]) : r([...e, d]);
                        },
                        ...x.handle,
                        ...(g?.isDirectory() && R.handle),
                        style: { ...We(u.getFilePos(d)) },
                      },
                      Xt.createElement("div", { className: "thumbnail-selected" }),
                      y && Xt.createElement("img", { src: y, draggable: !1 }),
                      Xt.createElement(
                        "div",
                        { className: "name" },
                        (0, py.ellipsisMiddle)(d, 20)
                      )
                    )
                )
              )
          ));
    });
  var pU,
    Ry,
    vy,
    Sy = D(() => {
      pU = h(E());
      px();
      Ry = h(S());
      yy();
      vy = ({
        system: e,
        openFile: t,
        selecteds: r,
        openDir: i,
        focused: s,
        fileDnD: n,
        clipboard: o,
        resolveThumbnail: a,
      }) =>
        (0, Ry.cs)(() =>
          xy({
            dir: ["User", "Desktop"],
            clipboard: o,
            system: e,
            openFile: t,
            openDir: i,
            selecteds: r,
            focused: s,
            fileDnD: n,
            resolveThumbnail: a,
          })
        );
    });
  var Cy = f((wy) => {
    var G4 = (e) => {
      let t = e.lastIndexOf(".");
      return t === -1 ? null : e.substring(t);
    };
    wy.extname = G4;
  });
  var Dy = f((_y) => {
    var { extname: J4 } = Cy(),
      V4 = (e, { oldNames: t }) => {
        if (!t.includes(e)) return e;
        let r = J4(e),
          i = r ? e.substring(0, e.length - r.length) : e;
        for (let s = 2; ; s++) {
          let n = i + " " + s + (r ?? "");
          if (!t.includes(n)) return n;
        }
      };
    _y.genName = V4;
  });
  var ft,
    by,
    Ey,
    Ba,
    Ay = D(() => {
      (ft = h(Ce())),
        (by = h(oe())),
        (Ey = h(Dy())),
        (Ba = ({ nav: e, path: t, onNewWindow: r, fs: i, selecteds: s, windowControl: n, sidebar: o }) => ({
          appLabel: "Finder",
          items: [
            {
              label: "File",
              getDropdown: () => ({
                itemGroups: [
                  [
                    {
                      text: "New Finder Window",
                      onClick: r,
                      shortcut: (0, ft.parsePattern)("alt+N"),
                    },
                    {
                      text: "New Folder",
                      onClick: async () =>
                        i.mkdir([
                          ...t,
                          (0, Ey.genName)("untitled folder", {
                            oldNames: await i.readdir(t),
                          }),
                        ]),
                      shortcut: (0, ft.parsePattern)("alt+shift+N"),
                    },
                  ],
                  [
                    {
                      text: "Delete",
                      onClick:
                        s.value?.length &&
                        (async () => {
                          for (let a of s.value) i.unlink([...t, a]);
                        }),
                      shortcut: (0, ft.parsePattern)("alt+backspace"),
                    },
                  ],
                ],
              }),
            },
            o && {
              label: "View",
              getDropdown: () => ({
                itemGroups: [
                  [
                    {
                      text: o?.value ? "Hide Sidebar" : "Show Sidebar",
                      onClick: () => o.change((a) => !a),
                      shortcut: (0, ft.parsePattern)("control+meta+S"),
                    },
                  ],
                ],
              }),
            },
            e && {
              label: "Go",
              getDropdown: () => ({
                itemGroups: [
                  [
                    {
                      text: "Enclosing Folder",
                      onClick: () =>
                        e.push(
                          (0, by.changePath)(e.value, ["path"], (a) =>
                            a.slice(0, a.length - 1)
                          )
                        ),
                      shortcut: (0, ft.parsePattern)("alt+ArrowUp"),
                    },
                  ],
                ],
              }),
            },
            {
              label: "Window",
              getDropdown: () => ({
                itemGroups: [
                  [
                    {
                      text: "Minimize",
                      shortcut: (0, ft.parsePattern)("alt+M"),
                      onClick: n && (() => n.onMinimize()),
                    },
                  ],
                ].filter((a) => a.length),
              }),
            },
          ].filter((a) => a),
        }));
    });
  var Ty = D(() => { });
  var Py = D(() => { });
  var Ny = {};
  Xe(Ny, { centerOfRect: () => U4 });
  var U4,
    ky = D(() => {
      U4 = ({ x: e, y: t, width: r, height: i }) => ({ x: e + r / 2, y: t + i / 2 });
    });
  var Ly = f((qy) => {
    var { centerOfRect: Iy } = (ky(), Qe(Ny)),
      { subtractVector: Fy } = ht(),
      W4 = ({ files: e, domRefs: t, mousePos: r }) => ({
        files: e.map((i) => {
          let s = t[i],
            n = s.childNodes[0].childNodes[0].childNodes[0],
            o = s.childNodes[0].childNodes[1];
          return {
            file: i,
            thumbnail: (() => {
              if (!n) return null;
              let a = n.getBoundingClientRect();
              return { centerPos: Fy(Iy(a), r), width: a.width, height: a.height };
            })(),
            name: (() => {
              let a = window.getComputedStyle(o),
                l = H4(o.getBoundingClientRect());
              return {
                startPos: Fy(Iy({ ...l, width: 0 }), r),
                fontSize: +a.getPropertyValue("font-size").replace("px", ""),
                lineHeight: +a.getPropertyValue("line-height").replace("px", ""),
              };
            })(),
          };
        }),
      });
    qy.getDndArrangement = W4;
    var H4 = ({ x: e, y: t, width: r, height: i }) => ({ x: e, y: t, width: r, height: i });
  });
  var By = f((My) => {
    var { fragments: z4 } = P(),
      { GlobalKeyDown2: $4 } = Ve(),
      { last: Ga, findMinE: Z4 } = T(),
      X4 = ({ selecteds: e, files: t }) =>
        z4(
          vs({ key: "ArrowUp", selecteds: e, getFile: () => Oy({ inc: !1, selecteds: e.value, files: t }) }),
          vs({
            key: "ArrowDown",
            selecteds: e,
            getFile: () => Oy({ inc: !0, selecteds: e.value, files: t }),
          }),
          vs({ key: "Home", selecteds: e, getFile: () => t?.[0] }),
          vs({ key: "End", selecteds: e, getFile: () => Ga(t) })
        );
    My.KeyNav = X4;
    var Oy = ({ inc: e, selecteds: t, files: r }) => {
      if (t?.length) {
        let i = r.indexOf(Ga(t));
        return Z4(r, (s, n) => ((n - i) * (e ? 1 : -1) < 1 ? null : n * (e ? 1 : -1)));
      } else return e ? r[0] : Ga(r);
    },
      vs = ({ key: e, selecteds: t, getFile: r }) =>
        $4({
          check: (i) => i.key === e,
          action: (i) => {
            i.stopPropagation(), i.preventDefault();
            let s = r();
            s && t.onChange([s]);
          },
        });
  });
  var Y,
    Wr,
    Jy,
    mt,
    Vy,
    Ja,
    ws,
    Va,
    Uy,
    Ua,
    Wa,
    Wy,
    Hy,
    zy,
    re,
    $y,
    Zy,
    Xy,
    Qy,
    Ur,
    Gy,
    Ss,
    Q4,
    Ky = D(() => {
      Y = h(E());
      U();
      Py();
      us();
      (Wr = h(S())),
        (Jy = h(Vr())),
        (mt = h(P())),
        (Vy = h(Vt())),
        (Ja = h(X())),
        (ws = h(B())),
        (Va = h(Ve())),
        (Uy = h(Ue())),
        (Ua = h(Ce())),
        (Wa = h(Wt())),
        (Wy = h(ne())),
        (Hy = h(de())),
        (zy = h(A())),
        (re = h(T())),
        ($y = h(V()));
      _a();
      (Zy = h(Ly())),
        (Xy = h(By())),
        (Qy = ({
          paddingTop: e,
          system: t,
          openFile: r,
          nav: i,
          files: s,
          resolveThumbnail: n,
          clipboard: o,
          selecteds: a,
        }) =>
          (0, Wr.cs)(
            ["parentDomRef", (l, c) => (0, Hy.Static2)({ next: c })],
            ["size", (l, c) => Zt({ next: c })],
            (0, Jy.consumeContext)("windowControl"),
            [
              "horScrollable",
              ({ size: l }, c) => c((0, re.sum)(Ss, (u) => u.defaultWidth) > l.value.width),
            ],
            [
              "placeholderLineCount",
              ({ size: l }, c) => c((l.value.height - (e + Ur + 1) - (s?.length ?? 0) * Gy) / Gy),
            ],
            ["verScrollable", ({ placeholderLineCount: l }, c) => c(l < 0)],
            ({ size: l, windowControl: c, verScrollable: u, parentDomRef: p }, m) =>
              Y.createElement(
                "div",
                {
                  className: _("list-view list-view-6nk", { focused: c.focused, verScrollable: u }),
                  style: { paddingTop: e + Ur + 1 },
                  ref: (d) => {
                    l.ref(d), p.set(d);
                  },
                },
                m()
              ),
            ["sorting", (l, c) => c({ isActive: (u) => u === 0 })],
            [
              "getColWidth",
              ({ horScrollable: l, size: c }, u) =>
                u((p, m) =>
                  !l && p.expandable
                    ? c.value.width - (0, re.sum)(Ss, (d, g) => (g !== m ? d.defaultWidth : 0))
                    : p.defaultWidth
                ),
            ],
            ({ }, l) =>
              (0, mt.fragments)(
                l(),
                a.value?.map(
                  (c) =>
                    !s?.includes(c) &&
                    (0, Wr.cs)((0, ws.keyed)(c), () =>
                      (0, Ja.Invoke)({ action: () => a.change((u) => u.filter((p) => p !== c)) })
                    )
                )
              ),
            ({ windowControl: l }, c) =>
              (0, mt.fragments)(c(), l.focused && (0, Xy.KeyNav)({ selecteds: a, files: s })),
            ({ sorting: l, horScrollable: c, size: u, getColWidth: p }, m) =>
              Y.createElement(
                Y.Fragment,
                null,
                m(),
                Y.createElement("div", { className: "blur" }),
                Y.createElement(
                  "div",
                  { className: "header", style: { top: e } },
                  Ss.map((d, g) =>
                    (0, Wr.cs)(
                      (0, ws.keyed)(g),
                      ["mouseDown", (y, x) => (0, zy.UseState)({ next: x })],
                      ({ mouseDown: y }, x) =>
                        (0, mt.fragments)(
                          y.value &&
                          (0, Uy.GlobalMouseUp)({ action: () => y.onChange(null) }),
                          x()
                        ),
                      ({ mouseDown: y }) =>
                        Y.createElement(
                          "div",
                          {
                            className: _("col", d.className, {
                              mouseDown: y.value,
                              focused: l.isActive(g),
                            }),
                            onMouseDown: () => y.onChange(!0),
                            style: { width: p(d, g) },
                          },
                          d.label
                        )
                    )
                  )
                )
              ),
            ["domRefs", (l, c) => (0, Wy.Static)({ getInitValue: () => ({}), next: c })],
            [
              "dropPoint",
              ({ windowControl: l }, c) =>
                l.fileDnD.renderDropPoint({
                  onDrop: (u) => {
                    for (let p of u) {
                      let m = [...i.value.path, (0, re.last)(p)];
                      (0, re.arrEquals)(m, p) || t.fs.rename(p, m);
                    }
                  },
                  next: c,
                }),
            ],
            ({ dropPoint: l }, c) =>
              (0, mt.fragments)(
                c(),
                l.active &&
                Y.createElement("div", {
                  className: "drop-point-active-indicator",
                  style: { top: e + Ur, height: `calc(100% - ${e + Ur + 2}px)` },
                })
              ),
            ({ windowControl: l }, c) =>
              (0, mt.fragments)(
                c(),
                l.focused &&
                (0, mt.fragments)(
                  (0, Va.GlobalKeyDown2)({
                    check: (0, Ua.keyCombo)("meta+c"),
                    action: (u) => {
                      u.preventDefault(),
                        o.writeFiles(a.value?.map((p) => [...i.value.path, p]));
                    },
                  }),
                  (0, Va.GlobalKeyDown2)({
                    check: (0, Ua.keyCombo)("meta+v"),
                    action: (u) => {
                      u.preventDefault();
                      let p = o.getFiles();
                      for (let m of p ?? []) {
                        let d = [...i.value.path, (0, re.last)(m)];
                        (0, re.arrEquals)(d, m) || t.fs.copyFile(m, d);
                      }
                    },
                  })
                )
              ),
            ({
              sorting: l,
              getColWidth: c,
              parentDomRef: u,
              horScrollable: p,
              placeholderLineCount: m,
              domRefs: d,
              windowControl: g,
              dropPoint: y,
            }) =>
              Y.createElement(
                "div",
                { className: _("files", { horScrollable: p }), ...y.handle },
                s?.map((x) =>
                  (0, Wr.cs)(
                    (0, ws.keyed)(x),
                    [
                      "lstat",
                      ({ }, R) =>
                        (0, Wa.Load)({
                          fetch: () => t.fs.lstat([...i.value.path, x]),
                          next: R,
                        }),
                    ],
                    [
                      "thumbnail",
                      ({ lstat: R }, w) =>
                        (0, Wa.Load)({
                          _key: R == null,
                          fetch: () =>
                            R == null
                              ? null
                              : R.isDirectory()
                                ? as()
                                : n([...i.value.path, x], { fs: t.fs }),
                          next: w,
                        }),
                    ],
                    ["selected", (R, w) => w(a.value?.includes(x))],
                    [
                      "dragOrClick",
                      ({ selected: R }, w) =>
                        ps({
                          onClick: (b) => {
                            if (b.altKey || b.metaKey || b.ctrlKey)
                              a.change((k) => (R ? k.filter((M) => M !== x) : [...k, x]));
                            else if (b.shiftKey) {
                              let k = (0, re.last)(a.value),
                                [M, F] = (0, $y.chain)(
                                  [k ? s.indexOf(k) : 0, s.indexOf(x)],
                                  re.sort
                                );
                              a.change((J) => {
                                let Pe = [];
                                for (let Me = M; Me < F + 1; Me++) {
                                  let cc = s[Me];
                                  J.includes(cc) || Pe.push(cc);
                                }
                                return [...J, ...Pe];
                              });
                            } else a.onChange([x]);
                          },
                          onDragStart: (b) => {
                            let k = R ? a.value : [x],
                              M = (0, Vy.getELoc)(b);
                            g.fileDnD.startDragging({
                              pos: M,
                              files: k.map((F) => [...i.value.path, F]),
                              arrangement: {
                                type: "list",
                                ...(0, Zy.getDndArrangement)({
                                  files: k,
                                  domRefs: d,
                                  mousePos: M,
                                }),
                              },
                            });
                          },
                          next: w,
                        }),
                    ],
                    [
                      "dropPoint",
                      ({ }, R) =>
                        g.fileDnD.renderDropPoint({
                          onDrop: (w) => {
                            for (let b of w) {
                              let k = [...i.value.path, x, (0, re.last)(b)];
                              (0, re.arrEquals)(k, b) || t.fs.rename(b, k);
                            }
                          },
                          next: R,
                        }),
                    ],
                    ({ lstat: R, thumbnail: w, dragOrClick: b, selected: k, dropPoint: M }) =>
                      Y.createElement(
                        "div",
                        {
                          className: _("file", { selected: k || M.active }),
                          onDoubleClick: () => {
                            R.isDirectory()
                              ? i.push({ ...i.value, path: [...i.value.path, x] })
                              : r([...i.value.path, x]);
                          },
                          ...b.handle,
                          ...(R?.isDirectory() && M.handle),
                          ref: (F) => (d[x] = F),
                        },
                        k &&
                        a.value.length === 1 &&
                        (0, Ja.Invoke)({
                          action: () => {
                            Q4(d[x], u.get(), { paddingTop: e + Ur + 1 });
                          },
                        }),
                        Y.createElement(
                          "div",
                          { className: _("col col1"), style: { width: c(Ss[0], 0) } },
                          Y.createElement(
                            "div",
                            { className: "thumbnail" },
                            w &&
                            Y.createElement("div", {
                              className: "img",
                              style: { backgroundImage: `url(${w})` },
                            })
                          ),
                          Y.createElement("div", { className: "name" }, x)
                        ),
                        Y.createElement("div", { className: "col" })
                      )
                  )
                ),
                m > 0
                  ? (0, re.createArray)(Math.ceil(m)).map((x) =>
                    Y.createElement("div", { className: "file empty", key: x })
                  )
                  : Y.createElement("div", { className: "file empty half" })
              )
          )),
        (Ur = 28),
        (Gy = 20),
        (Ss = [
          { label: "Name", className: "name", defaultWidth: 200, expandable: !0 },
          { label: "Date Modified", defaultWidth: 160 },
          { label: "Size", defaultWidth: 100 },
          { label: "Kind", defaultWidth: 100 },
        ]),
        (Q4 = (e, t, { paddingTop: r }) => {
          let i = e.getBoundingClientRect(),
            s = t.getBoundingClientRect();
          if (i.y + i.height > s.y + s.height) {
            let n = i.y + i.height - (s.y + s.height);
            t.scrollTop = t.scrollTop + n;
          } else if (i.y < s.y + r) {
            let n = i.y - (s.y + r);
            t.scrollTop = t.scrollTop + n;
          }
        });
    });
  var PU,
    Yy,
    jy,
    eR,
    tR = D(() => {
      (PU = h(E())), (Yy = h(S())), (jy = h(Da()));
      Ky();
      eR = ({ paddingTop: e, system: t, selecteds: r, openFile: i, clipboard: s, resolveThumbnail: n, nav: o }) =>
        (0, Yy.cs)(
          ["files", ({ }, a) => (0, jy.WatchFiles)({ dir: o.value.path, fs: t.fs, next: a })],
          ({ files: a }) =>
            Qy({
              paddingTop: e,
              system: t,
              nav: o,
              files: a,
              resolveThumbnail: n,
              selecteds: r,
              openFile: i,
              clipboard: s,
            })
        );
    });
  var rR = D(() => { });
  var iR = f((qU, K4) => {
    K4.exports = "/macos-demo/chevron-left-V36SDOWO.webp";
  });
  var sR = f((LU, Y4) => {
    Y4.exports = "/macos-demo/chevron-right-54HL462P.webp";
  });
  var Kt,
    oR,
    aR,
    lR,
    nR,
    cR = D(() => {
      (Kt = h(E())), (oR = h(S()));
      rR();
      (aR = h(T())),
        (lR = ({ nav: e }) =>
          (0, oR.cs)(() =>
            Kt.createElement(
              "div",
              { className: "header-controls header-controls-98c" },
              Kt.createElement(
                "div",
                { className: "nav", onMouseDown: (t) => t.stopPropagation() },
                nR({ src: iR(), disabled: !e.hasPrevHistory, onClick: e.goBack }),
                nR({ src: sR(), disabled: !e.hasNextHistory, onClick: e.goNext })
              ),
              Kt.createElement(
                "div",
                { className: "dir-name" },
                (0, aR.last)(e.value.path) ?? "Macintosh HD"
              )
            )
          )),
        (nR = ({ disabled: e, onClick: t, src: r }) =>
          Kt.createElement(
            "button",
            { disabled: e, onClick: t },
            Kt.createElement("img", { src: r, draggable: !1 })
          ));
    });
  var Cs = f((uR) => {
    var { cs: j4 } = S(),
      { UseState: eM } = A(),
      { fragments: tM } = P(),
      { GlobalMouseUp: rM } = Ue(),
      { GlobalMouseMove: iM } = ct(),
      { diffPoints: sM } = ge(),
      { spc: nM } = pe(),
      oM = ({ next: e }) =>
        j4(["state", (t, r) => eM({ next: r })], ({ state: t }) =>
          tM(
            e({
              active: !!t.value,
              delta: t.value?.delta,
              oriPos: t.value?.oriPos,
              handle: {
                onMouseDown: (r) => {
                  t.onChange({ oriPos: hR(r) }), r.preventDefault();
                },
              },
              renderOnDone: ({ action: r }) =>
                t.value &&
                rM({
                  action: () => {
                    t.value && (t.value.delta && r(), t.onChange(null));
                  },
                }),
            }),
            t.value &&
            iM({
              action: (r) => {
                let i = hR(r);
                nM(t, ["delta"], () => sM(i, t.value.oriPos));
              },
            })
          )
        );
    uR.Dragging = oM;
    var hR = (e) => ({ x: e.clientX, y: e.clientY });
  });
  var gR = f((dR) => {
    var { Dragging: aM } = Cs(),
      { cs: pR } = S(),
      { UseState: lM } = A(),
      { chain: Ha } = V(),
      { Shadow: cM } = Q(),
      { keyed: hM } = B(),
      { fragments: fR } = P(),
      { Invoke: mR } = X(),
      uM = ({ size: e, left: t, next: r }) =>
        pR(["leftDrag", ({ leftSize: i }, s) => aM({ next: s })], ({ leftDrag: i }) =>
          cM({
            renderShadow: ({ accept: s }) =>
              pR(
                hM(i.active),
                ({ }, n) =>
                  i.active
                    ? n()
                    : (() => {
                      if (!t.value.show) return s({});
                      let o = Ha(t.value.size, (l) => Math.min(e.width - 256, l)),
                        a = o >= 144;
                      return s({ hasLeftPanel: a, leftWidth: o, leftDragHandle: i.handle });
                    })(),
                ["show", (n, o) => lM({ initValue: !0, next: o })],
                ({ show: n }) => {
                  let o = Ha(t.value.size + (i.delta?.x ?? 0), (a) => Math.min(e.width - 256, a));
                  return fR(
                    Ha(
                      n.value
                        ? { show: !0, size: Math.max(144, o) }
                        : { show: !1, size: t.value.size },
                      (a) =>
                        fR(
                          s({ hasLeftPanel: a.show, leftWidth: a.size }),
                          i.renderOnDone({ action: () => t.onChange(a) })
                        )
                    ),
                    n.value && o < 70 && mR({ action: () => n.onChange(!1) }),
                    !n.value && o > 100 && mR({ action: () => n.onChange(!0) })
                  );
                }
              ),
            next: (s) => r(s[0]),
          })
        );
    dR.Layout = uM;
  });
  var xR = D(() => { });
  var yR = f((UU, pM) => {
    pM.exports = "/macos-demo/applications-GLOW2Z6D.webp";
  });
  var RR = f((WU, fM) => {
    fM.exports = "/macos-demo/desktop-SU2GX57W.webp";
  });
  var vR = f((HU, mM) => {
    mM.exports = "/macos-demo/documents-UFEVYE24.webp";
  });
  var SR = f((zU, dM) => {
    dM.exports = "/macos-demo/download-QGAOICMR.webp";
  });
  var et,
    za,
    wR,
    CR,
    _R,
    _s,
    DR,
    gM,
    bR = D(() => {
      et = h(E());
      U();
      xR();
      (za = h(S())),
        (wR = h(Vr())),
        (CR = h(Se())),
        (_R = h(B())),
        (_s = h(T())),
        (DR = ({ nav: e, system: t }) =>
          (0, za.cs)((0, wR.consumeContext)("windowControl"), ({ windowControl: r }) =>
            et.createElement(
              "div",
              { className: _("left-menu left-menu-1b4", { focused: r.focused }) },
              et.createElement(
                "div",
                { className: "section" },
                et.createElement("div", { className: "title" }, "Favorites"),
                et.createElement(
                  "div",
                  { className: "items" },
                  gM.map((i, s) =>
                    (0, za.cs)(
                      (0, _R.keyed)(s),
                      [
                        "dropPoint",
                        ({ }, n) =>
                          r.fileDnD.renderDropPoint({
                            onDrop: (o) => {
                              for (let a of o) {
                                let l = [...i.value.path, (0, _s.last)(a)];
                                (0, _s.arrEquals)(l, a) || t.fs.rename(a, l);
                              }
                            },
                            next: n,
                          }),
                      ],
                      ({ dropPoint: n }) =>
                        et.createElement(
                          "div",
                          {
                            className: _("item", {
                              active: (0, CR.equalDeep)(i.value, e.value),
                              selected: n.active,
                            }),
                            onClick: () => e.push(i.value),
                            ...n.handle,
                          },
                          et.createElement("img", { src: i.icon }),
                          et.createElement("div", { className: "label" }, i.label)
                        )
                    )
                  )
                )
              )
            )
          )),
        (gM = [
          { icon: yR(), label: "Applications", value: { type: "path", path: ["Applications"] } },
          { icon: RR(), label: "Desktop", value: { type: "path", path: ["User", "Desktop"] } },
          { icon: vR(), label: "Documents", value: { type: "path", path: ["User", "Documents"] } },
          { icon: SR(), label: "Downloads", value: { type: "path", path: ["User", "Downloads"] } },
        ]);
    });
  var Fe,
    ER,
    AR,
    TR,
    PR,
    NR,
    kR = D(() => {
      Fe = h(E());
      U();
      Ty();
      (ER = h(S())), (AR = h(Vr()));
      pt();
      tR();
      cR();
      TR = h(gR());
      bR();
      (PR = h(ae())),
        (NR = ({
          nav: e,
          onClose: t,
          size: r,
          left: i,
          clipboard: s,
          openFile: n,
          selecteds: o,
          resolveThumbnail: a,
          system: l,
        }) =>
          (0, ER.cs)(
            ["layout", (c, u) => (0, TR.Layout)({ size: r, left: i, next: u })],
            (0, AR.consumeContext)("windowControl"),
            ({ windowControl: c, layout: u }) =>
              Fe.createElement(
                "div",
                {
                  className: _("finder-window finder-window-7y0", {
                    focused: c.focused,
                    fullScreen: c.fullScreen,
                  }),
                },
                u.hasLeftPanel &&
                Fe.createElement(
                  "div",
                  { className: "left", style: { width: u.leftWidth } },
                  (0, PR.OnUnmounted)({ action: () => console.log(123123) }),
                  Fe.createElement(
                    "div",
                    { className: "header", ...c.dragging },
                    xe({ onClose: t, windowControl: c })
                  ),
                  Fe.createElement("div", { className: "body" }, DR({ nav: e, system: l }))
                ),
                Fe.createElement(
                  "div",
                  { className: _("right", { hasLeftPanel: u.hasLeftPanel }) },
                  Fe.createElement(
                    "div",
                    { className: "body" },
                    eR({
                      paddingTop: 52,
                      system: l,
                      nav: e,
                      clipboard: s,
                      resolveThumbnail: a,
                      openFile: n,
                      selecteds: o,
                    })
                  ),
                  Fe.createElement(
                    "div",
                    { className: "header", ...c.dragging },
                    !u.hasLeftPanel &&
                    Fe.createElement(
                      "div",
                      { className: "window-controls-wrapper" },
                      xe({ onClose: t, windowControl: c })
                    ),
                    lR({ nav: e })
                  )
                ),
                u.hasLeftPanel &&
                Fe.createElement("div", {
                  className: "resizer",
                  ...u.leftDragHandle,
                  style: { left: u.leftWidth - 3 },
                })
              )
          ));
    });
  var IR = f((iW, xM) => {
    xM.exports = "/macos-demo/256-WUFSNYQM.webp";
  });
  var BR = {};
  Xe(BR, { Finder: () => zr });
  var sW,
    Hr,
    FR,
    qR,
    LR,
    OR,
    dt,
    MR,
    Ds,
    zr,
    yM,
    $a = D(() => {
      (sW = h(E())),
        (Hr = h(S())),
        (FR = h(Vr())),
        (qR = h(B())),
        (LR = h(At())),
        (OR = h(pe())),
        (dt = h(A())),
        (MR = h(Q()));
      ux();
      Sy();
      Ay();
      kR();
      (Ds = 0),
        (zr = {
          key: "finder",
          icon: IR(),
          renderProcess: ({ system: e, clipboard: t, next: r }) =>
            (0, Hr.cs)(
              ["showAbout", (i, s) => (0, dt.UseState)({ next: s })],
              [
                "windows",
                (i, s) =>
                  (0, dt.UseState)({
                    getInitValue: () => [],
                    next: s,
                  }),
              ],
              ["desktopSelecteds", (i, s) => (0, dt.UseState)({ next: s })],
              ({ windows: i, showAbout: s, desktopSelecteds: n }) => {
                let o = (a) =>
                  i.change((l) => [
                    ...l,
                    {
                      id: Ds++,
                      initNav: { type: "path", path: a ?? ["User", "Desktop"] },
                      initPos: { x: 20 + 27 * Ds, y: 50 + 27 * Ds },
                    },
                  ]);
                return r({
                  launchNewWindow: o,
                  defaultAppMenu: Ba({
                    onNewWindow: o,
                    path: ["User", "Desktop"],
                    selecteds: n,
                    fs: e.fs,
                  }),
                  showAboutModal: () => s.onChange(!0),
                  renderDesktop: ({
                    fileDnD: a,
                    openFile: l,
                    focused: c,
                    clipboard: u,
                    resolveThumbnail: p,
                  }) =>
                    vy({
                      system: e,
                      focused: c,
                      selecteds: n,
                      openDir: o,
                      fileDnD: a,
                      openFile: l,
                      clipboard: u,
                      resolveThumbnail: p,
                    }),
                  modals: [s.value && hx({ onClose: () => s.onChange(null) })].filter((a) => a),
                  windows: i.value.map((a) => ({
                    id: a.id,
                    renderWindowLogic: ({ system: l, openFile: c, next: u }) =>
                      (0, Hr.cs)(
                        [
                          "left",
                          (p, m) =>
                            (0, dt.UseState)({
                              initValue: { size: 200, show: !0 },
                              next: m,
                            }),
                        ],
                        [
                          "state",
                          (p, m) =>
                            (0, dt.UseState)({
                              getInitValue: () => ({ nav: a.initNav }),
                              next: m,
                            }),
                        ],
                        ["nav", ({ state: p }, m) => m(yM(p))],
                        [
                          "selecteds",
                          ({ nav: p }, m) =>
                            (0, MR.Shadow)({
                              renderShadow: ({ acceptValue: d }) =>
                                (0, Hr.cs)(
                                  (0, qR.keyed)(JSON.stringify(p.value.path)),
                                  () => (0, dt.UseState)({ next: d })
                                ),
                              next: m,
                            }),
                        ],
                        ({ left: p, selecteds: m, nav: d }) => {
                          let g = () => i.change((y) => y.filter((x) => x !== a));
                          return u({
                            initSize: { width: 600, height: 300 },
                            initPos: a.initPos,
                            getAppMenu: ({ size: y, changeSize: x, windowControl: R }) =>
                              Ba({
                                nav: d,
                                path: d.value.path,
                                fs: l.fs,
                                selecteds: m,
                                onNewWindow: o,
                                windowControl: R,
                                sidebar:
                                  y.width >= 256 + 144
                                    ? (0, LR.scope)(p, ["show"])
                                    : {
                                      value: !1,
                                      change: () => {
                                        (0, OR.spc)(p, ["show"], () => !0),
                                          x((w) => ({
                                            ...w,
                                            width: w.width + p.value.size,
                                          }));
                                      },
                                    },
                              }),
                            resizing: { minSize: { width: 320, height: 250 } },
                            close: g,
                            render: ({ size: y, control: x, resolveThumbnail: R }) =>
                              (0, Hr.cs)(
                                ({ }, w) =>
                                  (0, FR.provideContext)("windowControl", x, w),
                                () =>
                                  NR({
                                    nav: d,
                                    size: y,
                                    left: p,
                                    onClose: g,
                                    resolveThumbnail: R,
                                    system: l,
                                    selecteds: m,
                                    clipboard: t,
                                    openFile: c,
                                  })
                              ),
                          });
                        }
                      ),
                  })),
                });
              }
            ),
        }),
        (yM = (e) => ({
          value: e.value.nav,
          push: (t) => e.change((r) => ({ prev: [r.nav, ...(r.prev ?? [])], nav: t, next: [] })),
          goBack: () =>
            e.change((t) => {
              let [r, ...i] = t.prev;
              return { prev: i, nav: r, next: [t.nav, ...(t.next ?? [])] };
            }),
          goNext: () =>
            e.change((t) => {
              let [r, ...i] = t.next;
              return { prev: [t.nav, ...(t.prev ?? [])], nav: r, next: i };
            }),
          hasPrevHistory: !!e.value.prev?.length,
          hasNextHistory: !!e.value.next?.length,
        }));
    });
  var Za = f((pW, VR) => {
    var qe = function () {
      this.state = new Array(8);
      for (var e = 0; e < this.state.length; e++) this.state[e] = 64;
    };
    qe.BUTTON_A = 0;
    qe.BUTTON_B = 1;
    qe.BUTTON_SELECT = 2;
    qe.BUTTON_START = 3;
    qe.BUTTON_UP = 4;
    qe.BUTTON_DOWN = 5;
    qe.BUTTON_LEFT = 6;
    qe.BUTTON_RIGHT = 7;
    qe.prototype = {
      buttonDown: function (e) {
        this.state[e] = 65;
      },
      buttonUp: function (e) {
        this.state[e] = 64;
      },
    };
    VR.exports = qe;
  });
  var Es = f((fW, UR) => {
    UR.exports = {
      copyArrayElements: function (e, t, r, i, s) {
        for (var n = 0; n < s; ++n) r[i + n] = e[t + n];
      },
      copyArray: function (e) {
        return e.slice(0);
      },
      fromJSON: function (e, t) {
        for (var r = 0; r < e.JSON_PROPERTIES.length; r++) e[e.JSON_PROPERTIES[r]] = t[e.JSON_PROPERTIES[r]];
      },
      toJSON: function (e) {
        for (var t = {}, r = 0; r < e.JSON_PROPERTIES.length; r++)
          t[e.JSON_PROPERTIES[r]] = e[e.JSON_PROPERTIES[r]];
        return t;
      },
    };
  });
  var ZR = f((mW, $R) => {
    var WR = Es(),
      HR = function (e) {
        (this.nes = e),
          (this.mem = null),
          (this.REG_ACC = null),
          (this.REG_X = null),
          (this.REG_Y = null),
          (this.REG_SP = null),
          (this.REG_PC = null),
          (this.REG_PC_NEW = null),
          (this.REG_STATUS = null),
          (this.F_CARRY = null),
          (this.F_DECIMAL = null),
          (this.F_INTERRUPT = null),
          (this.F_INTERRUPT_NEW = null),
          (this.F_OVERFLOW = null),
          (this.F_SIGN = null),
          (this.F_ZERO = null),
          (this.F_NOTUSED = null),
          (this.F_NOTUSED_NEW = null),
          (this.F_BRK = null),
          (this.F_BRK_NEW = null),
          (this.opdata = null),
          (this.cyclesToHalt = null),
          (this.crash = null),
          (this.irqRequested = null),
          (this.irqType = null),
          this.reset();
      };
    HR.prototype = {
      IRQ_NORMAL: 0,
      IRQ_NMI: 1,
      IRQ_RESET: 2,
      reset: function () {
        this.mem = new Array(65536);
        for (var e = 0; e < 8192; e++) this.mem[e] = 255;
        for (var t = 0; t < 4; t++) {
          var r = t * 2048;
          (this.mem[r + 8] = 247),
            (this.mem[r + 9] = 239),
            (this.mem[r + 10] = 223),
            (this.mem[r + 15] = 191);
        }
        for (var i = 8193; i < this.mem.length; i++) this.mem[i] = 0;
        (this.REG_ACC = 0),
          (this.REG_X = 0),
          (this.REG_Y = 0),
          (this.REG_SP = 511),
          (this.REG_PC = 32768 - 1),
          (this.REG_PC_NEW = 32768 - 1),
          (this.REG_STATUS = 40),
          this.setStatus(40),
          (this.F_CARRY = 0),
          (this.F_DECIMAL = 0),
          (this.F_INTERRUPT = 1),
          (this.F_INTERRUPT_NEW = 1),
          (this.F_OVERFLOW = 0),
          (this.F_SIGN = 0),
          (this.F_ZERO = 1),
          (this.F_NOTUSED = 1),
          (this.F_NOTUSED_NEW = 1),
          (this.F_BRK = 1),
          (this.F_BRK_NEW = 1),
          (this.opdata = new zR().opdata),
          (this.cyclesToHalt = 0),
          (this.crash = !1),
          (this.irqRequested = !1),
          (this.irqType = null);
      },
      emulate: function () {
        var e, t;
        if (this.irqRequested) {
          switch (
          ((e =
            this.F_CARRY |
            ((this.F_ZERO === 0 ? 1 : 0) << 1) |
            (this.F_INTERRUPT << 2) |
            (this.F_DECIMAL << 3) |
            (this.F_BRK << 4) |
            (this.F_NOTUSED << 5) |
            (this.F_OVERFLOW << 6) |
            (this.F_SIGN << 7)),
            (this.REG_PC_NEW = this.REG_PC),
            (this.F_INTERRUPT_NEW = this.F_INTERRUPT),
            this.irqType)
          ) {
            case 0: {
              if (this.F_INTERRUPT !== 0) break;
              this.doIrq(e);
              break;
            }
            case 1: {
              this.doNonMaskableInterrupt(e);
              break;
            }
            case 2: {
              this.doResetInterrupt();
              break;
            }
          }
          (this.REG_PC = this.REG_PC_NEW),
            (this.F_INTERRUPT = this.F_INTERRUPT_NEW),
            (this.F_BRK = this.F_BRK_NEW),
            (this.irqRequested = !1);
        }
        var r = this.opdata[this.nes.mmap.load(this.REG_PC + 1)],
          i = r >> 24,
          s = 0,
          n = (r >> 8) & 255,
          o = this.REG_PC;
        this.REG_PC += (r >> 16) & 255;
        var a = 0;
        switch (n) {
          case 0: {
            a = this.load(o + 2);
            break;
          }
          case 1: {
            (a = this.load(o + 2)), a < 128 ? (a += this.REG_PC) : (a += this.REG_PC - 256);
            break;
          }
          case 2:
            break;
          case 3: {
            a = this.load16bit(o + 2);
            break;
          }
          case 4: {
            a = this.REG_ACC;
            break;
          }
          case 5: {
            a = this.REG_PC;
            break;
          }
          case 6: {
            a = (this.load(o + 2) + this.REG_X) & 255;
            break;
          }
          case 7: {
            a = (this.load(o + 2) + this.REG_Y) & 255;
            break;
          }
          case 8: {
            (a = this.load16bit(o + 2)),
              (a & 65280) !== ((a + this.REG_X) & 65280) && (s = 1),
              (a += this.REG_X);
            break;
          }
          case 9: {
            (a = this.load16bit(o + 2)),
              (a & 65280) !== ((a + this.REG_Y) & 65280) && (s = 1),
              (a += this.REG_Y);
            break;
          }
          case 10: {
            (a = this.load(o + 2)),
              (a & 65280) !== ((a + this.REG_X) & 65280) && (s = 1),
              (a += this.REG_X),
              (a &= 255),
              (a = this.load16bit(a));
            break;
          }
          case 11: {
            (a = this.load16bit(this.load(o + 2))),
              (a & 65280) !== ((a + this.REG_Y) & 65280) && (s = 1),
              (a += this.REG_Y);
            break;
          }
          case 12: {
            (a = this.load16bit(o + 2)),
              a < 8191
                ? (a = this.mem[a] + (this.mem[(a & 65280) | (((a & 255) + 1) & 255)] << 8))
                : (a =
                  this.nes.mmap.load(a) +
                  (this.nes.mmap.load((a & 65280) | (((a & 255) + 1) & 255)) << 8));
            break;
          }
        }
        switch (((a &= 65535), r & 255)) {
          case 0: {
            (e = this.REG_ACC + this.load(a) + this.F_CARRY),
              !((this.REG_ACC ^ this.load(a)) & 128) && (this.REG_ACC ^ e) & 128
                ? (this.F_OVERFLOW = 1)
                : (this.F_OVERFLOW = 0),
              (this.F_CARRY = e > 255 ? 1 : 0),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e & 255),
              (this.REG_ACC = e & 255),
              (i += s);
            break;
          }
          case 1: {
            (this.REG_ACC = this.REG_ACC & this.load(a)),
              (this.F_SIGN = (this.REG_ACC >> 7) & 1),
              (this.F_ZERO = this.REG_ACC),
              n !== 11 && (i += s);
            break;
          }
          case 2: {
            n === 4
              ? ((this.F_CARRY = (this.REG_ACC >> 7) & 1),
                (this.REG_ACC = (this.REG_ACC << 1) & 255),
                (this.F_SIGN = (this.REG_ACC >> 7) & 1),
                (this.F_ZERO = this.REG_ACC))
              : ((e = this.load(a)),
                (this.F_CARRY = (e >> 7) & 1),
                (e = (e << 1) & 255),
                (this.F_SIGN = (e >> 7) & 1),
                (this.F_ZERO = e),
                this.write(a, e));
            break;
          }
          case 3: {
            this.F_CARRY === 0 && ((i += (o & 65280) !== (a & 65280) ? 2 : 1), (this.REG_PC = a));
            break;
          }
          case 4: {
            this.F_CARRY === 1 && ((i += (o & 65280) !== (a & 65280) ? 2 : 1), (this.REG_PC = a));
            break;
          }
          case 5: {
            this.F_ZERO === 0 && ((i += (o & 65280) !== (a & 65280) ? 2 : 1), (this.REG_PC = a));
            break;
          }
          case 6: {
            (e = this.load(a)),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_OVERFLOW = (e >> 6) & 1),
              (e &= this.REG_ACC),
              (this.F_ZERO = e);
            break;
          }
          case 7: {
            this.F_SIGN === 1 && (i++, (this.REG_PC = a));
            break;
          }
          case 8: {
            this.F_ZERO !== 0 && ((i += (o & 65280) !== (a & 65280) ? 2 : 1), (this.REG_PC = a));
            break;
          }
          case 9: {
            this.F_SIGN === 0 && ((i += (o & 65280) !== (a & 65280) ? 2 : 1), (this.REG_PC = a));
            break;
          }
          case 10: {
            (this.REG_PC += 2),
              this.push((this.REG_PC >> 8) & 255),
              this.push(this.REG_PC & 255),
              (this.F_BRK = 1),
              this.push(
                this.F_CARRY |
                ((this.F_ZERO === 0 ? 1 : 0) << 1) |
                (this.F_INTERRUPT << 2) |
                (this.F_DECIMAL << 3) |
                (this.F_BRK << 4) |
                (this.F_NOTUSED << 5) |
                (this.F_OVERFLOW << 6) |
                (this.F_SIGN << 7)
              ),
              (this.F_INTERRUPT = 1),
              (this.REG_PC = this.load16bit(65534)),
              this.REG_PC--;
            break;
          }
          case 11: {
            this.F_OVERFLOW === 0 && ((i += (o & 65280) !== (a & 65280) ? 2 : 1), (this.REG_PC = a));
            break;
          }
          case 12: {
            this.F_OVERFLOW === 1 && ((i += (o & 65280) !== (a & 65280) ? 2 : 1), (this.REG_PC = a));
            break;
          }
          case 13: {
            this.F_CARRY = 0;
            break;
          }
          case 14: {
            this.F_DECIMAL = 0;
            break;
          }
          case 15: {
            this.F_INTERRUPT = 0;
            break;
          }
          case 16: {
            this.F_OVERFLOW = 0;
            break;
          }
          case 17: {
            (e = this.REG_ACC - this.load(a)),
              (this.F_CARRY = e >= 0 ? 1 : 0),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e & 255),
              (i += s);
            break;
          }
          case 18: {
            (e = this.REG_X - this.load(a)),
              (this.F_CARRY = e >= 0 ? 1 : 0),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e & 255);
            break;
          }
          case 19: {
            (e = this.REG_Y - this.load(a)),
              (this.F_CARRY = e >= 0 ? 1 : 0),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e & 255);
            break;
          }
          case 20: {
            (e = (this.load(a) - 1) & 255),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e),
              this.write(a, e);
            break;
          }
          case 21: {
            (this.REG_X = (this.REG_X - 1) & 255),
              (this.F_SIGN = (this.REG_X >> 7) & 1),
              (this.F_ZERO = this.REG_X);
            break;
          }
          case 22: {
            (this.REG_Y = (this.REG_Y - 1) & 255),
              (this.F_SIGN = (this.REG_Y >> 7) & 1),
              (this.F_ZERO = this.REG_Y);
            break;
          }
          case 23: {
            (this.REG_ACC = (this.load(a) ^ this.REG_ACC) & 255),
              (this.F_SIGN = (this.REG_ACC >> 7) & 1),
              (this.F_ZERO = this.REG_ACC),
              (i += s);
            break;
          }
          case 24: {
            (e = (this.load(a) + 1) & 255),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e),
              this.write(a, e & 255);
            break;
          }
          case 25: {
            (this.REG_X = (this.REG_X + 1) & 255),
              (this.F_SIGN = (this.REG_X >> 7) & 1),
              (this.F_ZERO = this.REG_X);
            break;
          }
          case 26: {
            this.REG_Y++,
              (this.REG_Y &= 255),
              (this.F_SIGN = (this.REG_Y >> 7) & 1),
              (this.F_ZERO = this.REG_Y);
            break;
          }
          case 27: {
            this.REG_PC = a - 1;
            break;
          }
          case 28: {
            this.push((this.REG_PC >> 8) & 255), this.push(this.REG_PC & 255), (this.REG_PC = a - 1);
            break;
          }
          case 29: {
            (this.REG_ACC = this.load(a)),
              (this.F_SIGN = (this.REG_ACC >> 7) & 1),
              (this.F_ZERO = this.REG_ACC),
              (i += s);
            break;
          }
          case 30: {
            (this.REG_X = this.load(a)),
              (this.F_SIGN = (this.REG_X >> 7) & 1),
              (this.F_ZERO = this.REG_X),
              (i += s);
            break;
          }
          case 31: {
            (this.REG_Y = this.load(a)),
              (this.F_SIGN = (this.REG_Y >> 7) & 1),
              (this.F_ZERO = this.REG_Y),
              (i += s);
            break;
          }
          case 32: {
            n === 4
              ? ((e = this.REG_ACC & 255), (this.F_CARRY = e & 1), (e >>= 1), (this.REG_ACC = e))
              : ((e = this.load(a) & 255), (this.F_CARRY = e & 1), (e >>= 1), this.write(a, e)),
              (this.F_SIGN = 0),
              (this.F_ZERO = e);
            break;
          }
          case 33:
            break;
          case 34: {
            (e = (this.load(a) | this.REG_ACC) & 255),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e),
              (this.REG_ACC = e),
              n !== 11 && (i += s);
            break;
          }
          case 35: {
            this.push(this.REG_ACC);
            break;
          }
          case 36: {
            (this.F_BRK = 1),
              this.push(
                this.F_CARRY |
                ((this.F_ZERO === 0 ? 1 : 0) << 1) |
                (this.F_INTERRUPT << 2) |
                (this.F_DECIMAL << 3) |
                (this.F_BRK << 4) |
                (this.F_NOTUSED << 5) |
                (this.F_OVERFLOW << 6) |
                (this.F_SIGN << 7)
              );
            break;
          }
          case 37: {
            (this.REG_ACC = this.pull()),
              (this.F_SIGN = (this.REG_ACC >> 7) & 1),
              (this.F_ZERO = this.REG_ACC);
            break;
          }
          case 38: {
            (e = this.pull()),
              (this.F_CARRY = e & 1),
              (this.F_ZERO = ((e >> 1) & 1) === 1 ? 0 : 1),
              (this.F_INTERRUPT = (e >> 2) & 1),
              (this.F_DECIMAL = (e >> 3) & 1),
              (this.F_BRK = (e >> 4) & 1),
              (this.F_NOTUSED = (e >> 5) & 1),
              (this.F_OVERFLOW = (e >> 6) & 1),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_NOTUSED = 1);
            break;
          }
          case 39: {
            n === 4
              ? ((e = this.REG_ACC),
                (t = this.F_CARRY),
                (this.F_CARRY = (e >> 7) & 1),
                (e = ((e << 1) & 255) + t),
                (this.REG_ACC = e))
              : ((e = this.load(a)),
                (t = this.F_CARRY),
                (this.F_CARRY = (e >> 7) & 1),
                (e = ((e << 1) & 255) + t),
                this.write(a, e)),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e);
            break;
          }
          case 40: {
            n === 4
              ? ((t = this.F_CARRY << 7),
                (this.F_CARRY = this.REG_ACC & 1),
                (e = (this.REG_ACC >> 1) + t),
                (this.REG_ACC = e))
              : ((e = this.load(a)),
                (t = this.F_CARRY << 7),
                (this.F_CARRY = e & 1),
                (e = (e >> 1) + t),
                this.write(a, e)),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e);
            break;
          }
          case 41: {
            if (
              ((e = this.pull()),
                (this.F_CARRY = e & 1),
                (this.F_ZERO = (e >> 1) & 1 ? 0 : 1),
                (this.F_INTERRUPT = (e >> 2) & 1),
                (this.F_DECIMAL = (e >> 3) & 1),
                (this.F_BRK = (e >> 4) & 1),
                (this.F_NOTUSED = (e >> 5) & 1),
                (this.F_OVERFLOW = (e >> 6) & 1),
                (this.F_SIGN = (e >> 7) & 1),
                (this.REG_PC = this.pull()),
                (this.REG_PC += this.pull() << 8),
                this.REG_PC === 65535)
            )
              return;
            this.REG_PC--, (this.F_NOTUSED = 1);
            break;
          }
          case 42: {
            if (((this.REG_PC = this.pull()), (this.REG_PC += this.pull() << 8), this.REG_PC === 65535))
              return;
            break;
          }
          case 43: {
            (e = this.REG_ACC - this.load(a) - (1 - this.F_CARRY)),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e & 255),
              (this.REG_ACC ^ e) & 128 && (this.REG_ACC ^ this.load(a)) & 128
                ? (this.F_OVERFLOW = 1)
                : (this.F_OVERFLOW = 0),
              (this.F_CARRY = e < 0 ? 0 : 1),
              (this.REG_ACC = e & 255),
              n !== 11 && (i += s);
            break;
          }
          case 44: {
            this.F_CARRY = 1;
            break;
          }
          case 45: {
            this.F_DECIMAL = 1;
            break;
          }
          case 46: {
            this.F_INTERRUPT = 1;
            break;
          }
          case 47: {
            this.write(a, this.REG_ACC);
            break;
          }
          case 48: {
            this.write(a, this.REG_X);
            break;
          }
          case 49: {
            this.write(a, this.REG_Y);
            break;
          }
          case 50: {
            (this.REG_X = this.REG_ACC),
              (this.F_SIGN = (this.REG_ACC >> 7) & 1),
              (this.F_ZERO = this.REG_ACC);
            break;
          }
          case 51: {
            (this.REG_Y = this.REG_ACC),
              (this.F_SIGN = (this.REG_ACC >> 7) & 1),
              (this.F_ZERO = this.REG_ACC);
            break;
          }
          case 52: {
            (this.REG_X = this.REG_SP - 256),
              (this.F_SIGN = (this.REG_SP >> 7) & 1),
              (this.F_ZERO = this.REG_X);
            break;
          }
          case 53: {
            (this.REG_ACC = this.REG_X), (this.F_SIGN = (this.REG_X >> 7) & 1), (this.F_ZERO = this.REG_X);
            break;
          }
          case 54: {
            (this.REG_SP = this.REG_X + 256), this.stackWrap();
            break;
          }
          case 55: {
            (this.REG_ACC = this.REG_Y), (this.F_SIGN = (this.REG_Y >> 7) & 1), (this.F_ZERO = this.REG_Y);
            break;
          }
          case 56: {
            (e = this.REG_ACC & this.load(a)),
              (this.F_CARRY = e & 1),
              (this.REG_ACC = this.F_ZERO = e >> 1),
              (this.F_SIGN = 0);
            break;
          }
          case 57: {
            (this.REG_ACC = this.F_ZERO = this.REG_ACC & this.load(a)),
              (this.F_CARRY = this.F_SIGN = (this.REG_ACC >> 7) & 1);
            break;
          }
          case 58: {
            (e = this.REG_ACC & this.load(a)),
              (this.REG_ACC = this.F_ZERO = (e >> 1) + (this.F_CARRY << 7)),
              (this.F_SIGN = this.F_CARRY),
              (this.F_CARRY = (e >> 7) & 1),
              (this.F_OVERFLOW = ((e >> 7) ^ (e >> 6)) & 1);
            break;
          }
          case 59: {
            (e = (this.REG_X & this.REG_ACC) - this.load(a)),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e & 255),
              (this.REG_X ^ e) & 128 && (this.REG_X ^ this.load(a)) & 128
                ? (this.F_OVERFLOW = 1)
                : (this.F_OVERFLOW = 0),
              (this.F_CARRY = e < 0 ? 0 : 1),
              (this.REG_X = e & 255);
            break;
          }
          case 60: {
            (this.REG_ACC = this.REG_X = this.F_ZERO = this.load(a)),
              (this.F_SIGN = (this.REG_ACC >> 7) & 1),
              (i += s);
            break;
          }
          case 61: {
            this.write(a, this.REG_ACC & this.REG_X);
            break;
          }
          case 62: {
            (e = (this.load(a) - 1) & 255),
              this.write(a, e),
              (e = this.REG_ACC - e),
              (this.F_CARRY = e >= 0 ? 1 : 0),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e & 255),
              n !== 11 && (i += s);
            break;
          }
          case 63: {
            (e = (this.load(a) + 1) & 255),
              this.write(a, e),
              (e = this.REG_ACC - e - (1 - this.F_CARRY)),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e & 255),
              (this.REG_ACC ^ e) & 128 && (this.REG_ACC ^ this.load(a)) & 128
                ? (this.F_OVERFLOW = 1)
                : (this.F_OVERFLOW = 0),
              (this.F_CARRY = e < 0 ? 0 : 1),
              (this.REG_ACC = e & 255),
              n !== 11 && (i += s);
            break;
          }
          case 64: {
            (e = this.load(a)),
              (t = this.F_CARRY),
              (this.F_CARRY = (e >> 7) & 1),
              (e = ((e << 1) & 255) + t),
              this.write(a, e),
              (this.REG_ACC = this.REG_ACC & e),
              (this.F_SIGN = (this.REG_ACC >> 7) & 1),
              (this.F_ZERO = this.REG_ACC),
              n !== 11 && (i += s);
            break;
          }
          case 65: {
            (e = this.load(a)),
              (t = this.F_CARRY << 7),
              (this.F_CARRY = e & 1),
              (e = (e >> 1) + t),
              this.write(a, e),
              (e = this.REG_ACC + this.load(a) + this.F_CARRY),
              !((this.REG_ACC ^ this.load(a)) & 128) && (this.REG_ACC ^ e) & 128
                ? (this.F_OVERFLOW = 1)
                : (this.F_OVERFLOW = 0),
              (this.F_CARRY = e > 255 ? 1 : 0),
              (this.F_SIGN = (e >> 7) & 1),
              (this.F_ZERO = e & 255),
              (this.REG_ACC = e & 255),
              n !== 11 && (i += s);
            break;
          }
          case 66: {
            (e = this.load(a)),
              (this.F_CARRY = (e >> 7) & 1),
              (e = (e << 1) & 255),
              this.write(a, e),
              (this.REG_ACC = this.REG_ACC | e),
              (this.F_SIGN = (this.REG_ACC >> 7) & 1),
              (this.F_ZERO = this.REG_ACC),
              n !== 11 && (i += s);
            break;
          }
          case 67: {
            (e = this.load(a) & 255),
              (this.F_CARRY = e & 1),
              (e >>= 1),
              this.write(a, e),
              (this.REG_ACC = this.REG_ACC ^ e),
              (this.F_SIGN = (this.REG_ACC >> 7) & 1),
              (this.F_ZERO = this.REG_ACC),
              n !== 11 && (i += s);
            break;
          }
          case 68:
            break;
          case 69: {
            this.load(a), n !== 11 && (i += s);
            break;
          }
          default: {
            this.nes.stop(),
              (this.nes.crashMessage = "Game crashed, invalid opcode at address $" + o.toString(16));
            break;
          }
        }
        return i;
      },
      load: function (e) {
        return e < 8192 ? this.mem[e & 2047] : this.nes.mmap.load(e);
      },
      load16bit: function (e) {
        return e < 8191
          ? this.mem[e & 2047] | (this.mem[(e + 1) & 2047] << 8)
          : this.nes.mmap.load(e) | (this.nes.mmap.load(e + 1) << 8);
      },
      write: function (e, t) {
        e < 8192 ? (this.mem[e & 2047] = t) : this.nes.mmap.write(e, t);
      },
      requestIrq: function (e) {
        (this.irqRequested && e === this.IRQ_NORMAL) || ((this.irqRequested = !0), (this.irqType = e));
      },
      push: function (e) {
        this.nes.mmap.write(this.REG_SP, e), this.REG_SP--, (this.REG_SP = 256 | (this.REG_SP & 255));
      },
      stackWrap: function () {
        this.REG_SP = 256 | (this.REG_SP & 255);
      },
      pull: function () {
        return this.REG_SP++, (this.REG_SP = 256 | (this.REG_SP & 255)), this.nes.mmap.load(this.REG_SP);
      },
      pageCrossed: function (e, t) {
        return (e & 65280) !== (t & 65280);
      },
      haltCycles: function (e) {
        this.cyclesToHalt += e;
      },
      doNonMaskableInterrupt: function (e) {
        this.nes.mmap.load(8192) & 128 &&
          (this.REG_PC_NEW++,
            this.push((this.REG_PC_NEW >> 8) & 255),
            this.push(this.REG_PC_NEW & 255),
            this.push(e),
            (this.REG_PC_NEW = this.nes.mmap.load(65530) | (this.nes.mmap.load(65531) << 8)),
            this.REG_PC_NEW--);
      },
      doResetInterrupt: function () {
        (this.REG_PC_NEW = this.nes.mmap.load(65532) | (this.nes.mmap.load(65533) << 8)), this.REG_PC_NEW--;
      },
      doIrq: function (e) {
        this.REG_PC_NEW++,
          this.push((this.REG_PC_NEW >> 8) & 255),
          this.push(this.REG_PC_NEW & 255),
          this.push(e),
          (this.F_INTERRUPT_NEW = 1),
          (this.F_BRK_NEW = 0),
          (this.REG_PC_NEW = this.nes.mmap.load(65534) | (this.nes.mmap.load(65535) << 8)),
          this.REG_PC_NEW--;
      },
      getStatus: function () {
        return (
          this.F_CARRY |
          (this.F_ZERO << 1) |
          (this.F_INTERRUPT << 2) |
          (this.F_DECIMAL << 3) |
          (this.F_BRK << 4) |
          (this.F_NOTUSED << 5) |
          (this.F_OVERFLOW << 6) |
          (this.F_SIGN << 7)
        );
      },
      setStatus: function (e) {
        (this.F_CARRY = e & 1),
          (this.F_ZERO = (e >> 1) & 1),
          (this.F_INTERRUPT = (e >> 2) & 1),
          (this.F_DECIMAL = (e >> 3) & 1),
          (this.F_BRK = (e >> 4) & 1),
          (this.F_NOTUSED = (e >> 5) & 1),
          (this.F_OVERFLOW = (e >> 6) & 1),
          (this.F_SIGN = (e >> 7) & 1);
      },
      JSON_PROPERTIES: [
        "mem",
        "cyclesToHalt",
        "irqRequested",
        "irqType",
        "REG_ACC",
        "REG_X",
        "REG_Y",
        "REG_SP",
        "REG_PC",
        "REG_PC_NEW",
        "REG_STATUS",
        "F_CARRY",
        "F_DECIMAL",
        "F_INTERRUPT",
        "F_INTERRUPT_NEW",
        "F_OVERFLOW",
        "F_SIGN",
        "F_ZERO",
        "F_NOTUSED",
        "F_NOTUSED_NEW",
        "F_BRK",
        "F_BRK_NEW",
      ],
      toJSON: function () {
        return WR.toJSON(this);
      },
      fromJSON: function (e) {
        WR.fromJSON(this, e);
      },
    };
    var zR = function () {
      this.opdata = new Array(256);
      for (var e = 0; e < 256; e++) this.opdata[e] = 255;
      this.setOp(this.INS_ADC, 105, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_ADC, 101, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_ADC, 117, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_ADC, 109, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_ADC, 125, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_ADC, 121, this.ADDR_ABSY, 3, 4),
        this.setOp(this.INS_ADC, 97, this.ADDR_PREIDXIND, 2, 6),
        this.setOp(this.INS_ADC, 113, this.ADDR_POSTIDXIND, 2, 5),
        this.setOp(this.INS_AND, 41, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_AND, 37, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_AND, 53, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_AND, 45, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_AND, 61, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_AND, 57, this.ADDR_ABSY, 3, 4),
        this.setOp(this.INS_AND, 33, this.ADDR_PREIDXIND, 2, 6),
        this.setOp(this.INS_AND, 49, this.ADDR_POSTIDXIND, 2, 5),
        this.setOp(this.INS_ASL, 10, this.ADDR_ACC, 1, 2),
        this.setOp(this.INS_ASL, 6, this.ADDR_ZP, 2, 5),
        this.setOp(this.INS_ASL, 22, this.ADDR_ZPX, 2, 6),
        this.setOp(this.INS_ASL, 14, this.ADDR_ABS, 3, 6),
        this.setOp(this.INS_ASL, 30, this.ADDR_ABSX, 3, 7),
        this.setOp(this.INS_BCC, 144, this.ADDR_REL, 2, 2),
        this.setOp(this.INS_BCS, 176, this.ADDR_REL, 2, 2),
        this.setOp(this.INS_BEQ, 240, this.ADDR_REL, 2, 2),
        this.setOp(this.INS_BIT, 36, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_BIT, 44, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_BMI, 48, this.ADDR_REL, 2, 2),
        this.setOp(this.INS_BNE, 208, this.ADDR_REL, 2, 2),
        this.setOp(this.INS_BPL, 16, this.ADDR_REL, 2, 2),
        this.setOp(this.INS_BRK, 0, this.ADDR_IMP, 1, 7),
        this.setOp(this.INS_BVC, 80, this.ADDR_REL, 2, 2),
        this.setOp(this.INS_BVS, 112, this.ADDR_REL, 2, 2),
        this.setOp(this.INS_CLC, 24, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_CLD, 216, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_CLI, 88, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_CLV, 184, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_CMP, 201, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_CMP, 197, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_CMP, 213, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_CMP, 205, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_CMP, 221, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_CMP, 217, this.ADDR_ABSY, 3, 4),
        this.setOp(this.INS_CMP, 193, this.ADDR_PREIDXIND, 2, 6),
        this.setOp(this.INS_CMP, 209, this.ADDR_POSTIDXIND, 2, 5),
        this.setOp(this.INS_CPX, 224, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_CPX, 228, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_CPX, 236, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_CPY, 192, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_CPY, 196, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_CPY, 204, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_DEC, 198, this.ADDR_ZP, 2, 5),
        this.setOp(this.INS_DEC, 214, this.ADDR_ZPX, 2, 6),
        this.setOp(this.INS_DEC, 206, this.ADDR_ABS, 3, 6),
        this.setOp(this.INS_DEC, 222, this.ADDR_ABSX, 3, 7),
        this.setOp(this.INS_DEX, 202, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_DEY, 136, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_EOR, 73, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_EOR, 69, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_EOR, 85, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_EOR, 77, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_EOR, 93, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_EOR, 89, this.ADDR_ABSY, 3, 4),
        this.setOp(this.INS_EOR, 65, this.ADDR_PREIDXIND, 2, 6),
        this.setOp(this.INS_EOR, 81, this.ADDR_POSTIDXIND, 2, 5),
        this.setOp(this.INS_INC, 230, this.ADDR_ZP, 2, 5),
        this.setOp(this.INS_INC, 246, this.ADDR_ZPX, 2, 6),
        this.setOp(this.INS_INC, 238, this.ADDR_ABS, 3, 6),
        this.setOp(this.INS_INC, 254, this.ADDR_ABSX, 3, 7),
        this.setOp(this.INS_INX, 232, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_INY, 200, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_JMP, 76, this.ADDR_ABS, 3, 3),
        this.setOp(this.INS_JMP, 108, this.ADDR_INDABS, 3, 5),
        this.setOp(this.INS_JSR, 32, this.ADDR_ABS, 3, 6),
        this.setOp(this.INS_LDA, 169, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_LDA, 165, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_LDA, 181, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_LDA, 173, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_LDA, 189, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_LDA, 185, this.ADDR_ABSY, 3, 4),
        this.setOp(this.INS_LDA, 161, this.ADDR_PREIDXIND, 2, 6),
        this.setOp(this.INS_LDA, 177, this.ADDR_POSTIDXIND, 2, 5),
        this.setOp(this.INS_LDX, 162, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_LDX, 166, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_LDX, 182, this.ADDR_ZPY, 2, 4),
        this.setOp(this.INS_LDX, 174, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_LDX, 190, this.ADDR_ABSY, 3, 4),
        this.setOp(this.INS_LDY, 160, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_LDY, 164, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_LDY, 180, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_LDY, 172, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_LDY, 188, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_LSR, 74, this.ADDR_ACC, 1, 2),
        this.setOp(this.INS_LSR, 70, this.ADDR_ZP, 2, 5),
        this.setOp(this.INS_LSR, 86, this.ADDR_ZPX, 2, 6),
        this.setOp(this.INS_LSR, 78, this.ADDR_ABS, 3, 6),
        this.setOp(this.INS_LSR, 94, this.ADDR_ABSX, 3, 7),
        this.setOp(this.INS_NOP, 26, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_NOP, 58, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_NOP, 90, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_NOP, 122, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_NOP, 218, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_NOP, 234, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_NOP, 250, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_ORA, 9, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_ORA, 5, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_ORA, 21, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_ORA, 13, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_ORA, 29, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_ORA, 25, this.ADDR_ABSY, 3, 4),
        this.setOp(this.INS_ORA, 1, this.ADDR_PREIDXIND, 2, 6),
        this.setOp(this.INS_ORA, 17, this.ADDR_POSTIDXIND, 2, 5),
        this.setOp(this.INS_PHA, 72, this.ADDR_IMP, 1, 3),
        this.setOp(this.INS_PHP, 8, this.ADDR_IMP, 1, 3),
        this.setOp(this.INS_PLA, 104, this.ADDR_IMP, 1, 4),
        this.setOp(this.INS_PLP, 40, this.ADDR_IMP, 1, 4),
        this.setOp(this.INS_ROL, 42, this.ADDR_ACC, 1, 2),
        this.setOp(this.INS_ROL, 38, this.ADDR_ZP, 2, 5),
        this.setOp(this.INS_ROL, 54, this.ADDR_ZPX, 2, 6),
        this.setOp(this.INS_ROL, 46, this.ADDR_ABS, 3, 6),
        this.setOp(this.INS_ROL, 62, this.ADDR_ABSX, 3, 7),
        this.setOp(this.INS_ROR, 106, this.ADDR_ACC, 1, 2),
        this.setOp(this.INS_ROR, 102, this.ADDR_ZP, 2, 5),
        this.setOp(this.INS_ROR, 118, this.ADDR_ZPX, 2, 6),
        this.setOp(this.INS_ROR, 110, this.ADDR_ABS, 3, 6),
        this.setOp(this.INS_ROR, 126, this.ADDR_ABSX, 3, 7),
        this.setOp(this.INS_RTI, 64, this.ADDR_IMP, 1, 6),
        this.setOp(this.INS_RTS, 96, this.ADDR_IMP, 1, 6),
        this.setOp(this.INS_SBC, 233, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_SBC, 229, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_SBC, 245, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_SBC, 237, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_SBC, 253, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_SBC, 249, this.ADDR_ABSY, 3, 4),
        this.setOp(this.INS_SBC, 225, this.ADDR_PREIDXIND, 2, 6),
        this.setOp(this.INS_SBC, 241, this.ADDR_POSTIDXIND, 2, 5),
        this.setOp(this.INS_SEC, 56, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_SED, 248, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_SEI, 120, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_STA, 133, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_STA, 149, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_STA, 141, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_STA, 157, this.ADDR_ABSX, 3, 5),
        this.setOp(this.INS_STA, 153, this.ADDR_ABSY, 3, 5),
        this.setOp(this.INS_STA, 129, this.ADDR_PREIDXIND, 2, 6),
        this.setOp(this.INS_STA, 145, this.ADDR_POSTIDXIND, 2, 6),
        this.setOp(this.INS_STX, 134, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_STX, 150, this.ADDR_ZPY, 2, 4),
        this.setOp(this.INS_STX, 142, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_STY, 132, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_STY, 148, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_STY, 140, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_TAX, 170, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_TAY, 168, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_TSX, 186, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_TXA, 138, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_TXS, 154, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_TYA, 152, this.ADDR_IMP, 1, 2),
        this.setOp(this.INS_ALR, 75, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_ANC, 11, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_ANC, 43, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_ARR, 107, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_AXS, 203, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_LAX, 163, this.ADDR_PREIDXIND, 2, 6),
        this.setOp(this.INS_LAX, 167, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_LAX, 175, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_LAX, 179, this.ADDR_POSTIDXIND, 2, 5),
        this.setOp(this.INS_LAX, 183, this.ADDR_ZPY, 2, 4),
        this.setOp(this.INS_LAX, 191, this.ADDR_ABSY, 3, 4),
        this.setOp(this.INS_SAX, 131, this.ADDR_PREIDXIND, 2, 6),
        this.setOp(this.INS_SAX, 135, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_SAX, 143, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_SAX, 151, this.ADDR_ZPY, 2, 4),
        this.setOp(this.INS_DCP, 195, this.ADDR_PREIDXIND, 2, 8),
        this.setOp(this.INS_DCP, 199, this.ADDR_ZP, 2, 5),
        this.setOp(this.INS_DCP, 207, this.ADDR_ABS, 3, 6),
        this.setOp(this.INS_DCP, 211, this.ADDR_POSTIDXIND, 2, 8),
        this.setOp(this.INS_DCP, 215, this.ADDR_ZPX, 2, 6),
        this.setOp(this.INS_DCP, 219, this.ADDR_ABSY, 3, 7),
        this.setOp(this.INS_DCP, 223, this.ADDR_ABSX, 3, 7),
        this.setOp(this.INS_ISC, 227, this.ADDR_PREIDXIND, 2, 8),
        this.setOp(this.INS_ISC, 231, this.ADDR_ZP, 2, 5),
        this.setOp(this.INS_ISC, 239, this.ADDR_ABS, 3, 6),
        this.setOp(this.INS_ISC, 243, this.ADDR_POSTIDXIND, 2, 8),
        this.setOp(this.INS_ISC, 247, this.ADDR_ZPX, 2, 6),
        this.setOp(this.INS_ISC, 251, this.ADDR_ABSY, 3, 7),
        this.setOp(this.INS_ISC, 255, this.ADDR_ABSX, 3, 7),
        this.setOp(this.INS_RLA, 35, this.ADDR_PREIDXIND, 2, 8),
        this.setOp(this.INS_RLA, 39, this.ADDR_ZP, 2, 5),
        this.setOp(this.INS_RLA, 47, this.ADDR_ABS, 3, 6),
        this.setOp(this.INS_RLA, 51, this.ADDR_POSTIDXIND, 2, 8),
        this.setOp(this.INS_RLA, 55, this.ADDR_ZPX, 2, 6),
        this.setOp(this.INS_RLA, 59, this.ADDR_ABSY, 3, 7),
        this.setOp(this.INS_RLA, 63, this.ADDR_ABSX, 3, 7),
        this.setOp(this.INS_RRA, 99, this.ADDR_PREIDXIND, 2, 8),
        this.setOp(this.INS_RRA, 103, this.ADDR_ZP, 2, 5),
        this.setOp(this.INS_RRA, 111, this.ADDR_ABS, 3, 6),
        this.setOp(this.INS_RRA, 115, this.ADDR_POSTIDXIND, 2, 8),
        this.setOp(this.INS_RRA, 119, this.ADDR_ZPX, 2, 6),
        this.setOp(this.INS_RRA, 123, this.ADDR_ABSY, 3, 7),
        this.setOp(this.INS_RRA, 127, this.ADDR_ABSX, 3, 7),
        this.setOp(this.INS_SLO, 3, this.ADDR_PREIDXIND, 2, 8),
        this.setOp(this.INS_SLO, 7, this.ADDR_ZP, 2, 5),
        this.setOp(this.INS_SLO, 15, this.ADDR_ABS, 3, 6),
        this.setOp(this.INS_SLO, 19, this.ADDR_POSTIDXIND, 2, 8),
        this.setOp(this.INS_SLO, 23, this.ADDR_ZPX, 2, 6),
        this.setOp(this.INS_SLO, 27, this.ADDR_ABSY, 3, 7),
        this.setOp(this.INS_SLO, 31, this.ADDR_ABSX, 3, 7),
        this.setOp(this.INS_SRE, 67, this.ADDR_PREIDXIND, 2, 8),
        this.setOp(this.INS_SRE, 71, this.ADDR_ZP, 2, 5),
        this.setOp(this.INS_SRE, 79, this.ADDR_ABS, 3, 6),
        this.setOp(this.INS_SRE, 83, this.ADDR_POSTIDXIND, 2, 8),
        this.setOp(this.INS_SRE, 87, this.ADDR_ZPX, 2, 6),
        this.setOp(this.INS_SRE, 91, this.ADDR_ABSY, 3, 7),
        this.setOp(this.INS_SRE, 95, this.ADDR_ABSX, 3, 7),
        this.setOp(this.INS_SKB, 128, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_SKB, 130, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_SKB, 137, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_SKB, 194, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_SKB, 226, this.ADDR_IMM, 2, 2),
        this.setOp(this.INS_IGN, 12, this.ADDR_ABS, 3, 4),
        this.setOp(this.INS_IGN, 28, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_IGN, 60, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_IGN, 92, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_IGN, 124, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_IGN, 220, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_IGN, 252, this.ADDR_ABSX, 3, 4),
        this.setOp(this.INS_IGN, 4, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_IGN, 68, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_IGN, 100, this.ADDR_ZP, 2, 3),
        this.setOp(this.INS_IGN, 20, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_IGN, 52, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_IGN, 84, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_IGN, 116, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_IGN, 212, this.ADDR_ZPX, 2, 4),
        this.setOp(this.INS_IGN, 244, this.ADDR_ZPX, 2, 4),
        (this.cycTable = new Array(
          7,
          6,
          2,
          8,
          3,
          3,
          5,
          5,
          3,
          2,
          2,
          2,
          4,
          4,
          6,
          6,
          2,
          5,
          2,
          8,
          4,
          4,
          6,
          6,
          2,
          4,
          2,
          7,
          4,
          4,
          7,
          7,
          6,
          6,
          2,
          8,
          3,
          3,
          5,
          5,
          4,
          2,
          2,
          2,
          4,
          4,
          6,
          6,
          2,
          5,
          2,
          8,
          4,
          4,
          6,
          6,
          2,
          4,
          2,
          7,
          4,
          4,
          7,
          7,
          6,
          6,
          2,
          8,
          3,
          3,
          5,
          5,
          3,
          2,
          2,
          2,
          3,
          4,
          6,
          6,
          2,
          5,
          2,
          8,
          4,
          4,
          6,
          6,
          2,
          4,
          2,
          7,
          4,
          4,
          7,
          7,
          6,
          6,
          2,
          8,
          3,
          3,
          5,
          5,
          4,
          2,
          2,
          2,
          5,
          4,
          6,
          6,
          2,
          5,
          2,
          8,
          4,
          4,
          6,
          6,
          2,
          4,
          2,
          7,
          4,
          4,
          7,
          7,
          2,
          6,
          2,
          6,
          3,
          3,
          3,
          3,
          2,
          2,
          2,
          2,
          4,
          4,
          4,
          4,
          2,
          6,
          2,
          6,
          4,
          4,
          4,
          4,
          2,
          5,
          2,
          5,
          5,
          5,
          5,
          5,
          2,
          6,
          2,
          6,
          3,
          3,
          3,
          3,
          2,
          2,
          2,
          2,
          4,
          4,
          4,
          4,
          2,
          5,
          2,
          5,
          4,
          4,
          4,
          4,
          2,
          4,
          2,
          4,
          4,
          4,
          4,
          4,
          2,
          6,
          2,
          8,
          3,
          3,
          5,
          5,
          2,
          2,
          2,
          2,
          4,
          4,
          6,
          6,
          2,
          5,
          2,
          8,
          4,
          4,
          6,
          6,
          2,
          4,
          2,
          7,
          4,
          4,
          7,
          7,
          2,
          6,
          3,
          8,
          3,
          3,
          5,
          5,
          2,
          2,
          2,
          2,
          4,
          4,
          6,
          6,
          2,
          5,
          2,
          8,
          4,
          4,
          6,
          6,
          2,
          4,
          2,
          7,
          4,
          4,
          7,
          7
        )),
        (this.instname = new Array(70)),
        (this.instname[0] = "ADC"),
        (this.instname[1] = "AND"),
        (this.instname[2] = "ASL"),
        (this.instname[3] = "BCC"),
        (this.instname[4] = "BCS"),
        (this.instname[5] = "BEQ"),
        (this.instname[6] = "BIT"),
        (this.instname[7] = "BMI"),
        (this.instname[8] = "BNE"),
        (this.instname[9] = "BPL"),
        (this.instname[10] = "BRK"),
        (this.instname[11] = "BVC"),
        (this.instname[12] = "BVS"),
        (this.instname[13] = "CLC"),
        (this.instname[14] = "CLD"),
        (this.instname[15] = "CLI"),
        (this.instname[16] = "CLV"),
        (this.instname[17] = "CMP"),
        (this.instname[18] = "CPX"),
        (this.instname[19] = "CPY"),
        (this.instname[20] = "DEC"),
        (this.instname[21] = "DEX"),
        (this.instname[22] = "DEY"),
        (this.instname[23] = "EOR"),
        (this.instname[24] = "INC"),
        (this.instname[25] = "INX"),
        (this.instname[26] = "INY"),
        (this.instname[27] = "JMP"),
        (this.instname[28] = "JSR"),
        (this.instname[29] = "LDA"),
        (this.instname[30] = "LDX"),
        (this.instname[31] = "LDY"),
        (this.instname[32] = "LSR"),
        (this.instname[33] = "NOP"),
        (this.instname[34] = "ORA"),
        (this.instname[35] = "PHA"),
        (this.instname[36] = "PHP"),
        (this.instname[37] = "PLA"),
        (this.instname[38] = "PLP"),
        (this.instname[39] = "ROL"),
        (this.instname[40] = "ROR"),
        (this.instname[41] = "RTI"),
        (this.instname[42] = "RTS"),
        (this.instname[43] = "SBC"),
        (this.instname[44] = "SEC"),
        (this.instname[45] = "SED"),
        (this.instname[46] = "SEI"),
        (this.instname[47] = "STA"),
        (this.instname[48] = "STX"),
        (this.instname[49] = "STY"),
        (this.instname[50] = "TAX"),
        (this.instname[51] = "TAY"),
        (this.instname[52] = "TSX"),
        (this.instname[53] = "TXA"),
        (this.instname[54] = "TXS"),
        (this.instname[55] = "TYA"),
        (this.instname[56] = "ALR"),
        (this.instname[57] = "ANC"),
        (this.instname[58] = "ARR"),
        (this.instname[59] = "AXS"),
        (this.instname[60] = "LAX"),
        (this.instname[61] = "SAX"),
        (this.instname[62] = "DCP"),
        (this.instname[63] = "ISC"),
        (this.instname[64] = "RLA"),
        (this.instname[65] = "RRA"),
        (this.instname[66] = "SLO"),
        (this.instname[67] = "SRE"),
        (this.instname[68] = "SKB"),
        (this.instname[69] = "IGN"),
        (this.addrDesc = new Array(
          "Zero Page           ",
          "Relative            ",
          "Implied             ",
          "Absolute            ",
          "Accumulator         ",
          "Immediate           ",
          "Zero Page,X         ",
          "Zero Page,Y         ",
          "Absolute,X          ",
          "Absolute,Y          ",
          "Preindexed Indirect ",
          "Postindexed Indirect",
          "Indirect Absolute   "
        ));
    };
    zR.prototype = {
      INS_ADC: 0,
      INS_AND: 1,
      INS_ASL: 2,
      INS_BCC: 3,
      INS_BCS: 4,
      INS_BEQ: 5,
      INS_BIT: 6,
      INS_BMI: 7,
      INS_BNE: 8,
      INS_BPL: 9,
      INS_BRK: 10,
      INS_BVC: 11,
      INS_BVS: 12,
      INS_CLC: 13,
      INS_CLD: 14,
      INS_CLI: 15,
      INS_CLV: 16,
      INS_CMP: 17,
      INS_CPX: 18,
      INS_CPY: 19,
      INS_DEC: 20,
      INS_DEX: 21,
      INS_DEY: 22,
      INS_EOR: 23,
      INS_INC: 24,
      INS_INX: 25,
      INS_INY: 26,
      INS_JMP: 27,
      INS_JSR: 28,
      INS_LDA: 29,
      INS_LDX: 30,
      INS_LDY: 31,
      INS_LSR: 32,
      INS_NOP: 33,
      INS_ORA: 34,
      INS_PHA: 35,
      INS_PHP: 36,
      INS_PLA: 37,
      INS_PLP: 38,
      INS_ROL: 39,
      INS_ROR: 40,
      INS_RTI: 41,
      INS_RTS: 42,
      INS_SBC: 43,
      INS_SEC: 44,
      INS_SED: 45,
      INS_SEI: 46,
      INS_STA: 47,
      INS_STX: 48,
      INS_STY: 49,
      INS_TAX: 50,
      INS_TAY: 51,
      INS_TSX: 52,
      INS_TXA: 53,
      INS_TXS: 54,
      INS_TYA: 55,
      INS_ALR: 56,
      INS_ANC: 57,
      INS_ARR: 58,
      INS_AXS: 59,
      INS_LAX: 60,
      INS_SAX: 61,
      INS_DCP: 62,
      INS_ISC: 63,
      INS_RLA: 64,
      INS_RRA: 65,
      INS_SLO: 66,
      INS_SRE: 67,
      INS_SKB: 68,
      INS_IGN: 69,
      INS_DUMMY: 70,
      ADDR_ZP: 0,
      ADDR_REL: 1,
      ADDR_IMP: 2,
      ADDR_ABS: 3,
      ADDR_ACC: 4,
      ADDR_IMM: 5,
      ADDR_ZPX: 6,
      ADDR_ZPY: 7,
      ADDR_ABSX: 8,
      ADDR_ABSY: 9,
      ADDR_PREIDXIND: 10,
      ADDR_POSTIDXIND: 11,
      ADDR_INDABS: 12,
      setOp: function (e, t, r, i, s) {
        this.opdata[t] = (e & 255) | ((r & 255) << 8) | ((i & 255) << 16) | ((s & 255) << 24);
      },
    };
    $R.exports = HR;
  });
  var Xa = f((dW, QR) => {
    var XR = function () {
      (this.pix = new Array(64)),
        (this.fbIndex = null),
        (this.tIndex = null),
        (this.x = null),
        (this.y = null),
        (this.w = null),
        (this.h = null),
        (this.incX = null),
        (this.incY = null),
        (this.palIndex = null),
        (this.tpri = null),
        (this.c = null),
        (this.initialized = !1),
        (this.opaque = new Array(8));
    };
    XR.prototype = {
      setBuffer: function (e) {
        for (this.y = 0; this.y < 8; this.y++) this.setScanline(this.y, e[this.y], e[this.y + 8]);
      },
      setScanline: function (e, t, r) {
        for (this.initialized = !0, this.tIndex = e << 3, this.x = 0; this.x < 8; this.x++)
          (this.pix[this.tIndex + this.x] = ((t >> (7 - this.x)) & 1) + (((r >> (7 - this.x)) & 1) << 1)),
            this.pix[this.tIndex + this.x] === 0 && (this.opaque[e] = !1);
      },
      render: function (e, t, r, i, s, n, o, a, l, c, u, p, m) {
        if (!(n < -7 || n >= 256 || o < -7 || o >= 240))
          if (
            ((this.w = i - t),
              (this.h = s - r),
              n < 0 && (t -= n),
              n + i >= 256 && (i = 256 - n),
              o < 0 && (r -= o),
              o + s >= 240 && (s = 240 - o),
              !c && !u)
          )
            for (this.fbIndex = (o << 8) + n, this.tIndex = 0, this.y = 0; this.y < 8; this.y++) {
              for (this.x = 0; this.x < 8; this.x++)
                this.x >= t &&
                  this.x < i &&
                  this.y >= r &&
                  this.y < s &&
                  ((this.palIndex = this.pix[this.tIndex]),
                    (this.tpri = m[this.fbIndex]),
                    this.palIndex !== 0 &&
                    p <= (this.tpri & 255) &&
                    ((e[this.fbIndex] = l[this.palIndex + a]),
                      (this.tpri = (this.tpri & 3840) | p),
                      (m[this.fbIndex] = this.tpri))),
                  this.fbIndex++,
                  this.tIndex++;
              (this.fbIndex -= 8), (this.fbIndex += 256);
            }
          else if (c && !u)
            for (this.fbIndex = (o << 8) + n, this.tIndex = 7, this.y = 0; this.y < 8; this.y++) {
              for (this.x = 0; this.x < 8; this.x++)
                this.x >= t &&
                  this.x < i &&
                  this.y >= r &&
                  this.y < s &&
                  ((this.palIndex = this.pix[this.tIndex]),
                    (this.tpri = m[this.fbIndex]),
                    this.palIndex !== 0 &&
                    p <= (this.tpri & 255) &&
                    ((e[this.fbIndex] = l[this.palIndex + a]),
                      (this.tpri = (this.tpri & 3840) | p),
                      (m[this.fbIndex] = this.tpri))),
                  this.fbIndex++,
                  this.tIndex--;
              (this.fbIndex -= 8), (this.fbIndex += 256), (this.tIndex += 16);
            }
          else if (u && !c)
            for (this.fbIndex = (o << 8) + n, this.tIndex = 56, this.y = 0; this.y < 8; this.y++) {
              for (this.x = 0; this.x < 8; this.x++)
                this.x >= t &&
                  this.x < i &&
                  this.y >= r &&
                  this.y < s &&
                  ((this.palIndex = this.pix[this.tIndex]),
                    (this.tpri = m[this.fbIndex]),
                    this.palIndex !== 0 &&
                    p <= (this.tpri & 255) &&
                    ((e[this.fbIndex] = l[this.palIndex + a]),
                      (this.tpri = (this.tpri & 3840) | p),
                      (m[this.fbIndex] = this.tpri))),
                  this.fbIndex++,
                  this.tIndex++;
              (this.fbIndex -= 8), (this.fbIndex += 256), (this.tIndex -= 16);
            }
          else
            for (this.fbIndex = (o << 8) + n, this.tIndex = 63, this.y = 0; this.y < 8; this.y++) {
              for (this.x = 0; this.x < 8; this.x++)
                this.x >= t &&
                  this.x < i &&
                  this.y >= r &&
                  this.y < s &&
                  ((this.palIndex = this.pix[this.tIndex]),
                    (this.tpri = m[this.fbIndex]),
                    this.palIndex !== 0 &&
                    p <= (this.tpri & 255) &&
                    ((e[this.fbIndex] = l[this.palIndex + a]),
                      (this.tpri = (this.tpri & 3840) | p),
                      (m[this.fbIndex] = this.tpri))),
                  this.fbIndex++,
                  this.tIndex--;
              (this.fbIndex -= 8), (this.fbIndex += 256);
            }
      },
      isTransparent: function (e, t) {
        return this.pix[(t << 3) + e] === 0;
      },
      toJSON: function () {
        return { opaque: this.opaque, pix: this.pix };
      },
      fromJSON: function (e) {
        (this.opaque = e.opaque), (this.pix = e.pix);
      },
    };
    QR.exports = XR;
  });
  var rv = f((gW, tv) => {
    var RM = Xa(),
      KR = Es(),
      YR = function (e) {
        (this.nes = e),
          (this.vramMem = null),
          (this.spriteMem = null),
          (this.vramAddress = null),
          (this.vramTmpAddress = null),
          (this.vramBufferedReadValue = null),
          (this.firstWrite = null),
          (this.sramAddress = null),
          (this.currentMirroring = null),
          (this.requestEndFrame = null),
          (this.nmiOk = null),
          (this.dummyCycleToggle = null),
          (this.validTileData = null),
          (this.nmiCounter = null),
          (this.scanlineAlreadyRendered = null),
          (this.f_nmiOnVblank = null),
          (this.f_spriteSize = null),
          (this.f_bgPatternTable = null),
          (this.f_spPatternTable = null),
          (this.f_addrInc = null),
          (this.f_nTblAddress = null),
          (this.f_color = null),
          (this.f_spVisibility = null),
          (this.f_bgVisibility = null),
          (this.f_spClipping = null),
          (this.f_bgClipping = null),
          (this.f_dispType = null),
          (this.cntFV = null),
          (this.cntV = null),
          (this.cntH = null),
          (this.cntVT = null),
          (this.cntHT = null),
          (this.regFV = null),
          (this.regV = null),
          (this.regH = null),
          (this.regVT = null),
          (this.regHT = null),
          (this.regFH = null),
          (this.regS = null),
          (this.curNt = null),
          (this.attrib = null),
          (this.buffer = null),
          (this.bgbuffer = null),
          (this.pixrendered = null),
          (this.validTileData = null),
          (this.scantile = null),
          (this.scanline = null),
          (this.lastRenderedScanline = null),
          (this.curX = null),
          (this.sprX = null),
          (this.sprY = null),
          (this.sprTile = null),
          (this.sprCol = null),
          (this.vertFlip = null),
          (this.horiFlip = null),
          (this.bgPriority = null),
          (this.spr0HitX = null),
          (this.spr0HitY = null),
          (this.hitSpr0 = null),
          (this.sprPalette = null),
          (this.imgPalette = null),
          (this.ptTile = null),
          (this.ntable1 = null),
          (this.currentMirroring = null),
          (this.nameTable = null),
          (this.vramMirrorTable = null),
          (this.palTable = null),
          (this.showSpr0Hit = !1),
          (this.clipToTvSize = !0),
          this.reset();
      };
    YR.prototype = {
      STATUS_VRAMWRITE: 4,
      STATUS_SLSPRITECOUNT: 5,
      STATUS_SPRITE0HIT: 6,
      STATUS_VBLANK: 7,
      reset: function () {
        var e;
        for (
          this.vramMem = new Array(32768), this.spriteMem = new Array(256), e = 0;
          e < this.vramMem.length;
          e++
        )
          this.vramMem[e] = 0;
        for (e = 0; e < this.spriteMem.length; e++) this.spriteMem[e] = 0;
        for (
          this.vramAddress = null,
          this.vramTmpAddress = null,
          this.vramBufferedReadValue = 0,
          this.firstWrite = !0,
          this.sramAddress = 0,
          this.currentMirroring = -1,
          this.requestEndFrame = !1,
          this.nmiOk = !1,
          this.dummyCycleToggle = !1,
          this.validTileData = !1,
          this.nmiCounter = 0,
          this.scanlineAlreadyRendered = null,
          this.f_nmiOnVblank = 0,
          this.f_spriteSize = 0,
          this.f_bgPatternTable = 0,
          this.f_spPatternTable = 0,
          this.f_addrInc = 0,
          this.f_nTblAddress = 0,
          this.f_color = 0,
          this.f_spVisibility = 0,
          this.f_bgVisibility = 0,
          this.f_spClipping = 0,
          this.f_bgClipping = 0,
          this.f_dispType = 0,
          this.cntFV = 0,
          this.cntV = 0,
          this.cntH = 0,
          this.cntVT = 0,
          this.cntHT = 0,
          this.regFV = 0,
          this.regV = 0,
          this.regH = 0,
          this.regVT = 0,
          this.regHT = 0,
          this.regFH = 0,
          this.regS = 0,
          this.curNt = null,
          this.attrib = new Array(32),
          this.buffer = new Array(256 * 240),
          this.bgbuffer = new Array(256 * 240),
          this.pixrendered = new Array(256 * 240),
          this.validTileData = null,
          this.scantile = new Array(32),
          this.scanline = 0,
          this.lastRenderedScanline = -1,
          this.curX = 0,
          this.sprX = new Array(64),
          this.sprY = new Array(64),
          this.sprTile = new Array(64),
          this.sprCol = new Array(64),
          this.vertFlip = new Array(64),
          this.horiFlip = new Array(64),
          this.bgPriority = new Array(64),
          this.spr0HitX = 0,
          this.spr0HitY = 0,
          this.hitSpr0 = !1,
          this.sprPalette = new Array(16),
          this.imgPalette = new Array(16),
          this.ptTile = new Array(512),
          e = 0;
          e < 512;
          e++
        )
          this.ptTile[e] = new RM();
        for (
          this.ntable1 = new Array(4), this.currentMirroring = -1, this.nameTable = new Array(4), e = 0;
          e < 4;
          e++
        )
          this.nameTable[e] = new jR(32, 32, "Nt" + e);
        for (this.vramMirrorTable = new Array(32768), e = 0; e < 32768; e++) this.vramMirrorTable[e] = e;
        (this.palTable = new ev()),
          this.palTable.loadNTSCPalette(),
          this.updateControlReg1(0),
          this.updateControlReg2(0);
      },
      setMirroring: function (e) {
        if (e !== this.currentMirroring) {
          (this.currentMirroring = e),
            this.triggerRendering(),
            this.vramMirrorTable === null && (this.vramMirrorTable = new Array(32768));
          for (var t = 0; t < 32768; t++) this.vramMirrorTable[t] = t;
          this.defineMirrorRegion(16160, 16128, 32),
            this.defineMirrorRegion(16192, 16128, 32),
            this.defineMirrorRegion(16256, 16128, 32),
            this.defineMirrorRegion(16320, 16128, 32),
            this.defineMirrorRegion(12288, 8192, 3840),
            this.defineMirrorRegion(16384, 0, 16384),
            e === this.nes.rom.HORIZONTAL_MIRRORING
              ? ((this.ntable1[0] = 0),
                (this.ntable1[1] = 0),
                (this.ntable1[2] = 1),
                (this.ntable1[3] = 1),
                this.defineMirrorRegion(9216, 8192, 1024),
                this.defineMirrorRegion(11264, 10240, 1024))
              : e === this.nes.rom.VERTICAL_MIRRORING
                ? ((this.ntable1[0] = 0),
                  (this.ntable1[1] = 1),
                  (this.ntable1[2] = 0),
                  (this.ntable1[3] = 1),
                  this.defineMirrorRegion(10240, 8192, 1024),
                  this.defineMirrorRegion(11264, 9216, 1024))
                : e === this.nes.rom.SINGLESCREEN_MIRRORING
                  ? ((this.ntable1[0] = 0),
                    (this.ntable1[1] = 0),
                    (this.ntable1[2] = 0),
                    (this.ntable1[3] = 0),
                    this.defineMirrorRegion(9216, 8192, 1024),
                    this.defineMirrorRegion(10240, 8192, 1024),
                    this.defineMirrorRegion(11264, 8192, 1024))
                  : e === this.nes.rom.SINGLESCREEN_MIRRORING2
                    ? ((this.ntable1[0] = 1),
                      (this.ntable1[1] = 1),
                      (this.ntable1[2] = 1),
                      (this.ntable1[3] = 1),
                      this.defineMirrorRegion(9216, 9216, 1024),
                      this.defineMirrorRegion(10240, 9216, 1024),
                      this.defineMirrorRegion(11264, 9216, 1024))
                    : ((this.ntable1[0] = 0),
                      (this.ntable1[1] = 1),
                      (this.ntable1[2] = 2),
                      (this.ntable1[3] = 3));
        }
      },
      defineMirrorRegion: function (e, t, r) {
        for (var i = 0; i < r; i++) this.vramMirrorTable[e + i] = t + i;
      },
      startVBlank: function () {
        this.nes.cpu.requestIrq(this.nes.cpu.IRQ_NMI),
          this.lastRenderedScanline < 239 &&
          this.renderFramePartially(this.lastRenderedScanline + 1, 240 - this.lastRenderedScanline),
          this.endFrame(),
          (this.lastRenderedScanline = -1);
      },
      endScanline: function () {
        switch (this.scanline) {
          case 19:
            this.dummyCycleToggle && ((this.curX = 1), (this.dummyCycleToggle = !this.dummyCycleToggle));
            break;
          case 20:
            this.setStatusFlag(this.STATUS_VBLANK, !1),
              this.setStatusFlag(this.STATUS_SPRITE0HIT, !1),
              (this.hitSpr0 = !1),
              (this.spr0HitX = -1),
              (this.spr0HitY = -1),
              (this.f_bgVisibility === 1 || this.f_spVisibility === 1) &&
              ((this.cntFV = this.regFV),
                (this.cntV = this.regV),
                (this.cntH = this.regH),
                (this.cntVT = this.regVT),
                (this.cntHT = this.regHT),
                this.f_bgVisibility === 1 && this.renderBgScanline(!1, 0)),
              this.f_bgVisibility === 1 && this.f_spVisibility === 1 && this.checkSprite0(0),
              (this.f_bgVisibility === 1 || this.f_spVisibility === 1) && this.nes.mmap.clockIrqCounter();
            break;
          case 261:
            this.setStatusFlag(this.STATUS_VBLANK, !0),
              (this.requestEndFrame = !0),
              (this.nmiCounter = 9),
              (this.scanline = -1);
            break;
          default:
            this.scanline >= 21 &&
              this.scanline <= 260 &&
              (this.f_bgVisibility === 1 &&
                (this.scanlineAlreadyRendered ||
                  ((this.cntHT = this.regHT),
                    (this.cntH = this.regH),
                    this.renderBgScanline(!0, this.scanline + 1 - 21)),
                  (this.scanlineAlreadyRendered = !1),
                  !this.hitSpr0 &&
                  this.f_spVisibility === 1 &&
                  this.sprX[0] >= -7 &&
                  this.sprX[0] < 256 &&
                  this.sprY[0] + 1 <= this.scanline - 20 &&
                  this.sprY[0] + 1 + (this.f_spriteSize === 0 ? 8 : 16) >= this.scanline - 20 &&
                  this.checkSprite0(this.scanline - 20) &&
                  (this.hitSpr0 = !0)),
                (this.f_bgVisibility === 1 || this.f_spVisibility === 1) &&
                this.nes.mmap.clockIrqCounter());
        }
        this.scanline++, this.regsToAddress(), this.cntsToAddress();
      },
      startFrame: function () {
        var e = 0;
        if (this.f_dispType === 0) e = this.imgPalette[0];
        else
          switch (this.f_color) {
            case 0:
              e = 0;
              break;
            case 1:
              e = 65280;
              break;
            case 2:
              e = 16711680;
              break;
            case 3:
              e = 0;
              break;
            case 4:
              e = 255;
              break;
            default:
              e = 0;
          }
        var t = this.buffer,
          r;
        for (r = 0; r < 256 * 240; r++) t[r] = e;
        var i = this.pixrendered;
        for (r = 0; r < i.length; r++) i[r] = 65;
      },
      endFrame: function () {
        var e,
          t,
          r,
          i = this.buffer;
        if (this.showSpr0Hit) {
          if (this.sprX[0] >= 0 && this.sprX[0] < 256 && this.sprY[0] >= 0 && this.sprY[0] < 240) {
            for (e = 0; e < 256; e++) i[(this.sprY[0] << 8) + e] = 16733525;
            for (e = 0; e < 240; e++) i[(e << 8) + this.sprX[0]] = 16733525;
          }
          if (this.spr0HitX >= 0 && this.spr0HitX < 256 && this.spr0HitY >= 0 && this.spr0HitY < 240) {
            for (e = 0; e < 256; e++) i[(this.spr0HitY << 8) + e] = 5635925;
            for (e = 0; e < 240; e++) i[(e << 8) + this.spr0HitX] = 5635925;
          }
        }
        if (this.clipToTvSize || this.f_bgClipping === 0 || this.f_spClipping === 0)
          for (r = 0; r < 240; r++) for (t = 0; t < 8; t++) i[(r << 8) + t] = 0;
        if (this.clipToTvSize) for (r = 0; r < 240; r++) for (t = 0; t < 8; t++) i[(r << 8) + 255 - t] = 0;
        if (this.clipToTvSize)
          for (r = 0; r < 8; r++)
            for (t = 0; t < 256; t++) (i[(r << 8) + t] = 0), (i[((239 - r) << 8) + t] = 0);
        this.nes.ui.writeFrame(i);
      },
      updateControlReg1: function (e) {
        this.triggerRendering(),
          (this.f_nmiOnVblank = (e >> 7) & 1),
          (this.f_spriteSize = (e >> 5) & 1),
          (this.f_bgPatternTable = (e >> 4) & 1),
          (this.f_spPatternTable = (e >> 3) & 1),
          (this.f_addrInc = (e >> 2) & 1),
          (this.f_nTblAddress = e & 3),
          (this.regV = (e >> 1) & 1),
          (this.regH = e & 1),
          (this.regS = (e >> 4) & 1);
      },
      updateControlReg2: function (e) {
        this.triggerRendering(),
          (this.f_color = (e >> 5) & 7),
          (this.f_spVisibility = (e >> 4) & 1),
          (this.f_bgVisibility = (e >> 3) & 1),
          (this.f_spClipping = (e >> 2) & 1),
          (this.f_bgClipping = (e >> 1) & 1),
          (this.f_dispType = e & 1),
          this.f_dispType === 0 && this.palTable.setEmphasis(this.f_color),
          this.updatePalettes();
      },
      setStatusFlag: function (e, t) {
        var r = 1 << e;
        this.nes.cpu.mem[8194] = (this.nes.cpu.mem[8194] & (255 - r)) | (t ? r : 0);
      },
      readStatusRegister: function () {
        var e = this.nes.cpu.mem[8194];
        return (this.firstWrite = !0), this.setStatusFlag(this.STATUS_VBLANK, !1), e;
      },
      writeSRAMAddress: function (e) {
        this.sramAddress = e;
      },
      sramLoad: function () {
        return this.spriteMem[this.sramAddress];
      },
      sramWrite: function (e) {
        (this.spriteMem[this.sramAddress] = e),
          this.spriteRamWriteUpdate(this.sramAddress, e),
          this.sramAddress++,
          (this.sramAddress %= 256);
      },
      scrollWrite: function (e) {
        this.triggerRendering(),
          this.firstWrite
            ? ((this.regHT = (e >> 3) & 31), (this.regFH = e & 7))
            : ((this.regFV = e & 7), (this.regVT = (e >> 3) & 31)),
          (this.firstWrite = !this.firstWrite);
      },
      writeVRAMAddress: function (e) {
        this.firstWrite
          ? ((this.regFV = (e >> 4) & 3),
            (this.regV = (e >> 3) & 1),
            (this.regH = (e >> 2) & 1),
            (this.regVT = (this.regVT & 7) | ((e & 3) << 3)))
          : (this.triggerRendering(),
            (this.regVT = (this.regVT & 24) | ((e >> 5) & 7)),
            (this.regHT = e & 31),
            (this.cntFV = this.regFV),
            (this.cntV = this.regV),
            (this.cntH = this.regH),
            (this.cntVT = this.regVT),
            (this.cntHT = this.regHT),
            this.checkSprite0(this.scanline - 20)),
          (this.firstWrite = !this.firstWrite),
          this.cntsToAddress(),
          this.vramAddress < 8192 && this.nes.mmap.latchAccess(this.vramAddress);
      },
      vramLoad: function () {
        var e;
        return (
          this.cntsToAddress(),
          this.regsToAddress(),
          this.vramAddress <= 16127
            ? ((e = this.vramBufferedReadValue),
              this.vramAddress < 8192
                ? (this.vramBufferedReadValue = this.vramMem[this.vramAddress])
                : (this.vramBufferedReadValue = this.mirroredLoad(this.vramAddress)),
              this.vramAddress < 8192 && this.nes.mmap.latchAccess(this.vramAddress),
              (this.vramAddress += this.f_addrInc === 1 ? 32 : 1),
              this.cntsFromAddress(),
              this.regsFromAddress(),
              e)
            : ((e = this.mirroredLoad(this.vramAddress)),
              (this.vramAddress += this.f_addrInc === 1 ? 32 : 1),
              this.cntsFromAddress(),
              this.regsFromAddress(),
              e)
        );
      },
      vramWrite: function (e) {
        this.triggerRendering(),
          this.cntsToAddress(),
          this.regsToAddress(),
          this.vramAddress >= 8192
            ? this.mirroredWrite(this.vramAddress, e)
            : (this.writeMem(this.vramAddress, e), this.nes.mmap.latchAccess(this.vramAddress)),
          (this.vramAddress += this.f_addrInc === 1 ? 32 : 1),
          this.regsFromAddress(),
          this.cntsFromAddress();
      },
      sramDMA: function (e) {
        for (var t = e * 256, r, i = this.sramAddress; i < 256; i++)
          (r = this.nes.cpu.mem[t + i]), (this.spriteMem[i] = r), this.spriteRamWriteUpdate(i, r);
        this.nes.cpu.haltCycles(513);
      },
      regsFromAddress: function () {
        var e = (this.vramTmpAddress >> 8) & 255;
        (this.regFV = (e >> 4) & 7),
          (this.regV = (e >> 3) & 1),
          (this.regH = (e >> 2) & 1),
          (this.regVT = (this.regVT & 7) | ((e & 3) << 3)),
          (e = this.vramTmpAddress & 255),
          (this.regVT = (this.regVT & 24) | ((e >> 5) & 7)),
          (this.regHT = e & 31);
      },
      cntsFromAddress: function () {
        var e = (this.vramAddress >> 8) & 255;
        (this.cntFV = (e >> 4) & 3),
          (this.cntV = (e >> 3) & 1),
          (this.cntH = (e >> 2) & 1),
          (this.cntVT = (this.cntVT & 7) | ((e & 3) << 3)),
          (e = this.vramAddress & 255),
          (this.cntVT = (this.cntVT & 24) | ((e >> 5) & 7)),
          (this.cntHT = e & 31);
      },
      regsToAddress: function () {
        var e = (this.regFV & 7) << 4;
        (e |= (this.regV & 1) << 3), (e |= (this.regH & 1) << 2), (e |= (this.regVT >> 3) & 3);
        var t = (this.regVT & 7) << 5;
        (t |= this.regHT & 31), (this.vramTmpAddress = ((e << 8) | t) & 32767);
      },
      cntsToAddress: function () {
        var e = (this.cntFV & 7) << 4;
        (e |= (this.cntV & 1) << 3), (e |= (this.cntH & 1) << 2), (e |= (this.cntVT >> 3) & 3);
        var t = (this.cntVT & 7) << 5;
        (t |= this.cntHT & 31), (this.vramAddress = ((e << 8) | t) & 32767);
      },
      incTileCounter: function (e) {
        for (var t = e; t !== 0; t--)
          this.cntHT++,
            this.cntHT === 32 &&
            ((this.cntHT = 0),
              this.cntVT++,
              this.cntVT >= 30 &&
              (this.cntH++,
                this.cntH === 2 &&
                ((this.cntH = 0),
                  this.cntV++,
                  this.cntV === 2 && ((this.cntV = 0), this.cntFV++, (this.cntFV &= 7)))));
      },
      mirroredLoad: function (e) {
        return this.vramMem[this.vramMirrorTable[e]];
      },
      mirroredWrite: function (e, t) {
        if (e >= 16128 && e < 16160)
          e === 16128 || e === 16144
            ? (this.writeMem(16128, t), this.writeMem(16144, t))
            : e === 16132 || e === 16148
              ? (this.writeMem(16132, t), this.writeMem(16148, t))
              : e === 16136 || e === 16152
                ? (this.writeMem(16136, t), this.writeMem(16152, t))
                : e === 16140 || e === 16156
                  ? (this.writeMem(16140, t), this.writeMem(16156, t))
                  : this.writeMem(e, t);
        else if (e < this.vramMirrorTable.length) this.writeMem(this.vramMirrorTable[e], t);
        else throw new Error("Invalid VRAM address: " + e.toString(16));
      },
      triggerRendering: function () {
        this.scanline >= 21 &&
          this.scanline <= 260 &&
          (this.renderFramePartially(
            this.lastRenderedScanline + 1,
            this.scanline - 21 - this.lastRenderedScanline
          ),
            (this.lastRenderedScanline = this.scanline - 21));
      },
      renderFramePartially: function (e, t) {
        if ((this.f_spVisibility === 1 && this.renderSpritesPartially(e, t, !0), this.f_bgVisibility === 1)) {
          var r = e << 8,
            i = (e + t) << 8;
          i > 61440 && (i = 61440);
          for (var s = this.buffer, n = this.bgbuffer, o = this.pixrendered, a = r; a < i; a++)
            o[a] > 255 && (s[a] = n[a]);
        }
        this.f_spVisibility === 1 && this.renderSpritesPartially(e, t, !1), (this.validTileData = !1);
      },
      renderBgScanline: function (e, t) {
        var r = this.regS === 0 ? 0 : 256,
          i = (t << 8) - this.regFH;
        if (
          ((this.curNt = this.ntable1[this.cntV + this.cntV + this.cntH]),
            (this.cntHT = this.regHT),
            (this.cntH = this.regH),
            (this.curNt = this.ntable1[this.cntV + this.cntV + this.cntH]),
            t < 240 && t - this.cntFV >= 0)
        ) {
          for (
            var s = this.cntFV << 3,
            n = this.scantile,
            o = this.attrib,
            a = this.ptTile,
            l = this.nameTable,
            c = this.imgPalette,
            u = this.pixrendered,
            p = e ? this.bgbuffer : this.buffer,
            m,
            d,
            g,
            y,
            x = 0;
            x < 32;
            x++
          ) {
            if (t >= 0) {
              if (this.validTileData) {
                if (((m = n[x]), typeof m > "u")) continue;
                (d = m.pix), (g = o[x]);
              } else {
                if (((m = a[r + l[this.curNt].getTileIndex(this.cntHT, this.cntVT)]), typeof m > "u"))
                  continue;
                (d = m.pix),
                  (g = l[this.curNt].getAttrib(this.cntHT, this.cntVT)),
                  (n[x] = m),
                  (o[x] = g);
              }
              var R = 0,
                w = (x << 3) - this.regFH;
              if (w > -8)
                if ((w < 0 && ((i -= w), (R = -w)), m.opaque[this.cntFV]))
                  for (; R < 8; R++) (p[i] = c[d[s + R] + g]), (u[i] |= 256), i++;
                else
                  for (; R < 8; R++)
                    (y = d[s + R]), y !== 0 && ((p[i] = c[y + g]), (u[i] |= 256)), i++;
            }
            ++this.cntHT === 32 &&
              ((this.cntHT = 0),
                this.cntH++,
                (this.cntH %= 2),
                (this.curNt = this.ntable1[(this.cntV << 1) + this.cntH]));
          }
          this.validTileData = !0;
        }
        this.cntFV++,
          this.cntFV === 8 &&
          ((this.cntFV = 0),
            this.cntVT++,
            this.cntVT === 30
              ? ((this.cntVT = 0),
                this.cntV++,
                (this.cntV %= 2),
                (this.curNt = this.ntable1[(this.cntV << 1) + this.cntH]))
              : this.cntVT === 32 && (this.cntVT = 0),
            (this.validTileData = !1));
      },
      renderSpritesPartially: function (e, t, r) {
        if (this.f_spVisibility === 1) {
          for (var i = 0; i < 64; i++)
            if (
              this.bgPriority[i] === r &&
              this.sprX[i] >= 0 &&
              this.sprX[i] < 256 &&
              this.sprY[i] + 8 >= e &&
              this.sprY[i] < e + t
            )
              if (this.f_spriteSize === 0)
                (this.srcy1 = 0),
                  (this.srcy2 = 8),
                  this.sprY[i] < e && (this.srcy1 = e - this.sprY[i] - 1),
                  this.sprY[i] + 8 > e + t && (this.srcy2 = e + t - this.sprY[i] + 1),
                  this.f_spPatternTable === 0
                    ? this.ptTile[this.sprTile[i]].render(
                      this.buffer,
                      0,
                      this.srcy1,
                      8,
                      this.srcy2,
                      this.sprX[i],
                      this.sprY[i] + 1,
                      this.sprCol[i],
                      this.sprPalette,
                      this.horiFlip[i],
                      this.vertFlip[i],
                      i,
                      this.pixrendered
                    )
                    : this.ptTile[this.sprTile[i] + 256].render(
                      this.buffer,
                      0,
                      this.srcy1,
                      8,
                      this.srcy2,
                      this.sprX[i],
                      this.sprY[i] + 1,
                      this.sprCol[i],
                      this.sprPalette,
                      this.horiFlip[i],
                      this.vertFlip[i],
                      i,
                      this.pixrendered
                    );
              else {
                var s = this.sprTile[i];
                s & 1 && (s = this.sprTile[i] - 1 + 256);
                var n = 0,
                  o = 8;
                this.sprY[i] < e && (n = e - this.sprY[i] - 1),
                  this.sprY[i] + 8 > e + t && (o = e + t - this.sprY[i]),
                  this.ptTile[s + (this.vertFlip[i] ? 1 : 0)].render(
                    this.buffer,
                    0,
                    n,
                    8,
                    o,
                    this.sprX[i],
                    this.sprY[i] + 1,
                    this.sprCol[i],
                    this.sprPalette,
                    this.horiFlip[i],
                    this.vertFlip[i],
                    i,
                    this.pixrendered
                  ),
                  (n = 0),
                  (o = 8),
                  this.sprY[i] + 8 < e && (n = e - (this.sprY[i] + 8 + 1)),
                  this.sprY[i] + 16 > e + t && (o = e + t - (this.sprY[i] + 8)),
                  this.ptTile[s + (this.vertFlip[i] ? 0 : 1)].render(
                    this.buffer,
                    0,
                    n,
                    8,
                    o,
                    this.sprX[i],
                    this.sprY[i] + 1 + 8,
                    this.sprCol[i],
                    this.sprPalette,
                    this.horiFlip[i],
                    this.vertFlip[i],
                    i,
                    this.pixrendered
                  );
              }
        }
      },
      checkSprite0: function (e) {
        (this.spr0HitX = -1), (this.spr0HitY = -1);
        var t,
          r = this.f_spPatternTable === 0 ? 0 : 256,
          i,
          s,
          n,
          o,
          a;
        if (((i = this.sprX[0]), (s = this.sprY[0] + 1), this.f_spriteSize === 0)) {
          if (s <= e && s + 8 > e && i >= -7 && i < 256)
            if (
              ((n = this.ptTile[this.sprTile[0] + r]),
                this.vertFlip[0] ? (t = 7 - (e - s)) : (t = e - s),
                (t *= 8),
                (a = e * 256 + i),
                this.horiFlip[0])
            )
              for (o = 7; o >= 0; o--) {
                if (
                  i >= 0 &&
                  i < 256 &&
                  a >= 0 &&
                  a < 61440 &&
                  this.pixrendered[a] !== 0 &&
                  n.pix[t + o] !== 0
                )
                  return (this.spr0HitX = a % 256), (this.spr0HitY = e), !0;
                i++, a++;
              }
            else
              for (o = 0; o < 8; o++) {
                if (
                  i >= 0 &&
                  i < 256 &&
                  a >= 0 &&
                  a < 61440 &&
                  this.pixrendered[a] !== 0 &&
                  n.pix[t + o] !== 0
                )
                  return (this.spr0HitX = a % 256), (this.spr0HitY = e), !0;
                i++, a++;
              }
        } else if (s <= e && s + 16 > e && i >= -7 && i < 256)
          if (
            (this.vertFlip[0] ? (t = 15 - (e - s)) : (t = e - s),
              t < 8
                ? (n =
                  this.ptTile[
                  this.sprTile[0] + (this.vertFlip[0] ? 1 : 0) + (this.sprTile[0] & 1 ? 255 : 0)
                  ])
                : ((n =
                  this.ptTile[
                  this.sprTile[0] + (this.vertFlip[0] ? 0 : 1) + (this.sprTile[0] & 1 ? 255 : 0)
                  ]),
                  this.vertFlip[0] ? (t = 15 - t) : (t -= 8)),
              (t *= 8),
              (a = e * 256 + i),
              this.horiFlip[0])
          )
            for (o = 7; o >= 0; o--) {
              if (
                i >= 0 &&
                i < 256 &&
                a >= 0 &&
                a < 61440 &&
                this.pixrendered[a] !== 0 &&
                n.pix[t + o] !== 0
              )
                return (this.spr0HitX = a % 256), (this.spr0HitY = e), !0;
              i++, a++;
            }
          else
            for (o = 0; o < 8; o++) {
              if (
                i >= 0 &&
                i < 256 &&
                a >= 0 &&
                a < 61440 &&
                this.pixrendered[a] !== 0 &&
                n.pix[t + o] !== 0
              )
                return (this.spr0HitX = a % 256), (this.spr0HitY = e), !0;
              i++, a++;
            }
        return !1;
      },
      writeMem: function (e, t) {
        (this.vramMem[e] = t),
          e < 8192
            ? ((this.vramMem[e] = t), this.patternWrite(e, t))
            : e >= 8192 && e < 9152
              ? this.nameTableWrite(this.ntable1[0], e - 8192, t)
              : e >= 9152 && e < 9216
                ? this.attribTableWrite(this.ntable1[0], e - 9152, t)
                : e >= 9216 && e < 10176
                  ? this.nameTableWrite(this.ntable1[1], e - 9216, t)
                  : e >= 10176 && e < 10240
                    ? this.attribTableWrite(this.ntable1[1], e - 10176, t)
                    : e >= 10240 && e < 11200
                      ? this.nameTableWrite(this.ntable1[2], e - 10240, t)
                      : e >= 11200 && e < 11264
                        ? this.attribTableWrite(this.ntable1[2], e - 11200, t)
                        : e >= 11264 && e < 12224
                          ? this.nameTableWrite(this.ntable1[3], e - 11264, t)
                          : e >= 12224 && e < 12288
                            ? this.attribTableWrite(this.ntable1[3], e - 12224, t)
                            : e >= 16128 && e < 16160 && this.updatePalettes();
      },
      updatePalettes: function () {
        var e;
        for (e = 0; e < 16; e++)
          this.f_dispType === 0
            ? (this.imgPalette[e] = this.palTable.getEntry(this.vramMem[16128 + e] & 63))
            : (this.imgPalette[e] = this.palTable.getEntry(this.vramMem[16128 + e] & 32));
        for (e = 0; e < 16; e++)
          this.f_dispType === 0
            ? (this.sprPalette[e] = this.palTable.getEntry(this.vramMem[16144 + e] & 63))
            : (this.sprPalette[e] = this.palTable.getEntry(this.vramMem[16144 + e] & 32));
      },
      patternWrite: function (e, t) {
        var r = Math.floor(e / 16),
          i = e % 16;
        i < 8
          ? this.ptTile[r].setScanline(i, t, this.vramMem[e + 8])
          : this.ptTile[r].setScanline(i - 8, this.vramMem[e - 8], t);
      },
      nameTableWrite: function (e, t, r) {
        (this.nameTable[e].tile[t] = r), this.checkSprite0(this.scanline - 20);
      },
      attribTableWrite: function (e, t, r) {
        this.nameTable[e].writeAttrib(t, r);
      },
      spriteRamWriteUpdate: function (e, t) {
        var r = Math.floor(e / 4);
        r === 0 && this.checkSprite0(this.scanline - 20),
          e % 4 === 0
            ? (this.sprY[r] = t)
            : e % 4 === 1
              ? (this.sprTile[r] = t)
              : e % 4 === 2
                ? ((this.vertFlip[r] = (t & 128) !== 0),
                  (this.horiFlip[r] = (t & 64) !== 0),
                  (this.bgPriority[r] = (t & 32) !== 0),
                  (this.sprCol[r] = (t & 3) << 2))
                : e % 4 === 3 && (this.sprX[r] = t);
      },
      doNMI: function () {
        this.setStatusFlag(this.STATUS_VBLANK, !0), this.nes.cpu.requestIrq(this.nes.cpu.IRQ_NMI);
      },
      isPixelWhite: function (e, t) {
        return this.triggerRendering(), this.nes.ppu.buffer[(t << 8) + e] === 16777215;
      },
      JSON_PROPERTIES: [
        "vramMem",
        "spriteMem",
        "cntFV",
        "cntV",
        "cntH",
        "cntVT",
        "cntHT",
        "regFV",
        "regV",
        "regH",
        "regVT",
        "regHT",
        "regFH",
        "regS",
        "vramAddress",
        "vramTmpAddress",
        "f_nmiOnVblank",
        "f_spriteSize",
        "f_bgPatternTable",
        "f_spPatternTable",
        "f_addrInc",
        "f_nTblAddress",
        "f_color",
        "f_spVisibility",
        "f_bgVisibility",
        "f_spClipping",
        "f_bgClipping",
        "f_dispType",
        "vramBufferedReadValue",
        "firstWrite",
        "currentMirroring",
        "vramMirrorTable",
        "ntable1",
        "sramAddress",
        "hitSpr0",
        "sprPalette",
        "imgPalette",
        "curX",
        "scanline",
        "lastRenderedScanline",
        "curNt",
        "scantile",
        "attrib",
        "buffer",
        "bgbuffer",
        "pixrendered",
        "requestEndFrame",
        "nmiOk",
        "dummyCycleToggle",
        "nmiCounter",
        "validTileData",
        "scanlineAlreadyRendered",
      ],
      toJSON: function () {
        var e,
          t = KR.toJSON(this);
        for (t.nameTable = [], e = 0; e < this.nameTable.length; e++)
          t.nameTable[e] = this.nameTable[e].toJSON();
        for (t.ptTile = [], e = 0; e < this.ptTile.length; e++) t.ptTile[e] = this.ptTile[e].toJSON();
        return t;
      },
      fromJSON: function (e) {
        var t;
        for (KR.fromJSON(this, e), t = 0; t < this.nameTable.length; t++)
          this.nameTable[t].fromJSON(e.nameTable[t]);
        for (t = 0; t < this.ptTile.length; t++) this.ptTile[t].fromJSON(e.ptTile[t]);
        for (t = 0; t < this.spriteMem.length; t++) this.spriteRamWriteUpdate(t, this.spriteMem[t]);
      },
    };
    var jR = function (e, t, r) {
      (this.width = e),
        (this.height = t),
        (this.name = r),
        (this.tile = new Array(e * t)),
        (this.attrib = new Array(e * t));
      for (var i = 0; i < e * t; i++) (this.tile[i] = 0), (this.attrib[i] = 0);
    };
    jR.prototype = {
      getTileIndex: function (e, t) {
        return this.tile[t * this.width + e];
      },
      getAttrib: function (e, t) {
        return this.attrib[t * this.width + e];
      },
      writeAttrib: function (e, t) {
        for (var r = (e % 8) * 4, i = Math.floor(e / 8) * 4, s, n, o, a, l = 0; l < 2; l++)
          for (var c = 0; c < 2; c++) {
            s = (t >> (2 * (l * 2 + c))) & 3;
            for (var u = 0; u < 2; u++)
              for (var p = 0; p < 2; p++)
                (n = r + c * 2 + p),
                  (o = i + l * 2 + u),
                  (a = o * this.width + n),
                  (this.attrib[a] = (s << 2) & 12);
          }
      },
      toJSON: function () {
        return { tile: this.tile, attrib: this.attrib };
      },
      fromJSON: function (e) {
        (this.tile = e.tile), (this.attrib = e.attrib);
      },
    };
    var ev = function () {
      (this.curTable = new Array(64)), (this.emphTable = new Array(8)), (this.currentEmph = -1);
    };
    ev.prototype = {
      reset: function () {
        this.setEmphasis(0);
      },
      loadNTSCPalette: function () {
        (this.curTable = [
          5395026, 11796480, 10485760, 11599933, 7602281, 91, 95, 6208, 12048, 543240, 26368, 1196544,
          7153664, 0, 0, 0, 12899815, 16728064, 14421538, 16729963, 14090399, 6818519, 6588, 21681, 27227,
          35843, 43776, 2918400, 10777088, 0, 0, 0, 16316664, 16755516, 16742785, 16735173, 16730354,
          14633471, 4681215, 46327, 57599, 58229, 259115, 7911470, 15065624, 7895160, 0, 0, 16777215,
          16773822, 16300216, 16300248, 16758527, 16761855, 13095423, 10148607, 8973816, 8650717, 12122296,
          16119980, 16777136, 16308472, 0, 0,
        ]),
          this.makeTables(),
          this.setEmphasis(0);
      },
      loadPALPalette: function () {
        (this.curTable = [
          5395026, 11796480, 10485760, 11599933, 7602281, 91, 95, 6208, 12048, 543240, 26368, 1196544,
          7153664, 0, 0, 0, 12899815, 16728064, 14421538, 16729963, 14090399, 6818519, 6588, 21681, 27227,
          35843, 43776, 2918400, 10777088, 0, 0, 0, 16316664, 16755516, 16742785, 16735173, 16730354,
          14633471, 4681215, 46327, 57599, 58229, 259115, 7911470, 15065624, 7895160, 0, 0, 16777215,
          16773822, 16300216, 16300248, 16758527, 16761855, 13095423, 10148607, 8973816, 8650717, 12122296,
          16119980, 16777136, 16308472, 0, 0,
        ]),
          this.makeTables(),
          this.setEmphasis(0);
      },
      makeTables: function () {
        for (var e, t, r, i, s, n, o, a, l = 0; l < 8; l++)
          for (
            n = 1,
            o = 1,
            a = 1,
            l & 1 && ((n = 0.75), (a = 0.75)),
            l & 2 && ((n = 0.75), (o = 0.75)),
            l & 4 && ((o = 0.75), (a = 0.75)),
            this.emphTable[l] = new Array(64),
            s = 0;
            s < 64;
            s++
          )
            (i = this.curTable[s]),
              (e = Math.floor(this.getRed(i) * n)),
              (t = Math.floor(this.getGreen(i) * o)),
              (r = Math.floor(this.getBlue(i) * a)),
              (this.emphTable[l][s] = this.getRgb(e, t, r));
      },
      setEmphasis: function (e) {
        if (e !== this.currentEmph) {
          this.currentEmph = e;
          for (var t = 0; t < 64; t++) this.curTable[t] = this.emphTable[e][t];
        }
      },
      getEntry: function (e) {
        return this.curTable[e];
      },
      getRed: function (e) {
        return (e >> 16) & 255;
      },
      getGreen: function (e) {
        return (e >> 8) & 255;
      },
      getBlue: function (e) {
        return e & 255;
      },
      getRgb: function (e, t, r) {
        return (e << 16) | (t << 8) | r;
      },
      loadDefaultPalette: function () {
        (this.curTable[0] = this.getRgb(117, 117, 117)),
          (this.curTable[1] = this.getRgb(39, 27, 143)),
          (this.curTable[2] = this.getRgb(0, 0, 171)),
          (this.curTable[3] = this.getRgb(71, 0, 159)),
          (this.curTable[4] = this.getRgb(143, 0, 119)),
          (this.curTable[5] = this.getRgb(171, 0, 19)),
          (this.curTable[6] = this.getRgb(167, 0, 0)),
          (this.curTable[7] = this.getRgb(127, 11, 0)),
          (this.curTable[8] = this.getRgb(67, 47, 0)),
          (this.curTable[9] = this.getRgb(0, 71, 0)),
          (this.curTable[10] = this.getRgb(0, 81, 0)),
          (this.curTable[11] = this.getRgb(0, 63, 23)),
          (this.curTable[12] = this.getRgb(27, 63, 95)),
          (this.curTable[13] = this.getRgb(0, 0, 0)),
          (this.curTable[14] = this.getRgb(0, 0, 0)),
          (this.curTable[15] = this.getRgb(0, 0, 0)),
          (this.curTable[16] = this.getRgb(188, 188, 188)),
          (this.curTable[17] = this.getRgb(0, 115, 239)),
          (this.curTable[18] = this.getRgb(35, 59, 239)),
          (this.curTable[19] = this.getRgb(131, 0, 243)),
          (this.curTable[20] = this.getRgb(191, 0, 191)),
          (this.curTable[21] = this.getRgb(231, 0, 91)),
          (this.curTable[22] = this.getRgb(219, 43, 0)),
          (this.curTable[23] = this.getRgb(203, 79, 15)),
          (this.curTable[24] = this.getRgb(139, 115, 0)),
          (this.curTable[25] = this.getRgb(0, 151, 0)),
          (this.curTable[26] = this.getRgb(0, 171, 0)),
          (this.curTable[27] = this.getRgb(0, 147, 59)),
          (this.curTable[28] = this.getRgb(0, 131, 139)),
          (this.curTable[29] = this.getRgb(0, 0, 0)),
          (this.curTable[30] = this.getRgb(0, 0, 0)),
          (this.curTable[31] = this.getRgb(0, 0, 0)),
          (this.curTable[32] = this.getRgb(255, 255, 255)),
          (this.curTable[33] = this.getRgb(63, 191, 255)),
          (this.curTable[34] = this.getRgb(95, 151, 255)),
          (this.curTable[35] = this.getRgb(167, 139, 253)),
          (this.curTable[36] = this.getRgb(247, 123, 255)),
          (this.curTable[37] = this.getRgb(255, 119, 183)),
          (this.curTable[38] = this.getRgb(255, 119, 99)),
          (this.curTable[39] = this.getRgb(255, 155, 59)),
          (this.curTable[40] = this.getRgb(243, 191, 63)),
          (this.curTable[41] = this.getRgb(131, 211, 19)),
          (this.curTable[42] = this.getRgb(79, 223, 75)),
          (this.curTable[43] = this.getRgb(88, 248, 152)),
          (this.curTable[44] = this.getRgb(0, 235, 219)),
          (this.curTable[45] = this.getRgb(0, 0, 0)),
          (this.curTable[46] = this.getRgb(0, 0, 0)),
          (this.curTable[47] = this.getRgb(0, 0, 0)),
          (this.curTable[48] = this.getRgb(255, 255, 255)),
          (this.curTable[49] = this.getRgb(171, 231, 255)),
          (this.curTable[50] = this.getRgb(199, 215, 255)),
          (this.curTable[51] = this.getRgb(215, 203, 255)),
          (this.curTable[52] = this.getRgb(255, 199, 255)),
          (this.curTable[53] = this.getRgb(255, 199, 219)),
          (this.curTable[54] = this.getRgb(255, 191, 179)),
          (this.curTable[55] = this.getRgb(255, 219, 171)),
          (this.curTable[56] = this.getRgb(255, 231, 163)),
          (this.curTable[57] = this.getRgb(227, 255, 163)),
          (this.curTable[58] = this.getRgb(171, 243, 191)),
          (this.curTable[59] = this.getRgb(179, 255, 207)),
          (this.curTable[60] = this.getRgb(159, 255, 243)),
          (this.curTable[61] = this.getRgb(0, 0, 0)),
          (this.curTable[62] = this.getRgb(0, 0, 0)),
          (this.curTable[63] = this.getRgb(0, 0, 0)),
          this.makeTables(),
          this.setEmphasis(0);
      },
    };
    tv.exports = YR;
  });
  var lv = f((xW, av) => {
    var vM = 17897725e-1,
      iv = function (e) {
        (this.nes = e),
          (this.square1 = new Qa(this, !0)),
          (this.square2 = new Qa(this, !1)),
          (this.triangle = new ov(this)),
          (this.noise = new nv(this)),
          (this.dmc = new sv(this)),
          (this.frameIrqCounter = null),
          (this.frameIrqCounterMax = 4),
          (this.initCounter = 2048),
          (this.channelEnableValue = null),
          (this.sampleRate = 44100),
          (this.lengthLookup = null),
          (this.dmcFreqLookup = null),
          (this.noiseWavelengthLookup = null),
          (this.square_table = null),
          (this.tnd_table = null),
          (this.frameIrqEnabled = !1),
          (this.frameIrqActive = null),
          (this.frameClockNow = null),
          (this.startedPlaying = !1),
          (this.recordOutput = !1),
          (this.initingHardware = !1),
          (this.masterFrameCounter = null),
          (this.derivedFrameCounter = null),
          (this.countSequence = null),
          (this.sampleTimer = null),
          (this.frameTime = null),
          (this.sampleTimerMax = null),
          (this.sampleCount = null),
          (this.triValue = 0),
          (this.smpSquare1 = null),
          (this.smpSquare2 = null),
          (this.smpTriangle = null),
          (this.smpDmc = null),
          (this.accCount = null),
          (this.prevSampleL = 0),
          (this.prevSampleR = 0),
          (this.smpAccumL = 0),
          (this.smpAccumR = 0),
          (this.dacRange = 0),
          (this.dcValue = 0),
          (this.masterVolume = 256),
          (this.stereoPosLSquare1 = null),
          (this.stereoPosLSquare2 = null),
          (this.stereoPosLTriangle = null),
          (this.stereoPosLNoise = null),
          (this.stereoPosLDMC = null),
          (this.stereoPosRSquare1 = null),
          (this.stereoPosRSquare2 = null),
          (this.stereoPosRTriangle = null),
          (this.stereoPosRNoise = null),
          (this.stereoPosRDMC = null),
          (this.extraCycles = null),
          (this.maxSample = null),
          (this.minSample = null),
          (this.panning = [80, 170, 100, 150, 128]),
          this.setPanning(this.panning),
          this.initLengthLookup(),
          this.initDmcFrequencyLookup(),
          this.initNoiseWavelengthLookup(),
          this.initDACtables();
        for (var t = 0; t < 20; t++) t === 16 ? this.writeReg(16400, 16) : this.writeReg(16384 + t, 0);
        this.reset();
      };
    iv.prototype = {
      reset: function () {
        (this.sampleRate = this.nes.opts.sampleRate),
          (this.sampleTimerMax = Math.floor(
            (1024 * vM * this.nes.opts.preferredFrameRate) / (this.sampleRate * 60)
          )),
          (this.frameTime = Math.floor((14915 * this.nes.opts.preferredFrameRate) / 60)),
          (this.sampleTimer = 0),
          this.updateChannelEnable(0),
          (this.masterFrameCounter = 0),
          (this.derivedFrameCounter = 0),
          (this.countSequence = 0),
          (this.sampleCount = 0),
          (this.initCounter = 2048),
          (this.frameIrqEnabled = !1),
          (this.initingHardware = !1),
          this.resetCounter(),
          this.square1.reset(),
          this.square2.reset(),
          this.triangle.reset(),
          this.noise.reset(),
          this.dmc.reset(),
          (this.accCount = 0),
          (this.smpSquare1 = 0),
          (this.smpSquare2 = 0),
          (this.smpTriangle = 0),
          (this.smpDmc = 0),
          (this.frameIrqEnabled = !1),
          (this.frameIrqCounterMax = 4),
          (this.channelEnableValue = 255),
          (this.startedPlaying = !1),
          (this.prevSampleL = 0),
          (this.prevSampleR = 0),
          (this.smpAccumL = 0),
          (this.smpAccumR = 0),
          (this.maxSample = -5e5),
          (this.minSample = 5e5);
      },
      readReg: function (e) {
        var t = 0;
        return (
          (t |= this.square1.getLengthStatus()),
          (t |= this.square2.getLengthStatus() << 1),
          (t |= this.triangle.getLengthStatus() << 2),
          (t |= this.noise.getLengthStatus() << 3),
          (t |= this.dmc.getLengthStatus() << 4),
          (t |= (this.frameIrqActive && this.frameIrqEnabled ? 1 : 0) << 6),
          (t |= this.dmc.getIrqStatus() << 7),
          (this.frameIrqActive = !1),
          (this.dmc.irqGenerated = !1),
          t & 65535
        );
      },
      writeReg: function (e, t) {
        e >= 16384 && e < 16388
          ? this.square1.writeReg(e, t)
          : e >= 16388 && e < 16392
            ? this.square2.writeReg(e, t)
            : e >= 16392 && e < 16396
              ? this.triangle.writeReg(e, t)
              : e >= 16396 && e <= 16399
                ? this.noise.writeReg(e, t)
                : e === 16400
                  ? this.dmc.writeReg(e, t)
                  : e === 16401
                    ? this.dmc.writeReg(e, t)
                    : e === 16402
                      ? this.dmc.writeReg(e, t)
                      : e === 16403
                        ? this.dmc.writeReg(e, t)
                        : e === 16405
                          ? (this.updateChannelEnable(t),
                            t !== 0 && this.initCounter > 0 && (this.initingHardware = !0),
                            this.dmc.writeReg(e, t))
                          : e === 16407 &&
                          ((this.countSequence = (t >> 7) & 1),
                            (this.masterFrameCounter = 0),
                            (this.frameIrqActive = !1),
                            (t >> 6) & 1 ? (this.frameIrqEnabled = !1) : (this.frameIrqEnabled = !0),
                            this.countSequence === 0
                              ? ((this.frameIrqCounterMax = 4), (this.derivedFrameCounter = 4))
                              : ((this.frameIrqCounterMax = 5),
                                (this.derivedFrameCounter = 0),
                                this.frameCounterTick()));
      },
      resetCounter: function () {
        this.countSequence === 0 ? (this.derivedFrameCounter = 4) : (this.derivedFrameCounter = 0);
      },
      updateChannelEnable: function (e) {
        (this.channelEnableValue = e & 65535),
          this.square1.setEnabled((e & 1) !== 0),
          this.square2.setEnabled((e & 2) !== 0),
          this.triangle.setEnabled((e & 4) !== 0),
          this.noise.setEnabled((e & 8) !== 0),
          this.dmc.setEnabled((e & 16) !== 0);
      },
      clockFrameCounter: function (e) {
        if (this.initCounter > 0 && this.initingHardware) {
          (this.initCounter -= e), this.initCounter <= 0 && (this.initingHardware = !1);
          return;
        }
        e += this.extraCycles;
        var t = this.sampleTimerMax - this.sampleTimer;
        e << 10 > t
          ? ((this.extraCycles = ((e << 10) - t) >> 10), (e -= this.extraCycles))
          : (this.extraCycles = 0);
        var r = this.dmc,
          i = this.triangle,
          s = this.square1,
          n = this.square2,
          o = this.noise;
        if (r.isEnabled)
          for (r.shiftCounter -= e << 3; r.shiftCounter <= 0 && r.dmaFrequency > 0;)
            (r.shiftCounter += r.dmaFrequency), r.clockDmc();
        if (i.progTimerMax > 0)
          for (i.progTimerCount -= e; i.progTimerCount <= 0;)
            (i.progTimerCount += i.progTimerMax + 1),
              i.linearCounter > 0 &&
              i.lengthCounter > 0 &&
              (i.triangleCounter++,
                (i.triangleCounter &= 31),
                i.isEnabled &&
                (i.triangleCounter >= 16
                  ? (i.sampleValue = i.triangleCounter & 15)
                  : (i.sampleValue = 15 - (i.triangleCounter & 15)),
                  (i.sampleValue <<= 4)));
        (s.progTimerCount -= e),
          s.progTimerCount <= 0 &&
          ((s.progTimerCount += (s.progTimerMax + 1) << 1),
            s.squareCounter++,
            (s.squareCounter &= 7),
            s.updateSampleValue()),
          (n.progTimerCount -= e),
          n.progTimerCount <= 0 &&
          ((n.progTimerCount += (n.progTimerMax + 1) << 1),
            n.squareCounter++,
            (n.squareCounter &= 7),
            n.updateSampleValue());
        var a = e;
        if (o.progTimerCount - a > 0)
          (o.progTimerCount -= a), (o.accCount += a), (o.accValue += a * o.sampleValue);
        else
          for (; a-- > 0;)
            --o.progTimerCount <= 0 &&
              o.progTimerMax > 0 &&
              ((o.shiftReg <<= 1),
                (o.tmp = ((o.shiftReg << (o.randomMode === 0 ? 1 : 6)) ^ o.shiftReg) & 32768),
                o.tmp !== 0
                  ? ((o.shiftReg |= 1), (o.randomBit = 0), (o.sampleValue = 0))
                  : ((o.randomBit = 1),
                    o.isEnabled && o.lengthCounter > 0
                      ? (o.sampleValue = o.masterVolume)
                      : (o.sampleValue = 0)),
                (o.progTimerCount += o.progTimerMax)),
              (o.accValue += o.sampleValue),
              o.accCount++;
        this.frameIrqEnabled && this.frameIrqActive && this.nes.cpu.requestIrq(this.nes.cpu.IRQ_NORMAL),
          (this.masterFrameCounter += e << 1),
          this.masterFrameCounter >= this.frameTime &&
          ((this.masterFrameCounter -= this.frameTime), this.frameCounterTick()),
          this.accSample(e),
          (this.sampleTimer += e << 10),
          this.sampleTimer >= this.sampleTimerMax &&
          (this.sample(), (this.sampleTimer -= this.sampleTimerMax));
      },
      accSample: function (e) {
        this.triangle.sampleCondition &&
          ((this.triValue = Math.floor(
            (this.triangle.progTimerCount << 4) / (this.triangle.progTimerMax + 1)
          )),
            this.triValue > 16 && (this.triValue = 16),
            this.triangle.triangleCounter >= 16 && (this.triValue = 16 - this.triValue),
            (this.triValue += this.triangle.sampleValue)),
          e === 2
            ? ((this.smpTriangle += this.triValue << 1),
              (this.smpDmc += this.dmc.sample << 1),
              (this.smpSquare1 += this.square1.sampleValue << 1),
              (this.smpSquare2 += this.square2.sampleValue << 1),
              (this.accCount += 2))
            : e === 4
              ? ((this.smpTriangle += this.triValue << 2),
                (this.smpDmc += this.dmc.sample << 2),
                (this.smpSquare1 += this.square1.sampleValue << 2),
                (this.smpSquare2 += this.square2.sampleValue << 2),
                (this.accCount += 4))
              : ((this.smpTriangle += e * this.triValue),
                (this.smpDmc += e * this.dmc.sample),
                (this.smpSquare1 += e * this.square1.sampleValue),
                (this.smpSquare2 += e * this.square2.sampleValue),
                (this.accCount += e));
      },
      frameCounterTick: function () {
        this.derivedFrameCounter++,
          this.derivedFrameCounter >= this.frameIrqCounterMax && (this.derivedFrameCounter = 0),
          (this.derivedFrameCounter === 1 || this.derivedFrameCounter === 3) &&
          (this.triangle.clockLengthCounter(),
            this.square1.clockLengthCounter(),
            this.square2.clockLengthCounter(),
            this.noise.clockLengthCounter(),
            this.square1.clockSweep(),
            this.square2.clockSweep()),
          this.derivedFrameCounter >= 0 &&
          this.derivedFrameCounter < 4 &&
          (this.square1.clockEnvDecay(),
            this.square2.clockEnvDecay(),
            this.noise.clockEnvDecay(),
            this.triangle.clockLinearCounter()),
          this.derivedFrameCounter === 3 && this.countSequence === 0 && (this.frameIrqActive = !0);
      },
      sample: function () {
        var e, t;
        this.accCount > 0
          ? ((this.smpSquare1 <<= 4),
            (this.smpSquare1 = Math.floor(this.smpSquare1 / this.accCount)),
            (this.smpSquare2 <<= 4),
            (this.smpSquare2 = Math.floor(this.smpSquare2 / this.accCount)),
            (this.smpTriangle = Math.floor(this.smpTriangle / this.accCount)),
            (this.smpDmc <<= 4),
            (this.smpDmc = Math.floor(this.smpDmc / this.accCount)),
            (this.accCount = 0))
          : ((this.smpSquare1 = this.square1.sampleValue << 4),
            (this.smpSquare2 = this.square2.sampleValue << 4),
            (this.smpTriangle = this.triangle.sampleValue),
            (this.smpDmc = this.dmc.sample << 4));
        var r = Math.floor((this.noise.accValue << 4) / this.noise.accCount);
        (this.noise.accValue = r >> 4),
          (this.noise.accCount = 1),
          (e = (this.smpSquare1 * this.stereoPosLSquare1 + this.smpSquare2 * this.stereoPosLSquare2) >> 8),
          (t =
            (3 * this.smpTriangle * this.stereoPosLTriangle +
              (r << 1) * this.stereoPosLNoise +
              this.smpDmc * this.stereoPosLDMC) >>
            8),
          e >= this.square_table.length && (e = this.square_table.length - 1),
          t >= this.tnd_table.length && (t = this.tnd_table.length - 1);
        var i = this.square_table[e] + this.tnd_table[t] - this.dcValue;
        (e = (this.smpSquare1 * this.stereoPosRSquare1 + this.smpSquare2 * this.stereoPosRSquare2) >> 8),
          (t =
            (3 * this.smpTriangle * this.stereoPosRTriangle +
              (r << 1) * this.stereoPosRNoise +
              this.smpDmc * this.stereoPosRDMC) >>
            8),
          e >= this.square_table.length && (e = this.square_table.length - 1),
          t >= this.tnd_table.length && (t = this.tnd_table.length - 1);
        var s = this.square_table[e] + this.tnd_table[t] - this.dcValue,
          n = i - this.prevSampleL;
        (this.prevSampleL += n), (this.smpAccumL += n - (this.smpAccumL >> 10)), (i = this.smpAccumL);
        var o = s - this.prevSampleR;
        (this.prevSampleR += o),
          (this.smpAccumR += o - (this.smpAccumR >> 10)),
          (s = this.smpAccumR),
          i > this.maxSample && (this.maxSample = i),
          i < this.minSample && (this.minSample = i),
          this.nes.opts.onAudioSample && this.nes.opts.onAudioSample(i / 32768, s / 32768),
          (this.smpSquare1 = 0),
          (this.smpSquare2 = 0),
          (this.smpTriangle = 0),
          (this.smpDmc = 0);
      },
      getLengthMax: function (e) {
        return this.lengthLookup[e >> 3];
      },
      getDmcFrequency: function (e) {
        return e >= 0 && e < 16 ? this.dmcFreqLookup[e] : 0;
      },
      getNoiseWaveLength: function (e) {
        return e >= 0 && e < 16 ? this.noiseWavelengthLookup[e] : 0;
      },
      setPanning: function (e) {
        for (var t = 0; t < 5; t++) this.panning[t] = e[t];
        this.updateStereoPos();
      },
      setMasterVolume: function (e) {
        e < 0 && (e = 0), e > 256 && (e = 256), (this.masterVolume = e), this.updateStereoPos();
      },
      updateStereoPos: function () {
        (this.stereoPosLSquare1 = (this.panning[0] * this.masterVolume) >> 8),
          (this.stereoPosLSquare2 = (this.panning[1] * this.masterVolume) >> 8),
          (this.stereoPosLTriangle = (this.panning[2] * this.masterVolume) >> 8),
          (this.stereoPosLNoise = (this.panning[3] * this.masterVolume) >> 8),
          (this.stereoPosLDMC = (this.panning[4] * this.masterVolume) >> 8),
          (this.stereoPosRSquare1 = this.masterVolume - this.stereoPosLSquare1),
          (this.stereoPosRSquare2 = this.masterVolume - this.stereoPosLSquare2),
          (this.stereoPosRTriangle = this.masterVolume - this.stereoPosLTriangle),
          (this.stereoPosRNoise = this.masterVolume - this.stereoPosLNoise),
          (this.stereoPosRDMC = this.masterVolume - this.stereoPosLDMC);
      },
      initLengthLookup: function () {
        this.lengthLookup = [
          10, 254, 20, 2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14, 12, 16, 24, 18, 48, 20, 96, 22, 192,
          24, 72, 26, 16, 28, 32, 30,
        ];
      },
      initDmcFrequencyLookup: function () {
        (this.dmcFreqLookup = new Array(16)),
          (this.dmcFreqLookup[0] = 3424),
          (this.dmcFreqLookup[1] = 3040),
          (this.dmcFreqLookup[2] = 2720),
          (this.dmcFreqLookup[3] = 2560),
          (this.dmcFreqLookup[4] = 2288),
          (this.dmcFreqLookup[5] = 2032),
          (this.dmcFreqLookup[6] = 1808),
          (this.dmcFreqLookup[7] = 1712),
          (this.dmcFreqLookup[8] = 1520),
          (this.dmcFreqLookup[9] = 1280),
          (this.dmcFreqLookup[10] = 1136),
          (this.dmcFreqLookup[11] = 1024),
          (this.dmcFreqLookup[12] = 848),
          (this.dmcFreqLookup[13] = 672),
          (this.dmcFreqLookup[14] = 576),
          (this.dmcFreqLookup[15] = 432);
      },
      initNoiseWavelengthLookup: function () {
        (this.noiseWavelengthLookup = new Array(16)),
          (this.noiseWavelengthLookup[0] = 4),
          (this.noiseWavelengthLookup[1] = 8),
          (this.noiseWavelengthLookup[2] = 16),
          (this.noiseWavelengthLookup[3] = 32),
          (this.noiseWavelengthLookup[4] = 64),
          (this.noiseWavelengthLookup[5] = 96),
          (this.noiseWavelengthLookup[6] = 128),
          (this.noiseWavelengthLookup[7] = 160),
          (this.noiseWavelengthLookup[8] = 202),
          (this.noiseWavelengthLookup[9] = 254),
          (this.noiseWavelengthLookup[10] = 380),
          (this.noiseWavelengthLookup[11] = 508),
          (this.noiseWavelengthLookup[12] = 762),
          (this.noiseWavelengthLookup[13] = 1016),
          (this.noiseWavelengthLookup[14] = 2034),
          (this.noiseWavelengthLookup[15] = 4068);
      },
      initDACtables: function () {
        var e,
          t,
          r,
          i = 0,
          s = 0;
        for (
          this.square_table = new Array(32 * 16), this.tnd_table = new Array(204 * 16), r = 0;
          r < 32 * 16;
          r++
        )
          (e = 95.52 / (8128 / (r / 16) + 100)),
            (e *= 0.98411),
            (e *= 5e4),
            (t = Math.floor(e)),
            (this.square_table[r] = t),
            t > i && (i = t);
        for (r = 0; r < 204 * 16; r++)
          (e = 163.67 / (24329 / (r / 16) + 100)),
            (e *= 0.98411),
            (e *= 5e4),
            (t = Math.floor(e)),
            (this.tnd_table[r] = t),
            t > s && (s = t);
        (this.dacRange = i + s), (this.dcValue = this.dacRange / 2);
      },
    };
    var sv = function (e) {
      (this.papu = e),
        (this.MODE_NORMAL = 0),
        (this.MODE_LOOP = 1),
        (this.MODE_IRQ = 2),
        (this.isEnabled = null),
        (this.hasSample = null),
        (this.irqGenerated = !1),
        (this.playMode = null),
        (this.dmaFrequency = null),
        (this.dmaCounter = null),
        (this.deltaCounter = null),
        (this.playStartAddress = null),
        (this.playAddress = null),
        (this.playLength = null),
        (this.playLengthCounter = null),
        (this.shiftCounter = null),
        (this.reg4012 = null),
        (this.reg4013 = null),
        (this.sample = null),
        (this.dacLsb = null),
        (this.data = null),
        this.reset();
    };
    sv.prototype = {
      clockDmc: function () {
        this.hasSample &&
          (this.data & 1
            ? this.deltaCounter < 63 && this.deltaCounter++
            : this.deltaCounter > 0 && this.deltaCounter--,
            (this.sample = this.isEnabled ? (this.deltaCounter << 1) + this.dacLsb : 0),
            (this.data >>= 1)),
          this.dmaCounter--,
          this.dmaCounter <= 0 && ((this.hasSample = !1), this.endOfSample(), (this.dmaCounter = 8)),
          this.irqGenerated && this.papu.nes.cpu.requestIrq(this.papu.nes.cpu.IRQ_NORMAL);
      },
      endOfSample: function () {
        this.playLengthCounter === 0 &&
          this.playMode === this.MODE_LOOP &&
          ((this.playAddress = this.playStartAddress), (this.playLengthCounter = this.playLength)),
          this.playLengthCounter > 0 &&
          (this.nextSample(),
            this.playLengthCounter === 0 && this.playMode === this.MODE_IRQ && (this.irqGenerated = !0));
      },
      nextSample: function () {
        (this.data = this.papu.nes.mmap.load(this.playAddress)),
          this.papu.nes.cpu.haltCycles(4),
          this.playLengthCounter--,
          this.playAddress++,
          this.playAddress > 65535 && (this.playAddress = 32768),
          (this.hasSample = !0);
      },
      writeReg: function (e, t) {
        e === 16400
          ? (t >> 6
            ? ((t >> 6) & 1) === 1
              ? (this.playMode = this.MODE_LOOP)
              : t >> 6 === 2 && (this.playMode = this.MODE_IRQ)
            : (this.playMode = this.MODE_NORMAL),
            t & 128 || (this.irqGenerated = !1),
            (this.dmaFrequency = this.papu.getDmcFrequency(t & 15)))
          : e === 16401
            ? ((this.deltaCounter = (t >> 1) & 63),
              (this.dacLsb = t & 1),
              (this.sample = (this.deltaCounter << 1) + this.dacLsb))
            : e === 16402
              ? ((this.playStartAddress = (t << 6) | 49152),
                (this.playAddress = this.playStartAddress),
                (this.reg4012 = t))
              : e === 16403
                ? ((this.playLength = (t << 4) + 1),
                  (this.playLengthCounter = this.playLength),
                  (this.reg4013 = t))
                : e === 16405 &&
                ((t >> 4) & 1
                  ? ((this.playAddress = this.playStartAddress),
                    (this.playLengthCounter = this.playLength))
                  : (this.playLengthCounter = 0),
                  (this.irqGenerated = !1));
      },
      setEnabled: function (e) {
        !this.isEnabled && e && (this.playLengthCounter = this.playLength), (this.isEnabled = e);
      },
      getLengthStatus: function () {
        return this.playLengthCounter === 0 || !this.isEnabled ? 0 : 1;
      },
      getIrqStatus: function () {
        return this.irqGenerated ? 1 : 0;
      },
      reset: function () {
        (this.isEnabled = !1),
          (this.irqGenerated = !1),
          (this.playMode = this.MODE_NORMAL),
          (this.dmaFrequency = 0),
          (this.dmaCounter = 0),
          (this.deltaCounter = 0),
          (this.playStartAddress = 0),
          (this.playAddress = 0),
          (this.playLength = 0),
          (this.playLengthCounter = 0),
          (this.sample = 0),
          (this.dacLsb = 0),
          (this.shiftCounter = 0),
          (this.reg4012 = 0),
          (this.reg4013 = 0),
          (this.data = 0);
      },
    };
    var nv = function (e) {
      (this.papu = e),
        (this.isEnabled = null),
        (this.envDecayDisable = null),
        (this.envDecayLoopEnable = null),
        (this.lengthCounterEnable = null),
        (this.envReset = null),
        (this.shiftNow = null),
        (this.lengthCounter = null),
        (this.progTimerCount = null),
        (this.progTimerMax = null),
        (this.envDecayRate = null),
        (this.envDecayCounter = null),
        (this.envVolume = null),
        (this.masterVolume = null),
        (this.shiftReg = 1 << 14),
        (this.randomBit = null),
        (this.randomMode = null),
        (this.sampleValue = null),
        (this.accValue = 0),
        (this.accCount = 1),
        (this.tmp = null),
        this.reset();
    };
    nv.prototype = {
      reset: function () {
        (this.progTimerCount = 0),
          (this.progTimerMax = 0),
          (this.isEnabled = !1),
          (this.lengthCounter = 0),
          (this.lengthCounterEnable = !1),
          (this.envDecayDisable = !1),
          (this.envDecayLoopEnable = !1),
          (this.shiftNow = !1),
          (this.envDecayRate = 0),
          (this.envDecayCounter = 0),
          (this.envVolume = 0),
          (this.masterVolume = 0),
          (this.shiftReg = 1),
          (this.randomBit = 0),
          (this.randomMode = 0),
          (this.sampleValue = 0),
          (this.tmp = 0);
      },
      clockLengthCounter: function () {
        this.lengthCounterEnable &&
          this.lengthCounter > 0 &&
          (this.lengthCounter--, this.lengthCounter === 0 && this.updateSampleValue());
      },
      clockEnvDecay: function () {
        this.envReset
          ? ((this.envReset = !1), (this.envDecayCounter = this.envDecayRate + 1), (this.envVolume = 15))
          : --this.envDecayCounter <= 0 &&
          ((this.envDecayCounter = this.envDecayRate + 1),
            this.envVolume > 0 ? this.envVolume-- : (this.envVolume = this.envDecayLoopEnable ? 15 : 0)),
          this.envDecayDisable
            ? (this.masterVolume = this.envDecayRate)
            : (this.masterVolume = this.envVolume),
          this.updateSampleValue();
      },
      updateSampleValue: function () {
        this.isEnabled && this.lengthCounter > 0 && (this.sampleValue = this.randomBit * this.masterVolume);
      },
      writeReg: function (e, t) {
        e === 16396
          ? ((this.envDecayDisable = (t & 16) !== 0),
            (this.envDecayRate = t & 15),
            (this.envDecayLoopEnable = (t & 32) !== 0),
            (this.lengthCounterEnable = (t & 32) === 0),
            this.envDecayDisable
              ? (this.masterVolume = this.envDecayRate)
              : (this.masterVolume = this.envVolume))
          : e === 16398
            ? ((this.progTimerMax = this.papu.getNoiseWaveLength(t & 15)), (this.randomMode = t >> 7))
            : e === 16399 && ((this.lengthCounter = this.papu.getLengthMax(t & 248)), (this.envReset = !0));
      },
      setEnabled: function (e) {
        (this.isEnabled = e), e || (this.lengthCounter = 0), this.updateSampleValue();
      },
      getLengthStatus: function () {
        return this.lengthCounter === 0 || !this.isEnabled ? 0 : 1;
      },
    };
    var Qa = function (e, t) {
      (this.papu = e),
        (this.dutyLookup = [
          0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1,
        ]),
        (this.impLookup = [
          1, -1, 0, 0, 0, 0, 0, 0, 1, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 0, -1, 0, 1, 0, 0, 0, 0, 0,
        ]),
        (this.sqr1 = t),
        (this.isEnabled = null),
        (this.lengthCounterEnable = null),
        (this.sweepActive = null),
        (this.envDecayDisable = null),
        (this.envDecayLoopEnable = null),
        (this.envReset = null),
        (this.sweepCarry = null),
        (this.updateSweepPeriod = null),
        (this.progTimerCount = null),
        (this.progTimerMax = null),
        (this.lengthCounter = null),
        (this.squareCounter = null),
        (this.sweepCounter = null),
        (this.sweepCounterMax = null),
        (this.sweepMode = null),
        (this.sweepShiftAmount = null),
        (this.envDecayRate = null),
        (this.envDecayCounter = null),
        (this.envVolume = null),
        (this.masterVolume = null),
        (this.dutyMode = null),
        (this.sweepResult = null),
        (this.sampleValue = null),
        (this.vol = null),
        this.reset();
    };
    Qa.prototype = {
      reset: function () {
        (this.progTimerCount = 0),
          (this.progTimerMax = 0),
          (this.lengthCounter = 0),
          (this.squareCounter = 0),
          (this.sweepCounter = 0),
          (this.sweepCounterMax = 0),
          (this.sweepMode = 0),
          (this.sweepShiftAmount = 0),
          (this.envDecayRate = 0),
          (this.envDecayCounter = 0),
          (this.envVolume = 0),
          (this.masterVolume = 0),
          (this.dutyMode = 0),
          (this.vol = 0),
          (this.isEnabled = !1),
          (this.lengthCounterEnable = !1),
          (this.sweepActive = !1),
          (this.sweepCarry = !1),
          (this.envDecayDisable = !1),
          (this.envDecayLoopEnable = !1);
      },
      clockLengthCounter: function () {
        this.lengthCounterEnable &&
          this.lengthCounter > 0 &&
          (this.lengthCounter--, this.lengthCounter === 0 && this.updateSampleValue());
      },
      clockEnvDecay: function () {
        this.envReset
          ? ((this.envReset = !1), (this.envDecayCounter = this.envDecayRate + 1), (this.envVolume = 15))
          : --this.envDecayCounter <= 0 &&
          ((this.envDecayCounter = this.envDecayRate + 1),
            this.envVolume > 0 ? this.envVolume-- : (this.envVolume = this.envDecayLoopEnable ? 15 : 0)),
          this.envDecayDisable
            ? (this.masterVolume = this.envDecayRate)
            : (this.masterVolume = this.envVolume),
          this.updateSampleValue();
      },
      clockSweep: function () {
        --this.sweepCounter <= 0 &&
          ((this.sweepCounter = this.sweepCounterMax + 1),
            this.sweepActive &&
            this.sweepShiftAmount > 0 &&
            this.progTimerMax > 7 &&
            ((this.sweepCarry = !1),
              this.sweepMode === 0
                ? ((this.progTimerMax += this.progTimerMax >> this.sweepShiftAmount),
                  this.progTimerMax > 4095 && ((this.progTimerMax = 4095), (this.sweepCarry = !0)))
                : (this.progTimerMax =
                  this.progTimerMax -
                  ((this.progTimerMax >> this.sweepShiftAmount) - (this.sqr1 ? 1 : 0))))),
          this.updateSweepPeriod &&
          ((this.updateSweepPeriod = !1), (this.sweepCounter = this.sweepCounterMax + 1));
      },
      updateSampleValue: function () {
        this.isEnabled && this.lengthCounter > 0 && this.progTimerMax > 7
          ? this.sweepMode === 0 && this.progTimerMax + (this.progTimerMax >> this.sweepShiftAmount) > 4095
            ? (this.sampleValue = 0)
            : (this.sampleValue =
              this.masterVolume * this.dutyLookup[(this.dutyMode << 3) + this.squareCounter])
          : (this.sampleValue = 0);
      },
      writeReg: function (e, t) {
        var r = this.sqr1 ? 0 : 4;
        e === 16384 + r
          ? ((this.envDecayDisable = (t & 16) !== 0),
            (this.envDecayRate = t & 15),
            (this.envDecayLoopEnable = (t & 32) !== 0),
            (this.dutyMode = (t >> 6) & 3),
            (this.lengthCounterEnable = (t & 32) === 0),
            this.envDecayDisable
              ? (this.masterVolume = this.envDecayRate)
              : (this.masterVolume = this.envVolume),
            this.updateSampleValue())
          : e === 16385 + r
            ? ((this.sweepActive = (t & 128) !== 0),
              (this.sweepCounterMax = (t >> 4) & 7),
              (this.sweepMode = (t >> 3) & 1),
              (this.sweepShiftAmount = t & 7),
              (this.updateSweepPeriod = !0))
            : e === 16386 + r
              ? ((this.progTimerMax &= 1792), (this.progTimerMax |= t))
              : e === 16387 + r &&
              ((this.progTimerMax &= 255),
                (this.progTimerMax |= (t & 7) << 8),
                this.isEnabled && (this.lengthCounter = this.papu.getLengthMax(t & 248)),
                (this.envReset = !0));
      },
      setEnabled: function (e) {
        (this.isEnabled = e), e || (this.lengthCounter = 0), this.updateSampleValue();
      },
      getLengthStatus: function () {
        return this.lengthCounter === 0 || !this.isEnabled ? 0 : 1;
      },
    };
    var ov = function (e) {
      (this.papu = e),
        (this.isEnabled = null),
        (this.sampleCondition = null),
        (this.lengthCounterEnable = null),
        (this.lcHalt = null),
        (this.lcControl = null),
        (this.progTimerCount = null),
        (this.progTimerMax = null),
        (this.triangleCounter = null),
        (this.lengthCounter = null),
        (this.linearCounter = null),
        (this.lcLoadValue = null),
        (this.sampleValue = null),
        (this.tmp = null),
        this.reset();
    };
    ov.prototype = {
      reset: function () {
        (this.progTimerCount = 0),
          (this.progTimerMax = 0),
          (this.triangleCounter = 0),
          (this.isEnabled = !1),
          (this.sampleCondition = !1),
          (this.lengthCounter = 0),
          (this.lengthCounterEnable = !1),
          (this.linearCounter = 0),
          (this.lcLoadValue = 0),
          (this.lcHalt = !0),
          (this.lcControl = !1),
          (this.tmp = 0),
          (this.sampleValue = 15);
      },
      clockLengthCounter: function () {
        this.lengthCounterEnable &&
          this.lengthCounter > 0 &&
          (this.lengthCounter--, this.lengthCounter === 0 && this.updateSampleCondition());
      },
      clockLinearCounter: function () {
        this.lcHalt
          ? ((this.linearCounter = this.lcLoadValue), this.updateSampleCondition())
          : this.linearCounter > 0 && (this.linearCounter--, this.updateSampleCondition()),
          this.lcControl || (this.lcHalt = !1);
      },
      getLengthStatus: function () {
        return this.lengthCounter === 0 || !this.isEnabled ? 0 : 1;
      },
      readReg: function (e) {
        return 0;
      },
      writeReg: function (e, t) {
        e === 16392
          ? ((this.lcControl = (t & 128) !== 0),
            (this.lcLoadValue = t & 127),
            (this.lengthCounterEnable = !this.lcControl))
          : e === 16394
            ? ((this.progTimerMax &= 1792), (this.progTimerMax |= t))
            : e === 16395 &&
            ((this.progTimerMax &= 255),
              (this.progTimerMax |= (t & 7) << 8),
              (this.lengthCounter = this.papu.getLengthMax(t & 248)),
              (this.lcHalt = !0)),
          this.updateSampleCondition();
      },
      clockProgrammableTimer: function (e) {
        if (this.progTimerMax > 0)
          for (this.progTimerCount += e; this.progTimerMax > 0 && this.progTimerCount >= this.progTimerMax;)
            (this.progTimerCount -= this.progTimerMax),
              this.isEnabled &&
              this.lengthCounter > 0 &&
              this.linearCounter > 0 &&
              this.clockTriangleGenerator();
      },
      clockTriangleGenerator: function () {
        this.triangleCounter++, (this.triangleCounter &= 31);
      },
      setEnabled: function (e) {
        (this.isEnabled = e), e || (this.lengthCounter = 0), this.updateSampleCondition();
      },
      updateSampleCondition: function () {
        this.sampleCondition =
          this.isEnabled && this.progTimerMax > 7 && this.linearCounter > 0 && this.lengthCounter > 0;
      },
    };
    av.exports = iv;
  });
  var hv = f((yW, cv) => {
    var gt = Es(),
      v = {};
    v[0] = function (e) {
      this.nes = e;
    };
    v[0].prototype = {
      reset: function () {
        (this.joy1StrobeState = 0),
          (this.joy2StrobeState = 0),
          (this.joypadLastWrite = 0),
          (this.zapperFired = !1),
          (this.zapperX = null),
          (this.zapperY = null);
      },
      write: function (e, t) {
        e < 8192
          ? (this.nes.cpu.mem[e & 2047] = t)
          : e > 16407
            ? ((this.nes.cpu.mem[e] = t), e >= 24576 && e < 32768 && this.nes.opts.onBatteryRamWrite(e, t))
            : e > 8199 && e < 16384
              ? this.regWrite(8192 + (e & 7), t)
              : this.regWrite(e, t);
      },
      writelow: function (e, t) {
        e < 8192
          ? (this.nes.cpu.mem[e & 2047] = t)
          : e > 16407
            ? (this.nes.cpu.mem[e] = t)
            : e > 8199 && e < 16384
              ? this.regWrite(8192 + (e & 7), t)
              : this.regWrite(e, t);
      },
      load: function (e) {
        return (
          (e &= 65535),
          e > 16407 ? this.nes.cpu.mem[e] : e >= 8192 ? this.regLoad(e) : this.nes.cpu.mem[e & 2047]
        );
      },
      regLoad: function (e) {
        switch (e >> 12) {
          case 0:
            break;
          case 1:
            break;
          case 2:
          case 3:
            switch (e & 7) {
              case 0:
                return this.nes.cpu.mem[8192];
              case 1:
                return this.nes.cpu.mem[8193];
              case 2:
                return this.nes.ppu.readStatusRegister();
              case 3:
                return 0;
              case 4:
                return this.nes.ppu.sramLoad();
              case 5:
                return 0;
              case 6:
                return 0;
              case 7:
                return this.nes.ppu.vramLoad();
            }
            break;
          case 4:
            switch (e - 16405) {
              case 0:
                return this.nes.papu.readReg(e);
              case 1:
                return this.joy1Read();
              case 2:
                var t;
                return (
                  this.zapperX !== null &&
                    this.zapperY !== null &&
                    this.nes.ppu.isPixelWhite(this.zapperX, this.zapperY)
                    ? (t = 0)
                    : (t = 1 << 3),
                  this.zapperFired && (t |= 1 << 4),
                  (this.joy2Read() | t) & 65535
                );
            }
            break;
        }
        return 0;
      },
      regWrite: function (e, t) {
        switch (e) {
          case 8192:
            (this.nes.cpu.mem[e] = t), this.nes.ppu.updateControlReg1(t);
            break;
          case 8193:
            (this.nes.cpu.mem[e] = t), this.nes.ppu.updateControlReg2(t);
            break;
          case 8195:
            this.nes.ppu.writeSRAMAddress(t);
            break;
          case 8196:
            this.nes.ppu.sramWrite(t);
            break;
          case 8197:
            this.nes.ppu.scrollWrite(t);
            break;
          case 8198:
            this.nes.ppu.writeVRAMAddress(t);
            break;
          case 8199:
            this.nes.ppu.vramWrite(t);
            break;
          case 16404:
            this.nes.ppu.sramDMA(t);
            break;
          case 16405:
            this.nes.papu.writeReg(e, t);
            break;
          case 16406:
            !(t & 1) &&
              (this.joypadLastWrite & 1) === 1 &&
              ((this.joy1StrobeState = 0), (this.joy2StrobeState = 0)),
              (this.joypadLastWrite = t);
            break;
          case 16407:
            this.nes.papu.writeReg(e, t);
            break;
          default:
            e >= 16384 && e <= 16407 && this.nes.papu.writeReg(e, t);
        }
      },
      joy1Read: function () {
        var e;
        switch (this.joy1StrobeState) {
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
            e = this.nes.controllers[1].state[this.joy1StrobeState];
            break;
          case 8:
          case 9:
          case 10:
          case 11:
          case 12:
          case 13:
          case 14:
          case 15:
          case 16:
          case 17:
          case 18:
            e = 0;
            break;
          case 19:
            e = 1;
            break;
          default:
            e = 0;
        }
        return this.joy1StrobeState++, this.joy1StrobeState === 24 && (this.joy1StrobeState = 0), e;
      },
      joy2Read: function () {
        var e;
        switch (this.joy2StrobeState) {
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
            e = this.nes.controllers[2].state[this.joy2StrobeState];
            break;
          case 8:
          case 9:
          case 10:
          case 11:
          case 12:
          case 13:
          case 14:
          case 15:
          case 16:
          case 17:
          case 18:
            e = 0;
            break;
          case 19:
            e = 1;
            break;
          default:
            e = 0;
        }
        return this.joy2StrobeState++, this.joy2StrobeState === 24 && (this.joy2StrobeState = 0), e;
      },
      loadROM: function () {
        if (!this.nes.rom.valid || this.nes.rom.romCount < 1)
          throw new Error("NoMapper: Invalid ROM! Unable to load.");
        this.loadPRGROM(),
          this.loadCHRROM(),
          this.loadBatteryRam(),
          this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET);
      },
      loadPRGROM: function () {
        this.nes.rom.romCount > 1
          ? (this.loadRomBank(0, 32768), this.loadRomBank(1, 49152))
          : (this.loadRomBank(0, 32768), this.loadRomBank(0, 49152));
      },
      loadCHRROM: function () {
        this.nes.rom.vromCount > 0 &&
          (this.nes.rom.vromCount === 1
            ? (this.loadVromBank(0, 0), this.loadVromBank(0, 4096))
            : (this.loadVromBank(0, 0), this.loadVromBank(1, 4096)));
      },
      loadBatteryRam: function () {
        if (this.nes.rom.batteryRam) {
          var e = this.nes.rom.batteryRam;
          e !== null && e.length === 8192 && gt.copyArrayElements(e, 0, this.nes.cpu.mem, 24576, 8192);
        }
      },
      loadRomBank: function (e, t) {
        (e %= this.nes.rom.romCount), gt.copyArrayElements(this.nes.rom.rom[e], 0, this.nes.cpu.mem, t, 16384);
      },
      loadVromBank: function (e, t) {
        if (this.nes.rom.vromCount !== 0) {
          this.nes.ppu.triggerRendering(),
            gt.copyArrayElements(
              this.nes.rom.vrom[e % this.nes.rom.vromCount],
              0,
              this.nes.ppu.vramMem,
              t,
              4096
            );
          var r = this.nes.rom.vromTile[e % this.nes.rom.vromCount];
          gt.copyArrayElements(r, 0, this.nes.ppu.ptTile, t >> 4, 256);
        }
      },
      load32kRomBank: function (e, t) {
        this.loadRomBank((e * 2) % this.nes.rom.romCount, t),
          this.loadRomBank((e * 2 + 1) % this.nes.rom.romCount, t + 16384);
      },
      load8kVromBank: function (e, t) {
        this.nes.rom.vromCount !== 0 &&
          (this.nes.ppu.triggerRendering(),
            this.loadVromBank(e % this.nes.rom.vromCount, t),
            this.loadVromBank((e + 1) % this.nes.rom.vromCount, t + 4096));
      },
      load1kVromBank: function (e, t) {
        if (this.nes.rom.vromCount !== 0) {
          this.nes.ppu.triggerRendering();
          var r = Math.floor(e / 4) % this.nes.rom.vromCount,
            i = (e % 4) * 1024;
          gt.copyArrayElements(this.nes.rom.vrom[r], i, this.nes.ppu.vramMem, t, 1024);
          for (var s = this.nes.rom.vromTile[r], n = t >> 4, o = 0; o < 64; o++)
            this.nes.ppu.ptTile[n + o] = s[(e % 4 << 6) + o];
        }
      },
      load2kVromBank: function (e, t) {
        if (this.nes.rom.vromCount !== 0) {
          this.nes.ppu.triggerRendering();
          var r = Math.floor(e / 2) % this.nes.rom.vromCount,
            i = (e % 2) * 2048;
          gt.copyArrayElements(this.nes.rom.vrom[r], i, this.nes.ppu.vramMem, t, 2048);
          for (var s = this.nes.rom.vromTile[r], n = t >> 4, o = 0; o < 128; o++)
            this.nes.ppu.ptTile[n + o] = s[(e % 2 << 7) + o];
        }
      },
      load8kRomBank: function (e, t) {
        var r = Math.floor(e / 2) % this.nes.rom.romCount,
          i = (e % 2) * 8192;
        gt.copyArrayElements(this.nes.rom.rom[r], i, this.nes.cpu.mem, t, 8192);
      },
      clockIrqCounter: function () { },
      latchAccess: function (e) { },
      toJSON: function () {
        return {
          joy1StrobeState: this.joy1StrobeState,
          joy2StrobeState: this.joy2StrobeState,
          joypadLastWrite: this.joypadLastWrite,
        };
      },
      fromJSON: function (e) {
        (this.joy1StrobeState = e.joy1StrobeState),
          (this.joy2StrobeState = e.joy2StrobeState),
          (this.joypadLastWrite = e.joypadLastWrite);
      },
    };
    v[1] = function (e) {
      this.nes = e;
    };
    v[1].prototype = new v[0]();
    v[1].prototype.reset = function () {
      v[0].prototype.reset.apply(this),
        (this.regBuffer = 0),
        (this.regBufferCounter = 0),
        (this.mirroring = 0),
        (this.oneScreenMirroring = 0),
        (this.prgSwitchingArea = 1),
        (this.prgSwitchingSize = 1),
        (this.vromSwitchingSize = 0),
        (this.romSelectionReg0 = 0),
        (this.romSelectionReg1 = 0),
        (this.romBankSelect = 0);
    };
    v[1].prototype.write = function (e, t) {
      if (e < 32768) {
        v[0].prototype.write.apply(this, arguments);
        return;
      }
      t & 128
        ? ((this.regBufferCounter = 0),
          (this.regBuffer = 0),
          this.getRegNumber(e) === 0 && ((this.prgSwitchingArea = 1), (this.prgSwitchingSize = 1)))
        : ((this.regBuffer =
          (this.regBuffer & (255 - (1 << this.regBufferCounter))) | ((t & 1) << this.regBufferCounter)),
          this.regBufferCounter++,
          this.regBufferCounter === 5 &&
          (this.setReg(this.getRegNumber(e), this.regBuffer),
            (this.regBuffer = 0),
            (this.regBufferCounter = 0)));
    };
    v[1].prototype.setReg = function (e, t) {
      var r;
      switch (e) {
        case 0:
          (r = t & 3),
            r !== this.mirroring &&
            ((this.mirroring = r),
              this.mirroring & 2
                ? this.mirroring & 1
                  ? this.nes.ppu.setMirroring(this.nes.rom.HORIZONTAL_MIRRORING)
                  : this.nes.ppu.setMirroring(this.nes.rom.VERTICAL_MIRRORING)
                : this.nes.ppu.setMirroring(this.nes.rom.SINGLESCREEN_MIRRORING)),
            (this.prgSwitchingArea = (t >> 2) & 1),
            (this.prgSwitchingSize = (t >> 3) & 1),
            (this.vromSwitchingSize = (t >> 4) & 1);
          break;
        case 1:
          (this.romSelectionReg0 = (t >> 4) & 1),
            this.nes.rom.vromCount > 0 &&
            (this.vromSwitchingSize === 0
              ? this.romSelectionReg0 === 0
                ? this.load8kVromBank(t & 15, 0)
                : this.load8kVromBank(Math.floor(this.nes.rom.vromCount / 2) + (t & 15), 0)
              : this.romSelectionReg0 === 0
                ? this.loadVromBank(t & 15, 0)
                : this.loadVromBank(Math.floor(this.nes.rom.vromCount / 2) + (t & 15), 0));
          break;
        case 2:
          (this.romSelectionReg1 = (t >> 4) & 1),
            this.nes.rom.vromCount > 0 &&
            this.vromSwitchingSize === 1 &&
            (this.romSelectionReg1 === 0
              ? this.loadVromBank(t & 15, 4096)
              : this.loadVromBank(Math.floor(this.nes.rom.vromCount / 2) + (t & 15), 4096));
          break;
        default:
          r = t & 15;
          var i,
            s = 0;
          this.nes.rom.romCount >= 32
            ? this.vromSwitchingSize === 0
              ? this.romSelectionReg0 === 1 && (s = 16)
              : (s = (this.romSelectionReg0 | (this.romSelectionReg1 << 1)) << 3)
            : this.nes.rom.romCount >= 16 && this.romSelectionReg0 === 1 && (s = 8),
            this.prgSwitchingSize === 0
              ? ((i = s + (t & 15)), this.load32kRomBank(i, 32768))
              : ((i = s * 2 + (t & 15)),
                this.prgSwitchingArea === 0 ? this.loadRomBank(i, 49152) : this.loadRomBank(i, 32768));
      }
    };
    v[1].prototype.getRegNumber = function (e) {
      return e >= 32768 && e <= 40959 ? 0 : e >= 40960 && e <= 49151 ? 1 : e >= 49152 && e <= 57343 ? 2 : 3;
    };
    v[1].prototype.loadROM = function () {
      if (!this.nes.rom.valid) throw new Error("MMC1: Invalid ROM! Unable to load.");
      this.loadRomBank(0, 32768),
        this.loadRomBank(this.nes.rom.romCount - 1, 49152),
        this.loadCHRROM(),
        this.loadBatteryRam(),
        this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET);
    };
    v[1].prototype.switchLowHighPrgRom = function (e) { };
    v[1].prototype.switch16to32 = function () { };
    v[1].prototype.switch32to16 = function () { };
    v[1].prototype.toJSON = function () {
      var e = v[0].prototype.toJSON.apply(this);
      return (
        (e.mirroring = this.mirroring),
        (e.oneScreenMirroring = this.oneScreenMirroring),
        (e.prgSwitchingArea = this.prgSwitchingArea),
        (e.prgSwitchingSize = this.prgSwitchingSize),
        (e.vromSwitchingSize = this.vromSwitchingSize),
        (e.romSelectionReg0 = this.romSelectionReg0),
        (e.romSelectionReg1 = this.romSelectionReg1),
        (e.romBankSelect = this.romBankSelect),
        (e.regBuffer = this.regBuffer),
        (e.regBufferCounter = this.regBufferCounter),
        e
      );
    };
    v[1].prototype.fromJSON = function (e) {
      v[0].prototype.fromJSON.apply(this, arguments),
        (this.mirroring = e.mirroring),
        (this.oneScreenMirroring = e.oneScreenMirroring),
        (this.prgSwitchingArea = e.prgSwitchingArea),
        (this.prgSwitchingSize = e.prgSwitchingSize),
        (this.vromSwitchingSize = e.vromSwitchingSize),
        (this.romSelectionReg0 = e.romSelectionReg0),
        (this.romSelectionReg1 = e.romSelectionReg1),
        (this.romBankSelect = e.romBankSelect),
        (this.regBuffer = e.regBuffer),
        (this.regBufferCounter = e.regBufferCounter);
    };
    v[2] = function (e) {
      this.nes = e;
    };
    v[2].prototype = new v[0]();
    v[2].prototype.write = function (e, t) {
      if (e < 32768) {
        v[0].prototype.write.apply(this, arguments);
        return;
      } else this.loadRomBank(t, 32768);
    };
    v[2].prototype.loadROM = function () {
      if (!this.nes.rom.valid) throw new Error("UNROM: Invalid ROM! Unable to load.");
      this.loadRomBank(0, 32768),
        this.loadRomBank(this.nes.rom.romCount - 1, 49152),
        this.loadCHRROM(),
        this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET);
    };
    v[3] = function (e) {
      this.nes = e;
    };
    v[3].prototype = new v[0]();
    v[3].prototype.write = function (e, t) {
      if (e < 32768) {
        v[0].prototype.write.apply(this, arguments);
        return;
      } else {
        var r = (t % (this.nes.rom.vromCount / 2)) * 2;
        this.loadVromBank(r, 0), this.loadVromBank(r + 1, 4096), this.load8kVromBank(t * 2, 0);
      }
    };
    v[4] = function (e) {
      (this.nes = e),
        (this.CMD_SEL_2_1K_VROM_0000 = 0),
        (this.CMD_SEL_2_1K_VROM_0800 = 1),
        (this.CMD_SEL_1K_VROM_1000 = 2),
        (this.CMD_SEL_1K_VROM_1400 = 3),
        (this.CMD_SEL_1K_VROM_1800 = 4),
        (this.CMD_SEL_1K_VROM_1C00 = 5),
        (this.CMD_SEL_ROM_PAGE1 = 6),
        (this.CMD_SEL_ROM_PAGE2 = 7),
        (this.command = null),
        (this.prgAddressSelect = null),
        (this.chrAddressSelect = null),
        (this.pageNumber = null),
        (this.irqCounter = null),
        (this.irqLatchValue = null),
        (this.irqEnable = null),
        (this.prgAddressChanged = !1);
    };
    v[4].prototype = new v[0]();
    v[4].prototype.write = function (e, t) {
      if (e < 32768) {
        v[0].prototype.write.apply(this, arguments);
        return;
      }
      switch (e) {
        case 32768:
          this.command = t & 7;
          var r = (t >> 6) & 1;
          r !== this.prgAddressSelect && (this.prgAddressChanged = !0),
            (this.prgAddressSelect = r),
            (this.chrAddressSelect = (t >> 7) & 1);
          break;
        case 32769:
          this.executeCommand(this.command, t);
          break;
        case 40960:
          t & 1
            ? this.nes.ppu.setMirroring(this.nes.rom.HORIZONTAL_MIRRORING)
            : this.nes.ppu.setMirroring(this.nes.rom.VERTICAL_MIRRORING);
          break;
        case 40961:
          break;
        case 49152:
          this.irqCounter = t;
          break;
        case 49153:
          this.irqLatchValue = t;
          break;
        case 57344:
          this.irqEnable = 0;
          break;
        case 57345:
          this.irqEnable = 1;
          break;
        default:
      }
    };
    v[4].prototype.executeCommand = function (e, t) {
      switch (e) {
        case this.CMD_SEL_2_1K_VROM_0000:
          this.chrAddressSelect === 0
            ? (this.load1kVromBank(t, 0), this.load1kVromBank(t + 1, 1024))
            : (this.load1kVromBank(t, 4096), this.load1kVromBank(t + 1, 5120));
          break;
        case this.CMD_SEL_2_1K_VROM_0800:
          this.chrAddressSelect === 0
            ? (this.load1kVromBank(t, 2048), this.load1kVromBank(t + 1, 3072))
            : (this.load1kVromBank(t, 6144), this.load1kVromBank(t + 1, 7168));
          break;
        case this.CMD_SEL_1K_VROM_1000:
          this.chrAddressSelect === 0 ? this.load1kVromBank(t, 4096) : this.load1kVromBank(t, 0);
          break;
        case this.CMD_SEL_1K_VROM_1400:
          this.chrAddressSelect === 0 ? this.load1kVromBank(t, 5120) : this.load1kVromBank(t, 1024);
          break;
        case this.CMD_SEL_1K_VROM_1800:
          this.chrAddressSelect === 0 ? this.load1kVromBank(t, 6144) : this.load1kVromBank(t, 2048);
          break;
        case this.CMD_SEL_1K_VROM_1C00:
          this.chrAddressSelect === 0 ? this.load1kVromBank(t, 7168) : this.load1kVromBank(t, 3072);
          break;
        case this.CMD_SEL_ROM_PAGE1:
          this.prgAddressChanged &&
            (this.prgAddressSelect === 0
              ? this.load8kRomBank((this.nes.rom.romCount - 1) * 2, 49152)
              : this.load8kRomBank((this.nes.rom.romCount - 1) * 2, 32768),
              (this.prgAddressChanged = !1)),
            this.prgAddressSelect === 0 ? this.load8kRomBank(t, 32768) : this.load8kRomBank(t, 49152);
          break;
        case this.CMD_SEL_ROM_PAGE2:
          this.load8kRomBank(t, 40960),
            this.prgAddressChanged &&
            (this.prgAddressSelect === 0
              ? this.load8kRomBank((this.nes.rom.romCount - 1) * 2, 49152)
              : this.load8kRomBank((this.nes.rom.romCount - 1) * 2, 32768),
              (this.prgAddressChanged = !1));
      }
    };
    v[4].prototype.loadROM = function () {
      if (!this.nes.rom.valid) throw new Error("MMC3: Invalid ROM! Unable to load.");
      this.load8kRomBank((this.nes.rom.romCount - 1) * 2, 49152),
        this.load8kRomBank((this.nes.rom.romCount - 1) * 2 + 1, 57344),
        this.load8kRomBank(0, 32768),
        this.load8kRomBank(1, 40960),
        this.loadCHRROM(),
        this.loadBatteryRam(),
        this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET);
    };
    v[4].prototype.clockIrqCounter = function () {
      this.irqEnable === 1 &&
        (this.irqCounter--,
          this.irqCounter < 0 &&
          (this.nes.cpu.requestIrq(this.nes.cpu.IRQ_NORMAL), (this.irqCounter = this.irqLatchValue)));
    };
    v[4].prototype.toJSON = function () {
      var e = v[0].prototype.toJSON.apply(this);
      return (
        (e.command = this.command),
        (e.prgAddressSelect = this.prgAddressSelect),
        (e.chrAddressSelect = this.chrAddressSelect),
        (e.pageNumber = this.pageNumber),
        (e.irqCounter = this.irqCounter),
        (e.irqLatchValue = this.irqLatchValue),
        (e.irqEnable = this.irqEnable),
        (e.prgAddressChanged = this.prgAddressChanged),
        e
      );
    };
    v[4].prototype.fromJSON = function (e) {
      v[0].prototype.fromJSON.apply(this, arguments),
        (this.command = e.command),
        (this.prgAddressSelect = e.prgAddressSelect),
        (this.chrAddressSelect = e.chrAddressSelect),
        (this.pageNumber = e.pageNumber),
        (this.irqCounter = e.irqCounter),
        (this.irqLatchValue = e.irqLatchValue),
        (this.irqEnable = e.irqEnable),
        (this.prgAddressChanged = e.prgAddressChanged);
    };
    v[5] = function (e) {
      this.nes = e;
    };
    v[5].prototype = new v[0]();
    v[5].prototype.write = function (e, t) {
      e < 32768 ? v[0].prototype.write.apply(this, arguments) : this.load8kVromBank(t, 0);
    };
    v[5].prototype.write = function (e, t) {
      if (e < 20480) {
        v[0].prototype.write.apply(this, arguments);
        return;
      }
      switch (e) {
        case 20736:
          this.prg_size = t & 3;
          break;
        case 20737:
          this.chr_size = t & 3;
          break;
        case 20738:
          this.sram_we_a = t & 3;
          break;
        case 20739:
          this.sram_we_b = t & 3;
          break;
        case 20740:
          this.graphic_mode = t & 3;
          break;
        case 20741:
          (this.nametable_mode = t),
            (this.nametable_type[0] = t & 3),
            this.load1kVromBank(t & 3, 8192),
            (t >>= 2),
            (this.nametable_type[1] = t & 3),
            this.load1kVromBank(t & 3, 9216),
            (t >>= 2),
            (this.nametable_type[2] = t & 3),
            this.load1kVromBank(t & 3, 10240),
            (t >>= 2),
            (this.nametable_type[3] = t & 3),
            this.load1kVromBank(t & 3, 11264);
          break;
        case 20742:
          this.fill_chr = t;
          break;
        case 20743:
          this.fill_pal = t & 3;
          break;
        case 20755:
          this.SetBank_SRAM(3, t & 3);
          break;
        case 20756:
        case 20757:
        case 20758:
        case 20759:
          this.SetBank_CPU(e, t);
          break;
        case 20768:
        case 20769:
        case 20770:
        case 20771:
        case 20772:
        case 20773:
        case 20774:
        case 20775:
          (this.chr_mode = 0), (this.chr_page[0][e & 7] = t), this.SetBank_PPU();
          break;
        case 20776:
        case 20777:
        case 20778:
        case 20779:
          (this.chr_mode = 1),
            (this.chr_page[1][(e & 3) + 0] = t),
            (this.chr_page[1][(e & 3) + 4] = t),
            this.SetBank_PPU();
          break;
        case 20992:
          this.split_control = t;
          break;
        case 20993:
          this.split_scroll = t;
          break;
        case 20994:
          this.split_page = t & 63;
          break;
        case 20995:
          (this.irq_line = t), this.nes.cpu.ClearIRQ();
          break;
        case 20996:
          (this.irq_enable = t), this.nes.cpu.ClearIRQ();
          break;
        case 20997:
          this.mult_a = t;
          break;
        case 20998:
          this.mult_b = t;
          break;
        default:
          e >= 20480 && e <= 20501
            ? this.nes.papu.exWrite(e, t)
            : e >= 23552 && e <= 24575
              ? this.graphic_mode === 2 || (this.graphic_mode !== 3 && this.irq_status & 64)
              : e >= 24576 && e <= 32767 && this.sram_we_a === 2 && this.sram_we_b;
          break;
      }
    };
    v[5].prototype.loadROM = function () {
      if (!this.nes.rom.valid) throw new Error("UNROM: Invalid ROM! Unable to load.");
      this.load8kRomBank(this.nes.rom.romCount * 2 - 1, 32768),
        this.load8kRomBank(this.nes.rom.romCount * 2 - 1, 40960),
        this.load8kRomBank(this.nes.rom.romCount * 2 - 1, 49152),
        this.load8kRomBank(this.nes.rom.romCount * 2 - 1, 57344),
        this.loadCHRROM(),
        this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET);
    };
    v[7] = function (e) {
      this.nes = e;
    };
    v[7].prototype = new v[0]();
    v[7].prototype.write = function (e, t) {
      e < 32768
        ? v[0].prototype.write.apply(this, arguments)
        : (this.load32kRomBank(t & 7, 32768),
          t & 16
            ? this.nes.ppu.setMirroring(this.nes.rom.SINGLESCREEN_MIRRORING2)
            : this.nes.ppu.setMirroring(this.nes.rom.SINGLESCREEN_MIRRORING));
    };
    v[7].prototype.loadROM = function () {
      if (!this.nes.rom.valid) throw new Error("AOROM: Invalid ROM! Unable to load.");
      this.loadPRGROM(), this.loadCHRROM(), this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET);
    };
    v[11] = function (e) {
      this.nes = e;
    };
    v[11].prototype = new v[0]();
    v[11].prototype.write = function (e, t) {
      if (e < 32768) {
        v[0].prototype.write.apply(this, arguments);
        return;
      } else {
        var r = ((t & 15) * 2) % this.nes.rom.romCount,
          i = ((t & 15) * 2 + 1) % this.nes.rom.romCount;
        if ((this.loadRomBank(r, 32768), this.loadRomBank(i, 49152), this.nes.rom.vromCount > 0)) {
          var s = ((t >> 4) * 2) % this.nes.rom.vromCount;
          this.loadVromBank(s, 0), this.loadVromBank(s + 1, 4096);
        }
      }
    };
    v[34] = function (e) {
      this.nes = e;
    };
    v[34].prototype = new v[0]();
    v[34].prototype.write = function (e, t) {
      if (e < 32768) {
        v[0].prototype.write.apply(this, arguments);
        return;
      } else this.load32kRomBank(t, 32768);
    };
    v[38] = function (e) {
      this.nes = e;
    };
    v[38].prototype = new v[0]();
    v[38].prototype.write = function (e, t) {
      if (e < 28672 || e > 32767) {
        v[0].prototype.write.apply(this, arguments);
        return;
      } else this.load32kRomBank(t & 3, 32768), this.load8kVromBank(((t >> 2) & 3) * 2, 0);
    };
    v[66] = function (e) {
      this.nes = e;
    };
    v[66].prototype = new v[0]();
    v[66].prototype.write = function (e, t) {
      if (e < 32768) {
        v[0].prototype.write.apply(this, arguments);
        return;
      } else this.load32kRomBank((t >> 4) & 3, 32768), this.load8kVromBank((t & 3) * 2, 0);
    };
    v[94] = function (e) {
      this.nes = e;
    };
    v[94].prototype = new v[0]();
    v[94].prototype.write = function (e, t) {
      if (e < 32768) {
        v[0].prototype.write.apply(this, arguments);
        return;
      } else this.loadRomBank(t >> 2, 32768);
    };
    v[94].prototype.loadROM = function () {
      if (!this.nes.rom.valid) throw new Error("UN1ROM: Invalid ROM! Unable to load.");
      this.loadRomBank(0, 32768),
        this.loadRomBank(this.nes.rom.romCount - 1, 49152),
        this.loadCHRROM(),
        this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET);
    };
    v[140] = function (e) {
      this.nes = e;
    };
    v[140].prototype = new v[0]();
    v[140].prototype.write = function (e, t) {
      if (e < 24576 || e > 32767) {
        v[0].prototype.write.apply(this, arguments);
        return;
      } else this.load32kRomBank((t >> 4) & 3, 32768), this.load8kVromBank((t & 15) * 2, 0);
    };
    v[180] = function (e) {
      this.nes = e;
    };
    v[180].prototype = new v[0]();
    v[180].prototype.write = function (e, t) {
      if (e < 32768) {
        v[0].prototype.write.apply(this, arguments);
        return;
      } else this.loadRomBank(t, 49152);
    };
    v[180].prototype.loadROM = function () {
      if (!this.nes.rom.valid) throw new Error("Mapper 180: Invalid ROM! Unable to load.");
      this.loadRomBank(0, 32768),
        this.loadRomBank(this.nes.rom.romCount - 1, 49152),
        this.loadCHRROM(),
        this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET);
    };
    cv.exports = v;
  });
  var mv = f((RW, fv) => {
    var uv = hv(),
      SM = Xa(),
      pv = function (e) {
        (this.nes = e), (this.mapperName = new Array(92));
        for (var t = 0; t < 92; t++) this.mapperName[t] = "Unknown Mapper";
        (this.mapperName[0] = "Direct Access"),
          (this.mapperName[1] = "Nintendo MMC1"),
          (this.mapperName[2] = "UNROM"),
          (this.mapperName[3] = "CNROM"),
          (this.mapperName[4] = "Nintendo MMC3"),
          (this.mapperName[5] = "Nintendo MMC5"),
          (this.mapperName[6] = "FFE F4xxx"),
          (this.mapperName[7] = "AOROM"),
          (this.mapperName[8] = "FFE F3xxx"),
          (this.mapperName[9] = "Nintendo MMC2"),
          (this.mapperName[10] = "Nintendo MMC4"),
          (this.mapperName[11] = "Color Dreams Chip"),
          (this.mapperName[12] = "FFE F6xxx"),
          (this.mapperName[15] = "100-in-1 switch"),
          (this.mapperName[16] = "Bandai chip"),
          (this.mapperName[17] = "FFE F8xxx"),
          (this.mapperName[18] = "Jaleco SS8806 chip"),
          (this.mapperName[19] = "Namcot 106 chip"),
          (this.mapperName[20] = "Famicom Disk System"),
          (this.mapperName[21] = "Konami VRC4a"),
          (this.mapperName[22] = "Konami VRC2a"),
          (this.mapperName[23] = "Konami VRC2a"),
          (this.mapperName[24] = "Konami VRC6"),
          (this.mapperName[25] = "Konami VRC4b"),
          (this.mapperName[32] = "Irem G-101 chip"),
          (this.mapperName[33] = "Taito TC0190/TC0350"),
          (this.mapperName[34] = "32kB ROM switch"),
          (this.mapperName[64] = "Tengen RAMBO-1 chip"),
          (this.mapperName[65] = "Irem H-3001 chip"),
          (this.mapperName[66] = "GNROM switch"),
          (this.mapperName[67] = "SunSoft3 chip"),
          (this.mapperName[68] = "SunSoft4 chip"),
          (this.mapperName[69] = "SunSoft5 FME-7 chip"),
          (this.mapperName[71] = "Camerica chip"),
          (this.mapperName[78] = "Irem 74HC161/32-based"),
          (this.mapperName[91] = "Pirate HK-SF3 chip");
      };
    pv.prototype = {
      VERTICAL_MIRRORING: 0,
      HORIZONTAL_MIRRORING: 1,
      FOURSCREEN_MIRRORING: 2,
      SINGLESCREEN_MIRRORING: 3,
      SINGLESCREEN_MIRRORING2: 4,
      SINGLESCREEN_MIRRORING3: 5,
      SINGLESCREEN_MIRRORING4: 6,
      CHRROM_MIRRORING: 7,
      header: null,
      rom: null,
      vrom: null,
      vromTile: null,
      romCount: null,
      vromCount: null,
      mirroring: null,
      batteryRam: null,
      trainer: null,
      fourScreen: null,
      mapperType: null,
      valid: !1,
      load: function (e) {
        var t, r, i;
        if (e.indexOf("NES") === -1) throw new Error("Not a valid NES ROM.");
        for (this.header = new Array(16), t = 0; t < 16; t++) this.header[t] = e.charCodeAt(t) & 255;
        (this.romCount = this.header[4]),
          (this.vromCount = this.header[5] * 2),
          (this.mirroring = this.header[6] & 1 ? 1 : 0),
          (this.batteryRam = (this.header[6] & 2) !== 0),
          (this.trainer = (this.header[6] & 4) !== 0),
          (this.fourScreen = (this.header[6] & 8) !== 0),
          (this.mapperType = (this.header[6] >> 4) | (this.header[7] & 240));
        var s = !1;
        for (t = 8; t < 16; t++)
          if (this.header[t] !== 0) {
            s = !0;
            break;
          }
        s && (this.mapperType &= 15), (this.rom = new Array(this.romCount));
        var n = 16;
        for (t = 0; t < this.romCount; t++) {
          for (this.rom[t] = new Array(16384), r = 0; r < 16384 && !(n + r >= e.length); r++)
            this.rom[t][r] = e.charCodeAt(n + r) & 255;
          n += 16384;
        }
        for (this.vrom = new Array(this.vromCount), t = 0; t < this.vromCount; t++) {
          for (this.vrom[t] = new Array(4096), r = 0; r < 4096 && !(n + r >= e.length); r++)
            this.vrom[t][r] = e.charCodeAt(n + r) & 255;
          n += 4096;
        }
        for (this.vromTile = new Array(this.vromCount), t = 0; t < this.vromCount; t++)
          for (this.vromTile[t] = new Array(256), r = 0; r < 256; r++) this.vromTile[t][r] = new SM();
        var o, a;
        for (i = 0; i < this.vromCount; i++)
          for (t = 0; t < 4096; t++)
            (o = t >> 4),
              (a = t % 16),
              a < 8
                ? this.vromTile[i][o].setScanline(a, this.vrom[i][t], this.vrom[i][t + 8])
                : this.vromTile[i][o].setScanline(a - 8, this.vrom[i][t - 8], this.vrom[i][t]);
        this.valid = !0;
      },
      getMirroringType: function () {
        return this.fourScreen
          ? this.FOURSCREEN_MIRRORING
          : this.mirroring === 0
            ? this.HORIZONTAL_MIRRORING
            : this.VERTICAL_MIRRORING;
      },
      getMapperName: function () {
        return this.mapperType >= 0 && this.mapperType < this.mapperName.length
          ? this.mapperName[this.mapperType]
          : "Unknown Mapper, " + this.mapperType;
      },
      mapperSupported: function () {
        return typeof uv[this.mapperType] < "u";
      },
      createMapper: function () {
        if (this.mapperSupported()) return new uv[this.mapperType](this.nes);
        throw new Error(
          "This ROM uses a mapper not supported by JSNES: " +
          this.getMapperName() +
          "(" +
          this.mapperType +
          ")"
        );
      },
    };
    fv.exports = pv;
  });
  var yv = f((vW, xv) => {
    var wM = ZR(),
      dv = Za(),
      CM = rv(),
      _M = lv(),
      DM = mv(),
      gv = function (e) {
        if (
          ((this.opts = {
            onFrame: function () { },
            onAudioSample: null,
            onStatusUpdate: function () { },
            onBatteryRamWrite: function () { },
            preferredFrameRate: 60,
            emulateSound: !0,
            sampleRate: 48e3,
          }),
            typeof e < "u")
        ) {
          var t;
          for (t in this.opts) typeof e[t] < "u" && (this.opts[t] = e[t]);
        }
        (this.frameTime = 1e3 / this.opts.preferredFrameRate),
          (this.ui = { writeFrame: this.opts.onFrame, updateStatus: this.opts.onStatusUpdate }),
          (this.cpu = new wM(this)),
          (this.ppu = new CM(this)),
          (this.papu = new _M(this)),
          (this.mmap = null),
          (this.controllers = { 1: new dv(), 2: new dv() }),
          this.ui.updateStatus("Ready to load a ROM."),
          (this.frame = this.frame.bind(this)),
          (this.buttonDown = this.buttonDown.bind(this)),
          (this.buttonUp = this.buttonUp.bind(this)),
          (this.zapperMove = this.zapperMove.bind(this)),
          (this.zapperFireDown = this.zapperFireDown.bind(this)),
          (this.zapperFireUp = this.zapperFireUp.bind(this));
      };
    gv.prototype = {
      fpsFrameCount: 0,
      romData: null,
      break: !1,
      stop: function () {
        this.break = !0;
      },
      reset: function () {
        this.mmap !== null && this.mmap.reset(),
          this.cpu.reset(),
          this.ppu.reset(),
          this.papu.reset(),
          (this.lastFpsTime = null),
          (this.fpsFrameCount = 0),
          (this.break = !1);
      },
      frame: function () {
        this.ppu.startFrame();
        var e = 0,
          t = this.opts.emulateSound,
          r = this.cpu,
          i = this.ppu,
          s = this.papu;
        e: for (; !this.break;)
          for (
            r.cyclesToHalt === 0
              ? ((e = r.emulate()), t && s.clockFrameCounter(e), (e *= 3))
              : r.cyclesToHalt > 8
                ? ((e = 24), t && s.clockFrameCounter(8), (r.cyclesToHalt -= 8))
                : ((e = r.cyclesToHalt * 3),
                  t && s.clockFrameCounter(r.cyclesToHalt),
                  (r.cyclesToHalt = 0));
            e > 0;
            e--
          ) {
            if (
              (i.curX === i.spr0HitX &&
                i.f_spVisibility === 1 &&
                i.scanline - 21 === i.spr0HitY &&
                i.setStatusFlag(i.STATUS_SPRITE0HIT, !0),
                i.requestEndFrame && (i.nmiCounter--, i.nmiCounter === 0))
            ) {
              (i.requestEndFrame = !1), i.startVBlank();
              break e;
            }
            i.curX++, i.curX === 341 && ((i.curX = 0), i.endScanline());
          }
        this.fpsFrameCount++;
      },
      buttonDown: function (e, t) {
        this.controllers[e].buttonDown(t);
      },
      buttonUp: function (e, t) {
        this.controllers[e].buttonUp(t);
      },
      zapperMove: function (e, t) {
        this.mmap && ((this.mmap.zapperX = e), (this.mmap.zapperY = t));
      },
      zapperFireDown: function () {
        this.mmap && (this.mmap.zapperFired = !0);
      },
      zapperFireUp: function () {
        this.mmap && (this.mmap.zapperFired = !1);
      },
      getFPS: function () {
        var e = +new Date(),
          t = null;
        return (
          this.lastFpsTime && (t = this.fpsFrameCount / ((e - this.lastFpsTime) / 1e3)),
          (this.fpsFrameCount = 0),
          (this.lastFpsTime = e),
          t
        );
      },
      reloadROM: function () {
        this.romData !== null && this.loadROM(this.romData);
      },
      loadROM: function (e) {
        (this.rom = new DM(this)),
          this.rom.load(e),
          this.reset(),
          (this.mmap = this.rom.createMapper()),
          this.mmap.loadROM(),
          this.ppu.setMirroring(this.rom.getMirroringType()),
          (this.romData = e);
      },
      setFramerate: function (e) {
        (this.opts.preferredFrameRate = e),
          (this.frameTime = 1e3 / e),
          this.papu.setSampleRate(this.opts.sampleRate, !1);
      },
      toJSON: function () {
        return {
          romData: this.romData,
          cpu: this.cpu.toJSON(),
          mmap: this.mmap.toJSON(),
          ppu: this.ppu.toJSON(),
        };
      },
      fromJSON: function (e) {
        this.reset(),
          (this.romData = e.romData),
          this.cpu.fromJSON(e.cpu),
          this.mmap.fromJSON(e.mmap),
          this.ppu.fromJSON(e.ppu);
      },
    };
    xv.exports = gv;
  });
  var As = f((SW, Rv) => {
    Rv.exports = { Controller: Za(), NES: yv() };
  });
  var Dv = f((_v) => {
    var { GlobalEvent: AM } = Ut(),
      TM = ({ action: e, check: t, useCapture: r }) =>
        AM({ eventName: "keyup", useCapture: r, fn: (i) => t(i) && e(i) });
    _v.GlobalKeyUp2 = TM;
  });
  var Ev = f((bv) => {
    var PM = (e, { width: t, height: r }) => {
      let i = new ArrayBuffer(e),
        s = new Uint8ClampedArray(i),
        n = new Uint32Array(i);
      for (let o = 0; o < n.length; ++o) n[o] = 4278190080;
      return {
        buf8: s,
        setBuffer: (o) => {
          let a = 0;
          for (let l = 0; l < r; ++l)
            for (let c = 0; c < t; ++c) (a = l * 256 + c), (n[a] = 4278190080 | o[a]);
        },
      };
    };
    bv.Buffer = PM;
  });
  var Ts,
    Av = D(() => {
      Ts = class {
        constructor(t) {
          (this.onGenerateFrame = t.onGenerateFrame),
            (this.onWriteFrame = t.onWriteFrame),
            (this.onAnimationFrame = this.onAnimationFrame.bind(this)),
            (this.running = !0),
            (this.interval = 1e3 / 60.098),
            (this.lastFrameTime = !1);
        }
        start() {
          (this.running = !0), this.requestAnimationFrame();
        }
        stop() {
          (this.running = !1),
            this._requestID && window.cancelAnimationFrame(this._requestID),
            (this.lastFrameTime = !1);
        }
        requestAnimationFrame() {
          this._requestID = window.requestAnimationFrame(this.onAnimationFrame);
        }
        generateFrame() {
          this.onGenerateFrame(), (this.lastFrameTime += this.interval);
        }
        onAnimationFrame = (t) => {
          this.requestAnimationFrame();
          let r = t % this.interval,
            i = t - r;
          if (!this.lastFrameTime) {
            this.lastFrameTime = i;
            return;
          }
          let s = Math.round((i - this.lastFrameTime) / this.interval);
          if (s === 0) return;
          this.generateFrame(), this.onWriteFrame();
          let n = this.interval - r;
          for (let o = 1; o < s; o++)
            setTimeout(
              () => {
                this.generateFrame();
              },
              (o * n) / s
            );
          s > 1 && console.log("SKIP", s - 1, this.lastFrameTime);
        };
      };
    });
  var Pv = f((kW, Tv) => {
    Tv.exports = Le;
    function Le(e, t) {
      (this._elements = new Array(e || 50)),
        (this._first = 0),
        (this._last = 0),
        (this._size = 0),
        (this._evictedCb = t);
    }
    Le.prototype.capacity = function () {
      return this._elements.length;
    };
    Le.prototype.isEmpty = function () {
      return this.size() === 0;
    };
    Le.prototype.isFull = function () {
      return this.size() === this.capacity();
    };
    Le.prototype.peek = function () {
      if (this.isEmpty()) throw new Error("RingBuffer is empty");
      return this._elements[this._first];
    };
    Le.prototype.peekN = function (e) {
      if (e > this._size) throw new Error("Not enough elements in RingBuffer");
      var t = Math.min(this._first + e, this.capacity()),
        r = this._elements.slice(this._first, t);
      if (t < this.capacity()) return r;
      var i = this._elements.slice(0, e - r.length);
      return r.concat(i);
    };
    Le.prototype.deq = function () {
      var e = this.peek();
      return this._size--, (this._first = (this._first + 1) % this.capacity()), e;
    };
    Le.prototype.deqN = function (e) {
      var t = this.peekN(e);
      return (this._size -= e), (this._first = (this._first + e) % this.capacity()), t;
    };
    Le.prototype.enq = function (e) {
      this._end = (this._first + this.size()) % this.capacity();
      var t = this.isFull();
      return (
        t && this._evictedCb && this._evictedCb(this._elements[this._end]),
        (this._elements[this._end] = e),
        t ? (this._first = (this._first + 1) % this.capacity()) : this._size++,
        this.size()
      );
    };
    Le.prototype.size = function () {
      return this._size;
    };
  });
  var kv = f((Nv) => {
    var NM = Pv(),
      ja = class {
        constructor({ onBufferUnderrun: t }) {
          (this.onBufferUnderrun = t), (this.bufferSize = 8192), (this.buffer = new NM(this.bufferSize * 2));
        }
        getSampleRate() {
          if (!window.AudioContext) return 44100;
          let t = new window.AudioContext(),
            r = t.sampleRate;
          return t.close(), r;
        }
        start() {
          window.AudioContext &&
            ((this.audioCtx = new window.AudioContext()),
              (this.scriptNode = this.audioCtx.createScriptProcessor(1024, 0, 2)),
              (this.scriptNode.onaudioprocess = this.onaudioprocess),
              this.scriptNode.connect(this.audioCtx.destination));
        }
        stop() {
          this.scriptNode &&
            (this.scriptNode.disconnect(this.audioCtx.destination),
              (this.scriptNode.onaudioprocess = null),
              (this.scriptNode = null)),
            this.audioCtx &&
            (this.audioCtx.close().catch((t) => {
              console.log("ERROR 3247", t);
            }),
              (this.audioCtx = null));
        }
        writeSample = (t, r) => {
          this.buffer.size() / 2 >= this.bufferSize &&
            (console.log("Buffer overrun"), this.buffer.deqN(this.bufferSize / 2)),
            this.buffer.enq(t),
            this.buffer.enq(r);
        };
        onaudioprocess = (t) => {
          var r = t.outputBuffer.getChannelData(0),
            i = t.outputBuffer.getChannelData(1),
            s = r.length;
          try {
            var n = this.buffer.deqN(s * 2);
          } catch {
            var o = this.buffer.size() / 2;
            o > 0;
            for (var a = 0; a < s; a++) (r[a] = 0), (i[a] = 0);
            return;
          }
          for (var l = 0; l < s; l++) (r[l] = n[l * 2]), (i[l] = n[l * 2 + 1]);
        };
      };
    Nv.Speakers = ja;
  });
  var Ov = f((Lv) => {
    var Iv = h(Ev()),
      Fv = h(As());
    Av();
    var qv = h(kv()),
      kM = async ({ canvas: e, file: t, system: r, size: { width: i, height: s } }) => {
        let n,
          o,
          a = (() => (
            (n = e.getContext("2d")),
            (o = n.getImageData(0, 0, i, s)),
            (n.fillStyle = "black"),
            n.fillRect(0, 0, i, s),
            (0, Iv.Buffer)(o.data.length, { width: i, height: s })
          ))(),
          l = await IM(await r.fs.readFile(t)),
          c = new qv.Speakers({
            onBufferUnderrun: (d, g) => {
              m.running &&
                (console.log("Buffer underrun, running another frame to try and catch up"),
                  m.generateFrame(),
                  c.buffer.size() < g &&
                  (console.log("Still buffer underrun, running a second frame"), m.generateFrame()));
            },
          }),
          u = new Fv.NES({
            onFrame: a.setBuffer,
            onStatusUpdate: console.log,
            onAudioSample: c.writeSample,
            sampleRate: c.getSampleRate(),
          }),
          p = () => {
            o.data.set(a.buf8), n.putImageData(o, 0, 0);
          },
          m = new Ts({ onGenerateFrame: u.frame, onWriteFrame: p });
        return (
          u.loadROM(l),
          m.start(),
          c.start(),
          {
            nes: u,
            stop: () => {
              m.stop(), c.stop();
            },
            destroy: () => {
              m.stop(), c.stop(), u.stop?.();
            },
            start: () => {
              m.start(), c.start();
            },
          }
        );
      };
    Lv.Control = kM;
    var IM = (e, t) =>
      new Promise((r, i) => {
        let s = new XMLHttpRequest();
        return (
          s.open("GET", e),
          s.overrideMimeType("text/plain; charset=x-user-defined"),
          (s.onload = function () {
            this.status === 200
              ? r(this.responseText)
              : this.status === 0
                ? i()
                : i(new Error(s.statusText));
          }),
          (s.onerror = function () {
            i(new Error(s.statusText));
          }),
          (s.onprogress = t),
          s.send(),
          s
        );
      });
  });
  var Bv = {};
  Xe(Bv, { getContainRatio: () => xt });
  var Mv,
    xt,
    $r = D(() => {
      (Mv = h(T())),
        (xt = (e, t) => {
          let r = (0, Mv.findMaxE)(["width", "height"], (i) => {
            let s = (n) => (n === "width" ? "height" : "width");
            return t[i] / t[s(i)] / (e[i] / e[s(i)]);
          });
          return e[r] / t[r];
        });
    });
  var Gv = {};
  Xe(Gv, { multiplySize: () => yt });
  var yt,
    Zr = D(() => {
      yt = (e, t) => ({ width: e.width * t, height: e.height * t });
    });
  var Vv = f((Jv) => {
    var { getContainRatio: FM } = ($r(), Qe(Bv)),
      { multiplySize: qM } = (Zr(), Qe(Gv)),
      LM = (e, t) => {
        let r = FM(e, t),
          i = qM(t, r);
        return { ...i, x: (e.width - i.width) / 2, y: (e.height - i.height) / 2 };
      };
    Jv.getContainRect = LM;
  });
  var Kv = f((Qv) => {
    var { Controller: rt } = As(),
      OM = () => ({
        controls: [
          { key: "Enter", to: { controller: 1, button: rt.BUTTON_START } },
          { key: "z", to: { controller: 1, button: rt.BUTTON_A } },
          { key: "x", to: { controller: 1, button: rt.BUTTON_B } },
          { key: "ArrowUp", to: { controller: 1, button: rt.BUTTON_UP } },
          { key: "ArrowDown", to: { controller: 1, button: rt.BUTTON_DOWN } },
          { key: "ArrowLeft", to: { controller: 1, button: rt.BUTTON_LEFT } },
          { key: "ArrowRight", to: { controller: 1, button: rt.BUTTON_RIGHT } },
          { key: "Shift", to: { controller: 1, button: rt.BUTTON_SELECT } },
        ],
      });
    Qv.getDefaultConfig = OM;
  });
  var Yv = f((UW, MM) => {
    MM.exports = "/macos-demo/nes-IO4X64P2.ico";
  });
  var iS = f((rS) => {
    var BM = (e) =>
      new Promise((t, r) => {
        setTimeout(() => t(), e);
      });
    rS.waitTimeout = BM;
  });
  var nS = f((sS) => {
    var { waitTimeout: GM } = iS(),
      { FComponent: JM } = Ji(),
      { createElement: VM } = W(),
      UM = ({ fn: e, action: t, props: r, delay: i = 500, firstDelay: s, startImmediately: n, next: o }) =>
        VM(ol, { fn: e, action: t, props: r, delay: i, firstDelay: s, startImmediately: n, next: o });
    sS.Interval = UM;
    var ol = class extends JM {
      constructor(t, r) {
        super(t, r);
        let i = () => {
          (this.props.action ?? this.props.fn)({
            getLatestProps: () => this.props.props,
            isMounted: () => this.mounted,
          });
        };
        this.onMount(async () => {
          if (this.props.firstDelay) {
            if ((await GM(this.props.firstDelay), !this.mounted)) return;
            i();
          }
          let s = setInterval(i, t.delay);
          this.onUnmount(() => clearInterval(s));
        }),
          t.startImmediately && i();
      }
      render() {
        let { next: t } = this.props;
        return (t && t()) || null;
      }
    };
  });
  var aS = f((oS) => {
    var { Fragment: WM, createElement: HM } = W(),
      { OnUnmounted: zM } = ae(),
      { Invoke: $M } = X(),
      { Static: ZM } = ne(),
      { cs: XM } = S(),
      QM = ({ eventName: e, action: t }) =>
        XM(
          [
            "listener",
            (r, i) =>
              ZM({
                props: { action: t },
                getInitValue:
                  ({ getLatestProps: s }) =>
                    (n) => {
                      let { action: o } = s();
                      o(n);
                    },
                next: i,
              }),
          ],
          ({ listener: r }) =>
            HM(
              WM,
              {},
              $M({
                fn: () => {
                  window.addEventListener(e, r, !0);
                },
              }),
              zM({
                action: () => {
                  window.removeEventListener(e, r, !0);
                },
              })
            )
        );
    oS.OnWindowEvent = QM;
  });
  var cS = f((lS) => {
    var { OnWindowEvent: KM } = aS(),
      YM = ({ action: e }) => KM({ eventName: "mouseup", action: e });
    lS.OnMouseUp = YM;
  });
  var Is = f((hS) => {
    var { cs: jM } = S(),
      { UseState: eB } = A(),
      { fragments: tB } = P(),
      { GlobalMouseUp: rB } = Ue(),
      iB = ({ next: e }) =>
        jM(["state", (t, r) => eB({ next: r })], ({ state: t }) =>
          tB(
            e({ active: t.value, activate: () => t.onChange(!0) }),
            t.value && rB({ action: () => t.onChange(null) })
          )
        );
    hS.Squeeze = iB;
  });
  var jt = f((aH, sB) => {
    sB.exports = "/macos-demo/play-QU5CIIXM.svg";
  });
  var BS = f((MS) => {
    var { cs: aB } = S(),
      { Static2: lB } = de(),
      { UseState: cB } = A(),
      { spc: ei } = pe(),
      hB = ({ next: e }) =>
        aB(["ref", (t, r) => lB({ next: r })], ["state", (t, r) => cB({ next: r })], ({ ref: t, state: r }) =>
          e({
            videoSize: r.value?.videoSize,
            loaded: !!r.value,
            playing: !!r.value?.playing,
            duration: r.value?.duration,
            dom: t.get(),
            requestPictureInPicture: () => {
              r.value.pictureInPicture
                ? document.pictureInPictureElement
                  ? (document.exitPictureInPicture(), ei(r, ["pictureInPicture"], () => !1))
                  : t.get().requestPictureInPicture()
                : (document.pictureInPictureElement && document.exitPictureInPicture(),
                  t.get().requestPictureInPicture(),
                  ei(r, ["pictureInPicture"], () => !0));
            },
            domRef: (i) => {
              i &&
                !t.get() &&
                (t.set(i),
                  i.addEventListener(
                    "loadedmetadata",
                    function (s) {
                      r.onChange({ videoSize: { width: this.videoWidth, height: this.videoHeight } });
                    },
                    !1
                  ),
                  i.addEventListener("pause", (s) => {
                    ei(r, ["playing"], () => !1);
                  }),
                  i.addEventListener("play", (s) => {
                    ei(r, ["playing"], () => !0);
                  }),
                  i.addEventListener("canplay", (s) => {
                    ei(r, ["duration"], () => i.duration);
                  }));
            },
            clear: () => t.set(null),
            ...(r.value && {
              togglePlayPause: () => {
                let i = t.get();
                i.paused ? i.play() : i.pause();
              },
            }),
          })
        );
    MS.Video = hB;
  });
  var GS = f((BH, uB) => {
    uB.exports = "/macos-demo/quicktime-FPM2YF42.webp";
  });
  var $S = f((zS) => {
    var { cs: pB } = S(),
      { Static: fB } = ne(),
      mB = ({ next: e }) =>
        pB(({ }) =>
          fB({
            getInitValue: () => {
              let t = null;
              return {
                writeFiles: (r) => {
                  t = { type: "files", files: r };
                },
                getFiles: () => (!t || t.type !== "files" ? null : t.files),
              };
            },
            next: e,
          })
        );
    zS.OSClipboard = mB;
  });
  var KS = f((QS) => {
    var { cs: ZS } = S(),
      { UseState: dB } = A(),
      { Shadow: gB } = Q(),
      { keyed: xB } = B(),
      XS = 0,
      yB = ({ initLaunchers: e, clipboard: t, system: r, next: i }) =>
        ZS(
          [
            "launchers",
            (s, n) =>
              dB({
                getInitValue: () =>
                  e.map((o) => {
                    let { launcher: a, params: l } = o.launcher ? o : { launcher: o };
                    return { id: XS++, launcher: a, params: l };
                  }),
                next: n,
              }),
          ],
          [
            "runnings",
            ({ launchers: s }, n) =>
              gB({
                renderShadow: ({ accept: o }) =>
                  s.value.map((a) =>
                    ZS(xB(a.id), () =>
                      a.launcher.renderProcess({
                        system: r,
                        clipboard: t,
                        params: a.params,
                        onClose: () => s.change((l) => l.filter((c) => c !== a)),
                        next: (l) =>
                          o({
                            id: a.id,
                            key: a.launcher.key,
                            running: l,
                            launcher: a.launcher,
                          }),
                      })
                    )
                  ),
                next: n,
              }),
          ],
          ({ runnings: s, launchers: n }) =>
            i({
              launchProcess: (o, a) => {
                let l = s?.find((c) => c.launcher === o);
                if (l) l.running.open(a);
                else {
                  let c = XS++;
                  return n.change((u) => [...u, { id: c, launcher: o, params: a }]), c;
                }
              },
              runnings: s,
            })
        );
    QS.Processes = yB;
  });
  var fl = f((YS) => {
    var { spc: RB } = pe(),
      vB = ({ pId: e, state: t }) => {
        let r = t.value.windows
          ?.map((i, s) => ({ w: i, i: s }))
          .filter(({ w: i }) => i.key.processId === e)
          .map(({ i }) => i);
        return r?.length
          ? (RB(t, [], (i) => {
            let s = SB(i.windows, r);
            return { ...i, windows: s, focusedWindow: s[0].key };
          }),
            !0)
          : !1;
      };
    YS.focusProcess = vB;
    var SB = (e, t) => {
      e = e.slice();
      let r = t.map((i) => e[i]);
      for (let i = t.length; i--;) {
        let s = t[i];
        e.splice(s, 1);
      }
      return [...r, ...e];
    };
  });
  var t1 = f((e1) => {
    var { cs: zH } = S(),
      { scope: wB } = At(),
      { getPath: $H } = oe(),
      { last: ZH, toFirst: jS } = T(),
      { DesktopDisplay: CB } = Mr(),
      { spc: ml } = pe(),
      { matchKey: dl } = me(),
      { focusProcess: _B } = fl(),
      { equalDeep: DB } = Se(),
      bB = ({ desktops: e, next: t }) => {
        let r = e.state.value.desktops[e.currentIndex];
        return t({
          desktop: r,
          display: CB(r),
          includeWindow: (i) => r.windows.find((s) => DB(s.key, i)),
          focusProcess: (i) => _B({ pId: i, state: wB(e.state, ["desktops", e.currentIndex]) }),
          focusWindow: (i) => {
            ml(e.state, ["desktops", e.currentIndex], (s) => ({
              ...s,
              focusedWindow: i,
              windows: jS(s.windows, (n) => dl(n.key, i)),
            }));
          },
          blurAll: () => {
            ml(e.state, ["desktops", e.currentIndex, "focusedWindow"], () => null);
          },
          isFocused: (i) => r.focusedWindow && dl(r.focusedWindow, i.key),
          setFocus: (i) =>
            ml(e.state, ["desktops", e.currentIndex], (s) => ({
              ...s,
              windows: jS(s.windows, (n) => dl(n.key, i.key)),
              focusedWindow: i.key,
            })),
        });
      };
    e1.CurrentDesktop = bB;
  });
  var s1 = f((i1) => {
    var r1 = (e, t) => {
      let r = { ...t };
      for (let i in e) {
        let s = e[i];
        typeof s == "object" ? (r[i] = r1(s, r[i])) : (r[i] = s + (r[i] || 0));
      }
      return r;
    };
    i1.addMap = r1;
  });
  var gl = f((Ls) => {
    var { setPath: EB } = oe();
    function AB(e) {
      return !!e.find((t) => t.type === "wildcard");
    }
    function n1(e) {
      return e.type === "string" ? e.value : +e.value;
    }
    function TB(e) {
      let t = [];
      for (let r = 0; r < e; r++) t.push(r);
      return t;
    }
    var PB = (e, t, r) => {
      let i = [];
      return ti(e, t, (s, n, o) => (i.push(r ? r(s, n, o) : s), null)), i;
    };
    Ls.cascadeNodes = PB;
    var NB = (e, t, r) => {
      let i = e;
      return (
        ti(e, t, (s, n, o) => {
          let a = r(s, n, o);
          a !== s && (i = EB(i, n, a));
        }),
        i
      );
    };
    Ls.cascadeNodesChange = NB;
    var ti = (e, t, r = (i) => i) => {
      if (t.length === 0) return r(e, [], []);
      let i = t[0],
        s = t.slice(1);
      if (i.type === "wildcard") {
        let n = e == null ? [] : Array.isArray(e) ? TB(e.length) : Object.keys(e);
        if (n.length === 0) return null;
        for (let o of n) {
          let a = e[o],
            l = ti(a, s, (c, u, p) => r(c, [o].concat(u), [a].concat(p)));
          if (l) return l;
        }
      } else {
        let n = n1(i),
          o = e?.[n];
        return o === void 0
          ? AB(s)
            ? null
            : r(void 0, [n].concat(s.map(n1)), new Array(s.length + 1).fill(void 0))
          : ti(o, s, (a, l, c) => r(a, [n].concat(l), [o].concat(c)));
      }
    };
    Ls.cascadeNodesFind = ti;
  });
  var l1 = f((xl) => {
    function kB(e) {
      if (e[0] === "*") return { type: "wildcard", length: 1, value: e[0] };
      if (isNaN(e[0])) throw 53262323;
      {
        let t = /^\d+/.exec(e)[0];
        return { type: "number", value: t, length: t.length };
      }
    }
    function o1(e) {
      if (e[0] === ".") {
        let t = o1(e.substring(1));
        return Object.assign({}, t, { length: t.length + 1 });
      }
      if (e[0] === "[") {
        let t = kB(e.substring(1));
        if (e[t.length + 1] !== "]") throw "']' expected";
        return Object.assign({}, t, { length: t.length + 2 });
      } else if (/^[\w_$]/.test(e)) {
        let t = /^[\w$_-]+/.exec(e)[0];
        return { type: "string", value: t, length: t.length };
      } else throw 8293801;
    }
    var a1 = (e) => {
      let t = [];
      for (; e && e.length;) {
        let r = o1(e);
        t.push(r), (e = e.substring(r.length));
      }
      return t;
    };
    xl.parseNodes = a1;
    var IB = (e) => a1(e).map((t) => (t.type === "string" ? t.value : +t.value));
    xl.parseValueNodes = IB;
  });
  var rr = f(($e) => {
    var FB = s1().addMap,
      { cascadeNodesChange: qB } = gl(),
      { parseNodes: it } = l1(),
      { cascadeNodes: LB, cascadeNodesFind: tr } = gl(),
      OB = (e, t, r) => LB(e, it(t), r);
    $e.cascade = OB;
    var MB = (e, t, r) => tr(e, it(t), r);
    $e.cascadeFind = MB;
    var BB = (e, t, r = (i) => i || 0) => {
      let i = [];
      return (
        tr(e, it(t), (...s) => {
          let n = r(...s);
          n && i.push(n);
        }),
        i
      );
    };
    $e.cascadeCollect = BB;
    var GB = (e, t, r) =>
      tr(e, it(t), (...i) => {
        r(...i);
      });
    $e.cascadeEach = GB;
    var JB = (e, t, r) => qB(e, it(t), r);
    $e.cascadeChange = JB;
    var VB = (e, t, r = (i) => i || 0) => {
      let i = 0;
      return (
        tr(e, it(t), (...s) => {
          i += r(...s);
        }),
        i
      );
    };
    $e.cascadeSum = VB;
    var UB = (e, t, r = (i) => i || 0) => {
      let i = {};
      return (
        tr(e, it(t), (...s) => {
          i = FB(i, r(...s));
        }),
        i
      );
    };
    $e.cascadeSumMap = UB;
    var WB = (e, t, r = (i) => i) => {
      let i = 0;
      return (
        tr(e, it(t), (...s) => {
          r(...s) && i++;
        }),
        i
      );
    };
    $e.cascadeCount = WB;
  });
  var c1 = f((ri) => {
    var yl = (e, t) => (t === void 0 && ((t = e), (e = void 0)), Rl(e, t, 0));
    function HB() {
      return Rl(null, arguments, 0);
    }
    ri.cc2 = HB;
    var Rl = (e, t, r = 0) => t[r]?.(e, t.length <= r + 1 ? null : (i) => Rl(i, t, r + 1));
    ri.cc = yl;
    ri.cbc = yl;
    ri.cc1 = yl;
  });
  var m1 = f((f1) => {
    var { Shadow: zB } = Q(),
      { cascadeFind: $B } = rr(),
      { matchKey: ZB } = me(),
      { changePath: XB } = oe(),
      { last: h1, reverse: QB } = T(),
      { fragments: KB } = P(),
      { cs: YB } = S(),
      { keyed: jB } = B(),
      { Invoke: u1 } = X(),
      { spc: p1 } = pe(),
      { headerHeight: e8 } = ns(),
      t8 = ({ value: e, state: t, windowLogics: r, next: i }) =>
        zB({
          renderShadow: ({ acceptValue: s }) => {
            let n = r?.filter((o) => !$B(e, "desktops[*].windows[*]", (a) => ZB(o.key, a.key)));
            if (n?.length) {
              let o = n?.map((l) => ({
                key: l.key,
                ps: {
                  pos: l.logic.initPos ?? {
                    x: Math.floor(Math.random() * 100),
                    y: Math.floor(Math.random() * 100) + e8,
                  },
                  size: l.logic.initSize,
                },
              })),
                a = XB(e, ["desktops", e.current], (l) => ({
                  ...l,
                  focusedWindow: h1(o).key,
                  windows: [...QB(o), ...(l.windows ?? [])],
                }));
              return KB(
                s(a),
                o.map((l) =>
                  YB(jB(JSON.stringify(l.key)), () =>
                    u1({
                      action: () =>
                        p1(t, ["desktops", e.current, "windows"], (c) => [l, ...(c ?? [])]),
                    })
                  )
                ),
                u1({ action: () => p1(t, ["desktops", e.current, "focusedWindow"], () => h1(o).key) })
              );
            } else return s(e);
          },
          next: i,
        });
    f1.MatchNewWindows = t8;
  });
  var y1 = f((x1) => {
    var { Shadow: r8 } = Q(),
      { cascadeCollect: i8, cascadeChange: s8 } = rr(),
      { matchKey: ii } = me(),
      { changePath: n8 } = oe(),
      { toFirst: o8 } = T(),
      { fragments: a8 } = P(),
      { cs: d1 } = S(),
      { keyed: g1 } = B(),
      { Invoke: vl } = X(),
      { spc: Sl } = pe(),
      { chain: l8 } = V(),
      c8 = ({ value: e, state: t, windowLogics: r, next: i }) =>
        r8({
          renderShadow: ({ acceptValue: s }) => {
            let n = i8(e, "desktops[*].windows[*]", (o, { 1: a }) => {
              if (!r.some((l) => ii(l.key, o.key))) return { desktopIndex: a, key: o.key };
            });
            if (n?.length) {
              let o = l8(
                e,
                ...n.map(
                  ({ desktopIndex: a, key: l }) =>
                    (c) =>
                      n8(c, ["desktops", a, "windows"], (u) => u.filter((p) => !ii(p.key, l)))
                ),
                (a) =>
                  s8(a, "desktops[*]", (l) =>
                    !l.focusedWindow || l.windows.find((c) => ii(c.key, l.focusedWindow))
                      ? l
                      : { ...l, focusedWindow: null }
                  )
              );
              return a8(
                s(o),
                n.map(({ desktopIndex: a, key: l }) =>
                  d1(g1(JSON.stringify(l)), () =>
                    vl({
                      action: () =>
                        Sl(t, ["desktops", a, "windows"], (c) =>
                          c.filter((u) => !ii(u.key, l))
                        ),
                    })
                  )
                ),
                o.desktops.map((a, l) => {
                  let c = e.desktops[l];
                  return !c.focusedWindow || a.windows.find((u) => ii(u.key, c.focusedWindow))
                    ? null
                    : d1(g1(l), () => {
                      let u = a.windows.find(
                        (p) => p.key.processId === c.focusedWindow.processId
                      );
                      return vl(
                        u
                          ? {
                            action: () => {
                              Sl(t, ["desktops", l], (p) => ({
                                ...p,
                                windows: o8(p.windows, (m) => m === u),
                                focusedWindow: u.key,
                              }));
                            },
                          }
                          : {
                            action: () =>
                              Sl(t, ["desktops", l, "focusedWindow"], () => null),
                          }
                      );
                    });
                })
              );
            } else return s(e);
          },
          next: i,
        });
    x1.MatchRemovedWindows = c8;
  });
  var S1 = f((v1) => {
    var { Shadow: h8 } = Q(),
      { matchKey: R1 } = me(),
      { changePath: u8 } = oe(),
      p8 = ({ value: e, windowLogics: t, next: r }) =>
        h8({
          renderShadow: ({ acceptValue: i }) =>
            i(
              (() => {
                let s = e.desktops[e.current].windows?.filter(
                  (n) => t.find((o) => R1(o.key, n.key)).logic.alwaysOnTop
                );
                return s?.length
                  ? u8(e, ["desktops", e.current, "windows"], (n) => [
                    ...s,
                    ...n.filter((o) => !s.find((a) => R1(o.key, a.key))),
                  ])
                  : e;
              })()
            ),
          next: r,
        });
    v1.AlwaysOnTopWindows = p8;
  });
  var C1 = f((w1) => {
    var { cs: f8 } = S(),
      { matchKey: m8 } = me(),
      { cascadeChange: d8 } = rr(),
      { changePath: g8 } = oe(),
      { cc: x8 } = c1(),
      { MatchNewWindows: y8 } = m1(),
      { MatchRemovedWindows: R8 } = y1(),
      { AlwaysOnTopWindows: v8 } = S1(),
      S8 = ({ state: e, windowLogics: t, next: r }) =>
        f8(
          [
            "value",
            (i, s) =>
              x8(e.value, [
                (n, o) => y8({ value: n, state: e, windowLogics: t, next: o }),
                (n, o) => R8({ value: n, state: e, windowLogics: t, next: o }),
                (n, o) => v8({ value: n, windowLogics: t, next: o }),
                (n, o) =>
                  o(
                    d8(n, "desktops[*].windows[*]", (a) => {
                      let l = t.find((c) => m8(c.key, a.key));
                      return l.logic.modSize ? g8(a, ["ps", "size"], l.logic.modSize) : a;
                    })
                  ),
                s,
              ]),
          ],
          ({ value: i }) => r({ ...e, value: i })
        );
    w1.MatchWindows = S8;
  });
  var b1 = f((D1) => {
    var { cascadeChange: _1 } = rr(),
      w8 = (e, t, r) => {
        e.change ? e.change((i) => _1(i, t, r)) : e.onChange(_1(e.value, t, r));
      };
    D1.scc = w8;
  });
  var P1 = f((T1) => {
    var { cs: C8 } = S(),
      { UseState: _8 } = A(),
      { spc: E1 } = pe(),
      { chain: wl } = V(),
      { doesWindowBelong: D8 } = Ko(),
      { DesktopDisplay: b8 } = Mr(),
      { scope: E8 } = At(),
      { focusProcess: A8 } = fl(),
      { MatchWindows: T8 } = C1(),
      { cascadeFind: A1 } = rr(),
      { matchKey: si } = me(),
      { changePath: Cl } = oe(),
      { scc: P8 } = b1(),
      N8 = ({ windowLogics: e, next: t }) =>
        C8(
          [
            "state",
            (r, i) =>
              _8({ getInitValue: () => wl({ desktops: [{ type: "desktop" }], current: 0 }), next: i }),
          ],
          ["state", ({ state: r }, i) => T8({ state: r, windowLogics: e, next: i })],
          ({ state: r }) => {
            let i = (s) => {
              let n = wl(
                r.value.desktops.findIndex((o, a) => o.type === "desktop" && a !== s),
                (o) => (o < s ? o : o - 1)
              );
              r.onChange({
                desktops: wl(
                  r.value.desktops.filter((o, a) => a !== s),
                  (o) =>
                    Cl(o, [n], (a) => ({
                      ...a,
                      focusedWindow: r.value.desktops[s].focusedWindow,
                      windows: [...(r.value.desktops[s].windows ?? []), ...(a.windows ?? [])],
                    }))
                ),
                current: n,
              });
            };
            return t({
              currentIndex: r.value.current,
              state: r,
              addWindow: ({ key: s, ps: n }) =>
                E1(r, ["desktops", r.value.current], (o) => ({
                  ...o,
                  windows: [{ key: s, ps: n }, ...(o.windows ?? [])],
                  focusedWindow: s,
                })),
              doesWindowBelong: (s, n) => D8(s, r.value.desktops[n]),
              getActiveWindow: (s) => {
                let n = r.value.desktops[s];
                return n.type === "fullScreen" ? n.windowKey : n.focusedWindow;
              },
              getPs: (s) => A1(r.value.desktops, "[*].windows[*]", (n) => si(n.key, s) && n.ps),
              changePs: (s, n) => {
                P8(r, "desktops[*].windows[*].ps", (o, { }, { 3: a }) => (si(s, a.key) ? n(o) : o));
              },
              focusProcess: (s, n) => A8({ pId: s, state: E8(r, ["desktops", n]) }),
              findDesktopHasProcess: (s) => {
                for (let n = 0; n < r.value.desktops.length; n++)
                  if (r.value.desktops[n].windows?.find((a) => a.key.processId === s)) return n;
              },
              removeFullScreen: (s) => {
                r.change((n) => {
                  let o = n.desktops.find((c) => c.type === "fullScreen" && si(c.windowKey, s)),
                    a = n.desktops.filter((c) => c !== o),
                    l = a.findIndex((c) => c.type === "desktop");
                  return {
                    desktops: Cl(a, [l], (c) => ({
                      ...c,
                      windows: [...(o.windows ?? []), ...(c.windows ?? [])],
                      focusedWindow: o.windowKey,
                    })),
                    current: l,
                  };
                });
              },
              getDesktopDisplay: (s) => b8(r.value.desktops[s]),
              addFullScreen: (s) => {
                let { desktopIndex: n, window: o } = A1(
                  r.value.desktops,
                  "[*].windows[*]",
                  (a, { 0: l }) => si(a.key, s) && { desktopIndex: l, window: a }
                );
                return (
                  r.onChange({
                    ...r.value,
                    desktops: [
                      ...Cl(r.value.desktops, [n, "windows"], (a) =>
                        a.filter((l) => !si(l.key, s))
                      ),
                      { type: "fullScreen", windowKey: s, windows: [o] },
                    ],
                  }),
                  r.value.desktops.length
                );
              },
              addDesktop: () => (
                r.onChange({ ...r.value, desktops: [...r.value.desktops, { type: "desktop" }] }),
                r.value.desktops.length
              ),
              removeCurrentDesktop: () => i(r.value.current),
              removeDesktop: i,
              setCurrent: (s) => E1(r, ["current"], () => s),
              getDefaultIndex: () => r.value.desktops.findIndex((s) => s.type === "desktop"),
            });
          }
        );
    T1.Desktops = N8;
  });
  var k1 = f((N1) => {
    var k8 = (e) => {
      let t = [];
      for (let i = 0; i < e.length; i++) {
        i !== 0 && t.push({ type: "separator", key: "separator" + i, size: 10 });
        let s = e[i];
        for (let n = 0; n < s.items.length; n++) {
          let o = s.items[n];
          t.push({ ...o, type: o.type ?? "launcher", size: 54 * (o.scale ?? 1) });
        }
      }
      return t;
    };
    N1.calStatic = k8;
  });
  var F1 = f((I1) => {
    var { sum: I8 } = T(),
      F8 = (e) => {
        let r = -I8(e, (i) => i.size) / 2;
        for (let i of e) (i.pos = r + i.size / 2), (r += i.size);
        return e;
      };
    I1.calStaticPos = F8;
  });
  var L1 = f((q1) => {
    $r();
    Zr();
    var q8 = ({ rootX: e, item: t, oriPs: r, hidden: i }) => {
      let s = { x: e + t.pos, y: window.innerHeight - (15 + t.size / 2) },
        n = { width: t.size - 8, height: t.size - 8 },
        o = xt(n, r.size),
        a = yt(r.size, o),
        l = {
          x: s.x - n.width / 2 + (n.width - a.width) / 2,
          y: s.y - n.height / 2 + (n.height - a.height) / 2 + (i ? 78 : 0),
        };
      return { scale: o, pos: l };
    };
    q1.calWinPos = q8;
  });
  var O1 = D(() => { });
  var M1 = D(() => { });
  var G1 = f((B1) => {
    var { chain: L8 } = V(),
      Os = (e) => (t) => ({
        ...t,
        pending: {
          ...t?.pending,
          beforePoint: L8(t?.pending?.beforePoint, (r) => (!e && (!r || !+r) ? null : (r ?? "") + "" + e)),
        },
      }),
      Ms = (e) => +e.beforePoint,
      ni = (e) => (t) =>
        t.pending && t.op && t.prev
          ? { prev: t.op(t.prev, Ms(t.pending)), op: e }
          : t.pending
            ? { prev: Ms(t.pending), op: e }
            : { ...t, op: e },
      O8 = (e) => (t) =>
        t
          ? t.pending && t.op && t.prev
            ? { prev: e(t.op(t.prev, Ms(t.pending))) }
            : t.pending
              ? { prev: e(Ms(t.pending)) }
              : { prev: e(t.prev) }
          : null,
      M8 = [
        [
          { getLabel: () => "AC", color: "dark", action: () => null },
          { label: "+/-", color: "dark" },
          { label: "%", color: "dark", action: O8((e) => e / 100) },
          { label: String.fromCharCode(247), color: "orange", action: ni((e, t) => e / t) },
        ],
        [
          ...[7, 8, 9].map((e) => ({ label: e, color: "light", action: Os(e) })),
          { label: "x", color: "orange", action: ni((e, t) => e * t) },
        ],
        [
          ...[4, 5, 6].map((e) => ({ label: e, color: "light", action: Os(e) })),
          { label: "-", color: "orange", action: ni((e, t) => e - t) },
        ],
        [
          ...[1, 2, 3].map((e) => ({ label: e, color: "light", action: Os(e) })),
          { label: "+", color: "orange", action: ni((e, t) => e + t) },
        ],
        [
          { label: "0", color: "light", colSpan: 2, action: Os(0) },
          { label: ",", color: "light" },
          { label: "=", color: "orange", action: ni(null) },
        ],
      ];
    B1.buttons = M8;
  });
  var oi,
    _l,
    J1,
    V1,
    U1,
    W1,
    Dl,
    H1,
    z1 = D(() => {
      (oi = h(E())), (_l = h(S()));
      M1();
      U();
      (J1 = h(A())),
        (V1 = h(B())),
        (U1 = h(P())),
        (W1 = h(Ue())),
        (Dl = h(G1())),
        (H1 = ({ className: e, state: t }) =>
          (0, _l.cs)(() =>
            oi.createElement(
              "table",
              {
                className: _("controls controls-4z0", e, I0`--cell-count: ${Dl.buttons[0].length}`),
                cellPadding: 0,
                cellSpacing: 1,
              },
              oi.createElement(
                "tbody",
                null,
                Dl.buttons.map((r, i) =>
                  oi.createElement(
                    "tr",
                    { key: i },
                    r.map((s, n) =>
                      (0, _l.cs)(
                        (0, V1.keyed)(n),
                        ["btnDown", (o, a) => (0, J1.UseState)({ next: a })],
                        ({ btnDown: o }, a) =>
                          (0, U1.fragments)(
                            o.value &&
                            (0, W1.GlobalMouseUp)({ action: () => o.onChange(null) }),
                            a()
                          ),
                        ({ btnDown: o }) =>
                          oi.createElement(
                            "td",
                            {
                              className: _(s.color, { btnDown: o.value }),
                              colSpan: s.colSpan,
                              onMouseDown: () => o.onChange(!0),
                              onClick: () => t.change(s.action ?? (() => null)),
                            },
                            s.getLabel ? s.getLabel() : s.label
                          )
                      )
                    )
                  )
                )
              )
            )
          ));
    });
  var ir,
    bl,
    $1,
    Z1,
    B8,
    X1,
    G8,
    Q1 = D(() => {
      ir = h(E());
      O1();
      (bl = h(S())), ($1 = h(A())), (Z1 = h(V()));
      pt();
      z1();
      (B8 = (e, t, r, i, s) => r + ((e - t) / (i - t)) * (s - r)),
        (X1 = ({ windowControl: e, onClose: t }) =>
          (0, bl.cs)(["state", (r, i) => (0, $1.UseState)({ next: i })], ({ state: r }) =>
            ir.createElement(
              "div",
              { className: "calculator-window calculator-window-7y0" },
              (0, bl.cs)(["label", (i, s) => s(G8(r.value))], ({ label: i }) =>
                ir.createElement(
                  "div",
                  {
                    className: "top",
                    ...e.dragging,
                    style: {
                      fontSize: (0, Z1.chain)(
                        i.length,
                        (s) => Math.min(s, 47),
                        (s) => Math.max(s, 7),
                        (s) => B8(s, 5, 47, 20, 10)
                      ),
                    },
                  },
                  ir.createElement(
                    "div",
                    { className: "wrapper" },
                    ir.createElement("div", { className: "label" }, i)
                  )
                )
              ),
              ir.createElement("div", { className: "controls" }, H1({ className: "table", state: r })),
              xe({ onClose: t, windowControl: e })
            )
          )),
        (G8 = (e) => (e ? (e.pending ? (e.pending.beforePoint ?? "0") : "" + e.prev) : "0"));
    });
  var K1 = f((bz, J8) => {
    J8.exports = "/macos-demo/256-J24FBRVH.webp";
  });
  var tw = {};
  Xe(tw, { Calculator: () => V8 });
  var Ez,
    El,
    Y1,
    j1,
    ew,
    V8,
    rw = D(() => {
      (Ez = h(E())), (El = h(S()));
      Q1();
      (Y1 = h(A())),
        (j1 = h(Ei())),
        (ew = h(Ce())),
        (V8 = {
          key: "calculator",
          icon: K1(),
          renderProcess: ({ next: e, onClose: t }) =>
            (0, El.cs)(({ }) =>
              e({
                windows: [
                  {
                    id: 0,
                    renderWindowLogic: ({ next: r }) =>
                      (0, El.cs)(
                        [
                          "viewMode",
                          (i, s) => (0, Y1.UseState)({ initValue: "basic", next: s }),
                        ],
                        ({ viewMode: i }) =>
                          r({
                            close: t,
                            initPos: { x: 300, y: 300 },
                            modSize: () =>
                              i.value === "basic"
                                ? { width: 232, height: 320 }
                                : { width: 430, height: 325 },
                            getAppMenu: ({ windowControl: s }) => ({
                              appLabel: "Calculator",
                              getMainDropdown: () => ({
                                itemGroups: [[{ text: "Quit Calculator", onClick: t }]],
                              }),
                              items: [
                                {
                                  label: "View",
                                  getDropdown: () => ({
                                    itemGroups: [
                                      [
                                        { mode: "basic" },
                                        { mode: "scientific" },
                                        { mode: "programmer" },
                                      ].map((n) => ({
                                        text: (0, j1.upperCase1)(n.mode),
                                        checkbox: {
                                          checked: i.value === n.mode,
                                        },
                                        onClick: () => {
                                          i.onChange(n.mode);
                                        },
                                      })),
                                    ],
                                  }),
                                },
                                {
                                  label: "Window",
                                  getDropdown: () => ({
                                    itemGroups: [
                                      [
                                        {
                                          text: "Minimize",
                                          shortcut: (0, ew.parsePattern)(
                                            "alt+M"
                                          ),
                                          onClick:
                                            s && (() => s.onMinimize()),
                                        },
                                      ],
                                    ].filter((n) => n.length),
                                  }),
                                },
                              ],
                            }),
                            render: ({ control: s }) =>
                              X1({ windowControl: s, viewMode: i.value, onClose: t }),
                          })
                      ),
                  },
                ],
              })
            ),
        });
    });
  var nw = f((sw) => {
    var { Finder: U8 } = ($a(), Qe(BR)),
      { Calculator: W8 } = (rw(), Qe(tw)),
      H8 = ({ runningProcesses: e, onSelectLauncher: t, minifiedWindows: r, onUnminimize: i }) =>
        [
          {
            key: "docked-launchers",
            items: iw.map((s) => ({
              key: s.launcher.key,
              icon: s.launcher.icon,
              onClick: () => t(s.launcher),
              active: e.find((n) => n.launcher === s.launcher),
            })),
          },
          {
            key: "active-launchers",
            items: e
              .filter((s) => !iw.find((n) => s.launcher === n.launcher))
              .filter((s) => s.launcher.icon)
              .map((s) => ({
                key: s.launcher.key,
                icon: s.launcher.icon,
                onClick: () => t(s.launcher),
                active: !0,
              })),
          },
          {
            key: "minimized-windows",
            items: r?.map(({ wk: s }) => {
              var _proc = e.find((n) => n.id === s.processId);
              if (!_proc || !_proc.launcher.icon) return null;
              return {
                key: JSON.stringify(["minimized-window", s]),
                type: "minimized-window",
                wk: s,
                icon: _proc.launcher.icon,
                onClick: () => i(s),
              };
            }).filter(Boolean),
          },
        ].filter((s) => s.items?.length);
    sw.getGroups = H8;
    var iw = [
      { type: "launcher", launcher: U8 },
      { type: "launcher", launcher: W8 },
    ];
  });
  var lw = f((aw) => {
    var { cs: Al } = S(),
      { UseState: z8 } = A(),
      { Shadow: $8 } = Q(),
      { TransitionProgress: Z8 } = Ne(),
      { easeInOutSine: X8 } = nt(),
      { keyed: ow } = B(),
      { fragments: Q8 } = P(),
      { OnUnmounted: K8 } = ae(),
      Y8 = ({ value: e, delay: t = 300, next: r }) =>
        Al(
          ["v", (i, s) => z8({ initValue: e, next: s })],
          [
            "shadow",
            ({ v: i }, s) =>
              $8({
                renderShadow: ({ acceptValue: n }) =>
                  e !== i.value &&
                  Al(ow(e), () =>
                    Z8({
                      duration: t,
                      onDone: () => {
                        i.onChange(e);
                      },
                      next: (o) => n(i.value + (e - i.value) * X8(o)),
                    })
                  ),
                next: s,
              }),
          ],
          ({ v: i, shadow: s }, n) =>
            Q8(
              n(),
              Al(ow(e), () =>
                K8({
                  action: () => {
                    e !== i.value && s != null && i.onChange(s);
                  },
                })
              )
            ),
          ({ v: i, shadow: s }) => r(s ?? i.value)
        );
    aw.ValueTransition = Y8;
  });
  var Nl = f((Gs) => {
    var eG = (e, t) => ({ x: e.x * t, y: e.y * t });
    Gs.multiplyVector = eG;
    var tG = (e, t) => ({ x: (e.x ?? 0) * t, y: (e.y ?? 0) * t, z: (e.z ?? 0) * t });
    Gs.multiplyVector3 = tG;
    var rG = (e, t) => ({ x: e.x * t.x, y: e.y * t.y });
    Gs.multiplyVector2 = rG;
  });
  var Zw = f(($w) => {
    var { OnMounted: nG } = Nr(),
      { cs: oG } = S(),
      { Static2: aG } = de(),
      { fragments: lG } = P(),
      { OnUnmounted: cG } = ae(),
      hG = ({ action: e }) =>
        oG(["ref", (t, r) => aG({ next: r })], ({ ref: t }) =>
          lG(
            nG({
              props: e,
              action: async ({ getLatestProps: r }) => {
                let i = () => {
                  r()(), window.removeEventListener("click", i), t.set(null);
                };
                window.addEventListener("click", i), t.set(i);
              },
            }),
            cG({
              action: () => {
                t.get() && window.removeEventListener("click", t.get());
              },
            })
          )
        );
    $w.AnyAction1 = hG;
  });
  var Us = f((rC) => {
    var { Component: fG, createElement: mG } = W(),
      dG = ({ next: e, props: t, when: r, onRender: i, unless: s }) =>
        mG(Hl, { next: e, props: t, when: r, onRender: i, unless: s });
    rC.IgnoreUpdate = dG;
    var Hl = class extends fG {
      shouldComponentUpdate(t, r) {
        return (
          (t.when != null && !t.when(this.props.props)) || (t.unless != null && !!t.unless(this.props.props))
        );
      }
      render() {
        let { next: t, onRender: r } = this.props;
        return r?.(), t?.() ?? null;
      }
    };
  });
  var pC = f((uC) => {
    var { cs: gG } = S(),
      { Static: xG } = ne(),
      yG = ({ active: e, next: t }) =>
        gG(
          ["ids", (r, i) => xG({ getInitValue: () => ({ current: 0 }), next: i })],
          ({ ids: r }) => (
            e
              ? (r.oldIndex == null &&
                ((r.oldIndex = r.current), (r.newIndex = r.current + 1), delete r.current),
                (r.forward = e.forward))
              : r.current == null &&
              ((r.current = r.forward ? r.newIndex : r.oldIndex), delete r.oldIndex, delete r.newIndex),
            t(r)
          )
        );
    uC.StaticIds = yG;
  });
  var yC = f((xC) => {
    var { addVector: gC } = ge(),
      RG = ({ pos: e, oriSize: t, scale: r }) => {
        let i = gC(e, { x: (t.width * r) / 2, y: (t.height * r) / 2 });
        return gC(i, { x: -t.width / 2, y: -t.height / 2 });
      };
    xC.getScalePos = RG;
  });
  var NC = f((PC) => {
    var { cs: cr } = S(),
      { Shadow: vG } = Q(),
      { keyed: Hs } = B(),
      { fragments: TC } = P(),
      SG = ({ system: e, processes: t, openFile: r, next: i }) =>
        cr(({ }) =>
          vG({
            renderShadow: ({ accept: s }) =>
              t.map((n) =>
                cr(Hs(n.id), () =>
                  TC(
                    n.running.windows.map((o) =>
                      cr(Hs(o.id), () =>
                        cr(
                          [
                            "logic",
                            ({ }, a) =>
                              o.renderWindowLogic({ system: e, openFile: r, next: a }),
                          ],
                          ({ logic: a }) =>
                            TC(
                              s({ key: { processId: n.id, windowId: o.id }, logic: a }),
                              a.modals?.map((l) =>
                                cr(
                                  Hs(l.id),
                                  [
                                    "logic",
                                    ({ }, c) =>
                                      l.renderWindowLogic({ system: e, next: c }),
                                  ],
                                  ({ logic: c }) =>
                                    s({
                                      key: {
                                        processId: n.id,
                                        windowId: o.id,
                                        modalId: l.id,
                                      },
                                      logic: c,
                                    })
                                )
                              )
                            )
                        )
                      )
                    ),
                    n.running.modals?.map((o) =>
                      cr(
                        Hs(o.id),
                        ["logic", ({ }, a) => o.renderWindowLogic({ system: e, next: a })],
                        ({ logic: a }) =>
                          s({ key: { processId: n.id, modalId: o.id }, logic: a })
                      )
                    )
                  )
                )
              ),
            next: (s) => i(s ?? []),
          })
        );
    PC.WindowLogics = SG;
  });
  var LC = f((qC) => {
    var { fragments: bG } = P(),
      { GlobalKeyDown2: EG } = Ve(),
      { keyCombo: AG } = Ce(),
      TG = ({ focused: e, close: t, next: r }) =>
        bG(
          e &&
          t &&
          EG({
            useCapture: !0,
            action: (i) => {
              t(), i.preventDefault(), i.stopPropagation();
            },
            check: AG("alt+W"),
          }),
          r()
        );
    qC.ShortcutClose = TG;
  });
  var WC = f((UC) => {
    UC.testVideos = [
      {
        description: `Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself. When one sunny day three rodents rudely harass him, something snaps... and the rabbit ain't no bunny anymore! In the typical cartoon tradition he prepares the nasty rodents a comical revenge.

Licensed under the Creative Commons Attribution license
https://www.bigbuckbunny.org`,
        sources: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"],
        subtitle: "By Blender Foundation",
        thumb: "images/BigBuckBunny.jpg",
        title: "Big Buck Bunny",
      },
      {
        description: "The first Blender Open Movie from 2006",
        sources: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"],
        subtitle: "By Blender Foundation",
        thumb: "images/ElephantsDream.jpg",
        title: "Elephant Dream",
      },
      {
        description: `HBO GO now works with Chromecast -- the easiest way to enjoy online video on your TV. For when you want to settle into your Iron Throne to watch the latest episodes. For $35.
Learn how to use Chromecast with HBO GO and more at google.com/chromecast.`,
        sources: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"],
        subtitle: "By Google",
        thumb: "images/ForBiggerBlazes.jpg",
        title: "For Bigger Blazes",
      },
      {
        description:
          "Introducing Chromecast. The easiest way to enjoy online video and music on your TV\u2014for when Batman's escapes aren't quite big enough. For $35. Learn how to use Chromecast with Google Play Movies and more at google.com/chromecast.",
        sources: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"],
        subtitle: "By Google",
        thumb: "images/ForBiggerEscapes.jpg",
        title: "For Bigger Escape",
      },
      {
        description:
          "Introducing Chromecast. The easiest way to enjoy online video and music on your TV. For $35.  Find out more at google.com/chromecast.",
        sources: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"],
        subtitle: "By Google",
        thumb: "images/ForBiggerFun.jpg",
        title: "For Bigger Fun",
      },
      {
        description:
          "Introducing Chromecast. The easiest way to enjoy online video and music on your TV\u2014for the times that call for bigger joyrides. For $35. Learn how to use Chromecast with YouTube and more at google.com/chromecast.",
        sources: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"],
        subtitle: "By Google",
        thumb: "images/ForBiggerJoyrides.jpg",
        title: "For Bigger Joyrides",
      },
      {
        description:
          "Introducing Chromecast. The easiest way to enjoy online video and music on your TV\u2014for when you want to make Buster's big meltdowns even bigger. For $35. Learn how to use Chromecast with Netflix and more at google.com/chromecast.",
        sources: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"],
        subtitle: "By Google",
        thumb: "images/ForBiggerMeltdowns.jpg",
        title: "For Bigger Meltdowns",
      },
      {
        description: `Sintel is an independently produced short film, initiated by the Blender Foundation as a means to further improve and validate the free/open source 3D creation suite Blender. With initial funding provided by 1000s of donations via the internet community, it has again proven to be a viable development model for both open 3D technology as for independent animation film.
This 15 minute film has been realized in the studio of the Amsterdam Blender Institute, by an international team of artists and developers. In addition to that, several crucial technical and creative targets have been realized online, by developers and artists and teams all over the world.
www.sintel.org`,
        sources: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"],
        subtitle: "By Blender Foundation",
        thumb: "images/Sintel.jpg",
        title: "Sintel",
      },
      {
        description:
          "Smoking Tire takes the all-new Subaru Outback to the highest point we can find in hopes our customer-appreciation Balloon Launch will get some free T-shirts into the hands of our viewers.",
        sources: [
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
        ],
        subtitle: "By Garage419",
        thumb: "images/SubaruOutbackOnStreetAndDirt.jpg",
        title: "Subaru Outback On Street And Dirt",
      },
      {
        description:
          "Tears of Steel was realized with crowd-funding by users of the open source 3D creation tool Blender. Target was to improve and test a complete open and free pipeline for visual effects in film - and to make a compelling sci-fi film in Amsterdam, the Netherlands.  The film itself, and all raw material used for making it, have been released under the Creatieve Commons 3.0 Attribution license. Visit the tearsofsteel.org website to find out more about this, or to purchase the 4-DVD box with a lot of extras.  (CC) Blender Foundation - https://www.tearsofsteel.org",
        sources: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"],
        subtitle: "By Blender Foundation",
        thumb: "images/TearsOfSteel.jpg",
        title: "Tears of Steel",
      },
      {
        description:
          "The Smoking Tire heads out to Adams Motorsports Park in Riverside, CA to test the most requested car of 2010, the Volkswagen GTI. Will it beat the Mazdaspeed3's standard-setting lap time? Watch and see...",
        sources: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4"],
        subtitle: "By Garage419",
        thumb: "images/VolkswagenGTIReview.jpg",
        title: "Volkswagen GTI Review",
      },
      {
        description:
          "The Smoking Tire is going on the 2010 Bullrun Live Rally in a 2011 Shelby GT500, and posting a video from the road every single day! The only place to watch them is by subscribing to The Smoking Tire or watching at BlackMagicShine.com",
        sources: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"],
        subtitle: "By Garage419",
        thumb: "images/WeAreGoingOnBullrun.jpg",
        title: "We Are Going On Bullrun",
      },
    ];
  });
  var HC = f((t$, NG) => {
    NG.exports = null;
  });
  var zC = f((r$, kG) => {
    kG.exports = null;
  });
  var ZC = f(($C) => {
    var { testVideos: IG } = WC(),
      FG = (desktopFiles) => ({
        children: [
          ...["Applications"].map((e) => ({ name: e, children: [] })),
          {
            name: "User",
            children: [
              ...["Documents", "Downloads"].map((e) => ({ name: e, children: [] })),
              {
                name: "Desktop",
                children: [
                  { name: "Folder1", children: [] },
                  { name: "Folder2", children: [] },
                  ...(desktopFiles || []),
                ],
              },
            ],
          },
        ],
      });
    $C.mockRootDir = FG;
  });
  var YC = f((KC) => {
    var { last: tc, remove1Mutate: XC, arrEquals: qG } = T(),
      LG = (e) => {
        let t = [];
        return {
          readdir: async (r) => Oe(r, e).children.map((i) => i.name),
          readFile: async (r) => Oe(r, e).content,
          lstat: async (r) => {
            let i = Oe(r, e);
            return { isDirectory: () => i.children };
          },
          rename: async (r, i) => {
            let s = Oe(pr(r), e).children,
              n = s.findIndex((o) => o.name === tc(r));
            if (n > -1) {
              let o = s[n];
              Oe(pr(i), e).children.push(o), s.splice(n, 1), pi(r, "removed", t), pi(i, "added", t);
            } else console.log("File not found", r);
          },
          copyFile: async (r, i) => {
            let s = Oe(r, e);
            Oe(pr(i), e).children.push(QC(s)), pi(i, "added", t);
          },
          mkdir: async (r) => {
            Oe(pr(r), e).children.push({ name: tc(r), children: [] }), pi(r, "added", t);
          },
          unlink: async (r) => {
            let i = Oe(pr(r), e).children;
            XC(
              i,
              i.find((s) => s.name === tc(r))
            ),
              pi(r, "removed", t);
          },
          watch: (r, i, s) => {
            let n = { dir: r, options: i, onEvent: s };
            return (
              t.push(n),
              {
                close: () => {
                  XC(t, n);
                },
              }
            );
          },
        };
      };
    KC.fileSystem = LG;
    var pi = (e, t, r) => {
      let i = pr(e);
      for (let s of r) qG(s.dir, i) && s.onEvent({ event: t, path: e });
    },
      pr = (e) => e.slice(0, e.length - 1),
      Oe = (e, t) =>
        e.length
          ? Oe(
            e.slice(1),
            t.children.find((r) => r.name === e[0])
          )
          : t,
      QC = (e) => ({ ...e, children: e.children?.map(QC) });
  });
  var e_ = f((jC) => {
    var { mockRootDir: OG } = ZC(),
      { fileSystem: MG } = YC(),
      BG = ({ desktopFiles }) => ({ fs: MG(OG(desktopFiles)) });
    jC.System = BG;
  });
  var D_ = f((N) => {
    "use strict";
    var mi = Symbol.for("react.element"),
      GG = Symbol.for("react.portal"),
      JG = Symbol.for("react.fragment"),
      VG = Symbol.for("react.strict_mode"),
      UG = Symbol.for("react.profiler"),
      WG = Symbol.for("react.provider"),
      HG = Symbol.for("react.context"),
      zG = Symbol.for("react.forward_ref"),
      $G = Symbol.for("react.suspense"),
      ZG = Symbol.for("react.memo"),
      XG = Symbol.for("react.lazy"),
      d_ = Symbol.iterator;
    function QG(e) {
      return e === null || typeof e != "object"
        ? null
        : ((e = (d_ && e[d_]) || e["@@iterator"]), typeof e == "function" ? e : null);
    }
    var y_ = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () { },
      enqueueReplaceState: function () { },
      enqueueSetState: function () { },
    },
      R_ = Object.assign,
      v_ = {};
    function fr(e, t, r) {
      (this.props = e), (this.context = t), (this.refs = v_), (this.updater = r || y_);
    }
    fr.prototype.isReactComponent = {};
    fr.prototype.setState = function (e, t) {
      if (typeof e != "object" && typeof e != "function" && e != null)
        throw Error(
          "setState(...): takes an object of state variables to update or a function which returns an object of state variables."
        );
      this.updater.enqueueSetState(this, e, t, "setState");
    };
    fr.prototype.forceUpdate = function (e) {
      this.updater.enqueueForceUpdate(this, e, "forceUpdate");
    };
    function S_() { }
    S_.prototype = fr.prototype;
    function nc(e, t, r) {
      (this.props = e), (this.context = t), (this.refs = v_), (this.updater = r || y_);
    }
    var oc = (nc.prototype = new S_());
    oc.constructor = nc;
    R_(oc, fr.prototype);
    oc.isPureReactComponent = !0;
    var g_ = Array.isArray,
      w_ = Object.prototype.hasOwnProperty,
      ac = { current: null },
      C_ = { key: !0, ref: !0, __self: !0, __source: !0 };
    function __(e, t, r) {
      var i,
        s = {},
        n = null,
        o = null;
      if (t != null)
        for (i in (t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (n = "" + t.key), t))
          w_.call(t, i) && !C_.hasOwnProperty(i) && (s[i] = t[i]);
      var a = arguments.length - 2;
      if (a === 1) s.children = r;
      else if (1 < a) {
        for (var l = Array(a), c = 0; c < a; c++) l[c] = arguments[c + 2];
        s.children = l;
      }
      if (e && e.defaultProps) for (i in ((a = e.defaultProps), a)) s[i] === void 0 && (s[i] = a[i]);
      return { $$typeof: mi, type: e, key: n, ref: o, props: s, _owner: ac.current };
    }
    function KG(e, t) {
      return { $$typeof: mi, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
    }
    function lc(e) {
      return typeof e == "object" && e !== null && e.$$typeof === mi;
    }
    function YG(e) {
      var t = { "=": "=0", ":": "=2" };
      return (
        "$" +
        e.replace(/[=:]/g, function (r) {
          return t[r];
        })
      );
    }
    var x_ = /\/+/g;
    function sc(e, t) {
      return typeof e == "object" && e !== null && e.key != null ? YG("" + e.key) : t.toString(36);
    }
    function Ks(e, t, r, i, s) {
      var n = typeof e;
      (n === "undefined" || n === "boolean") && (e = null);
      var o = !1;
      if (e === null) o = !0;
      else
        switch (n) {
          case "string":
          case "number":
            o = !0;
            break;
          case "object":
            switch (e.$$typeof) {
              case mi:
              case GG:
                o = !0;
            }
        }
      if (o)
        return (
          (o = e),
          (s = s(o)),
          (e = i === "" ? "." + sc(o, 0) : i),
          g_(s)
            ? ((r = ""),
              e != null && (r = e.replace(x_, "$&/") + "/"),
              Ks(s, t, r, "", function (c) {
                return c;
              }))
            : s != null &&
            (lc(s) &&
              (s = KG(
                s,
                r +
                (!s.key || (o && o.key === s.key) ? "" : ("" + s.key).replace(x_, "$&/") + "/") +
                e
              )),
              t.push(s)),
          1
        );
      if (((o = 0), (i = i === "" ? "." : i + ":"), g_(e)))
        for (var a = 0; a < e.length; a++) {
          n = e[a];
          var l = i + sc(n, a);
          o += Ks(n, t, r, l, s);
        }
      else if (((l = QG(e)), typeof l == "function"))
        for (e = l.call(e), a = 0; !(n = e.next()).done;)
          (n = n.value), (l = i + sc(n, a++)), (o += Ks(n, t, r, l, s));
      else if (n === "object")
        throw (
          ((t = String(e)),
            Error(
              "Objects are not valid as a React child (found: " +
              (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) +
              "). If you meant to render a collection of children, use an array instead."
            ))
        );
      return o;
    }
    function Qs(e, t, r) {
      if (e == null) return e;
      var i = [],
        s = 0;
      return (
        Ks(e, i, "", "", function (n) {
          return t.call(r, n, s++);
        }),
        i
      );
    }
    function jG(e) {
      if (e._status === -1) {
        var t = e._result;
        (t = t()),
          t.then(
            function (r) {
              (e._status === 0 || e._status === -1) && ((e._status = 1), (e._result = r));
            },
            function (r) {
              (e._status === 0 || e._status === -1) && ((e._status = 2), (e._result = r));
            }
          ),
          e._status === -1 && ((e._status = 0), (e._result = t));
      }
      if (e._status === 1) return e._result.default;
      throw e._result;
    }
    var ue = { current: null },
      Ys = { transition: null },
      e6 = { ReactCurrentDispatcher: ue, ReactCurrentBatchConfig: Ys, ReactCurrentOwner: ac };
    N.Children = {
      map: Qs,
      forEach: function (e, t, r) {
        Qs(
          e,
          function () {
            t.apply(this, arguments);
          },
          r
        );
      },
      count: function (e) {
        var t = 0;
        return (
          Qs(e, function () {
            t++;
          }),
          t
        );
      },
      toArray: function (e) {
        return (
          Qs(e, function (t) {
            return t;
          }) || []
        );
      },
      only: function (e) {
        if (!lc(e)) throw Error("React.Children.only expected to receive a single React element child.");
        return e;
      },
    };
    N.Component = fr;
    N.Fragment = JG;
    N.Profiler = UG;
    N.PureComponent = nc;
    N.StrictMode = VG;
    N.Suspense = $G;
    N.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = e6;
    N.cloneElement = function (e, t, r) {
      if (e == null)
        throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
      var i = R_({}, e.props),
        s = e.key,
        n = e.ref,
        o = e._owner;
      if (t != null) {
        if (
          (t.ref !== void 0 && ((n = t.ref), (o = ac.current)),
            t.key !== void 0 && (s = "" + t.key),
            e.type && e.type.defaultProps)
        )
          var a = e.type.defaultProps;
        for (l in t)
          w_.call(t, l) && !C_.hasOwnProperty(l) && (i[l] = t[l] === void 0 && a !== void 0 ? a[l] : t[l]);
      }
      var l = arguments.length - 2;
      if (l === 1) i.children = r;
      else if (1 < l) {
        a = Array(l);
        for (var c = 0; c < l; c++) a[c] = arguments[c + 2];
        i.children = a;
      }
      return { $$typeof: mi, type: e.type, key: s, ref: n, props: i, _owner: o };
    };
    N.createContext = function (e) {
      return (
        (e = {
          $$typeof: HG,
          _currentValue: e,
          _currentValue2: e,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
          _defaultValue: null,
          _globalName: null,
        }),
        (e.Provider = { $$typeof: WG, _context: e }),
        (e.Consumer = e)
      );
    };
    N.createElement = __;
    N.createFactory = function (e) {
      var t = __.bind(null, e);
      return (t.type = e), t;
    };
    N.createRef = function () {
      return { current: null };
    };
    N.forwardRef = function (e) {
      return { $$typeof: zG, render: e };
    };
    N.isValidElement = lc;
    N.lazy = function (e) {
      return { $$typeof: XG, _payload: { _status: -1, _result: e }, _init: jG };
    };
    N.memo = function (e, t) {
      return { $$typeof: ZG, type: e, compare: t === void 0 ? null : t };
    };
    N.startTransition = function (e) {
      var t = Ys.transition;
      Ys.transition = {};
      try {
        e();
      } finally {
        Ys.transition = t;
      }
    };
    N.unstable_act = function () {
      throw Error("act(...) is not supported in production builds of React.");
    };
    N.useCallback = function (e, t) {
      return ue.current.useCallback(e, t);
    };
    N.useContext = function (e) {
      return ue.current.useContext(e);
    };
    N.useDebugValue = function () { };
    N.useDeferredValue = function (e) {
      return ue.current.useDeferredValue(e);
    };
    N.useEffect = function (e, t) {
      return ue.current.useEffect(e, t);
    };
    N.useId = function () {
      return ue.current.useId();
    };
    N.useImperativeHandle = function (e, t, r) {
      return ue.current.useImperativeHandle(e, t, r);
    };
    N.useInsertionEffect = function (e, t) {
      return ue.current.useInsertionEffect(e, t);
    };
    N.useLayoutEffect = function (e, t) {
      return ue.current.useLayoutEffect(e, t);
    };
    N.useMemo = function (e, t) {
      return ue.current.useMemo(e, t);
    };
    N.useReducer = function (e, t, r) {
      return ue.current.useReducer(e, t, r);
    };
    N.useRef = function (e) {
      return ue.current.useRef(e);
    };
    N.useState = function (e) {
      return ue.current.useState(e);
    };
    N.useSyncExternalStore = function (e, t, r) {
      return ue.current.useSyncExternalStore(e, t, r);
    };
    N.useTransition = function () {
      return ue.current.useTransition();
    };
    N.version = "18.1.0";
  });
  var E_ = f((D$, b_) => {
    "use strict";
    b_.exports = D_();
  });
  var A_ = D(() => { });
  var T_ = {};
  Xe(T_, { App: () => t6 });
  var js,
    t6,
    P_ = D(() => {
      js = h(E_());
      A_();
      t6 = ({ }) => {
        let [e] = (0, js.useState)("World");
        return js.default.createElement("div", { className: "" }, "Hello ", e);
      };
    });
  var k_ = f((N_) => {
    var { cs: r6 } = S(),
      { UseState: i6 } = A(),
      { fragments: s6 } = P(),
      { Invoke: n6 } = X(),
      { App: T$ } = (P_(), Qe(T_)),
      o6 = ({ next: e }) =>
        r6(["destroyed", (t, r) => i6({ next: r })], ({ destroyed: t }) =>
          s6(
            n6({
              action: () => {
                window.disposeScript = () => {
                  t.onChange(!0), console.clear(), document.getElementById("root").remove();
                  let r = document.createElement("div");
                  (r.id = "root"), document.body.appendChild(r);
                };
              },
            }),
            !t.value && e()
          )
        );
    N_.EsbuildDispose = o6;
  });
  var N$ = h(E()),
    I_ = h(Hf());
  var p_ = h(S());
  var S$ = h(E()),
    f_ = h(xo());
  var Zs = h(S()),
    t_ = h(P()),
    r_ = h(X()),
    i_ = h(ne()),
    rc = h(oe()),
    ic = h(T()),
    s_ = h(j());
  var _g = h(S()),
    Dg = h(me()),
    bg = h(Zm());
  var la = h(E()),
    cg = h(S());
  var hg = h(rg()),
    ug = h(P()),
    U5 = h(ss()),
    H5 = h(aa()),
    pg = h(Io()),
    fg = ({ desktops: e, getWindows: t, getAllWindows: r, onSelectWindow: i, next: s }) =>
      (0, cg.cs)(
        [
          "services",
          ({ }, n) =>
            (0, hg.Services)({ desktops: e, getWindows: t, getAllWindows: r, onSelectWindow: i, next: n }),
        ],
        ({ services: n }, o) => (0, ug.fragments)(o()),
        ({ services: n }) =>
          s({
            activate: n.activate,
            mode: n.display
              ? {
                headerInactive: n.display.active,
                windowsOverride: (0, pg.WindowsOverride)({
                  windows: n.display.windows,
                  scale: n.display.scale,
                  miniWindows: n.getMiniWindows?.({ onExitMissionControl: n.exitMissionControl }),
                }),
                renderUnderWindows: () =>
                  la.createElement(
                    "div",
                    {
                      className: "mission-control mission-control-09s bottom",
                      onClick: n.startExiting,
                    },
                    n.display.renderBottom?.(),
                    n.renderHeader?.({ onExitMissionControl: n.exitMissionControl })
                  ),
                renderAboveWindows: () =>
                  la.createElement(
                    "div",
                    { className: "mission-control mission-control-09s top" },
                    n.display.renderTop?.()
                  ),
                inactiveTableSurface: (n.display.active ?? 0) > 0.5,
              }
              : null,
          })
      );
  var Z5 = h(E()),
    mg = h(S()),
    dg = ({ currentDesktop: e, fileDnD: t, resolveThumbnail: r, next: i }) =>
      (0, mg.cs)(({ }) =>
        i({
          mode: {
            windowsOverride: e.display.windowsOverride,
            hideDock: e.display.hideDock,
            renderAboveWindows: () => t.render({ resolveThumbnail: r }),
          },
        })
      );
  var Eg = h(vg()),
    Ag = h(Cg()),
    Tg = ({ desktops: e, currentDesktop: t, windowLogics: r, fileDnD: i, resolveThumbnail: s, next: n }) =>
      (0, _g.cs)(
        [
          "unmaximizeAnimation",
          ({ }, o) => (0, Ag.UnmaximizeAnimation)({ doesWindowBelong: e.doesWindowBelong, next: o }),
        ],
        [
          "missionControl",
          ({ }, o) =>
            fg({
              desktops: e,
              getWindows: () =>
                t.desktop.windows?.map(({ key: a, ps: l }) => {
                  let c = r?.find((u) => (0, Dg.matchKey)(u.key, a));
                  return c && { ...c, ps: l };
                }),
              getAllWindows: () => r,
              onSelectWindow: t.focusWindow,
              next: o,
            }),
        ],
        [
          "maximizeAnimation",
          ({ }, o) => (0, bg.MaximizeAnimation)({ includeWindow: t.includeWindow, next: o }),
        ],
        ["switchAnimation", (o, a) => (0, Eg.SwitchAnimation)({ desktops: e, next: a })],
        ["staticMode", (o, a) => dg({ currentDesktop: t, fileDnD: i, resolveThumbnail: s, next: a })],
        ({
          maximizeAnimation: o,
          unmaximizeAnimation: a,
          switchAnimation: l,
          missionControl: c,
          staticMode: u,
        }) =>
          n({
            unmaximizeWindow: (p) =>
              a.start({
                window: p,
                desktopIndex: e.getDefaultIndex(),
                onDone: () => e.removeFullScreen(p.key),
              }),
            maximizeWindow: (p) => {
              let m = e.addFullScreen(p.key);
              o.start({
                window: p,
                desktopIndex: m,
                onDone: () => {
                  e.setCurrent(m);
                },
              });
            },
            switchDesktop: (p, m) => {
              l.start({
                desktopIndex: p,
                fromDesktopIndex: e.currentIndex,
                onDone: () => {
                  e.setCurrent(p), m?.();
                },
              });
            },
            activateMissionControl: c.activate,
            mode: l.mode ?? o.mode ?? a.mode ?? c.mode ?? u.mode,
          })
      );
  var Xs = h(ns()),
    a$ = h(ss());
  var S7 = h(E());
  var cs = h(S()),
    Ht = h(P()),
    Ug = h(Vt()),
    Wg = h(Ve()),
    Hg = h(ct()),
    zg = h(Ue()),
    $g = h(Ce()),
    ut = h(pe()),
    xa = h(A());
  var He = h(E());
  U();
  var pa = h(S()),
    Gg = h(B()),
    fa = h(Wt()),
    ma = h(ht());
  os();
  var da = h(T()),
    Jg = h(ge()),
    Vg = ({ files: e, pos: t, zombie: r, arrangement: i, system: s, resolveThumbnail: n }) =>
      (0, pa.cs)(() =>
        He.createElement(
          "div",
          { className: "dragging-overlay-4ed" },
          He.createElement(
            "div",
            { className: _("files", { zombie: r }), style: { ...We(t) } },
            e.map((o, a) =>
              (0, pa.cs)(
                (0, Gg.keyed)(a),
                ["lstat", ({ }, l) => (0, fa.Load)({ fetch: () => s.fs.lstat(o), next: l })],
                [
                  "thumbnail",
                  ({ lstat: l }, c) =>
                    (0, fa.Load)({
                      _key: l == null,
                      fetch: () =>
                        l == null ? null : l.isDirectory() ? as() : n(o, { fs: s.fs }),
                      next: c,
                    }),
                ],
                ["arrangement", (l, c) => c(i.files.find((u) => u.file === (0, da.last)(o)))],
                ({ thumbnail: l, arrangement: c }) =>
                  He.createElement(
                    "div",
                    { className: "file" },
                    l &&
                    He.createElement("div", {
                      className: "thumbnail",
                      style: {
                        ...We(
                          (0, ma.subtractVector)(c.thumbnail.centerPos, {
                            x: c.thumbnail.width / 2,
                            y: c.thumbnail.height / 2,
                          })
                        ),
                        backgroundImage: `url(${l})`,
                        width: c.thumbnail.width,
                        height: c.thumbnail.height,
                      },
                    }),
                    He.createElement(
                      "div",
                      {
                        className: _("name", { alignCenter: c.name.centerPos }),
                        style: {
                          ...We(
                            (0, ma.subtractVector)(c.name.startPos ?? c.name.centerPos, {
                              x: 0,
                              y: c.name.lineHeight / 2,
                            })
                          ),
                          fontSize: c.name.fontSize,
                          lineHeight: c.name.lineHeight + "px",
                          fontWeight: c.name.fontWeight,
                        },
                      },
                      He.createElement("div", {
                        className: "background",
                        style: { borderRadius: c.name.lineHeight / 2 + "px" },
                      }),
                      He.createElement("div", { className: "text" }, (0, da.last)(o))
                    )
                  )
              )
            )
          ),
          !r &&
          e.length > 1 &&
          He.createElement(
            "div",
            { className: "counter-badge", style: { ...We((0, Jg.addVector)(t, { x: 20, y: 10 })) } },
            e.length
          )
        )
      );
  var Zg = h(ne()),
    Xg = h(ls()),
    Qg = h(ae()),
    ya = h(T()),
    Kg = h(aa()),
    Yg = h(X()),
    jg = ({ system: e, next: t }) =>
      (0, cs.cs)(["state", (r, i) => (0, xa.UseState)({ next: i })], ({ state: r }) =>
        (0, Ht.fragments)(
          t({
            active: !!r.value,
            startDragging: ({ pos: i, files: s, arrangement: n }) => {
              r.onChange({ oriPos: i, files: s, arrangement: n });
            },
            renderDropPoint: ({ onDrop: i, next: s }) =>
              (0, cs.cs)(
                ["id", (n, o) => (0, Zg.Static)({ getInitValue: () => (0, Xg.randomId)(), next: o })],
                ({ id: n }) =>
                  (0, Ht.fragments)(
                    s({
                      active: (0, ya.last)(r.value?.dropPoints)?.id === n,
                      handle: r.value && {
                        onMouseEnter: (o) => {
                          (0, ut.spc)(r, ["dropPoints"], (a) => [
                            ...(a ?? []),
                            { id: n, onDrop: i },
                          ]);
                        },
                        onMouseLeave: () => {
                          (0, ut.spc)(r, ["dropPoints"], (o) => o?.filter((a) => a.id !== n));
                        },
                      },
                    }),
                    r.value &&
                    (0, Qg.OnUnmounted)({
                      action: () => {
                        (0, ut.spc)(
                          r,
                          [],
                          (o) =>
                            o && {
                              ...o,
                              dropPoints: o.dropPoints.filter((a) => a.id !== n),
                            }
                        );
                      },
                    })
                  )
              ),
            render: ({ resolveThumbnail: i }) =>
              r.value &&
              (0, cs.cs)(
                [
                  "state2",
                  (s, n) =>
                    (0, xa.UseState)({ getInitValue: () => ({ pos: r.value.oriPos }), next: n }),
                ],
                ({ state2: s }, n) =>
                  (0, Ht.fragments)(
                    n(),
                    !s.value.dying &&
                    (0, Ht.fragments)(
                      (0, Hg.GlobalMouseMove)({
                        action: (o) => (0, ut.spc)(s, ["pos"], () => (0, Ug.getELoc)(o)),
                      }),
                      (0, zg.GlobalMouseUp)({
                        action: () => {
                          r.value?.dropPoints?.length &&
                            (0, ya.last)(r.value.dropPoints).onDrop(r.value.files),
                            r.onChange(null);
                        },
                      }),
                      (0, Wg.GlobalKeyDown2)({
                        check: (0, $g.keyCombo)("Escape"),
                        action: (o) => {
                          (0, ut.spc)(s, ["dying"], () => !0);
                        },
                      })
                    ),
                    s.value.dying &&
                    (0, Ht.fragments)(
                      (0, Yg.Invoke)({
                        action: () => (0, ut.spc)(s, ["pos"], () => r.value.oriPos),
                      }),
                      (0, Kg.TimeoutAction)({ delay: 300, action: () => r.onChange(null) })
                    )
                  ),
                ({ state2: s }) =>
                  Vg({
                    files: r.value.files,
                    pos: s.value.pos,
                    zombie: s.value.dying,
                    arrangement: r.value.arrangement,
                    resolveThumbnail: i,
                    system: e,
                  })
              ),
          })
        )
      );
  $a();
  var WW = h(E()),
    nl = h(S()),
    Ns = h(Ce()),
    ks = h(A());
  var Yt = h(E());
  U();
  var Ka = h(S());
  var bs = h(W()),
    GR = h(T()),
    JR = (e, t = ", ") => (e == null ? null : (0, bs.createElement)(bs.Fragment, {}, ...(0, GR.joinArr)(e, t)));
  var vv = h(B()),
    Sv = h(Ve()),
    Ya = h(pe()),
    wv = h(A());
  pt();
  var { Controller: tt } = As(),
    Cv = ({ config: e, onClose: t }) => ({
      id: "config",
      renderWindowLogic: ({ next: r }) =>
        r({
          initSize: { width: 270, height: 300 },
          initPos: { x: 100, y: 100 },
          render: ({ size: i, control: s }) =>
            (0, Ka.cs)(["assigning", (n, o) => (0, wv.UseState)({ next: o })], ({ assigning: n }) =>
              Yt.createElement(
                "div",
                { className: "config-modal-4fu", ...s.dragging },
                xe({ windowControl: s, disableMinimize: !0, disableMaximize: !0, onClose: t }),
                s.focused &&
                n.value &&
                (0, Sv.GlobalKeyDown2)({
                  check: () => !0,
                  action: (o) => {
                    o.key === "Escape" ||
                      (o.key === "Backspace" || o.key === "Delete"
                        ? (0, Ya.spc)(e, ["controls"], (a) =>
                          a.filter(
                            (l) =>
                              l.to.controller !== n.value.controller ||
                              l.to.button !== n.value.button
                          )
                        )
                        : (0, Ya.spc)(e, ["controls"], (a) => [
                          ...a.filter(
                            (l) =>
                              l.to.controller !== n.value.controller ||
                              l.to.button !== n.value.button
                          ),
                          { key: o.key, to: n.value },
                        ])),
                      n.onChange(null);
                  },
                }),
                Yt.createElement(
                  "div",
                  { className: "controls" },
                  EM.map(({ label: o, button: a }, l) =>
                    (0, Ka.cs)((0, vv.keyed)(l), () =>
                      Yt.createElement(
                        "div",
                        { className: "line" },
                        Yt.createElement("div", { className: "label" }, o),
                        Yt.createElement(
                          "div",
                          {
                            className: _("value", {
                              assigning:
                                n.value &&
                                n.value.controller === 1 &&
                                n.value.button === a,
                            }),
                            onClick: () => n.onChange({ controller: 1, button: a }),
                          },
                          JR(
                            e.value.controls
                              .filter((c) => c.to.button === a && c.to.controller === 1)
                              .map((c) => bM(c.key)),
                            ", "
                          )
                        )
                      )
                    )
                  )
                )
              )
            ),
        }),
    }),
    bM = (e) => e,
    EM = [
      { label: "Up", button: tt.BUTTON_UP },
      { label: "Down", button: tt.BUTTON_DOWN },
      { label: "Left", button: tt.BUTTON_LEFT },
      { label: "Right", button: tt.BUTTON_RIGHT },
      { label: "A", button: tt.BUTTON_A },
      { label: "B", button: tt.BUTTON_B },
      { label: "Start", button: tt.BUTTON_START },
      { label: "Select", button: tt.BUTTON_SELECT },
    ];
  var Xr = h(E());
  us();
  var Qr = h(S()),
    Ps = h(P()),
    rl = h(Ut()),
    il = h(B()),
    Uv = h(Ve()),
    Wv = h(Dv()),
    Hv = h(Nr()),
    zv = h(ae()),
    sl = h(de());
  ba();
  pt();
  var $v = h(Ov()),
    Zv = h(Vv()),
    Xv = ({ windowControl: e, system: t, file: r, controls: i, onChangeFile: s, onClose: n }) =>
      (0, Qr.cs)(
        ["canvasRef", (o, a) => (0, sl.Static2)({ next: a })],
        ["controlRef", (o, a) => (0, sl.Static2)({ next: a })],
        ({ canvasRef: o, controlRef: a }) =>
          Xr.createElement(
            "div",
            { className: "jsnes-window-5ek" },
            !e.fullScreen &&
            Xr.createElement(
              "div",
              { className: "header", ...e.dragging },
              xe({ onClose: n, windowControl: e })
            ),
            (0, Qr.cs)(
              ["size", (l, c) => Zt({ next: c })],
              [
                "dropPoint",
                ({ }, l) =>
                  e.fileDnD.renderDropPoint({
                    onDrop: (c) => {
                      s(c[0]);
                    },
                    next: l,
                  }),
              ],
              ({ size: l, dropPoint: c }) =>
                Xr.createElement(
                  "div",
                  { className: "content", ref: l.ref, ...c.handle },
                  Xr.createElement("canvas", {
                    ref: o.set,
                    width: el,
                    height: tl,
                    style: { ...fs((0, Zv.getContainRect)(l.value, { width: el, height: tl })) },
                  })
                )
            ),
            (0, Qr.cs)((0, il.keyed)(JSON.stringify(r)), () =>
              (0, Ps.fragments)(
                (0, Hv.OnMounted)({
                  action: async () => {
                    let l = o.get(),
                      c = await (0, $v.Control)({
                        canvas: l,
                        file: r,
                        system: t,
                        size: { width: el, height: tl },
                      });
                    a.set(c);
                  },
                }),
                (0, zv.OnUnmounted)({ action: () => a.get().destroy() })
              )
            ),
            (0, Ps.fragments)(
              (0, rl.GlobalEvent)({
                eventName: "blur",
                action: () => {
                  a.get().stop();
                },
              }),
              (0, rl.GlobalEvent)({
                eventName: "focus",
                action: () => {
                  a.get()?.start();
                },
              })
            ),
            e.focused &&
            i.map(({ key: l, to: c }) =>
              (0, Qr.cs)((0, il.keyed)(l), () =>
                (0, Ps.fragments)(
                  (0, Uv.GlobalKeyDown2)({
                    check: (u) => u.key === l,
                    action: () => a.get().nes.buttonDown(c.controller, c.button),
                  }),
                  (0, Wv.GlobalKeyUp2)({
                    check: (u) => u.key === l,
                    action: () => a.get().nes.buttonUp(c.controller, c.button),
                  })
                )
              )
            )
          )
      ),
    el = 256,
    tl = 240;
  var eS = h(Kv()),
    $W = h(ss()),
    jv = 0,
    tS = {
      key: "jsnes",
      icon: Yv(),
      renderProcess: ({ next: e, params: t, onClose: r }) =>
        (0, nl.cs)(
          [
            "windows",
            (i, s) => (0, ks.UseState)({ getInitValue: () => [{ id: jv++, file: t.file }], next: s }),
          ],
          ["config", (i, s) => (0, ks.UseState)({ getInitValue: () => (0, eS.getDefaultConfig)(), next: s })],
          ({ windows: i, config: s }) =>
            e({
              open: (n) => {
                i.change((o) => [...o, { id: jv++, file: n.file }]);
              },
              windows: i.value.map((n) => ({
                id: n.id,
                renderWindowLogic: ({ system: o, next: a }) =>
                  (0, nl.cs)(
                    ["showConfig", (l, c) => (0, ks.UseState)({ next: c })],
                    [
                      "close",
                      (l, c) =>
                        c(() => {
                          i.value.length > 1
                            ? i.change((u) => u.filter((p) => p !== n))
                            : r();
                        }),
                    ],
                    ({ close: l, showConfig: c }) =>
                      a({
                        close: l,
                        initPos: { x: 300, y: 300 },
                        initSize: { width: 400, height: 402 },
                        resizing: { minSize: { width: 320, height: 250 } },
                        modals: [
                          c.value && Cv({ config: s, onClose: () => c.onChange(null) }),
                        ].filter((u) => u),
                        getAppMenu: ({ windowControl: u }) => ({
                          appLabel: "JS-NES",
                          getMainDropdown: () => ({
                            itemGroups: [
                              [
                                {
                                  text: "Configurations",
                                  shortcut: (0, Ns.parsePattern)("alt+,"),
                                  onClick: () => c.onChange(!0),
                                },
                              ],
                              [{ text: "Quit JS-NES", onClick: l }],
                            ],
                          }),
                          items: [
                            {
                              label: "View",
                              getDropdown: () => ({
                                itemGroups: [
                                  [
                                    {
                                      text: u.isFullScreen()
                                        ? "Exit Full Screen"
                                        : "Enter Full Screen",
                                      shortcut: (0, Ns.parsePattern)("alt+F"),
                                      onClick: () =>
                                        u.isFullScreen()
                                          ? u.onUnmaximize()
                                          : u.onMaximize(),
                                    },
                                  ],
                                ].filter((p) => p.length),
                              }),
                            },
                            {
                              label: "Window",
                              getDropdown: () => ({
                                itemGroups: [
                                  [
                                    {
                                      text: "Minimize",
                                      shortcut: (0, Ns.parsePattern)("alt+M"),
                                      onClick: u && (() => u.onMinimize()),
                                    },
                                  ],
                                ].filter((p) => p.length),
                              }),
                            },
                          ],
                        }),
                        render: ({ control: u }) =>
                          Xv({
                            windowControl: u,
                            file: n.file,
                            onChangeFile: (p) =>
                              i.change((m) =>
                                m.map((d) => (d !== n ? d : { ...d, file: p }))
                              ),
                            system: o,
                            controls: s.value.controls,
                            onClose: l,
                          }),
                      })
                  ),
              })),
            })
        ),
    };
  var GH = h(E()),
    hl = h(S());
  var jr = h(E());
  U();
  var cl = h(S()),
    PS = h(P()),
    NS = h(B()),
    kS = h(Wt()),
    IS = h(ae()),
    FS = h(oa()),
    qS = h(A()),
    LS = h(Ir());
  pt();
  var Te = h(E());
  U();
  var Rt = h(S()),
    er = h(P()),
    SS = h(nS()),
    wS = h(ct()),
    Fs = h(Ce()),
    CS = h(cS()),
    _S = h(ae()),
    ll = h(Ao()),
    DS = h(ne()),
    bS = h(de()),
    ES = h(A()),
    AS = h(ls()),
    al = h(Ei()),
    qs = h(Ir());
  var Kr = h(E()),
    uS = h(S());
  var pS = h(Is());
  U();
  var fS = ({ onClick: e }) =>
    (0, uS.cs)(["squeeze", (t, r) => (0, pS.Squeeze)({ next: r })], ({ squeeze: t }) =>
      Kr.createElement(
        "div",
        {
          className: _("backward backward-2bk", { squeezed: t.active }),
          onMouseDown: (r) => r.stopPropagation(),
          onClick: e,
        },
        Kr.createElement(
          "div",
          { className: "control", onMouseDown: t.activate },
          Kr.createElement("img", { src: jt() }),
          Kr.createElement("img", { src: jt() })
        )
      )
    );
  var Yr = h(E()),
    mS = h(S());
  var dS = h(Is());
  U();
  var gS = ({ onClick: e }) =>
    (0, mS.cs)(["squeeze", (t, r) => (0, dS.Squeeze)({ next: r })], ({ squeeze: t }) =>
      Yr.createElement(
        "div",
        {
          className: _("forward forward-3rf", { squeezed: t.active }),
          onMouseDown: (r) => r.stopPropagation(),
          onClick: e,
        },
        Yr.createElement(
          "div",
          { className: "control", onMouseDown: t.activate },
          Yr.createElement("img", { src: jt() }),
          Yr.createElement("img", { src: jt() })
        )
      )
    );
  var ze = h(E()),
    xS = h(S());
  var RH = h(A());
  U();
  var wH = h(P()),
    _H = h(Ue()),
    yS = h(Is()),
    RS = ({ playing: e, onClick: t }) =>
      (0, xS.cs)(["squeeze", (r, i) => (0, yS.Squeeze)({ next: i })], ({ squeeze: r }) =>
        ze.createElement(
          "div",
          {
            className: _("play-pause play-pause-0w9", { squeezed: r.active }),
            onMouseDown: (i) => i.stopPropagation(),
            onClick: t,
          },
          ze.createElement(
            "div",
            { className: "control", onMouseDown: r.activate },
            e
              ? ze.createElement(
                ze.Fragment,
                null,
                ze.createElement("div", { className: "column" }),
                ze.createElement("div", { className: "column" })
              )
              : ze.createElement("img", { src: jt(), draggable: !1 })
          )
        )
      );
  var TS = ({ video: e, focused: t, hidden: r }) =>
    (0, Rt.cs)(() =>
      Te.createElement(
        "div",
        { className: _("playback-control playback-control-8d0", { hidden: r }) },
        Te.createElement(
          "div",
          { className: "box" },
          Te.createElement(
            "div",
            { className: "line1" },
            fS({}),
            RS({ playing: e.playing, onClick: e.togglePlayPause }),
            gS({}),
            t &&
            (0, er.fragments)(
              (0, qs.GlobalShortCut)({
                keyCombo: (0, Fs.parsePattern)("space"),
                action: e.togglePlayPause,
              }),
              (0, qs.GlobalShortCut)({
                keyCombo: (0, Fs.parsePattern)("ArrowLeft"),
                action: () => {
                  e.dom.currentTime = e.dom.currentTime - Math.min(10, e.duration / 100);
                },
              }),
              (0, qs.GlobalShortCut)({
                keyCombo: (0, Fs.parsePattern)("ArrowRight"),
                action: () => {
                  e.dom.currentTime = e.dom.currentTime + Math.min(10, e.duration / 100);
                },
              })
            )
          ),
          (0, Rt.cs)(
            (i, s) =>
              (0, Rt.cs)(["rr", (n, o) => (0, ll.Rerender)({ next: o })], ({ rr: n }) =>
                (0, er.fragments)(
                  e.playing && (0, SS.Interval)({ action: () => n.forceUpdate(), delay: 20 }),
                  s()
                )
              ),
            ["seeker", (i, s) => nB({ video: e, next: s })],
            ({ seeker: i }) =>
              Te.createElement(
                "div",
                { className: "line2" },
                Te.createElement("div", { className: "time-elapsed" }, vS(e.dom?.currentTime ?? 0)),
                (0, Rt.cs)(
                  [
                    "styleClass",
                    (s, n) =>
                      oB({
                        style: `--pos: ${e.duration ? ((e.dom?.currentTime ?? 0) / e.duration).toFixed(3) : 0}`,
                        next: n,
                      }),
                  ],
                  ({ styleClass: s }) =>
                    Te.createElement(
                      "div",
                      {
                        className: _("progress-bar", s),
                        onMouseDown: (n) => {
                          i.start(n), n.stopPropagation();
                        },
                        ref: i.domRef,
                      },
                      Te.createElement("div", { className: "left" }),
                      Te.createElement("div", { className: "right" }),
                      Te.createElement("div", { className: "handle" })
                    )
                ),
                Te.createElement(
                  "div",
                  { className: "time-total" },
                  e.duration != null ? vS(e.duration) : "--:--"
                )
              )
          )
        )
      )
    ),
    vS = (e) => {
      e = Math.floor(e);
      let t = e % 60,
        r = Math.floor(e / 60),
        i = r % 60,
        s = Math.floor(r / 60);
      return (s ? s + ":" : "") + (0, al.paddingLeft)(i) + ":" + (0, al.paddingLeft)(t);
    },
    nB = ({ video: e, next: t }) =>
      (0, Rt.cs)(
        ["ref", (r, i) => (0, bS.Static2)({ next: i })],
        ["state", (r, i) => (0, ES.UseState)({ next: i })],
        ["rr", (r, i) => (0, ll.Rerender)({ next: i })],
        ({ ref: r, state: i, rr: s }) =>
          (0, er.fragments)(
            t({
              domRef: r.set,
              start: (n) => {
                let o = r.get().getBoundingClientRect();
                return (
                  (e.dom.currentTime = ((n.clientX - o.x) / o.width) * e.duration),
                  i.onChange({ paused: (() => (e.dom.paused ? !1 : (e.dom.pause(), !0)))(), rect: o })
                );
              },
            }),
            i.value &&
            (0, er.fragments)(
              (0, wS.GlobalMouseMove)({
                action: (n) => {
                  let { rect: o } = i.value;
                  (e.dom.currentTime = ((n.clientX - o.x) / o.width) * e.duration),
                    s.forceUpdate();
                },
              }),
              (0, CS.OnMouseUp)({
                action: (n) => {
                  i.value.paused && e.dom.play(), i.onChange(null);
                },
              })
            )
          )
      ),
    oB = ({ style: e, next: t }) =>
      (0, Rt.cs)(
        [
          "ref",
          (r, i) =>
            (0, DS.Static)({
              getInitValue: () => {
                let s = "sc_" + (0, AS.randomId)(),
                  n = document.createElement("style");
                return (
                  (n.innerHTML = `.${s}{${e}}`),
                  document.head.appendChild(n),
                  { style: n, id: s, content: e }
                );
              },
              next: i,
            }),
        ],
        ({ ref: r }) => (
          e !== r.content && ((r.style.innerHTML = `.${r.id}{${e}}`), (r.content = e)),
          (0, er.fragments)(t(r.id), (0, _S.OnUnmounted)({ action: () => r.style.remove() }))
        )
      );
  var OS = ({ windowControl: e, video: t, system: r, file: i, onChangeFile: s, onClose: n }) =>
    (0, cl.cs)(
      ["lastActivity", (o, a) => (0, qS.UseState)({ next: a })],
      [
        "dropPoint",
        ({ }, o) =>
          e.fileDnD.renderDropPoint({
            onDrop: (a) => {
              s(a[0]);
            },
            next: o,
          }),
      ],
      ({ lastActivity: o, dropPoint: a }) =>
        jr.createElement(
          "div",
          {
            className: _("quicktime-player-window-324", { focused: e.focused, fullScreen: e.fullScreen }),
            ...e.dragging,
            onMouseMove: () => {
              let l = Date.now();
              (!o.value || o.value < l - 300) && o.onChange(l);
            },
            onMouseLeave: () => {
              o.onChange(null);
            },
            ...a.handle,
          },
          e.fullScreen && (0, LS.OnGlobalKeyDownEscape)({ action: e.onUnmaximize }),
          o.value && (0, FS.TimedAction)({ time: o.value + 3e3, action: () => o.onChange(null) }),
          !e.fullScreen &&
          jr.createElement(
            "div",
            { className: _("header", { hidden: !o.value }) },
            xe({ onClose: n, windowControl: e })
          ),
          (0, cl.cs)(
            (0, NS.keyed)(JSON.stringify(i)),
            ["fileContent", ({ }, l) => (0, kS.Load)({ fetch: () => r.fs.readFile(i), next: l })],
            ({ }, l) => (0, PS.fragments)(l(), (0, IS.OnUnmounted)({ action: () => t.clear() })),
            ({ fileContent: l }) =>
              l && jr.createElement("video", { src: l.sources[0], ref: t.domRef, autoPlay: !0 })
          ),
          TS({ hidden: !o.value, video: t, focused: e.focused }),
          !t.loaded && jr.createElement("div", { className: "loading" }, "Loading video...")
        )
    );
  var ul = h(A()),
    US = h(BS()),
    pl = h(Ce()),
    WS = h(ns()),
    JS = 0,
    HS = {
      key: "quicktime-player",
      icon: GS(),
      resolveFileThumbnail: async (e, { fs: t }) => {
        let r = await t.readFile(e);
        return r?.thumb ? r.sources[0].replace(/\/[^/]+$/, "") + "/" + r.thumb : null;
      },
      renderProcess: ({ next: e, params: t, onClose: r }) =>
        (0, hl.cs)(
          [
            "windows",
            (i, s) =>
              (0, ul.UseState)({
                getInitValue: () => [{ id: JS++, initPos: { x: 40, y: 200 }, file: t.file }],
                next: s,
              }),
          ],
          ({ windows: i }) =>
            e({
              open: (s) =>
                i.change((n) => [
                  ...n,
                  {
                    id: JS++,
                    file: s.file,
                    initPos: {
                      x: Math.floor(Math.random() * 100),
                      y: Math.floor(Math.random() * 100) + WS.headerHeight,
                    },
                  },
                ]),
              windows: i.value.map((s) => ({
                id: s.id,
                renderWindowLogic: ({ system: n, next: o }) =>
                  (0, hl.cs)(
                    ["video", (a, l) => (0, US.Video)({ next: l })],
                    ["alwaysOnTop", (a, l) => (0, ul.UseState)({ next: l })],
                    ({ video: a, alwaysOnTop: l }) => {
                      let c = () => {
                        i.value.length > 1 ? i.change((u) => u.filter((p) => p !== s)) : r();
                      };
                      return o({
                        close: c,
                        initPos: s.initPos,
                        initSize: { width: 532, height: 320 },
                        ...(a.videoSize && {
                          modSize: (u) => VS(u, a.videoSize.width / a.videoSize.height),
                        }),
                        alwaysOnTop: l.value,
                        getAppMenu: ({ windowControl: u }) => ({
                          appLabel: "Quicktime Player",
                          getMainDropdown: () => ({
                            itemGroups: [[{ text: "Quit Quicktime Player", onClick: r }]],
                          }),
                          items: [
                            {
                              label: "View",
                              getDropdown: () => ({
                                itemGroups: [
                                  [
                                    {
                                      text: "Float On Top",
                                      checkbox: { checked: l.value },
                                      onClick: () => l.change((p) => !p),
                                    },
                                    {
                                      text: u.isFullScreen()
                                        ? "Exit Full Screen"
                                        : "Enter Full Screen",
                                      shortcut: (0, pl.parsePattern)("F"),
                                      onClick: () =>
                                        u.isFullScreen()
                                          ? u.onUnmaximize()
                                          : u.onMaximize(),
                                    },
                                  ],
                                  [
                                    document.pictureInPictureEnabled && {
                                      text: "Host picture-in-picture",
                                      onClick: () => a.requestPictureInPicture(),
                                    },
                                  ].filter((p) => p),
                                ].filter((p) => p.length),
                              }),
                            },
                            {
                              label: "Window",
                              getDropdown: () => ({
                                itemGroups: [
                                  [
                                    {
                                      text: "Minimize",
                                      shortcut: (0, pl.parsePattern)("alt+M"),
                                      onClick: () => u.onMinimize(),
                                    },
                                  ],
                                ].filter((p) => p.length),
                              }),
                            },
                          ],
                        }),
                        resizing: {
                          minSize: { width: 370, height: 180 },
                          ...(a.videoSize && {
                            alterSize: (u) => VS(u, a.videoSize.width / a.videoSize.height),
                          }),
                        },
                        render: ({ control: u }) =>
                          OS({
                            video: a,
                            windowControl: u,
                            onClose: c,
                            system: n,
                            file: s.file,
                            onChangeFile: (p) =>
                              i.change((m) =>
                                m.map((d) => (d !== s ? d : { ...d, file: p }))
                              ),
                          }),
                      });
                    }
                  ),
              })),
            })
        ),
    },
    VS = (e, t) =>
      e.width / e.height > t
        ? { height: e.height, width: e.height * t }
        : { width: e.width, height: e.width / t };
  /* ── PDF Preview launcher ── */
  function _renderPdfToContainer(el, url, scale) {
    var _scale = scale || 1.5;
    var lib = globalThis.pdfjsLib;
    if (!lib) { el.textContent = "PDF viewer not loaded"; return; }
    var scrollTop = el.scrollTop || 0;
    lib.getDocument(url).promise.then(function (pdf) {
      el.innerHTML = "";
      el._pdfDoc = pdf;
      el._pdfUrl = url;
      el._pdfScale = _scale;
      for (var i = 1; i <= pdf.numPages; i++) {
        (function (pageNum) {
          pdf.getPage(pageNum).then(function (page) {
            var viewport = page.getViewport({ scale: _scale });
            var canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.display = "block";
            canvas.style.margin = "4px auto";
            canvas.style.maxWidth = "100%";
            el.appendChild(canvas);
            page.render({ canvasContext: canvas.getContext("2d"), viewport: viewport });
          });
        })(i);
      }
      requestAnimationFrame(function () { el.scrollTop = scrollTop; });
    }).catch(function (err) {
      console.warn("[PDF Preview] Render failed:", err);
      el.textContent = "Failed to load PDF";
      el.style.color = "rgba(255,255,255,0.3)";
      el.style.textAlign = "center";
      el.style.paddingTop = "40px";
    });
  }
  function _pdfZoom(containerId, delta, badgeId) {
    var el = document.getElementById(containerId);
    if (!el || !el._pdfUrl) return;
    var cur = el._pdfScale || 1.5;
    var next = Math.min(3.0, Math.max(0.5, cur + delta));
    if (next === cur) return;
    el._pdfDone = true;
    _renderPdfToContainer(el, el._pdfUrl, next);
    var badge = document.getElementById(badgeId);
    if (badge) badge.textContent = Math.round(next * 100) + "%";
  }
  var _pdfId = 0,
    _pdfHeaderHeight = 29,
    pdfPreviewLauncher = {
      key: "preview",
      icon: "/macos-demo/preview.webp",
      resolveFileThumbnail: async (e, { fs: t }) => {
        var c = await t.readFile(e);
        return c && c.thumbnail ? c.thumbnail : null;
      },
      renderProcess: ({ next: e, params: t, onClose: r }) =>
        (0, hl.cs)(
          [
            "windows",
            (i, s) =>
              (0, ul.UseState)({
                getInitValue: () => [{ id: _pdfId++, initPos: { x: 80, y: 60 }, file: t.file }],
                next: s,
              }),
          ],
          ({ windows: i }) =>
            e({
              open: (s) =>
                i.change((n) => [
                  ...n,
                  {
                    id: _pdfId++,
                    file: s.file,
                    initPos: {
                      x: Math.floor(Math.random() * 120) + 40,
                      y: Math.floor(Math.random() * 80) + _pdfHeaderHeight + 10,
                    },
                  },
                ]),
              windows: i.value.map((s) => ({
                id: s.id,
                renderWindowLogic: ({ system: n, next: o }) =>
                  (0, hl.cs)(
                    ["alwaysOnTop", (a, l) => (0, ul.UseState)({ next: l })],
                    ({ alwaysOnTop: a }) => {
                      var fileName = (0, ic.last)(s.file) || "PDF";
                      var closeWindow = () => {
                        i.value.length > 1 ? i.change((u) => u.filter((p) => p !== s)) : r();
                      };
                      return o({
                        close: closeWindow,
                        initPos: s.initPos,
                        initSize: { width: 680, height: 520 },
                        alwaysOnTop: a.value,
                        getAppMenu: ({ windowControl: u }) => ({
                          appLabel: "Preview",
                          getMainDropdown: () => ({
                            itemGroups: [[{ text: "Quit Preview", onClick: r }]],
                          }),
                          items: [
                            {
                              label: "View",
                              getDropdown: () => ({
                                itemGroups: [
                                  [
                                    {
                                      text: "Float On Top",
                                      checkbox: { checked: a.value },
                                      onClick: () => a.change((p) => !p),
                                    },
                                    {
                                      text: u.isFullScreen()
                                        ? "Exit Full Screen"
                                        : "Enter Full Screen",
                                      onClick: () =>
                                        u.isFullScreen()
                                          ? u.onUnmaximize()
                                          : u.onMaximize(),
                                    },
                                  ],
                                ],
                              }),
                            },
                            {
                              label: "Window",
                              getDropdown: () => ({
                                itemGroups: [
                                  [
                                    {
                                      text: "Minimize",
                                      onClick: () => u.onMinimize(),
                                    },
                                  ],
                                ],
                              }),
                            },
                          ],
                        }),
                        resizing: { minSize: { width: 340, height: 260 } },
                        render: ({ control: u }) =>
                          (0, cl.cs)(
                            (0, NS.keyed)(JSON.stringify(s.file)),
                            ["fileContent", ({ }, l) => (0, kS.Load)({ fetch: () => n.fs.readFile(s.file), next: l })],
                            ({ fileContent: l }) => {
                              var _pcid = "__pdf_" + s.id;
                              var _zoomBadgeId = "__pdf_zoom_" + s.id;
                              if (l && l.url) {
                                requestAnimationFrame(function _pdfMount() {
                                  var _c = document.getElementById(_pcid);
                                  if (_c && !_c._pdfDone) {
                                    _c._pdfDone = true;
                                    _renderPdfToContainer(_c, l.url);
                                  } else if (!_c) {
                                    requestAnimationFrame(_pdfMount);
                                  }
                                });
                              }
                              return jr.createElement(
                                "div",
                                {
                                  className: _("pdf-preview-window-it", { focused: u.focused, fullScreen: u.fullScreen }),
                                },
                                !u.fullScreen &&
                                jr.createElement(
                                  "div",
                                  { className: "header", ...u.dragging },
                                  xe({ onClose: closeWindow, windowControl: u, disableMaximize: !0 }),
                                  jr.createElement("div", { className: "title" }, fileName),
                                  jr.createElement(
                                    "div",
                                    { className: "pdf-zoom-controls", onMouseDown: function (ev) { ev.stopPropagation(); } },
                                    jr.createElement("button", { className: "pdf-zoom-btn", onClick: function () { _pdfZoom(_pcid, -0.25, _zoomBadgeId); } }, "\u2212"),
                                    jr.createElement("span", { className: "pdf-zoom-badge", id: _zoomBadgeId }, "150%"),
                                    jr.createElement("button", { className: "pdf-zoom-btn", onClick: function () { _pdfZoom(_pcid, 0.25, _zoomBadgeId); } }, "+")
                                  )
                                ),
                                l && l.url
                                  ? jr.createElement("div", {
                                    id: _pcid,
                                    className: "pdf-canvas-container",
                                    style: {
                                      width: "100%",
                                      flex: "1 1 0",
                                      overflowY: "auto",
                                      borderRadius: u.fullScreen ? "0" : "0 0 12px 12px",
                                      background: "#525659",
                                    },
                                  })
                                  : jr.createElement("div", { className: "loading" }, "Loading PDF...")
                              );
                            }
                          ),
                      });
                    }
                  ),
              })),
            })
        ),
    };
  /* ── end PDF Preview launcher ── */
  var n_ = h($S()),
    o_ = h(KS()),
    a_ = h(t1()),
    l_ = h(P1());
  var ye = h(E());
  U();
  var nr = h(S()),
    Vw = h(P()),
    Uw = h(X()),
    Ml = h(B()),
    Ul = h(de()),
    ai = h(A()),
    Ww = h(oe()),
    Hw = h(T()),
    li = h(V());
  Zr();
  var sr = h(me()),
    Bl = h(k1()),
    Gl = h(F1()),
    Jl = h(L1()),
    Vl = h(nw());
  var hw = h(S()),
    Tl = h(P()),
    uw = h(A()),
    pw = h(ct()),
    Pl = h(pe()),
    fw = h(lw()),
    mw = h(X()),
    fe = h(Ia()),
    dw = h(V()),
    gw = ({ next: e }) =>
      (0, hw.cs)(
        ["state", (t, r) => (0, uw.UseState)({ next: r })],
        [
          "magRatio",
          ({ state: t }, r) =>
            (0, fw.ValueTransition)({ delay: 100, value: t.value && !t.value.stopping ? 1 : 0, next: r }),
        ],
        ({ state: t, magRatio: r }) =>
          (0, Tl.fragments)(
            t.value &&
            !t.value.stopping &&
            (0, Tl.fragments)(
              (0, pw.GlobalMouseMove)({
                action: (i) => {
                  let s = i.clientX;
                  (0, Pl.spc)(t, ["pos"], () => s);
                },
              })
            ),
            !r && t.value?.stopping && (0, mw.Invoke)({ action: () => t.onChange(null) }),
            e({
              start: t.onChange,
              stop: () => (0, Pl.spc)(t, ["stopping"], () => !0),
              apply: (i, s) =>
                !r || !t.value
                  ? i
                  : j8(i, { pos: t.value.pos - t.value.center, range: 150, maxRatio: s * r }),
            })
          )
      ),
    j8 = (e, { pos: t, range: r, maxRatio: i }) => {
      let s = { from: t - r, to: t },
        n = { from: t, to: t + r };
      return (0, dw.chain)(
        e.map((o) => {
          let a = { from: o.pos - o.size / 2, to: o.pos + o.size / 2 };
          return !(0, fe.conflict)(a, s) && !(0, fe.conflict)(a, n)
            ? o
            : {
              ...o,
              pos: null,
              size:
                o.size +
                (((0, fe.conflict)(a, s) ? cw(a, s, 0, i) : 0) +
                  ((0, fe.conflict)(a, n) ? cw(a, n, i, 0) : 0)),
            };
        }),
        (o) => {
          let a = (r * i) / 2;
          return o.map((l, c) => ({
            ...l,
            pos: (() => {
              let u = e[c].pos;
              if (u >= t + r) return u + a;
              if (u < t - r) return u - a;
              let p = Math.abs(u - t),
                m = Bs(i, i * (1 - p / r), p);
              return u + m * (u < t ? -1 : 1);
            })(),
          }));
        }
      );
    },
    cw = (e, t, r, i) => {
      if ((0, fe.inRange)(t.from, e)) {
        let a = e.to - t.from,
          l = r + (i - r) * (a / (0, fe.rangeLength)(t));
        return Bs(r, l, a);
      }
      if ((0, fe.inRange)(t.to, e)) {
        let a = t.to - e.from,
          l = i + (r - i) * (a / (0, fe.rangeLength)(t));
        return Bs(l, i, a);
      }
      let s = r + (i - r) * ((e.from - t.from) / (0, fe.rangeLength)(t)),
        n = r + (i - r) * ((e.to - t.from) / (0, fe.rangeLength)(t)),
        o = (0, fe.rangeLength)(e);
      return Bs(s, n, o);
    },
    Bs = (e, t, r) => {
      let i = Math.min(e, t),
        s = Math.max(e, t);
      return i * r + ((s - i) * r) / 2;
    };
  var kl = h(S()),
    xw = h(B()),
    yw = h(A());
  $r();
  var Rw = h(Nl()),
    vw = h(ht()),
    Sw = h(ge()),
    ww = h(Q());
  Zr();
  var Cw = h(Ne()),
    _w = h(me()),
    Dw = ({ next: e }) =>
      (0, kl.cs)(
        ["minifyings", (t, r) => (0, yw.UseState)({ next: r })],
        [
          "minifyings2",
          ({ minifyings: t }, r) =>
            (0, ww.Shadow)({
              renderShadow: ({ accept: i }) =>
                t.value?.map((s) =>
                  (0, kl.cs)((0, xw.keyed)(JSON.stringify(s.wk)), () =>
                    (0, Cw.TransitionProgress)({
                      duration: 150,
                      onDone: () => {
                        s.onDone(), t.change((n) => n.filter((o) => o !== s));
                      },
                      next: (n) => i({ ...s, progress: n }),
                    })
                  )
                ),
              next: r,
            }),
        ],
        ({ minifyings: t, minifyings2: r }) =>
          e({
            addWindow: (i, { pos: s, size: n, oriPs: o, onDone: a }) => {
              t.change((l) => [...(l ?? []), { wk: i, size: n, pos: s, oriPs: o, onDone: a }]);
            },
            isActive: (i) => t.value?.some((s) => (0, _w.matchKey)(s.wk, i)),
            windowOverrides: r?.map((i) => {
              let s = i.oriPs,
                n = i.size,
                o = xt(n, s.size),
                a = yt(s.size, o),
                l = {
                  x: i.pos.x - n.width / 2 + (n.width - a.width) / 2,
                  y: i.pos.y - n.height / 2 + (n.height - a.height) / 2,
                };
              return {
                key: i.wk,
                ps: s,
                override: {
                  ps: {
                    ...s,
                    pos: (0, Sw.addVector)(
                      s.pos,
                      (0, Rw.multiplyVector)((0, vw.subtractVector)(l, s.pos), i.progress)
                    ),
                  },
                  scale: o + (1 - i.progress) * (1 - o),
                  noShadow: !0,
                  aboveAll: !0,
                  inert: !0,
                },
              };
            }),
          })
      );
  var ql = h(S()),
    Pw = h(A()),
    Ll = h(ls());
  var Il = h(S()),
    bw = h(Q()),
    Ew = h(B()),
    Fl = h(Ne()),
    Aw = h(P()),
    Tw = ({ placeholders: e, onRemove: t, next: r }) =>
      (0, Il.cs)(() =>
        (0, bw.Shadow)({
          renderShadow: ({ accept: i }) =>
            e?.map((s) =>
              (0, Il.cs)((0, Ew.keyed)(s.id), () =>
                (0, Aw.fragments)(
                  !s.closing &&
                  (0, Fl.TransitionProgress)({
                    duration: 150,
                    next: (n) => i({ ...s, scale: n }),
                  }),
                  s.closing &&
                  (0, Fl.TransitionProgress)({
                    duration: 150,
                    onDone: () => {
                      t(s);
                    },
                    next: (n) => i({ ...s, scale: 1 - n }),
                  })
                )
              )
            ),
          next: r,
        })
      );
  var Nw = ({ next: e }) =>
    (0, ql.cs)(
      ["placeholders", (t, r) => (0, Pw.UseState)({ next: r })],
      [
        "lv1Params",
        ({ placeholders: t }) =>
          e({
            renderTrans: (r) =>
              (0, ql.cs)(
                [
                  "transPlaceholders",
                  ({ }, i) =>
                    Tw({
                      placeholders: t.value,
                      onRemove: (s) => t.change((n) => n.filter((o) => o !== s)),
                      next: i,
                    }),
                ],
                ({ transPlaceholders: i }) => r(i)
              ),
            addPlaceholder: () => {
              let r = { id: (0, Ll.randomId)() };
              return t.change((i) => [...(i ?? []), r]), r;
            },
            addClosingPlaceholder: (r) => {
              t.change((i) => [
                ...(i ?? []),
                { id: (0, Ll.randomId)(), closing: !0, ...(r != null && { getIndex: () => r }) },
              ]);
            },
            removePlaceholder: (r) => {
              t.change((i) => i.filter((s) => s.id !== r));
            },
          }),
      ]
    );
  var Ol = h(S()),
    kw = h(B()),
    Iw = h(A());
  $r();
  var Fw = h(Nl()),
    qw = h(ht()),
    Lw = h(ge()),
    Ow = h(Q()),
    Mw = h(Ne()),
    Bw = h(me()),
    Gw = ({ next: e }) =>
      (0, Ol.cs)(
        ["unminifyings", (t, r) => (0, Iw.UseState)({ next: r })],
        [
          "unminifyings2",
          ({ unminifyings: t }, r) =>
            (0, Ow.Shadow)({
              renderShadow: ({ accept: i }) =>
                t.value?.map((s) =>
                  (0, Ol.cs)((0, kw.keyed)(JSON.stringify(s.wk)), () =>
                    (0, Mw.TransitionProgress)({
                      duration: 150,
                      onDone: () => {
                        s.onDone?.(), t.change((n) => n.filter((o) => o !== s));
                      },
                      next: (n) => i({ ...s, progress: n }),
                    })
                  )
                ),
              next: r,
            }),
        ],
        ({ unminifyings: t, unminifyings2: r }) =>
          e({
            addWindow: ({ wk: i, rect: s, oriPs: n, onDone: o }) => {
              t.change((a) => [...(a ?? []), { wk: i, rect: s, oriPs: n, onDone: o }]);
            },
            isActive: (i) => t.value?.some((s) => (0, Bw.matchKey)(s.wk, i)),
            windowOverrides: r?.map((i) => {
              let s = i.oriPs,
                n = i.rect,
                o = xt(n, s.size),
                a = i.rect;
              return {
                key: i.wk,
                ps: s,
                override: {
                  ps: {
                    ...s,
                    pos: (0, Lw.addVector)(
                      s.pos,
                      (0, Fw.multiplyVector)((0, qw.subtractVector)(a, s.pos), 1 - i.progress)
                    ),
                  },
                  scale: o + i.progress * (1 - o),
                  noShadow: !0,
                  aboveAll: !0,
                  inert: !0,
                },
              };
            }),
          })
      );
  var zw = ({ runningProcesses: e, windowLogics: t, next: r }) =>
    (0, nr.cs)(
      ["placeholders", (i, s) => Nw({ next: s })],
      ["minifiedWindows", (i, s) => (0, ai.UseState)({ next: s })],
      ["domRef", (i, s) => (0, Ul.Static2)({ next: s })],
      ["resolves", (i, s) => (0, ai.UseState)({ next: s })],
      ["minifyAnimation", (i, s) => Dw({ next: s })],
      ["unminimizeAnimation", (i, s) => Gw({ next: s })],
      [
        "unminimize",
        ({ resolves: i, minifiedWindows: s, placeholders: n, unminimizeAnimation: o }, a) =>
          a((l, c) => {
            let u = (m) => {
              let d = s.value.findIndex((g) => (0, sr.matchKey)(g.wk, m));
              return (
                n.addClosingPlaceholder(s.value.length ? d : null),
                s.change((g) => g.filter((y, x) => x !== d)),
                { oriPs: s.value[d].oriPs }
              );
            };
            ((m, d) => i.change((g) => [...(g ?? []), { key: Date.now(), wk: m, fn: d }]))(l, (m) => {
              let { oriPs: d } = u(l);
              o.addWindow({ wk: l, rect: m, oriPs: d, onDone: () => c(d) });
            });
          }),
      ],
      [
        "lv1Params",
        (
          {
            domRef: i,
            placeholders: s,
            minifiedWindows: n,
            unminimize: o,
            resolves: a,
            minifyAnimation: l,
            unminimizeAnimation: c,
          },
          u
        ) => {
          let p = () => {
            let d = s.addPlaceholder(),
              g = (0, li.chain)(
                (0, Vl.getGroups)({ runningProcesses: e, minifiedWindows: n.value }),
                (x) => Jw([d], x),
                (x) => (0, Gl.calStaticPos)((0, Bl.calStatic)(x))
              ),
              y = i.get().getBoundingClientRect();
            return {
              pos: { x: g.find((x) => x.id === d.id).pos + y.x, y: y.y - 8 - 33 },
              size: { width: 48, height: 48 },
              id: d.id,
            };
          },
            m = (d, { placeholderId: g, oriPs: y }) => {
              s.removePlaceholder(g), n.change((x) => [...(x ?? []), { wk: d, oriPs: y }]);
            };
          return r({
            getMinimizedWin: (d) => n.value?.find(({ wk: g }) => g.processId === d)?.wk,
            windowLogics: t?.filter(
              (d) =>
                !l.isActive(d.key) &&
                !c.isActive(d.key) &&
                !n.value?.some((g) => (0, sr.matchKey)(d.key, g.wk))
            ),
            minimizeWindow: (d, { ps: g }) => {
              let { id: y, pos: x, size: R } = p();
              l.addWindow(d, {
                pos: x,
                size: R,
                oriPs: g,
                onDone: () => {
                  m(d, { placeholderId: y, oriPs: g });
                },
              });
            },
            padding: {},
            unminimize: o,
            next: u,
          });
        },
      ],
      ["transPlaceholders", ({ placeholders: i }, s) => i.renderTrans(s)],
      [
        "itemsStatic",
        (
          {
            transPlaceholders: i,
            minifiedWindows: s,
            lv1Params: { onSelectLauncher: n, onUnminimize: o },
            unminimize: a,
          },
          l
        ) =>
          l(
            (0, li.chain)(
              (0, Vl.getGroups)({
                runningProcesses: e,
                onSelectLauncher: n,
                onUnminimize: (c) => a(c, (u) => o({ wk: c, ps: u })),
                minifiedWindows: s.value,
              }),
              (c) => Jw(i, c),
              (c) => (0, Gl.calStaticPos)((0, Bl.calStatic)(c))
            )
          ),
      ],
      ["magnifying", (i, s) => gw({ next: s })],
      ["items", ({ itemsStatic: i, magnifying: s }, n) => n(s.apply(i, 1))],
      ({ resolves: i, domRef: s, items: n, minifiedWindows: o, lv1Params: a }, l) =>
        (0, Vw.fragments)(
          l(),
          i.value?.map((c) =>
            (0, nr.cs)((0, Ml.keyed)(c.key), () =>
              (0, Uw.Invoke)({
                action: () => {
                  let u = c.wk,
                    p = s.get()?.getBoundingClientRect(),
                    m = n.find((x) => x.wk && (0, sr.matchKey)(x.wk, u)),
                    d = o.value?.find((x) => (0, sr.matchKey)(x.wk, u)),
                    { scale: g, pos: y } = (0, Jl.calWinPos)({
                      rootX: p.x,
                      item: m,
                      oriPs: d.oriPs,
                      hidden: a.hidden,
                    });
                  c.fn({ ...y, ...yt(d.oriPs.size, g) });
                },
              })
            )
          )
        ),
      (
        {
          items: i,
          itemsStatic: s,
          magnifying: n,
          domRef: o,
          minifiedWindows: a,
          lv1Params: l,
          minifyAnimation: c,
          unminimizeAnimation: u,
        },
        p
      ) => {
        let m = (g) => {
          let y = g[0].pos - g[0].size / 2 - 5;
          return { left: y, width: g[g.length - 1].pos + g[g.length - 1].size / 2 + 5 - y };
        },
          d = o.get()?.getBoundingClientRect();
        return l.next({
          windows: [
            ...(c.windowOverrides ?? []),
            ...(u.windowOverrides ?? []),
            ...(a.value?.map(({ wk: g, oriPs: y }) => ({
              key: g,
              ps: y,
              override: (() => {
                let x = i.find((b) => b.wk && (0, sr.matchKey)(b.wk, g)),
                  { scale: R, pos: w } = (0, Jl.calWinPos)({
                    rootX: d.x,
                    item: x,
                    oriPs: y,
                    hidden: l.hidden,
                  });
                return {
                  ps: { size: y.size, pos: w },
                  scale: R,
                  noShadow: !0,
                  aboveAll: !0,
                  inert: !0,
                };
              })(),
            })) ?? []),
          ],
          render: ({ zIndex: g, className: y }) =>
            ye.createElement(
              "div",
              {
                className: _("dock-4b1 pin-point", y),
                style: { bottom: 0 - (l.hidden ?? 0) * (70 + 8) },
                onMouseEnter: (x) => {
                  let R = o.get().getBoundingClientRect().x;
                  return n.start({ center: R, pos: x.clientX });
                },
                ref: o.set,
                onMouseLeave: n.stop,
              },
              ye.createElement("div", { className: "visible-area", style: { ...m(i), zIndex: g } }),
              ye.createElement("div", {
                className: "prevent-flickering",
                style: { ...m(s), zIndex: g },
              }),
              ye.createElement(
                "div",
                { className: "items" },
                i.map((x) =>
                  (0, nr.cs)((0, Ml.keyed)(x.key), () =>
                    x.type === "launcher"
                      ? iG({
                        icon: x.icon,
                        onClick: x.onClick,
                        active: x.active,
                        size: x.size,
                        pos: x.pos,
                        zIndex: g,
                      })
                      : x.type === "minimized-window"
                        ? sG({
                          icon: x.icon,
                          onClick: x.onClick,
                          size: x.size,
                          pos: x.pos,
                          zIndex: g,
                        })
                        : ye.createElement("div", {
                          className: "separator",
                          style: { left: x.pos - x.size / 2, width: x.size, zIndex: g },
                        })
                  )
                )
              )
            ),
        });
      }
    ),
    Jw = (e, t) => {
      if (!e?.length) return t;
      let r = t.findIndex((i) => i.key === "minimized-windows");
      return r === -1
        ? [...t, { key: "minimized-windows", items: e.map((i) => ({ ...i, key: i.id })) }]
        : (0, Ww.changePath)(t, [r, "items"], (i) =>
          (0, li.chain2)(
            i,
            e.map((s) => (n) => {
              let o = (s.getIndex ?? ((a) => a.length))(n);
              return (0, Hw.insertAt)(n, { ...s, key: s.id }, o);
            })
          )
        );
    },
    iG = ({ icon: e, onClick: t, active: r, size: i, pos: s, zIndex: n }) =>
      (0, nr.cs)(["clicked", (o, a) => (0, ai.UseState)({ next: a })], ({ clicked: o }) =>
        ye.createElement(
          "div",
          {
            className: _("launcher", { clicked: o.value }),
            onMouseDown: () => o.onChange(!0),
            onMouseUp: () => o.onChange(!1),
            style: { left: s - i / 2, width: i, paddingLeft: i / 16, paddingRight: i / 16, zIndex: n },
            onClick: t,
          },
          ye.createElement("img", { src: e, draggable: !1 }),
          ye.createElement("div", { className: "dot" }, r && ye.createElement("div", { className: "dot" }))
        )
      ),
    sG = ({ icon: e, onClick: t, size: r, pos: i, zIndex: s }) =>
      (0, nr.cs)(
        ["clicked", (n, o) => (0, ai.UseState)({ next: o })],
        ["domRef", (n, o) => (0, Ul.Static2)({ next: o })],
        ({ clicked: n, domRef: o }) =>
          ye.createElement(
            "div",
            {
              className: _("minimized-window", { clicked: n.value }),
              onMouseDown: () => n.onChange(!0),
              onMouseUp: () => n.onChange(!1),
              ref: o.set,
              onClick: t,
              style: {
                left: i - r / 2,
                width: r,
                paddingLeft: r / 16,
                paddingRight: r / 16,
                zIndex: s + 100,
              },
            },
            ye.createElement(
              "div",
              { className: "content" },
              ye.createElement("img", { src: e, draggable: !1 })
            )
          )
      );
  var St = h(E()),
    iC = h(S());
  var vt = h(E()),
    or = h(S());
  var Kw = h(P()),
    Yw = h(Zw());
  var Re = h(E());
  U();
  var Js = h(S()),
    Wl = h(B()),
    Qw = h(Ir()),
    Vs = ({ isActive: e, inactive: t, className: r, onClose: i, getContent: s, next: n }) =>
      (0, Js.cs)(
        ["content", (o, a) => a(t ? null : s?.())],
        ({ content: o }, a) =>
          Re.createElement(
            "div",
            { className: _(r, { active: e }) },
            n(),
            o?.itemGroups.map((l) =>
              l.map((c, u) =>
                (0, Js.cs)(
                  (0, Wl.keyed)(u),
                  () =>
                    c.shortcut &&
                    !!c.onClick &&
                    (0, Qw.GlobalShortCut)({ keyCombo: c.shortcut, action: c.onClick })
                )
              )
            ),
            e && s && a({})
          ),
        ({ content: o }) =>
          Re.createElement(
            "div",
            { className: "dropdown dropdown-1xg", onClick: (a) => a.stopPropagation() },
            o.itemGroups.map((a, l) =>
              (0, Js.cs)((0, Wl.keyed)(l), () =>
                Re.createElement(
                  Re.Fragment,
                  null,
                  Re.createElement(
                    "div",
                    { className: "item-group" },
                    a.map((c, u) =>
                      Re.createElement(
                        "div",
                        {
                          className: _("item", { disabled: !c.onClick }),
                          onClick: c.onClick
                            ? () => {
                              i(), c.onClick();
                            }
                            : void 0,
                          key: u,
                        },
                        Re.createElement("div", { className: "text" }, c.text),
                        c.shortcut &&
                        Re.createElement(
                          "div",
                          { className: "shortcut" },
                          c.shortcut.masks?.map((p) => uG[p]).join(""),
                          c.shortcut.key.length === 1
                            ? c.shortcut.key.toUpperCase()
                            : Xw[c.shortcut.key]
                              ? Re.createElement("i", {
                                className: _("fa", Xw[c.shortcut.key]),
                              })
                              : Re.createElement(
                                "div",
                                { className: "key" },
                                c.shortcut.key
                              )
                        )
                      )
                    )
                  ),
                  l < o.itemGroups.length - 1 && Re.createElement("div", { className: "separator" })
                )
              )
            )
          )
      ),
    Xw = { arrowup: "fa-caret-up" },
    uG = { meta: String.fromCharCode(8984), alt: String.fromCharCode(8997), shift: "\u21E7", ctrl: "\u2303" };
  var jw = h(B()),
    eC = h(A());
  U();
  var tC = ({ appMenu: e, systemMenu: t, inactive: r, className: i }) =>
    (0, or.cs)(
      ["activeControl", (s, n) => pG({ next: n })],
      ({ activeControl: s }, n) =>
        (0, Kw.fragments)(s.active && (0, Yw.AnyAction1)({ action: s.cancel }), n()),
      ({ activeControl: s }) =>
        vt.createElement(
          "div",
          { className: _("left-menu left-menu-3na", i) },
          (0, or.cs)(
            ["active", ({ }, n) => n(s.perItem("system"))],
            ({ active: n }, o) =>
              Vs({
                inactive: r,
                isActive: n.isActive,
                className: "system-btn",
                onClose: s.cancel,
                getContent: () => t,
                next: o,
              }),
            ({ active: n }) =>
              vt.createElement(
                "button",
                { className: "toggle", onClick: n.activate, onMouseEnter: n.onHover },
                vt.createElement(
                  "svg",
                  {
                    width: "1.2em",
                    height: "1.2em",
                    preserveAspectRatio: "xMidYMid meet",
                    viewBox: "0 0 24 24",
                  },
                  vt.createElement("path", {
                    d: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47c-1.34.03-1.77-.79-3.29-.79c-1.53 0-2 .77-3.27.82c-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51c1.28-.02 2.5.87 3.29.87c.78 0 2.26-1.07 3.81-.91c.65.03 2.47.26 3.64 1.98c-.09.06-2.17 1.28-2.15 3.81c.03 3.02 2.65 4.03 2.68 4.04c-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5c.13 1.17-.34 2.35-1.04 3.19c-.69.85-1.83 1.51-2.95 1.42c-.15-1.15.41-2.35 1.05-3.11z",
                    fill: "currentColor",
                  })
                )
              )
          ),
          (0, or.cs)(
            ["active", ({ }, n) => n(s.perItem("app"))],
            ({ active: n }, o) =>
              Vs({
                inactive: r,
                isActive: n.isActive,
                className: "app-btn",
                onClose: s.cancel,
                getContent: e.getMainDropdown,
                next: o,
              }),
            ({ active: n }) =>
              vt.createElement(
                "button",
                { className: "toggle", onClick: n.activate, onMouseEnter: n.onHover },
                e.appLabel
              )
          ),
          (0, or.cs)(
            ["item", ({ }, n) => e.items?.map(n)],
            ({ item: n }, o) => (0, jw.keyed1)({ key: n.label, next: o }),
            ["active", ({ item: n }, o) => o(s.perItem("item$" + n.label))],
            ({ active: n, item: o }, a) =>
              Vs({
                inactive: r,
                isActive: n.isActive,
                className: "item-btn",
                onClose: s.cancel,
                getContent: o.getDropdown,
                next: a,
              }),
            ({ active: n, item: o }) =>
              vt.createElement(
                "button",
                { className: "toggle", onClick: n.activate, onMouseEnter: n.onHover },
                o.label
              )
          )
        )
    ),
    pG = ({ next: e }) =>
      (0, or.cs)(["active", (t, r) => (0, eC.UseState)({ next: r })], ({ active: t }) =>
        e({
          active: t.value != null,
          cancel: () => {
            t.onChange(null);
          },
          perItem: (r) => ({
            isActive: t.value === r,
            activate: () => {
              t.value == null && t.onChange(r);
            },
            onHover: () => t.value != null && t.onChange(r),
          }),
        })
      );
  U();
  var sC = h(Us()),
    nC = h(B()),
    oC = ({ appMenu: e, systemMenu: t, key: r, inactive: i, hidden: s, height: n }) =>
      (0, iC.cs)(
        ({ }, o) =>
          St.createElement(
            "div",
            {
              className: _("header header-6ij", { inactive: i, hidden: s }),
              style: { ...(i && { opacity: 1 - i }), height: n },
            },
            o()
          ),
        ({ }, o) => (0, sC.IgnoreUpdate)({ props: i, when: (a) => a && i, next: o }),
        (0, nC.keyed)(r),
        () =>
          St.createElement(
            St.Fragment,
            null,
            tC({ appMenu: e, systemMenu: t, className: "left", inactive: i }),
            St.createElement("div", { className: "spacer" }),
            St.createElement("div", { className: "right" })
          )
      );
  var ar = h(Ce()),
    aC = ({ showAboutModal: e, activateMissionControl: t, desktopsControl: r }) => ({
      itemGroups: [
        [{ text: "About this MacOS demo", onClick: e }],
        [{ text: "Mission Control", onClick: t, shortcut: (0, ar.parsePattern)("alt+E") }],
        [
          {
            text: "Add New Desktop",
            onClick: r.addNewDesktop,
            shortcut: (0, ar.parsePattern)("meta+alt+shift+N"),
          },
          {
            text: "Remove this Desktop",
            onClick: r.removeThisDesktop,
            shortcut: (0, ar.parsePattern)("meta+alt+shift+W"),
          },
          {
            text: "To Left Desktop",
            onClick: r.toLeftDesktop,
            shortcut: (0, ar.parsePattern)("meta+alt+shift+K"),
          },
          {
            text: "To Right Desktop",
            onClick: r.toRightDesktop,
            shortcut: (0, ar.parsePattern)("meta+alt+shift+L"),
          },
        ],
      ],
    });
  var Ze = h(E());
  var lC = h(E()),
    cC = h(S());
  var hC = ({ }) =>
    (0, cC.cs)(() =>
      lC.createElement("div", {
        className: "background background-047",
        style: { backgroundImage: `url(${ea()})` },
      })
    );
  var fC = h(E()),
    lr = h(S());
  var mC = h(pC()),
    Ws = h(B());
  U();
  var dC = ({
    className: e,
    layers: { layer1: t, renderLayer2: r, layer3: i, renderLayer4: s, layer5: n },
    staticMode: o,
    transitionMode: a,
  }) =>
    (0, lr.cs)(() => {
      let l = ({ render: c }) =>
        (0, lr.cs)(
          ["ids", (u, p) => (0, mC.StaticIds)({ active: a && { forward: a.progress > 0.5 }, next: p })],
          ({ ids: u }) =>
            a
              ? [
                (0, lr.cs)((0, Ws.keyed)(u.oldIndex), () => c(a.oldParams)),
                (0, lr.cs)((0, Ws.keyed)(u.newIndex), () => c(a.newParams)),
              ]
              : [(0, lr.cs)((0, Ws.keyed)(u.current), () => c(o.params))]
        );
      return fC.createElement(
        "div",
        { className: _("trans-screen trans-screen-6wj", e) },
        t,
        l({ render: r }),
        i,
        l({ render: s }),
        n
      );
    });
  var hi = h(kr());
  var ci = h(E());
  U();
  var zl = h(S()),
    vC = h(B()),
    $l = h(V()),
    Zl = h(yC()),
    SC = ({ windows: e, resolveThumbnail: t }) =>
      (0, zl.cs)(
        ({ }, r) => ci.createElement("div", { className: "windows windows-display-9zq" }, r()),
        ["window", ({ }, r) => e?.map(r)],
        ({ window: r }) =>
          (0, zl.cs)(
            (0, vC.keyed)(JSON.stringify(r.key)),
            ["window1", ({ }, i) => r.render1(i)],
            ({ window1: i }, s) =>
              ci.createElement(
                "div",
                {
                  className: _("window-boundary", {}),
                  "data-key": JSON.stringify(r.key),
                  style: {
                    zIndex: (i.aboveAll ? e.length + 100 : 0) + i.zIndex,
                    ...(0, $l.chain)(
                      i.boundary.pos ?? { x: 0, y: 0 },
                      (n) =>
                        i.boundary.scale
                          ? (0, Zl.getScalePos)({
                            pos: n,
                            oriSize: { width: RC.innerWidth, height: RC.innerHeight },
                            scale: i.boundary.scale,
                          })
                          : n,
                      (n) => ({ top: n.y, left: n.x })
                    ),
                    ...(i.boundary.scale && { transform: `scale(${i.boundary.scale})` }),
                    width: "100%",
                    height: "100%",
                    ...(i.boundary.transitioning && {
                      transition: i.boundary.transitioning
                        .map((n) => `${n} 300ms ease`)
                        .join(","),
                    }),
                  },
                },
                s(),
                i.boundary.blocking &&
                ci.createElement("div", { className: "blocking", ...i.boundary.blocking })
              ),
            ({ window1: i }, s) =>
              ci.createElement(
                "div",
                {
                  ...i.windowProps,
                  className: _(
                    "window",
                    { fullScreen: i.fullScreen, inert: i.inert },
                    "shadow-" + i.shadow
                  ),
                  style: {
                    ...(i.scale && { transform: `scale(${i.scale})` }),
                    ...(0, $l.chain)(
                      i.ps?.pos ?? { x: 0, y: 0 },
                      (n) =>
                        i.scale
                          ? (0, Zl.getScalePos)({
                            pos: n,
                            oriSize: i.ps.size,
                            scale: i.scale,
                          })
                          : n,
                      (n) => ({ top: n.y, left: n.x })
                    ),
                    ...(i.ps
                      ? { width: i.ps.size.width, height: i.ps.size.height }
                      : { width: "100%", height: "100%" }),
                    ...(i.hidden && { display: "none" }),
                  },
                },
                s()
              ),
            ({ window1: i }) => i.render({ resolveThumbnail: t })
          )
      ),
    RC = window;
  var wC = h(S()),
    CC = h(T()),
    _C = ({
      windows: e,
      transition: t,
      dock: r,
      desktops: i,
      renderUnderWindows: s,
      renderAboveWindows: n,
      header: o,
      currentDesktop: a,
      tableSurface: l,
      resolveThumbnail: c,
    }) =>
      (0, wC.cs)(
        ["normalWindowCount", (u, p) => p((0, CC.sum)(e, (m) => (m.aboveAll ? 0 : 1)))],
        ({ normalWindowCount: u }) =>
          dC({
            className: "screen-2cn",
            layers: {
              renderLayer2: ({ desktop: p, left: m }) =>
                Ze.createElement(
                  "div",
                  { className: "layer-48f", style: { left: m } },
                  !p.hideBackground && Ze.createElement(Ze.Fragment, null, hC({}), l)
                ),
              layer3: Ze.createElement(
                Ze.Fragment,
                null,
                s?.(),
                SC({ windows: e, resolveThumbnail: c }),
                n &&
                Ze.createElement(
                  "div",
                  { className: "above-windows", style: { zIndex: u + 1 } },
                  n()
                )
              ),
              renderLayer4: ({ desktop: p, left: m, desktopIndex: d }) =>
                Ze.createElement(
                  "div",
                  { className: "layer-48f", style: { left: m, zIndex: u + 2 } },
                  o({ hidden: p.hideHeader, desktopIndex: d })
                ),
              layer5: r({ className: "dock", zIndex: u + 3 }),
            },
            ...(t
              ? {
                transitionMode: (() => {
                  let { oldLeft: p, newLeft: m } =
                    t.desktopIndex > i.currentIndex
                      ? {
                        oldLeft: `calc(-${t.progress} * (100% + ${hi.desktopGap}px))`,
                        newLeft: `calc(${1 - t.progress} * (100% + ${hi.desktopGap}px))`,
                      }
                      : {
                        oldLeft: `calc(${t.progress} * (100% + ${hi.desktopGap}px))`,
                        newLeft: `calc(-${1 - t.progress} * (100% + ${hi.desktopGap}px))`,
                      };
                  return {
                    progress: t.progress,
                    oldParams: { left: p, desktop: a.display, desktopIndex: i.currentIndex },
                    newParams: {
                      left: m,
                      desktop: i.getDesktopDisplay(t.desktopIndex),
                      desktopIndex: t.desktopIndex,
                    },
                  };
                })(),
              }
              : { staticMode: { params: { desktop: a.display, desktopIndex: i.currentIndex } } }),
          })
      );
  var DC = h(E());
  U();
  var bC = h(S()),
    EC = h(Us()),
    AC = ({ inactive: e, marginTop: t, onClick: r, renderDesktop: i }) =>
      (0, bC.cs)(
        ({ }, s) =>
          DC.createElement(
            "div",
            {
              className: _("table-surface table-surface-0g8", { inactive: e }),
              onClick: r,
              style: { top: t, height: `calc(100% - ${t}px)` },
            },
            s()
          ),
        ({ }, s) => (0, EC.IgnoreUpdate)({ props: e, when: (n) => n && e, next: s }),
        () => i()
      );
  var c_ = h(NC()),
    fi = h(me());
  var ur = h(E()),
    Yl = h(S()),
    jl = h(Us()),
    $s = h(oe()),
    OC = h(T()),
    ec = h(V()),
    Q9 = h(j()),
    MC = h(ge()),
    BC = h(Cs()),
    GC = h(me());
  var hr = h(S()),
    zs = h(P());
  var Ql = h(E()),
    Kl = h(Cs()),
    wt = h(V()),
    ui = h(oe()),
    kC = h(Q());
  U();
  var Xl = h(B()),
    IC = ({ ps: e, marginTop: t, minSize: r, alterSize: i, next: s }) =>
      (0, hr.cs)(
        [
          "positions",
          (n, o) =>
            o([
              {
                min: -(e.value.pos.y - t),
                max: e.value.size.height - r.height,
                direction: "vertical",
                position: "start",
              },
              {
                min: -e.value.pos.x,
                max: e.value.size.width - r.width,
                direction: "horizontal",
                position: "start",
              },
              { min: -(e.value.size.height - r.height), direction: "vertical", position: "end" },
              { min: -(e.value.size.width - r.width), direction: "horizontal", position: "end" },
            ]),
        ],
        [
          "handlers",
          ({ positions: n }, o) =>
            (0, kC.Shadow)({
              renderShadow: ({ accept: a }) =>
                (0, zs.fragments)(
                  n.map((l, c) =>
                    (0, hr.cs)((0, Xl.keyed)(c), () => wG({ position: l, ps: e, next: a }))
                  ),
                  ["start", "end"].map((l) =>
                    ["start", "end"].map((c) =>
                      (0, hr.cs)((0, Xl.keyed)(c), () =>
                        CG({
                          ps: e,
                          positions: [
                            n.find((u) => u.direction === "vertical" && u.position === l),
                            n.find((u) => u.direction === "horizontal" && u.position === c),
                          ],
                          vertical: l,
                          horizontal: c,
                          next: a,
                        })
                      )
                    )
                  )
                ),
              next: (a) => o(a ?? []),
            }),
        ],
        ({ handlers: n }) =>
          s({
            ps: (0, wt.chain)(
              e.value,
              (o) => (0, wt.chain)(n.find((a) => a.alter)?.alter, (a) => (a ? a(o) : null)),
              (o) => (!o || !i ? o : (0, ui.changePath)(o, ["size"], i))
            ),
            controls: n.map((o) => o.render()),
          })
      ),
    wG = ({ position: e, ps: t, next: r }) =>
      (0, hr.cs)(["dragging", ({ }, i) => (0, Kl.Dragging)({ next: i })], ({ dragging: i }) => {
        let s = FC(e);
        return (0, zs.fragments)(
          i.renderOnDone({ action: () => t.change((n) => s(n, i.delta)) }),
          r({
            alter: i.delta ? (n) => s(n, i.delta) : null,
            render: () =>
              Ql.createElement("div", {
                className: _("resize-4rd", "edge", e.direction, e.position),
                key: "edge|" + e.direction + "|" + e.position,
                ...i.handle,
              }),
          })
        );
      }),
    CG = ({ ps: e, positions: t, vertical: r, horizontal: i, next: s }) =>
      (0, hr.cs)(["dragging", ({ }, n) => (0, Kl.Dragging)({ next: n })], ({ dragging: n }) => {
        let o = DG(t);
        return (0, zs.fragments)(
          n.renderOnDone({ action: () => e.change((a) => o(a, n.delta)) }),
          s({
            alter: n.delta ? (a) => o(a, n.delta) : null,
            render: () =>
              Ql.createElement("div", {
                key: "corner|" + r + "|" + i,
                className: _("resize-4rd", "corner", "vertical-" + r, "horizontal-" + i),
                ...n.handle,
              }),
          })
        );
      }),
    _G = (e, t) =>
      t === "start"
        ? (r, i) =>
          (0, wt.chain)(
            r,
            (s) => (0, ui.changePath)(s, ["size", e === "vertical" ? "height" : "width"], (n) => n - i),
            (s) => (0, ui.changePath)(s, ["pos", e === "vertical" ? "y" : "x"], (n) => n + i)
          )
        : (r, i) => (0, ui.changePath)(r, ["size", e === "vertical" ? "height" : "width"], (s) => s + i),
    FC = ({ direction: e, min: t, max: r, position: i }) => {
      let s = _G(e, i);
      return (n, o) =>
        s(
          n,
          (0, wt.chain)(
            e === "vertical" ? o.y : o.x,
            (a) => Math.max(t, a),
            (a) => (r == null ? a : Math.min(r, a))
          )
        );
    },
    DG = (e) => (t, r) =>
      (0, wt.chain2)(
        t,
        e.map((i) => (s) => FC(i)(s, r))
      );
  var JC = h(LC()),
    VC = ({
      windowLogics: e,
      overrides: t,
      extraWindows: r,
      marginTop: i,
      onMaximize: s,
      onMinimize: n,
      onUnmaximize: o,
      isFocused: a,
      setFocus: l,
      desktops: c,
      fileDnD: u,
    }) => {
      let p = (0, ec.chain)(
        c.state.value.desktops,
        (m) => m.map((d) => d.windows),
        (m) => m.filter((d) => d),
        (m) => m.flat(),
        OC.reverse,
        (m) => (r?.length ? [...m, ...r] : m)
      );
      return e.map((m) => {
        let d = p.findIndex((x) => (0, GC.matchKey)(x.key, m.key)),
          { ps: g, override: y } = p[d];
        return {
          ...m,
          render1: (x) =>
            (0, Yl.cs)(
              ["dragging", ({ }, R) => PG({ ps: g, marginTop: i, next: R })],
              [
                "resizing",
                ({ }, R) =>
                  m.logic.resizing
                    ? IC({
                      ps: { value: g, change: (w) => c.changePs(m.key, w) },
                      marginTop: i,
                      minSize: m.logic.resizing.minSize,
                      alterSize: m.logic.resizing.alterSize,
                      next: R,
                    })
                    : R(),
              ],
              ["override", ({ }, R) => R(y ?? t?.(m, g))],
              ["focused", ({ override: R }, w) => w(R?.fullScreen || a(m))],
              ({ focused: R }, w) => (0, JC.ShortcutClose)({ focused: R, close: m.logic.close, next: w }),
              ({ focused: R, override: w, resizing: b, dragging: k }) => {
                let M = w?.fullScreen,
                  F = M ? w?.ps : (w?.ps ?? b?.ps ?? k.ps ?? g);
                return x({
                  boundary: {
                    pos: w?.boundaryPos,
                    scale: w?.boundaryScale,
                    transitioning: w?.boundaryTransitioning,
                    blocking: w?.boundaryBlocking,
                  },
                  ps: F,
                  focused: R,
                  shadow: w?.shortShadow ? "short" : M || w?.noShadow ? "none" : R ? "big" : "normal",
                  inert: w?.inert,
                  fullScreen: M,
                  aboveAll: M || w?.aboveAll,
                  scale: w?.scale,
                  hidden: w?.hidden,
                  zIndex: d,
                  windowProps: { onMouseDown: R || w?.inert ? void 0 : () => l(m) },
                  render: ({ resolveThumbnail: J }) =>
                    (0, Yl.cs)(
                      ({ }, Pe) =>
                        (0, jl.IgnoreUpdate)({
                          props: w?.ignoreUpdate,
                          when: (Me) => Me && w?.ignoreUpdate,
                          next: Pe,
                        }),
                      ({ }, Pe) =>
                        ur.createElement(
                          ur.Fragment,
                          null,
                          Pe(),
                          !M &&
                          k.renderOnDone({
                            action: () =>
                              c.changePs(m.key, (Me) =>
                                (0, $s.changePath)(Me, ["pos"], () => F.pos)
                              ),
                          })
                        ),
                      ({ }, Pe) =>
                        (0, jl.IgnoreUpdate)({
                          props: R,
                          when: (Me) => Me && k.active,
                          next: Pe,
                        }),
                      ({ }, Pe) => ur.createElement(ur.Fragment, null, Pe(), !M && b?.controls),
                      ({ }) =>
                        m.logic.render({
                          size: F?.size ?? g.size,
                          control: {
                            fileDnD: u,
                            focused: R,
                            dragging: !M && k.handle,
                            onMinimize: () => n(m),
                            onMaximize: () => s(m),
                            onUnmaximize: () => o(m),
                            fullScreen: M,
                          },
                          resolveThumbnail: J,
                        })
                    ),
                });
              }
            ),
        };
      });
    },
    PG = ({ ps: e, marginTop: t, next: r }) =>
      (0, BC.Dragging)({
        next: (i) =>
          r({
            ...i,
            ps: i.delta
              ? (0, ec.chain)(
                e,
                (s) => (0, $s.changePath)(s, ["pos"], (n) => (0, MC.addVector)(n, i.delta)),
                (s) => (0, $s.changePath)(s, ["pos", "y"], (n) => Math.max(t, n))
              )
              : null,
          }),
      });
  var h_ = h(e_()),
    u_ = (_opts) => [
      {
        name: "system",
        load: ({ }, e) =>
          (0, Zs.cs)(
            ["system", (t, r) => (0, i_.Static)({ getInitValue: () => (0, h_.System)({ desktopFiles: (_opts && _opts.desktopFiles) || [] }), next: r })],
            ({ system: t }) => e(t)
          ),
      },
      {
        name: "finderProcess",
        load: ({ system: e, clipboard: t }, r) =>
          (0, Zs.cs)(
            ["process", ({ }, i) => zr.renderProcess({ system: e, clipboard: t, next: i })],
            ({ process: i }) => r({ id: "finder", key: zr.key, running: i, launcher: zr })
          ),
        deps: ["system", "clipboard"],
      },
      {
        name: "processes",
        load: ({ system: e, finderProcess: t, clipboard: r }, i) =>
          (0, Zs.cs)(
            [
              "processes",
              ({ }, s) =>
                (0, o_.Processes)({
                  initLaunchers: [].filter((n) => n),
                  system: e,
                  clipboard: r,
                  next: s,
                }),
            ],
            ({ processes: s }) => i((0, rc.changePath)(s, ["runnings"], (n) => [t, ...(n ?? [])]))
          ),
        deps: ["system", "finderProcess", "clipboard"],
      },
      {
        name: "dock1",
        load: ({ processes: e, windowLogics: t }, r) =>
          zw({ windowLogics: t, runningProcesses: e.runnings, next: r }),
        deps: ["processes", "windowLogics"],
      },
      { name: "fileDnD", load: ({ system: e }, t) => jg({ system: e, next: t }), deps: ["system"] },
      {
        name: "dock2",
        load: ({ mode: e, dock1: t, currentDesktop: r, processes: i, desktops: s, modes: n }, o) =>
          t.next({
            onSelectLauncher: (a) => {
              let l = i.runnings.find((p) => p.key === a.key);
              if (!l) {
                i.launchProcess(a);
                return;
              }
              if (r.focusProcess(l.id)) return;
              let c = t.getMinimizedWin(l.id);
              if (c) {
                t.unminimize(c, (p) => s.addWindow({ key: c, ps: p }));
                return;
              }
              let u = s.findDesktopHasProcess(l.id);
              u == null
                ? l.running.launchNewWindow?.()
                : (n.switchDesktop(u), s.focusProcess(l.id, u) || i.launchProcess(a));
            },
            onUnminimize: ({ wk: a, ps: l }) => {
              s.addWindow({ key: a, ps: l });
            },
            hidden: e.hideDock,
            next: o,
          }),
        deps: ["mode", "currentDesktop", "processes", "desktops", "modes", "dock1"],
      },
      {
        name: "windowLogics",
        load: ({ system: e, processes: t, openFile: r }, i) =>
          (0, c_.WindowLogics)({ processes: t.runnings, openFile: r, system: e, next: i }),
        deps: ["system", "processes", "openFile"],
      },
      {
        name: "desktops",
        load: ({ dock1: e }, t) => (0, l_.Desktops)({ windowLogics: e.windowLogics, next: t }),
        deps: ["dock1"],
      },
      {
        name: "currentDesktop",
        load: ({ desktops: e }, t) => (0, a_.CurrentDesktop)({ desktops: e, next: t }),
        deps: ["desktops"],
      },
      {
        name: "modes",
        load: (
          { desktops: e, currentDesktop: t, windowLogics: r, dock1: i, fileDnD: s, resolveThumbnail: n },
          o
        ) => Tg({ desktops: e, currentDesktop: t, windowLogics: r, fileDnD: s, resolveThumbnail: n, next: o }),
        deps: ["desktops", "currentDesktop", "windowLogics", "fileDnD", "resolveThumbnail"],
      },
      { name: "mode", load: ({ modes: e }, t) => t(e.mode), deps: ["modes"] },
      {
        name: "header",
        load: (
          {
            desktops: e,
            windowLogics: t,
            processes: r,
            mode: i,
            modes: s,
            dock1: n,
            currentDesktop: o,
            finderProcess: a,
          },
          l
        ) =>
          l(({ hidden: c, desktopIndex: u }) =>
            oC({
              ...(() => {
                let p = e.getActiveWindow(u),
                  m =
                    p &&
                    (t?.find((g) => (0, fi.matchKey)(g.key, p) && g.logic.getAppMenu) ??
                      t?.find(
                        (g) =>
                          (0, fi.matchKey)(g.key, (0, s_.omit)(p, ["modalId"])) &&
                          g.logic.getAppMenu
                      ));
                if (m)
                  return {
                    key: "window|" + JSON.stringify(m.key),
                    appMenu: m?.logic.getAppMenu({
                      size: e.getPs(m.key).size,
                      changeSize: (g) =>
                        e.changePs(m.key, (y) => (0, rc.changePath)(y, ["size"], g)),
                      windowControl: {
                        onMaximize: () => s.maximizeWindow(m),
                        onMinimize: () =>
                          n.minimizeWindow(m.key, {
                            ps: o.desktop.windows.find((g) =>
                              (0, fi.matchKey)(g.key, g.key)
                            ).ps,
                          }),
                        onUnmaximize: () => s.unmaximizeWindow(m),
                        isFullScreen: () => e.state.value.desktops[u].type === "fullScreen",
                      },
                    }),
                  };
                let d =
                  (p && r.runnings.find((g) => g.id === p.processId && g.running.defaultAppMenu)) ||
                  a;
                return { key: "process|" + d.id, appMenu: d.running.defaultAppMenu };
              })(),
              systemMenu: aC({
                activateMissionControl: s.activateMissionControl,
                showAboutModal: a.running.showAboutModal,
                desktopsControl: {
                  addNewDesktop: e.addDesktop,
                  toLeftDesktop: (() => {
                    let p = e.currentIndex;
                    if (p !== 0) return () => s.switchDesktop(p - 1);
                  })(),
                  toRightDesktop: (() => {
                    let p = e.currentIndex;
                    if (p !== e.state.value.desktops.length - 1)
                      return () => s.switchDesktop(p + 1);
                  })(),
                  removeThisDesktop:
                    e.state.value.desktops.filter((p) => p.type === "desktop").length > 1 &&
                    (() => {
                      e.removeCurrentDesktop();
                    }),
                },
              }),
              hidden: c,
              inactive: i.headerInactive,
              height: Xs.headerHeight,
            })
          ),
        deps: [
          "desktops",
          "windowLogics",
          "modes",
          "processes",
          "mode",
          "dock1",
          "currentDesktop",
          "finderProcess",
        ],
      },
      {
        name: "openFile",
        load: ({ processes: e, installedLaunchers: t }, r) =>
          r((i) => { var m = t.find((s) => s.checkFile(i)); if (m) e.launchProcess(m.launcher, { file: i }); else console.warn("[macOS] No launcher for file:", i); }),
        deps: ["processes", "installedLaunchers"],
      },
      { name: "clipboard", load: ({ }, e) => (0, n_.OSClipboard)({ next: e }), deps: [] },
      {
        name: "resolveThumbnail",
        load: ({ installedLaunchers: e }, t) =>
          t(async (r, { fs: i }) => {
            let s = e.find((n) => n.checkFile(r));
            if (!s) return null;
            return s.launcher.resolveFileThumbnail
              ? s.launcher.resolveFileThumbnail(r, { fs: i })
              : s.launcher.icon;
          }),
        deps: ["installedLaunchers"],
      },
      {
        name: "installedLaunchers",
        load: ({ }, e) =>
          e([
            { launcher: HS, checkFile: (t) => (0, ic.last)(t).endsWith(".mp4") },
            { launcher: tS, checkFile: (t) => (0, ic.last)(t).endsWith(".nes") },
            { launcher: pdfPreviewLauncher, checkFile: (t) => (0, ic.last)(t).endsWith(".pdf") },
          ]),
        deps: [],
      },
      {
        name: "tableSurface",
        load: (
          {
            currentDesktop: e,
            mode: t,
            finderProcess: r,
            openFile: i,
            fileDnD: s,
            clipboard: n,
            resolveThumbnail: o,
          },
          a
        ) =>
          a(
            AC({
              onClick: () => e.blurAll(),
              inactive: t.inactiveTableSurface,
              marginTop: Xs.headerHeight,
              renderDesktop: () =>
                r.running.renderDesktop({
                  fileDnD: s,
                  clipboard: n,
                  openFile: (l) => i(l),
                  focused: e.desktop.focusedWindow == null,
                  resolveThumbnail: o,
                }),
            })
          ),
        deps: [
          "currentDesktop",
          "mode",
          "finderProcess",
          "openFile",
          "fileDnD",
          "clipboard",
          "resolveThumbnail",
        ],
      },
      {
        load: ({ currentDesktop: e, desktops: t, modes: r }, i) =>
          (0, t_.fragments)(
            i(),
            e.desktop.type === "fullScreen" &&
            !e.desktop.windows?.length &&
            (0, r_.Invoke)({
              action: () => {
                let s = t.getDefaultIndex();
                r.switchDesktop(s, () => t.removeDesktop(t.currentIndex));
              },
            })
          ),
        deps: ["currentDesktop", "desktops", "modes"],
      },
      {
        name: "windows",
        load: (
          {
            windowLogics: e,
            mode: t,
            modes: r,
            currentDesktop: i,
            desktops: s,
            dock2: n,
            dock1: o,
            fileDnD: a,
          },
          l
        ) =>
          l(
            VC({
              windowLogics: e,
              fileDnD: a,
              overrides: t.windowsOverride,
              extraWindows: n.windows,
              marginTop: Xs.headerHeight,
              onMaximize: r.maximizeWindow,
              onMinimize: (c) =>
                o.minimizeWindow(c.key, {
                  ps: i.desktop.windows.find((u) => (0, fi.matchKey)(u.key, c.key)).ps,
                }),
              onUnmaximize: r.unmaximizeWindow,
              desktops: s,
              isFocused: i.isFocused,
              setFocus: i.setFocus,
            })
          ),
        deps: ["windowLogics", "mode", "modes", "currentDesktop", "desktops", "dock2", "dock1", "fileDnD"],
      },
      {
        load: (
          {
            windows: e,
            mode: t,
            header: r,
            currentDesktop: i,
            desktops: s,
            dock2: n,
            tableSurface: o,
            resolveThumbnail: a,
          },
          l
        ) =>
          l(
            _C({
              windows: e,
              transition: t.desktopTransition,
              header: r,
              renderUnderWindows: t.renderUnderWindows,
              renderAboveWindows: t.renderAboveWindows,
              dock: n.render,
              desktops: s,
              currentDesktop: i,
              tableSurface: o,
              resolveThumbnail: a,
            })
          ),
        deps: [
          "windows",
          "mode",
          "header",
          "currentDesktop",
          "desktops",
          "dock2",
          "tableSurface",
          "resolveThumbnail",
        ],
        expo: [(e, t) => t],
      },
    ];
  var m_ = (_opts) =>
    (0, p_.cs)(
      ["modules", ({ processes: e, system: t }, r) => (0, f_.Swamp)({ moduleList: u_(_opts || {}), next: r })],
      ({ modules: e }) => e
    );
  var F_ = h(S());
  window.mountMacOS = function (containerEl, options) {
    if (!containerEl) return;
    (0, F_.cs)(
      ({ }, e) => I_.render(e(), containerEl),
      ({ }) => m_(options || {})
    );
  };
})();
/*! Bundled license information:

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)

react/cjs/react.production.min.js:
  (** @license React v17.0.2
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)

react/cjs/react.production.min.js:
  (** @license React v16.14.0
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)

react/cjs/react.production.min.js:
  (** @license React v16.11.0
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
