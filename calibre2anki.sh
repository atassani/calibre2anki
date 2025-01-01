#!/usr/bin/env bash
SOURCE_CALIBRE_JSON=./data/calibre_books.json
MARKDOWN_TARGET_PATH=./output/calibre_markdown.md
IMAGES_TARGET_PATH=./output/images
ANKI_LIBRARY_PATH="/Users/toni.tassani/Library/Application Support/Anki2/User 1/collection.media"
INKA_PATH=/Users/toni.tassani/code/inka2/venv/bin
EMBLEMS_SOURCE_PATH=/Users/toni.tassani/Library/Preferences/calibre/cc_icons

echo "** Generating Json from Calibre..."
calibredb list --fields=id,title,authors,pubdate,cover,last_modified,\*readdate,rating,tags,\*comments,\*readorder,\*read \
  -s '#read:"Yes" or (#readorder:>0.0)' --for-machine --sort-by last_modified > $SOURCE_CALIBRE_JSON

echo "** Deleting images..."
rm -f "${IMAGES_TARGET_PATH}"/Book_[0-9]*
rm -f "${IMAGES_TARGET_PATH}"/calibre_emblems_*
rm -f "${ANKI_LIBRARY_PATH}"/Book_[0-9]*
rm -f "${ANKI_LIBRARY_PATH}"/calibre_emblems_*

echo "** Building the npm script..."
npm run build

echo "** Running the npm script to build the Markdown file and extract cover images..."
npm run start -- \
  --sourceCalibreJson $SOURCE_CALIBRE_JSON \
  --markdownTargetPath $MARKDOWN_TARGET_PATH \
  --imagesTargetPath $IMAGES_TARGET_PATH

echo "** Resizing cover images to 500x500 if bigger..."
mogrify -resize 500x500\> $IMAGES_TARGET_PATH/*

echo "** Copying emblems..."
cp $EMBLEMS_SOURCE_PATH/* $IMAGES_TARGET_PATH/
find $IMAGES_TARGET_PATH -type f -not -name "Book_*" -not -name ".DS_Store" -exec rename -e 's/(.*)\/(.*)/$1\/calibre_emblems_$2/' {}  \;
find $IMAGES_TARGET_PATH -type f -not -name "Book_*" -not -name ".DS_Store" -exec mogrify -resize 25x25\> {} \;

echo "** Invoke Inka to add to Anki..."
export DISABLE_QT5_COMPAT=1
source ${INKA_PATH}/activate
${INKA_PATH}/inka2 collect $MARKDOWN_TARGET_PATH
#${INKA_PATH}/inka2 collect --update-ids $MARKDOWN_TARGET_PATH
