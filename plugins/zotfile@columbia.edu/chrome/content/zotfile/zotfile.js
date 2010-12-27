Zotero.ZotFile = {
	

	prefs: null,
	fileMap: {}, //maps collections to their file objects

	mergeObserver: {
		observe: function(a, b, c){
			//this should get called when the dynamic overlay loading in createUI is complete.
			//we adjust UI stuff according to preferences here.
			document.getElementById("zotfile-usetags").setAttribute("checked",
				 Zotero.ZotFile.prefs.getBoolPref("useTags").toString());
		}		
 	},	

	createUI: function() {
		// Coment from lytero "I can't reference the node where I want to add stuff directly in an overlay because it has no ID,
		// so I'll create the minimum here and dynamically load the overlay."
//		var lmenu = document.createElement("toolbarbutton");
//		lmenu.setAttribute("id", "overlay");
//		var parentn = document.getElementById("zotero-collections-pane").firstChild.firstChild;
//		parentn = document.getElementById("zotero-items-pane").firstChild;
//		var zfb = document.createElement("toolbarbutton");
//		zfb.setAttribute("id", "zf-button");
//		siblingn = document.getElementById("zotero-tb-advanced-search");
		// add the button to start action 
//		parentn.insertBefore(zfb, siblingn);
//		parentn.insertBefore(document.createElement("toolbarseparator"),siblingn);

		//load the overlay
		document.loadOverlay("chrome://zotfile/content/overlay.xul", this.mergeObserver);
		
	},
	
	getpara: function (para) {
		// Initially this function 
		var filetypes=new RegExp(this.prefs.getCharPref("fileTypes"));
		if(para=="filetypes") return(filetypes);
	},


	init: function () {
		//set up preferences
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
		            getService(Components.interfaces.nsIPrefService);
		this.prefs = this.prefs.getBranch("extensions.zotfile.");
		
//		this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].
//				getService(Components.interfaces.nsIWindowMediator);
		
		this.createUI()
	},
	
	infoWindow: function(main, message, time){

		  var pw = new (Zotero.ProgressWindow);
		  pw.changeHeadline(main); 
		  if (main=="error") pw.changeHeadline(Zotero.getString("general.errorHasOccurred"));  pw.addDescription(message);
		  pw.show();
		  pw.startCloseTimer(time);

	},
	
	// Function replaces wildcard both for filename and subfolder definition
	replaceWildcard: function(zitem, rule){
	  // get item type
	  var item_type =  zitem.getType();
	  
	  // get title of selected item 
	  var title = zitem.getField('title');

	  // truncnate title after : . and ?
	  var truncate = title.search(/:|\.|\?/);
	  if(truncate!=-1) var title = title.substr(0,truncate);
	  var title_length =  title.length;
	  if (title_length>this.prefs.getIntPref("max_titlelength")) var title = title.substr(0,this.prefs.getIntPref("max_titlelength"));

	  // get journal
	  var journal = zitem.getField('publicationTitle');

	  // get journal abbreviation
	  var journal_abb = zitem.getField('journalAbbreviation');

	  // get publisher
	  var publisher = zitem.getField('publisher');

	  // get volume and issue
	  var volume = zitem.getField('volume');
	  var issue = zitem.getField('issue');

	  // get patent stuff
	  // var inventor
	  var assignee = zitem.getField('assignee');
	  var patentnr = zitem.getField('patentNumber');
	  var priority_date = patentnr.substr(2,4);

	  // get creator and create authors string
	  var creatorType=1;
	  if (zitem.getType()==19) var creatorType=14;
	  var add_etal=this.prefs.getBoolPref("add_etal");
	  var author = "";
	  var creators = zitem.getCreators();
	  var numauthors = creators.length;
	  for (var i=0; i < creators.length; i++) {
	    if(creators[i].creatorTypeID!=creatorType) var numauthors=numauthors-1;
	  }
	  if (numauthors<=this.prefs.getIntPref("max_authors")) var add_etal=0;
	  if (numauthors>this.prefs.getIntPref("max_authors")) var numauthors = 1;
	  var j=0;
	  for (var i=0; i < creators.length; i++) {
	    if (j<numauthors & creators[i].creatorTypeID==creatorType) {
	      if (author!="") var author = author + "_" + creators[i].ref.lastName;  
	      if (author=="") var author = creators[i].ref.lastName;
	      var j=j+1;
	    }
	  }
	  if (add_etal==1) var author = author + this.prefs.getCharPref("etal");

	  // date
	  var year = zitem.getField('date', true).substr(0,4);
	  if(item_type==19)  var year_issue = zitem.getField('issueDate', true).substr(0,4);

	  // create output from rule
	  var field=0;
	  var output='';
	  for (var i=0; i<rule.length; i++) {  
	    var char=rule.charAt(i);
	    switch (char) {
	      case '%':
		 	var field=1;
		  break;

	      case 'a':
	        if (field==1) var output = output + author;
		 	var field=0;
	      break;

	      case 't':
	         if (field==1) var output = output + title;
		 	 var field=0;
	      break;

	      case 'y':
	         if (field==1) var output = output + year;
		 	 var field=0;
		  break;

	      case 'j':
	         if (field==1) var output = output + journal;
		     var field=0;
	      break;

	      case 'p':
	         if (field==1) var output = output + publisher;
		 	 var field=0;
	      break;

	      case 'n':
	         if (field==1) var output = output + patentnr;
		 	 var field=0;
	      break;

	      case 'i':
	         if (field==1) var output = output + assignee;
		 	 var field=0;
	      break;

	      case 'u':
	         if (field==1) var output = output + year_issue;
		 	 var field=0;
	      break;

	      case 'w':
	         if (field==1) {
	            var output = output + journal;
	            if(journal=="") var output = output + publisher;
	         }
		     var field=0;
	      break;

	      case 's':
	         if (field==1) var output = output + journal_abb;
		 	 var field=0;
	      break;

	      case 'v':
	         if (field==1) var output = output + volume;
		 	 var field=0;
	      break;

	      case 'e':
	         if (field==1) var output = output + issue;
		 	 var field=0;
	      break;

	      default: var output = output + char;
	    }
	  }
	return(output);
	
	},
	
	getFolder: function(zitem, dest_dir, rule){
		
		var subfolder="";
		if( this.prefs.getBoolPref("subfolder")) {
			subfolder=this.replaceWildcard(zitem, rule);
		}
		
//		var journal = zitem.getField('publicationTitle');
		var folder = dest_dir + subfolder;
		return(folder);
	},
	
//	pref("extensions.zotfile.subfolder", false);
//	pref("extensions.zotfile.subfolderFormat", "%j/%y");
		
	getFiletype: function(fname){
		 var temp = new Array();
		 temp = fname.split('.');
		 return(temp[temp.length-1].toLowerCase());
	},

	allFilesInDir: function(dir_path, rule){
 		 // create a nslFile Object for the dir 
		 try {
		  var dir = Components.classes["@mozilla.org/file/local;1"].
		  createInstance(Components.interfaces.nsILocalFile);
		  dir.initWithPath(dir_path);
		  var returnFiles = [];

		  // go through all the files in the dir
		  var i=0;
		  var files = dir.directoryEntries; 
		  while (files.hasMoreElements()) { 
		    // get one after the other file
		  var file = files.getNext(); 
		  file.QueryInterface(Components.interfaces.nsIFile); 
		    // only look at files which are neither folders nor hidden
		    if(!file.isDirectory() & !file.isHidden()) {    
		     // now we want to check which filetype we are looking at
		     // we only want to consider pdfs, docs, ... 
		     var filetype=this.getFiletype(file.leafName);
			 // for whatever reason, rule is not really passed to the function so I just call getpara directly in the line above...
		     var type=filetype.search(this.getpara("filetypes"));
		      if (type>=0) {  
				  returnFiles.push(file);
			  }
			}
		  }
		  if (returnFiles.length > 0) return(returnFiles);
		  else return(-1);

		 } catch (e) {  
		    Components.utils.reportError(e);
		    return (-2);
		 }	
	},

	lastFileInDir: function(dir_path, rule){
 		 // create a nslFile Object for the dir 
		 try {
		  var dir = Components.classes["@mozilla.org/file/local;1"].
		  createInstance(Components.interfaces.nsILocalFile);
		  dir.initWithPath(dir_path);
		  var lastfile_date=0;
		  var lastfile_path="";
		  var success=0;
		
		  // go through all the files in the dir
		  var i=0;
		  var files = dir.directoryEntries; 
		  while (files.hasMoreElements()) { 
		    // get one after the other file
		  var file = files.getNext(); 
		  file.QueryInterface(Components.interfaces.nsIFile); 
		    // only look at files which are neither folders nor hidden
		    if(!file.isDirectory() & !file.isHidden()) {    
		     // now we want to check which filetype we are looking at
		     // we only want to consider pdfs, docs, ... 
		     var filetype=this.getFiletype(file.leafName);
			 // for whatever reason, rule is not really passed to the function so I just call getpara directly in the line above...
		     var type=filetype.search(this.getpara("filetypes"));
		      if (type>=0) {  
		        var modtime = file.lastModifiedTime;
		        var i=i+1;
		        // finally, we set lastfile to the file with the most recent modification
		        if (modtime>lastfile_date){
		          var lastfile_date=modtime;
		          lastfile=file;
		          var success=1;
		       }
		      }
		    }
		  } 
		  if (success==1) return(lastfile);
		  else return(-1);

		 } catch (e) {  
		    Components.utils.reportError(e);
		    return (-2);
		 }
		
	},

	moveFile: function(file, destination, filename){
	    // create a nslFile Object of the destination folder
	    var dir = Components.classes["@mozilla.org/file/local;1"].
	    createInstance(Components.interfaces.nsILocalFile);
	    dir.initWithPath(destination); 
      
	    // move file to new location
	    file.moveTo(dir, filename);
		return(file.path);
	},

	convertFile: function(file, destination, filename) {
	    // create a nslFile Object of the destination folder
	    var dir = Components.classes["@mozilla.org/file/local;1"].
	    createInstance(Components.interfaces.nsILocalFile);
	    dir.initWithPath(destination); 
      
	    // move file to new location
	    file.moveTo(dir, filename);
		var status = this.convertFileFromPath(file.path);
		if(status == 200) {
			var djpath = file.path.replace(/\.\w+$/, ".djvu");
			this.infoWindow("Zotfile Report","File \'" + file.path + "\' was successfully converted to DejaVu format.",8000);
			if (this.prefs.getBoolPref("attachOriginal") == true)
				return([file.path, djpath]);
			else 
				return([djpath]);
		} else { 
			this.infoWindow("Zotfile Report","File \'" + file.path + "\' was not converted to DejaVu format. It will be added without being changed"+"Status: "+status,8000);
			return([file.path]);
		}
	},

	convertFileFromPath: function(filePath) {
		// create an nsILocalFile for the executable
		var processor = Components.classes["@mozilla.org/file/local;1"]
							 .createInstance(Components.interfaces.nsILocalFile);
		processor.initWithPath(this.prefs.getCharPref("converterPath"));
		//processor.initWithPath("c:\\Documents and Settings\\Avram\\My Documents\\Academic Large Documents\\Tethered Shooting\\process.bat");
		if (!processor.exists()) {
			this.infoWindow("Zotfile Error","Conversion script not found at path "+this.prefs.getCharPref("converterPath"),8000);
			return 0;
		}

		// create an nsIProcess
		var process = Components.classes["@mozilla.org/process/util;1"]
								.createInstance(Components.interfaces.nsIProcess);
		process.init(processor);

		// Run the process.
		// If first param is true, calling thread will be blocked until
		// called process terminates.
		// Second and third params are used to pass command-line arguments
		// to the process.
		// TODO This should be done non-blocking
		var args = [filePath.match(/(.*)\.\w+$/)[1], '-b']; // -b flag makes the script run without requesting input
		process.run(true, args, args.length);
		return(process.exitValue);
	},
	
	getFilename: function(item){
	    // create the new filename from the selected item
		var item_type =  item.getType();
		var rename_rule=this.prefs.getCharPref("renameFormat");
		if(item_type==19) var rename_rule=this.prefs.getCharPref("renameFormat_patent");
		if (!this.prefs.getBoolPref("useZoteroToRename")) {
		  var filename=this.replaceWildcard(item, rename_rule);
		  // Strip potentially invalid characters
		  // (code line adopted from Zotero)
		  var filename = filename.replace(/[\/\\\?\*:|"<>\.]/g, '');
		  // replace blanks with '_' if option selected 	
		  if (this.prefs.getBoolPref("replace_blanks"))  var filename = filename.replace(/ /g, '_');		
		}
		if (this.prefs.getBoolPref("useZoteroToRename")) filename=Zotero.Attachments.getFileBaseNameFromItem(item.itemID);
		return(filename);
	},
	
	// Attach Converted Copy of File from Download Folder
	// This code is just copied from the subsequent function
	AttachConvertedFile: function(){
		var items = ZoteroPane.getSelectedItems();
		var item = items[0];
				
		//check whether it really is an bibliographic item (no Attachment, note or collection)
		if (!item.isAttachment() & !item.isCollection() & !item.isNote()) {
		
		  // get the last modified file from a directory
		  file=this.lastFileInDir(this.prefs.getCharPref("source_dir"), this.getpara("filetypes"));
		  if(file!=-1 & file!=-2 ) {
			  // Prompt for a file name (code from MDC)
			  if (this.prefs.getBoolPref("promptForDetails")) {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
							.getService(Components.interfaces.nsIPromptService);
				var check = {value: false};                  // default the checkbox to false (not shown anyway)
				var input = {value: null};                  // default the edit field to Bob
				var result = prompts.prompt(null, "Zotfile Import", "Enter details for the file to be imported from "+file.leafName+":", input, null, check);
				// result is true if OK is pressed, false if Cancel. input.value holds the value of the edit field if "OK" was pressed.
				if (result && input.value) filename=input.value;
				else filename=this.getFilename(item);
			  } else {
				// create the new filename from the selected item
				filename=this.getFilename(item);
			  } 

		    var file_oldpath=file.leafName;

		    // complete filename with extension
		    var filetype=this.getFiletype(file.leafName);
		    var filename = filename + "." + filetype;
		
			// confirmation from user
			var confirmed=1;
			if (this.prefs.getBoolPref("confirmation")) var confirmed=confirm("Do you want to convert and link the file \'" + file_oldpath + "\' to the currently selected Zotero item?");  		
			if(confirmed){
				// set location for renamed file
				if (!this.prefs.getBoolPref("import")) var location=this.getFolder(item,this.prefs.getCharPref("dest_dir"),this.prefs.getCharPref("subfolderFormat"));
				if ( this.prefs.getBoolPref("import")) var location=this.prefs.getCharPref("dest_dir");

				// convert file -- function gives us an array of strings
		    	var file_paths=this.convertFile(file, location, filename);				
				for (pathno in file_paths) {
					// recreate the file nslFile Object 
					// (for some reason the attachment is linked to the wrong location without recreation) 
					var file = Components.classes["@mozilla.org/file/local;1"].
					createInstance(Components.interfaces.nsILocalFile);
					file.initWithPath(file_paths[pathno]);
					
					// Linked Attachments
					if (!this.prefs.getBoolPref("import"))
						Zotero.Attachments.linkFromFile(file, item.itemID,item.libraryID);

					// Imported Attachments - Attach file to selected Zotero item
					if(this.prefs.getBoolPref("import")) {
						Zotero.Attachments.importFromFile(file, item.itemID,item.libraryID);
						//Delete the old file that is not longer needed
						file.remove(false);
					}

					// Show message
					this.infoWindow("Zotfile Report","File \'" + file.leafName + "\'added as an attachment.",8000);
				}
			}
		  }
		  else this.infoWindow("Zotfile Error","Unable to find file in " + this.prefs.getCharPref("source_dir"),8000);
		}
		else this.infoWindow("Zotfile Error","Selected item is either an Attachment, a note, or a collection.",8000);	
	},

	// Attach all files from the selected folder
	AttachAllFiles: function(){
		var items = ZoteroPane.getSelectedItems();
		var item = items[0];
				
		//check whether it really is an bibliographic item (no Attachment, note or collection)
		if (!item.isAttachment() & !item.isCollection() & !item.isNote()) {
		  var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
								.getService(Components.interfaces.nsIPromptService);
		  var check = {value: false};                   // default the checkbox to true
		  var result = prompts.confirmCheck(null, "Zotfile Import", "Really attach all items from the current import directory? The original files in the source directory will be removed.",
										  "Convert using the currently defined processing script", check);
		  // check.value is now true if the box was checked AND OK was pressed, false if
		  // the box was cleared AND OK was pressed, and is the default of true if Cancel was pressed.
		  if(result == false) {
			  return false;
		  }

		  // get all files from a directory
		  files=this.allFilesInDir(this.prefs.getCharPref("source_dir"), this.getpara("filetypes"));
		  for (fileno in files) {
			  file = files[fileno];
			  if(file!=-1 & file!=-2 ) {
				if (check.value == true) {
					// set location for renamed file
					if (!this.prefs.getBoolPref("import"))
						var	location=this.getFolder(item,
													this.prefs.getCharPref("dest_dir"),
													this.prefs.getCharPref("subfolderFormat"));
					if ( this.prefs.getBoolPref("import"))
						var location=this.prefs.getCharPref("dest_dir");
					// proceed to convert and import
					// convert file -- function gives us an array of strings
					var file_paths=this.convertFile(file, location, file.leafName);
					for (pathno in file_paths) {
						// recreate the file nslFile Object 
						// (for some reason the attachment is linked to the wrong location without recreation) 
						var file = Components.classes["@mozilla.org/file/local;1"].
						createInstance(Components.interfaces.nsILocalFile);
						file.initWithPath(file_paths[pathno]);
						
						// Linked Attachments
						if (!this.prefs.getBoolPref("import"))
							Zotero.Attachments.linkFromFile(file, item.itemID,item.libraryID);

						// Imported Attachments - Attach file to selected Zotero item
						if(this.prefs.getBoolPref("import")) {
							Zotero.Attachments.importFromFile(file, item.itemID,item.libraryID);
							//Delete the old file that is not longer needed
							file.remove(false);
						}

						// Show message
						this.infoWindow("Zotfile Report","File \'" + file.leafName + "\'added as an attachment.",8000);
					}
				} else {
					// Attach file to selected Zotero item
					Zotero.Attachments.importFromFile(file, item.itemID,item.libraryID);
					//Delete the old file that is not longer needed
					file.remove(false);
					// Show message
					this.infoWindow("Zotfile Report","File " + file.leafName + "\' added as an attachment; the original was removed",8000);
				}
			  } else this.infoWindow("Zotfile Error","File "+file.leafName + "broken.",8000);
		  }
		}
		else this.infoWindow("Zotfile Error","Selected item is either an Attachment, a note, or a collection.",8000);	
	},

	// Attach New File from Download Folder
	AttachNewFile: function(){
		var items = ZoteroPane.getSelectedItems();
		var item = items[0];
				
		//check whether it really is an bibliographic item (no Attachment, note or collection)
		if (!item.isAttachment() & !item.isCollection() & !item.isNote()) {
			
		  // create the new filename from the selected item
		  filename=this.getFilename(item);
		
		  // get the last modified file from a directory
		  file=this.lastFileInDir(this.prefs.getCharPref("source_dir"), this.getpara("filetypes"));
		  if(file!=-1 & file!=-2 ) {
		    var file_oldpath=file.leafName;

		    // complete filename with extension
		    var filetype=this.getFiletype(file.leafName);
		    var filename = filename + "." + filetype;
		
			// confirmation from user
			var confirmed=1;
			if (this.prefs.getBoolPref("confirmation")) var confirmed=confirm("Do you want to rename and link the file \'" + file_oldpath + "\' to the currently selected Zotero item?");  		
			if(confirmed){
				
				// set location for renamed file
				if (!this.prefs.getBoolPref("import")) var location=this.getFolder(item,this.prefs.getCharPref("dest_dir"),this.prefs.getCharPref("subfolderFormat"));
				if ( this.prefs.getBoolPref("import")) var location=this.prefs.getCharPref("dest_dir");

				// move file
		    	var file_path=this.moveFile(file, location, filename);				
				
		    	// recreate the file nslFile Object 
			    // (for some reason the Attachment is linked to the wrong location without recreation) 
			    var file = Components.classes["@mozilla.org/file/local;1"].
			    createInstance(Components.interfaces.nsILocalFile);
			    file.initWithPath(file_path);
				
				// Linked Attachments
				if (!this.prefs.getBoolPref("import")) Zotero.Attachments.linkFromFile(file, item.itemID,item.libraryID);

			    // Imported Attachments - Attach last file to selected Zotero item
				if(this.prefs.getBoolPref("import")) {
					// Attach last file to selected Zotero item
					Zotero.Attachments.importFromFile(file, item.itemID,item.libraryID);
										
					//Delete the old file that is not longer needed
					file.remove(false);
				}

				// Show message
			    this.infoWindow("Zotfile Report","File \'" + file_oldpath + "\' changed to \'" + file.leafName + "\' and added as an attachment.",8000);
			}
		  }
		  else this.infoWindow("Zotfile Error","Unable to find file in " + this.prefs.getCharPref("source_dir"),8000);
		}
		else this.infoWindow("Zotfile Error","Selected item is either an Attachment, a note, or a collection.",8000);	
	},
	
	// Rename & Move Existing Attachments
	RenameAttachments: function(){
		var items = ZoteroPane.getSelectedItems();
		
		var confirmed=1;
		if (items.length>=this.prefs.getIntPref("confirmation_batch")) var confirmed=confirm("You are about to rename and move the attachments of " + items.length + " items. Are you sure that you want to proceed? Your call!");  		
		if(confirmed) for (var i=0; i < items.length; i++) {
			var item = items[i];   	
			var itemID = item.id;
							  
			// Zotero.Item.isImportedAttachment()
			if(item.isRegularItem()) {
				// get all attachments
				var attachments = item.getAttachments();

				// go through all attachments
//				for (var j=0; j < attachments.length; j++) {  
				var j=0;
				if (attachments.length==1) {  
					
					// get current attachments
					var attID = item.getAttachments()[j];
					var att = Zotero.Items.get(attID);
					
					// get object of attached file
					var infile = att.getFile();
					
					// create file name using ZotFile rules
					var filename = this.getFilename(item) + "." + this.getFiletype(infile.leafName);
				    
					// rename file associated with attachment
					att.renameAttachmentFile(filename);

					// change title of attachment item
					att.setField('title', filename);
					att.save();
					
					// (a) LINKED ATTACHMENT TO IMPORTED ATTACHMENT
					if (!att.isImportedAttachment()	& this.prefs.getBoolPref("import")) {
						
						// get object of attached file
						var infile = att.getFile();
																		
						// Attach file to selected Zotero item
                      	Zotero.Attachments.importFromFile(infile, itemID,item.libraryID);
						
						// remove file from hard-drive  
                        infile.remove(false);

						// erase old attachment
						att.erase();
						
						this.infoWindow("Zotfile Report","Imported Attachment \'" + filename + "\'.",8000);	
					}
					// (b) IMPORTED ATTACHMENT TO LINKED ATTACHMENT
//					if (att.isImportedAttachment()	& !this.prefs.getBoolPref("import")) {
					if (!this.prefs.getBoolPref("import")) {												
						// get object of attached file
						var infile = att.getFile();
						
						// move pdf file 
						var location=this.getFolder(item,this.prefs.getCharPref("dest_dir"),this.prefs.getCharPref("subfolderFormat"));
						var outfile_path=this.moveFile(infile,location , filename);
										    	
				    	// recreate the outfile nslFile Object 
					    // (for some reason the Attachment is linked to the wrong location without recreation) 
					    var outfile = Components.classes["@mozilla.org/file/local;1"].
					    createInstance(Components.interfaces.nsILocalFile);
					    outfile.initWithPath(outfile_path);
					
						// create linked attachment
						Zotero.Attachments.linkFromFile(outfile, itemID,item.libraryID);
						
						// erase old attachment
						att.erase();
						
						this.infoWindow("Zotfile Report","Linked Attachment \'" + filename + "\'.",8000);	
				
					}										
				}
				
			}
		}
	},
	
	CopyContextObjectToClipboard: function () {
		var items = ZoteroPane.getSelectedItems();
		var item = items[0];
		var co = false;
				
		//check whether it really is an bibliographic item 
		if (!item.isAttachment() & !item.isCollection() & !item.isNote()) {
			co = Zotero.OpenURL.createContextObject(item, "1.0");
			const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].
				getService(Components.interfaces.nsIClipboardHelper);  
			gClipboardHelper.copyString(co);
		} else {
		}
	}
};



// Initialize the utility
//window.addEventListener('load', function(e) { Zotero.ZotFile.init(); }, false);


//check whether it really is an bibliographic item (no Attachment, note or collection)
//if (!item.isAttachment() & !item.isCollection() & !item.isNote()) {



//if (item.isAttachment()) {
	// consider that you there are multiple senarios
	// a) attachment is linked, and the goal is to attach it
	// b) attachment is attached, and the goal is to link it
	// make sure that nothing bad happens if the attachment is already named correctly
	
//}
//if (item.isCollection() | item.isNote()) this.infoWindow("Zotfile Error","Selected item is either a note, or a collection.",8000);	

