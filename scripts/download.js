#!/bin/env node
const request = require('request');
const zlib = require('zlib');
const fs = require('fs');
const {RequireTransform} = require('./RequireTransform');

const headers = {
  'Accept-Encoding': 'gzip',
};
function downloadAndSave(gzipUrl, filePath) {
  request({
    url: gzipUrl,
    headers,
  })
    .pipe(zlib.createGunzip())
    .pipe(new RequireTransform())
    .pipe(fs.createWriteStream(filePath));
}

function main() {
  // CC-CEDICT
  downloadAndSave(
    'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz',
    `${__dirname}/../data/cedict_ts.u8`,
  );
}

if (require.main === module) {
  main();
}
