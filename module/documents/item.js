export default class newItem extends Item {

  /**
   * getRollData
   * @returns 
   */
  getRollData() {
    return this.toObject(false).system
  }
}