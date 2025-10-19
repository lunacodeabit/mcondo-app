
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Unit } from "@/lib/definitions";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
  unitId: z.string().min(1, "La unidad es requerida."),
  type: z.enum(["cargo", "abono"], { required_error: "El tipo es requerido." }),
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres."),
  amount: z.coerce.number().positive("El monto debe ser un número positivo."),
  date: z.date({ required_error: "La fecha es requerida." }),
});

type MovementFormValues = z.infer<typeof formSchema>;

interface AccountMovementFormProps {
  units: Unit[];
  onSubmit: (data: MovementFormValues) => void;
  onCancel: () => void;
  preselectedUnitId?: string;
  movementType?: 'cargo' | 'abono';
}

export function AccountMovementForm({ units, onSubmit, onCancel, preselectedUnitId, movementType }: AccountMovementFormProps) {

  const defaultValues = {
      unitId: preselectedUnitId || (units.length > 0 ? units[0].id : ''),
      type: movementType || "cargo",
      description: "",
      amount: undefined,
      date: new Date(),
  };
    
  const form = useForm<MovementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function handleSubmit(values: MovementFormValues) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {!preselectedUnitId && (
            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una unidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                              {unit.unitNumber} - {unit.owner.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha</FormLabel>
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimiento</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!movementType}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="cargo">Cargo (Deuda)</SelectItem>
                        <SelectItem value="abono">Abono (Pago)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Cuota extraordinaria, Pago de cuota" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="5000.00" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Guardar Movimiento</Button>
        </div>
      </form>
    </Form>
  );
}
