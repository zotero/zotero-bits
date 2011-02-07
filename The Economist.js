{
        "translatorID":"6ec8008d-b206-4a4c-8d0a-8ef33807703b",
        "label":"The Economist",
        "creator":"Michael Berkowitz",
        "target":"^http://(www\\.)?economist\\.com/",
        "minVersion":"1.0.0b4.r5",
        "maxVersion":"",
        "priority":100,
        "inRepository":"1",
        "translatorType":4,
        "lastUpdated":"2011-02-05 18:26:24"
}

function detectWeb(doc, url) {
               return "magazineArticle";
}

function doWeb(doc, url) {
       var nsResolver = null;
Zotero.debug("Item url is:" + newItem.url);
Zotero.debug("Item txt is:" + doc.documentElement.textContent);
	var flyTitle = doc.evaluate('//div[@class="headline"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent; 
Zotero.debug("Item fly is:" + newItem.flyTitle);
}
