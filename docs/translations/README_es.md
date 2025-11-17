# Flappy Pi

**Flappy Pi** es un juego adictivo de estilo Flappy Bird con niveles infinitos, completamente integrado con el ecosistema de Pi Network. Los jugadores pueden iniciar sesión con Pi, realizar compras dentro del juego con monedas Pi, competir en una tabla de clasificación en tiempo real y ganar recompensas semanales de Pi.

---

## Características

- Jugabilidad de desplazamiento lateral infinito con tuberías generadas proceduralmente
- Controles suaves de toque/clic con dificultad creciente
- Skins de pájaro personalizables comprables mediante pagos Pi
- Inicio de sesión de Pi Network e integración de billetera
- Tabla de clasificación en tiempo real con las 10 mejores puntuaciones de jugadores
- Recompensas semanales de tokens Pi para los ganadores de la tabla de clasificación
- Anuncios recompensados para revivir y pequeñas bonificaciones de Pi
- Diseño responsivo para dispositivos de escritorio y móviles
- Pantalla de inicio y logo de marca por mrwain organization

---

## Demo

> _[Insertar enlace a demo alojado o capturas de pantalla aquí]_

---

## Instalación y Configuración

### Prerrequisitos

- Node.js (v14 o superior)
- npm o yarn
- Credenciales de desarrollador de Pi Network
- Firebase o tu configuración de backend preferida

### Clonar el Repositorio

```bash
git clone https://github.com/yourusername/flappy-pi.git
cd flappy-pi
```

### Instalar Dependencias

```bash
npm install
```

### Configurar Variables de Entorno

Crear un archivo `.env` en la raíz con:

```env
PI_APP_ID=tu_pi_app_id
DATABASE_URL=tu_cadena_de_conexion_de_base_de_datos
PI_WALLET_ADDRESS=tu_direccion_de_billetera_pi
```

### Ejecutar Localmente

```bash
npm run start
```

---

## Uso

* Inicia sesión con tu cuenta de Pi Network
* Juega tocando o haciendo clic para hacer que el pájaro aletee
* Compra skins de pájaro, revivir y multiplicadores en la tienda usando monedas Pi
* Verifica tu rango en la tabla de clasificación después de cada juego
* Mira anuncios recompensados para ganar vidas extra o bonificaciones de Pi
* Los mejores jugadores semanales reciben recompensas de Pi automáticamente

---

## Estructura de Carpetas

```
flappy-pi/
├── index.html
├── styles.css
├── game.js
├── shop.js
├── leaderboard.js
├── ads.js
├── pi-sdk.js
├── assets/
│   ├── bird.png
│   ├── bird-skin-red.png
│   ├── pipe.png
│   └── logo.png
├── backend/
│   ├── server.js
│   └── database.js
├── README.md
└── package.json
```

---

## Despliegue

Consulta [deployment_guide.md](docs/deployment_guide.md) para instrucciones detalladas sobre el despliegue del frontend y backend.

---

## Contribuir

¡Las contribuciones son bienvenidas! Por favor, haz fork del repositorio y crea una pull request con tus mejoras.

---

## Licencia

Licencia MIT © Junio 2025 Flappy Pi

---

## Contacto

Para soporte o consultas, contacta:
**Flappy Pi**
Email: [support@flappypi.fun](mailto:support@flappypi.fun) o [flappypi.fun@gmail.com](mailto:flappypi.fun@gmail.com)
Sitio web: [https://www.flappypi.fun](https://www.flappypi.fun) (flappy.pi próximamente)

---

¡Disfruta volando con Flappy Pi! 🐦🚀 