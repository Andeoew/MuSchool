import { z } from 'zod'

export const createParentSchema = z.object({
  firstName: z.string().trim().min(2, 'Ad en az 2 karakter olmalı.'),
  lastName: z.string().trim().min(2, 'Soyad en az 2 karakter olmalı.'),
  email: z.string().trim().email('Geçerli bir e-posta adresi girin.'),
  phone: z.string().trim().optional().or(z.literal('')),
  tempPassword: z.string().min(8, 'Geçici parola en az 8 karakter olmalı.'),
  studentIds: z.array(z.string()).min(1, 'En az bir öğrenci seçmelisiniz.'),
})

export type CreateParentInput = z.infer<typeof createParentSchema>
