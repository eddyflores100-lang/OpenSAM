# OpenSAM

**Investigación asistida de oportunidades federales de SAM.gov y herramientas TypeScript para trabajar con esos datos.**

OpenSAM reúne dos superficies relacionadas, pero distintas:

1. **Piloto web privado:** búsqueda por título y coincidencia transparente con un perfil para que una persona revise los avisos.
2. **Paquetes TypeScript:** tipos de la API pública, cliente SDK y utilidades de scoring reutilizables.

El piloto no presenta ofertas, no determina elegibilidad y no envía propuestas automáticamente.

- **Código:** https://github.com/eddyflores100-lang/OpenSAM
- **Fuente oficial:** https://sam.gov/
- **Documentación de la API:** https://open.gsa.gov/api/get-opportunities-public-api/
- **Guía del piloto:** [docs/PILOT.md](docs/PILOT.md)

## Estado actual

<badge>Private assisted-search pilot</badge>

La aplicación web y el piloto tienen un alcance deliberadamente limitado:

- Busca avisos de SAM.gov por título y criterios configurados.
- Muestra registros activos devueltos por la consulta.
- Calcula una puntuación explicable a partir de coincidencias de NAICS y palabras de capacidades en el título.
- Presenta los resultados para revisión humana.

**La puntuación es una ayuda de clasificación, no una recomendación de presentar una oferta.** No verifica certificaciones, elegibilidad legal, anexos, requisitos completos, capacidad real ni probabilidad de adjudicación. Una búsqueda sin resultados tampoco demuestra que no existan oportunidades relevantes.

El piloto privado requiere una clave de SAM.gov y un token de acceso configurados en el servidor. No hay cuentas de usuario, cuotas duraderas por cliente ni un servicio público multi-tenant. No introduzcas secretos en variables VITE ni en el navegador.

## Componentes del repositorio

| Ruta | Función |
| --- | --- |
| apps/web/ | Interfaz de búsqueda y revisión |
| apps/server/ | API privada del piloto; consulta SAM.gov desde el servidor |
| apps/landing/ | Sitio informativo estático |
| packages/samgov-sdk/ | Cliente TypeScript para la API de oportunidades |
| packages/sam-gov-types/ | Tipos TypeScript de los datos SAM.gov |
| packages/govcon-scoring/ | Funciones de scoring reutilizables |
| docs/ | Arquitectura, despliegue, dependencias, scoring y límites del piloto |

Los paquetes y el piloto no deben confundirse: el SDK mantiene su propia API y su scoring independiente; el piloto web usa una regla más acotada descrita en docs/PILOT.md.

## Arquitectura

    Navegador
      └── apps/web (Vite + React)
            └── /api (proxy en desarrollo)
                  └── apps/server (Node.js)
                        └── SAM.gov Opportunities Public API

    Paquetes independientes
      ├── packages/samgov-sdk
      ├── packages/sam-gov-types
      └── packages/govcon-scoring

    Sitio informativo
      └── apps/landing

En el piloto, el servidor consulta el host oficial fijo de SAM.gov y devuelve campos normalizados para mostrar los avisos. La clave del proveedor permanece en el proceso del servidor. Consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para el diseño y [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md) para el inventario de dependencias.

## Requisitos

- Node.js **22.12 o superior**.
- npm.
- Una clave de SAM.gov para realizar consultas reales.
- Para el piloto privado: SAM_GOV_API_KEY y OPENSAM_ACCESS_TOKEN configurados en el entorno del servidor.

## Instalación y desarrollo

Clona el repositorio e instala las dependencias del workspace:

    git clone https://github.com/eddyflores100-lang/OpenSAM.git
    cd OpenSAM
    npm ci

Inicia el servidor privado del piloto:

    # Configura primero SAM_GOV_API_KEY y OPENSAM_ACCESS_TOKEN
    npm run start:pilot

