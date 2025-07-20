class AudioSystem {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.volume = 0.5;
        this.musicVolume = 0.3;
        this.enabled = true;
        this.audioContext = null;
        this.soundBuffers = {};
        this.currentMusic = null;
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.loadSounds();
            this.playBackgroundMusic();
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Audio system failed to initialize:', error);
            this.enabled = false;
        }
    }

    async loadSounds() {
        // **MUSIQUE D'AMBIANCE**
        const musicFiles = {
            cosmic1: 'audio/soundtrack/Cosmic Carnage (1).mp3',
            cosmic2: 'audio/soundtrack/Cosmic Carnage.mp3',
            void1: 'audio/soundtrack/Void Ascension (1).mp3',
            void2: 'audio/soundtrack/Void Ascension.mp3'
        };

        // **EFFETS SONORES PRÉCIS**
        const soundFiles = {
            roomChange: 'audio/fx/mixkit-drums-of-war-2784.wav',
            explosion: 'audio/fx/mixkit-epic-impact-afar-explosion-2782.wav',
            autoFire: 'audio/fx/mixkit-short-laser-gun-shot-1670.wav',
            semiFire: 'audio/fx/mixkit-game-gun-shot-1662.mp3',
            singleFire: 'audio/fx/mixkit-shatter-shot-explosion-1693.wav'
        };

        // Chargement musique
        for (const [name, path] of Object.entries(musicFiles)) {
            try {
                this.music[name] = await this.loadAudioBuffer(path);
            } catch (error) {
                console.warn(`Failed to load music ${name}:`, error);
            }
        }

        // Chargement effets
        for (const [name, path] of Object.entries(soundFiles)) {
            try {
                this.sounds[name] = await this.loadAudioBuffer(path);
            } catch (error) {
                console.warn(`Failed to load sound ${name}:`, error);
            }
        }
    }

    async loadAudioBuffer(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
    }

    playSound(soundName, volume = 1.0) {
        if (!this.enabled || !this.audioContext || !this.sounds[soundName]) return;

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.sounds[soundName];
            gainNode.gain.value = this.volume * volume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start();
        } catch (error) {
            console.warn('Failed to play sound:', error);
        }
    }

    playMusic(musicName, loop = true) {
        if (!this.enabled || !this.audioContext || !this.music[musicName]) return;

        try {
            // Arrêter musique précédente
            if (this.currentMusic) {
                this.currentMusic.stop();
            }

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.music[musicName];
            source.loop = loop;
            gainNode.gain.value = this.musicVolume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start();
            this.currentMusic = source;
            return source;
        } catch (error) {
            console.warn('Failed to play music:', error);
        }
    }

    playBackgroundMusic() {
        const musicKeys = Object.keys(this.music);
        if (musicKeys.length > 0) {
            const randomMusic = musicKeys[Math.floor(Math.random() * musicKeys.length)];
            this.playMusic(randomMusic);
        }
    }

    playWeaponSound(weaponState) {
        const soundMap = {
            'AUTO': 'autoFire',
            'BURST': 'semiFire',
            'SEMI': 'semiFire',
            'SINGLE': 'singleFire'
        };
        
        const soundName = soundMap[weaponState] || 'autoFire';
        this.playSound(soundName, 0.7);
    }

    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.musicVolume = this.volume * 0.6;
    }

    toggleMute() {
        this.enabled = !this.enabled;
    }
}