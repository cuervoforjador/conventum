import { helperSheetMagic } from "../module/sheets/helpers/helperSheetMagic.js";
import { helperSheetHuman } from "../module/sheets/helpers/helperSheetHuman.js";
import { helperSheetCombat } from "../module/sheets/helpers/helperSheetCombat.js";
import { aqCombat } from "../module/actions/aqCombat.js";
import { aqContext } from "../module/actions/aqContext.js";
import { aqActions } from "../module/actions/aqActions.js";

export class mainHandlebars {

   /**
    * init
    * @param {*} Handlebars 
    */
   static init(Handlebars) {

      /**
       * editable
       */
      Handlebars.registerHelper("editable", function(options) {
         return (options.data.root.imMaster) ? '' : 'disabled="disabled"';
      }); 

      /**
       * wizardStep
       */
      Handlebars.registerHelper("wizardStep", function(key, options) {
         return 'humanWizard' + key;
      });

      /**
       * wizardVisible
       */
      Handlebars.registerHelper("wizardVisible", function(key, options) {
         const root = options.data.root.data.system.wizard;
         return root[key];
      });      

      /**
       * frameUrl
       */
      Handlebars.registerHelper("frameUrl", function(options) {
            return CONFIG._root + '/image/frame/' + 
                     this.actor.getRollData().control.frame;         
      });

      /**
       * standardFrameUrl
       */
      Handlebars.registerHelper("standardFrameUrl", function(options) {
         return CONFIG._root + '/image/frame/standard';      
      });

      /**
       * itemProperty
       */
      Handlebars.registerHelper("itemProperty", function(sRootPath, property, options) {
         
         let oItem = (sRootPath.split('.')[0] === 'systemData') ? 
                                                      options.data.root :
                                                      options.data.root.data;
         sRootPath.split('.').forEach( s => {
            oItem = oItem[s]; });
         return oItem[property];
       });

      /**
       * itemPropertyExtend
       */
      Handlebars.registerHelper("itemPropertyExtend", function(sRootPath, property, sProperty, options) {
         
         let oItem = (sRootPath.split('.')[0] === 'systemData') ? 
                                                      options.data.root :
                                                      options.data.root.data;
         sRootPath.split('.').forEach( s => {
            oItem = oItem[s]; });
         return oItem[property] ? oItem[property][sProperty] : '';
       });    
       
       /**
        * configTxt
        */
       Handlebars.registerHelper("configTxt", function(sType, sId, options) {
         let s18 = CONFIG.ExtendConfig[sType].find(e => e.id === sId);
         return game.i18n.localize(s18.name);
       }); 

       /**
        * isNotEmpty
        */
       Handlebars.registerHelper("isNotEmpty", function(string, options) {
         return ((string !== '') && (string !== undefined));
       }); 

       /**
        * itemType
        */
       Handlebars.registerHelper("itemType", function(item, sType, options) {
         return (item.type === sType);
       }); 

       /**
        * noEmpty
        */
       Handlebars.registerHelper("noEmpty", function(mArray, options) {
         return (mArray.length > 0);
       });        

      /**
       * checkedExtend
       */
      Handlebars.registerHelper("checkedExtend", function(sRootPath, property, sProperty, options) {
         
         let oItem = (sRootPath.split('.')[0] === 'systemData') ? 
                                                      options.data.root :
                                                      options.data.root.data;
         sRootPath.split('.').forEach( s => {
            oItem = oItem[s]; });
         if (sProperty === '')
            return (oItem[property]) ? 'checked' : '';
         else
            return (oItem && oItem[property] && oItem[property][sProperty]) ? 'checked' : '';
       });        

      /**
       * localizeExtend
       */
      Handlebars.registerHelper("localizeExtend", function(sPrev, sField, sPost, options) {
         return game.i18n.localize(sPrev + sField + sPost);
       });   

      /**
       * shortDescription
       */
      Handlebars.registerHelper("shortDescription", function(sText, options) {
         return sText.split('</p>')[0]
                     .replace('<p>','')
                     .replace('<br>','')
                     .replace('<strong>','')
                     .replace('</strong>','');

       });        

      /**
       * evalCharPenal
       */
      Handlebars.registerHelper("evalCharPenal", function(char, options) {
         return (Number(char.penal) !== 0);
       });

      /**
       * alphaExperiencedSkill
       */
      Handlebars.registerHelper("alphaExperiencedSkill", function(skillID, options) {
         if ((!options.data.root.data.system.skills[skillID]) || 
             (!options.data.root.data.system.skills[skillID].experienced)) 
               return (options.data.root.data.system.control.listSkills) ?
                  "opacity: 0.3" : "opacity: 0";


         if (options.data.root.data.system.control.listSkills) {
            if (options.data.root.data.system.skills[skillID].experienced)
               return "opacity: 1";
            else
               return "opacity: 0.3";
         } else {
            if (options.data.root.data.system.skills[skillID].experienced)
               return "opacity: 0.7";
            else
               return "opacity: 0";
         }
       });

      /**
       * getWeaponSkill
       */
      Handlebars.registerHelper("getWeaponSkill", function(weapon, options) {
         const systemData = options.data.root.data.system;
         const weaponData = weapon.system;
         const action = (options.data.root.actions.action) ? 
                           options.data.root.actions.action.system : null;
         if (action) {
            let auxContext = new aqContext({actorId: options.data.root.data._id, 
                                            tokenId: '',
                                            weaponId: weapon._id,
                                            simulate: true});

            auxContext.prepareContext(true);
            return auxContext._percent;

            /**
            if (action.skill.skillAsCombat) {
               if ( (action.item.weapon.type[weaponData.weaponType]) &&
                    (action.item.weapon.size[
                        CONFIG.ExtendConfig.weaponSizes.find(e => e.id === weaponData.size).property]) )

                  return systemData.skills[action.skill.skill].value;
            }  
            */ 
         }

         if (weaponData.combatSkill != '') {
            if (systemData.skills[weaponData.combatSkill])
               return systemData.skills[weaponData.combatSkill].value;
         }
         if (weaponData.secondSkill != '') {
            if (systemData.skills[weaponData.secondSkill])
               return systemData.skills[weaponData.secondSkill].value;
         }         
         return '';
       });

      /**
       * evalActionWeapon
       */
      Handlebars.registerHelper("evalActionWeapon", function(actionGroup, weapon, options) {

         if (!actionGroup.showPoster) return false;
         if (!actionGroup.action) return false;      
         if (options.data.root.data.system.control.criature) return true;   

         const action = actionGroup.action;
         const actor = options.data.root.data;

         return aqCombat.checkActionWeapon(action, weapon, actor).check;

       });       

      /**
       * getDamageMod
       */
      Handlebars.registerHelper("getDamageMod", function(weapon, options) {
         const actor = options.data.root.data;
         const sMod = helperSheetHuman.calcDamageMod(actor, weapon);
         if (sMod !== '') return '(' + sMod + ')';
         else return '';
       });

      /**
       * isDamageMod
       */
      Handlebars.registerHelper("isDamageMod", function(weapon, options) {
         const actor = options.data.root.data;
         const sMod = helperSheetHuman.calcDamageMod(actor, weapon);
         return (sMod !== '');
       });

      /**
       * spellValue
       */
      Handlebars.registerHelper("spellValue", function(item, sType, options) {
         const systemData = options.data.root.data.system;
         return helperSheetMagic.magicSkillValue(systemData, item);
       }); 

      /**
       * locationValue
       */
      Handlebars.registerHelper("locationValue", function(locationId, sValue, options) {
         const location = options.data.root.backend.locations.find(e => e.id === locationId);
         const systemData = options.data.root.data.system;
         const armorData = (systemData.armor) ? systemData.armor[locationId] : null;
         if (sValue === 'img') return '';
         if (sValue === 'name') return location.name;
         if ( (sValue === 'total') ||
              (sValue === 'value') ||
              (sValue === 'protection') )
                  return (armorData) ? armorData[sValue] : '';
       });       

      /**
       * modeValue
       */
      Handlebars.registerHelper("modeValue", function(modeId, sValue, options) {
         const mode = options.data.root.backend.modes.find(e => e.id === modeId);
         const systemData = options.data.root.data.system;
         if (sValue === 'img') return '';
         if (sValue === 'name') return mode.name;
       }); 

      /**
       * armorValue
       */
      Handlebars.registerHelper("armorValue", function(sLocation, sProperty, options) {
         const systemData = options.data.root.systemData;
         return ( systemData.armor && systemData.armor[sLocation] &&
                  systemData.armor[sLocation][sProperty] ) ?
                     systemData.armor[sLocation][sProperty] :
                     '';
       });

      /**
       * getActorProperty
       */
      Handlebars.registerHelper("getActorProperty", function(actorId, tokenId, sProperty, options) {
         let oProperty = (tokenId) ? game.scenes.active.tokens.get(tokenId).getActor() :
                         game.actors.get(actorId); 

         if (!oProperty) return;
         
         sProperty.split('.').forEach(s => {
            oProperty = oProperty[s];
         })
         return oProperty;
       });       

      /**
       * getActorMountImage
       */
      Handlebars.registerHelper("getActorMountImage", function(options) {
         const systemData = options.data.root.systemData;
         const mount = game.actors.get(systemData.equipment.mount);
         if (!mount) return "/systems/conventum/image/texture/locationHorse.png";
         return mount.img;
       });         

      /**
       * getItemProperty
       */
      Handlebars.registerHelper("getActorItemProperty", function(actorId, tokenId, itemId, sProperty, options) {
         let oActor = (tokenId) ? game.scenes.active.tokens.get(tokenId).getActor() :
                                  game.actors.get(actorId);          
         if (!oActor) return;

         let oProperty = oActor.items.get(itemId);
         if (!oProperty) return;
         
         sProperty.split('.').forEach(s => {
            oProperty = oProperty[s];
         })
         return oProperty;
       });       

      /**
       * getActionType
       */
      Handlebars.registerHelper("getActionType", function(actorId, tokenId, itemId, options) {
         let oActor = (tokenId) ? game.scenes.active.tokens.get(tokenId).getActor() :
                                  game.actors.get(actorId);          
         if (!oActor) return;

         let oAction = oActor.items.get(itemId);
         if (!oAction) return;
         
         if (oAction.system.type.attack) 
            return game.i18n.localize("common.attack");
         if (oAction.system.type.defense) 
            return game.i18n.localize("common.defense");
         if (oAction.system.type.movement) 
            return game.i18n.localize("common.movement");   
         if (oAction.system.type.spell) 
            return game.i18n.localize("common.spell");   
         return '';
       }); 

      /**
       * getActionTarget
       */
      Handlebars.registerHelper("getActionTarget", function(uniqeId, sField, options) {
         const actor = aqActions.actorFromUniqeId(uniqeId);
         return actor[sField];
      });

      /**
       * rightHanded...
       */
      Handlebars.registerHelper("rightHanded", function(options) {
         const systemData = options.data.root.systemData;
         
         return (systemData.status.rightHanded === true);
       });    

      /**
       * No Skills...
       */
      Handlebars.registerHelper("bNoSkills", function(mArray, options) {
         const systemData = options.data.root.systemData;
         let bNoItems = true

         mArray.map(e => {
            if (systemData.skills[e.id].acquired) bNoItems = false;
         });
         return bNoItems;
       });        

      /**
       * No Weapons...
       */
      Handlebars.registerHelper("bNoWeapons", function(mArray, options) {
         let bNoItems = true
         if (options.data.root.items.find(e => e.type === 'weapon')) bNoItems = false;
         return bNoItems;
       });   
       
      /**
       * counted
       */
      Handlebars.registerHelper("counted", function(type, options) {
         const actor = options.data.root;
         return (actor.items.filter(e => e.type === type).length > 0);
       });

      /**
       * modeVisible
       */
      Handlebars.registerHelper("modeVisible", function(mode, options) {
         const systemData = options.data.root.systemData;
         if (!systemData.modes.length) return game.user.isGM;
         if (systemData.modes.find(e => e === mode.id)) return true;
                                                   else return game.user.isGM;
       });

      /**
       * modeStickers
       */
      Handlebars.registerHelper("modeStickers", function(mode, options) {
         const systemData = options.data.root.systemData;
         if (!systemData.modes.length) return false;
         if (systemData.modes.find(e => e === mode.id)) return true;
                                                   else return false;
       });

      /**
       * modeClassActive
       */
      Handlebars.registerHelper("modeClassActive", function(mode, options) {
         const systemData = options.data.root.systemData;
         if (!systemData.modes.length) return '_inactive';
         if (systemData.modes.find(e => e === mode.id)) return '_active';
                                                   else return '_inactive';
       });

      /**
       * imLucky??
       */
      Handlebars.registerHelper("imLucky", function(options) {
         const systemData = options.data.root.systemData;
         if (!systemData.modes.length) return false;

         const mModes = Array.from(game.packs.get("conventum.modes"))
                                 .filter(e => e.system.control.world === systemData.control.world );
         let bLucky = false;
         mModes.map(mode => {
            if (systemData.modes.find(e => e === mode.id))
               bLucky = bLucky || (mode.system.luck);
         });
         return bLucky;

       });

      /**
       * luckImage
       */
      Handlebars.registerHelper("luckImage", function(options) {
         const systemData = options.data.root.systemData;
         const luckyMode = 
                  Array.from(game.packs.get("conventum.modes"))
                                 .find(e => ( (e.system.control.world === systemData.control.world)
                                             && (e.system.luck) ) );
         return luckyMode.img;

       });       

   }


};