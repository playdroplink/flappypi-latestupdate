import React, { useState, useRef } from 'react';
import ShareScoreTemplate from './ShareScoreTemplate';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { submitScore } from '../utils/supabaseLeaderboard';
import { PiAuthUtils } from '../utils/piAuthUtils';
import { useUserProfile } from '../hooks/useUserProfile';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';
import { 
  processElementToImage, 
  copyImageToClipboard, 
  downloadImage,
  shareImage,
  getImageSharingCapabilities 
} from '@/utils/imageUtils';
import { getDisplayUsername } from '../utils/usernameUtils';

interface ShareScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  level: number;
  coins: number;
  bestScore: number;
  username?: string;
  birdSkinUrl?: string;
  gameMode?: string;
}

const COLORS = {
  Red: '#ef4444',
  Green: '#22c55e',
  Blue: '#3b82f6',
  Violet: '#8b5cf6',
};

const postDescriptions = [
  `Just hit a personal best in Flappy Pi! 🏆 Can you fly higher?\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Wings of steel! Flapped through a record run today 🐤💪\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Feeling unstoppable in Flappy Pi! Beat me if you can 😎\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `50 pipes? Light work. Who's next?\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Score so high even Pi couldn’t calculate it! 🧠📈\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flappy Pi run = flawless. Now it’s your turn!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `High score alert! My flapping skills are elite 🔥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Breaking records one flap at a time! 🐦💨\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Legit the hardest game I can’t stop playing 😂\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flappy mode: activated. 💯 Score: insane.\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Hit a new high score while everyone was sleeping 💤🌙\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Who needs wings when you’ve got skill? 🦅🔥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `New day, new score, same unbeatable flaps 🐤🚀\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `That moment when you’re 1 pipe from glory 😩 Try me!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flapping through Pi like a pro! 🔄💎\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flappy fingers on fire!🔥 Score going UP!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Almost lost, but I FLAPPED back! 😤💪\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Zero to hero in Flappy Pi — let’s see your skills 😎\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Every tap counts — just ask my high score 😅📲\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Call me the Flappy Pi GOAT 🐐💥 Try to beat me\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Got Pi? I’ve got pipes too 🧮🚧\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `One run. One life. One legend. 🐥💫\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `This ain’t your ordinary flap... it’s Flappy Pi! 🕹️🔥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Challenged myself and WON. Can you say the same?\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flapping feels good when you’re breaking scores! 😜\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Only legends survive past 100 pipes. Am I one?\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Had to pause... because my score was UNREAL 😳📈\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flappy Pi = 🔥 Pure skill, no luck. Try to beat this!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Who needs rest? I need more pipes to pass! 💪💤\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Score update: officially unbeatable. 😤 Tap to try.\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `The Pi-powered bird that never quits 🐤⚡\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Soaring through the Pi-sky like a boss 💸☁️\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Hit that flap rhythm just right 🎵🔥 Flappy Master\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `I didn’t just flap — I dominated 😈🎮\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Respect the flap. Fear the score 🐤😱\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Tapped my way to the top of the charts 📲📊\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `No shortcuts. Just perfect flaps 😤🔥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Best feeling? Smashing my last score 😁🏆\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Tap. Tap. Victory. 🐣💥 Flappy Champion here!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Got tunnel vision passing pipes 😶‍🌫️💨 Beat that!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Eyes closed. Still scored. OK maybe not 🤣 Try me!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Even gravity couldn’t stop me today 🚀🕹️\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `It’s not just a game, it’s a lifestyle 😎 Flappy Pi fam!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Some say I was born to flap… and score 🐣✨\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `This is what domination looks like 🔥 Check my score\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Leaderboard? Already there 😌 Let’s see your run\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Think fast, flap faster! 🐤💫 Challenge accepted?\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Sweaty hands. Huge score. Worth it 😤🙌\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Built different. Scored different. 🛠️👑\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `One word: Legendary. 🏅 Tap if you dare.\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Every flap was worth it — that score tho! 🐤💯\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Can’t lie, I’m addicted to Flappy Pi now 😅🎮\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Pipe after pipe… and I STILL didn’t fall! 🔥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `They said it was impossible. I made it look easy 😏\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `No cap, Flappy Pi just made my day 💥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Sore thumbs, happy score 😆📱 Come beat it!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `That “just one more try” feeling 😵 Now I’m top score!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `I flapped. I focused. I flew past records 🐥🚀\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Too smooth. Too fast. Too flappy 🔥 Try match my score!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Never thought a game could be this fun... and frustrating 😂\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Hit a milestone today — feeling like a real Pi pro 💎\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `It’s not luck. It’s skill. And I’ve got both 😤💥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `What’s better than a high score? Bragging rights 😎\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Wanna see magic? Watch my Flappy Pi run 🎩✨\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Fly high, Pi strong 🐦💪 Let’s go!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `All gas, no flap breaks 🏎️🔥 Beat my score if you can!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Even gravity is jealous of my Flappy Pi moves 😮‍💨\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Feels good being a Pi bird legend 🐤👑 Come challenge me!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `I blinked and still made it through! That’s reflex 🔄\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `So close to rage quitting… but I got the W! 😅\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Big flaps, big dreams 🕊️💭 See if you can reach me!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `No cheat codes here, just raw Pi power 😤💫\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `My bird’s basically a superhero at this point 🦸‍♂️🐥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Haters say it’s luck, I say it’s practice 😏🎮\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Real ones know how hard this game is 😤 Props if you beat me\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Sleep? Nah. I’m flapping through the night 💤✨\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `New high score. New attitude 😎 Let’s gooo!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `They said I couldn't... I flapped anyway 😤💥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `One tap at a time… straight to victory! 🎯🐤\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Best game in the Pi Universe? Flappy Pi. Hands down 💯\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `When the pipes align just right... pure bliss 😌📈\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `I’m not competitive, unless we’re playing Flappy Pi 🐥😏\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `This score? Historic. Screenshot it 😤📸\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Nothing but net—wait, I mean pipes 😎🏆\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Call me the Pi Piper 🎵 I just fly through all pipes 🎮\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `No excuses. Just high scores. Bring yours 📲🔥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flapping is life. This score proves it 🧬🐦\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Game on. Scores up. Challenge accepted 😈\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `My Pi just went legendary thanks to this run 💎🐤\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flappy Pi moments are the BEST moments 🔥💯\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `You either flap… or you fall. I FLAPPED 😤\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `This bird's got wings — and a record score to prove it 🐥📊\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `My only goal today? Beat my last score. Nailed it ✅\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Just a Pi gamer chasing pipe dreams 💭🚧\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Every run is a battle. Today, I won the war 🔥🐦\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `The Pi skies are my playground ☁️📲 Let’s fly!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `A smooth flap never made a skilled bird 💡 I earned this score!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Shoutout to my fingers — they carried the team 😂🖐️🐤\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flappy Pi is NOT for the weak 💪 Come take the challenge\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Day made: New high score, new flex 😎📲\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
];

