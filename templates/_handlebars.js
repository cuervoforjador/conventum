export class mainHandlebars {

   /**
    * init
    * @param {*} Handlebars 
    */
   static init(Handlebars) {

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

         return (weaponData.combatSkill != '') ? 
                     systemData.skills[weaponData.combatSkill].value :
                (weaponData.secondSkill != '') ?
                     systemData.skills[weaponData.secondSkill].value :
                     '';
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

         return (firstEval && secondEval);
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

   }


};