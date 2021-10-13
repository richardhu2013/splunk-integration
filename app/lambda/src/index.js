/**
 * Splunk logging for AWS Lambda
 *
 * This function logs to a Splunk host using Splunk's HTTP event collector API.
 *
 * Define the following Environment Variables in the console below to configure
 * this function to log to your Splunk host:
 *
 * 1. SPLUNK_HEC_URL: URL address for your Splunk HTTP event collector endpoint.
 * Default port for event collector is 8088. Example: https://host.com:8088/services/collector
 *
 * 2. SPLUNK_HEC_TOKEN: Token for your Splunk HTTP event collector.
 * To create a new token for this Lambda function, refer to Splunk Docs:
 * http://docs.splunk.com/Documentation/Splunk/latest/Data/UsetheHTTPEventCollector#Create_an_Event_Collector_token
 */
// const loggerConfig = {
//     url: process.env.SPLUNK_HEC_URL,
//     token: process.env.SPLUNK_HEC_TOKEN,
// };
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const loggerConfig = {
    url: 'https://inputs.prd-p-g6r6k.splunkcloud.com:8088/services/collector/event',
    token: '',
};

const SplunkLogger = require('./lib/splunklogger');

const logger = new SplunkLogger(loggerConfig);

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // // Log JSON objects to Splunk
    // logger.log('xxxxxxxxxxxxx',event);

    // // Log JSON objects with optional 'context' argument (recommended)
    // // This adds valuable Lambda metadata including functionName as source, awsRequestId as field
    // logger.log(event, context);

    // // Log strings
    // logger.log(`value1 = ${event.key1}`, context);

    // // Log with user-specified timestamp - useful for forwarding events with embedded
    // // timestamps, such as from AWS IoT, AWS Kinesis, AWS CloudWatch Logs
    // // Change "Date.now()" below to event timestamp if specified in event payload

    const Bucket = event.Records[0].s3.bucket.name;
    const Key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    console.log(Bucket, Key);
    // Retrieve the object
    s3.getObject({ Bucket, Key }, function(err, data) {
        if (err) {
            console.log('xxxxxx read error')
            console.log(err, err.stack);
            callback(err);
        } else {
            console.log("Raw text:\n" + data.Body.toString('ascii'));
            logger.logWithTime(Date.now(), data.Body.toString('ascii'), context);
              console.log("Flush it");
            logger.flushAsync((error, response) => {
                if (error) {
                    callback(error);
                } else {
                    console.log(`Response from Splunk:\n${response}`);
                    callback(null, event.key1); // Echo back the first key value
                }
            });
        }
    });
};
