#/bin/bash
if [ -z $1 ]; then
  echo "Usage: vttlink [Foundry User Data Path]"
  exit -1
fi
clonedir="$(dirname $(cd "$(dirname "$0")"; pwd -P))"
targetdir=$(cd "$(dirname "$1"/data/modules/torch/torch.js)"; pwd -P)
echo From repo in: $clonedir
echo To module in: $targetdir
# Replace module.json with link
rm $targetdir/module.json
ln -s $clonedir/module.json $targetdir/module.json
rm $targetdir/torch.css
ln -s $clonedir/torch.css $targetdir/torch.css
rm $targetdir/sources.json
ln -s $clonedir/sources.json $targetdir/sources.json
# Replace javascript in root directory with link
for file in $clonedir/*.js
do 
  echo $(basename $file)
  rm $targetdir/$(basename $file)
  ln -s $file $targetdir/$(basename $file)
done
if [ ! -d $targetdir/test ]; then
  mkdir $targetdir/test
fi
# Replace javascript in test directory with link
for file in $clonedir/test/*.js
do
  echo test/$(basename $file)
  if [ -f "$targetdir/test/$(basename $file)" ]; then
    rm $targetdir/test/$(basename $file)
  fi
  ln -s $file $targetdir/test/$(basename $file)
done
for file in $clonedir/lang/*.json
do
  echo test/$(basename $file)
  if [ -f "$targetdir/lang/$(basename $file)" ]; then
    rm $targetdir/lang/$(basename $file)
  fi
  ln -s $file $targetdir/lang/$(basename $file)
done
