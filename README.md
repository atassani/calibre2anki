# calibre2anki

npm init -y
npm install typescript
npm install --save-dev @types/node

## Extract Json of read books
```bash
calibredb list --fields=id,title,cover,last_modified,\*readdate,rating,tags,\*comments -s '#read:"Yes"' --for-machine --sort-by last_modified > data/calibre_books.json
```

```bash
calibredb list --fields=id,title,cover,last_modified,\*readdate -s '#readdate:">=2022"' --for-machine --sort-by last_modified > data/calibre.json
```

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