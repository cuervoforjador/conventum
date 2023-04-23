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
     * Compendium Backend For Society Items...
     */
    static async getBackendForSociety() {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments()
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
     * Compendium Backend For Language Items...
     */
    static async getBackendForLanguage() {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments()
        };
    }

    /**
     * Compendium Backend For Culture Items...
     */
    static async getBackendForCulture(systemData) {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments(),
            societies: await this._getSocieties(systemData.control.world), 
            kingdoms: await this._getKingdoms(systemData.control.world),
            languages: await this._getLanguages(systemData.control.world),
        };
    }

    /**
     * _getSocieties
     * @param {*} sWorld 
     */
    static async _getSocieties(sWorld) {
        return this._getDocuments('societies', sWorld);
    }

    /**
     * _getKingdoms
     * @param {*} sWorld 
     */
    static async _getKingdoms(sWorld) {
        return this._getDocuments('kingdoms', sWorld);
    }

    /**
     * _getLanguages
     * @param {*} sWorld 
     */
    static async _getLanguages(sWorld) {
        return this._getDocuments('languages', sWorld);
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
        let mReturn = mDocs.filter(e => e.system.control.world === sWorld);
        mReturn.sort((a, b) => {
            if (a.name.toUpperCase() < b.name.toUpperCase()) return -1;
            if (a.name.toUpperCase() > b.name.toUpperCase()) return 1;
            return 0;
        });
        return mReturn;

    }      

}