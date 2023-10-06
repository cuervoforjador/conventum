/**
 * Compendium Backend...
 */

export class mainBackend {

    /**
     * Compendium Backend For Actors...
     */
    static async getBackendForActor(actor, systemData) {
        
        //Directs
        let mBackend = {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            kingdoms: await this._getKingdoms(systemData.control.world),
            societies: await this._getSocieties(systemData.control.world),
            skills: await this._getSkills(systemData.control.world, false, actor),
            languages: await this._getLanguages(systemData.control.world),
            locations: await this._getLocations(systemData.control.world, actor.type)
        };
                
        //Kingdom
        if (systemData.bio.kingdom === '')
            systemData.bio.kingdom = (mBackend.kingdoms.length > 0) ? mBackend.kingdoms[0].id : '';
        if (!mBackend.kingdoms.find(e => e.id === systemData.bio.kingdom))
            systemData.bio.kingdom = (mBackend.kingdoms.length > 0) ? mBackend.kingdoms[0].id : '';

        //Culture
        mBackend.cultures = await this._getCultures(systemData.control.world,
                                                    systemData.bio.kingdom);
        if (mBackend.cultures === undefined) return;

        if (systemData.bio.culture === '')
            systemData.bio.culture = (mBackend.cultures.length > 0) ? mBackend.cultures[0].id : '';
        if (!mBackend.cultures.find(e => e.id === systemData.bio.culture))
            systemData.bio.culture = (mBackend.cultures.length > 0) ? mBackend.cultures[0].id : '';

        //Society
        if (systemData.bio.culture !== '') {
            const myCulture = mBackend.cultures.find(e => e.id === systemData.bio.culture);
            if (myCulture) systemData.bio.society = myCulture.system.backend.society;
        }
                                                    
        //Stratum
        mBackend.stratums = await this._getStratums(systemData.control.world,
                                                    systemData.bio.society);
        if (systemData.bio.stratum === '')
            systemData.bio.stratum = (mBackend.stratums.length > 0) ? mBackend.stratums[0].id : '';  
        if (!mBackend.stratums.find(e => e.id === systemData.bio.stratum))
            systemData.bio.stratum = (mBackend.stratums.length > 0) ? mBackend.stratums[0].id : '';
        
        //Status
        mBackend.status = await this._getStatus(systemData.control.world,
                                                systemData.bio.stratum);
        if (systemData.bio.status === '')
            systemData.bio.status = (mBackend.status.length > 0) ? mBackend.status[0].id : '';   
        if (!mBackend.status.find(e => e.id === systemData.bio.status))
            systemData.bio.status = (mBackend.status.length > 0) ? mBackend.status[0].id : '';
        
        //Professions
        mBackend.professions = await this._getProfessions(systemData.control. world, 
                                                          systemData.bio);

        //Mounts
        let mMounts = Array.from(game.actors).filter(e => e.system.control.mount);
        let mAvailable = [];
        mMounts.map(e => {
            if (!Array.from(game.actors).find(o => o.system.equipment.mount === e.id)) 
                mAvailable.push(e);
        });
        if (actor.system.equipment.mount !== '') 
            mAvailable.push(game.actors.get(actor.system.equipment.mount));
        mBackend.mounts = [{_id: '', name: ''}].concat(mAvailable);

        //Sorting...
        this._sortByRange(mBackend.kingdoms);

        return mBackend;
    }

