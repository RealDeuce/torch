#/bin/bash
wkdir=$(cd "$(dirname "$0")"; pwd -P)
if [ ! -e "${wkdir}/Data" ]; then 
  mkdir ${wkdir}/Data
fi
case ${1:-8} in
  7) vttver="foundryvtt-0.7.10";;
  8) vttver="foundryvtt-0.8.8";;
  9) vttver="foundryvtt-0.9.226";;
esac
if [ -z ${vttver} ]; then
  echo "Invalid Foundry major version specified"
  exit -1
fi
if [ ! -e ${wkdir}/${vttver}/resources/app/main.js ]; then
  echo "Foundry not installed in ${wkdir}/${vttver}"
  exit -2
fi
echo Starting Foundry in ${wkdir}/${vttver}...
if [ ! -e "${wkdir}/Data/${vttver}" ]; then 
  mkdir ${wkdir}/Data/${vttver}
fi
node ${wkdir}/${vttver}/resources/app/main.js --dataPath="${wkdir}/Data/${vttver}"
