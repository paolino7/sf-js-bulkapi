const csv = require("fast-csv");
const fs = require("fs");


function concatCSVAndOutput(csvFilePaths, outputFilePath) {
  const promises = csvFilePaths.map((path) => {
    return new Promise((resolve) => {
      const dataArray = [];
      return csv
        .parseFile(path, { headers: true })
        .on("data", function (data) {
          dataArray.push(data);
        })
        .on("end", function () {
          resolve(dataArray);
        });
    });
  });

  return Promise.all(promises).then((results) => {
    const csvStream = csv.format({ headers: true });
    const writableStream = fs.createWriteStream(outputFilePath);

    writableStream.on("finish", function () {
      console.log("DONE!");
    });

    csvStream.pipe(writableStream);
    results.forEach((result) => {
      result.forEach((data) => {
        csvStream.write(data);
      });
    });
    csvStream.end();
  });
}

module.exports = { concatCSVAndOutput };
