{
        "translatorID": "9e4abde2-0a28-46dd-9d9b-f85e3327d247",
        "label": "Hamilton City Library",
        "creator": "Sopheak Hean",
        "target": "http://library.hcc.govt.nz",
        "minVersion": "1.0",
        "maxVersion": "",
        "priority": 100,
        "inRepository": "1",
        "translatorType": 4,
        "lastUpdated": "2011-04-19 09:53:57"
}

/*
Hamilton City Library Translator- Parses its articles and creates Zotero-based metadata
Copyright (C) 2011 Sopheak Hean, University of Waikato, Faculty of Education
Contact: maxximuscool@gmail.com
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc, url) {
var namespace = doc.documentElement.namespaceURI;
var nsResolver = namespace ? function(prefix) {
if (prefix == "x" ) return namespace; else return null;
} : null;

var multiple= "//div[@id='content']/form/table/tbody/tr/td[3]/a[3]";
var multipleObject= doc.evaluate(multiple, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
if (multipleObject){
return "multiple";
}

else{

return "book";
}
}

function scrape ( doc, url) {
var namespace = doc.documentElement.namespaceURI;
var nsResolver = namespace ? function(prefix) {
if (prefix == 'x') return namespace; else return null;
} : null;

var newItem = new Zotero.Item("book");
newItem.url = doc.location.href;
var title = "//table/tbody/tr[1]/td[3]/a";
var titleObject = doc.evaluate(title, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
if(titleObject){
newItem.title= titleObject.textContent;
}
var author = ".//*[@id='content']/form/table/tbody/tr/td/table/tbody/tr[2]/td[3]/a[2]";
var authorObject = doc.evaluate(author, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();

if (authorObject){

authorObject = authorObject.textContent.match(/[a-zA-Z,\s.&()]+/);
var words = authorObject[0].split(", ");
var fix1= '';
for (i = words.length-1; i > -1; i--) {
fix1= fix1+ words[i] + ' ';
}

//get main author
author = "//form/table/tbody/tr/td/table/tbody/tr[2]/td[3]/a[1]";
authorObject = doc.evaluate(author, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
if (authorObject){
authorObject = authorObject.textContent.match(/[a-zA-Z,\s.()]+/);
var names = authorObject[0].split(", ");
var fix2= '';
for (i = names.length-1; i > -1; i--) {
fix2= fix2+ names[i] + ' ';
}
newItem.creators.push(Zotero.Utilities.cleanAuthor(fix2, 'author'));
}
//push second author
newItem.creators.push(Zotero.Utilities.cleanAuthor(fix1, 'author'));
} else {
author = "//form/table/tbody/tr/td/table/tbody/tr[2]/td[3]/a[1]";
authorObject = doc.evaluate(author, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();

if (authorObject){
authorObject = authorObject.textContent.match(/[a-zA-Z,\s.]+/);
var names = authorObject[0].split(", ");
var Fixed = '';
for (i = names.length-1; i > -1; i--) {
Fixed= Fixed+ names[i] + ' ';
}
newItem.creators.push(Zotero.Utilities.cleanAuthor(Fixed, 'author'));
}
}
var abstract =".//*[@id='content']/form/table/tbody/tr";
var abstractObject = doc.evaluate(abstract, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
if (abstractObject) {
abstractObject= abstractObject.textContent;
var global = abstractObject;
if(global.match(/Summary: [a-zA-Z.\s,0-9:'!]+/)){
var abstract = abstractObject.match(/Summary: [a-zA-Z.\s,0-9:!']+/);
newItem.abstractNote = abstract[0].replace(/Summary: /, '');
}

if(global.match(/Series Title: [a-zA-Z0-9\-\s\.;]+/) ){
var series = global.match(/Series Title: [a-zA-Z0-9\-\.\s]+/);
newItem.seriesTitle =series[0].replace(/Series Title: /, '');
}
if(global.match(/ISBN: [0-9]+/)){
var ISBN = global.match(/ISBN: \d{0,13}/);
newItem.ISBN = ISBN[0].replace(/ISBN: /, '');
}
if (global.match(/Language: \w+/)){
var language = global.match(/Language: \w+/);
newItem.language = language[0].replace(/Language: /, '').replace(/Added|Subject/, '');
}
if( global.match(/Collation: [0-9a-z\s]+/)){
var pages = global.match(/Collation: [0-9a-z\s-+]+/);
newItem.pages = pages[0].replace(/Collation: /, '');
}
if(global.match(/Edition: [0-9a-zA-Z\s]+/)){
var edition = global.match(/Edition: [0-9a-zA-Z\s]+/);
newItem.edition = edition[0].replace(/Edition: /, '');
}
if(global.match(/Imprint: [a-zA-Z\s\[\\\]\\:,.0-9\&/!]+/) ){
var temp =global.match(/Imprint: [a-zA-Z\s\[\\\]\\:,.0-9\&/!]+/);
var year = temp[0].match(/\d{1,4}/);
newItem.date = year[0];
}
if (global.match(/Imprint:\s+((?:\[.+\] : )|([a-zA-Z,\s]+))([a-zA-Z&\s.\/]+)/ ) ){
var pub = global.match(/Imprint:\s+((?:\[.+\] : )|([a-zA-Z,\s]+))([a-zA-Z&\s.\/]+)/ );
newItem.publisher = pub[1];
}
/*
if (global.match(/Notes:\s+(?:[a-zA-Z\s.:,;'!\-\"\(\)0-9]+)/) ){
var note =global.match(/Notes:\s+(?:[a-zA-Z\s.:,;'!\-\"\(\)0-9]+)/);
newItem.notes = note[0];
}*/
}
var callNumber = ".//*[@id='content']/form/div[4]/table/tbody/tr[2]/td[3]/a";
var callNumberObject = doc.evaluate(callNumber, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
if (callNumberObject){
newItem.callNumber = callNumberObject.textContent;
}

newItem.attachments.push({title:"Snapshot", snapshot:false, mimeType:"text/html", url:newItem.url});
newItem.complete();


}

function doWeb(doc, url) {
var namespace = doc.documentElement.namespaceURI;
var nsResolver = namespace ? function(prefix) {
if (prefix == 'x') return namespace; else return null;
} : null;

var articles = new Array();
if (detectWeb(doc, url) == "multiple") {
var items = new Object();

var titles ="//div[@id='content']/form/table/tbody/tr/td[3]/a[3]";
var titleObject = doc.evaluate(titles, doc, nsResolver, XPathResult.ANY_TYPE, null);
var next_title;
while ( next_title = titleObject.iterateNext()) {
items[next_title.href] = next_title.textContent;
}
items = Zotero.selectItems(items);
for (var i in items) {
articles.push(i);
}

} else {
articles = [url];
}

Zotero.Utilities.processDocuments(articles, scrape, function() {Zotero.done();});
Zotero.wait();
}