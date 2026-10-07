import { createRequire } from "node:module";
import { z } from "zod";
import z$1 from "@deepseek-ai/schemastery";
import { MAX_TIMER_DELAY_MS } from "@deepseek-ai/dsh-timeout";
import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";

//#region config
const Config = z$1.object({
	providerId: z$1.string().min(1).default("whisper-local"),
	dataRoot: z$1.string().min(1).required(),
	modelDirectory: z$1.union([z$1.string().min(1), z$1.const(void 0)]),
	tokensPath: z$1.union([z$1.string().min(1), z$1.const(void 0)]),
	model: z$1.union(["base", "small", "medium"]).default("small"),
	precision: z$1.union(["int8", "fp32"]).default("int8"),
	modelOrigin: z$1.union([z$1.string().pattern(/^https?:\/\/[^/\s?#@]+\/?$/), z$1.const(void 0)]),
	modelOrigins: z$1.array(z$1.string().pattern(/^https?:\/\/[^/\s?#@]+\/?$/)).min(1).default(["https://huggingface.co", "https://hf-mirror.com"]),
	modelProbeTimeoutMs: z$1.natural().min(1).max(MAX_TIMER_DELAY_MS).default(3e3),
	threads: z$1.natural().min(1).default(2),
	maxAudioBytes: z$1.natural().min(46).default(4 * 1024 * 1024),
	prepareTimeoutMs: z$1.natural().min(1).max(MAX_TIMER_DELAY_MS).default(36e5),
	inferenceTimeoutMs: z$1.natural().min(1).max(MAX_TIMER_DELAY_MS).default(12e4),
	idleTimeoutMs: z$1.natural().max(MAX_TIMER_DELAY_MS).default(3e5),
	maxPending: z$1.natural().min(1).default(4),
	graceMs: z$1.natural().min(1).max(MAX_TIMER_DELAY_MS).default(1e3),
	maxLogBytes: z$1.natural().min(1).default(64 * 1024),
	maxResponseBytes: z$1.natural().min(1).default(128 * 1024),
	progressIntervalMs: z$1.natural().min(1).max(MAX_TIMER_DELAY_MS).default(100)
});
//#endregion

//#region input
const languages = [
	"auto",
	"ru",
	"en",
	"uk",
	"be",
	"de",
	"fr",
	"es",
	"it",
	"pl",
	"tr",
	"zh",
	"ja",
	"ko"
];
var SpeechInputError = class extends Error {};

function validateWave(audio, maxDurationSeconds) {
	const data = Buffer.from(audio.buffer, audio.byteOffset, audio.byteLength);
	if (data.length < 46 || data.toString("ascii", 0, 4) !== "RIFF"
		|| data.toString("ascii", 8, 12) !== "WAVE" || data.toString("ascii", 12, 16) !== "fmt "
		|| data.readUInt32LE(16) !== 16 || data.readUInt16LE(20) !== 1 || data.readUInt16LE(22) !== 1
		|| data.readUInt32LE(24) !== 16000 || data.readUInt32LE(28) !== 32000
		|| data.readUInt16LE(32) !== 2 || data.readUInt16LE(34) !== 16
		|| data.toString("ascii", 36, 40) !== "data" || data.readUInt32LE(4) !== data.length - 8
		|| data.readUInt32LE(40) !== data.length - 44 || (data.length - 44) % 2 !== 0) {
		throw new Error("Audio must be a canonical 16 kHz mono PCM16 WAV recording");
	}
	const seconds = (data.length - 44) / 32000;
	if (seconds > maxDurationSeconds) throw new Error(`Audio exceeds ${maxDurationSeconds} seconds`);
	return seconds;
}

function validateInput(audio, language, maxAudioBytes) {
	if (!languages.includes(language)) throw new SpeechInputError("Unsupported Whisper language");
	if (audio.byteLength > maxAudioBytes) throw new SpeechInputError("Speech audio exceeds the worker byte limit");
	try {
		return validateWave(audio, maxAudioBytes / 32e3);
	} catch (error) {
		throw new SpeechInputError("Invalid speech WAV", { cause: error });
	}
}
//#endregion

//#region inference
/**
 * Load one Whisper encoder/decoder pair; each recording updates the language hint.
 * Whisper chunks long audio internally, so no external VAD is required.
 */
function createTranscriber(config) {
	const sherpa = createRequire(import.meta.url)("sherpa-onnx-node");
	const nativeConfig = {
		featConfig: {
			sampleRate: 16e3,
			featureDim: 80
		},
		modelConfig: {
			whisper: {
				encoder: config.encoder,
				decoder: config.decoder,
				language: "",
				task: "transcribe",
				tailPaddings: -1
			},
			tokens: config.tokens,
			numThreads: config.threads,
			provider: "cpu",
			debug: 0
		}
	};
	const recognizer = new sherpa.OfflineRecognizer(nativeConfig);
	return (audio, language) => {
		const audioSeconds = validateInput(audio, language, config.maxAudioBytes);
		const pcm = new DataView(audio.buffer, audio.byteOffset + 44, audio.byteLength - 44);
		const samples = Float32Array.from({ length: pcm.byteLength / 2 }, (_, i) => pcm.getInt16(i * 2, true) / 32768);
		// Whisper auto-detects the language when the hint is an empty string.
		nativeConfig.modelConfig.whisper.language = language === "auto" ? "" : language;
		recognizer.setConfig(nativeConfig);
		const started = performance.now();
		const stream = recognizer.createStream();
		stream.acceptWaveform({ sampleRate: 16e3, samples });
		recognizer.decode(stream);
		const text = recognizer.getResult(stream).text.trim();
		return {
			text,
			audioSeconds,
			inferenceSeconds: (performance.now() - started) / 1e3
		};
	};
}
//#endregion

//#region process-server
async function startRecognitionServer(token, maxAudioBytes, transcribe) {
	const expected = Buffer.from(`Bearer ${token}`);
	const server = createServer((request, response) => {
		const reply = (status, value) => {
			response.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(value));
		};
		const authorization = Buffer.from(request.headers.authorization ?? "");
		if (authorization.length !== expected.length || !timingSafeEqual(authorization, expected)) {
			request.resume();
			reply(401, { error: "Unauthorized" });
			return;
		}
		const url = new URL(request.url, "http://localhost");
		if (request.method !== "POST" || url.pathname !== "/transcribe") {
			request.resume();
			reply(404, { error: "Unknown endpoint" });
			return;
		}
		const length = Number(request.headers["content-length"]);
		if (!Number.isSafeInteger(length) || length < 46 || length > maxAudioBytes) {
			request.resume();
			reply(413, { error: "Invalid speech audio size", code: "invalid-input" });
			return;
		}
		(async () => {
			try {
				const chunks = [];
				for await (const chunk of request) {
					chunks.push(chunk);
				}
				reply(200, transcribe(Buffer.concat(chunks), url.searchParams.get("language") ?? "auto"));
			} catch (error) {
				reply(error instanceof SpeechInputError ? 400 : 500, {
					error: error instanceof Error ? error.message : String(error),
					...error instanceof SpeechInputError ? { code: "invalid-input" } : {}
				});
			}
		})();
	});
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", () => {
			server.off("error", reject);
			resolve();
		});
	});
	return {
		server,
		port: server.address().port
	};
}
//#endregion

//#region worker entry
const raw = JSON.parse(z.string().parse(process.argv[2]));
const paths = z.object({
	encoder: z.string().min(1),
	decoder: z.string().min(1),
	tokens: z.string().min(1)
}).parse(raw);
const config = Object.assign(Config(z.record(z.string(), z.unknown()).parse(raw)), paths);
const token = z.string().regex(/^[a-f0-9]{64}$/).parse(process.env.DSH_SPEECH_TOKEN);
delete process.env.DSH_SPEECH_TOKEN;
const { port } = await startRecognitionServer(token, config.maxAudioBytes, createTranscriber(config));
process.stdout.write(`${JSON.stringify({ port })}\n`);
//#endregion

export {};
