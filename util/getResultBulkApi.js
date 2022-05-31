require("dotenv").config();
const { sfdxAuthenticate } = require("./util/sf-auth");
const { concatCSVAndOutput } = require("./util/concatCSVAndOutput");
const jsforce = require("jsforce");
const fs = require("fs");
const path = require("path");



const saveBulkResult = async (conn, bulkJobId) => new Promise((resolve, reject) => {

const bulkJob = conn.bulk.job(bulkJobId);
console.log(`bulkJob : ${bulkJob}`);


let batchInfoList = await bulkJob.list();
// Keep only first batch

batchInfoList.forEach((batchInfo) => {
  const batch = conn.bulk.job(batchInfo.jobId).batch(batchInfo.id);
  const retrievePromises = batch.retrieve(function (err, results) {
    if (err) {
      return console.error(err);
    }
    const fileNameArray = new Array();
    const tempFolderName = `temp_${batchInfo.jobId}`;
    fs.mkdirSync(tempFolderName);
    for (let i = 0; i < results.length; i++) {
      const resultId = results[i].id;
      const fileName = path.join(tempFolderName, `result_${i}.csv`);
      fileNameArray.push(fileName);
      batch.result(resultId).stream().pipe(fs.createWriteStream(fileName));
    }
  });
});

});

module.exports = { saveBulkResult };
