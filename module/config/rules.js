export const configRULES = {
    aq3: {
        estratoRoll: true,          // Tirada principal en función del estrato y después por Posición (2 Tiradas de D10)
        posicionRoll: false,        // Tirada principal directamente desde la posición (Tirada de D100)
                                    // Tiene que ser contraria a la anterior
        limpiezaSangre: false,      // Aplica la Limpieza de Sangre
        verCultura: false,          // Muestra la cultura (LORE) en la Ficha del Personaje
        verFamilia: true,           // Muestra la familia (LORE) en la Ficha del Personaje
        verExtraLore: false,        // Muestra los campos Edad, Altura, Peso
        unitAltura: 'varas',        // Unidad de altura
        unitPeso: 'libras',         // Unidad de peso
        chars: ['fue', 'agi', 'hab', 'res', 'per', 'com', 'cul'],
        armasFUE: true,             // Las armas tienen una FUE mínima
        armasRES: true,             // Los escudos tienen una resistencia cuantificada
        armadurasFUE: true,         // Las armaduras tienen una FUE mínima
        armadurasRES: true          // Las armaduras tienen una resistencia cuantificada        
    },
    aq4: {
        estratoRoll: false,
        posicionRoll: true,
        limpiezaSangre: false,
        verCultura: true,
        verFamilia: false,  
        verExtraLore: true,
        unitAltura: 'varas',
        unitPeso: 'libras',
        chars: ['fue', 'agi', 'hab', 'res', 'per', 'tem', 'com', 'cul'],
        armasFUE: false,
        armasRES: false,
        armadurasFUE: false,
        armadurasRES: false        
    },
    vyc: {
        estratoRoll: true,
        posicionRoll: false,
        limpiezaSangre: true,
        verCultura: false,
        verFamilia: true,
        verExtraLore: true,
        unitAltura: 'varas',
        unitPeso: 'libras',
        chars: ['fue', 'agi', 'hab', 'res', 'per', 'tem', 'com', 'cul'],
        armasFUE: false,
        armasRES: false,
        armadurasFUE: false,
        armadurasRES: false           
    },
}