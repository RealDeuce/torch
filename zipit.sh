#!/bin/sh

rm torch.zip
cd .. && zip -x\*.git\* -r torch/torch.zip torch -x \*.git\* \*.sh \*test\* \*.vscode\* \*design\*