Inicia la interfaz web en otra terminal:

    npm run dev

Vite sirve la aplicación web y reenvía las rutas /api al servidor local del piloto. El servidor escucha en 127.0.0.1:3001 de forma predeterminada. No lo expongas directamente a Internet sin HTTPS, control de acceso y límites de petición adecuados.

### Variables del piloto

| Variable | Dónde se usa | Propósito |
| --- | --- | --- |
| SAM_GOV_API_KEY | Servidor | Credencial de la API oficial SAM.gov |
| OPENSAM_ACCESS_TOKEN | Servidor y cliente autorizado | Token de acceso privado del piloto |
| HOST | Servidor, opcional | Cambia la dirección de escucha cuando el entorno lo requiere |

Genera el token de acceso con un generador criptográficamente seguro y distribúyelo por un canal privado. El ejemplo de entorno es documentación: el servidor no carga automáticamente archivos .env. No guardes claves en Git ni en el bundle de Vite.

## Comprobaciones

Desde la raíz:

    npm test
    npm run build
    npm run typecheck
    npm run test:pilot

- npm test: ejecuta las pruebas de los workspaces que definen ese script.
- npm run build: construye los workspaces con script de build.
- npm run typecheck: ejecuta la comprobación de tipos de los workspaces que la implementan.
- npm run test:pilot: prueba las rutas y reglas del servidor privado del piloto.

Para ejecutar el sitio informativo:

    npm run build --workspace apps/landing

Los comandos y límites de cada paquete se describen también en su propio package.json y README. Una prueba automatizada con respuestas simuladas no demuestra acceso real a SAM.gov ni sustituye una validación con credenciales autorizadas.

## Cómo se calcula el resultado del piloto

La regla del piloto es intencionalmente sencilla y visible:

- La consulta usa el título y los criterios configurados.
- Se procesa una página limitada de avisos recientes.
- Se muestran los registros que la respuesta identifica como activos.
- La puntuación suma coincidencias de NAICS y términos de capacidades encontrados en el título.

No se descargan ni analizan anexos, no se sigue una URL de descripción externa y no se verifican certificaciones. La regla del piloto no es la misma API de scoring que ofrece el paquete govcon-scoring.

Consulta [docs/PILOT.md](docs/PILOT.md) y [docs/SCORING.md](docs/SCORING.md) antes de interpretar una puntuación o comunicar resultados a un cliente.

## Despliegue y operación

El piloto está diseñado para una instancia privada controlada. Su estado de cuota es temporal y se reinicia con el proceso; no uses varias réplicas ni prometas límites persistentes por usuario. Configura un proxy HTTPS delante del servidor, evita registrar cabeceras de autorización y aplica límites de tráfico.

Antes de cualquier lanzamiento público se necesitan, como mínimo, identidad de usuario, cuotas persistentes, auditoría, revocación de acceso, controles operativos y una revisión de seguridad. No se implementan pagos ni suscripciones en este piloto.

Guía completa: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Límites y uso responsable

- Los avisos y sus estados dependen de la API oficial y de los parámetros consultados.
- Una lista parcial o vacía no equivale a una búsqueda exhaustiva.
- El scoring no es asesoría legal, financiera ni de contratación pública.
- La persona usuaria debe revisar el aviso oficial, sus anexos, fechas, requisitos y modificaciones en SAM.gov.
- No se envían ofertas ni se realizan acciones de contratación en nombre del usuario.

## Contribuir

Antes de proponer cambios, revisa la documentación del paquete afectado, ejecuta las pruebas relevantes y describe cualquier cambio en el comportamiento del SDK o del piloto. No publiques claves API, tokens ni datos privados de clientes.

- [Issues](https://github.com/eddyflores100-lang/OpenSAM/issues)
- [Pull requests](https://github.com/eddyflores100-lang/OpenSAM/pulls)
- [License](LICENSE)
- [Security policy](SECURITY.md)
