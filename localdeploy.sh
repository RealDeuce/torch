#!/bin/ sh
echo VTTDATA = $VTTDATA
echo VTT7DATA = $VTT7DATA
cp -v torch.js "$VTTDATA/modules/torch/torch.js"
cp -v module.json "$VTTDATA/modules/torch/module.json"
cp -v README.md "$VTTDATA/modules/torch/README.md"
cp -v lang/*.json "$VTTDATA/modules/torch/lang/"
cp -v torch.js "$VTT7DATA/modules/torch/torch.js"
cp -v module.json "$VTT7DATA/modules/torch/module.json"
cp -v README.md "$VTT7DATA/modules/torch/README.md"
cp -v lang/*.json "$VTT7DATA/modules/torch/lang/"
