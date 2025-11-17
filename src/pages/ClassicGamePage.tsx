import ClassicMode from '../components/game/ClassicMode';
import EndlessMode from '../components/game/EndlessMode';
import ChallengeModeWrapper from '../components/challenge/ChallengeModeWrapper';

export const ClassicGamePage = ({ musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled }) => (
  <ClassicMode mode="classic" musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />
);

export const EndlessGamePage = ({ musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled }) => (
  <EndlessMode 
    mode="endless"
    musicEnabled={musicEnabled} 
    setMusicEnabled={setMusicEnabled} 
    soundEnabled={soundEnabled} 
    setSoundEnabled={setSoundEnabled} 
  />
);

export const ChallengeGamePage = ({ musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled, challenge }) => (
  <ChallengeModeWrapper 
    challenge={challenge} 
    musicEnabled={musicEnabled} 
    setMusicEnabled={setMusicEnabled} 
    soundEnabled={soundEnabled} 
    setSoundEnabled={setSoundEnabled} 
  />
);

export default ClassicGamePage; 