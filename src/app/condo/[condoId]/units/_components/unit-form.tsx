
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import type { Unit } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const personSchema = z.object({
  name: z.string().min(3, "El nombre es requerido."),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos."),
  email: z.string().email("Correo electrónico inválido."),
});

const formSchema = z.object({
  unitNumber: z.string().min(1, "El número de unidad es requerido."),
  type: z.enum(["apartamento", "casa", "local"]),
  generalData: z.object({
    bedrooms: z.coerce.number().min(0),
    bathrooms: z.coerce.number().min(0),
    parkingSpaces: z.coerce.number().min(0),
    area: z.coerce.number().min(0),
  }),
  owner: personSchema,
  occupation: z.object({
    status: z.enum(["ocupado_propietario", "ocupado_inquilino", "desocupado"]),
    tenant: personSchema.optional(),
  }),
  fees: z.object({
    monthlyFee: z.coerce.number().min(0, "La cuota debe ser un número positivo."),
    lateFeePercentage: z.coerce.number().min(0).max(100),
  }),
  paymentResponsibles: z.array(personSchema).optional(), // Simplified for now
  adminData: z.object({
    notes: z.string().optional(),
  }),
});


type UnitFormValues = z.infer<typeof formSchema>;

interface UnitFormProps {
  onSubmit: (data: UnitFormValues | (UnitFormValues & { id: string })) => void;
  onCancel: () => void;
  unit?: Unit;
}

export function UnitForm({ onSubmit, onCancel, unit }: UnitFormProps) {
  const defaultValues: Partial<UnitFormValues> = {
    unitNumber: unit?.unitNumber || "",
    type: unit?.type || "apartamento",
    generalData: unit?.generalData || { bedrooms: 0, bathrooms: 0, parkingSpaces: 0, area: 0 },
    owner: unit?.owner || { name: "", phone: "", email: "" },
    occupation: unit?.occupation || { status: "ocupado_propietario" },
    fees: unit?.fees || { monthlyFee: 0, lateFeePercentage: 5 },
    adminData: unit?.adminData || { notes: "" },
  };

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const watchOccupationStatus = form.watch("occupation.status");

  function handleSubmit(values: UnitFormValues) {
    // If not occupied by tenant, remove tenant data
    if (values.occupation.status !== 'ocupado_inquilino') {
        values.occupation.tenant = undefined;
    }
    
    if (unit?.id) {
        onSubmit({ ...values, id: unit.id });
    } else {
        onSubmit(values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        
        {/* General Unit Info */}
        <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold border-b pb-2">Información General de la Unidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="unitNumber" render={({ field }) => (
                    <FormItem><FormLabel>No. Unidad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="apartamento">Apartamento</SelectItem><SelectItem value="casa">Casa</SelectItem><SelectItem value="local">Local</SelectItem></SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="generalData.bedrooms" render={({ field }) => (
                    <FormItem><FormLabel>Habitaciones</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="generalData.bathrooms" render={({ field }) => (
                    <FormItem><FormLabel>Baños</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="generalData.parkingSpaces" render={({ field }) => (
                    <FormItem><FormLabel>Parqueos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="generalData.area" render={({ field }) => (
                    <FormItem><FormLabel>Área (m²)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
        </div>

        {/* Owner Info */}
        <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold border-b pb-2">Datos del Propietario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="owner.name" render={({ field }) => (
                    <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="owner.phone" render={({ field }) => (
                    <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="owner.email" render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel>Correo Electrónico</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
        </div>

        {/* Occupation Info */}
        <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold border-b pb-2">Ocupación</h3>
             <FormField control={form.control} name="occupation.status" render={({ field }) => (
                <FormItem><FormLabel>Estado de Ocupación</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                    <SelectItem value="ocupado_propietario">Ocupado por Propietario</SelectItem>
                    <SelectItem value="ocupado_inquilino">Ocupado por Inquilino</SelectItem>
                    <SelectItem value="desocupado">Desocupado</SelectItem>
                </SelectContent>
                </Select><FormMessage /></FormItem>
            )} />

            {watchOccupationStatus === 'ocupado_inquilino' && (
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Datos del Inquilino</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="occupation.tenant.name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre Inquilino</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="occupation.tenant.phone" render={({ field }) => (
                            <FormItem><FormLabel>Teléfono Inquilino</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="occupation.tenant.email" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Email Inquilino</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>
            )}
        </div>

        {/* Fees Info */}
        <div className="space-y-4 p-4 border rounded-lg">
             <h3 className="text-lg font-semibold border-b pb-2">Cuotas y Cargos</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="fees.monthlyFee" render={({ field }) => (
                    <FormItem><FormLabel>Cuota de Mantenimiento</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="fees.lateFeePercentage" render={({ field }) => (
                    <FormItem><FormLabel>% Cargo por Mora</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
             </div>
        </div>

        {/* Admin Notes */}
         <div className="space-y-4 p-4 border rounded-lg">
             <h3 className="text-lg font-semibold border-b pb-2">Datos Administrativos</h3>
            <FormField control={form.control} name="adminData.notes" render={({ field }) => (
                <FormItem><FormLabel>Notas Internas</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Guardar Unidad</Button>
        </div>
      </form>
    </Form>
  );
}
