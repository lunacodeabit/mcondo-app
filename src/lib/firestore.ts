// src/services/firestore.ts
import {
    addDoc, collection, deleteDoc, doc, getDoc, getDocs,
    orderBy, query, updateDoc, where, Timestamp
  } from "firebase/firestore";
  import { db } from "../lib/firebase";
  
  // Tipos base
  export type ID = string;
  export type Money = number; // RD$ en decimales
  
  export interface BaseDoc {
    id?: ID;
    tenant_id?: ID;           // obligatorio en colecciones multi-tenant
    created_at?: any;
    updated_at?: any;
  }
  
  // === Interfaces por colección ===
  export interface Condominio extends BaseDoc {
    nombre: string;
    rnc?: string;
    direccion?: string;
    ncf_serie?: string;
    telefonos?: string[];
    email?: string;
  }
  
  export interface Unidad extends BaseDoc {
    codigo: string;
    torre?: string;
    nivel: number;
    metros?: number;
    cuota_mantenimiento: Money;
    propietario_id?: ID;
  }
  
  export interface Propietario extends BaseDoc {
    nombre: string;
    cedula?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  }
  
  export interface Movimiento extends BaseDoc {
    tipo: "ingreso" | "egreso";
    monto: Money;
    categoria: string;
    fecha: any; // Timestamp
    descripcion?: string;
    unidad_id?: ID;
    factura_id?: ID;
  }
  
  export interface Factura extends BaseDoc {
    numero: string;
    ncf?: string;
    fecha_emision: any;       // Timestamp
    fecha_vencimiento?: any;  // Timestamp
    monto: Money;
    estado: "pendiente" | "pagada" | "vencida";
    proveedor_id?: ID;
    unidad_id?: ID;
  }
  
  export interface Proveedor extends BaseDoc {
    nombre: string;
    rnc?: string;
    email?: string;
    telefono?: string;
  }
  
  export interface Empleado extends BaseDoc {
    nombre: string;
    cedula?: string;
    cargo: string;
    salario?: Money;
    estado: "activo" | "inactivo";
  }
  
  export interface Comunicado extends BaseDoc {
    titulo: string;
    mensaje: string;
    destino: "todos" | "propietarios" | "empleados";
    fecha_envio: any; // Timestamp
  }
  
  export interface Incidente extends BaseDoc {
    titulo: string;
    descripcion: string;
    unidad_id?: ID;
    reportado_por: string; // uid o nombre
    estado: "abierto" | "en_proceso" | "resuelto";
    prioridad: "baja" | "media" | "alta";
    fecha_reporte: any; // Timestamp
  }
  
  // Helpers genéricos
  const stamp = () => Timestamp.now();
  
  // Crea documento (setea created_at/updated_at)
  export async function createDoc<T extends BaseDoc>(col: string, data: T) {
    const payload = { ...data, created_at: stamp(), updated_at: stamp() };
    const ref = await addDoc(collection(db, col), payload);
    return { id: ref.id, ...payload } as T & { id: ID };
  }
  
  export async function getById<T>(col: string, id: ID) {
    const snap = await getDoc(doc(db, col, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as T & { id: ID }) : null;
  }
  
  export async function updateById<T extends BaseDoc>(col: string, id: ID, patch: Partial<T>) {
    const ref = doc(db, col, id);
    await updateDoc(ref, { ...patch, updated_at: stamp() } as any);
  }
  
  export async function deleteById(col: string, id: ID) {
    await deleteDoc(doc(db, col, id));
  }
  
  // Query por tenant (y filtros opcionales)
  export async function listByTenant<T>(
    col: string,
    tenant_id: ID,
    opts?: { order?: [string, "asc" | "desc"]; whereEquals?: [string, any][] }
  ) {
    const clauses: any[] = [where("tenant_id", "==", tenant_id)];
    if (opts?.whereEquals) for (const [f, v] of opts.whereEquals) clauses.push(where(f, "==", v));
    if (opts?.order) clauses.push(orderBy(opts.order[0], opts.order[1]));
    const q = query(collection(db, col), ...clauses);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as (T & { id: ID })[];
  }
  