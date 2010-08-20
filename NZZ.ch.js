{
  "translatorID":"61ffe600-55e0-11df-bed9-0002a5d5c51b",
  "translatorType":4,
  "label":"nzz.ch",
  "creator":"simplex",
  "target":"^http://((www\\.)?nzz\\.ch/.)",
  "minVersion":"2.0.2",
  "maxVersion":"",
  "priority":100,
  "inRepository":false,
  "lastUpdated":"2010-08-15 12:00:00"
}

function detectWeb(doc, url) {
  //Zotero.debug("simplex detectWeb URL= "+ url);
  var result = doc.evaluate('//li[@id = "article"]/div[@class = "article"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
  if (result) {
    return "newspaperArticle";
  }
  return null;
}

function doWeb(doc, url) {
  //Zotero.debug("simplex doWeb URL= "+ url);
  var newArticle = new Zotero.Item('newspaperArticle');
  newArticle.ISSN = "0376-6829";
  newArticle.url = url;
  newArticle.title = doc.evaluate('//li[@id = "article"]/div[@class = "article"]/div[@class = "header"]//h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
  var subtitle = doc.evaluate('//li[@id = "article"]/div[@class = "article"]/div[@class = "header"]//h2', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
  if (subtitle != null) {
    newArticle.shortTitle = subtitle.textContent;
  }
  var teaser = doc.evaluate('//li[@id = "article"]/div[@class = "article"]//div[@class = "body"]/h5', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
  if (teaser != null) {
    newArticle.abstractNote = teaser.textContent;
  }
  var publ = doc.evaluate('//li[@id = "article"]/div[@class = "article"]/div[@class = "header"]/div[@class = "pubication"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
  var publar = publ.split(',');
  newArticle.date = publar[0];
  newArticle.publicationTitle = publar[publar.length - 1].trim();
  //set a publication title if there is only a number (date)
  if (newArticle.publicationTitle.match(/^\d/) != null) {
    newArticle.publicationTitle = "NZZ";
  }
  newArticle.complete();
}