import { z } from 'zod'
import { PARENT_RELATIONSHIPS } from '@/lib/validations/student'

const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v)

export const createParentSchema = z.object({
  firstName: z.string().trim().min(2, 'Ad en az 2 karakter olmalı.'),
  lastName: z.string().trim().min(2, 'Soyad en az 2 karakter olmalı.'),
  email: z.string().trim().email('Geçerli bir e-posta adresi girin.'),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(30).optional()),
  tempPassword: z.preprocess(
    emptyToUndefined,
    z.string().min(8, 'Geçici parola en az 8 karakter olmalı.').optional(),
  ),
  createLoginAccount: z.coerce.boolean().default(true),
  studentIds: z.array(z.string()).min(1, 'En az bir öğrenci seçmelisiniz.'),
  relationship: z.enum(PARENT_RELATIONSHIPS).optional(),
})

export type CreateParentInput = z.infer<typeof createParentSchema>

export const updateParentSchema = z.object({
  firstName: z.string().trim().min(2, 'Ad en az 2 karakter olmalı.'),
  lastName: z.string().trim().min(2, 'Soyad en az 2 karakter olmalı.'),
  email: z.string().trim().email('Geçerli bir e-posta adresi girin.'),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(30).optional()),
})

export type UpdateParentInput = z.infer<typeof updateParentSchema>

export const linkParentToStudentsSchema = z.object({
  parentId: z.string().min(1),
  studentIds: z.array(z.string()).min(1, 'En az bir öğrenci seçmelisiniz.'),
  relationship: z.enum(PARENT_RELATIONSHIPS).optional(),
})

export type LinkParentToStudentsInput = z.infer<typeof linkParentToStudentsSchema>
