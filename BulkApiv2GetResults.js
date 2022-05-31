require("dotenv").config();
const { sfdxAuthenticate } = require("./util/sf-auth");
const { getBulkQueryResult } = require("./util/queryBulkV2");
const { concatCSVAndOutput } = require("./util/concatCSVAndOutput");
const jsforce = require("jsforce");
const fs = require("fs");
const path = require("path");

const sf_username = process.env.SF_USERNAME;
const jobId = process.env.JOB_ID;

const authPromise = sfdxAuthenticate(sf_username);

authPromise.then(async (sfAuthInfo) => {
  console.log(JSON.stringify(sfAuthInfo));

  const conn = new jsforce.Connection({
    instanceUrl: sfAuthInfo.sfUrl,
    accessToken: sfAuthInfo.accessToken,
    version: "54.0",
  });

  const tempFolderName = `temp_${jobId}`;
  try {
    fs.mkdirSync(tempFolderName, { recursive: true });
    await getBulkQueryResult(conn, jobId, tempFolderName);
    const fileNames = fs
      .readdirSync(tempFolderName)
      .map((f) => path.join(tempFolderName, f));
    await concatCSVAndOutput(fileNames, `${jobId}.csv`);
  } catch (error) {
    console.error(error);
  } finally {
    fs.rmSync(tempFolderName, { recursive: true, force: true });
  }
});
