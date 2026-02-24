import { Exercise, type Locale } from '@/types';

export const exercises: Exercise[] = [
  {
    "id": "bench-press",
    "name": {
      "en": "Bench Press",
      "es": "Press de banca"
    },
    "category": "chest",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ],
    "equipment": "barbell",
    "description": {
      "en": "Classic compound chest exercise performed on a flat bench.",
      "es": "Ejercicio compuesto clásico de pecho realizado en banca plana."
    },
    "instructions": {
      "en": [
        "Lie flat on a bench with feet on the floor",
        "Grip the bar slightly wider than shoulder-width",
        "Unrack and lower the bar to mid-chest",
        "Press the bar back up to lockout"
      ],
      "es": [
        "Tumbado en banca con los pies en el suelo",
        "Agarra la barra algo más ancho que los hombros",
        "Desengancha y baja la barra al centro del pecho",
        "Empuja la barra hacia arriba hasta extender los brazos"
      ]
    },
    "tags": [
      "push",
      "compound",
      "chest"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/PectoralSternal/BBBenchPress"
  },
  {
    "id": "incline-dumbbell-press",
    "name": {
      "en": "Incline Dumbbell Press",
      "es": "Press con mancuernas en inclinado"
    },
    "category": "chest",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Upper chest focused pressing movement on an inclined bench.",
      "es": "Press en banca inclinada centrado en la parte superior del pecho."
    },
    "instructions": {
      "en": [
        "Set bench to 30-45 degree incline",
        "Press dumbbells up from shoulder level",
        "Lower with control to chest level",
        "Keep feet flat on the floor"
      ],
      "es": [
        "Coloca la banca a 30-45 grados de inclinación",
        "Empuja las mancuernas desde la altura de los hombros",
        "Baja con control hasta la altura del pecho",
        "Mantén los pies apoyados en el suelo"
      ]
    },
    "tags": [
      "push",
      "compound",
      "upper-chest"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/PectoralClavicular/DBInclineBenchPress"
  },
  {
    "id": "cable-flyes",
    "name": {
      "en": "Cable Flyes",
      "es": "Aperturas en polea"
    },
    "category": "chest",
    "secondaryMuscles": [
      "shoulders"
    ],
    "equipment": "cable",
    "description": {
      "en": "Isolation chest exercise using cable machine for constant tension.",
      "es": "Ejercicio de aislamiento de pecho con polea para tensión constante."
    },
    "instructions": {
      "en": [
        "Set cables at shoulder height",
        "Step forward with slight lean",
        "Bring hands together in hugging motion",
        "Squeeze chest at the peak, return slowly"
      ],
      "es": [
        "Coloca las poleas a la altura de los hombros",
        "Da un paso al frente con ligera inclinación",
        "Junta las manos en movimiento de abrazo",
        "Contrae el pecho en el punto máximo y vuelve despacio"
      ]
    },
    "tags": [
      "push",
      "isolation",
      "chest"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/PectoralSternal/CBStandingFly"
  },
  {
    "id": "dumbbell-chest-press",
    "name": {
      "en": "Dumbbell Chest Press",
      "es": "Press de pecho con mancuernas"
    },
    "category": "chest",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Flat bench press using dumbbells for greater range of motion.",
      "es": "Press en banca plana con mancuernas para mayor recorrido."
    },
    "instructions": {
      "en": [
        "Lie flat on bench with dumbbells at chest level",
        "Press dumbbells up until arms are extended",
        "Lower slowly to starting position",
        "Keep core engaged throughout"
      ],
      "es": [
        "Tumbado en banca con mancuernas a la altura del pecho",
        "Empuja las mancuernas hasta extender los brazos",
        "Baja despacio a la posición inicial",
        "Mantén el core activo durante todo el movimiento"
      ]
    },
    "tags": [
      "push",
      "compound",
      "chest"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/PectoralSternal/DBBenchPress"
  },
  {
    "id": "dumbbell-flyes",
    "name": {
      "en": "Dumbbell Flyes",
      "es": "Aperturas con mancuernas"
    },
    "category": "chest",
    "secondaryMuscles": [
      "shoulders"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Isolation movement for chest stretch and contraction.",
      "es": "Movimiento de aislamiento para estiramiento y contracción del pecho."
    },
    "instructions": {
      "en": [
        "Lie flat on bench with dumbbells above chest",
        "Lower arms out to the sides in a wide arc",
        "Keep slight bend in elbows throughout",
        "Squeeze chest to bring dumbbells back together"
      ],
      "es": [
        "Tumbado en banca con mancuernas sobre el pecho",
        "Baja los brazos hacia los lados en un arco amplio",
        "Mantén una ligera flexión de codos durante todo el movimiento",
        "Contrae el pecho para juntar de nuevo las mancuernas"
      ]
    },
    "tags": [
      "push",
      "isolation",
      "chest"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/PectoralSternal/DBFly"
  },
  {
    "id": "push-ups",
    "name": {
      "en": "Push-Ups",
      "es": "Flexiones"
    },
    "category": "chest",
    "secondaryMuscles": [
      "triceps",
      "shoulders",
      "core"
    ],
    "equipment": "bodyweight",
    "description": {
      "en": "Fundamental bodyweight exercise for chest and pushing strength.",
      "es": "Ejercicio básico con peso corporal para pecho y fuerza de empuje."
    },
    "instructions": {
      "en": [
        "Start in plank position with hands shoulder-width apart",
        "Lower body until chest nearly touches the floor",
        "Push back up to full arm extension",
        "Keep core tight and body in a straight line"
      ],
      "es": [
        "Empieza en posición de plancha con las manos a la anchura de los hombros",
        "Baja el cuerpo hasta que el pecho casi toque el suelo",
        "Empuja hacia arriba hasta extender completamente los brazos",
        "Mantén el core tenso y el cuerpo en línea recta"
      ]
    },
    "tags": [
      "push",
      "compound",
      "chest",
      "bodyweight"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/PectoralSternal/BWPushup"
  },
  {
    "id": "machine-chest-press",
    "name": {
      "en": "Machine Chest Press",
      "es": "Press de pecho en máquina"
    },
    "category": "chest",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ],
    "equipment": "machine",
    "description": {
      "en": "Machine-guided pressing for controlled chest work.",
      "es": "Press guiado en máquina para trabajo controlado de pecho."
    },
    "instructions": {
      "en": [
        "Adjust seat so handles are at chest level",
        "Grip handles and press forward",
        "Extend arms without locking elbows",
        "Return slowly to starting position"
      ],
      "es": [
        "Ajusta el asiento para que los agarres queden a la altura del pecho",
        "Agarra los mangos y empuja hacia delante",
        "Extiende los brazos sin bloquear los codos",
        "Vuelve despacio a la posición inicial"
      ]
    },
    "tags": [
      "push",
      "compound",
      "chest"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/PectoralSternal/LVChestPress"
  },
  {
    "id": "decline-bench-press",
    "name": {
      "en": "Decline Bench Press",
      "es": "Press de banca en declive"
    },
    "category": "chest",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ],
    "equipment": "barbell",
    "description": {
      "en": "Bench press on decline targeting lower chest fibers.",
      "es": "Press en banca declinada para las fibras inferiores del pecho."
    },
    "instructions": {
      "en": [
        "Lie on decline bench and hook feet under pads",
        "Grip the bar slightly wider than shoulder-width",
        "Lower bar to lower chest",
        "Press back up to lockout"
      ],
      "es": [
        "Tumbado en banca declinada con los pies bajo las almohadillas",
        "Agarra la barra algo más ancho que los hombros",
        "Baja la barra hacia la parte inferior del pecho",
        "Empuja hacia arriba hasta extender los brazos"
      ]
    },
    "tags": [
      "push",
      "compound",
      "chest"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/PectoralSternal/BBDeclineBenchPress"
  },
  {
    "id": "overhead-press",
    "name": {
      "en": "Overhead Press",
      "es": "Press militar"
    },
    "category": "shoulders",
    "secondaryMuscles": [
      "triceps",
      "core"
    ],
    "equipment": "barbell",
    "description": {
      "en": "Standing barbell press overhead for shoulder development.",
      "es": "Press con barra de pie para desarrollo de hombros."
    },
    "instructions": {
      "en": [
        "Stand with feet shoulder-width apart",
        "Hold bar at shoulder level with overhand grip",
        "Press bar overhead to full lockout",
        "Lower bar back to shoulders with control"
      ],
      "es": [
        "De pie con los pies a la anchura de los hombros",
        "Sostén la barra a la altura de los hombros con agarre prono",
        "Empuja la barra por encima de la cabeza hasta extender",
        "Baja la barra a los hombros con control"
      ]
    },
    "tags": [
      "push",
      "compound",
      "shoulders"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/DeltoidAnterior/BBMilitaryPress"
  },
  {
    "id": "lateral-raises",
    "name": {
      "en": "Lateral Raises",
      "es": "Elevaciones laterales"
    },
    "category": "shoulders",
    "secondaryMuscles": [
      "traps"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Isolation exercise targeting the lateral deltoid.",
      "es": "Ejercicio de aislamiento para el deltoides lateral."
    },
    "instructions": {
      "en": [
        "Stand with dumbbells at your sides",
        "Raise arms out to the sides until parallel",
        "Keep slight bend in elbows",
        "Lower slowly with control"
      ],
      "es": [
        "De pie con mancuernas a los lados",
        "Eleva los brazos hacia los lados hasta quedar paralelos al suelo",
        "Mantén una ligera flexión de codos",
        "Baja despacio y con control"
      ]
    },
    "tags": [
      "push",
      "isolation",
      "shoulders"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/DeltoidLateral/DBLateralRaise"
  },
  {
    "id": "front-raises",
    "name": {
      "en": "Front Raises",
      "es": "Elevaciones frontales"
    },
    "category": "shoulders",
    "secondaryMuscles": [
      "chest"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Isolation exercise targeting the anterior deltoid.",
      "es": "Ejercicio de aislamiento para el deltoides anterior."
    },
    "instructions": {
      "en": [
        "Stand with dumbbells in front of thighs",
        "Raise one arm to shoulder height",
        "Lower slowly and alternate arms",
        "Keep core engaged and avoid swinging"
      ],
      "es": [
        "De pie con mancuernas delante de los muslos",
        "Eleva un brazo hasta la altura del hombro",
        "Baja despacio y alterna los brazos",
        "Mantén el core activo y evita balancearte"
      ]
    },
    "tags": [
      "push",
      "isolation",
      "shoulders"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/DeltoidAnterior/DBAlternatingFrontRaise"
  },
  {
    "id": "arnold-press",
    "name": {
      "en": "Arnold Press",
      "es": "Press Arnold"
    },
    "category": "shoulders",
    "secondaryMuscles": [
      "triceps"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Rotating shoulder press hitting all three deltoid heads.",
      "es": "Press de hombros con rotación que trabaja las tres porciones del deltoides."
    },
    "instructions": {
      "en": [
        "Start with dumbbells at chest level, palms facing you",
        "Rotate palms outward as you press overhead",
        "Reverse the motion on the way down",
        "Keep movement controlled throughout"
      ],
      "es": [
        "Empieza con mancuernas a la altura del pecho, palmas hacia ti",
        "Rota las palmas hacia fuera al empujar por encima de la cabeza",
        "Invierte el movimiento al bajar",
        "Mantén el movimiento controlado durante todo el ejercicio"
      ]
    },
    "tags": [
      "push",
      "compound",
      "shoulders"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/DeltoidAnterior/DBArnoldPress"
  },
  {
    "id": "face-pulls",
    "name": {
      "en": "Face Pulls",
      "es": "Face pull"
    },
    "category": "shoulders",
    "secondaryMuscles": [
      "traps",
      "back"
    ],
    "equipment": "cable",
    "description": {
      "en": "Cable exercise targeting rear delts and upper back.",
      "es": "Ejercicio en polea para deltoides posterior y espalda alta."
    },
    "instructions": {
      "en": [
        "Set cable at face height with rope attachment",
        "Pull rope toward face, separating hands",
        "Squeeze rear delts and upper back",
        "Return slowly to starting position"
      ],
      "es": [
        "Coloca la polea a la altura de la cara con cuerda",
        "Tira de la cuerda hacia la cara separando las manos",
        "Contrae deltoides posteriores y espalda alta",
        "Vuelve despacio a la posición inicial"
      ]
    },
    "tags": [
      "pull",
      "isolation",
      "rear-delts",
      "shoulders"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/DeltoidPosterior/CBStandingRearDeltRowRope"
  },
  {
    "id": "dumbbell-shoulder-press",
    "name": {
      "en": "Dumbbell Shoulder Press",
      "es": "Press de hombros con mancuernas"
    },
    "category": "shoulders",
    "secondaryMuscles": [
      "triceps"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Seated or standing shoulder press with dumbbells for balanced development.",
      "es": "Press de hombros sentado o de pie con mancuernas para un desarrollo equilibrado."
    },
    "instructions": {
      "en": [
        "Hold dumbbells at shoulder height, palms forward",
        "Press dumbbells overhead until arms are extended",
        "Lower back to shoulder level with control",
        "Keep core engaged throughout"
      ],
      "es": [
        "Sostén las mancuernas a la altura de los hombros, palmas al frente",
        "Empuja las mancuernas por encima de la cabeza hasta extender los brazos",
        "Baja hasta la altura de los hombros con control",
        "Mantén el core activo durante todo el movimiento"
      ]
    },
    "tags": [
      "push",
      "compound",
      "shoulders"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/DeltoidAnterior/DBShoulderPress"
  },
  {
    "id": "reverse-flyes",
    "name": {
      "en": "Reverse Flyes",
      "es": "Aperturas invertidas"
    },
    "category": "shoulders",
    "secondaryMuscles": [
      "traps",
      "back"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Dumbbell exercise targeting posterior deltoids.",
      "es": "Ejercicio con mancuernas para deltoides posteriores."
    },
    "instructions": {
      "en": [
        "Bend forward at the hips with slight knee bend",
        "Hold dumbbells below chest with palms facing each other",
        "Raise arms out to the sides squeezing rear delts",
        "Lower with control to starting position"
      ],
      "es": [
        "Inclínate hacia delante desde la cadera con ligera flexión de rodillas",
        "Sostén las mancuernas por debajo del pecho con palmas enfrentadas",
        "Eleva los brazos hacia los lados contrayendo los deltoides posteriores",
        "Baja con control a la posición inicial"
      ]
    },
    "tags": [
      "pull",
      "isolation",
      "rear-delts",
      "shoulders"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/DeltoidPosterior/DBSeatedRearLateralRaise"
  },
  {
    "id": "tricep-pushdowns",
    "name": {
      "en": "Tricep Pushdowns",
      "es": "Extensiones de tríceps en polea"
    },
    "category": "triceps",
    "secondaryMuscles": [],
    "equipment": "cable",
    "description": {
      "en": "Cable exercise isolating the triceps.",
      "es": "Ejercicio en polea que aísla el tríceps."
    },
    "instructions": {
      "en": [
        "Stand facing cable machine with rope or bar attachment",
        "Keep elbows pinned to your sides",
        "Push the weight down until arms are fully extended",
        "Return slowly to starting position"
      ],
      "es": [
        "De pie frente a la polea con cuerda o barra",
        "Mantén los codos pegados al cuerpo",
        "Empuja el peso hacia abajo hasta extender completamente los brazos",
        "Vuelve despacio a la posición inicial"
      ]
    },
    "tags": [
      "push",
      "isolation",
      "triceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Triceps/CBPushdown"
  },
  {
    "id": "tricep-dips",
    "name": {
      "en": "Tricep Dips",
      "es": "Fondos en paralelas"
    },
    "category": "triceps",
    "secondaryMuscles": [
      "chest",
      "shoulders"
    ],
    "equipment": "bodyweight",
    "description": {
      "en": "Compound bodyweight exercise for triceps.",
      "es": "Ejercicio compuesto con peso corporal para tríceps."
    },
    "instructions": {
      "en": [
        "Grip parallel bars and support your weight",
        "Lower body by bending elbows to 90 degrees",
        "Keep body upright to target triceps",
        "Press back up to starting position"
      ],
      "es": [
        "Agarra las barras paralelas y soporta tu peso",
        "Baja el cuerpo flexionando los codos hasta 90 grados",
        "Mantén el cuerpo erguido para enfocar en tríceps",
        "Empuja hacia arriba hasta la posición inicial"
      ]
    },
    "tags": [
      "push",
      "compound",
      "triceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Triceps/BWBenchDip"
  },
  {
    "id": "overhead-tricep-extension",
    "name": {
      "en": "Overhead Tricep Extension",
      "es": "Extensión de tríceps por encima de la cabeza"
    },
    "category": "triceps",
    "secondaryMuscles": [],
    "equipment": "dumbbell",
    "description": {
      "en": "Overhead extension targeting the long head of the triceps.",
      "es": "Extensión por encima de la cabeza para la porción larga del tríceps."
    },
    "instructions": {
      "en": [
        "Hold dumbbell overhead with both hands",
        "Lower behind head by bending elbows",
        "Extend arms back to starting position",
        "Keep upper arms stationary throughout"
      ],
      "es": [
        "Sostén la mancuerna por encima de la cabeza con ambas manos",
        "Baja detrás de la cabeza flexionando los codos",
        "Extiende los brazos de nuevo a la posición inicial",
        "Mantén los brazos superiores fijos durante todo el movimiento"
      ]
    },
    "tags": [
      "push",
      "isolation",
      "triceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Triceps/DBOneArmTriExtBench"
  },
  {
    "id": "skull-crushers",
    "name": {
      "en": "Skull Crushers",
      "es": "Extensión de tríceps acostado"
    },
    "category": "triceps",
    "secondaryMuscles": [],
    "equipment": "barbell",
    "description": {
      "en": "Lying triceps extension with barbell for heavy tricep loading.",
      "es": "Extensión de tríceps tumbado con barra para carga intensa."
    },
    "instructions": {
      "en": [
        "Lie on flat bench holding barbell with narrow grip",
        "Lower bar toward forehead by bending elbows",
        "Keep upper arms perpendicular to floor",
        "Extend arms back to starting position"
      ],
      "es": [
        "Tumbado en banca con barra en agarre estrecho",
        "Baja la barra hacia la frente flexionando los codos",
        "Mantén los brazos superiores perpendiculares al suelo",
        "Extiende los brazos de nuevo a la posición inicial"
      ]
    },
    "tags": [
      "push",
      "isolation",
      "triceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Triceps/BBLyingTriExt"
  },
  {
    "id": "tricep-kickbacks",
    "name": {
      "en": "Tricep Kickbacks",
      "es": "Patada de tríceps"
    },
    "category": "triceps",
    "secondaryMuscles": [],
    "equipment": "dumbbell",
    "description": {
      "en": "Dumbbell exercise isolating the triceps in a bent-over position.",
      "es": "Ejercicio con mancuerna que aísla el tríceps en posición inclinada."
    },
    "instructions": {
      "en": [
        "Bend over with one hand on bench for support",
        "Hold dumbbell with upper arm parallel to floor",
        "Extend forearm back until arm is straight",
        "Squeeze tricep at top, lower with control"
      ],
      "es": [
        "Inclínate con una mano en el banco como apoyo",
        "Sostén la mancuerna con el brazo superior paralelo al suelo",
        "Extiende el antebrazo hacia atrás hasta estirar el brazo",
        "Contrae el tríceps arriba y baja con control"
      ]
    },
    "tags": [
      "push",
      "isolation",
      "triceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Triceps/DBKickback"
  },
  {
    "id": "deadlift",
    "name": {
      "en": "Deadlift",
      "es": "Peso muerto"
    },
    "category": "back",
    "secondaryMuscles": [
      "hamstrings",
      "glutes",
      "core",
      "traps"
    ],
    "equipment": "barbell",
    "description": {
      "en": "Full body compound lift focusing on the posterior chain.",
      "es": "Levantamiento compuesto de cuerpo completo centrado en la cadena posterior."
    },
    "instructions": {
      "en": [
        "Stand with feet hip-width, bar over mid-foot",
        "Hinge at hips and grip bar outside knees",
        "Drive through feet, extending hips and knees",
        "Stand tall at top, then lower with control"
      ],
      "es": [
        "De pie con pies a la anchura de caderas, barra sobre el mediopie",
        "Bisagra de cadera y agarra la barra por fuera de las rodillas",
        "Empuja con los pies extendiendo caderas y rodillas",
        "Quédate erguido arriba y luego baja con control"
      ]
    },
    "tags": [
      "pull",
      "compound",
      "back"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/ErectorSpinae/BBDeadlift"
  },
  {
    "id": "pull-ups",
    "name": {
      "en": "Pull-Ups",
      "es": "Dominadas"
    },
    "category": "back",
    "secondaryMuscles": [
      "biceps",
      "forearms"
    ],
    "equipment": "bodyweight",
    "description": {
      "en": "Classic bodyweight exercise for lat and back development.",
      "es": "Ejercicio clásico con peso corporal para dorsales y espalda."
    },
    "instructions": {
      "en": [
        "Hang from bar with overhand grip, slightly wider than shoulders",
        "Pull body up until chin clears the bar",
        "Lower with control to full extension",
        "Avoid swinging or kipping"
      ],
      "es": [
        "Cuelga de la barra con agarre prono, algo más ancho que los hombros",
        "Sube el cuerpo hasta que la barbilla supere la barra",
        "Baja con control hasta la extensión completa",
        "Evita balancearte o impulsarte"
      ]
    },
    "tags": [
      "pull",
      "compound",
      "back"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/LatissimusDorsi/BWPullup"
  },
  {
    "id": "barbell-rows",
    "name": {
      "en": "Barbell Rows",
      "es": "Remo con barra"
    },
    "category": "back",
    "secondaryMuscles": [
      "biceps",
      "forearms",
      "core"
    ],
    "equipment": "barbell",
    "description": {
      "en": "Bent-over row for overall back thickness.",
      "es": "Remo inclinado para grosor general de espalda."
    },
    "instructions": {
      "en": [
        "Hinge forward at hips with slight knee bend",
        "Pull bar to lower chest/upper abdomen",
        "Squeeze shoulder blades together at top",
        "Lower with control, maintaining back position"
      ],
      "es": [
        "Inclínate desde la cadera con ligera flexión de rodillas",
        "Tira de la barra hacia el pecho bajo / abdomen alto",
        "Junta las escápulas en la parte alta",
        "Baja con control manteniendo la posición de la espalda"
      ]
    },
    "tags": [
      "pull",
      "compound",
      "back"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/BackGeneral/BBBentOverRow"
  },
  {
    "id": "lat-pulldowns",
    "name": {
      "en": "Lat Pulldowns",
      "es": "Jalón al pecho"
    },
    "category": "back",
    "secondaryMuscles": [
      "biceps",
      "forearms"
    ],
    "equipment": "cable",
    "description": {
      "en": "Cable exercise targeting the latissimus dorsi.",
      "es": "Ejercicio en polea para el dorsal ancho."
    },
    "instructions": {
      "en": [
        "Sit at lat pulldown machine with thighs secured",
        "Grip bar wider than shoulder-width",
        "Pull bar to upper chest, squeezing lats",
        "Return to full extension with control"
      ],
      "es": [
        "Siéntate en la máquina de jalón con muslos sujetos",
        "Agarra la barra más ancho que los hombros",
        "Tira de la barra hacia el pecho alto contrayendo dorsales",
        "Vuelve a la extensión completa con control"
      ]
    },
    "tags": [
      "pull",
      "compound",
      "back"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/LatissimusDorsi/CBFrontPulldown"
  },
  {
    "id": "seated-cable-rows",
    "name": {
      "en": "Seated Cable Rows",
      "es": "Remo sentado en polea"
    },
    "category": "back",
    "secondaryMuscles": [
      "biceps",
      "forearms"
    ],
    "equipment": "cable",
    "description": {
      "en": "Seated rowing movement for mid-back development.",
      "es": "Remo sentado para desarrollo de espalda media."
    },
    "instructions": {
      "en": [
        "Sit with feet on platform, knees slightly bent",
        "Pull handle to lower chest",
        "Squeeze shoulder blades together",
        "Return with control, allowing stretch"
      ],
      "es": [
        "Siéntate con los pies en la plataforma, rodillas ligeramente flexionadas",
        "Tira del mango hacia el pecho bajo",
        "Junta las escápulas",
        "Vuelve con control permitiendo el estiramiento"
      ]
    },
    "tags": [
      "pull",
      "compound",
      "back"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/BackGeneral/CBSeatedRow"
  },
  {
    "id": "dumbbell-rows",
    "name": {
      "en": "Dumbbell Rows",
      "es": "Remo con mancuerna"
    },
    "category": "back",
    "secondaryMuscles": [
      "biceps",
      "forearms"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "One-arm row for unilateral back development.",
      "es": "Remo a un brazo para desarrollo unilateral de espalda."
    },
    "instructions": {
      "en": [
        "Place one hand and knee on bench for support",
        "Hold dumbbell with free hand, arm extended",
        "Pull dumbbell to hip, squeezing shoulder blade",
        "Lower with control to full extension"
      ],
      "es": [
        "Apoya una mano y una rodilla en el banco",
        "Sostén la mancuerna con el brazo libre extendido",
        "Tira de la mancuerna hacia la cadera contrayendo la escápula",
        "Baja con control hasta la extensión completa"
      ]
    },
    "tags": [
      "pull",
      "compound",
      "back"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/BackGeneral/DBBentOverRow"
  },
  {
    "id": "chin-ups",
    "name": {
      "en": "Chin-Ups",
      "es": "Dominadas supinas"
    },
    "category": "back",
    "secondaryMuscles": [
      "biceps",
      "forearms"
    ],
    "equipment": "bodyweight",
    "description": {
      "en": "Underhand grip pull-up emphasizing biceps and lower lats.",
      "es": "Dominada con agarre supino que enfatiza bíceps y dorsales bajos."
    },
    "instructions": {
      "en": [
        "Hang from bar with underhand (supinated) grip",
        "Pull body up until chin clears the bar",
        "Focus on squeezing lats and biceps",
        "Lower with control to full extension"
      ],
      "es": [
        "Cuelga de la barra con agarre supino (palmas hacia ti)",
        "Sube el cuerpo hasta que la barbilla supere la barra",
        "Enfócate en contraer dorsales y bíceps",
        "Baja con control hasta la extensión completa"
      ]
    },
    "tags": [
      "pull",
      "compound",
      "back"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/LatissimusDorsi/BWUnderhandChinup"
  },
  {
    "id": "bicep-curls",
    "name": {
      "en": "Bicep Curls",
      "es": "Curl de bíceps"
    },
    "category": "biceps",
    "secondaryMuscles": [
      "forearms"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Classic isolation exercise for bicep development.",
      "es": "Ejercicio de aislamiento clásico para desarrollo de bíceps."
    },
    "instructions": {
      "en": [
        "Stand with dumbbells at sides, palms forward",
        "Curl weights to shoulder level",
        "Squeeze biceps at the top",
        "Lower slowly to full extension"
      ],
      "es": [
        "De pie con mancuernas a los lados, palmas al frente",
        "Lleva las mancuernas hacia los hombros",
        "Contrae los bíceps en la parte alta",
        "Baja despacio hasta la extensión completa"
      ]
    },
    "tags": [
      "pull",
      "isolation",
      "biceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Biceps/DBCurl"
  },
  {
    "id": "hammer-curls",
    "name": {
      "en": "Hammer Curls",
      "es": "Curl martillo"
    },
    "category": "biceps",
    "secondaryMuscles": [
      "forearms"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Bicep curl variation targeting the brachialis and forearms.",
      "es": "Variación de curl que trabaja braquial y antebrazos."
    },
    "instructions": {
      "en": [
        "Hold dumbbells with neutral grip (palms facing each other)",
        "Curl weights to shoulder level",
        "Keep elbows stationary at sides",
        "Lower with control"
      ],
      "es": [
        "Sostén las mancuernas con agarre neutro (palmas enfrentadas)",
        "Lleva las mancuernas hacia la altura de los hombros",
        "Mantén los codos fijos a los lados",
        "Baja con control"
      ]
    },
    "tags": [
      "pull",
      "isolation",
      "biceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Brachioradialis/DBHammerCurl"
  },
  {
    "id": "barbell-curls",
    "name": {
      "en": "Barbell Curls",
      "es": "Curl con barra"
    },
    "category": "biceps",
    "secondaryMuscles": [
      "forearms"
    ],
    "equipment": "barbell",
    "description": {
      "en": "Heavy compound curl using barbell for maximum bicep loading.",
      "es": "Curl pesado con barra para máxima carga de bíceps."
    },
    "instructions": {
      "en": [
        "Stand with barbell, underhand grip at shoulder width",
        "Curl bar to shoulder height",
        "Keep upper arms stationary",
        "Lower with control to full extension"
      ],
      "es": [
        "De pie con la barra, agarre supino a la anchura de hombros",
        "Lleva la barra hacia la altura de los hombros",
        "Mantén los brazos superiores fijos",
        "Baja con control hasta la extensión completa"
      ]
    },
    "tags": [
      "pull",
      "isolation",
      "biceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Biceps/BBCurl"
  },
  {
    "id": "incline-dumbbell-curls",
    "name": {
      "en": "Incline Dumbbell Curls",
      "es": "Curl con mancuernas en inclinado"
    },
    "category": "biceps",
    "secondaryMuscles": [
      "forearms"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Curl on incline bench for greater bicep stretch under load.",
      "es": "Curl en banca inclinada para mayor estiramiento del bíceps bajo carga."
    },
    "instructions": {
      "en": [
        "Sit on incline bench set to 45 degrees",
        "Let arms hang straight down with dumbbells",
        "Curl weights up while keeping upper arms stationary",
        "Lower slowly to full stretch"
      ],
      "es": [
        "Siéntate en banca inclinada a 45 grados",
        "Deja los brazos colgando con las mancuernas",
        "Sube las mancuernas manteniendo los brazos superiores fijos",
        "Baja despacio hasta el estiramiento completo"
      ]
    },
    "tags": [
      "pull",
      "isolation",
      "biceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Biceps/DBInclineCurl"
  },
  {
    "id": "cable-curls",
    "name": {
      "en": "Cable Curls",
      "es": "Curl en polea"
    },
    "category": "biceps",
    "secondaryMuscles": [
      "forearms"
    ],
    "equipment": "cable",
    "description": {
      "en": "Cable curl providing constant tension throughout the range of motion.",
      "es": "Curl en polea con tensión constante en todo el recorrido."
    },
    "instructions": {
      "en": [
        "Stand facing cable machine with bar attachment at low position",
        "Grip bar with underhand grip at shoulder width",
        "Curl bar up toward shoulders",
        "Lower with control, maintaining tension"
      ],
      "es": [
        "De pie frente a la polea con barra en posición baja",
        "Agarra la barra con agarre supino a la anchura de hombros",
        "Lleva la barra hacia los hombros",
        "Baja con control manteniendo la tensión"
      ]
    },
    "tags": [
      "pull",
      "isolation",
      "biceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Biceps/CBCurl"
  },
  {
    "id": "concentration-curls",
    "name": {
      "en": "Concentration Curls",
      "es": "Curl concentrado"
    },
    "category": "biceps",
    "secondaryMuscles": [],
    "equipment": "dumbbell",
    "description": {
      "en": "Seated single-arm curl for peak bicep contraction.",
      "es": "Curl a un brazo sentado para máxima contracción del bíceps."
    },
    "instructions": {
      "en": [
        "Sit on bench with legs apart",
        "Rest elbow against inner thigh",
        "Curl dumbbell up squeezing bicep at top",
        "Lower slowly with full control"
      ],
      "es": [
        "Siéntate en el banco con las piernas separadas",
        "Apoya el codo en la parte interna del muslo",
        "Sube la mancuerna contrayendo el bíceps en la parte alta",
        "Baja despacio con control total"
      ]
    },
    "tags": [
      "pull",
      "isolation",
      "biceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Brachialis/DBConcentrationCurl"
  },
  {
    "id": "squats",
    "name": {
      "en": "Squats",
      "es": "Sentadillas"
    },
    "category": "quadriceps",
    "secondaryMuscles": [
      "glutes",
      "hamstrings",
      "core"
    ],
    "equipment": "barbell",
    "description": {
      "en": "The king of leg exercises for overall lower body development.",
      "es": "El rey de los ejercicios de pierna para el desarrollo del tren inferior."
    },
    "instructions": {
      "en": [
        "Position bar on upper back, feet shoulder-width",
        "Break at hips and knees simultaneously",
        "Descend until thighs are parallel or below",
        "Drive through feet to stand back up"
      ],
      "es": [
        "Coloca la barra en la parte alta de la espalda, pies a la anchura de hombros",
        "Flexiona cadera y rodillas a la vez",
        "Baja hasta que los muslos estén paralelos o por debajo",
        "Empuja con los pies para volver a estar de pie"
      ]
    },
    "tags": [
      "legs",
      "compound",
      "quadriceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Quadriceps/BBSquat"
  },
  {
    "id": "leg-press",
    "name": {
      "en": "Leg Press",
      "es": "Prensa de piernas"
    },
    "category": "quadriceps",
    "secondaryMuscles": [
      "glutes",
      "hamstrings"
    ],
    "equipment": "machine",
    "description": {
      "en": "Machine exercise for heavy quadricep loading.",
      "es": "Ejercicio en máquina para carga pesada de cuádriceps."
    },
    "instructions": {
      "en": [
        "Sit in leg press machine with back flat against pad",
        "Place feet shoulder-width on platform",
        "Lower platform by bending knees to 90 degrees",
        "Press back up without locking knees"
      ],
      "es": [
        "Siéntate en la prensa con la espalda apoyada en el respaldo",
        "Coloca los pies a la anchura de hombros en la plataforma",
        "Baja la plataforma flexionando rodillas a 90 grados",
        "Empuja hacia arriba sin bloquear las rodillas"
      ]
    },
    "tags": [
      "legs",
      "compound",
      "quadriceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Quadriceps/SL45LegPress"
  },
  {
    "id": "bulgarian-split-squats",
    "name": {
      "en": "Bulgarian Split Squats",
      "es": "Sentadilla búlgara"
    },
    "category": "quadriceps",
    "secondaryMuscles": [
      "glutes",
      "hamstrings"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Single-leg squat variation for balanced leg development.",
      "es": "Variación de sentadilla a una pierna para desarrollo equilibrado."
    },
    "instructions": {
      "en": [
        "Place rear foot on bench behind you",
        "Hold dumbbells at sides",
        "Lower until front thigh is parallel to floor",
        "Drive through front heel to stand"
      ],
      "es": [
        "Coloca el pie trasero en un banco detrás de ti",
        "Sostén las mancuernas a los lados",
        "Baja hasta que el muslo delantero quede paralelo al suelo",
        "Empuja con el talón delantero para levantarte"
      ]
    },
    "tags": [
      "legs",
      "compound",
      "quadriceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Quadriceps/BBSingleLegSplitSquat"
  },
  {
    "id": "leg-extensions",
    "name": {
      "en": "Leg Extensions",
      "es": "Extensiones de cuádriceps"
    },
    "category": "quadriceps",
    "secondaryMuscles": [],
    "equipment": "machine",
    "description": {
      "en": "Machine isolation exercise for quadricep definition.",
      "es": "Ejercicio de aislamiento en máquina para definición de cuádriceps."
    },
    "instructions": {
      "en": [
        "Sit in machine with back against pad",
        "Hook ankles under roller pad",
        "Extend legs until straight",
        "Lower with control, avoid letting weight stack slam"
      ],
      "es": [
        "Siéntate en la máquina con la espalda contra el respaldo",
        "Engancha los tobillos bajo la almohadilla",
        "Extiende las piernas hasta enderezarlas",
        "Baja con control sin dejar caer el peso"
      ]
    },
    "tags": [
      "legs",
      "isolation",
      "quadriceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Quadriceps/LVLegExtension"
  },
  {
    "id": "front-squats",
    "name": {
      "en": "Front Squats",
      "es": "Sentadilla frontal"
    },
    "category": "quadriceps",
    "secondaryMuscles": [
      "glutes",
      "core"
    ],
    "equipment": "barbell",
    "description": {
      "en": "Front-loaded squat emphasizing quads and upright torso.",
      "es": "Sentadilla con carga frontal que enfatiza cuádriceps y torso erguido."
    },
    "instructions": {
      "en": [
        "Rest barbell across front deltoids with crossed arms or clean grip",
        "Keep elbows high and chest up throughout",
        "Squat down until thighs are parallel or below",
        "Drive through feet to stand, maintaining upright torso"
      ],
      "es": [
        "Apoya la barra sobre los deltoides anteriores con brazos cruzados o agarre de clean",
        "Mantén los codos altos y el pecho arriba durante todo el movimiento",
        "Baja hasta que los muslos estén paralelos o por debajo",
        "Empuja con los pies para levantarte manteniendo el torso erguido"
      ]
    },
    "tags": [
      "legs",
      "compound",
      "quadriceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Quadriceps/BBFrontSquat"
  },
  {
    "id": "lunges",
    "name": {
      "en": "Lunges",
      "es": "Zancadas"
    },
    "category": "quadriceps",
    "secondaryMuscles": [
      "glutes",
      "hamstrings"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Walking or stationary lunge for unilateral leg strength.",
      "es": "Zancada caminando o estática para fuerza unilateral de piernas."
    },
    "instructions": {
      "en": [
        "Hold dumbbells at sides, stand tall",
        "Step forward into a lunge position",
        "Lower back knee toward floor",
        "Push through front foot to return or step forward"
      ],
      "es": [
        "Sostén las mancuernas a los lados, de pie erguido",
        "Da un paso al frente en posición de zancada",
        "Baja la rodilla trasera hacia el suelo",
        "Empuja con el pie delantero para volver o dar el siguiente paso"
      ]
    },
    "tags": [
      "legs",
      "compound",
      "quadriceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Quadriceps/DBLunge"
  },
  {
    "id": "hack-squats",
    "name": {
      "en": "Hack Squats",
      "es": "Sentadilla hack"
    },
    "category": "quadriceps",
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": "machine",
    "description": {
      "en": "Machine squat variation for focused quad development.",
      "es": "Variación de sentadilla en máquina para desarrollo de cuádriceps."
    },
    "instructions": {
      "en": [
        "Position shoulders under pads, feet shoulder-width on platform",
        "Release safety handles",
        "Lower by bending knees to 90 degrees",
        "Press back up through feet"
      ],
      "es": [
        "Coloca los hombros bajo las almohadillas, pies a la anchura de hombros en la plataforma",
        "Suelta los seguros",
        "Baja flexionando las rodillas a 90 grados",
        "Empuja hacia arriba con los pies"
      ]
    },
    "tags": [
      "legs",
      "compound",
      "quadriceps"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Quadriceps/SLHackSquat"
  },
  {
    "id": "romanian-deadlift",
    "name": {
      "en": "Romanian Deadlift",
      "es": "Peso muerto rumano"
    },
    "category": "hamstrings",
    "secondaryMuscles": [
      "glutes",
      "back"
    ],
    "equipment": "barbell",
    "description": {
      "en": "Hip hinge movement focusing on hamstring stretch and load.",
      "es": "Movimiento de bisagra de cadera centrado en estiramiento y carga de isquiotibiales."
    },
    "instructions": {
      "en": [
        "Hold barbell with overhand grip at hip level",
        "Hinge at hips, pushing them backward",
        "Lower bar along legs until hamstring stretch is felt",
        "Drive hips forward to return to standing"
      ],
      "es": [
        "Sostén la barra con agarre prono a la altura de la cadera",
        "Bisagra de cadera llevándola hacia atrás",
        "Baja la barra por las piernas hasta notar el estiramiento de isquiotibiales",
        "Empuja la cadera hacia delante para volver a estar de pie"
      ]
    },
    "tags": [
      "legs",
      "compound",
      "hamstrings"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/OlympicLifts/RomanianDeadlift"
  },
  {
    "id": "leg-curls",
    "name": {
      "en": "Leg Curls",
      "es": "Curl de piernas"
    },
    "category": "hamstrings",
    "secondaryMuscles": [
      "calves"
    ],
    "equipment": "machine",
    "description": {
      "en": "Machine isolation exercise for hamstring development.",
      "es": "Ejercicio de aislamiento en máquina para isquiotibiales."
    },
    "instructions": {
      "en": [
        "Lie face down on leg curl machine",
        "Hook heels under roller pad",
        "Curl weight by bending knees",
        "Lower with control to starting position"
      ],
      "es": [
        "Tumbado boca abajo en la máquina de curl",
        "Engancha los talones bajo la almohadilla",
        "Flexiona las rodillas para subir el peso",
        "Baja con control a la posición inicial"
      ]
    },
    "tags": [
      "legs",
      "isolation",
      "hamstrings"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Hamstrings/LVLyingLegCurl"
  },
  {
    "id": "seated-leg-curls",
    "name": {
      "en": "Seated Leg Curls",
      "es": "Curl de piernas sentado"
    },
    "category": "hamstrings",
    "secondaryMuscles": [],
    "equipment": "machine",
    "description": {
      "en": "Seated machine curl for hamstring isolation.",
      "es": "Curl en máquina sentado para aislamiento de isquiotibiales."
    },
    "instructions": {
      "en": [
        "Sit in machine with back against pad",
        "Position pad above heels, legs extended",
        "Curl legs down by bending knees",
        "Return slowly to starting position"
      ],
      "es": [
        "Siéntate en la máquina con la espalda contra el respaldo",
        "Coloca la almohadilla por encima de los talones, piernas extendidas",
        "Flexiona las piernas bajando al doblar las rodillas",
        "Vuelve despacio a la posición inicial"
      ]
    },
    "tags": [
      "legs",
      "isolation",
      "hamstrings"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Hamstrings/LVSeatedLegCurl"
  },
  {
    "id": "dumbbell-romanian-deadlift",
    "name": {
      "en": "Dumbbell Romanian Deadlift",
      "es": "Peso muerto rumano con mancuernas"
    },
    "category": "hamstrings",
    "secondaryMuscles": [
      "glutes",
      "back"
    ],
    "equipment": "dumbbell",
    "description": {
      "en": "Dumbbell variation of the RDL for hamstring and glute work.",
      "es": "Variación con mancuernas del RDL para isquiotibiales y glúteos."
    },
    "instructions": {
      "en": [
        "Hold dumbbells at thighs with neutral grip",
        "Hinge at hips pushing them backward",
        "Lower dumbbells along legs keeping back flat",
        "Drive hips forward to return to standing"
      ],
      "es": [
        "Sostén las mancuernas en los muslos con agarre neutro",
        "Bisagra de cadera llevándola hacia atrás",
        "Baja las mancuernas por las piernas manteniendo la espalda recta",
        "Empuja la cadera hacia delante para volver a estar de pie"
      ]
    },
    "tags": [
      "legs",
      "compound",
      "hamstrings"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Hamstrings/DBStrBackStrLegDeadlift"
  },
  {
    "id": "calf-raises",
    "name": {
      "en": "Calf Raises",
      "es": "Elevación de gemelos"
    },
    "category": "calves",
    "secondaryMuscles": [],
    "equipment": "machine",
    "description": {
      "en": "Standing calf raise for calf muscle development.",
      "es": "Elevación de talones de pie para desarrollo de gemelos."
    },
    "instructions": {
      "en": [
        "Stand on calf raise machine with balls of feet on platform",
        "Lower heels below platform for full stretch",
        "Rise up on toes as high as possible",
        "Squeeze at top, lower with control"
      ],
      "es": [
        "Colócate en la máquina de gemelos con la punta de los pies en la plataforma",
        "Baja los talones por debajo de la plataforma para estirar bien",
        "Sube sobre las puntas lo más alto posible",
        "Contrae arriba y baja con control"
      ]
    },
    "tags": [
      "legs",
      "isolation",
      "calves"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Gastrocnemius/LVStandingCalfRaise"
  },
  {
    "id": "seated-calf-raises",
    "name": {
      "en": "Seated Calf Raises",
      "es": "Elevación de gemelos sentado"
    },
    "category": "calves",
    "secondaryMuscles": [],
    "equipment": "machine",
    "description": {
      "en": "Seated calf raise targeting the soleus muscle.",
      "es": "Elevación de talones sentado para el sóleo."
    },
    "instructions": {
      "en": [
        "Sit in seated calf raise machine with knees under pad",
        "Place balls of feet on platform edge",
        "Lower heels for full stretch",
        "Push up through toes and squeeze at top"
      ],
      "es": [
        "Siéntate en la máquina de gemelos con las rodillas bajo la almohadilla",
        "Coloca la punta de los pies en el borde de la plataforma",
        "Baja los talones para estirar bien",
        "Empuja con las puntas y contrae arriba"
      ]
    },
    "tags": [
      "legs",
      "isolation",
      "calves"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Soleus/LVSeatedCalfRaise"
  },
  {
    "id": "leg-press-calf-raises",
    "name": {
      "en": "Leg Press Calf Raises",
      "es": "Elevación de gemelos en prensa"
    },
    "category": "calves",
    "secondaryMuscles": [],
    "equipment": "machine",
    "description": {
      "en": "Calf raise performed on the leg press machine for heavy loading.",
      "es": "Elevación de gemelos en prensa de piernas para carga pesada."
    },
    "instructions": {
      "en": [
        "Sit in leg press with balls of feet on lower edge of platform",
        "Keep legs nearly straight",
        "Push through toes extending ankles",
        "Lower heels back for full stretch"
      ],
      "es": [
        "Siéntate en la prensa con la punta de los pies en el borde bajo de la plataforma",
        "Mantén las piernas casi estiradas",
        "Empuja con las puntas extendiendo los tobillos",
        "Baja los talones para estirar bien"
      ]
    },
    "tags": [
      "legs",
      "isolation",
      "calves"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/Gastrocnemius/SL45CalfPress"
  },
  {
    "id": "hip-thrusts",
    "name": {
      "en": "Hip Thrusts",
      "es": "Hip thrust"
    },
    "category": "glutes",
    "secondaryMuscles": [
      "hamstrings",
      "core"
    ],
    "equipment": "barbell",
    "description": {
      "en": "Barbell hip thrust for maximum glute activation.",
      "es": "Hip thrust con barra para máxima activación glútea."
    },
    "instructions": {
      "en": [
        "Sit on floor with upper back against bench",
        "Roll barbell over hips with pad",
        "Drive hips up until body forms straight line",
        "Squeeze glutes at top, lower with control"
      ],
      "es": [
        "Siéntate en el suelo con la espalda alta apoyada en un banco",
        "Pasa la barra sobre las caderas con almohadilla",
        "Empuja la cadera hacia arriba hasta que el cuerpo forme una línea recta",
        "Contrae glúteos arriba y baja con control"
      ]
    },
    "tags": [
      "legs",
      "compound",
      "glutes"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/GluteusMaximus/BBHipThrust"
  },
  {
    "id": "cable-kickbacks",
    "name": {
      "en": "Cable Kickbacks",
      "es": "Patada en polea"
    },
    "category": "glutes",
    "secondaryMuscles": [
      "hamstrings"
    ],
    "equipment": "cable",
    "description": {
      "en": "Cable hip extension for targeted glute isolation.",
      "es": "Extensión de cadera en polea para aislamiento de glúteos."
    },
    "instructions": {
      "en": [
        "Attach ankle cuff to low cable",
        "Face the machine holding frame for support",
        "Kick leg backward squeezing glute at top",
        "Return slowly to starting position"
      ],
      "es": [
        "Engancha la tobillera a la polea baja",
        "Mira hacia la máquina sujetándote del marco",
        "Lleva la pierna hacia atrás contrayendo el glúteo arriba",
        "Vuelve despacio a la posición inicial"
      ]
    },
    "tags": [
      "legs",
      "isolation",
      "glutes"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/GluteusMaximus/CBStandingHipExtension"
  },
  {
    "id": "plank",
    "name": {
      "en": "Plank",
      "es": "Plancha"
    },
    "category": "core",
    "secondaryMuscles": [
      "shoulders"
    ],
    "equipment": "bodyweight",
    "description": {
      "en": "Isometric core exercise for stability and endurance.",
      "es": "Ejercicio isométrico de core para estabilidad y resistencia."
    },
    "instructions": {
      "en": [
        "Get in push-up position on forearms",
        "Keep body in straight line from head to heels",
        "Engage core and hold position",
        "Breathe steadily throughout"
      ],
      "es": [
        "Colócate en posición de flexión sobre los antebrazos",
        "Mantén el cuerpo en línea recta de cabeza a talones",
        "Activa el core y mantén la posición",
        "Respira de forma constante"
      ]
    },
    "tags": [
      "core",
      "isometric",
      "bodyweight"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/RectusAbdominis/BWFrontPlank"
  },
  {
    "id": "cable-crunches",
    "name": {
      "en": "Cable Crunches",
      "es": "Crunch en polea"
    },
    "category": "core",
    "secondaryMuscles": [],
    "equipment": "cable",
    "description": {
      "en": "Weighted crunch using cable for progressive overload on abs.",
      "es": "Crunch con peso en polea para sobrecarga progresiva en abdominales."
    },
    "instructions": {
      "en": [
        "Kneel facing cable machine with rope attachment",
        "Hold rope behind head",
        "Crunch downward, bringing elbows toward knees",
        "Return to starting position with control"
      ],
      "es": [
        "Arrodíllate frente a la polea con cuerda",
        "Sostén la cuerda detrás de la cabeza",
        "Haz el crunch hacia abajo llevando los codos hacia las rodillas",
        "Vuelve a la posición inicial con control"
      ]
    },
    "tags": [
      "core",
      "isolation",
      "abs"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/RectusAbdominis/CBKneelingCrunch"
  },
  {
    "id": "stability-ball-crunches",
    "name": {
      "en": "Stability Ball Crunches",
      "es": "Crunch en fitball"
    },
    "category": "core",
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "description": {
      "en": "Crunches on a stability ball for increased range of motion.",
      "es": "Crunch en balón de estabilidad para mayor recorrido."
    },
    "instructions": {
      "en": [
        "Lie back on stability ball with feet flat on floor",
        "Place hands behind head or across chest",
        "Crunch up contracting abs",
        "Lower back over ball for full stretch"
      ],
      "es": [
        "Tumbado sobre el fitball con los pies en el suelo",
        "Coloca las manos detrás de la cabeza o cruzadas en el pecho",
        "Sube contrayendo los abdominales",
        "Baja la espalda sobre el balón para estirar bien"
      ]
    },
    "tags": [
      "core",
      "isolation",
      "abs"
    ],
    "referenceUrl": "https://exrx.net/WeightExercises/RectusAbdominis/BWBallCrunch"
  }
];
export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((ex) => ex.id === id);
}

export function getExercisesByCategory(category: string): Exercise[] {
  return exercises.filter((ex) => ex.category === category);
}

export function getExercisesByTag(tag: string): Exercise[] {
  return exercises.filter((ex) => ex.tags.includes(tag));
}

export function getAllCategories(): string[] {
  return [...new Set(exercises.map((ex) => ex.category))];
}

export function getAlternativeExercises(
  exerciseId: string,
  excludeIds: string[] = []
): Exercise[] {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return [];

  const excluded = new Set([exerciseId, ...excludeIds]);

  return exercises
    .filter((ex) => !excluded.has(ex.id) && ex.category === exercise.category)
    .sort((a, b) => {
      const aSharedTags = a.tags.filter((t) => exercise.tags.includes(t)).length;
      const bSharedTags = b.tags.filter((t) => exercise.tags.includes(t)).length;
      return bSharedTags - aSharedTags;
    });
}

export function getExerciseLocalized(
  exercise: Exercise,
  locale: Locale
): { name: string; description: string; instructions: string[] } {
  return {
    name: exercise.name[locale],
    description: exercise.description[locale],
    instructions: exercise.instructions[locale],
  };
}
