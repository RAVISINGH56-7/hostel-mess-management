// src/lib/validations/student.ts
import { z } from "zod";

export const studentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  room: z.string().min(1, "Room number is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  course: z.string().min(1, "Course is required"),
  semester: z.coerce.number().int().min(1).max(8, "Semester must be between 1 and 8"),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;
