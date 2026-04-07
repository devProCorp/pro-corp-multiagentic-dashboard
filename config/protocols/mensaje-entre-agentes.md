# Protocolo de Mensaje entre Agentes

## Estructura Obligatoria

```json
{
  "from": "agente_origen",
  "to": "agente_destino",
  "task_id": "CLIENTE-ANO-NUM-TNUM",
  "priority": "HIGH | MEDIUM | LOW",
  "context": "Resumen del proyecto",
  "request": "Tarea especifica solicitada",
  "inputs": ["archivo1.md", "datos.json"],
  "deadline": "2026-04-15 18:00",
  "output_format": "Formato esperado del entregable"
}
```

## Estados de Tarea

| Estado | Significado | Accion Siguiente |
|--------|-------------|------------------|
| PENDING | Asignada, no iniciada | Agente inicia cuando tenga capacidad |
| IN_PROGRESS | Trabajando activamente | Orquestador monitorea avance |
| BLOCKED | Necesita input externo | Orquestador desbloquea o escala |
| REVIEW | Listo para revision | Orquestador o cliente revisa |
| APPROVED | Aprobado | Orquestador integra al proyecto |
| REJECTED | Necesita cambios | Agente recibe feedback y reelabora |
| DONE | Completada e integrada | Orquestador marca como cerrada |

## Reglas
1. Todo mensaje debe incluir todos los campos obligatorios
2. El TASK_ID sigue el formato: `{CLIENTE}-{ANO}-{NUM}-T{TAREA}`
3. Las prioridades HIGH requieren respuesta en menos de 24h
4. Los agentes deben confirmar recepcion del mensaje
5. Los cambios de estado deben notificarse al orquestador
