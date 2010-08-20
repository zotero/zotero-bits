{
  "translatorID":"caecaea0-5d06-11df-a08a-0800200c9a66",
  "translatorType":4,
  "label":"tagesanzeiger.ch",
  "creator":"simplex",
  "target":"^http://((www\\.)?tagesanzeiger\\.ch/.)",
  "minVersion":"2.0.2",
  "maxVersion":"",
  "priority":100,
  "inRepository":false,
  "lastUpdated":"2010-08-15 12:00:00"
}

function detectWeb(doc, url) {
  //Zotero.debug("simplex detectWeb URL= "+ url);
  var result = doc.evaluate('//div[@id = "singlePage"]/div[@id = "singleLeft"]/h2', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
  if (result) {
    return "newspaperArticle";
  }
  return null;
}

function doWeb(doc, url) {
  //Zotero.debug("simplex doWeb URL= "+ url);
  var newArticle = new Zotero.Item('newspaperArticle');
  newArticle.url = url;
  var publ = doc.evaluate('//div[@id = "singleLeft"]/p[@class = "publishedDate"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
  newArticle.title = doc.evaluate('//div[@id = "singleLeft"]/h2', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
  /*var metaLine = doc.evaluate('//div[@id = "singleLeft"]/div[@id = "metaLine"]/h5/a[1]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
  if (metaLine != null && metaLine.textContent.length > 0) {
    var name = metaLine.textContent;
    newArticle.creators.push(Zotero.Utilities.cleanAuthor(name, "author"));
  }*/
  var teaser = doc.evaluate('//div[@id = "singleLeft"]/p[@class = "teaser"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
  if (teaser != null) {
    newArticle.abstractNote = teaser.textContent;
  }
  newArticle.date = publ.split(/[:,] */)[1].trim();
  var publTitle = doc.evaluate('//div[@id = "singleLeft"]//span[@class = "idcode"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
  if (publTitle != null) {
    publTitle = publTitle.replace(/[\(\)]/gi, "") + " (tagesanzeiger.ch)";
  } else {
    publTitle = "tagesanzeiger.ch";
  }
  newArticle.publicationTitle = publTitle;
  newArticle.complete();
}