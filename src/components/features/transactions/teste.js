/**
 * 🎤 Whisper Audio Transcriber
 * Captura áudio do microfone e transcreve usando Whisper (Hugging Face Transformers.js)
 */

import { pipeline } from "@huggingface/transformers";

// Classe para gerenciar a transcrição de áudio com Whisper
export class WhisperAudioTranscriber {
  constructor() {
    this.transcriber = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  // Inicializar o pipeline do Whisper (lazy loading)
  async initializeTranscriber() {
    if (!this.transcriber) {
      console.log("🔄 Carregando modelo Whisper...");
      // Usando modelo em português para melhor precisão
      this.transcriber = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-tiny" // Modelo multilíngue, suporta português
      );
      console.log("✅ Whisper carregado com sucesso!");
    }
    return this.transcriber;
  }

  // Iniciar gravação de áudio
  async startRecording() {
    try {
      // Verificar se getUserMedia está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Seu navegador não suporta gravação de áudio. Por favor, use HTTPS ou um navegador mais recente."
        );
      }

      // Solicitar acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // Whisper espera 16kHz
          channelCount: 1, // Mono
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.audioChunks = [];

      // Criar MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      // Coletar chunks de áudio
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      console.log("🎤 Gravação iniciada...");

      return true;
    } catch (error) {
      console.error("❌ Erro ao acessar microfone:", error);

      // Mensagens de erro mais específicas
      if (error.name === "NotAllowedError") {
        throw new Error(
          "Permissão para acessar o microfone foi negada. Por favor, permita o acesso ao microfone."
        );
      } else if (error.name === "NotFoundError") {
        throw new Error("Nenhum microfone foi encontrado no dispositivo.");
      } else if (error.name === "NotSupportedError") {
        throw new Error(
          "Gravação de áudio não é suportada neste navegador. Use HTTPS."
        );
      } else if (error.message.includes("getUserMedia")) {
        throw new Error(
          "Gravação de áudio só funciona em conexões HTTPS ou localhost."
        );
      }

      throw error;
    }
  }

  // Parar gravação e retornar áudio
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error("Gravação não iniciada"));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Criar blob do áudio
          const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });

          // Parar todas as tracks de mídia
          this.mediaRecorder.stream
            .getTracks()
            .forEach((track) => track.stop());

          this.isRecording = false;
          console.log("⏹️ Gravação finalizada");

          resolve(audioBlob);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  // Converter áudio para o formato esperado pelo Whisper
  async processAudioBlob(audioBlob) {
    try {
      // Converter blob para ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();

      // Usar AudioContext para processar
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)({
        sampleRate: 16000,
      });

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Extrair dados de áudio (canal 0 = mono ou primeiro canal)
      let audioData = audioBuffer.getChannelData(0);

      // Se tiver múltiplos canais, fazer merge
      if (audioBuffer.numberOfChannels > 1) {
        const SCALING_FACTOR = Math.sqrt(2);
        const channel1 = audioBuffer.getChannelData(0);
        const channel2 = audioBuffer.getChannelData(1);

        audioData = new Float32Array(channel1.length);
        for (let i = 0; i < channel1.length; i++) {
          audioData[i] = (SCALING_FACTOR * (channel1[i] + channel2[i])) / 2;
        }
      }

      return audioData;
    } catch (error) {
      console.error("❌ Erro ao processar áudio:", error);
      throw error;
    }
  }

  // Transcrever áudio capturado
  async transcribe(audioBlob) {
    try {
      // Garantir que o transcriber está inicializado
      await this.initializeTranscriber();

      console.log("🔄 Processando áudio...");
      const start = performance.now();

      // Processar áudio
      const audioData = await this.processAudioBlob(audioBlob);

      console.log("🔄 Transcrevendo com Whisper...");
      // Transcrever com Whisper
      const output = await this.transcriber(audioData, {
        language: "portuguese", // Forçar português
        task: "transcribe",
      });

      const end = performance.now();
      console.log(
        `✅ Transcrição concluída em ${((end - start) / 1000).toFixed(2)}s`
      );
      console.log("📝 Texto:", output.text);

      return output.text;
    } catch (error) {
      console.error("❌ Erro na transcrição:", error);
      throw error;
    }
  }

  // Método completo: gravar e transcrever
  async recordAndTranscribe(onTranscriptionUpdate) {
    try {
      // Inicializar modelo em paralelo com a gravação
      const initPromise = this.initializeTranscriber();

      await this.startRecording();

      // Aguardar inicialização do modelo
      await initPromise;

      // Retornar funções de controle
      return {
        stop: async () => {
          const audioBlob = await this.stopRecording();
          const transcription = await this.transcribe(audioBlob);
          if (onTranscriptionUpdate) {
            onTranscriptionUpdate(transcription);
          }
          return transcription;
        },
        isRecording: () => this.isRecording,
      };
    } catch (error) {
      console.error("❌ Erro no processo de gravação/transcrição:", error);
      throw error;
    }
  }

  // Transcrever arquivo de áudio (URL ou Blob)
  async transcribeFromFile(audioSource) {
    try {
      await this.initializeTranscriber();

      let audioBlob;

      if (typeof audioSource === "string") {
        // É uma URL
        const response = await fetch(audioSource);
        audioBlob = await response.blob();
      } else {
        // Já é um Blob/File
        audioBlob = audioSource;
      }

      return await this.transcribe(audioBlob);
    } catch (error) {
      console.error("❌ Erro ao transcrever arquivo:", error);
      throw error;
    }
  }
}

// Singleton para uso global
let globalTranscriber = null;

export const getWhisperTranscriber = () => {
  if (!globalTranscriber) {
    globalTranscriber = new WhisperAudioTranscriber();
  }
  return globalTranscriber;
};
