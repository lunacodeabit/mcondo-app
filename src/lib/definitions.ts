// Main Data Structures
export type Condo = {
  id: string;
  name: string;
  address: string;
  currency: 'USD' | 'DOP';
  finances: Finances;
  units: Unit[];
  accountsPayable: Invoice[];
  suppliers: Supplier[];
  employees: Employee[];
  communications: Communication[];
  incidents: Incident[];
};

export type Finances = {
  manualBalance: number;
  transactions: Transaction[];
};

export type Transaction = {
  id: string;
  date: string; // ISO 8601
  description: string;
  type: 'ingreso' | 'egreso';
  category: string;
  amount: number;
  reference?: string;
};

export type Unit = {
  id: string;
  unitNumber: string;
  type: 'apartamento' | 'casa' | 'local';
  generalData: {
    bedrooms: number;
    bathrooms: number;
    parkingSpaces: number;
    area: number; // in sq meters
  };
  owner: Person;
  occupation: {
    status: 'ocupado_propietario' | 'ocupado_inquilino' | 'desocupado';
    tenant?: Person;
  };
  fees: {
    monthlyFee: number;
    lateFeePercentage: number;
  };
  paymentResponsibles: Person[];
  adminData: {
    notes: string;
  };
  accountHistory: AccountMovement[];
};

export type Invoice = {
  id: string;
  supplierId: string;
  invoiceNumber: string;
  date: string; // ISO 8601
  dueDate: string; // ISO 8601
  amount: number;
  status: 'Pendiente' | 'Pagada' | 'Vencida';
  items: InvoiceItem[];
  relatedTransactionId?: string;
};

export type Supplier = {
  id: string;
  name: string;
  rnc: string;
  contact: Person;
  category: string;
};

export type Employee = {
  id:string;
  personalInfo: Person;
  position: string;
  hireDate: string; // ISO 8601
  salary: number;
  payrollConfig: PayrollItem[];
};

export type Communication = {
  id: string;
  title: string;
  content: string;
  date: string; // ISO 8601
  audience: 'todos' | 'propietarios' | 'inquilinos';
};

export type Incident = {
  id: string;
  title: string;
  description: string;
  reportedBy: string; // Could be a resident name or unit number
  date: string; // ISO 8601
  status: 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado';
  priority: 'baja' | 'media' | 'alta';
};

// Sub-types and Helper Types
export type Person = {
  name: string;
  phone: string;
  email: string;
};

export type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type PayrollItem = {
  id: string;
  type: 'ingreso' | 'descuento';
  description: string;
  amount: number;
};

export type AccountMovement = {
  id: string;
  date: string; // ISO 8601
  type: 'cargo' | 'abono' | 'cuota_mensual';
  description: string;
  amount: number;
};

export type ManagementComment = {
  id: string;
  date: string;
  comment: string;
  user: string;
}

// Type for the context state
export type CondoState = Condo;
