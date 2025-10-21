"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Communication } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres."),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres."),
  audience: z.enum(["todos", "propietarios", "inquilinos"]),
});

type CommunicationFormValues = z.infer<typeof formSchema>;

interface CommunicationFormProps {
  onSubmit: (data: Omit<Communication, 'id' | 'date'>) => void;
  onCancel: () => void;
  communication?: Omit<Communication, 'id' | 'date'>;
}

export function CommunicationForm({ onSubmit, onCancel, communication }: CommunicationFormProps) {
  const form = useForm<CommunicationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: communication || {
      title: "",
      content: "",
      audience: "todos",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Corte de Agua Programado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido del Comunicado</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escriba los detalles del comunicado aquí..."
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Comunicado</Button>
        </div>
      </form>
    </Form>
  );
}
