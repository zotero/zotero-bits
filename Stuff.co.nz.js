{"translatorID":"386c7e75-eef4-47b1-b5a6-0faa3cfa4f44","label":"Stuff.co.nz","creator":"Sopheak Hean (University of Waikato, Faculty of Education)","target":"^http://(www.)?stuff.co.nz/","minVersion":"1.0","maxVersion":"x.x","priority":100,"inRepository":"1","translatorType":4,"lastUpdated":"2010-08-12 15:49:58"}

/* Stuff.co.nz does not have an ISSN because it is not a newspaper publisher. Stuff.co.nz is a collection of newspaper articles from around the country*/

function detectWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
	if (prefix == "x" ) return namespace; else return null;
	} : null;

if ((url.match (/\/national\/blogs\/\bon-the-house\/\d+\/\w+/) ) 
	 || (url.match (/\/technology\/blogs\/\bgame-junkie\/\d+\/\w+/)) 
	 || (url.match (/\/technology\/blogs\/[a-zA-Z1-9]+\/\d+/))
	
	 || (url.match (/\/sport\/[a-z]+-[a-z]+-[a-z]*\/[a-z]+-[a-z]+\/\d+\/\w+/g))
	 || (url.match (/\/blogs\/[a-zA-Z]*-[a-zA-Z]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	 || (url.match (/\/blogs\/[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	 || (url.match (/\/blogs\/[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	 || (url.match (/\/life-style\/blogs\/[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	 || (url.match (/\/life-style\/[a-zA-Z0-9]*\/\are-we-there-yet\/\d+\/\w+/))
	 || (url.match (/\/life-style\/blogs\/[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	  ) {
		return "blogPost";
	}

	else if ((url.match(/\/national\/\d+\//) ) 
	|| (url.match(/\/life-style\/[a-zA-Z0-9]*\/\d+\/\w+/g)) 
	|| (url.match(/\/oddstuff\/[a-zA-Z0-9]*\/[a-zA-Z0-9]*/g))
	|| (url. match(/\/travel\/[a-zA-Z0-9]*\/[a-zA-Z0-9]*\/[a-zA-Z0-9]*/g))
	|| (url.match(/\/life-style\/[a-zA-Z0-9]*-[a-zA-Z0-9]*\/[a-zA-Z0-9]*\/\d+\/\w+/g))
	|| (url.match (/\/entertainment\/[a-zA-Z0-9]*\/\d+\/\w+/g))
	|| (url.match (/\/entertainment\/[a-zA-Z0-9]*\/\w+/g))
	|| (url.match(/\/life-style\/[a-zA-Z0-9]*\/\w+/g)) 
	|| (url.match (/\/entertainment\/[a-zA-Z0-9]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	|| (url.match (/\/entertainment\/[a-zA-Z0-9]*-[a-zA-Z0-9]*\/[a-zA-Z0-9]*\/\d+\/\w+/g))
	|| (url.match (/\/entertainment\/[a-zA-Z0-9]*-[a-zA-Z0-9]*\/[a-zA-Z0-9]*\/\d+\/\w+/g))
	|| (url.match (/\/entertainment\/[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	|| (url.match(/\/travel\/[a-zA-Z0-9]*-[a-zA-Z0-9]*\/[a-zA-Z0-9]*\/[a-zA-Z0-9]*/))
	|| (url.match (/\/national\/crime\/\d+\/\w+/)) 
	|| (url.match (/\.co.nz\/business\/\d+\/\w+/)) 
	|| (url.match (/\/national\/education\/\d+\/\w+/)) 
	|| (url.match (/\/national\/health\/\d+\/\w+/))
	|| (url.match (/\/national\/politics\/\d+\/\w+/)) 
	|| (url.match (/\.co.nz\/technology\/\bdigital-living\/\d+\/\w+/))
	|| (url.match (/\.co.nz\/technology\/\w+\/\d+\/\w+/))
	|| (url.match (/\.co.nz\/technology\/\d+\/\w+/))
	|| (url.match (/\.co.nz\/world\/\w+\/\d+\/\w+/)) 
	|| (url.match (/\/world\/[a-z]+-[a-z]*\/\d+/))
	|| (url.match (/\/sport\/[a-z]*\/\d+\/[a-zA-Z]*/g))
	|| (url.match (/\/sport\/[a-z]*\/[a-z]+\/\d+\/[a-zA-Z]*/g)) 
	|| (url.match (/\/sport\/[a-z]*\/[a-z]+-[a-z]*\/\d+\/[a-zA-Z]*/g))
	|| (url.match (/\/sport\/[a-z]*\/[a-z]+-[a-z0-9]*\/\d+\/\w+/g))
	|| (url.match (/\/sport\/[a-z]*\/[a-zA-Z0-9]*\/[a-zA-Z]*\/\d+\/\w+/g))
	|| (url.match (/\/business\/[a-z]*\/\d+\/\w+/g))
	|| (url.match (/\/business\/[a-zA-Z]*-[a-zA-Z]*\/\d+\/\w+/g))
	|| (url.match(/\/sport\/(([a-zA-Z0-9]*\/[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*)|([a-zA-Z0-9]*-[a-zA-Z0-9]*)|([a-zA-Z0-9]*))\/(([a-z0-9A-Z]*)|([a-zA-Z0-9]*-[a-zA-Z0-9]*)|([a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*))\/[a-zA-Z0-9]*/g))
	){
		return "newspaperArticle";
		}

}

function scrape(doc, url) {

	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	var url = doc.location.href;
	
	/*==========================Blog Post===========================*/
	
	if ((url.match (/\/national\/blogs\/\bon-the-house\/\d+\/\w+/) ) 
	 || (url.match (/\/technology\/blogs\/\bgame-junkie\/\d+\/\w+/)) 
	 || (url.match (/\/technology\/blogs\/[a-zA-Z1-9]+\/\d+/))
	 || (url.match (/\/sport\/[a-z]+-[a-z]+-[a-z]*\/[a-z]+-[a-z]+\/\d+\/\w+/g))
	 || (url.match (/\/blogs\/[a-zA-Z]*-[a-zA-Z]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	 || (url.match (/\/blogs\/[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	 || (url.match (/\/blogs\/[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	 || (url.match (/\/blogs\/[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	 || (url.match (/\/blogs\/[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	  ) {
		 
	
		var newItem = new Zotero.Item('blogPost');
		newItem.url = doc.location.href;
		newItem.title = "No Title Found";
		//newItem.publicationTitle = "Stuff.co.nz";
		newItem.language = "English";

		//Get Author
		try {
		var blogAuthor = "//div[@id='left_col']/span";
		var blogAuthorObject = doc.evaluate(blogAuthor, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			if (blogAuthorObject) {
				
				if (blogAuthorObject.textContent.replace(/\s*/g,'') ==""){
				newItem.creators =blogAuthorObject.textContent.replace(/\s*/g,'');
				}
				
				else{
					blogAuthorObject = blogAuthorObject.textContent;
					if(blogAuthorObject.match(/[\s\n\r\t]+-[\s\n\r\t]+[a-zA-Z\s\n\r\t]*/g)){
						blogAuthorObject = blogAuthorObject.replace(/([\s\n\r\t]+-[\s\n\r\t]+[a-zA-Z\s\n\r\t]*)/g, '').replace(/\bBy \b/g,'');
						newItem.creators.push(Zotero.Utilities.cleanAuthor(UCWords(blogAuthorObject), "author"));
					}
			
				 else { newItem.creators.push(Zotero.Utilities.cleanAuthor(UCWords(blogAuthorObject.replace(/\bBy \b/g,'')), "author"));   }
				}
			}
		} catch (err) {
			newItem.creators ="error";
	
			}
			
		//Title of the Article
		var getBlogTitle = "//span[@class='hbox_top_title headlines_title']/a";
		var getBlogTitleObject = doc.evaluate(getBlogTitle, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		if (getBlogTitleObject){
			newItem.blogTitle =getBlogTitleObject.textContent.replace(/\s+\bHeadlines\b/g, '');
		}
		newItem.shortTitle = doShortTitle(doc,url);
		newItem.title= doTitle(doc, url);
		newItem.date = doDate(doc, url);
		newItem.abstractNote = doAbstract(doc, url);
		newItem.websiteType = "Newspaper";
		newItem.complete();
	} 
	
	
	
	
	/* ======================Newspaper Article========================*/
	
	
	
	
	
	else  if ((url.match(/\/national\/\d+\//) ) 
	|| (url.match(/\/life-style\/[a-zA-Z0-9]*\/\d+\/\w+/g)) 
	|| (url.match(/\/oddstuff\/[a-zA-Z0-9]*\/[a-zA-Z0-9]*/g))
	|| (url. match(/\/travel\/[a-zA-Z0-9]*\/[a-zA-Z0-9]*\/[a-zA-Z0-9]*/g))
	|| (url.match(/\/life-style\/[a-zA-Z0-9]*-[a-zA-Z0-9]*\/[a-zA-Z0-9]*\/\d+\/\w+/g))
	|| (url.match (/\/entertainment\/[a-zA-Z0-9]*\/\d+\/\w+/g))
	|| (url.match (/\/entertainment\/[a-zA-Z0-9]*\/\w+/g))
	|| (url.match(/\/life-style\/[a-zA-Z0-9]*\/\w+/g)) 
	|| (url.match (/\/entertainment\/[a-zA-Z0-9]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	|| (url.match (/\/entertainment\/[a-zA-Z0-9]*-[a-zA-Z0-9]*\/[a-zA-Z0-9]*\/\d+\/\w+/g))
	|| (url.match (/\/entertainment\/[a-zA-Z0-9]*-[a-zA-Z0-9]*\/[a-zA-Z0-9]*\/\d+\/\w+/g))
	|| (url.match (/\/entertainment\/[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*\/\d+\/\w+/g))
	|| (url.match (/\/travel\/[a-zA-Z0-9]*-[a-zA-Z0-9]*\/[a-zA-Z0-9]*\/[a-zA-Z0-9]*/g))
	|| (url.match (/\/national\/crime\/\d+\/\w+/)) 
	|| (url.match (/\.co.nz\/business\/\d+\/\w+/)) 
	|| (url.match (/\/national\/education\/\d+\/\w+/)) 
	|| (url.match (/\/national\/health\/\d+\/\w+/))
	|| (url.match (/\/national\/politics\/\d+\/\w+/)) 
	|| (url.match (/\.co.nz\/technology\/\bdigital-living\/\d+\/\w+/))
	|| (url.match (/\.co.nz\/technology\/\w+\/\d+\/\w+/))
	|| (url.match (/\.co.nz\/technology\/\d+\/\w+/))
	|| (url.match (/\.co.nz\/world\/\w+\/\d+\/\w+/)) 
	|| (url.match (/\/world\/[a-z]+-[a-z]*\/\d+/))
	|| (url.match (/\/sport\/[a-z]*\/\d+\/[a-zA-Z]*/g))
	|| (url.match (/\/sport\/[a-z]*\/[a-z]+\/\d+\/[a-zA-Z]*/g)) 
	|| (url.match (/\/sport\/[a-z]*\/[a-z]+-[a-z]*\/\d+\/[a-zA-Z]*/g))
	|| (url.match (/\/sport\/[a-z]*\/[a-z]+-[a-z0-9]*\/\d+\/\w+/g))
	|| (url.match (/\/sport\/[a-z]*\/[a-zA-Z0-9]*\/[a-zA-Z]*\/\d+\/\w+/g))
	|| (url.match (/\/business\/[a-z]*\/\d+\/\w+/g))
	|| (url.match (/\/business\/[a-zA-Z]*-[a-zA-Z]*\/\d+\/\w+/g))
	|| (url.match(/\/sport\/(([a-zA-Z0-9]*\/[a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*)|([a-zA-Z0-9]*-[a-zA-Z0-9]*)|([a-zA-Z0-9]*))\/(([a-z0-9A-Z]*)|([a-zA-Z0-9]*-[a-zA-Z0-9]*)|([a-zA-Z0-9]*-[a-zA-Z0-9]*-[a-zA-Z0-9]*))\/[a-zA-Z0-9]*/g))
	){
	
		var newItem = new Zotero.Item('newspaperArticle');
		newItem.url = doc.location.href;
		newItem.title = "No Title Found";
		newItem.publicationTitle = "Stuff.co.nz";
		newItem.language = "English";
		
		//Short Title
		newItem.shortTitle = doShortTitle(doc,url);
		
		
		//get Abstract
		newItem.abstractNote = doAbstract(doc, url);
		var authorXPath = '//span[@class="storycredit"]';
		var authorXPathObject = doc.evaluate(authorXPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		if (authorXPathObject){
			var authorArray = new Array("NZPA", "The Press", "The Dominion Post");
			authorXPathObject = authorXPathObject.textContent;
			
			if(authorXPathObject.match(/[\s\n\r\t]+-[\s\n\r\t]+\b[a-zA-Z\s\n\r\t]*|^\s+\bBy\s*/g)){
				authorXPathObject = authorXPathObject.replace(/([\s\n\r\t]+-[\s\n\r\t]+\b[a-zA-Z\s\n\r\t]*)|\b.co.nz|\b.com|(-[a-zA-Z0-9]*)/g, '');
				var authorString = authorXPathObject.replace(/^\s+\bBy\s*|^\s+\bBY\s*/g, '');
				
				if (authorString.match(/\W\band\W+/g)){
								authorTemp = authorString.replace(/\W\band\W+/g, ', ');
								authorArray = authorTemp.split(", ");
							
						} else if (!authorString.match(/\W\band\W+/g))
							{
								authorArray = authorString.toLowerCase();
							}
						if( authorArray instanceof Array ) {
							for (var i in authorArray){
								var author;
								author = authorArray[i];
										
								newItem.creators.push(Zotero.Utilities.cleanAuthor(UCWords(author), "author"));
								}
						} else {
							if (authorString.match(/\W\bof\W+/g)){
								authorTemp = authorString.replace (/\W\bof\W(.*)/g, '');
								authorArray = authorTemp;
								newItem.creators.push(Zotero.Utilities.cleanAuthor(UCWords(authorTemp), "author"));
		
							} else {
							newItem.creators.push(Zotero.Utilities.cleanAuthor(UCWords(authorArray), "author"));
							}
										
						}
			}  else {
				
						if(authorXPathObject.match(/[\s\n\r]+/g)){
							
						authorXPathObject = authorXPathObject.replace(/^\s*|\s*$/g, '').replace(/\s+/g, '-');
						newItem.creators.push(Zotero.Utilities.cleanAuthor(authorXPathObject, "author"));
						}
						else { newItem.creators.push(Zotero.Utilities.cleanAuthor(authorXPathObject , "author"));}
					
			}
			
		} else{
			newItem.creators ="";
		}
		//newItem.creators = authorXPathObject.textContent.replace(/[\s\n\r\t]+-[\s\n\r\t]+\b[a-zA-Z\s\n\r\t]*/g, '');
		
		//Title of the Article
		newItem.title= doTitle(doc, url);
		
		
		//Section of the Article 
	
		var current = '//li/a[@class="current"]';
		var currentObject = doc.evaluate(current, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		if (currentObject){
			currentObject = currentObject.textContent;
	
			var articleSection = '//li[@class="mid_nav_item"]/a';
			var articleSectionObject = doc.evaluate(articleSection , doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			if (articleSectionObject){
				articleSectionObject = articleSectionObject .textContent;
				switch (articleSectionObject){
					case "National":
					case "Business":
					case "Sport":
					case "Politics":
						newItem.place= "New Zealand";
						newItem.section = currentObject;
						break;
				
					case "World":
						newItem.place= "World";
						newItem.section = currentObject; break;
					
					default:
						newItem.section = articleSectionObject;break;
				}
			} 
			var SectionType = '//li[@class="current_nav_item"]/a';
			var SectionTypeObject = doc.evaluate(SectionType, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			if (SectionType){
				
					SectionTypeObject = SectionTypeObject.textContent;
					switch (SectionTypeObject) {
						case "National":
						case "Crime":
						case "Education":
						case "Health":
						case "Politics":
						case "Environment":
						case "Business":
						
							newItem.place= "New Zealand";
							newItem.section = currentObject; break;
							
						case  "Opinion": 
						case  "Rugby": 
						case  "Soccer": 
						case  "Cricket": 
						case  "Basketball": 
						case  "Fishing": 
						case  "League":
						case  "Scoreboard":
						case  "Football":
						case  "Golf": 
						case  "Motorsport":
						case  "Netball":
						case  "Tennis":
						
							newItem.section ="Sport"; break;
						default: 
							newItem.section = SectionTypeObject; break;
					}
				}
		}
		else {
			var SectionType = '//li[@class="current_nav_item"]/a';
			var SectionTypeObject = doc.evaluate(SectionType, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			if (SectionType){
				
					SectionTypeObject = SectionTypeObject.textContent;
					
					switch (SectionTypeObject) {
						case "National":
						case "Crime":
						case "Education":
						case "Health":
						case "Politics":
						case "Environment":
						case "Business":
							newItem.place= "New Zealand";
							newItem.section = SectionTypeObject; break;
						
						default:
							newItem.section =SectionTypeObject; break;
					}
				
			}
		}
		//Call Do date function to make it cleaner in scape. This way things are easier to follow.
		newItem.date = doDate(doc,url);
		newItem.complete();
	}
	
}

/* 
This handy UCWords function is taken from 
http://wiki.eclipse.org/Global_Functions_-_Useful_JavaScript_Functions_%28BIRT%29
*/

function UCWords(str){
  var arrStr = str.split(" ");
  var strOut = "";
  var i = 0;
  while (i < arrStr.length) {
	     firstChar  = arrStr[i].substring(0,1);
	     remainChar = arrStr[i].substring(1);
	     firstChar  = firstChar.toUpperCase(); 
	     remainChar = remainChar.toLowerCase();
	     strOut += firstChar + remainChar + ' ';
	     i++;
  }
  return strOut.substr(0,strOut.length - 1);
}


function doShortTitle(doc, url){
	
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	var shortTitle="";
	var subTitle = '//div[@id="left_col"]/h2';
	var subTitleObject = doc.evaluate(subTitle, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	if (subTitleObject){
		 shortTitle= subTitleObject.textContent.replace(/^\s*|\s*$/g, '');
		return shortTitle;
	} else {
		return shortTitle;
	}
	
}

function doAbstract(doc, url){
	
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	var abstractString=""; 
	var a= "//meta[@name='description']";
	var abs= doc.evaluate(a, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	if (abs){
		 abstractString = abs.content;
		 return abstractString;
		
	}
	return abstractString;
	
}

function doTitle(doc, url){
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	var temp="";
	var getTitle = '//div[@id="left_col"]/h1';
	var getTitleObject = doc.evaluate(getTitle, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	if (getTitleObject) {
		var temp=getTitleObject.textContent.replace(/^\s*|\s*$/g, '');
		return temp;
	}
	return temp;
}

function doDate(doc, url){
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	var dateXpath = "//div[@id='toolbox']/div[3]";
	var dateXpathObject = doc.evaluate(dateXpath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	try {
		if (dateXpathObject){
			var storeDateValue = dateXpathObject.textContent.replace(/\b(Last updated )\d{0,9}:\d{0,9} /g,'');
			
			var ArrayDate = storeDateValue.split('/');
			var emptyString = " ";
			var comma = ", ";
			var DateString;
			var ArrayMonth = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec");
			var ArrayNumber = new Array("01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12");
			for (var i=0; i <ArrayNumber.length; i++){
				if(ArrayDate[1] ==ArrayNumber[i]) {
					
					ArrayNumber[i] = ArrayMonth[i];
					var month = ArrayNumber[i] + emptyString;
				}
				DateString = month + ArrayDate[0] + comma + ArrayDate[2];
				
			}
			return DateString;
		} else {
			DateString = "";
			return DateString;
		}
	}catch (err) {
		
		DateString = "";
	}
	return DateString;
}


function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	//var articles = new Array();
	
	if (detectWeb(doc, url) == "newspaperArticle") {
		var articles = [url];
		
	}else if (detectWeb(doc, url) == "blogPost") {
		var articles = [url];
		
	}


	//Zotero.debug(articles);
	Zotero.Utilities.processDocuments(articles, scrape, function() {Zotero.done();});
	Zotero.wait();
	
}

