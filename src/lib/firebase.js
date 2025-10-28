"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.auth = exports.app = void 0;
// src/lib/firebase.ts
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var firestore_1 = require("firebase/firestore");
// 🔹 Importa la configuración correcta desde el otro archivo
var config_1 = require("../firebase/config");
// 🔹 Inicializa la app principal con la configuración importada
var app = (0, app_1.initializeApp)(config_1.firebaseConfig);
exports.app = app;
// 🔹 Crea las instancias de autenticación y base de datos
var auth = (0, auth_1.getAuth)(app);
exports.auth = auth;
var db = (0, firestore_1.getFirestore)(app);
exports.db = db;
