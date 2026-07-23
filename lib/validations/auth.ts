import { z } from 'zod'

export const RegisterAcademySchema = z.object({
  academyName: z.string().trim().min(2, 'Akademi adı en az 2 karakter olmalı.'),
  ownerName: z.string().trim().min(2, 'Ad soyad en az 2 karakter olmalı.'),
  email: z.string().trim().email('Geçerli bir e-posta adresi girin.'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı.'),
})

export type RegisterAcademyInput = z.infer<typeof RegisterAcademySchema>
