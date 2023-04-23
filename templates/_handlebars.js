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
       * standardFrameUrl
       */
      Handlebars.registerHelper("itemProperty", function(sRootPath, property, options) {
         
         let oItem = options.data.root.data;
         sRootPath.split('.').forEach( s => {
            oItem = oItem[s]; });

         return oItem[property];
       });

   }


};