export const extendConfig = {

    log: {
        initializing: "%c Conventum-Aquelarre: Warming up at the bonfire...",
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
            name: ''
        },        
        {
            id: 'crossbow',
            i18n: 'common.crossbows',
            name: ''
        },
        {
            id: 'knife',
            i18n: 'common.knifes',
            name: ''
        },
        {
            id: 'sword',
            i18n: 'common.swords',
            name: ''
        },
        {
            id: 'longsword',
            i18n: 'common.longswords',
            name: ''
        },
        {
            id: 'axe',
            i18n: 'common.axes',
            name: ''
        },
        {
            id: 'sling',
            i18n: 'common.slings',
            name: ''
        },
        {
            id: 'spear',
            i18n: 'common.spears',
            name: ''
        },
        {
            id: 'mace',
            i18n: 'common.maces',
            name: ''
        },
        {
            id: 'stick',
            i18n: 'common.sticks',
            name: ''
        },      
        {
            id: 'shield',
            i18n: 'common.shields',
            name: ''
        },                                                   
        {
            id: 'fight',
            i18n: 'common.fight',
            name: ''
        },             
    ],    
    weaponSizes: [
        {
            id: '00',
            i18n: 'config.weaponSizeNO',
            name: '',
            property: 'none'
        },        
        {
            id: '01',
            i18n: 'config.weaponSizeLight',
            name: '',
            property: 'light'
        },
        {
            id: '02',
            i18n: 'config.weaponSizeMiddle',
            name: '',
            property: 'middle'
        },
        {
            id: '03',
            i18n: 'config.weaponSizeHeavy',
            name: '',
            property: 'heavy'
        }      
    ],
    spellShapes: [
        {
            id: 'invocatio',
            name: '',
        },
        {
            id: 'maleficium',
            name: '',
        },
        {
            id: 'potio',
            name: '',
        },
        {
            id: 'amuletum',
            name: '',
        },
        {
            id: 'unguentum',
            name: '',
        }        
    ],
    spellNature: [
        {
            id: 'white',
            name: ''
        },
        {
            id: 'black',
            name: ''
        }
    ],
    spellSecondNature: [
        {
            id: 'popular',
            name: ''
        },
        {
            id: 'alchemy',
            name: ''
        },
        {
            id: 'infernal',
            name: ''
        },
        {
            id: 'forbidden',
            name: ''
        }        
    ],
    componentUtility: [
        {
            id: 'noUtil',
            name: '',
            mod: '-30',
            witchcraft: '*1'
        },
        {
            id: 'marginal',
            name: '',
            mod: '-10',
            witchcraft: '*1'
        },
        {
            id: 'limited',
            name: '',
            mod: '+10',
            witchcraft: '*1'
        },
        {
            id: 'daily',
            name: '',
            mod: '+50',
            witchcraft: '*1'
        }             
    ],
    componentLocation: [
        {
            id: 'remote',
            name: '',
            mod: '-50',
            witchcraft: '*1'
        },
        {
            id: 'far',
            name: '',
            mod: '-30',
            witchcraft: '*1'
        },
        {
            id: 'nofar',
            name: '',
            mod: '-10',
            witchcraft: '*1'
        },
        {
            id: 'nearby',
            name: '',
            mod: '+10',
            witchcraft: '*1'
        }             
    ],    
    componentPotential: [
        {
            id: 'horrifying',
            name: '',
            mod: '-30',
            witchcraft: '*4'
        },        
        {
            id: 'witchy',
            name: '',
            mod: '-20',
            witchcraft: '*2'
        },         
        {
            id: 'unusual',
            name: '',
            mod: '-10',
            witchcraft: '*1'
        },      
        {
            id: 'nomagic',
            name: '',
            mod: '+10',
            witchcraft: '*0.5'
        }                   
    ],
    componentPlace: [
        {
            id: 'seedytown',
            name: '',
            mod: '-20',
            witchcraft: '*0.5'
        },
        {
            id: 'smalltown',
            name: '',
            mod: '+0',
            witchcraft: '*1'
        },
        {
            id: 'normaltown',
            name: '',
            mod: '+10',
            witchcraft: '*1'
        },        
        {
            id: 'bigtown',
            name: '',
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
