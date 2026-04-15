import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});

export const qrCreateSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  destinationUrl: z.string().url("URL non valido"),
  folderId: z.string().optional().nullable(),
  fgColor: z.string().default("#000000"),
  bgColor: z.string().default("#FFFFFF"),
  cornerRadius: z.number().min(0).max(50).default(0),
  expiresAt: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
});

export const qrUpdateSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio").optional(),
  destinationUrl: z.string().url("URL non valido").optional(),
  folderId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  fgColor: z.string().optional(),
  bgColor: z.string().optional(),
  cornerRadius: z.number().min(0).max(50).optional(),
  expiresAt: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
});

export const folderSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  color: z.string().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type QRCreateInput = z.infer<typeof qrCreateSchema>;
export type QRUpdateInput = z.infer<typeof qrUpdateSchema>;
export type FolderInput = z.infer<typeof folderSchema>;
