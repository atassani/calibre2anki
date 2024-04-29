# calibre2anki

## Run

```bash
./calibre2anki.sh
```

To rectify Inka:
```bash
inka collect -u output
```

## Synchronize files with OSMC - Kodi

```bash
rsync -avzhP ~/CalibreLibrary osmc@osmc:/media/Movies
```

Once in OSMC, ssh osmc@osmc and run the following to synchronize with Google Drive:

```bash
rclone sync -P --fast-list --transfers=32 --modify-window=10s --buffer-size=512M /media/Movies/CalibreLibrary gdrive:_for_ubuntu_/Calibre\ Library
```

Same command with `--dry-run` to check what will be done.
```bash
rclone sync --dry-run -P --fast-list --transfers=32 --modify-window=10s --buffer-size=512M /media/Movies/CalibreLibrary gdrive:_for_ubuntu_/Calibre\ Library
```

Rclone was configure with `rclone config`.

## Prepare

mkdir data
mkdir -p output/images
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

## Styles

The following styles were added:

```css
.book p {
  margin: 0 0 0 0;
  padding: 0;
}

.book img {
  vertical-align:middle;
  height: 20px;
}

.book .rating {
  padding: 10px 0 0 0;
  display: inline-bloc
}
```
