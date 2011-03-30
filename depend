#!/bin/bash

# Dependent style maker
# By Avram Lyon
# In the public domain. Enjoy, improve.

if [ "$#" -lt "3" ] 
then
	echo Usage: depend parent-style \"New Style\" new-style citation-format field.
	echo Does not support multiple fields. Sorry.
	echo But at least the last two arguments are optional. That\'s at least something.
	exit
fi

declare -r HEAD=$(cat <<'HEREDOC'
<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" version="1.0">
   <info>
      <title>%s</title>
      <id>http://www.zotero.org/styles/%s</id>
      <link href="http://www.zotero.org/styles/%s" rel="independent-parent"/>
HEREDOC
)
declare -r FOOT='
      <updated/>
   </info>
</style>'

declare -r CF='      <category citation-format="%s"/>
'
declare -r FI='      <category field="%s"/>'

if [ -f $3.csl ]
then
	echo Target file $3.csl already exists.
	exit
fi

printf "$HEAD\n" "$2" "$3" "$1" > $3.csl

# citation-format specified
if [ "$#" -gt "3" ]
then
	printf "$CF" $4 >> $3.csl
fi

# field specified
if [ "$#" -gt "4" ]
then
	printf "$FI" $5 >> $3.csl
fi

printf "$FOOT" >> $3.csl

echo Created $3.csl for $2, dependent on style $1: $4, $5
