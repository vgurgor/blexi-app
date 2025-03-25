'use client';

// Bu dosya, taşınmış olan useAuth hook'unu geriye dönük uyumluluk için yeniden export etmek için kullanılır
// Eski kodun düzgün çalışmasını sağlamak için, useAuth'u @/hooks/useAuth'tan export ediyoruz

import { useAuth } from '@/hooks/useAuth';

export { useAuth }; 