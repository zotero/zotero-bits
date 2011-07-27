{
        "translatorID":"6db93758-38e3-4b35-96dc-59c05c342ffe",
        "label":"University of Waikato",
        "creator":"sopheak Hean",
        "target":"http://site.ebrary.com/lib/waikato/docDetail.action || http://apps.isiknowledge.com.ezproxy.waikato.ac.nz/InboundService.do || http://pq7hv8wc2f.search.serialssolutions.com || http://waikato.lconz.ac.nz || http://apps.isiknowledge.com.ezproxy.waikato.ac.nz || http://www.adb.online.anu.edu.au",
        "minVersion":"2.0",
        "maxVersion":"",
        "priority":100,
        "inRepository":"1",
        "translatorType":4,
        "lastUpdated":"2011-04-05 13:32:50"
}

/*
    Stuff.co.nz Translator- Parses Stuff.co.nz articles and creates Zotero-based metadata
   Copyright (C) 2011 Sopheak Hean, University of Waikato, Faculty of Education
   Contact:  maxximuscool@gmail.com
   
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

function detectWeb(doc, url) {
var namespace = doc.documentElement.namespaceURI;
var nsResolver = namespace ? function(prefix) {
if (prefix == "x" ) return namespace; else return null;
} : null;

	if ( doc.location.href.indexOf("genre=news") !=-1){
		return "newspaperArticle";
	} 
	
	else if (  (doc.location.href.indexOf("genre=article") !=-1) ||
	 (doc.location.href.indexOf("nboundService.do?product=WOS") !=-1) ) {
	
		return "journalArticle";
	} 
	
}


function scrape(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
	if (prefix == "x" ) return namespace; else return null;
	} : null;
	var splitIntoArray;
	/**************************
		Newspaper Section 
	**************************/
	
	if (detectWeb(doc, url) =="newspaperArticle"){
		var newItem = new Zotero.Item("newspaperArticle");
		newItem.url = doc.location.href;

		var firstName;
		var fullName="";
		var lastName;
		var emptyString= " ";
		
		/* Taking screenshot of the page */
				
		//Book title
		var myTitle= '//td[@id="CitationJournalArticleValue"]/div';
		var myTitleObject = doc.evaluate(myTitle, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	
		if (myTitleObject){
				
			myTitleObject = myTitleObject.textContent;
			newItem.title = myTitleObject;
		}
				
		/* Book publication */
		var myXPath = '//td[@id="CitationJournalTitleValue"]/div';
		var myXPathObject = doc.evaluate(myXPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	
		if (myXPathObject) {				
			myXPathObject = myXPathObject.textContent;
			newItem.publicationTitle = myXPathObject;
		}
		//all authors string
		var myAuthor	= '//td[@id="CitationJournalAuthorValue"]/div';
		var myAuthorObject= doc.evaluate(myAuthor, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	
		if (myAuthorObject) {	 	
				myAuthorObject = myAuthorObject.textContent;
				var split = myAuthorObject.split (", ");
				for (var i = 0; i < split.length; i++){
					firstName = split[i].substring(0,1).toUpperCase();
					lastName = split[i].substring(1).toLowerCase();
					fullName +=firstName + lastName +emptyString  ;	
				}
				var tempTest = fullName;
				fullName ="";
				addArray = tempTest.split(" ");
				
				for(i= addArray.length-1; i>-1; i--){
					fullName = fullName + addArray[i] + " ";
				}
			
				newItem.creators.push(Zotero.Utilities.cleanAuthor(fullName , "author"));   
		}
					
		//ISSN
		var myISSN= '//td[@id="CitationJournalIssnValue"]/div';
		var myISSNObject = doc.evaluate(myISSN, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		if (myISSNObject) {
				myISSNObject = myISSNObject.textContent;
				newItem.ISSN = myISSNObject;
		}	
			
		//Date
		var myDate= '//td[@id="CitationJournalDateValue"]/div';
		var myDateObject= doc.evaluate(myDate, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		if (myDateObject){
				
				myDateObject = myDateObject.textContent;
				newItem.date = myDateObject;
		}
			
		//Page
		var myPage= '//td[@id="CitationJournalPageValue"]/div';
		var myPageObject= doc.evaluate(myPage, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		if (myPageObject){
				myPageObject = myPageObject.textContent;
				newItem.pages = myPageObject;
		}
	
	newItem.attachments.push({title:"Snapshot", snapshot:false, mimeType:"text/html", url:newItem.url});
	newItem.complete();
	
	}
	
	/***************************
		Journal Section 
	****************************/
	
	else if (detectWeb(doc, url) =="journalArticle"){
			var newItem = new Zotero.Item("journalArticle");
			newItem.url = doc.location.href;
			var firstName;
			var fullName="";
			var lastName;
			var emptyString= " ";
			newItem.language = "English";
		
			
			//Get title
			var myTitle= '//td[@id="CitationJournalArticleValue"]/div';
			var myTitleObject = doc.evaluate(myTitle, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			if (myTitleObject) {
				myTitleObject = myTitleObject.textContent;
				newItem.title = myTitleObject 
			}
	
			else {
				
					//Get Title of the article
					myTitle ="//table[@id='FullRecDataTable']/tbody/tr/td[@class='FullRecTitle']";
					myTitleObject = doc.evaluate(myTitle, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
					if (myTitleObject){
						newItem.title = myTitleObject.textContent;
					}
					
					// If Volume is Null then the page is more likely an external site. Do this to get the site to work and scrape information
					//Get a collection of data
					var myData= "//table[@id='FullRecDataTable']/tbody";
					var myVolumeObject= doc.evaluate(myData, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
					if (myVolumeObject) {
						//making a global usable variable for the rest of the page
						var floatingVariable = myVolumeObject.textContent;
						myVolumeObject =  myVolumeObject.textContent.match(/Source: [A-Za-z\s]+(Volume: \d+)\s+(Issue: \d+)\s+(Pages: \d+-?(?:\+|\d+?))\s+(Published: (?:.*))/);
						var temp;
						temp = myVolumeObject[0].replace(/\s\s+/g, ', ');
						testArray= temp.split(",");
						if (testArray instanceof Array){
							 for (var i=0; i<testArray.length; i++){
								 if (testArray[i].match(/Source:/) ){
									newItem.publicationTitle = testArray[i].replace(/Source: /, '');
								 } else if (testArray[i].match(/Volume:/) ){
									newItem.volume = testArray[i].replace(/Volume: /, '');
								 } else if (testArray[i].match(/Issue:/) ){
									 newItem.issue = testArray[i].replace(/Issue: /, '');
								 } else if (testArray[i].match(/Pages:/) ){
									 newItem.pages =  testArray[i].replace(/Pages: /, '');
								 }else if (testArray[i].match(/Published:/)){
									  newItem.date = testArray[i].replace(/Published: /, '');
								 }		 
							 }
							
						
						}
					
						myLanguageObject = floatingVariable.match(/Language: \w+/);
						if(myLanguageObject[0].match(/Language:/) ){
								newItem.language = myLanguageObject[0].replace(/Language: /, '');
						}	

					try { /*Tags crashed the whole translator if not in try catch */
						
						myTagsObject = floatingVariable.match(/KeyWords Plus: [\w\-\;\s]+(?!.\s*)/g);
						if(myTagsObject[0].match(/KeyWords Plus:/) ){
								if(myTagsObject[0].match(/KeyWords Plus:/) ){
									myTagsObject = myTagsObject[0].replace(/\s*$/g,'').replace(/KeyWords Plus: /, '');
									var tagsArray = myTagsObject.split("; ");
									if (tagsArray instanceof Array){
										for(var i=0; i<tagsArray.length; i++){
												newItem.tags.push (tagsArray[i]);
										}
									}
								} 
						}
							
					} catch (errs) {
							
						}
						
					}
					
				try { /*Some sites are external and some are internal. To preventing any unwanted crashed causing by one tag. */
						
						if (floatingVariable){
							
								var myAbstractObject;
								myAbstractObject = floatingVariable.match(/Abstract: [\s\.\w]+(?!.\s*)/g);
								if(myAbstractObject[0].match(/Abstract: \w+/) ){
									newItem.abstractNote=  myAbstractObject[0].replace(/\s*$/g,'').replace(/Abstract: /, '');
								}
							
						}
				
				}
				catch (errs) {
					
				}
				
			//Get External Site ISSN number
			var externalISSN= floatingVariable.match(/ISSN: \d+[-]\d+/);
			if(externalISSN[0].match(/ISSN:/) ){
				newItem.ISSN= externalISSN[0].replace(/ISSN: /, '');
			}
				
				
		}	/* End parent ELSE */
				

			//all authors string
			var myAuthor	= '//td[@id="CitationJournalAuthorValue"]/div';
			var myAuthorObject = doc.evaluate(myAuthor, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			//Zotero.debug("Author:  " +myAuthor); 
			if(myAuthorObject) { //Site with LastName first and First name second.
				myAuthorObject = myAuthorObject.textContent;
				var splitArray = myAuthorObject.split (", ");	
				fullName ="";
				for (i = splitArray.length-1; i>-1; i--) {
					fullName = fullName + splitArray[i] + " ";
				}
				
				/* Works the same way as the top code (Last name before first name)
				if (splitArray instanceof Array){	
					 for(var i=0; i< splitArray.length; i++){								
						var firstName = splitArray[i]; //Array start at 1
						var lastName= splitArray [i-1]; //Last name is located in array 0, 
						fullName= firstName + " " + lastName;
					}						
				}
				*/
				
				newItem.creators.push(Zotero.Utilities.cleanAuthor(fullName , "author"));   
			} 
			else {
				myAuthor = '//tr[3]/td[@class="fr_data_row"]/a';
				myAuthorObject= doc.evaluate(myAuthor, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
				if( myAuthorObject){
					myAuthorObject = myAuthorObject.textContent;
					if(myAuthorObject == "[Anon]"){
						myAuthorObject = "Anonymous";
						newItem.creators.push(Zotero.Utilities.cleanAuthor(myAuthorObject, "author")); 
					}else {
						
						var authorTemp = myAuthorObject.split(' ');
						authorTemp = authorTemp[1] + " " + authorTemp[0]
						newItem.creators.push(Zotero.Utilities.cleanAuthor(authorTemp , "author")); 
					}
					
				}
				
			}
			
			
			//Volume
			var myVolume= '//td[@id="CitationJournalVolumeValue"]/div';
			var myVolumeObject= doc.evaluate(myVolume, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			if (myVolumeObject){
				newItem.volume = myVolumeObject.textContent;
			}
			
			//Book publication
			var myXPath = '//td[@id="CitationJournalTitleValue"]/div';
			var myXPathObject = doc.evaluate(myXPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();// .textContent;
			//Zotero.debug("Publication: " + myXPathObject);
			if (myXPathObject){
				myXPathObject = myXPathObject.textContent;
				newItem.publicationTitle = myXPathObject;
			}
			
			//ISSN on the University site
			var myISSN= '//td[@id="CitationJournalIssnValue"]/div';
			var myISSNObject = doc.evaluate(myISSN, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			if(myISSNObject){
				myISSNObject = myISSNObject.textContent;
				newItem.ISSN= myISSNObject;
			} 
			
			var getDOI="//td[@id='CitationJournalDOIValue']/div";
			var getDOIObject = doc.evaluate(getDOI, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			if (getDOIObject){
				newItem.DOI = getDOIObject.textContent;
			}
			
			var uniPage = "//td[@id='CitationJournalPageValue']/div";
			var uniPageObject = doc.evaluate(uniPage, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			if (uniPageObject) {
				newItem.pages = uniPageObject.textContent;
			}
			
			var uniIssue = "//td[@id='CitationJournalIssueValue']/div";
			var uniIssueObject = doc.evaluate(uniIssue, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			if (uniIssueObject) {
				newItem.issue = uniIssueObject.textContent;
			
			}
			//Date
			var myDate= '//td[@id="CitationJournalDateValue"]/div';
			var myDateObject= doc.evaluate(myDate, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			if ( myDateObject){
				newItem.date = myDateObject.textContent;
			}
			//Get Related
			var getRelated = "//div[@id='ArticleCL']/a";
			var getRelatedObject = doc.evaluate(getRelated, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			if(getRelatedObject){
				Zotero.debug(getRelatedObject.textContent);
			}
			
			//newItem.tags.push="BLAH";
			newItem.attachments.push({title:"Snapshot", snapshot:false, mimeType:"text/html", url:newItem.url});
			newItem.complete();
	} 
	
	
	/************************************************************************
		eBook and Book Section is no longer needed, the page has another translator at work
	*************************************************************************/

}


function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	/*******************************************************************
		Multiple search result section doesn't work since the site linking to external sites, 
		this is due to permission error and using this method is currently not possible. Only
		COinS translator will work for now, though it is not perfect but usable.
	********************************************************************/
	
	 if (detectWeb(doc, url) == "newspaperArticle") {
		articles = [url];
		
	}else if (detectWeb(doc, url) == "journalArticle") {
		articles = [url];	
	}

	Zotero.Utilities.processDocuments(articles, scrape, function() {Zotero.done();});
	Zotero.wait();
}
