# Ecommerce en producción

Ecommerce se despliega como proyecto independiente y sirve el storefront, el
checkout y los pedidos online. Comparte PostgreSQL operativo con ERP bajo el
esquema acordado, pero no comparte sesiones ni secretos de autenticación.

Las claves de Culqi, Cloudinary, correo y HMAC son variables de servidor. Los
backups, migraciones, dominios y despliegues siguen el runbook central de
`saas-platform/docs/INFRAESTRUCTURA_PRODUCCION_COMPLETA.md`.
