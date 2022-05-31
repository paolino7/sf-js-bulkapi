require("dotenv").config();
const { sfdxAuthenticate } = require("./util/sf-auth");
const { submitBulkQuery } = require("./util/queryBulkV2");
const jsforce = require("jsforce");

const sf_username = process.env.SF_USERNAME;

const authPromise = sfdxAuthenticate(sf_username);

authPromise.then(async (sfAuthInfo) => {
  console.log(JSON.stringify(sfAuthInfo));

  const conn = new jsforce.Connection({
    instanceUrl: sfAuthInfo.sfUrl,
    accessToken: sfAuthInfo.accessToken,
    version: "54.0",
  });

  try {
    const query = 'select Id from Account';
    await submitBulkQuery(conn, query);

  } catch (error) {
    console.error(error);
  } finally {
  }
});
