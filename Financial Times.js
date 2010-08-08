{
	"translatorID":"f4fe1bae-347d-49c8-9354-e55e0af11b8a",
	"translatorType":4,
	"label":"Financial Times",
	"creator":"Patrick Flaherty",
	"target":"^http://(.*\.)?ft.com/",
	"minVersion":"1.0",
	"maxVersion":"",
	"priority":100,
	"inRepository":true,
	"lastUpdated":"2010-5-20 20:10:00"
}
//
function detectWeb(doc, url) {
	if (url.match(/cms/)) {
		return "newspaperArticle";
	}	
	if (url.match(/blogs/)) {
		return "blogPost";
	}	
	if (url.match(/ftalphaville/)) {
		return "blogPost";
	}	
}

function scrape(doc, url) 
{
var url = doc.location.href;	
var namespace = doc.documentElement.namespaceURI;
//figuare out why type of content the page is
  if (url.match(/cms/)) 
  {
    var fttype="article";
    var itemtype= "newspaperArticle";
	}	
  else if (url.match(/blogs/)) 
  {
    var fttype="blog";
		var itemtype = "blogPost";
	}	
  else if (url.match(/ftalphaville/)) 
  {
    var fttype="alphaville";
    var itemtype = "blogPost";
	}	
  else 
  {
    var itemtype= "newspaperArticle";
	}	
//All articles
var newItem = new Zotero.Item(itemtype);	
var nsResolver = namespace ? function(prefix) {
if (prefix == 'x') return namespace; else return null;
} : null; 

newItem.publicationTitle = "Financial Times";
newItem.attachments.push({url:url, title:"Financial Times Snapshot",	 mimeType:"text/html"});
newItem.title = "No Title Found";
//blog posts
if (itemtype=="blogPost"){
	
  if (fttype=="blog")
  {
    var xpathlocation ='//div/h3[@class="entry_header smalltoppad"]';
    var authorpathlocation ='//span[@class="author_title"]';	
    var datepathlocation ='//span[@class="topdate"]';
    var dates=doc.evaluate(datepathlocation,doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;

    Zotero.debug(dates);
    newItem.date = dates;
  }
  else if (fttype=="alphaville")
  {
    var xpathlocation ='/html/body/div[3]/div/div[2]/div/h2';
    var authorpathlocation ='//span[@class="byline"]/strong/a';	
    var datepathlocation ='//span[@class="topdate"]';
  }
  else 
  { 
    Zotero.debug("error in blog post type");
  }
	
	myXPathObject=doc.evaluate(xpathlocation,doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	newItem.title =myXPathObject;

//authors 
  var authors=doc.evaluate(authorpathlocation,doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;

  if (authors) 
  {
    var author =  authors;
    var author =author.replace(/by /, "");
    newItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
  }             
}
else
{
//For regular FT articles

	var xpathlocation ='//div[@class="ft-story-header"]/h1';
	myXPathObject=doc.evaluate(xpathlocation,doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	newItem.title =myXPathObject;
	var metaTags = new Object();
	//authors Need to remove dateline and and from list of authors
	var pathlocation ='//div[@class="ft-story-header"]/p[1]';
	var authors=doc.evaluate(pathlocation,doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
  
  if ( authors) 
  {
    var author =  authors;
    var author =author.replace(/By /, "");
    author =author.replace(/ in (.*?) and /g, " and ");
    author =author.replace(/ in $/, "");

    var authors = author.split(" and ");
    for (var i in authors) 
    {
      newItem.creators.push(Zotero.Utilities.cleanAuthor(authors[i], "author"));
    }

  }
		//date
	var pathlocation ='//div[@class="ft-story-header"]/p[2]';
	var dates=doc.evaluate(pathlocation,doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	if(dates)
  {
    Zotero.debug(dates);
		newItem.date = dates.split("|");
		newItem.date = newItem.date[0].replace(/Published: / ,"");
	}
	
	if(metaTags["keywords"]) 
	{
		var keywords = metaTags["keywords"];
		newItem.tags = keywords.split(",");
		for(var i in newItem.tags)
		{
			newItem.tags[i] = newItem.tags[i].replace("  ", ", ");
			newItem.tags[i]=newItem.tags[i].replace(/_/g, " ");
		}
	}
}
newItem.complete();
}

function doWeb(doc, url) 
{
    detectWeb(doc, url);
		scrape(doc);
}