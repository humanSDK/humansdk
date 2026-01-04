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
        ContentType: file.mimetype
        // ACL removed - bucket has ACLs disabled, use bucket policy for public access instead
    };

    try {
        const uploadResult = await s3.upload(uploadParams).promise();
        
        // Construct public URL (permanent, no expiration)
        // Format: https://bucket-name.s3.region.amazonaws.com/key
        // This requires bucket policy to be set up for public read access
        // See docs/S3_CORS_AND_BUCKET_POLICY.md for setup instructions
        let fileUrl;
        if (uploadResult.Location) {
            // Remove any query parameters if present
            fileUrl = uploadResult.Location.split('?')[0];
        } else {
            // Fallback: construct URL manually with region
            fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        }
        
        // Ensure URL includes region (us-east-1 format)
        if (!fileUrl.includes(`.s3.${process.env.AWS_REGION}.amazonaws.com`)) {
            // Replace s3.amazonaws.com with s3.region.amazonaws.com for consistency
            fileUrl = fileUrl.replace('.s3.amazonaws.com', `.s3.${process.env.AWS_REGION}.amazonaws.com`);
        }
        
        console.log('File uploaded successfully. Public URL (permanent):', fileUrl);
        console.log('Object Key:', uploadParams.Key);
        console.log('⚠️  Make sure bucket policy is set up for public read access!');
        
        return {
            name: file.originalname,
            url: fileUrl
        };
    } catch (error) {
        console.error('S3 upload error:', error);
        throw error;
    }
};

module.exports = uploadToS3;