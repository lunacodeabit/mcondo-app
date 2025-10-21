"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Incident } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  reportedBy: z.string().min(3, "El reportante es requerido."),
  title: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
});

type IncidentFormValues = z.infer<typeof formSchema>;

interface IncidentFormProps {
  onSubmit: (data: Omit<Incident, 'id'> | Incident) => void;
  onCancel: () => void;
  incident?: Incident;
}

export function IncidentForm({ onSubmit, onCancel, incident }: IncidentFormProps) {

  const defaultValues: Partial<IncidentFormValues> = {
    title: incident?.title || "",
    reportedBy: incident?.reportedBy || "",
  };

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function handleSubmit(values: IncidentFormValues) {
    const dataToSend = {
      ...values,
      // Default values for fields not in the simplified form
      description: values.title, // Using title as description for simplicity now
      date: incident ? new Date(incident.date) : new Date(),
      priority: incident?.priority || "baja",
      status: incident?.status || "abierto",
    };
    
    if (incident?.id) {
      onSubmit({ ...dataToSend, id: incident.id });
    } else {
      onSubmit(dataToSend as Omit<Incident, 'id'>);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="reportedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reportado por</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Apto 101, Juan Pérez, Conserjería" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del Incidente</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa el problema o situación..."
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Guardar Incidente</Button>
        </div>
      </form>
    </Form>
  );
}
