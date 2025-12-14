const AWS = require('aws-sdk');
require('dotenv').config()
const s3Config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    signatureVersion: 'v4'
};
console.log(s3Config)
const s3 = new AWS.S3(s3Config);
const uploadToS3 = async (file, userId) => {
    // Ensure we have a Buffer
    const fileBuffer = Buffer.isBuffer(file.buffer) 
        ? file.buffer 
        : Buffer.from(file.buffer);

    const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `comments/${userId}/${Date.now()}-${file.originalname}`,
        Body: fileBuffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
    };

    try {
        const uploadResult = await s3.upload(uploadParams).promise();
        return {
            name: file.originalname,
            url: uploadResult.Location
        };
    } catch (error) {
        console.error('S3 upload error:', error);
        throw error;
    }
};

module.exports = uploadToS3;