import { z } from 'zod'
import { INSTRUMENT_OPTIONS } from '@/lib/auth-utils'

export const createTeacherSchema = z.object({
  firstName: z.string().trim().min(2, 'Ad en az 2 karakter olmalı.'),
  lastName: z.string().trim().min(2, 'Soyad en az 2 karakter olmalı.'),
  email: z.string().trim().email('Geçerli bir e-posta adresi girin.'),
  phone: z.string().trim().optional().or(z.literal('')),
  instrument: z.enum(INSTRUMENT_OPTIONS, { message: 'Geçerli bir branş seçin.' }),
  tempPassword: z.string().min(8, 'Geçici parola en az 8 karakter olmalı.'),
})

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>
