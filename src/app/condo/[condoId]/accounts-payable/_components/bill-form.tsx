
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import type { Invoice, Supplier } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  supplierId: z.string().min(1, "El suplidor es requerido."),
  invoiceNumber: z.string().optional(),
  amount: z.coerce.number().positive("El monto debe ser un número positivo."),
  date: z.date({ required_error: "La fecha de emisión es requerida." }),
  dueDate: z.date({ required_error: "La fecha de vencimiento es requerida." }),
  items: z.array(z.object({
    description: z.string().min(1, "La descripción es requerida."),
    quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1."),
    unitPrice: z.coerce.number().positive("El precio debe ser positivo.")
  })).min(1, "Debe haber al menos un item en la factura."),
});

type BillFormValues = z.infer<typeof formSchema>;

interface BillFormProps {
  suppliers: Supplier[];
  onSubmit: (data: BillFormValues | (BillFormValues & { id: string })) => void;
  onCancel: () => void;
  invoice?: Invoice;
}

export function BillForm({ suppliers, onSubmit, onCancel, invoice }: BillFormProps) {
  const defaultValues: BillFormValues = {
    supplierId: invoice?.supplierId || "",
    invoiceNumber: invoice?.invoiceNumber || "",
    amount: invoice?.amount || 0,
    date: invoice ? new Date(invoice.date) : new Date(),
    dueDate: invoice ? new Date(invoice.dueDate) : new Date(),
    items: invoice?.items || [{ description: "", quantity: 1, unitPrice: invoice?.amount || 0 }]
  };

  const form = useForm<BillFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const { fields, append, remove } = (form as any).control.register('items');

  const watchItems = form.watch("items");
  
  React.useEffect(() => {
    const total = watchItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    form.setValue("amount", total, { shouldValidate: true });
  }, [watchItems, form]);


  function handleSubmit(values: BillFormValues) {
    if (invoice?.id) {
        onSubmit({ ...values, id: invoice.id });
    } else {
        onSubmit(values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suplidor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un suplidor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. Factura (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="F-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha Emisión</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Seleccione fecha</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha Vencimiento</FormLabel>
                   <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Seleccione fecha</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div>
            <FormLabel>Items de la factura</FormLabel>
            <div className="space-y-2 mt-2">
                 {form.getValues('items').map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-6">
                            <FormField
                                control={form.control}
                                name={`items.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="Descripción del item" {...field} />
                                        </FormControl>
                                         <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input type="number" placeholder="Cant." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-3">
                            <FormField
                                control={form.control}
                                name={`items.${index}.unitPrice`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input type="number" placeholder="Precio" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-1">
                            <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} disabled={(form.getValues('items') || []).length <= 1}>X</Button>
                        </div>
                    </div>
                ))}
            </div>
             <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}>
                Agregar Item
            </Button>
        </div>


        <div className="flex justify-between items-center pt-4">
            <div className="text-lg font-bold">
                Total: {form.getValues('amount').toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Guardar Factura</Button>
            </div>
        </div>
      </form>
    </Form>
  );
}
