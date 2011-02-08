{
	"translatorID":"4e7119e0-02be-4848-86ef-79a64185aad8",
	"translatorType":3,
	"label":"Bookmarks",
	"creator":"Avram Lyon",
	"target":"html",
	"minVersion":"2.0",
	"maxVersion":"",
	"priority":100,
	"configOptions":{"dataMode":"line"},
	"inRepository":false,
	"lastUpdated":"2011-01-11 04:31:00"
}

/*
   Browser bookmarks translator
   Copyright (C) 2011 Avram Lyon, ajlyon@gmail.com

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

 /* This translator imports and exports browser bookmark files in the standard
  * "Netscape Bookmark Format".
  * See http://msdn.microsoft.com/en-us/library/aa753582%28VS.85%29.aspx
  * This code draws from the CSL style for bookmark export, by Rintze Zelle
  * 	http://www.zotero.org/styles/bookmark-export
  * With some effort, we might be able to preserve things like bookmark folders by
  * making collections, but need to explore cross-browser implementations first.
  * Input looks like:
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks Menu</H1>
<DL>
    <DT><A HREF="http://www.example.com/">Example Site</A></DT>
    <DD>Longer title</DD>
</DL>
  */

function doImport() {
	var text = "";
	var line;
	while((line = Zotero.read()) !== false) {
		text += line;
	}
	return doImportFromText(text);
}

function detectImport() {
	var text = "";
	var line;
	var match;
	var re = /<DT>\s*<A[^>]*HREF="([^"]+)"[^>]*>([^<\n]+)/gi;
	while((line = Zotero.read()) !== false) {
		text += line;
		match = re.exec(text);
		if (match) {
			Zotero.debug("Found a match with line: "+line);
			return true;
		}
	}
	return false;	
}


// TODO Rework to allow for import progress
// XXX Do we want to save snapshots? Not worth trying?
function doImportFromText(text) {
	var match;
	var re = /<DT>\s*<A[^>]*HREF="([^"]+)"[^>]*>([^<\n]+)/gi;
	/* The next line would be for saving the description, saved in <DD>. Firefox
           puts the contents of its "Description" field here. We'll ignore it for now */ 
	//var re = /<DT>\s*<A[^>]*HREF="([^"]+)"[^>]*>([^<\n]+)(?:<\/DT>)?[^<]*(<DD>[^<\n]+)?/gi;
	while (match = re.exec(text)) {
		if(match && match[1] && match[2]) {
			var item = new Zotero.Item("webpage");
			item.title = match[2];
			item.url = match[1];
			Zotero.debug("Made item with title: "+item.title);
			//if (match[3]) item.abstractNote = match[3].subst(/<\/DD>/,"");
			item.complete();
		}
	}
};

function doExport() {
	var item;
	
	var header = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n'+
'<!-- This is an automatically generated file.\n'+
'     It will be read and overwritten.\n'+
'     DO NOT EDIT! -->\n'+
'<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n'+
'<TITLE>Bookmarks</TITLE>\n'+
'<H1>Bookmarks Menu</H1>\n'+
'<DL>\n';
	var footer = '</DL>';

	Zotero.write(header);
	while (item = Zotero.nextItem()) {
		// TODO Be more verbose, making an informative title and including more metadata
		if (item.url) Zotero.write('    <DT><A HREF="'+item.url+'">'+item.title+'</A>\n');
		else Zotero.debug("Skipping item without URL: "+item.title);
	}
	Zotero.write(footer);
}
