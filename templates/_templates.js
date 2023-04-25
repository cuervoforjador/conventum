export const preloadTemplates = async function() {
  
  return loadTemplates({
      humanFrame: CONFIG._root+"/templates/fragments/humanFrame.html",
      humanCrest: CONFIG._root+"/templates/fragments/humanCrest.html",
      humanPageMain: CONFIG._root+"/templates/fragments/humanPageMain.html",
      humanPageBio: CONFIG._root+"/templates/fragments/humanPageBio.html",
      humanPageSkills: CONFIG._root+"/templates/fragments/humanPageSkills.html",
      humanPageCombat: CONFIG._root+"/templates/fragments/humanPageCombat.html",
      humanPageItems: CONFIG._root+"/templates/fragments/humanPageItems.html",
      humanHeader: CONFIG._root+"/templates/fragments/humanHeader.html",
      
      itemFrame: CONFIG._root+"/templates/fragments/itemFrame.html",
      itemDescription: CONFIG._root+"/templates/fragments/itemDescription.html",
      itemExtendLanguages: CONFIG._root+"/templates/fragments/itemExtendLanguages.html",
      itemExtendSkill: CONFIG._root+"/templates/fragments/itemExtendSkill.html",

  });
};