    /**
     * Compendium Backend For Society Items...
     */
    static async getBackendForSociety() {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            frames: await this._getFrames()
        };
    }

    /**
     * Compendium Backend For Kingdom Items...
     */
    static async getBackendForKingdom(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            cultures: await this._getCultures(systemData.control.world)
        };
    }

    /**
     * Compendium Backend For Language Items...
     */
    static async getBackendForLanguage() {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments()
        };
    }

    /**
     * Compendium Backend For Culture Items...
     */
    static async getBackendForCulture(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            societies: await this._getSocieties(systemData.control.world), 
            kingdoms: await this._getKingdoms(systemData.control.world),
            languages: await this._getLanguages(systemData.control.world)
        };
    }

    /**
     * Compendium Backend For Stratums Items...
     */
    static async getBackendForStratums(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            societies: await this._getSocieties(systemData.control.world)
        };
    }

    /**
     * Compendium Backend For Status Items...
     */
    static async getBackendForStatus(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            stratums: await this._getStratums(systemData.control.world)
        };
    }    

    /**
     * Compendium Backend For Skill Items...
     */
    static async getBackendForSkill(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            characteristics: this._getCharacteristics('primary', true),
            socialGroups: this._getSocialGroups()
        };
    }

    /**
     * Compendium Backend For Professions Items...
     */
    static async getBackendForProfession(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            charPrimary: this._getCharacteristics('primary', false),
            charSecondary: this._getCharacteristics('secondary', false),
            socialGroups: this._getSocialGroups(),
            skills: await this._getSkills(systemData.control.world, false),
            combatSkill: await this._getCombatSkills(systemData.control.world, false),
            languages: await this._getLanguages(systemData.control.world),
            kingdoms: await this._getKingdoms(systemData.control.world),
            societies: await this._getSocieties(systemData.control.world), 
            cultures: await this._getCultures(systemData.control.world), 
            stratums: await this._getStratums(systemData.control.world),
            status: await this._getStatus(systemData.control.world)  
        };
    }    

    /**
     * Compendium Backend For Traits Items...
     */
    static async getBackendForTrait(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            skills: await this._getSkills(systemData.control.world, false),
            characteristics: this._getCharacteristics('primary', true)
        };
    }    

    /**
     * Compendium Backend For Location Items...
     */
    static async getBackendForLocation() {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            actorTypes: this._getActorTypes()
        };
    }

    /**
     * Compendium Backend For Modes Items...
     */
    static async getBackendForMode(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            actorTypes: this._getActorTypes(),
            weaponTypes: this._getWeaponTypes(),
            weaponSizes: this._getWeaponSizes(),
            skills: await this._getSkills(systemData.control.world, true),
            characteristics: this._getCharacteristics('primary', true),
            secondaries: this._getCharacteristics('secondary', true),
            combatSkills: await this._getCombatSkills(systemData.control.world, true),
            modes: await this._getModes(systemData.control.world),
            locations: await this._getLocations(systemData.control.world, systemData.config.location.actorType),
            activeEffects: this._getActiveEffects()
        };
    }    

    /**
     * Compendium Backend For Armor Items...
     */
    static async getBackendForArmor(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            characteristics: this._getCharacteristics('primary', true),
            actorTypes: this._getActorTypes(),
            armorTypes: this._getArmorTypes(),
            locations: await this._getLocations(systemData.control.world, systemData.actorType),
            skills: await this._getSkills(systemData.control.world, false)
        };
    }

    /**
     * Compendium Backend For Weapon Items...
     */
    static async getBackendForWeapon(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            characteristics: this._getCharacteristics('primary', true),
            socialGroups: this._getSocialGroups(),
            actorTypes: this._getActorTypes(),
            weaponSizes: this._getWeaponSizes(),
            weaponTypes: this._getWeaponTypes(),
            locations: await this._getLocations(systemData.control.world, systemData.actorType),
            skills: await this._getSkills(systemData.control.world, true),
            skillsPenal: await this._getSkills(systemData.control.world, false),
            combatSkills: await this._getCombatSkills(systemData.control.world, true)
        };
    }

    /**
     * Compendium Backend For Spell Items...
     */
    static async getBackendForSpell(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            characteristics: this._getCharacteristics('primary', true),
            secondary: this._getCharacteristics('secondary', true),
            actorTypes: this._getActorTypes(),
            spellShapes: this._getSpellShapes(),
            spellNature: this._getSpellNature(),
            spellSecondNature: this._getSpellSecondNature(),
            skills: await this._getSkills(systemData.control.world, true),
            skillsPenal: await this._getSkills(systemData.control.world, false),
            combatSkills: await this._getCombatSkills(systemData.control.world, true),
            magicSkills: await this._getMagicSkills(systemData.control.world, true)
        };
    }    

    /**
     * Compendium Backend For Ritual Items...
     */
    static async getBackendForRitual(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            characteristics: this._getCharacteristics('primary', true),
            secondary: this._getCharacteristics('secondary', true),
            actorTypes: this._getActorTypes(),
            societies: await this._getSocieties(systemData.control.world),
            skills: await this._getSkills(systemData.control.world, true),
            skillsPenal: await this._getSkills(systemData.control.world, false),
            combatSkills: await this._getCombatSkills(systemData.control.world, true),
            magicSkills: await this._getMagicSkills(systemData.control.world, true)
        };
    }  

    /**
     * Compendium Backend For Component Items...
     */
    static async getBackendForComponent(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            characteristics: this._getCharacteristics('primary', true),
            actorTypes: this._getActorTypes(),
            spellShapes: this._getSpellShapes(),
            spellNature: this._getSpellNature(),
            spellSecondNature: this._getSpellSecondNature(),
            componentUtility: this._getComponentUtility(),
            componentLocation: this._getComponentLocation(),
            componentPotential: this._getComponentPotential(),
            componentPlace: this._getComponentPlace(),
            skills: await this._getSkills(systemData.control.world, true),
            skillsPenal: await this._getSkills(systemData.control.world, false),
            combatSkills: await this._getCombatSkills(systemData.control.world, true),
            magicSkills: await this._getMagicSkills(systemData.control.world, true)
        };
    }    

    /**
     * Compendium Backend For Actions Items...
     */
    static async getBackendForAction(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            characteristics: this._getCharacteristics('primary', true),
            secondaries: this._getCharacteristics('secondary', true),
            actorTypes: this._getActorTypes(),
            weaponTypes: this._getWeaponTypes(),
            weaponSizes: this._getWeaponSizes(),
            locations: await this._getLocations(systemData.control.world, systemData.location.actorType),
            modes: await this._getModes(systemData.control.world),
            skills: await this._getSkills(systemData.control.world, true),
            combatSkills: await this._getCombatSkills(systemData.control.world, true)
        };
    }

    /**
     * Compendium Backend For Action Pools Combat Items...
     */
    static async getBackendForActionPool(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            characteristics: this._getCharacteristics('primary', true),
            actorTypes: this._getActorTypes(),
            weaponSizes: this._getWeaponSizes(),
            locations: await this._getLocations(systemData.control.world, systemData.actorType),
            skills: await this._getSkills(systemData.control.world, true),
            combatSkills: await this._getCombatSkills(systemData.control.world, true)
        };
    }

    /**
     * Compendium Backend For Standard Items...
     */
    static async getBackendForItem(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments()
        };
    }

    /**
     * _getSocieties
     * @param {*} sWorld 
     */
    static async _getSocieties(sWorld) {
        return this._getDocuments('societies', sWorld);
    }

    /**
     * _getKingdoms
     * @param {*} sWorld 
     */
    static async _getKingdoms(sWorld) {
        return this._getDocuments('kingdoms', sWorld);
    }

    /**
     * _getLanguages
     * @param {*} sWorld 
     */
    static async _getLanguages(sWorld) {
        return this._getDocuments('languages', sWorld);
    }  

    /**
     * _getSkills
     * @param {*} sWorld 
     * @param {*} bFirstClear 
     * @returns 
     */
    static async _getSkills(sWorld, bFirstClear, actor) {
        bFirstClear = (bFirstClear) ? true : false;

        let mDocs = await this._getDocuments('skills', sWorld);
        if (actor) {
            if (!actor.system.control.criature)
                mDocs = mDocs.filter(e => !e.system.criature);
        }

        if (bFirstClear)
            mDocs.unshift({
                'id': '',
                'name': '',
                'value': {}
            });            
        return mDocs;
    }

    /**
     * _getCombatSkills
     * @param {*} sWorld 
     * @param {*} bFirstClear 
     * @returns 
     */
    static async _getCombatSkills(sWorld, bFirstClear) {

        bFirstClear = (bFirstClear) ? true : false;
        let mDocs = (await this._getDocuments('skills', sWorld))
                                .filter(e => e.system.combat.combat);
        if (bFirstClear)
            mDocs.unshift({
                'id': '',
                'name': '',
                'value': {}
            });
        return mDocs;
    }   
    
    /**
     * _getMagicSkills
     * @param {*} sWorld 
     * @param {*} bFirstClear 
     * @returns 
     */
    static async _getMagicSkills(sWorld, bFirstClear) {

        bFirstClear = (bFirstClear) ? true : false;
        let mDocs = (await this._getDocuments('skills', sWorld))
                                .filter(e => e.system.magic.magic);
        if (bFirstClear)
            mDocs.unshift({
                'id': '',
                'name': '',
                'value': {}
            });
        return mDocs;
    }     

    /**
     * _getCultures
     * @param {*} sWorld 
     */
    static async _getCultures(sWorld, sKingdom) {
        if (sKingdom) {
            let oKingdom = await game.packs.get("conventum.kingdoms").get(sKingdom);            
            let mCultures = [];
            let aCultures = await game.packs.get("conventum.cultures").getDocuments();
            for (var s in oKingdom.system.backend.cultures) {
                if (oKingdom.system.backend.cultures[s].checked) {
                    let oDoc = await game.packs.get("conventum.cultures").getDocument(s);
                    if (oDoc) {
                        oDoc.system.range.low = Number(oKingdom.system.backend.cultures[s].low);
                        oDoc.system.range.high = Number(oKingdom.system.backend.cultures[s].high);
                        if (oDoc) mCultures.push( oDoc );
                    }
                }
            }
            this._sortByRange(mCultures);
            return mCultures;
        } else
            return this._getDocuments('cultures', sWorld);
    }  

    /**
     * _getStratums
     * @param {*} sWorld
     * @param {*} sSociety
     */
    static async _getStratums(sWorld, sSociety) {
        if ( (!sSociety) || (sSociety === ''))
            return this._getDocuments('stratums', sWorld);
        else {
            let mStratums = await this._getDocuments('stratums', sWorld);
            mStratums = mStratums.filter(e => e.system.backend.society === sSociety);
            this._sortByRange(mStratums);
            return mStratums;            
        }
    }    

    /**
     * _getStatus
     * @param {*} sWorld
     * @param {*} sStratum
     */
    static async _getStatus(sWorld, sStratum) {
        if ( (!sStratum) || (sStratum === ''))
            return this._getDocuments('status', sWorld);
        else {
            let mStatus = await this._getDocuments('status', sWorld);
            mStatus = mStatus.filter(e => e.system.backend.stratum === sStratum);
            this._sortByRange(mStatus);
            return mStatus;             
        }
    }      

    /**
     * _getProfessions
     * @param {*} sWorld
     * @param {*} oBio
     */
    static async _getProfessions(sWorld, oBio) {
        if (!oBio) return;

        let mReturn = [];
        let mDocuments = await this._getDocuments('professions', sWorld);
        mDocuments.map(profession => {
            let itsOk = true;
            
            //By Kingdom
            if (profession.system.requirement.xKingdom) {
                if (!profession.system.requirement.kingdoms[oBio.kingdom].apply) {
                    itsOk = false;
                }
            }
            //By Culture
            if (profession.system.requirement.xCulture) {
                if (!profession.system.requirement.cultures[oBio.culture].apply) {
                    itsOk = false;
                }
            }
            //By Society
            if (!profession.system.requirement.societies[oBio.society].apply) {
                itsOk = false;
            }     
            //By Stratum
            if (!profession.system.requirement.stratums[oBio.stratum].apply) {
                itsOk = false;
            }

            if (itsOk)
                mReturn.push({
                    id: profession.id,
                    name: profession.name,
                    img: profession.img,
                    system: {
                        range: {
                            low: profession.system.requirement.stratums[oBio.stratum].rollFrom,
                            high: profession.system.requirement.stratums[oBio.stratum].rollTo
                        },
                        description: profession.system.description
                    }
                });
        });

        this._sortByRange(mReturn);
        return mReturn;
    }      

    /**
     * _getLocations
     * @param {*} sWorld 
     * @param {*} sActorType 
     * @returns 
     */
    static async _getLocations(sWorld, sActorType) {
        let mLocations = await this._getDocuments('locations', sWorld);
        return mLocations.filter(e => e.system.actorType === sActorType);
    }

    /**
     * _getModes
     * @param {*} sWorld 
     * @param {*} sActorType 
     * @returns 
     */
    static async _getModes(sWorld) {
        let mModes = await this._getDocuments('modes', sWorld);
        return mModes;
    }

    /**
     * _getSocialGroups
     */
    static _getSocialGroups(bAddEmpty) {
        let mReturn = [];
        if (bAddEmpty) {
            mReturn.push({
                'id': '',
                'name': '',
                'value': {}
            });
        }
        for (var reg of CONFIG.ExtendConfig.socialGroups) {
            mReturn.push(reg);
        }        
        return mReturn;
    }

    /**
     * _getActorTypes
     */
    static _getActorTypes() {
        let mReturn = [];
        game.template.Actor.types.forEach(s => {
            mReturn.push({
                id: s,
                name: game.i18n.localize('template.'+s)
            });
        });
        return mReturn;
    }
    
    /**
     * _getArmorTypes
     */
    static _getArmorTypes() {
        return CONFIG.ExtendConfig.armorTypes;
    }

    /**
     * _getWeaponTypes
     */
    static _getWeaponTypes() {
        return CONFIG.ExtendConfig.weaponTypes;
    }

    /**
     * _getWeaponSizes
     */
    static _getWeaponSizes() {
        return CONFIG.ExtendConfig.weaponSizes;
    }

    /**
     * _getSpellShapes
     */
    static _getSpellShapes() {
        return CONFIG.ExtendConfig.spellShapes;
    }    

    /**
     * _getSpellNature
     */
    static _getSpellNature() {
        return CONFIG.ExtendConfig.spellNature;
    }    

    /**
     * _getSpellSecondNature
     */
    static _getSpellSecondNature() {
        return CONFIG.ExtendConfig.spellSecondNature;
    }     

    /**
     * _getComponentUtility
     */
    static _getComponentUtility() {
        return CONFIG.ExtendConfig.componentUtility;
    }   
    
    /**
     * _getComponentLocation
     */
    static _getComponentLocation() {
        return CONFIG.ExtendConfig.componentLocation;
    }    

    /**
     * _getComponentPotential
     */
    static _getComponentPotential() {
        return CONFIG.ExtendConfig.componentPotential;
    }     

    /**
     * _getComponentPlace
     */
    static _getComponentPlace() {
        return CONFIG.ExtendConfig.componentPlace;
    } 

    /**
     * _getDocuments
     * @param {*} sWorld 
     */
    static async _getDocuments(sPack, sWorld) {
        if (!game.packs.get("conventum."+sPack)) return [];
        const mDocs = await game.packs.get("conventum."+sPack).getDocuments();
        if (!mDocs) return [];
        let mReturn = mDocs.filter(e => e.system.control.world === sWorld);
        
        this._sortByName(mReturn);
        return mReturn;
    }      

    /**
     * _getCharacteristics
     * @param {string} sField 
     */
    static _getCharacteristics(sField, bAddEmpty) {
        let mReturn = [];
        if (bAddEmpty) {
            mReturn.push({
                'id': '',
                'name': '',
                'value': {}
            });
        }
        for (var s in game.template.Actor.templates.base.characteristics[sField]) {
            mReturn.push({
                'id': s,
                'name': game.i18n.localize('characteristic.'+s),
                'value': game.template.Actor.templates.base.characteristics[sField][s]
            });
        }
       
        this._sortByName(mReturn);
        return mReturn;
    }

    /**
     * Getting frames from server...
     */
    static async _getFrames() {
        let mReturn = [];
        CONFIG.ExtendConfig.frames.forEach(e => {
            mReturn.push({
                'id': e,
                'name': e
            });
        });
        return mReturn;
    }

    /**
     * _getActiveEffects
     */
    static _getActiveEffects() {
        let mReturn = [];
        CONFIG.ExtendConfig.activeEffects.forEach(s => {
            mReturn.push({
                id: s,
                name: game.i18n.localize("mode."+s)
            });
        });
        return mReturn;
    }

    /**
     * _sortByName
     * @param {array} mArray 
     */
    static _sortByName(mArray) {
        mArray.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        }); 
    }

    /**
     * _sortByRange
     * @param {array} mArray 
     */
    static _sortByRange(mArray) {
        mArray.sort((a, b) => {
            const rangeA = a.system.range.low;
            const rangeB = b.system.range.low;
            if (rangeA < rangeB) return -1;
            if (rangeB > rangeA) return 1;
            return 0;
        }); 
    }    

}