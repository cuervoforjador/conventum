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
        ],
        hechizos: [
            {id: '051', label: 'mods.m051', mod: '-25', rules: ['aq3']},
            {id: '052', label: 'mods.m051', mod: '-20', rules: ['aq4', 'vyc']},
            {id: '053', label: 'mods.m053', mod: '-25', rules: ['aq3']},
            {id: '054', label: 'mods.m053', mod: '-25', rules: ['aq4', 'vyc']},
            {id: '055', label: 'mods.m055', mod: '-50', rules: ['aq3', 'aq4', 'vyc']},
            {id: '056', label: 'mods.m056', mod: '-75', rules: ['aq3', 'aq4', 'vyc']},
            {id: '057', label: 'mods.m057', mod: '-20', rules: ['aq3', 'aq4', 'vyc']},
            {id: '058', label: 'mods.m058', mod: '-40', rules: ['aq3', 'aq4', 'vyc']},
            {id: '059', label: 'mods.m059', mod: '-60', rules: ['aq3', 'aq4', 'vyc']},
            {id: '060', label: 'mods.m060', mod: '-80', rules: ['aq3', 'aq4', 'vyc']},
            {id: '061', label: 'mods.m061', mod: '-10', rules: ['aq3', 'aq4', 'vyc']},
            {id: '066', label: 'mods.m066', mod: '-15', rules: ['aq3']},
            {id: '067', label: 'mods.m067', mod: '-35', rules: ['aq3']},
            {id: '068', label: 'mods.m068', mod: '-50', rules: ['aq3']},
            {id: '069', label: 'mods.m069', mod: '-75', rules: ['aq3']},
            {id: '070', label: 'mods.m070', mod: '-100', rules: ['aq3']},
            {id: '071', label: 'mods.m071', mod: '-150', rules: ['aq3']},
            {id: '072', label: 'mods.m072', mod: '-20',  rules: ['aq4', 'vyc']},
            {id: '073', label: 'mods.m073', mod: '-40',  rules: ['aq4', 'vyc']},
            {id: '074', label: 'mods.m074', mod: '-60',  rules: ['aq4', 'vyc']},
            {id: '075', label: 'mods.m075', mod: '-80',  rules: ['aq4', 'vyc']},
            {id: '076', label: 'mods.m076', mod: '-100', rules: ['aq4', 'vyc']},
            {id: '077', label: 'mods.m077', mod: '-140', rules: ['aq4', 'vyc']}
        ],
        ensalmos: [
            {id: '062', label: 'mods.m062', mod: '-25', rules: ['aq3', 'aq4', 'vyc']},
            {id: '063', label: 'mods.m063', mod: '-50', rules: ['aq3', 'aq4', 'vyc']},
            {id: '064', label: 'mods.m064', mod: '-25', rules: ['aq3', 'aq4', 'vyc']},
            {id: '065', label: 'mods.m065', mod: '-50', rules: ['aq3', 'aq4', 'vyc']},
            {id: '078', label: 'mods.m078', mod: '-20', rules: ['aq3', 'aq4', 'vyc']},
            {id: '079', label: 'mods.m079', mod: '-40', rules: ['aq3', 'aq4', 'vyc']},
            {id: '080', label: 'mods.m080', mod: '-60', rules: ['aq3', 'aq4', 'vyc']},
            {id: '081', label: 'mods.m081', mod: '-80', rules: ['aq3', 'aq4', 'vyc']},
            {id: '082', label: 'mods.m082', mod: '-100', rules: ['aq3', 'aq4', 'vyc']},
        ]
    },
    hechizos: {
        aq3: {
            requisitos: {
                minIRR: 50,
                minSkill: 50,
                skillID: 'conocimiento_magico',
                skillEnsenar: 'ensenar',
                skillFabricacion: 'alquimia',
                useComunicacion: false,
                ptAprendizaje: false,
            },
            niveles: {
                vis1: {label: 'common.vis1',  pta: 0, ptc: 1,  mod: '+0',   mods: ''},
                vis2: {label: 'common.vis2',  pta: 0, ptc: 1,  mod: '-15',  mods: '066'},
                vis3: {label: 'common.vis3',  pta: 0, ptc: 2,  mod: '-35',  mods: '067'},
                vis4: {label: 'common.vis4',  pta: 0, ptc: 3,  mod: '-50',  mods: '068'},
                vis5: {label: 'common.vis5',  pta: 0, ptc: 5,  mod: '-75',  mods: '069'},
                vis6: {label: 'common.vis6',  pta: 0, ptc: 5,  mod: '-100', mods: '070'},
                vis7: {label: 'common.vis7',  pta: 0, ptc: 10, mod: '-150', mods: '071'}
            },                
            tipos: [
                {key: 'invocacion', label: 'common.invocacion', icon: 'fa-crow',                fabricacion: false},
                {key: 'maleficio',  label: 'common.maleficio',  icon: 'fa-skull-cow',           fabricacion: false},
                {key: 'pocion',     label: 'common.pocion',     icon: 'fa-flask-round-potion',  fabricacion: true},
                {key: 'talisman',   label: 'common.talisman',   icon: 'fa-ankh',                fabricacion: true},
                {key: 'unguento',   label: 'common.unguento',   icon: 'fa-bottle-droplet',      fabricacion: true}
            ],
            naturaleza: [
                {key: 'blanca', label: 'common.magiaBlanca'},
                {key: 'negra', label: 'common.magiaNegra'},
            ],
            origen: [
                {key: 'popular', label: 'common.magiaPopular'},
                {key: 'alquimica', label: 'common.magiaAlquimica'},
                {key: 'infernal', label: 'common.magiaInfernal'},
                {key: 'prohibida', label: 'common.magiaProhibida'},
            ],            
            fabricacion: {
                pocion: [
                    {low: 0,  high: 30,  tiempo: '-',   unidad: '', dosis: 0},
                    {low: 31, high: 40,  tiempo: '1D6', unidad: 'common.dias', dosis: 6},
                    {low: 41, high: 70,  tiempo: '1D4', unidad: 'common.dias', dosis: 6},
                    {low: 71, high: 90,  tiempo: '1D3', unidad: 'common.dias', dosis: 6},
                    {low: 91, high: 999, tiempo: '1',   unidad: 'common.dias', dosis: 6}
                ],
                talisman: [
                    {low: 0,  high: 30,  tiempo: '-',     unidad: '', dosis: 0},
                    {low: 31, high: 40,  tiempo: '1D6+3', unidad: 'common.meses', dosis: 6},
                    {low: 41, high: 70,  tiempo: '1D4+2', unidad: 'common.meses', dosis: 6},
                    {low: 71, high: 90,  tiempo: '1D3+2', unidad: 'common.meses', dosis: 6},
                    {low: 91, high: 999, tiempo: '2D6',   unidad: 'common.semanas', dosis: 6}
                ],
                unguento: [
                    {low: 0,  high: 30,  tiempo: '-',   unidad: '', dosis: 0},
                    {low: 31, high: 40,  tiempo: '1D6', unidad: 'common.semanas', dosis: 6},
                    {low: 41, high: 70,  tiempo: '1D3', unidad: 'common.semanas', dosis: 6},
                    {low: 71, high: 90,  tiempo: '1',   unidad: 'common.semanas', dosis: 6},
                    {low: 91, high: 999, tiempo: '1D6', unidad: 'common.dias', dosis: 6}
                ]                       
            }
        },
        aq4: {
            requisitos: {
                minIRR: 60,
                minSkill: 60,
                skillID: 'conocimiento_magico',
                skillEnsenar: 'ensenar',
                skillFabricacion: 'alquimia',
                useComunicacion: true,
                ptAprendizaje: true
            },
            niveles: {
                vis1: {label: 'common.vis1',  pta: 10,  ptc: 1,  mod: '+0',   mods: ''},
                vis2: {label: 'common.vis2',  pta: 20,  ptc: 2,  mod: '-20',  mods: '072'},
                vis3: {label: 'common.vis3',  pta: 30,  ptc: 3,  mod: '-40',  mods: '073'},
                vis4: {label: 'common.vis4',  pta: 40,  ptc: 4,  mod: '-60',  mods: '074'},
                vis5: {label: 'common.vis5',  pta: 50,  ptc: 5,  mod: '-80',  mods: '075'},
                vis6: {label: 'common.vis6',  pta: 70,  ptc: 7,  mod: '-100', mods: '076'},
                vis7: {label: 'common.vis7',  pta: 100, ptc: 10, mod: '-140', mods: '077'}
            },
            tipos: [
                {key: 'invocacion', label: 'common.invocacion', icon: 'fa-crow',                fabricacion: false},
                {key: 'maleficio',  label: 'common.maleficio',  icon: 'fa-skull-cow',           fabricacion: false},
                {key: 'pocion',     label: 'common.pocion',     icon: 'fa-flask-round-potion',  fabricacion: true},
                {key: 'talisman',   label: 'common.talisman',   icon: 'fa-ankh',                fabricacion: true},
                {key: 'unguento',   label: 'common.unguento',   icon: 'fa-bottle-droplet',      fabricacion: true}
            ],
            naturaleza: [
                {key: 'blanca', label: 'common.magiaBlanca'},
                {key: 'negra', label: 'common.magiaNegra'},
            ],
            origen: [
                {key: 'popular', label: 'common.magiaPopular'},
                {key: 'alquimica', label: 'common.magiaAlquimica'}
            ],    
            coste: {
                vis1: {ptAp: 10},
                vis2: {ptAp: 10},
                vis3: {ptAp: 10},
                vis4: {ptAp: 10},
                vis5: {ptAp: 10},
                vis6: {ptAp: 10},
                vis7: {ptAp: 10},
            },     
            fabricacion: {
                pocion: [
                    {low: 0,  high: 20,  tiempo: '-',   unidad: '', dosis: 0},
                    {low: 21, high: 40,  tiempo: '1D6', unidad: 'common.dias', dosis: 6},
                    {low: 41, high: 60,  tiempo: '1D4', unidad: 'common.dias', dosis: 6},
                    {low: 61, high: 80,  tiempo: '1D3', unidad: 'common.dias', dosis: 6},
                    {low: 81, high: 999, tiempo: '1',   unidad: 'common.dias', dosis: 6}
                ],
                talisman: [
                    {low: 0,  high: 20,  tiempo: '-',     unidad: '', dosis: 0},
                    {low: 21, high: 40,  tiempo: '1D6+3', unidad: 'common.meses', dosis: 1},
                    {low: 41, high: 60,  tiempo: '1D4+2', unidad: 'common.meses', dosis: 1},
                    {low: 61, high: 80,  tiempo: '1D3+2', unidad: 'common.meses', dosis: 1},
                    {low: 81, high: 999, tiempo: '2D6',   unidad: 'common.semanas', dosis: 1}
                ],
                unguento: [
                    {low: 0,  high: 20,  tiempo: '-',   unidad: '', dosis: 0},
                    {low: 21, high: 40,  tiempo: '1D6', unidad: 'common.semanas', dosis: 6},
                    {low: 41, high: 60,  tiempo: '1D3', unidad: 'common.semanas', dosis: 6},
                    {low: 61, high: 80,  tiempo: '1',   unidad: 'common.semanas', dosis: 6},
                    {low: 81, high: 999, tiempo: '1D6', unidad: 'common.dias', dosis: 6}
                ]                       
            }
        },
        vyc: {
            requisitos: {
                minIRR: 60,
                minSkill: 60,
                skillID: 'conocimiento_magico',
                skillEnsenar: 'ensenar',
                skillFabricacion: 'alquimia',
                useComunicacion: false,
                ptAprendizaje: true
            },
            niveles: {
                vis1: {label: 'common.vis1',  pta: 10,  ptc: 1,  mod: '+0',   mods: ''},
                vis2: {label: 'common.vis2',  pta: 20,  ptc: 2,  mod: '-20',  mods: '072'},
                vis3: {label: 'common.vis3',  pta: 30,  ptc: 3,  mod: '-40',  mods: '073'},
                vis4: {label: 'common.vis4',  pta: 40,  ptc: 4,  mod: '-60',  mods: '074'},
                vis5: {label: 'common.vis5',  pta: 50,  ptc: 5,  mod: '-80',  mods: '075'},
                vis6: {label: 'common.vis6',  pta: 70,  ptc: 7,  mod: '-100', mods: '076'},
                vis7: {label: 'common.vis7',  pta: 100, ptc: 10, mod: '-140', mods: '077'}
            },
            tipos: [
                {key: 'invocacion', label: 'common.invocacion', icon: 'fa-crow',                fabricacion: false},
                {key: 'maleficio',  label: 'common.maleficio',  icon: 'fa-skull-cow',           fabricacion: false},
                {key: 'pocion',     label: 'common.pocion',     icon: 'fa-flask-round-potion',  fabricacion: true},
                {key: 'talisman',   label: 'common.talisman',   icon: 'fa-ankh',                fabricacion: true},
                {key: 'unguento',   label: 'common.unguento',   icon: 'fa-bottle-droplet',      fabricacion: true}
            ],
            naturaleza: [
                {key: 'blanca', label: 'common.magiaBlanca'},
                {key: 'negra', label: 'common.magiaNegra'},
            ],
            origen: [
                {key: 'popular', label: 'common.magiaPopular'},
                {key: 'alquimica', label: 'common.magiaAlquimica'},
                {key: 'infernal', label: 'common.magiaInfernal'}
            ],    
            coste: {
                vis1: {ptAp: 10},
                vis2: {ptAp: 10},
                vis3: {ptAp: 10},
                vis4: {ptAp: 10},
                vis5: {ptAp: 10},
                vis6: {ptAp: 10},
                vis7: {ptAp: 10},
            },     
            fabricacion: {
                pocion: [
                    {low: 0,  high: 20,  tiempo: '-',   unidad: '', dosis: 0},
                    {low: 21, high: 40,  tiempo: '1D6', unidad: 'common.dias', dosis: 6},
                    {low: 41, high: 60,  tiempo: '1D4', unidad: 'common.dias', dosis: 6},
                    {low: 61, high: 80,  tiempo: '1D3', unidad: 'common.dias', dosis: 6},
                    {low: 81, high: 999, tiempo: '1',   unidad: 'common.dias', dosis: 6}
                ],
                talisman: [
                    {low: 0,  high: 20,  tiempo: '-',     unidad: '', dosis: 0},
                    {low: 21, high: 40,  tiempo: '1D6+3', unidad: 'common.meses', dosis: 1},
                    {low: 41, high: 60,  tiempo: '1D4+2', unidad: 'common.meses', dosis: 1},
                    {low: 61, high: 80,  tiempo: '1D3+2', unidad: 'common.meses', dosis: 1},
                    {low: 81, high: 999, tiempo: '2D6',   unidad: 'common.semanas', dosis: 1}
                ],
                unguento: [
                    {low: 0,  high: 20,  tiempo: '-',   unidad: '', dosis: 0},
                    {low: 21, high: 40,  tiempo: '1D6', unidad: 'common.semanas', dosis: 6},
                    {low: 41, high: 60,  tiempo: '1D3', unidad: 'common.semanas', dosis: 6},
                    {low: 61, high: 80,  tiempo: '1',   unidad: 'common.semanas', dosis: 6},
                    {low: 81, high: 999, tiempo: '1D6', unidad: 'common.dias', dosis: 6}
                ]                       
            }
        }        
    },
    ensalmos: {
        aq3: {
            requisitos: {
                minRR: 50,
                minSkill: 50,
                skillID: 'teologia',
                ptAprendizaje: false,
                diarios: false
            },
            niveles: {
                ordo1: {label: 'common.ordo1',  pta: 0, ptf: 10,  mod: '+0',   mods: '',    teologia: {min: 50,  max: 70},  estudioMeses: 1},
                ordo2: {label: 'common.ordo2',  pta: 0, ptf: 13,  mod: '-20',  mods: '078', teologia: {min: 71,  max: 85},  estudioMeses: 2},
                ordo3: {label: 'common.ordo3',  pta: 0, ptf: 15,  mod: '-40',  mods: '079', teologia: {min: 86,  max: 95},  estudioMeses: 3},
                ordo4: {label: 'common.ordo4',  pta: 0, ptf: 18,  mod: '-60',  mods: '080', teologia: {min: 96,  max: 100}, estudioMeses: 6},
                ordo5: {label: 'common.ordo5',  pta: 0, ptf: 20,  mod: '-80',  mods: '081', teologia: {min: 101, max: 120}, estudioMeses: 12},
                ordo6: {label: 'common.ordo6',  pta: 0, ptf: 20,  mod: '-100', mods: '082', teologia: {min: 121, max: 999}, estudioMeses: 24}
            },
            diarios: []           
        },
        aq4: {
            requisitos: {
                minRR: 50,
                minSkill: 60,
                skillID: 'teologia',
                ptAprendizaje: true,
                diarios: true
            },
            niveles: {
                ordo1: {label: 'common.ordo1',  pta: 10,  ptf: 12,  mod: '+0',   mods: '',    teologia: {min: 60,  max: 70},  estudioMeses: 1},
                ordo2: {label: 'common.ordo2',  pta: 20,  ptf: 14,  mod: '-20',  mods: '078', teologia: {min: 71,  max: 80},  estudioMeses: 2},
                ordo3: {label: 'common.ordo3',  pta: 30,  ptf: 16,  mod: '-40',  mods: '079', teologia: {min: 81,  max: 90},  estudioMeses: 3},
                ordo4: {label: 'common.ordo4',  pta: 40,  ptf: 18,  mod: '-60',  mods: '080', teologia: {min: 91,  max: 95},  estudioMeses: 6},
                ordo5: {label: 'common.ordo5',  pta: 50,  ptf: 20,  mod: '-80',  mods: '081', teologia: {min: 96,  max: 100}, estudioMeses: 12},
                ordo6: {label: 'common.ordo6',  pta: 100, ptf: 20,  mod: '-100', mods: '082', teologia: {min: 101, max: 999}, estudioMeses: 24}
            },
            diarios: [
                {min: 1,  max: 4,   ensalmos: 0},
                {min: 5,  max: 9,   ensalmos: 1},
                {min: 10, max: 14,  ensalmos: 2},
                {min: 15, max: 17,  ensalmos: 3},
                {min: 18, max: 19,  ensalmos: 4},
                {min: 20, max: 999, ensalmos: 5}
            ]            
        },
        vyc: {
            requisitos: {
                minRR: 50,
                minSkill: 60,
                skillID: 'teologia',
                ptAprendizaje: true,
                diarios: true
            },
            niveles: {
                ordo1: {label: 'common.ordo1',  pta: 10,  ptf: 12,  mod: '+0',   mods: '',    teologia: {min: 60,  max: 70},  estudioMeses: 1},
                ordo2: {label: 'common.ordo2',  pta: 20,  ptf: 14,  mod: '-20',  mods: '078', teologia: {min: 71,  max: 80},  estudioMeses: 2},
                ordo3: {label: 'common.ordo3',  pta: 30,  ptf: 16,  mod: '-40',  mods: '079', teologia: {min: 81,  max: 90},  estudioMeses: 3},
                ordo4: {label: 'common.ordo4',  pta: 40,  ptf: 18,  mod: '-60',  mods: '080', teologia: {min: 91,  max: 95},  estudioMeses: 6},
                ordo5: {label: 'common.ordo5',  pta: 50,  ptf: 20,  mod: '-80',  mods: '081', teologia: {min: 96,  max: 100}, estudioMeses: 12},
                ordo6: {label: 'common.ordo6',  pta: 100, ptf: 20,  mod: '-100', mods: '082', teologia: {min: 101, max: 999}, estudioMeses: 24}
            },
            diarios: [
                {min: 1,  max: 4,   ensalmos: 0},
                {min: 5,  max: 9,   ensalmos: 1},
                {min: 10, max: 14,  ensalmos: 2},
                {min: 15, max: 17,  ensalmos: 3},
                {min: 18, max: 19,  ensalmos: 4},
                {min: 20, max: 999, ensalmos: 5}
            ]            
        }
    }
        
    
}