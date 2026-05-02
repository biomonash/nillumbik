import { S3Client, CreateBucketCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: "garage",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
}); 

async function setup() {
  try {
    const { Buckets } = await s3.send(new ListBucketsCommand({}));
    console.log("Connected to Garage");

    const bucketName = process.env.S3_BUCKET;
    const exists = Buckets?.some(b => b.Name === bucketName);

    if (!exists) {
      await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log("Bucket created:", bucketName);
    } else {
      console.log("Bucket already exists:", bucketName);
    }
  } catch (err) {
    console.error("Setup failed:", err);
  }
}

await setup();