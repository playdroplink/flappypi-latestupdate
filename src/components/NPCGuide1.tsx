import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

// Mood assets for each NPC
const npcSpriteSets = {
  default: {
    neutral: '/npc gif/npc-9.gif.gif',
    happy: '/npc gif/npc-10.gif.gif',
    thinking: '/npc gif/npc-11.gif.gif',
    surprised: '/npc gif/npc-12.gif.gif',
    wink: '/npc gif/npc-0.gif.gif',
  },
  nicolas: {
    neutral: '/npc/nicolas.png',
happy: '/npc/nicolas.png',
thinking: '/npc/nicolas.png',
surprised: '/npc/nicolas.png',
wink: '/npc/nicolas.png',
  },
  chengdiao: {
    neutral: '/npc/chengdiao.png',
happy: '/npc/chengdiao.png',
thinking: '/npc/chengdiao.png',
surprised: '/npc/chengdiao.png',
wink: '/npc/chengdiao.png',
  },
};

const moodDialog: Record<string, string[]> = {
  neutral: [
    'Welcome! Need any help?',
    'Just chilling here.',
    'Anything I can do for you?',
    'I\'m always here if you need me.',
    'Another day, another flap!',
    'Feeling neutral - not bad, not great.',
    'Let\'s keep it simple today.',
    'No drama, just flying.',
    'Stable skies today.',
    'Do what you do best!',
  ],
  happy: [
    'Glad to see you! Ask me anything.',
    'Feeling fantastic! :D',
    'Flapping high on happiness!',
    'You\'re awesome - just saying!',
    'Yay! You\'re back!',
    'Let\'s crush those pipes together!',
    'Happiness is a good score!',
    'I\'m smiling... can\'t you tell?',
    'Today\'s a great day to fly!',
    'Joy levels: 100',
  ],
  thinking: [
    'Hmm... let me think about that.',
    'Processing... please wait.',
    'Interesting... give me a second.',
    'Analyzing flappy data...',
    'What would a wise bird do?',
    'The skies hold answers.',
    'Thinking deep thoughts...',
    'Is it worth the flap?',
    'Could we go higher...?',
    'Contemplating bird stuff.',
  ],
  surprised: [
    'Oh! That was unexpected!',
    'Whoa! Didn\'t see that coming!',
    'You flapped right through!',
    'How\'d you do that?!',
    'Pipes came outta nowhere!',
    'Mind = Blown',
    'What a twist!',
    'Now THAT was wild!',
    'You surprised even me!',
    'Impressive reflexes!',
  ],
  wink: [
    'I have a secret for you! ;)',
    'Wanna hear a trick?',
    'Only the best players know this...',
    'Don\'t tell anyone, but...',
    'I see what you\'re up to ;)',
    'Little birdie told me something...',
    'Stay flappy, stay sneaky ;)',
    'Between us... you\'re a pro.',
    'You didn\'t hear this from me...',
    'One flap ahead of the rest!',
  ],
  sad: [
    'Aww... missed that one.',
    'That pipe was unfair :(',
    'We\'ll get it next time.',
    'Don\'t be too hard on yourself.',
    'Falling hurts... emotionally.',
    'Sigh... so close.',
    'It\'s okay to flap again.',
    'Feathers down... for now.',
    'Even the best fall.',
    'Let\'s cheer up together!',
  ],
  tired: [
    'Need a break?',
    'Let\'s rest those wings.',
    'I\'m flapped out...',
    'Nap time?',
    'Just five more minutes...',
    'That was exhausting!',
    'We\'ve earned a pause.',
    'Battery low. Must recharge.',
    'Whew! That run was intense.',
    'Yawn... still here though.',
  ],
  excited: [
    'Let\'s GO!',
    'Can you feel the hype?!',
    'This is the one!',
    'Record incoming!',
    'You\'re on fire!',
    'I\'m pumped - you?',
    'Full speed ahead!',
    'The sky\'s not the limit!',
    'This is your moment!',
    'We\'re unstoppable!',
  ],
  confused: [
    'Wait... what just happened?',
    'I blinked and missed it!',
    'Was that the right flap?',
    'So many pipes, so little time...',
    'Did that just glitch?',
    'I don\'t get it... but okay!',
    'Something\'s off... or is it?',
    'Where am I?',
    'Who moved the pipes?!',
    'That was... weird.',
  ],
  annoyed: [
    'Ugh, not again!',
    'These pipes are rigged!',
    'Seriously?!',
    'Flap rage intensifying!',
    'That\'s just rude!',
    'I can\'t even...',
    'Come on, focus!',
    'We trained for this!',
    'Enough is enough!',
    'Not cool, pipes... not cool.',
  ],
};

