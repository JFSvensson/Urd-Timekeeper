import { SessionType } from './UrdSessionType';

export interface SessionState {
  currentSession: SessionType;
  completedSessions: number;
}

export function advanceSession(state: SessionState, shortBreaksBeforeLong: number): SessionState {
  const completedSessions = state.completedSessions + 1;

  if (state.currentSession !== SessionType.Work) {
    return {
      currentSession: SessionType.Work,
      completedSessions,
    };
  }

  return {
    currentSession:
      completedSessions % shortBreaksBeforeLong === 0
        ? SessionType.LongBreak
        : SessionType.ShortBreak,
    completedSessions,
  };
}
