import crypto from "node:crypto";
import { config } from "./config";
import { generateStreamKey } from "./stream-crypto";

export type StreamProvision = {
  provider: string;
  providerStreamId: string;
  ingestUrl: string;
  streamKey: string;
  playbackUrl: string | null;
};

export interface StreamProvider {
  provision(input: { creatorId: string; username: string }): Promise<StreamProvision>;
  regenerate(input: { creatorId: string; username: string }): Promise<StreamProvision>;
}

class StubStreamProvider implements StreamProvider {
  async provision(input: { creatorId: string; username: string }) {
    const streamKey = generateStreamKey();
    const providerStreamId = `stub_${input.creatorId}_${crypto.randomBytes(5).toString("hex")}`;
    return {
      provider: "stub",
      providerStreamId,
      ingestUrl: process.env.RTMP_INGEST_URL ?? "rtmp://ingest.l00t.tv/live",
      streamKey,
      playbackUrl: `${process.env.PLAYBACK_BASE_URL ?? "https://playback.l00t.tv"}/${input.username}.m3u8`,
    };
  }

  async regenerate(input: { creatorId: string; username: string }) {
    return this.provision(input);
  }
}

class UnconfiguredProvider implements StreamProvider {
  constructor(private readonly name: string) {}

  async provision(): Promise<StreamProvision> {
    throw new Error(
      `${this.name} streaming is selected but provider credentials are not configured. Set STREAM_PROVIDER=stub for local development or configure the provider adapter.`,
    );
  }

  async regenerate(): Promise<StreamProvision> {
    return this.provision();
  }
}

export function getStreamProvider(): StreamProvider {
  if (config.streamProvider === "stub") return new StubStreamProvider();

  if (config.streamProvider === "livekit") {
    if (config.livekit.url && config.livekit.apiKey && config.livekit.secret) {
      return new UnconfiguredProvider("LiveKit");
    }
    return new UnconfiguredProvider("LiveKit");
  }

  return new UnconfiguredProvider(config.streamProvider);
}
