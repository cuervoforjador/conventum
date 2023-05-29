export const preloadTemplates = async function() {
  
  return loadTemplates({
      humanFrame: CONFIG._root+"/templates/fragments/humanFrame.html",
      humanCrest: CONFIG._root+"/templates/fragments/humanCrest.html",
      humanPageMain: CONFIG._root+"/templates/fragments/humanPageMain.html",
      humanPageBio: CONFIG._root+"/templates/fragments/humanPageBio.html",
      humanPageSkills: CONFIG._root+"/templates/fragments/humanPageSkills.html",
      humanPageCombat: CONFIG._root+"/templates/fragments/humanPageCombat.html",
      humanPageArmor: CONFIG._root+"/templates/fragments/humanPageArmor.html",
      humanPageItems: CONFIG._root+"/templates/fragments/humanPageItems.html",
      humanPosterActions: CONFIG._root+"/templates/fragments/humanPosterActions.html",
      humanPosterTargets: CONFIG._root+"/templates/fragments/humanPosterTargets.html",
      humanHeader: CONFIG._root+"/templates/fragments/humanHeader.html",
      humanCharPrimary: CONFIG._root+"/templates/fragments/humanCharPrimary.html",
      humanCharSecondary: CONFIG._root+"/templates/fragments/humanCharSecondary.html",
      humanCharRational: CONFIG._root+"/templates/fragments/humanCharRational.html",
      humanBio: CONFIG._root+"/templates/fragments/humanBio.html",
      humanBioDescription: CONFIG._root+"/templates/fragments/humanBioDescription.html",
      humanBioBackground: CONFIG._root+"/templates/fragments/humanBioBackground.html",
      humanBioTraits: CONFIG._root+"/templates/fragments/humanBioTraits.html",
      humanLanguages: CONFIG._root+"/templates/fragments/humanLanguages.html",
      
      itemFrame: CONFIG._root+"/templates/fragments/itemFrame.html",
      itemDescription: CONFIG._root+"/templates/fragments/itemDescription.html",
      itemExtendCultures: CONFIG._root+"/templates/fragments/itemExtendCultures.html",
      itemExtendLanguages: CONFIG._root+"/templates/fragments/itemExtendLanguages.html",
      itemExtendSkill: CONFIG._root+"/templates/fragments/itemExtendSkill.html",
      itemExtendArmor: CONFIG._root+"/templates/fragments/itemExtendArmor.html",
      itemExtendWeapon: CONFIG._root+"/templates/fragments/itemExtendWeapon.html",
      itemExtendAction: CONFIG._root+"/templates/fragments/itemExtendAction.html"

  });
};