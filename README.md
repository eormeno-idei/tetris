# StockerMan

## Descripción

StockerMan es un juego de plataformas y puzzle basado en la mecánica clásica de Tetris. El juego combina elementos de gestión de bloques con movimiento de personaje, creando una experiencia única donde el jugador debe interactuar con cajas que caen desde la parte superior de la pantalla.

## Características

- Personaje controlable que puede moverse, saltar, empujar y jalar cajas
- Sistema de cajas que caen aleatoriamente desde diferentes posiciones
- Física realista con simulación de gravedad para el personaje y las cajas
- Sistema de puntuación basado en líneas completadas
- Progresión de nivel automática cada 10 segundos, aumentando la dificultad
- Detección de colisiones que permite ser aplastado por cajas
- Animaciones fluidas del personaje con diferentes estados
- Interfaz limpia y moderna con estética pixel art
- Efectos de sonido para realimentación de acciones

## Controles

- **Flechas Izquierda/Derecha**: Mover el personaje horizontalmente
- **Flecha Arriba**: Saltar
- **Flecha Abajo**: Mover el bloque hacia abajo
- **Z**: Empujar cajas
- **X**: Jalar cajas
- **Barra espaciadora**: Caída rápida de bloques
- **P**: Pausar/Reanudar juego

## Instalación

No se requiere instalación. Simplemente clona el repositorio o descarga los archivos y abre index.html en tu navegador web para jugar.

```
git clone <repository-url>
cd stockerman
```

## Cómo jugar

1. Presiona el botón "Start / Pause" para iniciar el juego
2. Usa las flechas para mover al personaje y evitar ser aplastado
3. Empuja y jala cajas para crear líneas completas y ganar puntos
4. El juego se vuelve más rápido cada 10 segundos al subir de nivel
5. El juego termina cuando el personaje es aplastado por una caja
6. ¡Intenta lograr la puntuación más alta posible!

## Implementación técnica

El juego está construido usando:
- HTML5 para la estructura
- CSS3 para el estilo, utilizando fuentes gratuitas de Google Fonts
- JavaScript vanilla para la lógica del juego

La implementación incluye:
- Representación del tablero basada en cuadrícula
- Sistema de animación de sprites para el personaje
- Detección de colisiones entre el personaje y las cajas
- Sistema de física para la caída de cajas y personaje
- Mecánica de empuje y arrastre de cajas
- Modo de depuración visual para ayudar en el desarrollo

## Origen

StockerMan es una adaptación y evolución del clásico juego Tetris, transformando la experiencia pasiva de colocar piezas en una aventura interactiva donde el jugador debe esquivar, manipular y gestionar las cajas que caen.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

MIT License

Copyright (c) 2025 StockerMan Developers

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

¡Buena suerte y diviértete!