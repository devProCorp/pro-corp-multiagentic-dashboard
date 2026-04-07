---
agente: Disenador Visual
task_id: PROCORP-2026-001-T4
version: v1.0
fecha: 2026-04-07
cliente: PROCORP (PROCORPMDigital)
campana: "Pioneros IA — Captacion de Clientes Q2-Q3 2026"
tipo: Especificaciones de Banners LinkedIn
estado: REVIEW
entregable: "3F — Banners para Perfil de LinkedIn"
deadline: 2026-04-14
---

# Especificaciones de Banners LinkedIn
## Entregable 3F — Banner de Empresa + Banner Personal del Fundador

---

## ESPECIFICACIONES GENERALES

- **Resolucion**: 1584x396px
- **Safe zone**: Considerar que la foto de perfil (circular, ~128px) se superpone en la esquina inferior izquierda. No colocar elementos importantes en esa area (cuadrado de 200x200px desde la esquina inferior izquierda).
- **Formato de entrega**: PNG exportado + archivo editable en Canva/Figma
- **Consideracion mobile**: En movil, LinkedIn recorta los laterales. Contenido critico debe estar centrado en el 70% central del banner.

---

## BANNER 1: PERFIL DE EMPRESA PROCORP

### Concepto
Comunicar la propuesta de valor principal de PROCORP como agencia IA-first, con el sistema multi-agente como elemento visual diferenciador.

### Especificacion Detallada

| Zona | Contenido | Especificacion |
|------|-----------|---------------|
| **Fondo completo** | Base + patron | Midnight Black (`#0A0A0F`) con patron "Grid Neural" al 40% de opacidad. Gradiente de marca muy sutil (5% opacidad) en la esquina superior derecha como elemento decorativo. |
| **Zona izquierda (0-35%)** | Area protegida | Espacio reservado para la superposicion de la foto de perfil. No colocar texto ni elementos criticos. Mantener solo el patron de fondo. |
| **Zona central (35-75%)** | Mensaje principal | **Headline**: "Marketing operado por IA" — Space Grotesk Bold 36px, Cloud White. **Subheadline**: "9 agentes especializados. Un sistema integrado. Resultados reales." — Inter Regular 18px, Steel Gray. Separacion entre headline y subheadline: 12px. Alineacion: izquierda. |
| **Zona derecha (75-100%)** | Visual del sistema | Diagrama simplificado: hexagono central (32px) con 4-5 lineas radiando hacia circulos pequenos (8px). Color: Electric Blue para el nodo central, Steel Gray al 40% para las lineas y nodos satelite. Efecto glow sutil en el hexagono central. Centrado verticalmente en esta zona. |
| **Esquina inferior derecha** | Logo | Logo PROCORP horizontal, monocromo blanco, 120px de ancho. Padding: 20px desde los bordes. |
| **Linea decorativa** | Acento | Linea horizontal de 2px en Electric Blue, 100px de ancho, debajo del headline como subrayado parcial. |

### Safe Zone Mobile
- Contenido critico (headline + subheadline) debe estar dentro del rango 300px-1100px horizontal
- Nada importante por debajo de los 300px verticales (zona de foto de perfil)

---

## BANNER 2: PERFIL PERSONAL DEL FUNDADOR

### Concepto
Posicionar al fundador como experto en marketing IA, con un tono mas personal y una CTA directa. Complementa el perfil de empresa con una perspectiva humana.

### Especificacion Detallada

| Zona | Contenido | Especificacion |
|------|-----------|---------------|
| **Fondo completo** | Base elegante | Deep Slate (`#1A1A2E`) solido, sin patron (mas limpio que el banner de empresa para diferenciar). Linea horizontal muy sutil en la base: gradiente de marca, 1px, 60% opacidad. |
| **Zona izquierda (0-30%)** | Area protegida | Espacio reservado para foto de perfil. Solo fondo. |
| **Zona central-izquierda (30-65%)** | Identidad profesional | **Nombre/Titulo**: "Fundador, PROCORP" — Inter SemiBold 20px, Cloud White. **Descriptor**: "Construyo sistemas de IA que operan tu marketing" — Space Grotesk Bold 28px, Cloud White. **Credenciales** (opcional): "Marketing + IA + Sistemas Multi-Agente" — Inter Regular 16px, Electric Blue. Alineacion: izquierda. Espaciado entre elementos: 8px. |
| **Zona derecha (65-100%)** | CTA visual | Rectangulo redondeado (border-radius 8px): fondo Electric Blue, texto "Hablemos" o "Agenda una llamada" — Inter SemiBold 18px, Cloud White, padding 10px 24px. Debajo del boton: "Link en mi perfil" — Inter Regular 14px, Steel Gray. |
| **Esquina inferior derecha** | Logo discreto | Logo PROCORP icono solo (sin texto), monocromo blanco, 28px, 15px desde bordes. Mucho mas discreto que en el banner de empresa. |

### Safe Zone Mobile
- El descriptor es el elemento mas critico: debe estar centrado en el 70% central
- El CTA puede perderse en mobile; el texto del boton debe ser autoexplicativo

---

## VARIANTES ADICIONALES (OPCIONALES)

### Banner Empresa — Version Campana
Para usar durante el periodo activo de la campana "Pioneros IA" (Abril-Junio 2026):

- Misma estructura que Banner 1
- Agregar badge en esquina superior derecha: "Webinar Gratuito — 14 de Mayo" — JetBrains Mono 12px, Cyber Lime, fondo Cyber Lime 12%, border-radius 4px
- Subheadline cambia a: "Descubre como la IA transforma tu marketing. Webinar gratuito el 14 de mayo."

### Banner Fundador — Version Evento
Para usar durante semanas previas al webinar:

- Misma estructura que Banner 2
- CTA cambia a: "Webinar Gratis — 14 May" con fondo Cyber Lime, texto Midnight Black
- Agregar icono Lucide "video" 16px junto al texto del CTA

---

## NOTAS TECNICAS

1. **Actualizacion de banners**: Los banners deben actualizarse cada vez que haya un cambio de campana o evento relevante
2. **Coherencia**: Ambos banners deben verse como parte de la misma familia visual, pero con suficiente diferenciacion para que el personal y el corporativo no sean identicos
3. **Exportacion**: PNG, sRGB, 72dpi. Tamano maximo: 8MB (LinkedIn acepta hasta 8MB para banners)
4. **Nombrado**: `PROCORP-banner-empresa-v1.png`, `PROCORP-banner-fundador-v1.png`

---

*Referencia visual: PROCORP-2026-001-T4-identidad-visual.md*
*Deadline: 14 de Abril 2026*
