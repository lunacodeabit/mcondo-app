"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import AppLayout from '../layout';

export default function ClientDashboard() {
  const searchParams = useSearchParams();
  const clienteId = searchParams.get('clienteId');
  const [client, setClient] = useState(null);
  const [stats, setStats] = useState({ unidades: 0, recaudacion: 0, pendientes: 0 });

  useEffect(() => {
    if (!clienteId) return;

    // Fetch client data
    getDoc(doc(db, 'clientes', clienteId)).then(docSnap => {
      if (docSnap.exists()) {
        setClient(docSnap.data());
      }
    });

    // Fetch stats
    async function fetchStats() {
      const unitsQuery = query(collection(db, 'unidades'), where('clienteId', '==', clienteId));
      const unitsSnapshot = await getDocs(unitsQuery);
      
      const ingresosQuery = query(collection(db, 'ingresos'), where('clienteId', '==', clienteId));
      const ingresosSnapshot = await getDocs(ingresosQuery);
      let totalIngresos = 0;
      ingresosSnapshot.forEach(doc => totalIngresos += doc.data().monto);

      // (Lógica para pendientes iría aquí)

      setStats({
        unidades: unitsSnapshot.size,
        recaudacion: totalIngresos,
        pendientes: 0 // Placeholder
      });
    }

    fetchStats();
  }, [clienteId]);

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard de {client?.nombre || 'Cargando...'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h4 className="text-gray-400">Unidades</h4>
          <p className="text-3xl font-bold">{stats.unidades}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h4 className="text-gray-400">Recaudación</h4>
          <p className="text-3xl font-bold">RD${stats.recaudacion.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h4 className="text-gray-400">Pendientes</h4>
          <p className="text-3xl font-bold">{stats.pendientes}</p>
        </div>
      </div>
      {/* Aquí irían las acciones rápidas y actividad reciente */}
    </AppLayout>
  );
}
