export const extendConfig = {

    log: {
        initializing: "%c Aquelarre: Warming up at the bonfire...",
        style: "background: #F22; color: #FFF; width: 100%; padding: 10px; border-radius: 2px; border: 1px solid #900; margin: 5px;"
    },
    version10: false,
    version11: false,
    noHumanItems: [
        "worlds",
        "societies",
        "kingdoms",
        "cultures",
        "languages",
        "stratums",
        "status",
        "skills",
        "locations",
        "modes",
        "actionPool"
    ],
    frames: [
        "standard",
        "catholicae",
        "islamicae",
        "iudae"
    ],
    socialGroups: [
        {
            id: 'nobleman',
            i18n: 'social.nobleman',
            name: ''
        },
        {
            id: 'soldier',
            i18n: 'social.soldier',
            name: ''
        },
        {
            id: 'villain',
            i18n: 'social.villain',
            name: ''
        }            
    ],
    armorTypes: [
        {
            id: '01',
            i18n: 'config.armorHelmet',
            name: '',
            spellMod: '-25'
        },
        {
            id: '02',
            i18n: 'config.armorSoft',
            name: '',
            spellMod: '-0'
        },
        {
            id: '03',
            i18n: 'config.armorLight',
            name: '',
            spellMod: '-25'
        },
        {
            id: '04',
            i18n: 'config.armorMetallic',
            name: '',
            spellMod: '-50'
        },
        {
            id: '05',
            i18n: 'config.armorComplete',
            name: '',
            spellMod: '-75'
        },
        {
            id: '06',
            i18n: 'config.armorAnimal',
            name: '',
            spellMod: '-0'
        }
    ],
    weaponTypes: [
        {
            id: 'bow',
            i18n: 'common.bows',
            name: 'bows'
        },        
        {
            id: 'crossbow',
            i18n: 'common.crossbows',
            name: 'crossbows'
        },
        {
            id: 'knife',
            i18n: 'common.knifes',
            name: 'knifes'
        },
        {
            id: 'sword',
            i18n: 'common.swords',
            name: 'swords'
        },
        {
            id: 'longsword',
            i18n: 'common.longswords',
            name: 'longswords'
        },
        {
            id: 'axe',
            i18n: 'common.axes',
            name: 'axes'
        },
        {
            id: 'sling',
            i18n: 'common.slings',
            name: 'slings'
        },
        {
            id: 'spear',
            i18n: 'common.spears',
            name: 'spears'
        },
        {
            id: 'mace',
            i18n: 'common.maces',
            name: 'maces'
        },
        {
            id: 'stick',
            i18n: 'common.sticks',
            name: 'sticks'
        },      
        {
            id: 'shield',
            i18n: 'common.shields',
            name: 'shields'
        },                                                   
        {
            id: 'fight',
            i18n: 'common.fight',
            name: 'fight'
        },             
    ],    
    weaponSizes: [     
        {
            id: '01',
            i18n: 'config.weaponSizeLight',
            name: 'weaponSizeLight',
            property: 'light',
            multipler: 3
        },
        {
            id: '02',
            i18n: 'config.weaponSizeMiddle',
            name: 'weaponSizeMiddle',
            property: 'middle',
            multipler: 4
        },
        {
            id: '03',
            i18n: 'config.weaponSizeHeavy',
            name: 'weaponSizeHeavy',
            property: 'heavy',
            multipler: 5
        }      
    ],
    spellShapes: [
        {
            id: 'invocatio',
            name: 'invocatio',
        },
        {
            id: 'maleficium',
            name: 'maleficium',
        },
        {
            id: 'potio',
            name: 'potio',
        },
        {
            id: 'amuletum',
            name: 'amuletum',
        },
        {
            id: 'unguentum',
            name: 'unguentum',
        }        
    ],
    spellNature: [
        {
            id: 'white',
            name: 'white'
        },
        {
            id: 'black',
            name: 'black'
        }
    ],
    spellSecondNature: [
        {
            id: 'popular',
            name: 'popular'
        },
        {
            id: 'alchemy',
            name: 'alchemy'
        },
        {
            id: 'infernal',
            name: 'infernal'
        },
        {
            id: 'forbidden',
            name: 'forbidden'
        }        
    ],
    componentUtility: [
        {
            id: 'noUtil',
            name: 'noUtil',
            mod: '-30',
            witchcraft: '*1'
        },
        {
            id: 'marginal',
            name: 'marginal',
            mod: '-10',
            witchcraft: '*1'
        },
        {
            id: 'limited',
            name: 'limited',
            mod: '+10',
            witchcraft: '*1'
        },
        {
            id: 'daily',
            name: 'daily',
            mod: '+50',
            witchcraft: '*1'
        }             
    ],
    componentLocation: [
        {
            id: 'remote',
            name: 'remote',
            mod: '-50',
            witchcraft: '*1'
        },
        {
            id: 'far',
            name: 'far',
            mod: '-30',
            witchcraft: '*1'
        },
        {
            id: 'nofar',
            name: 'nofar',
            mod: '-10',
            witchcraft: '*1'
        },
        {
            id: 'nearby',
            name: 'nearby',
            mod: '+10',
            witchcraft: '*1'
        }             
    ],    
    componentPotential: [
        {
            id: 'horrifying',
            name: 'horrifying',
            mod: '-30',
            witchcraft: '*4'
        },        
        {
            id: 'witchy',
            name: 'witchy',
            mod: '-20',
            witchcraft: '*2'
        },         
        {
            id: 'unusual',
            name: 'unusual',
            mod: '-10',
            witchcraft: '*1'
        },      
        {
            id: 'nomagic',
            name: 'nomagic',
            mod: '+10',
            witchcraft: '*0.5'
        }                   
    ],
    componentPlace: [
        {
            id: 'seedytown',
            name: 'seedytown',
            mod: '-20',
            witchcraft: '*0.5'
        },
        {
            id: 'smalltown',
            name: 'smalltown',
            mod: '+0',
            witchcraft: '*1'
        },
        {
            id: 'normaltown',
            name: 'normaltown',
            mod: '+10',
            witchcraft: '*1'
        },        
        {
            id: 'bigtown',
            name: 'bigtown',
            mod: '+20',
            witchcraft: '*1'
        }        
    ],
    activeEffects: [
        'dead',
        'unconscious',
        'sleep',
        'stun',
        'prone',
        'restrain',
        'paralysis',
        'fly',
        'blind',
        'deaf',
        'silence',
        'fear',
        'burning',
        'frozen',
        'shock',
        'corrode',
        'bleeding',
        'disease',
        'poison',
        'curse',
        'regen',
        'degen',
        'upgrade',
        'downgrade',
        'invisible',
        'target',
        'eye',
        'bless',
        'fireShield',
        'coldShield',
        'magicShield',
        'holyShield'
    ]
};