const postDescriptions2 = [
  `Just hit a personal best in Flappy Pi! 🏆 Can you fly higher?\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Wings of steel! Flapped through a record run today 🐤💪\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Feeling unstoppable in Flappy Pi! Beat me if you can 😎\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `50 pipes? Light work. Who's next?\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Score so high even Pi couldn’t calculate it! 🧠📈\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flappy Pi run = flawless. Now it’s your turn!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `High score alert! My flapping skills are elite 🔥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Breaking records one flap at a time! 🐦💨\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Legit the hardest game I can’t stop playing 😂\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flappy mode: activated. 💯 Score: insane.\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Hit a new high score while everyone was sleeping 💤🌙\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Who needs wings when you’ve got skill? 🦅🔥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `New day, new score, same unbeatable flaps 🐤🚀\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `That moment when you’re 1 pipe from glory 😩 Try me!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flapping through Pi like a pro! 🔄💎\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flappy fingers on fire!🔥 Score going UP!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Almost lost, but I FLAPPED back! 😤💪\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Zero to hero in Flappy Pi — let’s see your skills 😎\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Every tap counts — just ask my high score 😅📲\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Call me the Flappy Pi GOAT 🐐💥 Try to beat me\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Got Pi? I’ve got pipes too 🧮🚧\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `One run. One life. One legend. 🐥💫\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `This ain’t your ordinary flap... it’s Flappy Pi! 🕹️🔥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Challenged myself and WON. Can you say the same?\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flapping feels good when you’re breaking scores! 😜\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Only legends survive past 100 pipes. Am I one?\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Had to pause... because my score was UNREAL 😳📈\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flappy Pi = 🔥 Pure skill, no luck. Try to beat this!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Who needs rest? I need more pipes to pass! 💪💤\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Score update: officially unbeatable. 😤 Tap to try.\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `The Pi-powered bird that never quits 🐤⚡\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Soaring through the Pi-sky like a boss 💸☁️\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Hit that flap rhythm just right 🎵🔥 Flappy Master\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `I didn’t just flap — I dominated 😈🎮\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Respect the flap. Fear the score 🐤😱\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Tapped my way to the top of the charts 📲📊\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `No shortcuts. Just perfect flaps 😤🔥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Best feeling? Smashing my last score 😁🏆\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Tap. Tap. Victory. 🐣💥 Flappy Champion here!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Got tunnel vision passing pipes 😶‍🌫️💨 Beat that!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Eyes closed. Still scored. OK maybe not 🤣 Try me!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Even gravity couldn’t stop me today 🚀🕹️\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `It’s not just a game, it’s a lifestyle 😎 Flappy Pi fam!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Some say I was born to flap… and score 🐣✨\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `This is what domination looks like 🔥 Check my score\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Leaderboard? Already there 😌 Let’s see your run\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Think fast, flap faster! 🐤💫 Challenge accepted?\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Sweaty hands. Huge score. Worth it 😤🙌\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Built different. Scored different. 🛠️👑\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `One word: Legendary. 🏅 Tap if you dare.\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Every flap was worth it — that score tho! 🐤💯\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Can’t lie, I’m addicted to Flappy Pi now 😅🎮\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Pipe after pipe… and I STILL didn’t fall! 🔥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `They said it was impossible. I made it look easy 😏\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `No cap, Flappy Pi just made my day 💥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Sore thumbs, happy score 😆📱 Come beat it!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `That “just one more try” feeling 😵 Now I’m top score!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `I flapped. I focused. I flew past records 🐥🚀\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Too smooth. Too fast. Too flappy 🔥 Try match my score!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Never thought a game could be this fun... and frustrating 😂\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Hit a milestone today — feeling like a real Pi pro 💎\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `It’s not luck. It’s skill. And I’ve got both 😤💥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `What’s better than a high score? Bragging rights 😎\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Wanna see magic? Watch my Flappy Pi run 🎩✨\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Fly high, Pi strong 🐦💪 Let’s go!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `All gas, no flap breaks 🏎️🔥 Beat my score if you can!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Even gravity is jealous of my Flappy Pi moves 😮‍💨\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Feels good being a Pi bird legend 🐤👑 Come challenge me!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `I blinked and still made it through! That’s reflex 🔄\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `So close to rage quitting… but I got the W! 😅\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Big flaps, big dreams 🕊️💭 See if you can reach me!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `No cheat codes here, just raw Pi power 😤💫\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `My bird’s basically a superhero at this point 🦸‍♂️🐥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Haters say it’s luck, I say it’s practice 😏🎮\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Real ones know how hard this game is 😤 Props if you beat me\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Sleep? Nah. I’m flapping through the night 💤✨\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `New high score. New attitude 😎 Let’s gooo!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `They said I couldn't... I flapped anyway 😤💥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `One tap at a time… straight to victory! 🎯🐤\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Best game in the Pi Universe? Flappy Pi. Hands down 💯\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `When the pipes align just right... pure bliss 😌📈\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `I’m not competitive, unless we’re playing Flappy Pi 🐥😏\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `This score? Historic. Screenshot it 😤📸\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Nothing but net—wait, I mean pipes 😎🏆\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Call me the Pi Piper 🎵 I just fly through all pipes 🎮\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `No excuses. Just high scores. Bring yours 📲🔥\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flapping is life. This score proves it 🧬🐦\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Game on. Scores up. Challenge accepted 😈\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `My Pi just went legendary thanks to this run 💎🐤\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flappy Pi moments are the BEST moments 🔥💯\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `You either flap… or you fall. I FLAPPED 😤\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `This bird's got wings — and a record score to prove it 🐥📊\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `My only goal today? Beat my last score. Nailed it ✅\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Just a Pi gamer chasing pipe dreams 💭🚧\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Every run is a battle. Today, I won the war 🔥🐦\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `The Pi skies are my playground ☁️📲 Let’s fly!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `A smooth flap never made a skilled bird 💡 I earned this score!\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Shoutout to my fingers — they carried the team 😂🖐️🐤\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Flappy Pi is NOT for the weak 💪 Come take the challenge\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
  `Day made: New high score, new flex 😎📲\n#FlappyPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #FlappyPiChallenge`,
];

