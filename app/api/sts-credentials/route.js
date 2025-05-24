import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { NextResponse } from "next/server";

export async function GET() {
  const {
    AWS_ACCESS_KEY_ID_FOR_STS,
    AWS_SECRET_ACCESS_KEY_FOR_STS,
    STS_ROLE_TO_ASSUME_ARN,
    AWS_REGION, // Optional: If your STS endpoint is region-specific
  } = process.env;

  if (
    !AWS_ACCESS_KEY_ID_FOR_STS ||
    !AWS_SECRET_ACCESS_KEY_FOR_STS ||
    !STS_ROLE_TO_ASSUME_ARN
  ) {
    console.error("Missing AWS STS configuration environment variables.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  const stsClient = new STSClient({
    region: AWS_REGION || "us-east-1", // Default to us-east-1 if not specified
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID_FOR_STS,
      secretAccessKey: AWS_SECRET_ACCESS_KEY_FOR_STS,
    },
  });

  const command = new AssumeRoleCommand({
    RoleArn: STS_ROLE_TO_ASSUME_ARN,
    RoleSessionName: "RekognitionClientSession", // A descriptive session name
    DurationSeconds: 3600, // 1 hour, adjust as needed (min 900, max depends on role)
  });

  try {
    const data = await stsClient.send(command);
    if (data.Credentials) {
      return NextResponse.json({
        accessKeyId: data.Credentials.AccessKeyId,
        secretAccessKey: data.Credentials.SecretAccessKey,
        sessionToken: data.Credentials.SessionToken,
        expiration: data.Credentials.Expiration
          ? data.Credentials.Expiration.toISOString()
          : null,
      });
    } else {
      throw new Error("Failed to obtain temporary credentials.");
    }
  } catch (error) {
    console.error("Error assuming STS role:", error);
    return NextResponse.json(
      { error: "Failed to obtain temporary credentials." },
      { status: 500 }
    );
  }
}

