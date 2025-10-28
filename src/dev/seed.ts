// src/dev/seed.ts
import { Timestamp } from "firebase/firestore";
import { createDoc } from "../lib/firestore";

export async function seedDemo() {
  // 1) Crear condominio (esto lo hace un super_admin)
  const condo = await createDoc("condominios", {
    nombre: "Residencial Los Pinos",
    direccion: "Av. México 123, Santo Domingo",
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  } as any);

  const tenant_id = condo.id; // usaremos el id del condominio como tenant_id

  // 2) Crear un movimiento (ingreso) asociado a ese tenant
  await createDoc("movimientos", {
    tenant_id,
    tipo: "ingreso",
    monto: 3500,
    categoria: "Cuota de mantenimiento",
    fecha: Timestamp.now(),
    descripcion: "Cuota octubre A-101",
  } as any);

  console.log("Seed OK → tenant_id:", tenant_id);
}

seedDemo();
