require("dotenv").config();
const { sfdxAuthenticate } = require("./util/sf-auth");
const jsforce = require("jsforce");

const sf_username = process.env.SF_USERNAME;
// const pe_to_deliver = process.env.PE_TO_DELIVER;
// const time_frame = process.env.TIME_FRAME;
// const waittime = process.env.WAIT;
// const pe_name = process.env.PE_NAME;
// const body_type = process.env.PE_BODY;

const authPromise = sfdxAuthenticate(sf_username);

authPromise.then(async (sfAuthInfo) => {
  console.log(JSON.stringify(sfAuthInfo));

  const conn = new jsforce.Connection({
    instanceUrl: sfAuthInfo.sfUrl,
    accessToken: sfAuthInfo.accessToken,
  });

  const bulkJob = conn.bulk.job('7502p00000gowIf');
  console.log(`bulkJob : ${JSON.stringify(bulkJob)}`);
});
