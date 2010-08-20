{
  "translatorID":"4f0d0c90-5da0-11df-a08a-0800200c9a66",
  "translatorType":4,
  "label":"FAZ.NET",
  "creator":"simplex",
  "target":"^http://((www\\.)?faz\\.net/.)",
  "minVersion":"2.0.2",
  "maxVersion":"",
  "priority":100,
  "inRepository":false,
  "lastUpdated":"2010-08-15 12:00:00"
}

function detectWeb(doc, url) {
  //Zotero.debug("simplex detectWeb URL= "+ url);
  var result = doc.evaluate('//div[@class = "Article"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
  if (result) {
    return "newspaperArticle";
  }
  return null;
}

function doWeb(doc, url) {
  //Zotero.debug("simplex doWeb URL= "+ url);
  var newArticle = new Zotero.Item('newspaperArticle');
  newArticle.url = url;
  newArticle.title = doc.evaluate('//div[@class = "Article"]/h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
  var subtitle = doc.evaluate('//div[@class = "Article"]/h2', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
  if (subtitle != null) {
    newArticle.shortTitle = subtitle.textContent;
  }
  var teaser = doc.evaluate('//div[@class = "Article"]/h4', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
  if (teaser != null) {
    newArticle.abstractNote = teaser.textContent;
  }
  /*var author = doc.evaluate('//div[@class = "Article"]/p[@class = "Author"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
  if (author != null) {
    //omit "Von "
    var name = author.textContent;
    if (name.match(/^Von /) != null) {
      name = name.substr(4);
    }
    Zotero.debug("simplex author name = "+ name);
    newArticle.creators.push(Zotero.Utilities.cleanAuthor(name, "author"));
  }*/
  newArticle.date = doc.evaluate('//div[@class = "Article"]/span[@class = "Italic"][1]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent
  newArticle.publicationTitle = "FAZ.NET";
  newArticle.complete();
}