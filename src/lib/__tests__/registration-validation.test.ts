import { validateRegistration } from '@/lib/registration-validation';

describe('validación de registro', () => {
  it('acepta datos válidos', () => {
    expect(validateRegistration('Ana López', 'ana@correo.com', 'secreto123')).toBeNull();
  });

  it('rechaza nombre demasiado corto', () => {
    expect(validateRegistration('A', 'ana@correo.com', 'secreto123')).toMatch(/nombre/i);
  });

  it('rechaza correo sin arroba', () => {
    expect(validateRegistration('Ana López', 'correo-invalido', 'secreto123')).toMatch(/correo/i);
  });

  it('rechaza contraseña corta', () => {
    expect(validateRegistration('Ana López', 'ana@correo.com', '123')).toMatch(/contraseña/i);
  });

  it('rechaza campos vacíos sin lanzar', () => {
    expect(validateRegistration('', '', '')).not.toBeNull();
  });
});
