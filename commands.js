import 'dotenv/config';
import { getRPSChoices } from './examples/game.js';
import { capitalize, InstallGlobalCommands } from './js/utils.js';
/*
// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}
  
// Command containing options
const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0],
};

*/

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const PATRZ_COMMAND = {
  name: 'patrz',
  description: 'Rozejrzyj się dookoła',
  type: 1,
  integration_types: [0, 1],
  contexts: [0],
};


const AKCJA_COMMAND = {
  name: 'akcja',
  description: 'Robi akcję',
  type: 1,
  integration_types: [0, 1],
  contexts: [0],
  options: [
    {
      type: 3,
      name: 'akcja',
      description: 'Wybierz akcję',
      required: true,
    },
  ],
};

const DEBUG_COMMAND = {
  name: 'debug',
  description: 'Do debugowania',
  type: 1,
  integration_types: [0, 1],
  contexts: [0],
  default_member_permissions: 0,
  options: [
    {
      type: 3,
      name: 'command',
      description: 'Wpisz komendę',
      required: true,
    },
  ],
};

const ALL_COMMANDS = [TEST_COMMAND, PATRZ_COMMAND, AKCJA_COMMAND, DEBUG_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
