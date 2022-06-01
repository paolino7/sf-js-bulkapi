const fs = require("fs");
const path = require("path");
const sfbulk = require("node-sf-bulk2");
const { resolve } = require("path");
const axios = require("axios").default;

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

    await getData(conn, bulkapi2, jobId, tempFolderName, undefined);
  } catch (ex) {
    console.log(ex);
  }
};

async function getData(conn, bulkapi2, jobId, tempFolderName, stSfLocator) {
  let response;
  let fileName;
  if (stSfLocator) {
    fileName = path.join(tempFolderName, `result_${stSfLocator}.csv`);
    response = await getBulkQueryResults(conn, jobId, fileName, stSfLocator);
  } else {
    fileName = path.join(tempFolderName, `result.csv`);
    response = await getBulkQueryResults(conn, jobId, fileName);
  }

  if (response.status === 200) {
    const sfLocator = response.headers["sforce-locator"];
    const numOfRecords = response.headers["sforce-numberofrecords"];
    console.log(
      `Bulk job read ok - Num of records in this chunk ${numOfRecords} - Next Locator ${sfLocator}`
    );
    // fs.writeFileSync(fileName, response.data);
    const fileStream = fs.createWriteStream(fileName);
    const stream = response.data;
    stream.on("data", (data) => {
      fileStream.write(data);
    });
    stream.on("end", () => {
      fileStream.end();
      console.log("stream done");
    });

    if (sfLocator === null || sfLocator === "null") {
      console.log(`Retrieve Done!`);
      return Promise.resolve();
    } else {
      return getData(conn, bulkapi2, jobId, tempFolderName, sfLocator);
    }
  }
}

async function getBulkQueryResults(conn, jobId, fileName, locator, maxRecords) {
  let endpoint =
    conn.instanceUrl + "/services/data/v54.0/jobs/query/" + jobId + "/results";
  if (locator) {
    endpoint += "?locator=" + locator;
    if (maxRecords) {
      endpoint += "&maxRecords=" + maxRecords;
    }
  } else {
    if (maxRecords) {
      endpoint += "?maxRecords=" + maxRecords;
    }
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + conn.accessToken,
    accept: "text/csv",
  };
  const requestConfig = {
    headers,
  };
  requestConfig.maxBodyLength = Infinity;
  requestConfig.maxContentLength = Infinity;
  requestConfig.responseType = "stream";
  return axios({
    method: "get",
    url: endpoint,
    headers: headers,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    responseType: "stream",
  });
}

module.exports = { submitBulkQuery, getBulkQueryResult };
