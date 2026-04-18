-- Asegurar que todos los usuarios existentes tengan isActive = true
UPDATE "User" 
SET "isActive" = true 
WHERE "isActive" IS NULL;

-- Asegurar que todos los usuarios con email tengan email en minúsculas
UPDATE "User" 
SET email = LOWER(email) 
WHERE email IS NOT NULL AND email != LOWER(email);
