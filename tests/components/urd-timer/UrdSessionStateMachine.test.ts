/// <reference types="jest" />
import { advanceSession } from '../../../src/components/urd-timer/UrdSessionStateMachine';
import { SessionType } from '../../../src/components/urd-timer/UrdSessionType';

describe('advanceSession', () => {
  it('moves work to a short break before the long-break threshold', () => {
    expect(advanceSession({ currentSession: SessionType.Work, completedSessions: 1 }, 4)).toEqual({
      currentSession: SessionType.ShortBreak,
      completedSessions: 2,
    });
  });

  it('moves work to a long break at the configured threshold', () => {
    expect(advanceSession({ currentSession: SessionType.Work, completedSessions: 3 }, 4)).toEqual({
      currentSession: SessionType.LongBreak,
      completedSessions: 4,
    });
  });

  it('moves either break back to work', () => {
    expect(
      advanceSession({ currentSession: SessionType.ShortBreak, completedSessions: 4 }, 4)
    ).toEqual({ currentSession: SessionType.Work, completedSessions: 5 });
    expect(
      advanceSession({ currentSession: SessionType.LongBreak, completedSessions: 8 }, 4)
    ).toEqual({ currentSession: SessionType.Work, completedSessions: 9 });
  });
});
