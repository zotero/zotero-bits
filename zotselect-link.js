{
"translatorID":"04623cf0-313c-11df-9aae-0800200c9a66",
"translatorType":2,
"label":"ZotSelect Link",
"creator":"Scott Campbell, Avram Lyon",
"target":"html",
"minVersion":"2.0",
"maxVersion":"",
"priority":200,
"inRepository":false,
	"configOptions":{"dataMode":"block"},
	"displayOptions":{"exportCharset":"UTF-8"},
"lastUpdated":"2010-03-12 10:51:00"
}

function doExport() {
	var item;
	while(item = Zotero.nextItem()) {
		Zotero.write("<a href='zotero://select//");
		var library_id = item.LibraryID ? item.LibraryID : 0;
		Zotero.write(library_id+"_"+item.key+"'>");
		Zotero.write(item.creators[0].lastName+". "+item.date+". <i>"+item["title"]+"</i>"+"</a>");
	}
}
