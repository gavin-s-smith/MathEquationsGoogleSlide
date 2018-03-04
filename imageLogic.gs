function setImage(jsonImageData){
  var imageSlide = undefined;
  
  var imageProperties = getSpecificSavedProperties("imageProperties");
  
  var image = createImageFromBlob(jsonImageData["image"]);
  var slide = SlidesApp.getActivePresentation().getSelection().getCurrentPage();
  
  // if the equation was not linked
  if(jsonImageData["linkedMathEquation"] != ""){
    var imageObjectId = jsonImageData["linkedMathEquation"];
    if( imageObjectId == undefined)
      throw "image does not exist";
    else{
      imageObject = imageProperties[imageObjectId]
      if(imageObject == undefined)
        throw "image is not part of this extension"
        
      imageSlide = findImageSlide(imageObjectId)
      imageSlide.replace(image)
    }
  } // if the equation was linked
  else{
    Logger.log("New Image")
    imageSlide = slide.insertImage(image);
  }

  // in all cases update the meta data
  // THE OLD WAY
//  imageProperties[imageSlide.getObjectId()] = {
//    "equation": jsonImageData["mathEquation"],
//    "equationColor": jsonImageData["mathEquationColor"]
//  }
//  savePropertie("imageProperties", imageProperties)
  
  // THE NEW WAY
  var new_string = ' € ' + jsonImageData["mathEquation"] + ' € ' + jsonImageData["mathEquationColor"]
  
  imageSlide.setLinkUrl(new_string)
  
  // THE NEW NEW WAY
//  var requests = [{
//    updatePageElementAltText: {
//      objectId: imageSlide.getObjectId(),
//      title: jsonImageData["mathEquationColor"],
//      description: jsonImageData["mathEquation"],
//    }
// 
//  }];
//  // Execute the requests.
//  var batchUpdateResponse = Slides.Presentations.batchUpdate({
//    requests: requests
//  }, SlidesApp.getActivePresentation().getId());
// 
  
}

function createImageFromBlob(blob){
  return Utilities.newBlob(Utilities.base64Decode(blob), MimeType.PNG);  
}

function findImageSlide(imageObjectId){
  var slide = SlidesApp.getActivePresentation().getSelection().getCurrentPage();
  var allImage = slide.getImages();
  var imageSlide = undefined;
  for(var i = 0; i < allImage.length; i++){
    if(allImage[i].getObjectId() == imageObjectId){
      imageSlide = allImage[i]
    }
  }
  if(imageSlide == undefined){
    throw "couldn't find the id on this slide"
  }
  return imageSlide;
}

function getLinkedToImage(){ 
  var imageProperties = getSpecificSavedProperties("imageProperties");
  var selection = SlidesApp.getActivePresentation().getSelection();
  var selectionRange = selection.getPageElementRange();
 
  if(selectionRange == null)            
    throw "you need to select a image to reload the equation back into the text box"    
    
  var pageElements = selectionRange.getPageElements();
  
  if(pageElements.length <= 0)
    throw "please select a item"
  else if(pageElements.length >= 2)
    throw "can only select one item"
  var image = pageElements[0].asImage()
  
  //Loading THE OLD WAY
//  
//  var imageObjectFromImageProperties = imageProperties[image.getObjectId()]
//  if(imageObjectFromImageProperties == undefined)
//    throw "not a equation"
//  var color = "#000000"
//
//  if (imageObjectFromImageProperties["equationColor"] != undefined &&
//      imageObjectFromImageProperties["equationColor"] != null){
//    color = imageObjectFromImageProperties["equationColor"];
//  }
//  
//  var eqn = imageObjectFromImageProperties["equation"]
  //Loading THE NEW WAY
  
  var linktext = image.getLink().getUrl()
  var linkarray = linktext.split(" € ")
  if ( (linkarray.length < 2) || (linkarray.length > 3) ){
    throw "not a equation"
  }
  
  // if we do not have colour information for some reason
  if( linkarray.length == 2 ){
    color = "#000000"
  } else {
    color =  linkarray[2]
  }
  
  eqn = linkarray[1]

  return {
      "objectId": image.getObjectId(),
      "equation": eqn,
      "equationColor": color
  }
}


function deleteDeletedEquations(){
  var listSlides = SlidesApp.getActivePresentation().getSlides();
  var savedImagesDict = getSpecificSavedProperties("imageProperties");
  var savedImagesKeys = [];
  for (var key in savedImagesDict) {
    if (savedImagesDict.hasOwnProperty(key)) {
      savedImagesKeys.push(key);
    }
  }
  ///*
  listSlides.forEach(function(slide){
    var listImages = slide.getImages()
    listImages.forEach(function(image){
      savedImagesKeys = savedImagesKeys.filter(function(savedImageKey){
        return savedImageKey != image.getObjectId()
      });
    });
    
  });
  
  // Know savedImages equals all the keys that dont' have
  // a image in the presenttion
  // know go through and delete all the keys inside of savedImagesKeys
  Logger.log(savedImagesKeys)
  savedImagesKeys.forEach(function(key){
    if (savedImagesDict.hasOwnProperty(key)) {
      delete savedImagesDict[key];
    }
  });
  //*/
  Logger.log(savedImagesDict)
  savePropertie("imageProperties", savedImagesDict)
  //savePropertie("imageProperties", {})
}

function test(){
  Logger.log(getSpecificSavedProperties("imageProperties"))
}