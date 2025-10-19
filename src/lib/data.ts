import type { Condo } from './definitions';

export const initialCondos: Condo[] = [
  {
    id: 'condo-1',
    name: 'Residencial Armonía',
    address: 'Calle La Paz 123, Santo Domingo',
    currency: 'DOP',
    finances: {
      manualBalance: 150000,
      transactions: [
        { id: 't1', date: '2024-07-01T10:00:00Z', description: 'Pago de cuota A-101', type: 'ingreso', category: 'Cuotas', amount: 5000 },
        { id: 't2', date: '2024-07-05T14:00:00Z', description: 'Pago de limpieza áreas comunes', type: 'egreso', category: 'Mantenimiento', amount: 12000 },
        { id: 't3', date: '2024-06-15T11:00:00Z', description: 'Pago de seguridad', type: 'egreso', category: 'Seguridad', amount: 25000 },
        { id: 't4', date: '2024-06-02T09:00:00Z', description: 'Pago de cuota B-202', type: 'ingreso', category: 'Cuotas', amount: 5500 },
        { id: 't5', date: '2024-05-20T16:30:00Z', description: 'Reparación bomba de agua', type: 'egreso', category: 'Reparaciones', amount: 8500 },
      ],
    },
    units: [
      {
        id: 'u1',
        unitNumber: 'A-101',
        type: 'apartamento',
        generalData: { bedrooms: 2, bathrooms: 2, parkingSpaces: 1, area: 120 },
        owner: { name: 'Carlos Rodriguez', phone: '809-555-1111', email: 'carlos@email.com' },
        occupation: { status: 'ocupado_propietario' },
        fees: { monthlyFee: 5000, lateFeePercentage: 5 },
        paymentResponsibles: [{ name: 'Carlos Rodriguez', phone: '809-555-1111', email: 'carlos@email.com' }],
        adminData: { notes: 'Propietario original.' },
        accountHistory: [
            { id: 'ah1', date: '2024-07-01T09:00:00Z', type: 'cuota_mensual', description: 'Cuota de Mantenimiento Julio 2024', amount: 5000 },
            { id: 'ah2', date: '2024-07-01T10:00:00Z', type: 'abono', description: 'Pago de cuota A-101', amount: -5000 },
        ]
      },
      {
        id: 'u2',
        unitNumber: 'B-202',
        type: 'apartamento',
        generalData: { bedrooms: 3, bathrooms: 2.5, parkingSpaces: 2, area: 150 },
        owner: { name: 'Ana Martinez', phone: '809-555-2222', email: 'ana@email.com' },
        occupation: { status: 'ocupado_inquilino', tenant: { name: 'Luis Gomez', phone: '809-555-3333', email: 'luis@email.com' } },
        fees: { monthlyFee: 6500, lateFeePercentage: 5 },
        paymentResponsibles: [{ name: 'Luis Gomez', phone: '809-555-3333', email: 'luis@email.com' }],
        adminData: { notes: 'Inquilino responsable de pagos.' },
        accountHistory: [
            { id: 'ah3', date: '2024-06-01T09:00:00Z', type: 'cuota_mensual', description: 'Cuota de Mantenimiento Junio 2024', amount: 6500 },
            { id: 'ah4', date: '2024-07-01T09:00:00Z', type: 'cuota_mensual', description: 'Cuota de Mantenimiento Julio 2024', amount: 6500 },
        ]
      },
    ],
    accountsPayable: [
        { id: 'inv1', supplierId: 's1', invoiceNumber: 'F-2024-001', date: '2024-07-05T00:00:00Z', dueDate: '2024-08-04T00:00:00Z', amount: 12000, status: 'Pagada', items: [{ description: 'Servicio de limpieza mensual', quantity: 1, unitPrice: 12000 }], relatedTransactionId: 't2' },
        { id: 'inv2', supplierId: 's2', invoiceNumber: 'F-2024-005', date: '2024-07-15T00:00:00Z', dueDate: '2024-07-30T00:00:00Z', amount: 25000, status: 'Pendiente', items: [{ description: 'Servicio de seguridad', quantity: 1, unitPrice: 25000 }] },
    ],
    suppliers: [
        { id: 's1', name: 'Limpieza Total SRL', rnc: '130-12345-6', contact: { name: 'Juan Perez', email: 'jperez@limpiezatotal.com', phone: '809-111-1111' }, category: 'Limpieza' },
        { id: 's2', name: 'Seguridad Privada Inc.', rnc: '130-65432-1', contact: { name: 'Maria Lopez', email: 'mlopez@seguridadprivada.com', phone: '809-222-2222' }, category: 'Seguridad' },
    ],
    employees: [],
    communications: [
        { id: 'c1', title: 'Mantenimiento Piscina', content: 'Se informa que la piscina estará en mantenimiento el día 15 de Julio de 9am a 5pm.', date: '2024-07-10T00:00:00Z', audience: 'todos' }
    ],
    incidents: [
        { id: 'i1', title: 'Foco quemado en pasillo B', description: 'El foco del pasillo del segundo piso del edificio B está quemado.', reportedBy: 'B-202', date: '2024-07-18T00:00:00Z', status: 'abierto', priority: 'baja' }
    ],
  },
  {
    id: 'condo-2',
    name: 'Torre del Sol',
    address: 'Av. Winston Churchill 456, Santo Domingo',
    currency: 'USD',
    finances: {
        manualBalance: 25000,
        transactions: [
            { id: 't6', date: '2024-07-02T10:00:00Z', description: 'Cuota Penthouse A', type: 'ingreso', category: 'Cuotas', amount: 500 },
        ],
    },
    units: [],
    accountsPayable: [],
    suppliers: [],
    employees: [],
    communications: [],
    incidents: [],
  }
];
