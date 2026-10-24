export const configRULES = {
    aq3: {
        estratoRoll: true,          // Tirada principal en función del estrato y después por Posición (2 Tiradas de D10)
        posicionRoll: false,        // Tirada principal directamente desde la posición (Tirada de D100)
                                    // Tiene que ser contraria a la anterior
        limpiezaSangre: false,      // Aplica la Limpieza de Sangre
        verCultura: false,          // Muestra la cultura (LORE) en la Ficha del Personaje
        verFamilia: true,           // Muestra la familia (LORE) en la Ficha del Personaje
        verExtraLore: false,        // Muestra los campos Edad, Altura, Peso
        verSociedad: false,         // Muestra Mod. Sociales
        unitDistancia: 'varas',     // Unidad de distancia
        unitAltura: 'varas',        // Unidad de altura
        unitPeso: 'libras',         // Unidad de peso
        moneda: 'maravedíes',       // Moneda
        monedaShort: 'mv.',         // Moneda siglas
        chars: ['fue', 'agi', 'hab', 'res', 'per', 'com', 'cul'],
        maxChars: 100,              // Máximo en características
        maxWzSkills: 80,            // Máximo que pueden tener las competencias durante la Creación
        ptProfesion: 100,           // Puntos a repartir entre competencias de Profesión
        ptLibres: 50,               // Puntos libres
        armasFUE: true,             // Las armas tienen una FUE mínima
        armasRES: true,             // Los escudos tienen una resistencia cuantificada
        armadurasFUE: true,         // Las armaduras tienen una FUE mínima
        armadurasRES: true,         // Las armaduras tienen una resistencia cuantificada                
        talentos: {
            hechizos: true,
            ensalmos: true,
            esgrima: false,
            alquimia: false
        }
    },
    aq4: {
        estratoRoll: false,
        posicionRoll: true,
        limpiezaSangre: false,
        verCultura: true,
        verFamilia: false,  
        verExtraLore: true,
        verSociedad: true,
        unitDistancia: 'varas',
        unitAltura: 'varas',
        unitPeso: 'libras',
        moneda: 'maravedíes',
        monedaShort: 'mv.',        
        chars: ['fue', 'agi', 'hab', 'res', 'per', 'tem', 'com', 'cul'],
        maxChars: 115,
        maxWzSkills: 80,
        ptProfesion: 100,
        ptLibres: 50,
        armasFUE: false,
        armasRES: false,
        armadurasFUE: false,
        armadurasRES: false,
        talentos: {
            hechizos: true,
            ensalmos: true,
            esgrima: false,
            alquimia: false
        }        
    },
    vyc: {
        estratoRoll: true,
        posicionRoll: false,
        limpiezaSangre: true,
        verCultura: false,
        verFamilia: true,
        verExtraLore: true,
        verSociedad: true,
        unitDistancia: 'varas',
        unitAltura: 'varas',
        unitPeso: 'libras',
        moneda: 'reales',
        monedaShort: 're.',         
        chars: ['fue', 'agi', 'hab', 'res', 'per', 'tem', 'com', 'cul'],
        maxChars: 110,
        maxWzSkills: 80,
        ptProfesion: 100,
        ptLibres: 50,
        armasFUE: false,
        armasRES: false,
        armadurasFUE: false,
        armadurasRES: false,
        talentos: {
            hechizos: true,
            ensalmos: true,
            esgrima: true,
            alquimia: true
        }         
    },
}