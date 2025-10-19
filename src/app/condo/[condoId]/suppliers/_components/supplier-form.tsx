
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import type { Supplier } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  rnc: z.string().optional(),
  category: z.string().min(3, "La categoría es requerida."),
  contact: z.object({
    name: z.string().min(3, "El nombre de contacto es requerido."),
    phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos."),
    email: z.string().email("El correo electrónico no es válido."),
  }),
});

type SupplierFormValues = z.infer<typeof formSchema>;

interface SupplierFormProps {
  onSubmit: (data: SupplierFormValues | (SupplierFormValues & { id: string })) => void;
  onCancel: () => void;
  supplier?: Supplier;
}

export function SupplierForm({ onSubmit, onCancel, supplier }: SupplierFormProps) {
  const defaultValues: SupplierFormValues = {
    name: supplier?.name || "",
    rnc: supplier?.rnc || "",
    category: supplier?.category || "",
    contact: {
      name: supplier?.contact.name || "",
      phone: supplier?.contact.phone || "",
      email: supplier?.contact.email || "",
    },
  };

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function handleSubmit(values: SupplierFormValues) {
    if (supplier?.id) {
        onSubmit({ ...values, id: supplier.id });
    } else {
        onSubmit(values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Suplidor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Ferretería Americana" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="rnc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RNC (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="130-12345-6" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Mantenimiento, Limpieza" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
        </div>
        
        <div className="space-y-4">
            <h3 className="text-base font-medium text-foreground border-t pt-4">Información de Contacto</h3>
            <FormField
              control={form.control}
              name="contact.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="809-555-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="juan.perez@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Guardar Suplidor</Button>
        </div>
      </form>
    </Form>
  );
}
