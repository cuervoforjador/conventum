import { SYSTEM_ID, SYSTEM_NAME, SYSTEM_ASCII } from "../config/uiConstants.js"

export default class helperInitialization {

    /**
     * loader
     */
    static loader() {

        //Initialization texts...
        console.log(SYSTEM_ASCII)
        console.log(`${SYSTEM_ID} | Initializing ${SYSTEM_NAME} system`)

        //Logo...
        const GamePause = foundry.applications.hud?.GamePause ?? globalThis.GamePause
        if (GamePause) {
            const _origCtx = GamePause.prototype._prepareContext
            GamePause.prototype._prepareContext = async function(options) {
            const ctx = await _origCtx.call(this, options)
            ctx.icon = "systems/"+SYSTEM_ID+"/assets/ui/systemLogo.png"
            ctx.spin = true
            return ctx
            }
        }

    }

    /**
     * config
     */
    static config() {
        CONFIG.Combat.initiative = { formula: "@combat.initiative", decimals: 0 }
    }

}