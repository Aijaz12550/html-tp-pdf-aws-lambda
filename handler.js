'use strict';

const chromium = require("chrome-aws-lambda");
const AWS = require("aws-sdk");

const s3 = new AWS.S3();

module.exports.hello = async event => {

  const executablePath = process.env.IS_OFFLINE
  ? null
  : await chromium.executablePath;
let browser = await chromium.puppeteer.launch({
  args: chromium.args,
  executablePath,
});

const page = await browser.newPage();
const loaded = page.waitForNavigation({
  waitUntil: "load",
});

let html = '<h1>hello</h1>'

await page.setContent(html);
await loaded;

const options = {
  format: "A4",
  printBackground: true,
  margin: { top: "1in", right: "1in", bottom: "1in", left: "1in" },
};

let pdf = await page.pdf(options);

console.log("pdf",pdf)

var params = {
  Body: pdf, 
  Bucket: "workaction", 
  Key: "aijazPdf.pdf", 
  Tagging: "key1=value1&key2=value2"
 };
let s3Result = await s3.putObject(params).promise()

console.log("s3Result",s3Result)

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: pdf.toString("base64"),
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
