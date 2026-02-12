import vine from '@vinejs/vine'

export const saveGameStateValidator = vine.compile(
  vine.object({
    gold: vine.number().min(0),
    gems: vine.number().min(0),
    xp: vine.number().min(0),
    level: vine.number().min(1),
    currentGeneration: vine.number().min(1),
    currentZone: vine.number().min(1),
    currentStage: vine.number().min(1).max(10),
    clickDamage: vine.number().min(1),
    badges: vine.number().min(0),
  })
)