const ShareScoreModal: React.FC<ShareScoreModalProps> = ({
  isOpen,
  onClose,
  score,
  level,
  coins,
  bestScore,
  username,
  birdSkinUrl,
  gameMode = 'Classic'
}) => {
  const [backgroundColor, setBackgroundColor] = useState(COLORS.Blue);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [savedToGallery, setSavedToGallery] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);
  const { profile } = useUserProfile();
  const capabilities = getImageSharingCapabilities();

  // Enhanced Pi Browser detection
  const isPiBrowser = typeof window !== 'undefined' && (
    window.Pi || 
    navigator.userAgent.toLowerCase().includes('pibrowser') || 
    navigator.userAgent.toLowerCase().includes('pi browser') ||
    navigator.userAgent.toLowerCase().includes('pi-browser')
  );

  // Enhanced Pi Gallery detection
  const hasPiGallery = typeof window !== 'undefined' && 
    window.Pi && 
    typeof window.Pi.saveImageToGallery === 'function';

  const finalUsername = username || getDisplayUsername();
  const finalBirdSkin = birdSkinUrl || profile?.selected_bird_skin || 'bird_0';

  const handleDownload = async () => {
    if (!templateRef.current) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const dataUrl = await processElementToImage(templateRef.current, {
        scale: 2, // Good quality for modal size
        quality: 0.9, // Good quality
        width: 400, // Exact modal size
        height: 700 // Exact modal size
      });
      
      downloadImage(dataUrl);
      console.log('✅ Score card downloaded successfully');
    } catch (error) {
      console.error('❌ Failed to download score card:', error);
      setError('Failed to download image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToPiGallery = async () => {
    if (!templateRef.current || !hasPiGallery) {
      setError('Pi Gallery not available. Please use another sharing method.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const dataUrl = await processElementToImage(templateRef.current, {
        scale: 2,
        quality: 0.9,
        width: 400,
        height: 700
      });

      // Save to Pi Gallery
      await window.Pi.saveImageToGallery(dataUrl);
      setSavedToGallery(true);
      setShareSuccess(true);
      
      // Show success message
      setTimeout(() => {
        setShareSuccess(false);
        setSavedToGallery(false);
      }, 3000);

      console.log('✅ Image saved to Pi Gallery successfully');
    } catch (error) {
      console.error('❌ Failed to save to Pi Gallery:', error);
      setError('Failed to save to Pi Gallery. Please try another sharing method.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyImageLink = async () => {
    if (!templateRef.current) {
      setError('Template not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const dataUrl = await processElementToImage(templateRef.current, {
        scale: 2,
        quality: 0.9,
        width: 400,
        height: 700
      });

      // For Pi Browser, we'll copy the data URL to clipboard
      if (isPiBrowser) {
        await navigator.clipboard.writeText(dataUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
        console.log('✅ Image data URL copied to clipboard');
      } else {
        // For regular browsers, try to copy the image
        const success = await copyImageToClipboard(dataUrl);
        if (success) {
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 3000);
        } else {
          setError('Failed to copy image. Please try downloading instead.');
        }
      }
    } catch (error) {
      console.error('❌ Failed to copy image:', error);
      setError('Failed to copy image. Please try another method.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!templateRef.current) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const dataUrl = await processElementToImage(templateRef.current, {
        scale: 2,
        quality: 0.9,
        width: 400,
        height: 700
      });
      
      const success = await shareImage(dataUrl);
      
      if (success) {
        console.log('✅ Image shared successfully');
      } else {
        setError('Failed to share image. Please try another option.');
      }
    } catch (error) {
      console.error('❌ Failed to share image:', error);
      setError('Failed to share image. Please try another option.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendToLeaderboard = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      await submitScore(finalUsername, score);
      console.log('✅ Score submitted to leaderboard successfully');
    } catch (error) {
      console.error('❌ Failed to submit score:', error);
      setError('Failed to submit score to leaderboard. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Combine both arrays into one for random selection
  const allPostDescriptions = [...postDescriptions, ...postDescriptions2];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl mx-auto flex flex-col items-center justify-center p-6">
        <DialogHeader className="w-full text-center">
          <DialogTitle className="flex flex-col items-center gap-3">
            {finalBirdSkin && (
              <div className="flex justify-center mb-2">
                <img 
                  src={getBirdImageSrc(finalBirdSkin)} 
                  alt="Your Bird Skin" 
                  className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg animate-bounce" 
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.src = '/birds/bird_0.png';
                  }}
                />
              </div>
            )}
            Share Your Score
            {isPiBrowser && (
              <div className="text-sm text-blue-600 font-normal mt-2">
                <span role="img" aria-label="pi">π</span> Pi Browser Mode
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {shareSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
            {savedToGallery ? '✅ Image saved to Pi Gallery!' : '✅ Image copied successfully!'}
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-8">
          {/* Preview */}
          <div className="scale-75 origin-top">
            {isPiBrowser && (
              <div className="text-center text-blue-700 text-sm mb-2 font-semibold">
                <span role="img" aria-label="touch">👆</span> <b>Long press the image below to save or share!</b>
              </div>
            )}
            <ShareScoreTemplate
              templateRef={templateRef}
              score={score}
              level={level}
              coins={coins}
              bestScore={bestScore}
              username={finalUsername}
              birdSkinUrl={getBirdImageSrc(finalBirdSkin)}
              backgroundColor={backgroundColor}
              piUserId={profile?.pi_user_id}
              gameMode={gameMode}
            />
          </div>
          
          {/* Controls */}
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <p className="font-semibold text-center">Choose a background color:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(COLORS).map(([name, color]) => (
                <Button
                  key={name}
                  onClick={() => setBackgroundColor(color)}
                  className="w-full"
                  style={{ backgroundColor: color, border: backgroundColor === color ? '3px solid white' : '3px solid transparent' }}
                >
                  {name}
                </Button>
              ))}
            </div>
            
            <DialogFooter className="mt-4 flex flex-col gap-2 w-full">
              {/* Pi Browser Enhanced Options */}
              {isPiBrowser ? (
                <>
                  {hasPiGallery && (
                    <Button 
                      onClick={handleSaveToPiGallery}
                      className={`w-full ${isProcessing ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'}`}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Saving...' : '💾 Save to Pi Gallery'}
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleCopyImageLink}
                    className={`w-full ${isProcessing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : '📋 Copy Image Data'}
                  </Button>
                  
                  <Button 
                    onClick={async () => {
                      if (templateRef.current) {
                        try {
                          const dataUrl = await processElementToImage(templateRef.current, {
                            scale: 2,
                            quality: 0.9,
                            width: 400,
                            height: 700
                          });
                          window.open(dataUrl, '_blank');
                        } catch (error) {
                          setError('Failed to open image. Please try another option.');
                        }
                      }
                    }}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    👁️ Preview in New Tab
                  </Button>
                  
                  {capabilities.share && (
                    <Button 
                      className={`w-full ${isProcessing ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}
                      onClick={handleShare}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : '📤 Share'}
                    </Button>
                  )}
                  
                  <div className="text-xs text-gray-600 text-center mt-2 p-2 bg-gray-100 rounded">
                    💡 <strong>Pi Browser Tips:</strong><br/>
                    • Use "Save to Pi Gallery" to save to your device<br/>
                    • Use "Copy Image Data" to paste in other apps<br/>
                    • Long press the image above for more options
                  </div>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleDownload} 
                    className={`w-full ${isProcessing ? 'bg-gray-400' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : '📸 Take Screenshot'}
                  </Button>
                  <Button 
                    onClick={handleCopyImageLink}
                    className={`w-full ${isProcessing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                    disabled={isProcessing || !capabilities.clipboard}
                  >
                    {isProcessing ? 'Processing...' : capabilities.clipboard ? '📋 Copy Image' : 'Copy Not Supported'}
                  </Button>
                  {capabilities.share && (
                    <Button 
                      className={`w-full ${isProcessing ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'}`}
                      onClick={handleShare}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : '📤 Share'}
                    </Button>
                  )}
                </>
              )}
              
              <Button 
                onClick={handleSendToLeaderboard} 
                className="w-full bg-green-600 hover:bg-green-700" 
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : '🏆 Flappy Pi Community'}
              </Button>
              
              <Button 
                onClick={() => {
                  const random = allPostDescriptions[Math.floor(Math.random() * allPostDescriptions.length)];
                  navigator.clipboard.writeText(random);
                  alert(`Description copied! Paste it to your social media post.\n\n${random}`);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                📝 Copy Post Description
              </Button>
              
              <Button 
                onClick={onClose}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold mt-2"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareScoreModal;
