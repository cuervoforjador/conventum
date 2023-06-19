import { helperSheetMagic } from "../module/sheets/helpers/helperSheetMagic.js";
import { helperSheetHuman } from "../module/sheets/helpers/helperSheetHuman.js";
import { helperSheetCombat } from "../module/sheets/helpers/helperSheetCombat.js";

export class mainHandlebars {

   /**
    * init
    * @param {*} Handlebars 
    */
   static init(Handlebars) {

      Handlebars.registerHelper("editable", function(options) {
         return (options.data.root.imMaster) ? '' : 'disabled="disabled"';
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
        * itemType
        */
       Handlebars.registerHelper("itemType", function(item, sType, options) {
         return (item.type === sType);
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
       * getWeaponSkill
       */
      Handlebars.registerHelper("getWeaponSkill", function(weapon, options) {
         const systemData = options.data.root.data.system;
         const weaponData = weapon.system;

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
         const systemData = options.data.root.data.system;
         const weaponData = weapon.system;

         if (!actionGroup.showPoster) return false;
         if (!actionGroup.action) return false;
         const actionItem = actionGroup.action.system.item.weapon;
         const firstEval = actionItem.type[weapon.system.weaponType];

         const sSize = CONFIG.ExtendConfig.weaponSizes.find(e => e.id === weapon.system.size).property;
         const secondEval = actionItem.size[sSize];
         const thirdEval = ((weapon.system.inHands.inLeftHand) || 
                            (weapon.system.inHands.inRightHand) || 
                            (weapon.system.inHands.inBothHands));

         //Double attack!
         let doubleAttackEval = true;
         if (actionGroup.action.system.skill.doubleAttack) {

            //2 weapons in Hands...
            const mHandWeapons = options.data.root.data.items.filter(e => 
                                    (e.type === 'weapon') 
                                    && ((e.system.inHands.inLeftHand) || (e.system.inHands.inRightHand)) );
            if (mHandWeapons.length != 2) doubleAttackEval = false;

            //Min 1 small weapon...
            const smallWeapon = mHandWeapons.find(e => e.system.size === '01');
            if (!smallWeapon) doubleAttackEval = false;

            //Worst Skill value...
            if (mHandWeapons.length == 2) {
               let skill1 = eval( systemData.skills[mHandWeapons[0].system.combatSkill].value.toString() + '+' +
                                  helperSheetCombat.penalValue(systemData.skills[mHandWeapons[0].system.combatSkill].penal) + 
                                  helperSheetHuman.getHandPenal(options.data.root.data, mHandWeapons[0]) );
               let skill2 = eval( systemData.skills[mHandWeapons[1].system.combatSkill].value.toString() + '+' +
                                  helperSheetCombat.penalValue(systemData.skills[mHandWeapons[1].system.combatSkill].penal) + 
                                  helperSheetHuman.getHandPenal(options.data.root.data, mHandWeapons[1]) );

               if (skill1 >= skill2) 
                  doubleAttackEval = (weapon._id === mHandWeapons[0]._id);
               else
                  doubleAttackEval = (weapon._id === mHandWeapons[1]._id);
            }
         }

         return (firstEval && secondEval && thirdEval && doubleAttackEval);
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
      Handlebars.registerHelper("getActorProperty", function(actorId, sProperty, options) {
         let oProperty = game.actors.get(actorId);
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
      Handlebars.registerHelper("getActorItemProperty", function(actorId, itemId, sProperty, options) {
         let oActor = game.actors.get(actorId);
         if (!oActor) return;

         let oProperty = oActor.items.get(itemId);
         if (!oProperty) return;
         
         sProperty.split('.').forEach(s => {
            oProperty = oProperty[s];
         })
         return oProperty;
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
       * modeVisible
       */
      Handlebars.registerHelper("modeVisible", function(mode, options) {
         const systemData = options.data.root.systemData;
         if (systemData.modes.find(e => e === mode.id)) return true;
                                                   else return game.user.isGM;
       });

      /**
       * modeStickers
       */
      Handlebars.registerHelper("modeStickers", function(mode, options) {
         const systemData = options.data.root.systemData;
         if (systemData.modes.find(e => e === mode.id)) return true;
                                                   else return false;
       });

      /**
       * modeClassActive
       */
      Handlebars.registerHelper("modeClassActive", function(mode, options) {
         const systemData = options.data.root.systemData;
         if (systemData.modes.find(e => e === mode.id)) return '_active';
                                                   else return '_inactive';
       });

      /**
       * imLucky??
       */
      Handlebars.registerHelper("imLucky", function(options) {
         const systemData = options.data.root.systemData;
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