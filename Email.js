{
	"translatorID":"84efc464-1f97-4cb7-b034-1c540b90c9a1",
	"translatorType":3,
	"label":"Bookmarks",
	"creator":"Avram Lyon",
	"target":"html",
	"minVersion":"2.1b6",
	"maxVersion":"",
	"priority":100,
	"configOptions":{"dataMode":"line"},
	"inRepository":true,
	"lastUpdated":"2011-02-10 04:31:00"
}

/*
   Email import translator
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

/* Input headers look like:

We only require the "From: " header.

MIME-Version: 1.0
Sender: ajlyon@gmail.com
Received: by 10.229.78.225 with HTTP; Sun, 27 Mar 2011 11:20:29 -0700 (PDT)
In-Reply-To: <4D8F7A36.70607@languagegeek.com>
References: <E1Q3a1k-0008HY-FR@box524.bluehost.com>
	<4D8F7A36.70607@languagegeek.com>
Date: Sun, 27 Mar 2011 22:20:29 +0400
Delivered-To: ajlyon@gmail.com
X-Google-Sender-Auth: gUE730uK-sPpt71XD4d-noACgyY
Message-ID: <AANLkTik6KKvDuQb5U+M+CAaEF8XdFdNyyCY=qsQK-cQL@mail.gmail.com>
Subject: Re: Kenn Harper article etc.
From: Avram Lyon <ajlyon@ucla.edu>
To: Chris Harvey - Languagegeek <lg@languagegeek.com>
Content-Type: text/plain; charset=UTF-8

*/

function detectImport() {
	var line;
	var match;
	var i = 0;
	var re = /^\s*From:/i;
	while((line = Zotero.read()) !== false) {
		match = re.exec(line);
		if (match) {
			Zotero.debug("Found a match with line: "+line);
			return true;
		}
		// Allow for a lot of lines, since there can be plenty of headers
		if (line != "" && i++ > 50) {
			return false;
		}
	}
	return false;	
}

function doImport() {
	var line, hits, creators, i, j;
	var item = false;
	var headers = {};
	var lastHeader = false;
	var re = /^\s*([A-Za-z-0-9]+):(.*)$/; 
	while((line = Zotero.read()) !== false) {
		if (hits = re.exec(line)) {
			// normalize to lower case, just in case
			lastHeader = hits[1].toLowerCase();
			headers[lastHeader] = hits[2];
		} else if (lastHeader) {
			headers[lastHeader] += line;
		} else {
			Zotero.debug("Discarding line: " + line);
		}
	}

	if (headers && headers["from"] && headers["date"]) {
		item = new Zotero.Item("email");
		for (i in headers) {
			Zotero.debug("Header = "+i);
			switch (i) {
				case "from": 	creators = makeCreators(headers[i], "author");
						for (j in creators) {
							item.creators.push(creators[j]);
						}
						break;
				case "cc":
				case "bcc":
				case "to": 	creators = makeCreators(headers[i], "recipient");
						for (j in creators) {
							item.creators.push(creators[j]);
						}
						break;
				case "subject":
						item.title = headers[i];
						break;
				default: Zotero.debug("Discarding " + i + " => " + headers[i]);
			}
		}
	}
	if (item) item.complete();
}

function makeCreatorFromRecipient(text, role) {

	// These guys can be comma-separated, but real names can have commas too. Fun!
	return [{firstName:text, creatorType:role}];
}
