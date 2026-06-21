# Feature Specification: Digit Guess Game

**Feature Branch**: `001-digit-guess-game`

**Created**: 2026-06-11

**Status**: Ready

**Input**: User description: "El juego se basa en que dos jugadores deben seleccionar y o escribir numeros que consten de 4 digitos del 0 al 9 en donde cada jugador debe adivinar el numero de del otro. En caso de acertar un numero que corresponda al indice y valor del digito se anota la cantidad de numero acertados, en caso de no coincidir con el indice y valor se registrar 0 numeros acertados. El juego es por turno y gana el que logra los 4 digitos acertados" + Aclaraciones (Modo de juego: Local, CPU, P2P sin servidor dedicado; Fin de partida: Completa la ronda de ambos jugadores).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Selección del Modo de Juego (Priority: P1)

Como jugador, quiero poder elegir entre tres modos de juego al iniciar:
1. **Local (Mismo Dispositivo)**: Dos jugadores se turnan usando la misma pantalla.
2. **Contra la Computadora (CPU)**: El jugador juega contra un oponente de inteligencia artificial.
3. **Multijugador Peer-to-Peer (P2P)**: Conexión directa con otro jugador compartiendo un código de sala (usando WebRTC vía PeerJS broker sin necesidad de servidor de base de datos o lógica propia).

**Why this priority**: Es la pantalla principal de acceso y define cómo se configuran las conexiones y el flujo de los jugadores.

**Independent Test**: Iniciar la app, hacer clic en cada uno de los botones de modo y verificar que redirigen al flujo de configuración correspondiente.

**Acceptance Scenarios**:
1. **Given** que estoy en el menú principal, **When** elijo "Contra la Computadora", **Then** el juego me pide ingresar mi número secreto mientras que la CPU genera el suyo automáticamente en segundo plano.
2. **Given** que elijo "Multijugador P2P", **When** elijo "Crear Sala", **Then** el sistema genera una clave de conexión y espera a que el segundo jugador se conecte.

---

### User Story 2 - Configuración de Números Secretos (Priority: P1)

Como jugador, quiero ingresar mi número secreto de 4 dígitos (del 0 al 9) de forma segura y oculta, para que el oponente no pueda verlo antes de empezar a adivinar.

**Why this priority**: Es fundamental para la integridad del juego; los números secretos deben ser privados antes del inicio del juego de adivinación.

**Independent Test**: Ingresar combinaciones de números y validar que las teclas pulsadas o números seleccionados se representen con asteriscos o se oculten inmediatamente al confirmar.

**Acceptance Scenarios**:
1. **Given** que estamos en el modo "Local (Mismo Dispositivo)", **When** el Jugador 1 ingresa su número "1234", **Then** la pantalla oculta los dígitos y solicita el dispositivo al Jugador 2 para que repita el proceso sin ver la entrada del Jugador 1.
2. **Given** que el jugador está en la pantalla de ingreso, **When** intenta ingresar un número con caracteres repetidos (ej. "1122"), **Then** el sistema lo acepta, validando únicamente que contenga exactamente 4 dígitos del 0 al 9.

---

### User Story 3 - Juego por Turnos y Feedback de Coincidencias (Priority: P1)

Como jugador en mi turno, quiero ingresar un intento de 4 dígitos para adivinar el número del rival y recibir feedback de cuántos dígitos coinciden de forma exacta en valor e índice.

**Why this priority**: Es la mecánica interactiva central del juego.

**Independent Test**: Simular un turno con un número secreto preestablecido y verificar que la cuenta de aciertos devuelta por el sistema sea matemáticamente exacta.

**Acceptance Scenarios**:
1. **Given** que el número secreto de mi rival es "1234", **When** ingreso el intento "1538", **Then** el sistema calcula "2 números acertados" (coinciden el '1' en la primera posición y el '3' en la tercera posición) e incrementa el contador de turnos.
2. **Given** que el número secreto de mi rival es "1234", **When** ingreso "5678", **Then** el sistema calcula "0 números acertados" y cambia el turno de juego.

---

### User Story 4 - Fin de Partida con Ronda Completa (Priority: P2)

Como jugador, quiero que el juego verifique las condiciones de victoria al completar la ronda (el turno del Jugador 2), permitiendo empates si ambos adivinan el número en la misma ronda.

