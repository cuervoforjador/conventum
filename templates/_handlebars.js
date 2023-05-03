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
            return (oItem[property][sProperty]) ? 'checked' : '';
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
       * skillValue
       */
      Handlebars.registerHelper("skillValue", function(skill, options) {
         let actor = options.data.root.actor;
       });

   }


};