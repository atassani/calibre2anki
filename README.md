# calibre2anki

npm init -y
npm install typescript
npm install --save-dev @types/node

## Convert images
With ImageMagick, replacing in-place with `mogrify` instead of using `convert`, we reduce files to 500x500 max, not modifying smaller images.

The '>' parameter instructs `mogrify` to modify only bigger images.

```bash
mogrify -resize 500x500\> /Home/toni.tassani/Downloads/calibre-books/*
```

## Metadata extraction for Anki

Extracted with the following command:

```bash
calibredb list --fields=id,title,authors,pubdate,cover,last_modified,\*readdate,rating,tags,\*comments -s '#read:"Yes"' --for-machine --sort-by last_modified > data/calibre_books.json
```

Could use `-s '#readdate:">=2022"'`.

Formats (with format: at the beginning):

audiobook
borrowed
ebook
ebookok
files
kindle
lent
physical
safari
warning