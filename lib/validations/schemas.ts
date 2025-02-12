import * as z from "zod"

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const profileSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  currentPassword: z.string().min(6, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
})

export const universitySchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  program: z.string().min(1, { message: "Program is required" }),
})

export const settingsSchema = z.object({
  emailNotifications: z.boolean(),
  dataExportFormat: z.enum(["excel", "csv", "json"]),
  theme: z.enum(["light", "dark", "system"]),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type UniversityFormData = z.infer<typeof universitySchema>
export type SettingsFormData = z.infer<typeof settingsSchema>