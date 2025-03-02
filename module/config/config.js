export const extendConfig = {
/** --- LOG --- */    
    log: {
        initializing: "%c Arasaka Project...",
        style: "background: #b0df86; color: #fff700; width: 100%; padding: 10px; border-radius: 2px; border: 1px solid #900; margin: 5px;"
    },

/** --- RULES --- */
    rules: {
        aq3: {
            maxSteps: 2,
            penInit: 0,
            penSkill: 0,
            newActionsPrev: true,
            loreKingdomRoll: '1D10',
            loreNationRoll: '1D10',
            loreStratumRoll: '1D10',
            lorePositionRoll: '1D10',
            loreProfessionRoll: '1D100',
            traitRoll: '1D100',
            loreCoin: "maravedíes",
            loreHUnit: "varas",
            loreWUnit: "libras",
            magicSystem: "s1"
        },
        vyc: {
            maxSteps: 0,
            penInit: -5,
            penSkill: -20,
            newActionsPrev: false,
            loreKingdomRoll: '1D10',
            loreNationRoll: '1D100',
            loreStratumRoll: '1D10',
            lorePositionRoll: '1D10',
            loreProfessionRoll: '1D100',
            traitRoll: '1D100',
            loreCoin: "reales",
            loreHUnit: "varas",
            loreWUnit: "libras",
            magicSystem: "s2"        
        },        
        aq4: {
            maxSteps: 0,
            penInit: -5,
            penSkill: -20,
            newActionsPrev: false,
            loreKingdomRoll: '1D10',
            loreNationRoll: '1D10',
            loreStratumRoll: '1D10',
            lorePositionRoll: '1D10',
            loreProfessionRoll: '1D100',
            traitRoll: '1D100',
            loreCoin: "maravedíes",
            loreHUnit: "varas",
            loreWUnit: "libras",
            magicSystem: "s1"          
        } 
    },

/** --- ROLL LEVELS --- */
    rollLevels: {
        rollRoutine: {
            label: "rollLevel.rollRoutine",
            mod: "+60",
            color: '#00FF00'
        },
        rollVeryEasy: {
            label: "rollLevel.rollVeryEasy",
            mod: "+40",
            color: '#20D000'
        },
        rollEasy: {
            label: "rollLevel.rollEasy",
            mod: "+20",
            color: '#40C000'
        },
        rollNormal: {
            label: "rollLevel.rollNormal",
            mod: "+0",
            color: '#60A000'
        },
        rollComplicated: {
            label: "rollLevel.rollComplicated",
            mod: "-20",
            color: '#808000'
        },
        rollDifficult: {
            label: "rollLevel.rollDifficult",
            mod: "-40",
            color: '#A06000'
        },
        rollVeryDifficult: {
            label: "rollLevel.rollVeryDifficult",
            mod: "-60",
            color: '#C04000'
        },
        rollHeroic: {
            label: "rollLevel.rollHeroic",
            mod: "-80",
            color: '#D02000'
        },
        rollImpossible: {
            label: "rollLevel.rollImpossible",
            mod: "-100",
            color: '#FF0000'
        }                                                                        
    },

/** --- LOCATIONS --- */
    locations: {
        human: {
            label: 'common.human',
            formula: '1d10',
            locations: {
                head: {
                    mult: 2,
                    range: {
                        low: 1,
                        high: 1
                    },
                    label: 'location.head',
                    position: {
                        top: 'calc(22% - var(--hSize)*0.04 )',
                        left: 'calc(50% - var(--hSize)*0.04 )'
                    },
                    mod: "006"
                },
                chest: {
                    mult: 1,
                    range: {
                        low: 2,
                        high: 3
                    },
                    label: 'location.chest',
                    position: {
                        top: 'calc(40% - var(--hSize)*0.04 )',
                        left: 'calc(50% - var(--hSize)*0.04 )'
                    },
                    mod: "007"
                },
                abdomen: {
                    mult: 1,
                    range: {
                        low: 4,
                        high: 4
                    },
                    label: 'location.abdomen',
                    position: {
                        top: 'calc(58% - var(--hSize)*0.04 )',
                        left: 'calc(50% - var(--hSize)*0.04 )'
                    },
                    mod: "007"                      
                },
                rarm: {
                    mult: 0.5,
                    range: {
                        low: 5,
                        high: 5
                    },
                    label: 'location.rarm',
                    position: {
                        top: 'calc(35% - var(--hSize)*0.04 )',
                        left: 'calc(82% - var(--hSize)*0.04 )'
                    },
                    mod: "007"                      
                },
                larm: {
                    mult: 0.5,
                    range: {
                        low: 6,
                        high: 6
                    },
                    label: 'location.larm',
                    position: {
                        top: 'calc(35% - var(--hSize)*0.04 )',
                        left: 'calc(17% - var(--hSize)*0.04 )'
                    },
                    mod: "007"                       
                },
                rleg: {
                    mult: 0.5,
                    range: {
                        low: 7,
                        high: 8
                    },
                    label: 'location.rleg',
                    position: {
                        top: 'calc(88% - var(--hSize)*0.04 )',
                        left: 'calc(70% - var(--hSize)*0.04 )'
                    },
                    mod: "007"                     
                },
                lleg: {
                    mult: 0.5,
                    range: {
                        low: 9,
                        high: 10
                    },
                    label: 'location.lleg',
                    position: {
                        top: 'calc(88% - var(--hSize)*0.04 )',
                        left: 'calc(30% - var(--hSize)*0.04 )'
                    },
                    mod: "007" 
                }      
            }                           
        },
        horse: {
            label: 'common.human',
            formula: '1d10',
            locations: {
                head: {
                    mult: 2,
                    range: {
                        low: 1,
                        high: 1
                    },
                    label: 'location.head',
                    position: {
                        top: 'calc(22% - var(--hSize)*0.04 )',
                        left: 'calc(50% - var(--hSize)*0.04 )'
                    },
                    mod: "006"
                },
                chest: {
                    mult: 1,
                    range: {
                        low: 2,
                        high: 3
                    },
                    label: 'location.chest',
                    position: {
                        top: 'calc(40% - var(--hSize)*0.04 )',
                        left: 'calc(50% - var(--hSize)*0.04 )'
                    },
                    mod: "007"
                },
                abdomen: {
                    mult: 1,
                    range: {
                        low: 4,
                        high: 4
                    },
                    label: 'location.abdomen',
                    position: {
                        top: 'calc(58% - var(--hSize)*0.04 )',
                        left: 'calc(50% - var(--hSize)*0.04 )'
                    },
                    mod: "007"                      
                },
                rarm: {
                    mult: 0.5,
                    range: {
                        low: 5,
                        high: 5
                    },
                    label: 'location.rarm',
                    position: {
                        top: 'calc(35% - var(--hSize)*0.04 )',
                        left: 'calc(82% - var(--hSize)*0.04 )'
                    },
                    mod: "007"                      
                },
                larm: {
                    mult: 0.5,
                    range: {
                        low: 6,
                        high: 6
                    },
                    label: 'location.larm',
                    position: {
                        top: 'calc(35% - var(--hSize)*0.04 )',
                        left: 'calc(17% - var(--hSize)*0.04 )'
                    },
                    mod: "007"                       
                },
                rleg: {
                    mult: 0.5,
                    range: {
                        low: 7,
                        high: 8
                    },
                    label: 'location.rleg',
                    position: {
                        top: 'calc(88% - var(--hSize)*0.04 )',
                        left: 'calc(70% - var(--hSize)*0.04 )'
                    },
                    mod: "007"                     
                },
                lleg: {
                    mult: 0.5,
                    range: {
                        low: 9,
                        high: 10
                    },
                    label: 'location.lleg',
                    position: {
                        top: 'calc(88% - var(--hSize)*0.04 )',
                        left: 'calc(30% - var(--hSize)*0.04 )'
                    },
                    mod: "007" 
                }      
            }
        }       
    },

/** --- ARMORS --- */
    armors: {
        armorTypes: {
            soft: {
                label: 'common.armorSoft',
                level: 0,
                magicPenal: '+0'
            },
            light: {
                label: 'common.armorLight',
                level: 1,
                magicPenal: '-25'
            },
            metalic: {
                label: 'common.armorMetalic',
                level: 2,
                magicPenal: '-50'
            },
            complete: {
                label: 'common.armorComplete',
                level: 3,
                magicPenal: '-75'
            },
            helmet: {
                label: 'common.armorHelmet',
                level: 4,
                magicPenal: '+0'
            },
            animal: {
                label: 'common.armorAnimal',
                level: 5,
                magicPenal: '+0'
            },            
        }
    },

/** --- WEAPONS --- */
    weaponLevels: {
        villain: {
            label: 'common.villain',
            level: 1            
        },        
        soldier: {
            label: 'common.soldier',
            level: 2
        },
        noble: {
            label: 'common.noble',
            level: 3
        }

    },

    weapons: {

        weaponSizes: {
            extralight: {
                label: 'common.extralight',
                mult: 2,
                level: 0.5,
                size: 0
            },
            light: {
                label: 'common.light',
                mult: 3,
                level: 0.75,
                size: 1
            },
            middle: {
                label: 'common.middle',
                mult: 4,
                level: 1,
                size: 2
            },
            heavy: {
                label: 'common.heavy',
                mult: 5,
                level: 2,
                size: 3
            },
            extraheavy: {
                label: 'common.extraheavy',
                mult: 0,
                level: 3,
                size: 4
            }              
        },

        weaponRanges: {
            short: {
                label: 'common.short',
                level: 0.5
            },
            middle: {
                label: 'common.middle',
                level: 1
            },
            large: {
                label: 'common.large',
                level: 2
            }           
        },

        weaponLocks: {
            matchlock: {
                label: 'common.matchlock',
                level: 1
            },
            wheellock: {
                label: 'common.wheellock',
                level: 2
            },
            flintlock: {
                label: 'common.flintlock',
                level: 3
            }           
        }
    },

/** --- MAGIC --- */
    magic: {
        systems: {
            s1: {
                key0: "1",
                label: 'common.spellSystem1'
            },
            s2: {
                key0: "2",
                label: 'common.spellSystem2'
            }
        },

        potion: {
            s1: {
                preparation: [
                    {alchemyMin: 0,  alchemyMax: 30, roll: '', unit:"common.days"},
                    {alchemyMin: 31, alchemyMax: 40, roll: '1D6', unit:"common.days"},
                    {alchemyMin: 41, alchemyMax: 70, roll: '1D4', unit:"common.days"},
                    {alchemyMin: 71, alchemyMax: 90, roll: '1D3', unit:"common.days"},
                    {alchemyMin: 91, alchemyMax: 500, roll: '1', unit:"common.days"},
                ],
                dose: 6,
                maxSameTime: 3
            },
            s2: {
                preparation: [
                    {alchemyMin: 0,  alchemyMax: 20, roll: '', unit:"common.days"},
                    {alchemyMin: 21, alchemyMax: 40, roll: '1D6', unit:"common.days"},
                    {alchemyMin: 41, alchemyMax: 60, roll: '1D4', unit:"common.days"},
                    {alchemyMin: 61, alchemyMax: 80, roll: '1D3', unit:"common.days"},
                    {alchemyMin: 81, alchemyMax: 500, roll: '1', unit:"common.days"},
                ],
                dose: 6,
                maxSameTime: 3
            }            
        },

        talisman: {
            s1: {
                preparation: [
                    {alchemyMin: 0,  alchemyMax: 30, roll: '', unit:"common.months"},
                    {alchemyMin: 31, alchemyMax: 40, roll: '1D6+3', unit:"common.months"},
                    {alchemyMin: 41, alchemyMax: 70, roll: '1D4+2', unit:"common.months"},
                    {alchemyMin: 71, alchemyMax: 90, roll: '1D3+2', unit:"common.months"},
                    {alchemyMin: 91, alchemyMax: 500, roll: '2D6', unit:"common.weeks"},
                ],
                dose: 1,
                maxSameTime: 1
            },
            s2: {
                preparation: [
                    {alchemyMin: 0,  alchemyMax: 20, roll: '', unit:"common.months"},
                    {alchemyMin: 21, alchemyMax: 40, roll: '1D6+3', unit:"common.months"},
                    {alchemyMin: 41, alchemyMax: 60, roll: '1D4+2', unit:"common.months"},
                    {alchemyMin: 61, alchemyMax: 80, roll: '1D3+2', unit:"common.months"},
                    {alchemyMin: 81, alchemyMax: 500, roll: '2D6', unit:"common.weeks"},
                ],
                dose: 1,
                maxSameTime: 1                
            }
        },      
        
        unguent: {
            s1: {
                preparation: [
                    {alchemyMin: 0,  alchemyMax: 30, roll: '', unit:"common.weeks"},
                    {alchemyMin: 31, alchemyMax: 40, roll: '1D6', unit:"common.weeks"},
                    {alchemyMin: 41, alchemyMax: 70, roll: '1D3', unit:"common.weeks"},
                    {alchemyMin: 71, alchemyMax: 90, roll: '1', unit:"common.weeks"},
                    {alchemyMin: 91, alchemyMax: 500, roll: '1D6', unit:"common.days"},
                ],
                dose: 6,
                maxSameTime: 3
            },
            s2: {
                preparation: [
                    {alchemyMin: 0,  alchemyMax: 20, roll: '', unit:"common.weeks"},
                    {alchemyMin: 21, alchemyMax: 40, roll: '1D6', unit:"common.weeks"},
                    {alchemyMin: 41, alchemyMax: 60, roll: '1D3', unit:"common.weeks"},
                    {alchemyMin: 61, alchemyMax: 80, roll: '1', unit:"common.weeks"},
                    {alchemyMin: 81, alchemyMax: 500, roll: '1D6', unit:"common.days"},
                ],
                dose: 6,
                maxSameTime: 3
            }
        },

        nature: {
            white: {
                label: 'common.spellWhites'
            },
            black: {
                label: 'common.spellBlacks'
            }
        },

        origin: {
            popular: {
                label: 'common.spellPopular'
            },
            alchemy: {
                label: 'common.spellAlchemy'
            },
            hellish: {
                label: 'common.spellHellish'
            }
        },

        shape: {
            invocation: {
                label: 'common.invocation',
                parent: 'spell'
            },
            curse: {
                label: 'common.curse',
                parent: 'spell'
            },
            potion: {
                label: 'common.potion',
                parent: 'potion'
            },
            talisman: {
                label: 'common.talisman',
                parent: 'talisman'
            },
            unguent: {
                label: 'common.unguent',
                parent: 'unguent'
            }
        },

        spellsVIS: {
            vis1: {
                label: 'common.vis1',
                level: 1,
                s1: {
                    exper: 10,
                    mod: '+0',
                    faith: 0,
                    conc: 1,
                    study: 1,
                    skillMin: 0
                },
                s2: {
                    exper: 10,
                    mod: '+0',
                    faith: 0,
                    conc: 1,
                    study: 1,
                    skillMin: 0
                }
            },
            vis2: {
                label: 'common.vis2',
                level: 2,
                s1: {
                    exper: 20,
                    mod: '-15',
                    faith: 0,
                    conc: 1,
                    study: 1,
                    skillMin: 0
                },
                s2: {
                    exper: 20,
                    mod: '-20',
                    faith: 0,
                    conc: 2,
                    study: 2,
                    skillMin: 0
                }
            },
            vis3: {
                label: 'common.vis3',
                level: 3,
                s1: {
                    exper: 30,
                    mod: '-35',
                    faith: 0,
                    conc: 2,
                    study: 2,
                    skillMin: 0
                },
                s2: {
                    exper: 30,
                    mod: '-40',
                    faith: 0,
                    conc: 4,
                    study: 4,
                    skillMin: 0
                }
            },
            vis4: {
                label: 'common.vis4',
                level: 4,
                s1: {
                    exper: 40,
                    mod: '-50',
                    faith: 0,
                    conc: 3,
                    study: 3,
                    skillMin: 0
                },
                s2: {
                    exper: 40,
                    mod: '-60',
                    faith: 0,
                    conc: 4,
                    study: 4,
                    skillMin: 0
                }
            },
            vis5: {
                label: 'common.vis5',
                level: 5,
                s1: {
                    exper: 50,
                    mod: '-75',
                    faith: 0,
                    conc: 5,
                    study: 5,
                    skillMin: 0
                },
                s2: {
                    exper: 50,
                    mod: '-80',
                    faith: 0,
                    conc: 5,
                    study: 5,
                    skillMin: 0
                }
            },
            vis6: {
                label: 'common.vis6',
                level: 6,
                s1: {
                    exper: 70,
                    mod: '-100',
                    faith: 0,
                    conc: 5,
                    study: 5,
                    skillMin: 0
                },
                s2: {
                    exper: 70,
                    mod: '-100',
                    faith: 0,
                    conc: 7,
                    study: 7,
                    skillMin: 0
                }
            },
            vis7: {
                label: 'common.vis7',
                level: 7,
                s1: {
                    exper: 100,
                    mod: '-150',
                    faith: 0,
                    conc: 10,
                    study: 10,
                    skillMin: 0
                },
                s2: {
                    exper: 100,
                    mod: '-140',
                    faith: 0,
                    conc: 10,
                    study: 10,
                    skillMin: 0
                }
            }                                               
        },
    
        spellsORDO: {
            ordo1: {
                label: 'common.ordo1',
                level: 1,
                s1: {
                    exper: 10,
                    mod: '+0',
                    faith: 10,
                    conc: 0,
                    study: 1,
                    skillMin: 60,
                    img: '/misc/book-cover.svg'
                },
                s2: {
                    exper: 10,
                    mod: '+0',
                    faith: 12,
                    conc: 0,
                    study: 1,
                    skillMin: 60,
                    img: '/misc/book-cover.svg'
                }
            },
            ordo2: {
                label: 'common.ordo2',
                level: 2,
                s1: {
                    exper: 20,
                    mod: '-20',
                    faith: 13,
                    conc: 0,
                    study: 2,
                    skillMin: 71,
                    img: '/misc/book-cover.svg'
                },
                s2: {
                    exper: 20,
                    mod: '-20',
                    faith: 14,
                    conc: 0,
                    study: 2,
                    skillMin: 71,
                    img: '/misc/book-cover.svg'
                }          
            },
            ordo3: {
                label: 'common.ordo3',
                level: 3,
                s1: {
                    exper: 30,
                    mod: '-40',
                    faith: 15,
                    conc: 0,
                    study: 3,
                    skillMin: 81,
                    img: '/misc/book-cover.svg'
                },
                s2: {
                    exper: 30,
                    mod: '-40',
                    faith: 16,
                    conc: 0,
                    study: 3,
                    skillMin: 81,
                    img: '/misc/book-cover.svg'
                }  
            },
            ordo4: {
                label: 'common.ordo4',
                level: 4,
                s1: {
                    exper: 40,
                    mod: '-60',
                    faith: 18,
                    conc: 0,
                    study: 6,
                    skillMin: 91,
                    img: '/misc/book-cover.svg'
                },
                s2: {
                    exper: 40,
                    mod: '-60',
                    faith: 18,
                    conc: 0,
                    study: 6,
                    skillMin: 91,
                    img: '/misc/book-cover.svg'
                }
            },
            ordo5: {
                label: 'common.ordo5',
                level: 5,
                s1: {
                    exper: 50,
                    mod: '-80',
                    faith: 20,
                    conc: 0,
                    study: 12,
                    skillMin: 96,
                    img: '/misc/book-cover.svg'
                },
                s2: {
                    exper: 50,
                    mod: '-80',
                    faith: 20,
                    conc: 0,
                    study: 12,
                    skillMin: 96,
                    img: '/misc/book-cover.svg'
                }                   
            },
            ordo6: {
                label: 'common.ordo6',
                level: 6,
                s1: {
                    exper: 100,
                    mod: '-100',
                    faith: 20,
                    conc: 0,
                    study: 24,
                    skillMin: 101,
                    img: '/misc/book-cover.svg'
                },
                s2: {
                    exper: 100,
                    mod: '-100',
                    faith: 20,
                    conc: 0,
                    study: 24,
                    skillMin: 101,
                    img: '/misc/book-cover.svg'
                }                
            }                                            
        }        
    },

/** --- MODES --- */
    modes: {
        melee: {
            label: 'common.melee',
            img: 'melee.png',
            removable: true,
            locationRoll: '',
            combatSkill: '',
            attackMod: '+40',
            defenseMod: '',
            targetAttackMod: '',
            targetDefenseMod: ''
        },
        s1: {
            label: 'life.injured',
            img: 'injured.png',  
            removable: false,
            locationRoll: '',
            combatSkill: '',
            attackMod: '',
            defenseMod: '',
            targetAttackMod: '',
            targetDefenseMod: ''            
        },
        s2: {
            label: 'life.badly',
            img: 'badly.png',      
            removable: false,
            locationRoll: '',
            combatSkill: '',
            attackMod: '',
            defenseMod: '',
            targetAttackMod: '',
            targetDefenseMod: ''            
        },
        s3: {
            label: 'life.unconscious',
            img: 'unconscious.png',    
            removable: false,
            locationRoll: '',
            combatSkill: '',
            attackMod: '',
            defenseMod: '',
            targetAttackMod: '',
            targetDefenseMod: ''
        },
        s4: {
            label: 'life.dead',
            img: 'dead.png',
            removable: false,
            locationRoll: '',
            combatSkill: '',
            attackMod: '',
            defenseMod: '',
            targetAttackMod: '',
            targetDefenseMod: ''            
        },
        mounted: {
            label: 'common.mounted',
            img: 'mounted.png',
            removable: true,
            locationRoll: '1D5',
            combatSkill: 'ride',
            attackMod: '',
            defenseMod: '',
            targetAttackMod: '',
            targetDefenseMod: ''            
        },
        onground: {
            label: 'common.onground',
            img: 'onground.png',
            removable: true,
            locationRoll: '',
            combatSkill: '',
            attackMod: '',
            defenseMod: '',
            targetAttackMod: '',
            targetDefenseMod: ''            
        },
        stunned: {
            label: 'common.stunned',
            img: 'stunned.png',
            removable: true,
            locationRoll: '',
            combatSkill: '',
            attackMod: '',
            defenseMod: '',
            targetAttackMod: '',
            targetDefenseMod: ''                     
        },
        tiedup: {
            label: 'common.tiedup',
            img: 'tiedup.png',
            removable: true,
            locationRoll: '',
            combatSkill: '',
            attackMod: '',
            defenseMod: '',
            targetAttackMod: '',
            targetDefenseMod: ''            
        }
    },

/** --- COMBAT MODS --- */  

    combatModsGroups: {
        coverage: {
            label: 'combatMod.coverage',
            index: 1
        },
        location: {
            label: 'combatMod.location',
            index: 2
        },
        position: {
            label: 'combatMod.position',
            index: 3
        },
        distance: {
            label: 'combatMod.distance',
            index: 4
        },
        size: {
            label: 'combatMod.size',
            index: 5
        },
        visibility: {
            label: 'combatMod.visibility',
            index: 6
        },
        others: {
            label: 'combatMod.others',
            index: 7
        },
        bonpenals: {
            label: 'combatMod.bonpenals',
            index: 8
        },
        fencing: {
            label: 'combatMod.fencing',
            index: 9
        }                                                
    },

    combatConfig: {
        badHandID: '024'
    },

    combatMods: [
        {
            index: '001',
            label: "combatMod.001",
            descr: "combatMod.s001",
            attack: "-60",
            defense: "",
            mult: "",
            group: "coverage"
        },
        {
            index: '002',
            label: "combatMod.002",
            descr: "combatMod.s002",
            attack: "-40",
            defense: "",
            mult: "",
            group: "coverage"
        },
        {
            index: '003',
            label: "combatMod.003",
            descr: "combatMod.s003",
            attack: "-20",
            defense: "",
            mult: "",
            group: "coverage"
        },
        {
            index: '004',
            label: "combatMod.004",
            descr: "combatMod.s004",
            attack: "-80",
            defense: "",
            mult: "",
            group: "location"
        },        
        {
            index: '005',
            label: "combatMod.005",
            descr: "combatMod.s005",
            attack: "-60",
            defense: "",
            mult: "",
            group: "location"
        },
        {
            index: '006',
            label: "combatMod.006",
            descr: "combatMod.s006",
            attack: "-40",
            defense: "",
            mult: "",
            group: "location"
        },
        {
            index: '007',
            label: "combatMod.007",
            descr: "combatMod.s007",
            attack: "-20",
            defense: "",
            mult: "",
            group: "location"
        },
        {
            index: '008',
            label: "combatMod.008",
            descr: "combatMod.s008",
            attack: "-40",
            defense: "-40",
            mult: "",
            group: "position"
        },
        {
            index: '009',
            label: "combatMod.009",
            descr: "combatMod.s009",
            attack: "",
            defense: "-20",
            mult: "",
            group: "position"
        },
        {
            index: '010',
            label: "combatMod.010",
            descr: "combatMod.s010",
            attack: "-20",
            defense: "",
            mult: "",
            group: "position"
        },
        {
            index: '011',
            label: "combatMod.011",
            descr: "combatMod.s011",
            attack: "+20",
            defense: "",
            mult: "",
            group: "position"
        },
        {
            index: '012',
            label: "combatMod.012",
            descr: "combatMod.s012",
            attack: "+20",
            defense: "",
            mult: "",
            group: "position"
        },
        {
            index: '013',
            label: "combatMod.013",
            descr: "combatMod.s013",
            attack: "+40",
            defense: "",
            mult: "",
            group: "position"
        },
        {
            index: '014',
            label: "combatMod.014",
            descr: "combatMod.s014",
            attack: "+40",
            defense: "",
            mult: "",
            group: "position"
        },
        {
            index: '015',
            label: "combatMod.015",
            descr: "combatMod.s015",
            attack: "-20",
            defense: "",
            mult: "",
            group: "distance"
        },
        {
            index: '016',
            label: "combatMod.016",
            descr: "combatMod.s016",
            attack: "+0",
            defense: "",
            mult: "",
            group: "distance"
        },
        {
            index: '017',
            label: "combatMod.017",
            descr: "combatMod.s017",
            attack: "+20",
            defense: "",
            mult: "",
            group: "distance"
        },
        {
            index: '018',
            label: "combatMod.018",
            descr: "combatMod.s018",
            attack: "+40",
            defense: "",
            mult: "",
            group: "distance"
        },
        {
            index: '019',
            label: "combatMod.019",
            descr: "combatMod.s019",
            attack: "-20",
            defense: "",
            mult: "",
            group: "size"
        },
        {
            index: '020',
            label: "combatMod.020",
            descr: "combatMod.s020",
            attack: "+20",
            defense: "",
            mult: "",
            group: "size"
        },
        {
            index: '021',
            label: "combatMod.021",
            descr: "combatMod.s021",
            attack: "-60",
            defense: "-60",
            mult: "",
            group: "visibility"
        },
        {
            index: '022',
            label: "combatMod.022",
            descr: "combatMod.s022",
            attack: "-40",
            defense: "-40",
            mult: "",
            group: "visibility"
        },
        {
            index: '023',
            label: "combatMod.023",
            descr: "combatMod.s023",
            attack: "-20",
            defense: "-20",
            mult: "",
            group: "visibility"
        },
        {
            index: '024',
            label: "combatMod.024",
            descr: "combatMod.s024",
            attack: "-25",
            defense: "-25",
            mult: "",
            key: "secondaryHand",
            group: "others"
        },
        {
            index: '025',
            label: "combatMod.025",
            descr: "combatMod.s025",
            attack: "-20",
            defense: "-20",
            mult: "",
            group: "others"
        },
        {
            index: '026',
            label: "combatMod.026",
            descr: "combatMod.s026",
            attack: "+40",
            defense: "",
            mult: "",
            group: "others"
        },
        {
            index: '027',
            label: "combatMod.027",
            descr: "combatMod.s027",
            attack: "",
            defense: "",
            mult: "0.5",
            group: "others"            
        },
        {
            index: '028',
            label: "combatMod.028",
            descr: "combatMod.s028",
            attack: "",
            defense: "",
            mult: "2",
            group: "others"            
        },
        {
            index: '029',
            label: "combatMod.029",
            descr: "combatMod.s029",
            attack: "+20",
            defense: "+20",
            mult: "",
            group: "others"            
        },
        {
            index: '030',
            label: "combatMod.030",
            descr: "combatMod.s030",
            attack: "+40",
            defense: "+40",
            mult: "",
            group: "others"            
        },
        {
            index: '031',
            label: "combatMod.031",
            descr: "combatMod.s031",
            attack: "-20",
            defense: "-20",
            mult: "",
            group: "others"            
        },
        {
            index: '032',
            label: "combatMod.032",
            descr: "combatMod.s032",
            attack: "-20",
            defense: "-20",
            mult: "",
            group: "bonpenals"            
        },      
        {
            index: '033',
            label: "combatMod.033",
            descr: "combatMod.s033",
            attack: "-30",
            defense: "-30",
            mult: "",
            group: "bonpenals"            
        },         
        {
            index: '034',
            label: "combatMod.034",
            descr: "combatMod.s034",
            attack: "-40",
            defense: "-40",
            mult: "",
            group: "bonpenals"            
        },     
        {
            index: '035',
            label: "combatMod.035",
            descr: "combatMod.s035",
            attack: "-50",
            defense: "-50",
            mult: "",
            group: "bonpenals"            
        },     
        {
            index: '036',
            label: "combatMod.036",
            descr: "combatMod.s036",
            attack: "-60",
            defense: "-60",
            mult: "",
            group: "bonpenals"            
        },                       
        {
            index: '037',
            label: "combatMod.037",
            descr: "combatMod.s037",
            attack: "-70",
            defense: "-70",
            mult: "",
            group: "bonpenals"            
        },                             
        {
            index: '038',
            label: "combatMod.038",
            descr: "combatMod.s038",
            attack: "-80",
            defense: "-80",
            mult: "",
            group: "bonpenals"            
        },   
        {
            index: '039',
            label: "combatMod.039",
            descr: "combatMod.s039",
            attack: "+20",
            defense: "+20",
            mult: "",
            group: "bonpenals"            
        },      
        {
            index: '040',
            label: "combatMod.040",
            descr: "combatMod.s040",
            attack: "+30",
            defense: "+30",
            mult: "",
            group: "bonpenals"            
        },              
        {
            index: '041',
            label: "combatMod.041",
            descr: "combatMod.s041",
            attack: "+40",
            defense: "+40",
            mult: "",
            group: "bonpenals"            
        },   
        {
            index: '042',
            label: "combatMod.042",
            descr: "combatMod.s042",
            attack: "+50",
            defense: "+50",
            mult: "",
            group: "bonpenals"            
        },   
        {
            index: '043',
            label: "combatMod.043",
            descr: "combatMod.s043",
            attack: "+60",
            defense: "+60",
            mult: "",
            group: "bonpenals"            
        },     
        {
            index: '044',
            label: "combatMod.044",
            descr: "combatMod.s044",
            attack: "+70",
            defense: "+70",
            mult: "",
            group: "bonpenals"            
        },     
        {
            index: '045',
            label: "combatMod.045",
            descr: "combatMod.s045",
            attack: "+80",
            defense: "+80",
            mult: "",
            group: "bonpenals"            
        },                                    
        {
            index: '101',
            label: "combatMod.101",
            descr: "combatMod.s101",
            attack: "",
            defense: "-20",
            mult: "",
            group: "fencing"            
        },
        {
            index: '102',
            label: "combatMod.102",
            descr: "combatMod.s102",
            attack: "",
            defense: "-40",
            mult: "",
            group: "fencing"            
        }                                
    ]
    
};
