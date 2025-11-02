"use client";
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import AppLayout from './layout';
import Link from 'next/link';

// Definir la interfaz para un Cliente
interface Client extends DocumentData {
  id: string;
  nombre: string;
  direccion?: string;
  unitCount: number;
}

export default function AdminPanel() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    async function fetchClients() {
      try {
        const clientsSnapshot = await getDocs(collection(db, 'clientes'));
        const clientsData = await Promise.all(
          clientsSnapshot.docs.map(async (clientDoc) => {
            const unitsQuery = query(collection(db, 'unidades'), where('clienteId', '==', clientDoc.id));
            const unitsSnapshot = await getDocs(unitsQuery);
            return {
              id: clientDoc.id,
              nombre: clientDoc.data().nombre,
              direccion: clientDoc.data().direccion,
              unitCount: unitsSnapshot.size,
            };
          })
        );
        setClients(clientsData as Client[]);
      } catch (error) {
        console.error("Error fetching clients: ", error);
      }
    }
    fetchClients();
  }, []);

  return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-gray-800 rounded-lg p-6 flex flex-col">
            <h3 className="text-xl font-bold mb-2">{client.nombre}</h3>
            <p className="text-gray-400 mb-4">{client.direccion || 'Sin dirección'}</p>
            <p className="text-gray-500 mb-4">{client.unitCount} unidades</p>
            <Link href={`/dashboard?clienteId=${client.id}`} className="mt-auto bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700">
              Administrar
            </Link>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
