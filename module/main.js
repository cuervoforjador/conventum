import { extendConfig } from "./config/config.js";
import { mainConfig } from "./config/mainConfig.js";
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

  CONFIG._root = [...game.system.esmodules][0].split('/module')[0];
  CONFIG.ExtendConfig = mainConfig.init(extendConfig);
  //CONFIG.debug.applications = true;
  //CONFIG.debug.hooks = true;
  CONFIG.Combat.initiative.formula = '1D10';
  CONFIG.Combat.initiative.decimals = 0;

  //Game...
  game[game.system.id] = {
    useEntity: foundry.utils.isNewerVersion("12", game.version ?? game.data.version)
  };

  //System settings configuration
  mainSettings.init();

  //Registering & templates...
  mainGameSheets.registerSheets(Actors, Items);
  mainHandlebars.init(Handlebars);
  await preloadTemplates();

  //Hooks...
  mainHooks.init(Hooks);

});

