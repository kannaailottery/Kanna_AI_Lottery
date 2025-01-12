# Lotería Anime 3D - Plataforma PumpFun

Una plataforma de lotería interactiva con una crupier anime 3D que interactúa con los usuarios en tiempo real.

## Características

- Crupier Anime 3D interactiva
- Sistema de lotería con 50 boletos por ronda
- Chat en vivo con la crupier
- Integración con Solana blockchain
- Interfaz moderna y atractiva

## Tecnologías Utilizadas

- Next.js 14
- React Three Fiber / Three.js
- Tailwind CSS
- TypeScript
- Solana Web3.js
- Firebase (próximamente)

## Requisitos Previos

- Node.js 18.0 o superior
- NPM o Yarn
- Wallet de Solana (para interactuar con la blockchain)

## Instalación

1. Clonar el repositorio:
\`\`\`bash
git clone [URL_DEL_REPOSITORIO]
\`\`\`

2. Instalar dependencias:
\`\`\`bash
npm install
# o
yarn install
\`\`\`

3. Configurar variables de entorno:
- Copiar `.env.local.example` a `.env.local`
- Actualizar las variables con tus propios valores

4. Iniciar el servidor de desarrollo:
\`\`\`bash
npm run dev
# o
yarn dev
\`\`\`

## Estructura del Proyecto

\`\`\`
src/
  ├── components/
  │   ├── 3d/          # Componentes Three.js
  │   └── ui/          # Componentes de interfaz
  ├── hooks/           # Custom hooks
  ├── services/        # Servicios (blockchain, etc.)
  ├── styles/          # Estilos globales
  └── utils/           # Utilidades y helpers
\`\`\`

## Roadmap

- [x] Implementación básica de la interfaz
- [x] Modelo 3D de la crupier (placeholder)
- [x] Sistema de chat básico
- [ ] Integración con Solana
- [ ] Sistema de voz para la crupier
- [ ] Animaciones avanzadas
- [ ] Integración con base de datos

## Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## Licencia

[MIT](LICENSE)

## Contacto

- Equipo PumpFun
- Email: [EMAIL]
- Twitter: [@PumpFun]
