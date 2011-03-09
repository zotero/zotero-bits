{
	"translatorID":"83979786-44af-494a-9ddb-46654e0486ef",
	"translatorType":4,
	"label":"Reuters",
	"creator":"Michael Berkowitz",
	"target":"^https?://(www\\.)?reuters\\.com/",
	"minVersion":"1.0.0b4.r5",
	"maxVersion":"",
	"priority":100,
	"inRepository":true,
	"lastUpdated":"2008-07-07 14:50:00"
}

function detectWeb(doc, url) {
	if (url.match(/^https?:\/\/(www\.)?reuters\.com\/article/)) {
		return "newspaperArticle";
	}	
}

function doWeb(doc, url) {
	var item = new Zotero.Item("newspaperArticle");

	item.title = doc.evaluate('//meta[@property="og:title"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().content;
	item.date = doc.evaluate('//meta[@name="REVISION_DATE"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().content;
	item.place = doc.evaluate('//div[@id="articleInfo"]//span[@class="location"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	var byline = doc.evaluate('//div[@id="articleInfo"]//p[@class="byline"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	if (byline.match(/^By/)) {
		var authors = byline.substr(3).split(',');
		for each (var aut in authors) {
			item.creators.push(Zotero.Utilities.cleanAuthor(aut, "author"));
		}
	} else {
		item.creators.push(Zotero.Utilities.cleanAuthor(byline, "author"));
	}
	item.abstractNote = doc.evaluate('//span[@class="focusParagraph"]/p', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.replace(/^.*\(Reuters\)\s+-\s+/,"");
	item.url = doc.evaluate('//link[@rel="canonical"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().href;
	item.publicationTitle = "Reuters";
	
	item.complete();
}
