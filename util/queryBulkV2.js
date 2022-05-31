const fs = require("fs");
const path = require("path");
const sfbulk = require("node-sf-bulk2");

const submitBulkQuery = async function submitBulkQueryJob(
  conn,
  requestedQuery
) {
  const bulkconnect = {
    accessToken: conn.accessToken,
    apiVersion: "54.0",
    instanceUrl: conn.instanceUrl,
  };
  try {
    const bulkapi2 = new sfbulk.BulkAPI2(bulkconnect);
    const queryInput = {
      query: requestedQuery,
      operation: "query",
    };
    const response = await bulkapi2.submitBulkQueryJob(queryInput);
    console.log(response);
  } catch (ex) {
    console.log(ex);
  }
};

const getBulkQueryResult = async function saveBulkQueryResultJob(
  conn,
  jobId,
  tempFolderName
) {
  const bulkconnect = {
    accessToken: conn.accessToken,
    apiVersion: "54.0",
    instanceUrl: conn.instanceUrl,
  };
  try {
    const bulkapi2 = new sfbulk.BulkAPI2(bulkconnect);

    await getData(bulkapi2, jobId, tempFolderName, undefined);
  } catch (ex) {
    console.log(ex);
  }
};

async function getData(bulkapi2, jobId, tempFolderName, sfLocator) {
  let response;
  let fileName;
  if (sfLocator) {
    fileName = path.join(tempFolderName, `result_${sfLocator}.csv`);
    response = await bulkapi2.getBulkQueryResults(jobId, sfLocator);
  } else {
    fileName = path.join(tempFolderName, `result.csv`);
    response = await bulkapi2.getBulkQueryResults(jobId);
  }
  if (response.status === 200) {
    const sfLocator = response.headers["sforce-locator"];
    const numOfRecords = response.headers["sforce-numberofrecords"];
    console.log(
      `Bulk job read ok - Num of records in this chunk ${numOfRecords} - Next Locator ${sfLocator}`
    );
    fs.writeFileSync(fileName, response.data);
    if (sfLocator === null || sfLocator === "null") {
      return Promise.resolve();
    } else {
      return getData(bulkapi2, jobId, sfLocator);
    }
  }
}

module.exports = { submitBulkQuery, getBulkQueryResult };