const moodList = ['neutral', 'happy', 'thinking', 'surprised', 'wink'];

type Mood = keyof typeof npcSpriteSets['default'];
type NPCType = keyof typeof npcSpriteSets;

interface NPCGuideProps {
  initialMood?: Mood;
  style?: React.CSSProperties;
  className?: string;
  dialogStyle?: React.CSSProperties;
  npcName?: string;
  npcType?: NPCType;
  onAsk?: (mood: Mood) => void;
  dialog?: string;
  dialogs?: string[];
}

const NPCGuide: React.FC<NPCGuideProps> = ({
  initialMood = 'neutral',
  style = {},
  className = '',
  dialogStyle = {},
  npcName = 'NPC',
  npcType = 'default',
  onAsk,
  dialog,
  dialogs,
}) => {
  const { theme } = useTheme();
  const [mood, setMood] = useState<Mood>(initialMood);
  const [anim, setAnim] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<string>(() => {
    if (dialogs && dialogs.length > 0) return dialogs[0];
    if (dialog) return dialog;
    return '';
  });

  useEffect(() => {
    if (dialogs && dialogs.length > 0) setCurrentDialog(dialogs[0]);
    else if (dialog) setCurrentDialog(dialog);
  }, [dialogs, dialog]);

  const handleAsk = () => {
    const idx = moodList.indexOf(mood);
    const nextMood = moodList[(idx + 1) % moodList.length] as Mood;
    setMood(nextMood);
    setAnim(true);
    if (onAsk) onAsk(nextMood);
    setTimeout(() => setAnim(false), 600);
    if (dialogs && dialogs.length > 1) {
      let nextDialog = currentDialog;
      let tries = 0;
      while (dialogs.length > 1 && nextDialog === currentDialog && tries < 10) {
        nextDialog = dialogs[Math.floor(Math.random() * dialogs.length)];
        tries++;
      }
      setCurrentDialog(nextDialog);
    } else if (!dialogs && !dialog) {
      setCurrentDialog(moodDialog[nextMood]?.[Math.floor(Math.random() * moodDialog[nextMood]?.length)] ?? '');
    }
  };

  const sprites = npcSpriteSets[npcType] || npcSpriteSets.default;

  return (
    <div
      className={`flex flex-col items-center select-none ${className}`}
      style={{
        position: 'relative',
        zIndex: 30,
        ...style,
      }}
      onClick={handleAsk}
      onTouchEnd={handleAsk}
      role="button"
      tabIndex={0}
      aria-label={`Tap to get a new tip or dialog`}
    >
      <div
        className={`npc-dialog-bubble ${theme === 'night' ? 'bg-gray-800 border-gray-600' : 'bg-yellow-50 border-yellow-200'} border-2 rounded-xl font-semibold shadow-md mb-2 text-center`}
        style={{
          padding: '12px 20px',
          fontSize: 'clamp(15px, 4vw, 18px)',
          borderRadius: 20,
          maxWidth: '90vw',
          minWidth: 0,
          boxShadow: theme === 'night' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px #ffe08244',
          position: 'relative',
          color: theme === 'night' ? '#ffffff' : '#333333',
          ...dialogStyle,
        }}
      >
        {currentDialog || dialog || moodDialog[mood]?.[Math.floor(Math.random() * moodDialog[mood]?.length)]}
        <span
          style={{
            position: 'absolute',
            left: '50%',
            bottom: -16,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '16px solid #fffbe0',
            zIndex: 1,
          }}
        />
      </div>
      <button
        onClick={handleAsk}
        aria-label={`Ask ${npcName}`}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', outline: 'none' }}
      >
        <img
          src={sprites[mood]}
          alt={npcName}
          style={{
            width: 64,
            height: 64,
            transition: 'transform 0.4s cubic-bezier(.68,-0.55,.27,1.55)',
            transform: anim ? 'scale(1.15) rotate(-8deg)' : 'scale(1)',
            filter: anim ? 'brightness(1.1)' : 'none',
            animation: 'npc-bounce 1.6s infinite',
          }}
        />
      </button>
      <div className="npc-name-text" style={{ fontSize: 12, color: theme === 'night' ? '#fbbf24' : '#bfae5e', marginTop: 2 }}>{npcName}</div>
      <style>{`
        @keyframes npc-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
};

export default NPCGuide; 