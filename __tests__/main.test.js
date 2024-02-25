/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core');
const main = require('../src/main');

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug').mockImplementation();
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation();

// Mock the action's main function
const runMock = jest.spyOn(main, 'run');

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/;

// 5 minute timeout for each test
jest.setTimeout(5 * 60 * 1000);

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('works', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'tests':
          return ` [
            ["6599b30569db75918e1c8a22"],
            ["65a0981db200baf2d463b9d2"]
          ]`;
        case 'apiKey':
          return 'clickai-e0ebf7e8-8074-4844-acce-6d9f949ab0ca';
        case 'input':
          return `url=https://www.helicone.ai/dashboard`;
        default:
          return '';
      }
    });

    await main.run();
    expect(runMock).toHaveReturned();

    // // Verify that all of the core library functions were called correctly
    // expect(debugMock).toHaveBeenNthCalledWith(
    //   1,
    //   'Waiting 500 milliseconds ...'
    // );
    // expect(debugMock).toHaveBeenNthCalledWith(
    //   2,
    //   expect.stringMatching(timeRegex)
    // );
    // expect(debugMock).toHaveBeenNthCalledWith(
    //   3,
    //   expect.stringMatching(timeRegex)
    // );
    // expect(setOutputMock).toHaveBeenNthCalledWith(
    //   1,
    //   'time',
    //   expect.stringMatching(timeRegex)
    // );
  });
});
