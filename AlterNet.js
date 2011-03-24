{
        "translatorID":"ea531652-cdeb-4ec2-940e-627d4b107263",
        "label":"AlterNet",
        "creator":"Jesse Johnson",
        "target":"^http://(?:www\\.)alternet.org",
        "minVersion":"1.0.0b4.r1",
        "maxVersion":"",
        "priority":100,
        "inRepository":"1",
        "translatorType":4,
        "lastUpdated":"2011-01-24 14:33:39"
}

/*
    Alternet - translator for Zotero
    Copyright (C) 2011 Jesse Johnson

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function evaluate (doc, xpath) {
	return doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
}

function detectWeb (doc, url) {
	// identifies blogs based on 'blogs.alternet' being contained in the URL
	var urlString = url.toString();
	Zotero.Utilities.trimInternal(urlString);
	
	// identifies articles based on a meta tag with name="title"
	var xpath = '//meta[@name="title"]/@content';
	var title = evaluate(doc, xpath);
	
	// Blogs
	if (urlString.search('blogs.alternet') != -1) {
		//TODO support blog posts
		//return "blogPost";
		return null;
	}
	// Articles
	else if (title) {
		return "magazineArticle";
	}
	else {
		return null;
	}
}

/** 
  Data is scraped from meta tags, except for the publication date
  which still must be gleamed from the page body.
**/
function scrapeArticle (doc, url) {
	var magArticle = new Zotero.Item("magazineArticle");
	
	// general scraping variables
	var xpath;
	
	// title
	xpath = '//meta[@name="title"]/@content';
	var title = evaluate(doc, xpath);
	magArticle.title = title.textContent;
	
	// author
	xpath = '//meta[@name="author"]/@content';
	var authors = evaluate(doc, xpath).textContent.split(",");
	for each (var author in authors) {
		magArticle.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
	}
	
	// date
	xpath = '//div[@class="story-date"]/em';
	var date = Zotero.Utilities.strToDate(evaluate(doc, xpath).textContent);
	date.month += 1;
	if (date.day < 10)
		date.day = "0" + date.day;
	if (date.month < 10)
		date.month = "0" + date.month;
	magArticle.date = date.year + "-" + date.month + "-" + date.day;
	//TODO when strToDate works properly, use strToISO
	
	// source
	xpath = '//meta[@name="source"]/@content';
	var source = "Source of article: " + evaluate(doc, xpath).textContent;
	magArticle.notes.push({note:source});
	
	// abstract
	xpath = '//meta[@name="description"]/@content';
	var abstract = evaluate(doc, xpath).textContent;
	magArticle.abstract = Zotero.Utilities.trim(abstract);
	
	// article snapshot
	xpath = '//div[@class="story_tools_print"]/a/@href';
	var snapshotURL = "http://www.alternet.org" + evaluate(doc, xpath).textContent;
	magArticle.attachments.push({url:snapshotURL, title:"AlterNet Article Snapshot", mimeType:"text/html"});
	
	// tags (a.k.a. keywords)
	xpath = '//meta[@name="keywords"]/@content';
	var tags = evaluate(doc, xpath).textContent.split(",");
	for each (var tag in tags) {
		magArticle.tags.push(Zotero.Utilities.trim(tag));
	}
	
	// other
	magArticle.publicationTitle = "AlterNet";
	magArticle.libraryCatalog = "alternet.org";
	magArticle.url = url;
	
	magArticle.complete();
}

function doWeb (doc, url) {	
      scrapeArticle(doc, url);
      return null;
}
