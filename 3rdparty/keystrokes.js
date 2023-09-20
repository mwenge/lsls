var g = Object.defineProperty;
var E = (n, e, t) => e in n ? g(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var r = (n, e, t) => (E(n, typeof e != "symbol" ? e + "" : e, t), t);
class b {
  constructor(e) {
    r(this, "_onPressed");
    r(this, "_onPressedWithRepeat");
    r(this, "_onReleased");
    r(this, "_isPressed");
    r(this, "_identity");
    this._isPressed = !1, this._identity = e, typeof e == "function" ? this._onPressedWithRepeat = e : (this._onPressed = e.onPressed, this._onPressedWithRepeat = e.onPressedWithRepeat, this._onReleased = e.onReleased);
  }
  get isEmpty() {
    return !this._onPressed && !this._onPressedWithRepeat && !this._onReleased;
  }
  isOwnHandler(e) {
    return this._identity === e;
  }
  executePressed(e) {
    var t, i;
    this._isPressed || (t = this._onPressed) == null || t.call(this, e), this._isPressed = !0, (i = this._onPressedWithRepeat) == null || i.call(this, e);
  }
  executeReleased(e) {
    var t;
    this._isPressed && ((t = this._onReleased) == null || t.call(this, e)), this._isPressed = !1;
  }
}
const c = class c {
  constructor(e, t, i = {}) {
    r(this, "_normalizedKeyCombo");
    r(this, "_parsedKeyCombo");
    r(this, "_handlerState");
    r(this, "_lastActiveKeyPresses");
    r(this, "_isPressedWithFinalUnit");
    r(this, "_sequenceIndex");
    r(this, "_keyComboEventMapper");
    this._normalizedKeyCombo = c.normalizeKeyCombo(e), this._parsedKeyCombo = c.parseKeyCombo(e), this._handlerState = new b(i), this._keyComboEventMapper = t, this._lastActiveKeyPresses = [], this._isPressedWithFinalUnit = null, this._sequenceIndex = 0;
  }
  static parseKeyCombo(e) {
    if (c._parseCache[e])
      return c._parseCache[e];
    const t = e.toLowerCase();
    let i = "", s = [], a = [s], o = [a];
    const l = [o];
    let d = !1;
    for (let h = 0; h < e.length; h += 1)
      t[h] === "\\" ? d = !0 : (t[h] === "+" || t[h] === ">" || t[h] === ",") && !d ? i = t[h] : t[h].match(/[^\s]/) && (i && (i === "," ? (s = [], a = [s], o = [a], l.push(o)) : i === ">" ? (s = [], a = [s], o.push(a)) : i === "+" && (s = [], a.push(s)), i = ""), d = !1, s.push(t[h]));
    const K = l.map((h) => h.map((P) => P.map((S) => S.join(""))));
    return c._parseCache[e] = K, K;
  }
  static stringifyKeyCombo(e) {
    return e.map((t) => t.map((i) => i.map((s) => s === "+" ? "\\+" : s === ">" ? "\\>" : s === "," ? "\\," : s).join("+")).join(">")).join(",");
  }
  static normalizeKeyCombo(e) {
    if (c._normalizationCache[e])
      return c._normalizationCache[e];
    const t = this.stringifyKeyCombo(this.parseKeyCombo(e));
    return c._normalizationCache[e] = t, t;
  }
  get isPressed() {
    return !!this._isPressedWithFinalUnit;
  }
  get sequenceIndex() {
    return this.isPressed ? this._parsedKeyCombo.length : this._sequenceIndex;
  }
  isOwnHandler(e) {
    return this._handlerState.isOwnHandler(e);
  }
  executePressed(e) {
    var t;
    (t = this._isPressedWithFinalUnit) != null && t.has(e.key) && this._handlerState.executePressed(this._wrapEvent(this._lastActiveKeyPresses, { key: e.key, event: e }));
  }
  executeReleased(e) {
    var t;
    (t = this._isPressedWithFinalUnit) != null && t.has(e.key) && (this._handlerState.executeReleased(this._wrapEvent(this._lastActiveKeyPresses, { key: e.key, event: e })), this._isPressedWithFinalUnit = null);
  }
  updateState(e) {
    const t = this._parsedKeyCombo[this._sequenceIndex];
    let i = 0;
    for (const s of t) {
      let a = i;
      for (const o of s) {
        let l = !1;
        for (let d = i; d < e.length; d += 1) {
          const K = e[d];
          if (o === K.key) {
            d > a && (a = d), l = !0;
            break;
          }
        }
        if (!l) {
          this._handlerState.isEmpty && (this._isPressedWithFinalUnit = null);
          return;
        }
      }
      i = a;
    }
    for (const s of e) {
      let a = !1;
      for (const o of t)
        for (const l of o)
          if (s.key === l) {
            a = !0;
            break;
          }
      if (!a) {
        this._lastActiveKeyPresses.length = 0, this._sequenceIndex = 0;
        return;
      }
    }
    if (this._lastActiveKeyPresses[this._sequenceIndex] = e.slice(0), this._sequenceIndex < this._parsedKeyCombo.length - 1) {
      this._sequenceIndex += 1;
      return;
    }
    this._sequenceIndex = 0, this._isPressedWithFinalUnit = new Set(t[t.length - 1]);
  }
  _wrapEvent(e, t) {
    return {
      ...this._keyComboEventMapper(e, t),
      keyCombo: this._normalizedKeyCombo,
      keyEvents: e.flat().map((s) => s.event),
      finalKeyEvent: t.event
    };
  }
};
r(c, "_parseCache", {}), r(c, "_normalizationCache", {});
let y = c;
const R = {
  /*
  eslint-disable
    @typescript-eslint/no-empty-function,
    @typescript-eslint/no-unused-vars
  */
  addEventListener: (...n) => {
  },
  removeEventListener: (...n) => {
  },
  dispatchEvent: (...n) => {
  }
  /*
  eslint-enable
    @typescript-eslint/no-empty-function,
    @typescript-eslint/no-unused-vars
  */
}, w = {
  userAgent: ""
}, u = () => typeof document < "u" ? document : R, A = () => typeof navigator < "u" ? navigator : w, x = () => A().userAgent.toLocaleLowerCase().includes("mac");
let m = !1;
const M = (n) => {
  !x() || n.key !== "Meta" || (m = !0);
}, B = (n) => {
  !m || n.key !== "Meta" || (m = !1, v());
}, p = /* @__PURE__ */ new Map(), I = (n) => {
  p.set(n.key, n);
}, L = (n) => {
  p.delete(n.key);
}, v = () => {
  for (const n of p.values()) {
    const e = new KeyboardEvent("keyup", {
      key: n.key,
      code: n.code,
      bubbles: !0,
      cancelable: !0
    });
    u().dispatchEvent(e);
  }
  p.clear();
}, W = (n) => {
  try {
    const e = () => n();
    return addEventListener("focus", e), () => {
      removeEventListener("focus", e);
    };
  } catch {
  }
}, z = (n) => {
  try {
    const e = () => {
      v(), n();
    };
    return addEventListener("blur", e), () => removeEventListener("blur", e);
  } catch {
  }
}, O = (n) => {
  try {
    const e = (t) => (I(t), M(t), n({
      key: t.key,
      originalEvent: t,
      composedPath: () => t.composedPath(),
      preventDefault: () => t.preventDefault()
    }));
    return u().addEventListener("keydown", e), () => u().removeEventListener("keydown", e);
  } catch {
  }
}, q = (n) => {
  try {
    const e = (t) => (L(t), B(t), n({
      key: t.key,
      originalEvent: t,
      composedPath: () => t.composedPath(),
      preventDefault: () => t.preventDefault()
    }));
    return u().addEventListener("keyup", e), () => u().removeEventListener("keyup", e);
  } catch {
  }
};
class C {
  constructor(e = {}) {
    r(this, "_isActive");
    r(this, "_unbinder");
    r(this, "_onActiveBinder");
    r(this, "_onInactiveBinder");
    r(this, "_onKeyPressedBinder");
    r(this, "_onKeyReleasedBinder");
    r(this, "_keyComboEventMapper");
    r(this, "_selfReleasingKeys");
    r(this, "_keyRemap");
    r(this, "_handlerStates");
    r(this, "_keyComboStates");
    r(this, "_keyComboStatesArray");
    r(this, "_activeKeyPresses");
    r(this, "_activeKeyMap");
    r(this, "_watchedKeyComboStates");
    this._isActive = !0, this._onActiveBinder = () => {
    }, this._onInactiveBinder = () => {
    }, this._onKeyPressedBinder = () => {
    }, this._onKeyReleasedBinder = () => {
    }, this._keyComboEventMapper = () => ({}), this._selfReleasingKeys = [], this._keyRemap = {}, this._handlerStates = {}, this._keyComboStates = {}, this._keyComboStatesArray = [], this._activeKeyPresses = [], this._activeKeyMap = /* @__PURE__ */ new Map(), this._watchedKeyComboStates = {}, this.bindEnvironment(e);
  }
  get pressedKeys() {
    return this._activeKeyPresses.map((e) => e.key);
  }
  bindKey(e, t) {
    var s;
    e = e.toLowerCase();
    const i = new b(t);
    (s = this._handlerStates)[e] ?? (s[e] = []), this._handlerStates[e].push(i);
  }
  unbindKey(e, t) {
    e = e.toLowerCase();
    const i = this._handlerStates[e];
    if (i)
      if (t)
        for (let s = 0; s < i.length; s += 1)
          i[s].isOwnHandler(t) && (i.splice(s, 1), s -= 1);
      else
        i.length = 0;
  }
  bindKeyCombo(e, t) {
    var s;
    e = y.normalizeKeyCombo(e);
    const i = new y(e, this._keyComboEventMapper, t);
    (s = this._keyComboStates)[e] ?? (s[e] = []), this._keyComboStates[e].push(i), this._keyComboStatesArray.push(i);
  }
  unbindKeyCombo(e, t) {
    e = y.normalizeKeyCombo(e);
    const i = this._keyComboStates[e];
    if (i)
      if (t) {
        for (let s = 0; s < i.length; s += 1)
          if (i[s].isOwnHandler(t)) {
            for (let a = 0; a < this._keyComboStatesArray.length; a += 1)
              this._keyComboStatesArray[a] === i[s] && (this._keyComboStatesArray.splice(a, 1), a -= 1);
            i.splice(s, 1), s -= 1;
          }
      } else
        i.length = 0;
  }
  checkKey(e) {
    return this._activeKeyMap.has(e.toLowerCase());
  }
  checkKeyCombo(e) {
    return this._ensureCachedKeyComboState(e).isPressed;
  }
  checkKeyComboSequenceIndex(e) {
    return this._ensureCachedKeyComboState(e).sequenceIndex;
  }
  bindEnvironment(e = {}) {
    this.unbindEnvironment(), this._onActiveBinder = e.onActive ?? W, this._onInactiveBinder = e.onInactive ?? z, this._onKeyPressedBinder = e.onKeyPressed ?? O, this._onKeyReleasedBinder = e.onKeyReleased ?? q, this._keyComboEventMapper = e.mapKeyComboEvent ?? (() => ({})), this._selfReleasingKeys = e.selfReleasingKeys ?? [], this._keyRemap = e.keyRemap ?? {};
    const t = this._onActiveBinder(() => {
      this._isActive = !0;
    }), i = this._onInactiveBinder(() => {
      this._isActive = !1;
    }), s = this._onKeyPressedBinder((o) => {
      this._handleKeyPress(o);
    }), a = this._onKeyReleasedBinder((o) => {
      this._handleKeyRelease(o);
    });
    this._unbinder = () => {
      t == null || t(), i == null || i(), s == null || s(), a == null || a();
    };
  }
  unbindEnvironment() {
    var e;
    (e = this._unbinder) == null || e.call(this);
  }
  _ensureCachedKeyComboState(e) {
    e = y.normalizeKeyCombo(e), this._watchedKeyComboStates[e] || (this._watchedKeyComboStates[e] = new y(e, this._keyComboEventMapper));
    const t = this._watchedKeyComboStates[e];
    return t.updateState(this._activeKeyPresses), t;
  }
  _handleKeyPress(e) {
    if (!this._isActive)
      return;
    e = { ...e, key: e.key.toLowerCase() };
    const t = this._keyRemap[e.key];
    t && (e.key = t);
    const i = this._handlerStates[e.key];
    if (i)
      for (const a of i)
        a.executePressed(e);
    const s = this._activeKeyMap.get(e.key);
    if (s)
      s.event = e;
    else {
      const a = {
        key: e.key,
        event: e
      };
      this._activeKeyMap.set(e.key, a), this._activeKeyPresses.push(a);
    }
    this._updateKeyComboStates();
    for (const a of this._keyComboStatesArray)
      a.executePressed(e);
  }
  _handleKeyRelease(e) {
    e = { ...e, key: e.key.toLowerCase() };
    const t = this._keyRemap[e.key];
    t && (e.key = t);
    const i = this._handlerStates[e.key];
    if (i)
      for (const s of i)
        s.executeReleased(e);
    if (this._activeKeyMap.has(e.key)) {
      this._activeKeyMap.delete(e.key);
      for (let s = 0; s < this._activeKeyPresses.length; s += 1)
        if (this._activeKeyPresses[s].key === e.key) {
          this._activeKeyPresses.splice(s, 1), s -= 1;
          break;
        }
    }
    this._tryReleaseSelfReleasingKeys(), this._updateKeyComboStates();
    for (const s of this._keyComboStatesArray)
      s.executeReleased(e);
  }
  _updateKeyComboStates() {
    for (const e of this._keyComboStatesArray)
      e.updateState(this._activeKeyPresses);
  }
  _tryReleaseSelfReleasingKeys() {
    for (const e of this._activeKeyPresses)
      for (const t of this._selfReleasingKeys)
        e.key === t && this._handleKeyRelease(e.event);
  }
}
let k, f;
const H = (n) => {
  f = n ?? new C(k);
}, _ = () => (f || H(), f), U = (n) => {
  k = n;
}, j = (...n) => _().bindKey(...n), D = (...n) => _().unbindKey(...n), G = (...n) => _().bindKeyCombo(...n), N = (...n) => _().unbindKeyCombo(...n), T = (...n) => _().checkKey(...n), J = (...n) => _().checkKeyCombo(...n), Q = y.normalizeKeyCombo, V = y.stringifyKeyCombo, X = y.parseKeyCombo, Y = (n = {}) => {
  let e, t, i, s;
  return Object.assign(new C({
    ...n,
    onActive(o) {
      e = o;
    },
    onInactive(o) {
      t = o;
    },
    onKeyPressed(o) {
      i = o;
    },
    onKeyReleased(o) {
      s = o;
    }
  }), {
    activate() {
      e();
    },
    deactivate() {
      t();
    },
    press(o) {
      i({ composedPath: () => [], ...o });
    },
    release(o) {
      s({ composedPath: () => [], ...o });
    }
  });
};
export {
  C as Keystrokes,
  j as bindKey,
  G as bindKeyCombo,
  T as checkKey,
  J as checkKeyCombo,
  Y as createTestKeystrokes,
  _ as getGlobalKeystrokes,
  Q as normalizeKeyCombo,
  X as parseKeyCombo,
  H as setGlobalKeystrokes,
  U as setGlobalKeystrokesOptions,
  V as stringifyKeyCombo,
  D as unbindKey,
  N as unbindKeyCombo
};
