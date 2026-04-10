import { z } from "zod";

//  Normalize email in one place so all auth flows behave consistently.

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address.")
  .max(254, "Email is too long.")
  .transform(normalizeEmail);

  const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(100, "Password is too long.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[0-9]/, "Password must include at least one number.")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one special character.");

  /**
 * Signup payload validation.
 * - strict() rejects unknown keys to reduce accidental over-posting.
 * - age uses coerce so "21" from forms becomes 21 safely.
 */

  export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(80, "Name is too long."),
    email: emailSchema,
    age: z
      .coerce
      .number()
      .int("Age must be a whole number.")
      .min(18, "You must be at least 18 years old.")
      .max(120, "Please enter a valid age."),
    password: passwordSchema,
  })
  .strict();

// Credentials sign-in validation.

export const credentialsSignInSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, "Password is required."),
  })
  .strict();


// Inferred types provide end-to-end type safety in route handlers and services.

export type SignupSchema = z.infer<typeof signupSchema>;
export type CredentialsSignInSchema = z.infer<typeof credentialsSignInSchema>;