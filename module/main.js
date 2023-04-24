import { extendConfig } from "./config/config.js";
<<<<<<< HEAD
=======
import { mainConfig } from "./config/mainConfig.js";
>>>>>>> 48ae91f0c39a0c8e5746703da684780f1db7deaf
import { mainMacros } from "./macros/mainMacros.js";
import { mainSettings } from "./gameSettings/mainSettings.js";
import { mainGameSheets } from "./sheets/sheets.js";
import { mainHandlebars } from "../templates/_handlebars.js";
import { mainHooks } from "./hooks/hooks.js";
import { preloadTemplates } from "../templates/_templates.js";

/** ****************************************************************************************************
 * Hook Init
 **************************************************************************************************** */
Hooks.once("init", async function() {
  
  //Logging... 
  console.log(extendConfig.log.initializing, 
              extendConfig.log.style);           

  //Configuration...
  CONFIG.Combat.initiative = {
    formula: "1d10",
    decimals: 0
  };

  CONFIG._root = [...game.system.esmodules][0].split('/module')[0];
<<<<<<< HEAD
  CONFIG.ExtendConfig = extendConfig;
=======
  CONFIG.ExtendConfig = mainConfig.init(extendConfig);
>>>>>>> 48ae91f0c39a0c8e5746703da684780f1db7deaf
  CONFIG.debug.hooks = true;

  //Game...
  game[game.system.id] = {
    mainMacros,
    useEntity: foundry.utils.isNewerVersion("10", game.version ?? game.data.version)
  };

  //System settings configuration
  mainSettings.init();

  //Sheets & templates...
  mainGameSheets.registerSheets(Actors, Items);
  mainHandlebars.init(Handlebars);
  await preloadTemplates();

  //Hooks...
  mainHooks.init(Hooks);  

});

