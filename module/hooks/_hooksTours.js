import { mainUtils } from "../mainUtils.js";
import { mainBackend } from "../sheets/backend/mainBackend.js";
import { aqFirstSteps } from "../tours/_tourFirstSteps.js";

export class HookTours {

    /**
     * registerTours
     * @returns 
     */
    static async registerTours() {
        
        await game.tours.register("conventum", "firstSteps", new aqFirstSteps());
        
        this.initTours();
    }

    /**
     * initTours
     */
    static async initTours() {
        
        const firstSteps = await game.tours.get('conventum.firstSteps');
        if (firstSteps.status === 'unstarted') firstSteps.start();
    }

}

