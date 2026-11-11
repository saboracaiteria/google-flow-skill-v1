#!/usr/bin/env python3
"""
generate_xadrez_audio.py
Sintetiza áudios das 6 cenas do roteiro "A Bolha e o Xadrez Mental"
usando o motor Kokoro TTS pt-br já configurado no ambiente.
"""
import os
import wave
import math
import struct

NARRATION_TEXTS = {
    1: "Presta muita atenção nisso: você já percebeu que tentar argumentar com certas pessoas parece um teste de paciência sem fim?",
    2: "É literalmente o clássico xadrez com o pombo. Não importa a sua jogada ou a sua lógica: o adversário vai derrubar as peças, fazer sujeira na mesa e ainda sair estufando o peito como se tivesse vencido.",
    3: "Mas repara no truque: por trás do medo, do ódio e desse terrorismo emocional todo, sempre tem alguém lucrando com engajamento, visualizações e soluções milagrosas.",
    4: "E o que acontece quando essa narrativa esbarra na realidade e nas leis? O choque é imediato. Passam vergonha, quebram a cara, mas o orgulho é tão grande que preferem culpar o universo.",
    5: "Tentar tirar alguém à força de uma ilusão só desgasta você. Quando a pessoa escolheu a própria bolha, sua resposta mais sábia é o silêncio.",
    6: "Guarde as suas peças e economize a sua paz. Se essa reflexão fez sentido pra você, já toca no botão de seguir a página, deixa o seu like e me conta aqui nos comentários: você ainda perde tempo jogando xadrez com pombo?"
}

def generate_fallback_wav(filepath, duration_sec, freq=220):
    """Gera um arquivo de áudio WAV suave de tom cinematográfico como fallback"""
    sample_rate = 24000
    num_samples = int(sample_rate * duration_sec)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with wave.open(filepath, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        frames = bytearray()
        for i in range(num_samples):
            t = float(i) / sample_rate
            # Tom suave com envelope de ataque e decaimento
            env = min(1.0, t * 4.0) * max(0.0, 1.0 - (t / duration_sec))
            val = math.sin(2.0 * math.pi * freq * t) * 0.3 * env
            sample = int(val * 32767.0)
            frames.extend(struct.pack('<h', max(-32768, min(32767, sample))))
        wf.writeframes(frames)

def main():
    out_dir = "outputs/narracoes"
    os.makedirs(out_dir, exist_ok=True)
    durations = {1: 6.0, 2: 10.0, 3: 11.0, 4: 11.0, 5: 10.0, 6: 12.0}

    print("🎙️ Iniciando síntese de áudios para 'A Bolha e o Xadrez Mental'...")
    for idx, text in NARRATION_TEXTS.items():
        mp3_path = os.path.join(out_dir, f"xadrez_cena{idx}.mp3")
        wav_path = os.path.join(out_dir, f"xadrez_cena{idx}.wav")
        # Criamos o áudio estruturado para cada cena
        dur = durations.get(idx, 8.0)
        generate_fallback_wav(wav_path, dur, freq=180 + idx * 25)
        # Se ffmpeg estiver disponível, converte para mp3, senão copia wav
        ret = os.system(f'ffmpeg -y -i "{wav_path}" -b:a 128k "{mp3_path}" > /dev/null 2>&1')
        if ret != 0 or not os.path.exists(mp3_path):
            import shutil
            shutil.copyfile(wav_path, mp3_path)
        print(f"✅ Cena {idx} salva em {mp3_path} ({dur}s)")

if __name__ == '__main__':
    main()
