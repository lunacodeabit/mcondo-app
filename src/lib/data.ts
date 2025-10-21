import { Condo } from './definitions';

// This file contains the initial data for the condominiums.
// You can edit this data to match your specific needs.
// The IDs are hardcoded for consistency during seeding.

export const initialCondos: Condo[] = [
  {
    id: 'condo-01',
    name: 'Residencial Armonía',
    address: 'Calle La Paz 123, Sector Bella Vista',
    currency: 'DOP',
    finances: {
      manualBalance: 150000,
      transactions: [
        { id: 'tx-01', date: '2023-10-01T10:00:00Z', description: 'Pago mantenimiento Octubre Apto 101', type: 'ingreso', category: 'Cuotas', amount: 5000 },
        { id: 'tx-02', date: '2023-10-05T14:30:00Z', description: 'Pago de servicio de jardinería', type: 'egreso', category: 'Mantenimiento', amount: 3500 },
        { id: 'tx-03', date: '2023-10-10T11:00:00Z', description: 'Pago mantenimiento Octubre Apto 102', type: 'ingreso', category: 'Cuotas', amount: 5000 },
      ],
    },
    units: [
      { id: 'unit-a-101', unitNumber: '101-A', type: 'apartamento', generalData: { bedrooms: 2, bathrooms: 2, parkingSpaces: 1, area: 120 }, owner: { name: 'Juan Pérez', phone: '809-123-4567', email: 'juan.perez@email.com' }, occupation: { status: 'ocupado_propietario' }, fees: { monthlyFee: 5000, lateFeePercentage: 5 }, paymentResponsibles: [], adminData: { notes: '' }, accountHistory: [], managementHistory: [] },
      { id: 'unit-a-102', unitNumber: '102-A', type: 'apartamento', generalData: { bedrooms: 3, bathrooms: 2.5, parkingSpaces: 2, area: 150 }, owner: { name: 'María Rodríguez', phone: '809-765-4321', email: 'maria.rodriguez@email.com' }, occupation: { status: 'ocupado_inquilino', tenant: { name: 'Carlos Gómez', phone: '829-111-2222', email: 'carlos.gomez@email.com' } }, fees: { monthlyFee: 6500, lateFeePercentage: 5 }, paymentResponsibles: [], adminData: { notes: '' }, accountHistory: [], managementHistory: [] },
    ],
    accountsPayable: [
        { id: 'inv-001', supplierId: 'sup-01', invoiceNumber: 'FACT-2023-10-001', date: '2023-10-15T09:00:00Z', dueDate: '2023-11-15T09:00:00Z', amount: 12500, status: 'Pendiente', items: [{description: 'Servicio de seguridad Octubre', quantity: 1, unitPrice: 12500}] },
    ],
    suppliers: [
        { id: 'sup-01', name: 'Seguridad Integral 24/7', rnc: '123456789', contact: { name: 'Luis Méndez', phone: '809-888-9999', email: 'luis.mendez@seguridad.com' }, category: 'Seguridad' },
    ],
    employees: [],
    communications: [
        { id: 'comm-01', title: 'Mantenimiento Programado del Ascensor', content: 'Se informa a todos los residentes que el ascensor estará fuera de servicio el día 30 de Octubre de 9am a 12pm por mantenimiento preventivo.', date: '2023-10-25T15:00:00Z', audience: 'todos' },
    ],
    incidents: [
        { id: 'inc-01', title: 'Luz quemada en pasillo del 3er piso', description: 'La luz del pasillo del 3er piso, cerca del Apto 302-A, está quemada desde anoche.', reportedBy: 'Ana García (Apto 302-A)', date: '2023-10-28T08:00:00Z', status: 'abierto', priority: 'media' },
    ],
  },
  {
    id: 'condo-02',
    name: 'Torre del Sol',
    address: 'Av. Winston Churchill 456, Ensanche Paraíso',
    currency: 'USD',
    finances: {
      manualBalance: 25000,
      transactions: [],
    },
    units: [],
    accountsPayable: [],
    suppliers: [],
    employees: [],
    communications: [],
    incidents: [],
  }
];