**Why this priority**: Garantiza la equidad deportiva del juego por turnos, dando las mismas oportunidades de intentos a ambos jugadores.

**Independent Test**: Configurar números secretos, simular aciertos de 4 dígitos para ambos jugadores en la misma ronda y verificar que el resultado final sea "Empate".

**Acceptance Scenarios**:
1. **Given** que es la ronda 5, el Jugador 1 adivina el número del Jugador 2 (obtiene 4 aciertos), **When** se procesa el intento, **Then** el juego permite al Jugador 2 hacer su último intento de la ronda 5 antes de declarar un resultado.
2. **Given** que el Jugador 1 adivinó en la ronda 5, **When** el Jugador 2 realiza su intento en la ronda 5 y falla (obtiene menos de 4 aciertos), **Then** el juego declara inmediatamente ganador al Jugador 1.
3. **Given** que el Jugador 1 adivinó en la ronda 5, **When** el Jugador 2 realiza su intento en la ronda 5 y también obtiene 4 aciertos, **Then** el juego declara "Empate".

---

### Edge Cases

- **Desconexión en P2P**: Si un jugador pierde la conexión WebRTC o cierra la pestaña durante la partida, el juego debe alertar al jugador restante y permitirle regresar al menú principal conservando su progreso local o declarando victoria por abandono.
- **Entradas inválidas durante el juego**: La interfaz de entrada debe estar restringida (por ejemplo, mediante botones numéricos del 0 al 9 en pantalla) para evitar que se envíen entradas de longitud diferente a 4 o con caracteres inválidos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE ofrecer tres modos de juego seleccionables: Local, contra CPU y Multijugador P2P.
- **FR-002**: Para el modo P2P, la conexión de red DEBE realizarse de forma directa utilizando WebRTC brokered por PeerJS, requiriendo únicamente el intercambio de un código/ID legible por los jugadores.
- **FR-003**: El sistema DEBE permitir el ingreso de números de 4 dígitos empleando los dígitos del 0 al 9, admitiendo duplicados (ej. "9900").
- **FR-004**: Durante el ingreso del número secreto, la interfaz DEBE ocultar el valor a otros jugadores de forma visual.
- **FR-005**: El sistema DEBE validar cada intento comparando posición por posición (índice y valor) con el número secreto del oponente.
- **FR-006**: Si no hay coincidencias exactas de índice y valor, el resultado del intento DEBE registrarse estrictamente como 0 aciertos.
- **FR-007**: El sistema DEBE rastrear los turnos de manera que una ronda consista en un intento de adivinación por parte de cada jugador (Jugador 1 y Jugador 2).
- **FR-008**: Si el Jugador 1 acierta el código en la ronda actual, el juego DEBE permitir al Jugador 2 realizar su intento correspondiente a esa misma ronda antes de evaluar el fin del juego.
- **FR-009**: El sistema DEBE mostrar un historial en tiempo real de los intentos realizados por cada jugador, detallando la propuesta y la cantidad de aciertos obtenidos.

### Key Entities

- **Player (Jugador)**: Posee un identificador (Jugador 1 / Jugador 2 / CPU), un número secreto de 4 dígitos, un historial de intentos y un estado de victoria/derrota.
- **Attempt (Intento)**: Registro de los 4 dígitos sugeridos por un jugador y la puntuación de aciertos calculada (0 a 4).
- **GameSession (Sesión del Juego)**: Entidad que orquesta el modo de juego (Local, CPU, P2P), la ronda actual, el turno del jugador activo y los números secretos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La latencia en la transmisión de jugadas en el modo P2P debe ser imperceptible (inferior a 200 ms una vez establecida la conexión directa).
- **SC-002**: La interfaz de entrada debe restringir por completo caracteres no numéricos o longitudes inválidas, haciendo imposible enviar un intento incorrecto.
- **SC-003**: El juego se inicia, se configura y se juega por completo dentro del navegador del usuario sin necesidad de configurar ningún servidor de base de datos o lógica personalizada.

## Assumptions

- Se asume que el juego utilizará la biblioteca PeerJS pública y gratuita como canal de señalización para establecer la conexión WebRTC Peer-to-Peer.
- Se asume que el oponente CPU utilizará un algoritmo básico de adivinación (eliminación de opciones o selección aleatoria inteligente de números no probados).
