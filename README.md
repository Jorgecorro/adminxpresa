# XpresaControl - Sistema de Gestión de Pedidos Textiles

Sistema completo para gestión de pedidos textiles con flujo de trabajo desde registro hasta envío.

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env.local` y configura tus credenciales de Supabase:

```bash
cp .env.example .env.local
```

### 3. Configurar la base de datos

Ejecuta el script SQL en tu proyecto de Supabase:

1. Ve a tu dashboard de Supabase
2. Abre el **SQL Editor**
3. Copia y ejecuta el contenido de `supabase/schema.sql`

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/           # Páginas de login/registro
│   ├── (dashboard)/      # Dashboard y gestión de pedidos
│   └── layout.tsx        # Layout principal
├── components/
│   ├── ui/               # Componentes base (Button, Input, Card)
│   ├── layout/           # Sidebar, Header
│   └── orders/           # OrderCard, ProductTable, OrderFilter
├── hooks/                # useAuth, useOrders
├── lib/
│   ├── supabase/         # Cliente Supabase
│   ├── pdf-generator.ts  # Generación de PDFs
│   └── utils.ts          # Utilidades
└── types/
    └── database.ts       # Tipos de TypeScript
```

## 🔧 Funcionalidades

- ✅ Autenticación con Supabase Auth
- ✅ Registro de pedidos con múltiples productos
- ✅ Filtros por estado (Pendiente, Cotizado, Enviado)
- ✅ Generación de cotizaciones en PDF
- ✅ Carga de imágenes de previos
- ✅ Cálculo automático de comisión (5%)
- ✅ Cambio automático de estado al enviar

## 🐳 Deployment con Docker

### Build

```bash
docker build -t xpresacontrol .
```

### Run

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=tu-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key \
  xpresacontrol
```

### Docker Compose

```bash
docker-compose up -d
```

## 🔑 Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase |

## 📄 Licencia

Proyecto privado - XpresaControl
