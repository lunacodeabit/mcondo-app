"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoc = createDoc;
exports.getById = getById;
exports.updateById = updateById;
exports.deleteById = deleteById;
exports.listByTenant = listByTenant;
// src/services/firestore.ts
var firestore_1 = require("firebase/firestore");
var firebase_1 = require("../lib/firebase");
// Helpers genéricos
var stamp = function () { return firestore_1.Timestamp.now(); };
// Crea documento (setea created_at/updated_at)
function createDoc(col, data) {
    return __awaiter(this, void 0, void 0, function () {
        var payload, ref;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = __assign(__assign({}, data), { created_at: stamp(), updated_at: stamp() });
                    return [4 /*yield*/, (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, col), payload)];
                case 1:
                    ref = _a.sent();
                    return [2 /*return*/, __assign({ id: ref.id }, payload)];
            }
        });
    });
}
function getById(col, id) {
    return __awaiter(this, void 0, void 0, function () {
        var snap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, firestore_1.getDoc)((0, firestore_1.doc)(firebase_1.db, col, id))];
                case 1:
                    snap = _a.sent();
                    return [2 /*return*/, snap.exists() ? __assign({ id: snap.id }, snap.data()) : null];
            }
        });
    });
}
function updateById(col, id, patch) {
    return __awaiter(this, void 0, void 0, function () {
        var ref;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ref = (0, firestore_1.doc)(firebase_1.db, col, id);
                    return [4 /*yield*/, (0, firestore_1.updateDoc)(ref, __assign(__assign({}, patch), { updated_at: stamp() }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function deleteById(col, id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, firestore_1.deleteDoc)((0, firestore_1.doc)(firebase_1.db, col, id))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Query por tenant (y filtros opcionales)
function listByTenant(col, tenant_id, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var clauses, _i, _a, _b, f, v, q, snap;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    clauses = [(0, firestore_1.where)("tenant_id", "==", tenant_id)];
                    if (opts === null || opts === void 0 ? void 0 : opts.whereEquals)
                        for (_i = 0, _a = opts.whereEquals; _i < _a.length; _i++) {
                            _b = _a[_i], f = _b[0], v = _b[1];
                            clauses.push((0, firestore_1.where)(f, "==", v));
                        }
                    if (opts === null || opts === void 0 ? void 0 : opts.order)
                        clauses.push((0, firestore_1.orderBy)(opts.order[0], opts.order[1]));
                    q = firestore_1.query.apply(void 0, __spreadArray([(0, firestore_1.collection)(firebase_1.db, col)], clauses, false));
                    return [4 /*yield*/, (0, firestore_1.getDocs)(q)];
                case 1:
                    snap = _c.sent();
                    return [2 /*return*/, snap.docs.map(function (d) { return (__assign({ id: d.id }, d.data())); })];
            }
        });
    });
}
