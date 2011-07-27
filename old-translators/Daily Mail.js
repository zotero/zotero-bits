{
	"translatorID":"87842678-4b12-4667-828b-3b2f4da6e387",
	"translatorType":4,
	"label":"Daily Mail",
	"creator":"Andrew Brown",
	"target":"^http://www\\.dailymail\\.co\\.uk/",
	"minVersion":"1.0.0b4.r5",
	"maxVersion":"",
	"priority":100,
	"inRepository":false,
	"lastUpdated":"2009-04-02 15:10:00"
}


function detectWeb(doc, url) {
		return "newspaperArticle";
}

function parseMailDate(datestring) {
	var lines=[];
	var words=[]
	lines=datestring.split('\n');
	//Zotero.debug(lines.length);
	words=lines[lines.length-1].split(' ');
	var day;
	var month;
	var year;
	day=words[6].slice(0,2);
	month=words[7];
	year=words[8];
	var months=["January","February","March","April","May","June","July","August","September","October","November","December"];
	month=months.indexOf(month)+1;
	return (year+month+day);
}

function isSunday(datestring){
	var lines=[];
	var words=[]
	lines=datestring.split('\n');
	//Zotero.debug(lines.length);
	words=lines[lines.length-1].split(' ');
	var day;
	var month;
	var year;
	day=words[6].slice(0,2);
	month=words[7];
	year=words[8];
	jsdate=month+' '+day+', '+year;
	var d=new Date(jsdate);
	//Zotero.debug(Date.parse(jsdate));
	if (d.getDay()==0){
		return 1;
		}
	else {
		return null;
	}
}

function doWeb(doc, url) {
	//Zotero.debug("doWeb URL= "+ url);
	var newArticle = new Zotero.Item('newspaperArticle');
	newArticle.url = url;
	newArticle.publicationTitle = 'The Daily Mail';
	newArticle.publisher = 'DMGT';
	newArticle.place='London';

	//Get the date, and a provisional standfirst from the first par
	var storyXpath=doc.evaluate('/html//div[@class="article-text float-l " and @id="js-article-text"]/p',doc, null, XPathResult.ANY_TYPE, null);
	if (storyXpath){
		var story=[];
		var storypars;
		var datePattern=/Last updated at/
		while (storypars=storyXpath.iterateNext()){
			// grep for a date pattern
			if (datePattern.test(storypars.textContent)){
				newArticle.date=parseMailDate(storypars.textContent);
				// Tidy the name of the paper
				if (isSunday(storypars.textContent)){
					newArticle.publicationTitle='The Mail on Sunday';
				}
				// Since there is a date ...
				// take the lead par -- which follows immediately afterwards -- for the abstract/standfirst
				// it will later be overwritten if there is a meta-standfirst in a comment piece
				newArticle.abstract=storyXpath.iterateNext().textContent;
			}
		}
	}

	// the piece may be either news or features or even (ewww) femail
	// if it is news, there is no standfirst and the lead par becomes the abstract
	// if it is features, there is an abstract in the meta-elements
	// so first we test to see which it is
	var isNews =doc.evaluate('/html/body[@id="news"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	var isComment= doc.evaluate('/html/body[@id="debate"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	var isFemail=doc.evaluate('/html/body[@id="femail"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();

	if (isComment){
		newArticle.section='Comment';
		//is it by Peter Hitchens, who is too grand for a byline?
		// but has a CSS class all to himself (note the opening space)
		var isHitch=doc.evaluate('//body[@class=" peter-hitchens debatedebate"]',doc,null,XPathResult.ANY_TYPE,null).iterateNext();
		if (isHitch){
			newArticle.creators.push(Zotero.Utilities.cleanAuthor("Peter Hitchens","author"));
		}
		// this next function stolen and modified by ACB from Reino Ruusu's telegraph code
		// mostly so I can get at the meta-elements
		var metaElements = doc.evaluate('//html/head/meta', doc, null, XPathResult.ANY_TYPE, null);
		var tmp;
		while (tmp = metaElements.iterateNext()) {
			var name = tmp.getAttribute('name');
			var content = tmp.getAttribute('content');
			if (name=="description"){
				newArticle.abstract=content;
			}
		}
	}

	if (isNews){
		newArticle.section='News';
	}

	if(isFemail){
		newArticle.section="Femail";
	}

	//Headline is very simple
	var headlineXpath=doc.evaluate('/html/body//div[@id="js-article-text"]/h1',doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	newArticle.title=headlineXpath;

	// extract authors who may be in an array
	var authorXpath=doc.evaluate('/html/body//a[@class="author"]',doc, null, XPathResult.ANY_TYPE, null);
	var hack;
	while (hack=authorXpath.iterateNext()){
		newArticle.creators.push(Zotero.Utilities.cleanAuthor(hack.textContent,"author"));
	}
	//ATTACH A SNAPSHOT
	newArticle.attachments.push({url:url, title:"Daily Mail / Mail on Sunday Snapshot",
						  mimeType:"text/html"});

	//And put the bugger away
	newArticle.complete();
}
