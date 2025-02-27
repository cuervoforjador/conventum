import { helperBackend } from "../module/helpers/helperBackend.js";
import { helperUtils } from "../module/helpers/helperUtils.js";

export class mainHandlebars {

   /**
    * init
    * @param {*} Handlebars 
    */
   static init(Handlebars) {

/** ********************************************************************************************
 * SHEETS...
 ******************************************************************************************** */

      /**
       * editable
       */
      Handlebars.registerHelper("editable", function(options) {
         return (game.user.isGM) ? '' : 'disabled="disabled"';
      });    

      Handlebars.registerHelper("isMe", function(actor2, options) {
         var actor1 = options.data.root.document;
         if (!actor1 || !actor2) return false;
         return game.user.isGM ||
                ((actor1.id === actor2.id) &&
                 (actor1.isToken === actor2.isToken ) &&
                 (actor1.isToken ? actor1.token.id === actor2.token.id : true));
      });      

      Handlebars.registerHelper("locked", function(options) {
         let bLocked =  game.settings.get(game.system.id, "sheetsLocked");
         return (game.user.isGM || !bLocked) ? '' : 'disabled';
      }); 
      Handlebars.registerHelper("isLocked", function(options) {
         let bLocked =  game.settings.get(game.system.id, "sheetsLocked");
         if (game.user.isGM) return false;
         return bLocked;
      });      

      Handlebars.registerHelper("systemId", function(options) {
         return game.system.id;
      }); 

      Handlebars.registerHelper("assets", function(options) {
         return '/systems/'+game.system.id+'/assets/';
      });       

/** ********************************************************************************************
 * i18N...
 ******************************************************************************************** */

      /**
       * localizeBy
       */
      Handlebars.registerHelper("_localize", function(sId, options) {
         return game.i18n.localize(sId);
       });    

      /**
       * localizeBy
       */
      Handlebars.registerHelper("localizeBy", function(sId1, sId2, options) {
        return game.i18n.localize(sId1+sId2);
      }); 

/** ********************************************************************************************
 * EXTENDS...
 ******************************************************************************************** */

      /**
       * extendChecked
       */
      Handlebars.registerHelper("extendChecked", function(sRootPath, sProperty1, sProperty2, options) {
         
         let property = (sRootPath.split('.')[0] === 'systemData') ? 
                                                      options.data.root :
                                                      options.data.root.data;
         sRootPath.split('.').forEach( s => {
            property = property && property[s] ? property[s] : undefined; });
         if (sProperty2 === '')
            return (property[sProperty1]) ? 'checked' : '';
         else
            return (property && property[sProperty1] && property[sProperty1][sProperty2]) ? 'checked' : '';
      });

      /**
      * extendValue
      */
      Handlebars.registerHelper("extendValue", function(sRootPath, sProperty1, sProperty2, options) {
         let property = (sRootPath.split('.')[0] === 'systemData') ? 
                                                      options.data.root :
                                                      options.data.root.data;
         sRootPath.split('.').forEach( s => {
            property = property && property[s] ? property[s] : undefined; });         
         if (property[sProperty1] === undefined) return;

         if (sProperty2 === '')
            return property[sProperty1];
         else
            return property[sProperty1][sProperty2];
      });      

/** ********************************************************************************************
 * CHARACTERISTICS && MAIN STATUS...
 ******************************************************************************************** */

      /**
       * complexMenu
       */
      Handlebars.registerHelper("complexMenu", function(sId, options) {
         return options.data.root.data.system.control.view.portrait === sId;
      });

      /**
       * visibleMod
       */
      Handlebars.registerHelper("visibleMod", function(sRoot, sProperty, sField, options) {
         let oRoot = options.data.root.data;
         sRoot.split('.').map(s => { oRoot = oRoot[s] });
         let value = helperUtils.checkMod( sField ? oRoot[sProperty][sField] : oRoot);         
         if (Number(value) === 0) return 'display: none;';
                             else return '';
      });

      /**
       * evalCharColor
       */
      Handlebars.registerHelper("evalCharColor", function(sId, options) {
         const value = options.data.root.data.system.characteristics[sId].value;
         if (value >= 18) return '#ffb529';
         if (value >= 15) return '#ffdc96';
         if (value >= 13) return '#ffebc5';
         if (value >= 10) return '#e1e1e0';
         if (value >= 7) return '#ff6262';
         if (value >= 5) return '#ff2222';
         return '#c10000';
      }); 

      /**
       * evalCharColor2
       */
      Handlebars.registerHelper("evalCharColor2", function(sId, options) {
         const value = options.data.root.data.system.characteristics[sId].value;
         if (value >= 18) return '#000000';
         if (value >= 15) return '#220000';
         if (value >= 13) return '#440000';
         if (value >= 10) return '#660000';
         if (value >= 7) return '#770000';
         if (value >= 5) return '#880000';
         return '#aa0000';
      });       

      /**
       * lifeStatus
       */
      Handlebars.registerHelper("lifeStatus", function(systemData, options) {
         let status = null;
         for (var s in systemData.lifeStatus) {
            const status0 = systemData.lifeStatus[s];
            if (status0.acquired) status = status0;
         }
         if (!status) return '';
         return game.i18n.localize(status.i18n);
      });

      /**
       * charProgress
       */
      Handlebars.registerHelper("charProgress", function(sId, options) {
         const char = options.data.root.systemData.characteristics[sId];
         try {
            return ( (Number(char.value) + Number(char.mod)) * 100 / 
                     (Number(char.max) - Number(char.min))).toString()+'%';
         } catch(e) {
            return '0%';
         }
      });     
      
      /**
       * heavenHellPosition
       */
      Handlebars.registerHelper("heavenHellPosition", function(options) {
         const rrValue = options.data.root.systemData.secondaries.rr.value > 100 ? 
                         100 : options.data.root.systemData.secondaries.rr.value;
         try {
            return '-' + (100 - Number(rrValue)).toString()+'%';
         } catch(e) {
            return '0%';
         }
      }); 

      /**
       * charValue
       */
      Handlebars.registerHelper("charValue", function(systemData, sId, options) {
         if (!systemData) systemData = options.data.root.systemData;
         return helperUtils.getChar(systemData, sId);
      });    
      
      /**
       * charName
       */
      Handlebars.registerHelper("charName", function(sId, options) {
         return game.i18n.localize('characteristics.'+sId);
      });       

      /**
       * checkMode
       */
      Handlebars.registerHelper("checkMode", function(sIndex, options) {
         return !!options.data.root.systemData.modes.find(s => s === sIndex);
      });             

/** ********************************************************************************************
 * SKILLS...
 ******************************************************************************************** */

      Handlebars.registerHelper("noSkills", function(options) {
         return (options.data.root.backSkills.length === 0 
             && !options.data.root.systemData.control.skills.onlyFavorites
             && !options.data.root.systemData.control.skills.onlyByProfession
             && !options.data.root.systemData.control.skills.onlyLearned
             && !options.data.root.systemData.control.skills.search !== '' );
      }); 

      Handlebars.registerHelper("skillGroupClass", function(item, options) {
         const oSkill = options.data.root.systemData.skills[item.system.control.key];
         if (!oSkill) return '';

         let sClass = '';
         if (oSkill.group) sClass = '_groupHeader';
                      else sClass = oSkill.groupIndex === 0 ? '_simple' : '_specialty';
         
         return sClass+' _column'+oSkill.column;
      });    

      Handlebars.registerHelper("skillValue", function(item, options) {
         const oSkill = options.data.root.systemData.skills[item.system.control.key];
         return helperUtils.calcValueTotal(oSkill);
      });    

      Handlebars.registerHelper("skillValueByKey", function(sKey, sMod, options) {
         const oSkill = options.data.root.systemData.skills[sKey];
         let nTotal = helperUtils.calcValueTotal(oSkill);
         if (sMod && sMod !== '+0') nTotal = nTotal + Number(sMod);
         return nTotal;
      });       

      Handlebars.registerHelper("skillFavorite", function(item, options) {
         const oSkill = options.data.root.systemData.skills[item.system.control.key];
         if (!oSkill.favorite) return false;
         return oSkill.favorite;
      });

      Handlebars.registerHelper("skillLearned", function(item, options) {
         const oSkill = options.data.root.systemData.skills[item.system.control.key];
         if (!oSkill.checked) return false;
         return oSkill.checked;
      });   
      
      Handlebars.registerHelper("skillPrimary", function(item, options) {
         const oSkill = options.data.root.systemData.skills[item.system.control.key];
         if (!oSkill.primary) return false;
         return oSkill.primary;
      });      

      Handlebars.registerHelper("skillSecondary", function(item, options) {
         const oSkill = options.data.root.systemData.skills[item.system.control.key];
         if (!oSkill.secondary) return false;
         return oSkill.secondary;
      }); 
      
      Handlebars.registerHelper("skillPatern", function(item, options) {
         const oSkill = options.data.root.systemData.skills[item.system.control.key];
         if (!oSkill || !oSkill.patern) return false;
         return oSkill.patern;
      });       

      Handlebars.registerHelper("skillHighlighted", function(sTag, options) {
         const skill = this.actor.items.get(options.data.root.systemData.control.skills.lastSkill);
         if (!skill) return;
         const oSkill = options.data.root.systemData.skills[skill.system.control.key];
         if (!oSkill || !oSkill[sTag]) return '';
         return '_highlighted';
      });  

      Handlebars.registerHelper("skillAdded", function(skill, options) {
         if (!skill || !skill.item) return '0';
         const oSkill = options.data.root.systemData.skills[skill.item.system.control.key];
         if (!oSkill) return '0';
         return oSkill.value - oSkill.initial;
      });      
      
      Handlebars.registerHelper("experAdded", function(skill, options) {
         if (!skill || !skill.item) return '0';
         const oSkill = options.data.root.systemData.skills[skill.item.system.control.key];
         if (!oSkill) return '0';
         const mult = oSkill.primary || oSkill.secondary || oSkill.patern ? 1 : 2;
         return (oSkill.value - oSkill.initial) * mult;
      });       
      

/** ********************************************************************************************
 * COMBAT...
 ******************************************************************************************** */

      Handlebars.registerHelper("imInPhase", function(sPhase, options) {
         return options.data.root.systemData.control.combat.currentPhase === sPhase ?
               'selected' : '';
      });

      Handlebars.registerHelper("inPhase", function(sPhase, options) {
         return (options.data.root.systemData.control.combat.currentPhase === sPhase);
      });      

      Handlebars.registerHelper("allowMe", function(sProperty, entity, options) {
         if (game.user.isGM) return true;
         const systemData = options.data.root.systemData;

         switch (sProperty) {
            case 'combatant':
               return options.data.root.backCombat._myCombatant.id === entity.id;
            break;
         }
      });

      Handlebars.registerHelper("stepNoVisible", function(step, options) {
         if (!game.combat) return false;
         return step.round === game.combat.round;
      });       

      Handlebars.registerHelper("actionDescr", function(item, options) {
         if (!item) return '';
         if (item.system.type.attack) return game.i18n.localize('common.attack');
         if (item.system.type.defense) return game.i18n.localize('common.defense');
         if (item.system.type.movement) return game.i18n.localize('common.movement');
         return '';
      });         

/** ********************************************************************************************
 * WEAPONS...
 ******************************************************************************************** */

      Handlebars.registerHelper("labelFromSize", function(sIndex, options) {
         if (!sIndex || sIndex === '') return '-';
         return game.i18n.localize(CONFIG.ExtendConfig.weapons.weaponSizes[sIndex].label);
      }); 

      Handlebars.registerHelper("labelFromWeaponLevel", function(item, options) {
         let sReturn = '';
         if (!item) return '-';
         for (var s in item.system.weaponLevels) {
            if (!item.system.weaponLevels[s].check) continue;
            const level = CONFIG.ExtendConfig.weaponLevels[s];
            if (!level) continue;
            sReturn = (sReturn === '') ? game.i18n.localize(level.label) :
                                         sReturn + ', ' + game.i18n.localize(level.label);
         }
         return sReturn;
      }); 

      Handlebars.registerHelper("labelFromLock", function(sIndex, options) {
         if (!sIndex || sIndex === '') return '-';
         return game.i18n.localize(CONFIG.ExtendConfig.weapons.weaponLocks[sIndex].label);
      });    
      
      Handlebars.registerHelper("labelWSkill", function(actor, sKey, options) {
         if (!sKey || sKey === '') return '-';
         if (!actor) actor = options.data.root;
         return actor.items.find(e => e.type === 'skill' && e.system.control.key === sKey)?.name;
      });

      Handlebars.registerHelper("checkWeaponLevel", function(item, options) {
         let sClass = '_dame';
         let actor = options.data.root;
         for (var s in item.system.weaponLevels) {
            if (!item.system.weaponLevels[s].check) continue;
            if (actor.systemData.weaponLevels[s] && actor.systemData.weaponLevels[s].check) sClass = '';
         }         
         return sClass;
      });

      Handlebars.registerHelper("bCheckWeaponLevel", function(item, options) {
         let itsOk = false;
         let actor = options.data.root;
         for (var s in item.system.weaponLevels) {
            if (!item.system.weaponLevels[s].check) continue;
            if (actor.systemData.weaponLevels[s] && actor.systemData.weaponLevels[s].check) itsOk = true;
         }         
         return itsOk;
      });      

      /**
       * checkStrMin
       */
      Handlebars.registerHelper("checkStrMin", function(item, systemData, options) {
         if (!systemData) systemData = options.data.root.systemData;
         let str = helperUtils.getChar(systemData, 'str');
         return str >= Number(item.system.strMin);
      });      
      
      /**
       * PenalByStrMin
       */
      Handlebars.registerHelper("PenalByStrMin", function(item, systemData, mult, options) {
         if (!systemData) systemData = options.data.root.systemData;
         let str = helperUtils.getChar(systemData, 'str');
         return str < Number(item.system.strMin) ? (Number(item.system.strMin) - str)*Number(mult) : 0;
      });    
      
      /**
       * ModsByInitiative
       */
      Handlebars.registerHelper("ModsByInitiative", function(item, options) {
         return ((item.system.initiative.first !== '' && item.system.initiative.first !== '+0') ||
                 (item.system.initiative.after !== '' && item.system.initiative.after !== '+0'));
      });  
      
      /**
       * ModsByAttackDefense
       */
      Handlebars.registerHelper("ModsByAttackDefense", function(item, options) {
         return ((item.system.skillMod !== '+0') ||
                 (item.system.skillModDefense !== '+0'));
      });  
      
      /**
       * ModsByArmor
       */
      Handlebars.registerHelper("ModsByArmor", function(item, options) {
         let bMod = false;
         if (!item.system || !item.system.armorMult) return;
         for (var s in item.system.armorMult) {
            if (!item.system.armorMult[s] || !item.system.armorMult[s]?.check) continue;
            bMod = true;
         }
         return bMod;
      });     
      
      /**
       * ModsByArmorTxt
       */
      Handlebars.registerHelper("ModsByArmorTxt", function(item, options) {
         let sMod = '';
         let armors = helperBackend.configArmors();
         for (var s in item.system.armorMult) {
            if (!item.system.armorMult[s] || !item.system.armorMult[s]?.check) continue;
            let armor = armors.armorTypes.find(e => e.key === s);
            sMod = sMod === '' ? armor.label + ' x' + item.system.armorMult[s].mult:
                   sMod + ', ' + armor.label + ' x' + item.system.armorMult[s].mult;
         }         
         return sMod
      }); 
      
      /**
       * isRangeWeapon
       */
      Handlebars.registerHelper("isRangeWeapon", function(item, options) {
         return item.system.rangearm || item.system.firearm;
      });       

/** ********************************************************************************************
 * LORE & CONTEXT...
 ******************************************************************************************** */

      Handlebars.registerHelper("loreText", function(key, entries, options) {
         if (!entries || entries.length === 0) return game.i18n.localize('common.noEntry');
         const entry = entries.find(e => e.system?.control.key === key
                                      || e.id === key);
         return entry ? entry.name : game.i18n.localize('common.noEntry');
      }); 

 /** ********************************************************************************************
 * MAGIC...
 ******************************************************************************************** */

       Handlebars.registerHelper("isS1", function(options) {
         return Number(options.data.root.systemData.type.system) === 1;
      }); 
      Handlebars.registerHelper("isS2", function(options) {
         return Number(options.data.root.systemData.type.system) === 2;
      });      
      
      Handlebars.registerHelper("maxSpellLevel", function(options) {
         return options.data.root.systemData.type.vis ? 7 :6;
      });      

      Handlebars.registerHelper("spellLevelText", function(options) {

         return options.data.root.systemData.type.vis ? 
                     game.i18n.localize('spell.vis'+options.data.root.systemData.level.toString()) :
                options.data.root.systemData.type.ordo ? 
                     game.i18n.localize('spell.ordo'+options.data.root.systemData.level.toString()) : '';
      });  
      
      Handlebars.registerHelper("bookName", function(sId, options) {
         return options.data.root.items.find(e => e._id === sId)?.name;
      });     
      
      Handlebars.registerHelper("spellShape", function(item, options) {
         return game.i18n.localize(CONFIG.ExtendConfig.magic.shape[item.system.properties.shape]?.label);
      });

/** ********************************************************************************************
 * OTHERS...
 ******************************************************************************************** */

      Handlebars.registerHelper("hasText", function(text, options) {
         return (text && text !== '');
      }); 

      Handlebars.registerHelper("tokenId", function(actor, options) {
         return actor.isToken ? actor.token.id : '';
      }); 

      Handlebars.registerHelper("addValue", function(baseValue, baseAdd, options) {
         try {
            return Number(baseValue) + Number(baseAdd);
         } catch(e) {
            //...
         }
         return 0;
      });      

      Handlebars.registerHelper("locationTxt", function(sKey, options) {
         let location = options.data.root.backArmor.locations.find(e => e.key === sKey);
         return location ? location.label : '';
      }); 

   }
};