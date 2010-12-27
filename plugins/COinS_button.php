<?php
/*
Plugin Name: COinS Quicktags Button
Plugin URI: http://www.wallandbinkley.com/quaedam/
Description: Adds a COinS button to the post editor.
Version: 0.3
Author: Peter Binkley
Author URI: http://www.wallandbinkley.com/quaedam/
*/ 

/* based on the Edit Button Framework by Owen Winkler, http://www.asymptomatic.net/wp-hacks */

add_filter('admin_footer', 'pab_COinS');

function pab_COinS()
{
	if(strpos($_SERVER['REQUEST_URI'], 'post.php'))
	{
?>
<script language="JavaScript" type="text/javascript"><!--
var toolbar = document.getElementById("editor-toolbar");
<?php
		edit_insert_button("COinS", "pab_COinS_handler", "COinS");
?>

/* button handler */
function pab_COinS_handler(URL) {
	formWin = window.open("", "formWin", "toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,width=300,height=300,top=250,left=250,");
   if(formWin.opener == null) formWin.opener = self;
   formWin.focus();
   formHtml = '<html><head><title>COinS Form</title>'
      +'<scr'+'ipt language="JavaScript" type="text/javascript">'
      +'var contextObject = "";'
      +'function addField(label, s) {'
      +'	if (s != "") { '
      +'		if (contextObject != "")'
      +'			contextObject += "&amp;";'
      +'		contextObject += "rft." + label + "=" + encodeURIComponent(s);'
      +'	}'
      +'}'
      +'function show() {'
      +'	var mainform = document.getElementById("mainform");'
      +'	addField("ctx_ver", "Z39.88-2004");'
      +'	addField("rft_val_fmt", "info:ofi/fmt:kev:mtx:journal");'
      +'	addField("jtitle", mainform.jtitle.value);'
      +'	addField("issn", mainform.issn.value);'
      +'	addField("date", mainform.date.value);'
      +'	addField("volume", mainform.volume.value);'
      +'	addField("issue", mainform.issue.value);'
      +'	addField("spage", mainform.spage.value);'
      +'	addField("epage", mainform.epage.value);'
			+' if (mainform.co.value == "") opener.pab_insert_COinS(contextObject);'
			+' else opener.pab_insert_COinS(mainform.co.value);'
			+' self.close();'
      +'}'
			+'</scr' + 'ipt>'
      +'</head>'
      +'<body>'
      +'<form onsubmit="javascript:show()" id="mainform">'
      +'	<table border="0">'
      +'	<tr><td>ContextObject:</td><td><input type="text" name="co"></td></tr>'
      +'	<tr><td>Journal title:</td><td><input type="text" name="jtitle"></td></tr>'
      +'	<tr><td>ISSN:</td><td><input type="text" name="issn"></td></tr>'
      +'	<tr><td>Date:</td><td><input type="text" name="date"></td></tr>'
      +'	<tr><td>Volume:</td><td><input type="text" name="volume"></td></tr>'
      +'	<tr><td>Issue:</td><td><input type="text" name="issue"></td></tr>'
      +'	<tr><td>Start page:</td><td><input type="text" name="spage"></td></tr>'
      +'	<tr><td>End page:</td><td><input type="text" name="epage"></td></tr>'
      +'	</table>'
      +'	<input type="submit" value="Insert COinS"/>'
      +'</form></body></html>';

		var doc = formWin.document;
		doc.open("text/html", "replace");
	  doc.write(formHtml);
		doc.close(); // close the document
}

function pab_insert_COinS(contextObject)
{
		edInsertContent(edCanvas, '<span class="Z3988" title="'+contextObject +'">'
		+ '<!-- This is a COinS: see http://ocoins.info -->'
		+ '</span>');
}

//--></script>
<?php
	}
}

if(!function_exists('edit_insert_button'))
{
	//edit_insert_button: Inserts a button into the editor
	function edit_insert_button($caption, $js_onclick, $title = '')
	{
	?>
	if(toolbar)
	{
		var theButton = document.createElement('input');
		theButton.type = 'button';
		theButton.value = '<?php echo $caption; ?>';
		theButton.onclick = <?php echo $js_onclick; ?>;
		theButton.className = 'ed_button';
		theButton.title = "<?php echo $title; ?>";
		theButton.id = "<?php echo "ed_{$caption}"; ?>";
		toolbar.appendChild(theButton);
	}
	<?php

	}
}


?>
