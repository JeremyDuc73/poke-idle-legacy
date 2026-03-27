import vine from '@vinejs/vine'

export const saveGameStateValidator = vine.compile(
  vine.object({
    gold: vine.number().min(0).max(999_999_999),
    gems: vine.number().min(0).max(999_999),
    xp: vine.number().min(0).max(999_999_999),
    level: vine.number().min(1).max(500),
    currentGeneration: vine.number().min(1).max(9),
    currentZone: vine.number().min(1).max(20),
    currentStage: vine.number().min(1).max(10),
    clickDamage: vine.number().min(1).max(999_999),
    badges: vine.number().min(0).max(100),
  })
)
