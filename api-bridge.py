# A bridge between the local Zotero database and the server API,
# and between pygnotero and pyzotero

# We use libzotero from the Gnotero project
# http://www.cogsci.nl/software/gnotero
# See also Sebastiaan's intro to using libzotero:
# http://www.cogsci.nl/blog/tutorials/97-writing-a-command-line-zotero-client-in-9-lines-of-code
from pygnotero import libzotero
# We'll use the pyzotero project for server access
# https://github.com/urschrei/pyzotero
# See also Steph's intro to using it:
# https://github.com/urschrei/pyzotero/blob/master/readme.md
from pyzotero import zotero

# Path to your Zotero folder
# You'll need to change this
zotero_folder = "/home/ajlyon/.mozilla/firefox/jlm2qjtg.Demo/zotero"

# Zotero user ID (numeric)
# You'll need to change this too
zotero_userid = "5770"
# Zotero API key (alphanumeric)
# Get it here: http://www.zotero.org/settings/keys/new
zotero_key = ".........."

# Search term
term = 'Highlights of statistical signal and array processing'

# Connect to local Zotero database
db = libzotero.libzotero(zotero_folder)
# Connect to Zotero server
server = zotero.Zotero(zotero_userid, zotero_key)
results = db.search(term)
print "%d results for %s" % (len(results), term)

# We'll view the full set here -- at this point we could filter them by any field that Gnotero exposes (not all of them -- yet!)
for i in results:
	print "Have local: %s (%s)" % (i.title, i.key)

# get the first result to make a sample edit
# We request it from the server, using the key that Gnotero obligingly provides
remote = server.item(results[0].key)[0]
# Show the object that we pulled from the server
print remote
# We can modify any of the fields on the item
remote['extra'] = 'This has been post-processed by pyzotero & pygnotero!'
# This will then push those changes back to the server
server.update_item(remote)
# Now sync or view online and -- voila! -- the item will be updated!
