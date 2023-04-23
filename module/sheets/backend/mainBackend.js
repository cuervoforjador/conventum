/**
 * Compendium Backend...
 */

export class mainBackend {

    /**
     * Compendium Backend For Actors...
     */
    static async getBackendForActor(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            kingdoms: await this._getKingdoms(systemData.control.world),
            cultures: await this._getCultures(systemData.control.world)
        };
    }

    /**
     * Compendium Backend For Kingdom Items...
     */
    static async getBackendForKingdom() {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments()
        };
    }

    /**
     * _getKingdoms
     * @param {*} sWorld 
     */
    static async _getKingdoms(sWorld) {
        return this._getDocuments('kingdoms', sWorld);
    }

    /**
     * _getCultures
     * @param {*} sWorld 
     */
    static async _getCultures(sWorld) {
        return this._getDocuments('cultures', sWorld);
    }    

    /**
     * _getDocuments
     * @param {*} sWorld 
     */
    static async _getDocuments(sPack, sWorld) {
        if (!game.packs.get("conventum."+sPack)) return [];
        const mDocs = await game.packs.get("conventum."+sPack).getDocuments();
        if (!mDocs) return [];
        return mDocs.filter(e => e.system.control.world === sWorld);
    }      

}