export const aqConfig = {
    skills: {
        status: ['normal', 'paterna', 'primaria', 'secundaria']
    },
    armas: {
        tamanos: {
            lig: {
                label: 'common.ligero'
            },
            med: {
                label: 'common.intermedio'
            },
            pes: {
                label: 'common.pesado'
            }
        }
    },
    armaduras: {
        tipos: {
            blanda: {  
                label: 'common.blanda'
            },
            ligera: {  
                label: 'common.ligera'
            },
            metalica: {  
                label: 'common.metalica'
            },
            completa: {  
                label: 'common.completa'
            },
            casco: {  
                label: 'common.casco'
            },
            animal: {  
                label: 'common.animal'
            }                      
        }
    },
    localizaciones: {
        humanoide: {
            standard: true,
            formula: {
                base: '1D10',
                alta: '1D5',
                baja: '1D5+5'
            },
            partes: {
                cabeza:             {low: 0,  high: 1,  pen: '-50', mult: 2},
                brazoDerecho:       {low: 2,  high: 2,  pen: '-25', mult: 0.5},
                brazoIzquierdo:     {low: 3,  high: 3,  pen: '-25', mult: 0.5},
                pecho:              {low: 4,  high: 6,  pen: '-10', mult: 1},
                abdomen:            {low: 7,  high: 8,  pen: '-10', mult: 1},
                piernaDerecha:      {low: 9,  high: 9,  pen: '-15', mult: 0.5},
                piernaIzquierda:    {low: 10, high: 10, pen: '-15', mult: 0.5}
            }
        },
        cuadrupedos: {
            standard: false,
            formula: {
                base: '1D10',
                alta: '1D10',
                baja: '1D10'
            },
            partes: {
                cabeza:             {low: 0,  high: 1,  pen: '+0', mult: 2},
                pataDerDelante:     {low: 2,  high: 2,  pen: '+0', mult: 0.5},
                pataIzqDelante:     {low: 3,  high: 3,  pen: '+0', mult: 0.5},
                cuartosDelante:     {low: 4,  high: 6,  pen: '+0', mult: 1},
                cuartosTraseros:    {low: 7,  high: 8,  pen: '+0', mult: 1},
                pataDerTrasera:     {low: 9,  high: 9,  pen: '+0', mult: 0.5},
                pataIzqTrasera:     {low: 10, high: 10, pen: '+0', mult: 0.5}
            }
        },
        aves: {
            standard: false,
            formula: {
                base: '1D10',
                alta: '1D5',
                baja: '1D5+5'
            },
            partes: {
                cabeza:             {low: 0,  high: 1,  pen: '+0', mult: 2},
                alaDerecha:         {low: 2,  high: 2,  pen: '+0', mult: 0.5},
                alaIzquierda:       {low: 3,  high: 3,  pen: '+0', mult: 0.5},
                lomo:               {low: 4,  high: 5,  pen: '+0', mult: 1},
                buche:              {low: 6,  high: 8,  pen: '+0', mult: 1},
                pataDerecha:        {low: 9,  high: 9,  pen: '+0', mult: 0.5},
                pataIzquierda:      {low: 10, high: 10, pen: '+0', mult: 0.5}
            }
        },     
        aracnidos: {
            standard: false,
            formula: {
                base: '1D100',
                alta: '1D100',
                baja: '1D100'
            },
            partes: {
                cabeza:             {low: 0,  high: 10,  pen: '+0', mult: 2},
                pataIzqPrimera:     {low: 11, high: 15,  pen: '+0', mult: 0.25},
                pataDerPrimera:     {low: 16, high: 20,  pen: '+0', mult: 0.25},
                pataIzqSegunda:     {low: 21, high: 25,  pen: '+0', mult: 0.25},
                pataDerSegunda:     {low: 26, high: 30,  pen: '+0', mult: 0.25},
                cuerpo:             {low: 31, high: 80,  pen: '+0', mult: 1},
                pataIzqTercera:     {low: 81, high: 85,  pen: '+0', mult: 0.25},
                pataDerTercera:     {low: 86, high: 90,  pen: '+0', mult: 0.25},
                pataIzqCuarta:      {low: 91, high: 95,  pen: '+0', mult: 0.25},
                pataDerCuarta:      {low: 95, high: 100, pen: '+0', mult: 0.25}
            }
        },        
        serpientes: {
            standard: false,
            formula: {
                base: '1D10',
                alta: '1D10',
                baja: '1D10'
            },
            partes: {
                cabeza:             {low: 0, high: 2,  pen: '+0', mult: 2},
                cuerpo:             {low: 3, high: 8,  pen: '+0', mult: 1},
                cola:               {low: 9, high: 10, pen: '+0', mult: 0.5}
            }
        }        
    },
    modificadores: {
        estado: [
            {id: '050', label: 'mods.m050', mod: '-50', rules: ['aq3', 'aq4', 'vyc']}
        ],
        cobertura: [
            {id: '028', label: 'mods.m028', mod: '-60', rules: ['aq4', 'vyc']},
            {id: '029', label: 'mods.m029', mod: '-40', rules: ['aq4', 'vyc']},
            {id: '030', label: 'mods.m030', mod: '-30', rules: ['aq4', 'vyc']}
        ],    
        distancia: [
            {id: '031', label: 'mods.m031', mod: '-20', rules: ['aq4', 'vyc']},
            {id: '032', label: 'mods.m032', mod: '+0', rules: ['aq4', 'vyc']},
            {id: '033', label: 'mods.m033', mod: '+20', rules: ['aq4', 'vyc']},
            {id: '034', label: 'mods.m034', mod: '+40', rules: ['vyc']},
        ],            
        localizacion: [
            {id: '001', label: 'mods.m001', mod: '-10', rules: ['aq3']},
            {id: '002', label: 'mods.m002', mod: '-15', rules: ['aq3']},
            {id: '003', label: 'mods.m003', mod: '-25', rules: ['aq3']},
            {id: '004', label: 'mods.m004', mod: '-30', rules: ['aq3']},
            {id: '005', label: 'mods.m005', mod: '-35', rules: ['aq3']},
            {id: '006', label: 'mods.m006', mod: '-50', rules: ['aq3']},
            {id: '007', label: 'mods.m007', mod: '-70', rules: ['aq3']},
            {id: '008', label: 'mods.m008', mod: '-75', rules: ['aq3']},

            {id: '009', label: 'mods.m009', mod: '-80', rules: ['aq4', 'vyc']},
            {id: '010', label: 'mods.m010', mod: '-60', rules: ['aq4', 'vyc']},
            {id: '011', label: 'mods.m011', mod: '-40', rules: ['aq4', 'vyc']},
            {id: '012', label: 'mods.m012', mod: '-20', rules: ['aq4', 'vyc']}
        ],     
        situacion: [
            {id: '013', label: 'mods.m013', mod: '+50', rules: ['aq3']},
            {id: '014', label: 'mods.m014', mod: '+50', rules: ['aq3']},
            {id: '015', label: 'mods.m015', mod: '+50', rules: ['aq3']},
            {id: '016', label: 'mods.m016', mod: '+25', rules: ['aq3']},
            {id: '017', label: 'mods.m017', mod: '+25', rules: ['aq3']},
            {id: '018', label: 'mods.m018', mod: '+20', rules: ['aq3']},
            {id: '019', label: 'mods.m019', mod: '-10', rules: ['aq3']},
            {id: '020', label: 'mods.m020', mod: '-20', rules: ['aq3']},
            {id: '021', label: 'mods.m021', mod: '-25', rules: ['aq3']},
            {id: '022', label: 'mods.m022', mod: '-25', rules: ['aq3']},
            {id: '023', label: 'mods.m023', mod: '-50', rules: ['aq3']},
            {id: '024', label: 'mods.m024', mod: '-10', rules: ['aq3']},
            {id: '025', label: 'mods.m025', mod: '-25', rules: ['aq3']},
            {id: '026', label: 'mods.m026', mod: '-25', rules: ['aq3']},
            {id: '027', label: 'mods.m027', mod: '-50', rules: ['aq3']},
        ],
        posicion: [
            {id: '035', label: 'mods.m035', mod: '-40', rules: ['aq4', 'vyc']},
            {id: '036', label: 'mods.m036', mod: '-20', rules: ['aq4', 'vyc']},
            {id: '037', label: 'mods.m037', mod: '-20', rules: ['aq4', 'vyc']},
            {id: '038', label: 'mods.m038', mod: '+20', rules: ['aq4', 'vyc']},
            {id: '039', label: 'mods.m039', mod: '+20', rules: ['aq4', 'vyc']},
            {id: '040', label: 'mods.m040', mod: '+40', rules: ['aq4', 'vyc']},
            {id: '041', label: 'mods.m041', mod: '+40', rules: ['aq4', 'vyc']}
        ],
        tamano: [
            {id: '042', label: 'mods.m042', mod: '-20', rules: ['aq4', 'vyc']},
            {id: '043', label: 'mods.m043', mod: '+20', rules: ['aq4', 'vyc']}
        ],
        visibilidad: [
            {id: '044', label: 'mods.m044', mod: '-60', rules: ['aq4', 'vyc']},
            {id: '045', label: 'mods.m045', mod: '-40', rules: ['aq4', 'vyc']},
            {id: '046', label: 'mods.m046', mod: '-20', rules: ['aq4', 'vyc']}
        ],
        otros: [
            {id: '047', label: 'mods.m047', mod: '-20', rules: ['aq4', 'vyc']},
            {id: '048', label: 'mods.m048', mod: '-20', rules: ['aq4', 'vyc']},
            {id: '049', label: 'mods.m049', mod: '+40', rules: ['aq4', 'vyc']}
        ]
    }
        
    
}