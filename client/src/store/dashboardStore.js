import { create } from 'zustand';

const useDashboardStore = create((set) => ({
  subscription:  null,
  scores:        [],
  draws:         [],
  myResults:     [],
  mySubmissions: [],
  upcoming:      null,
  loaded:        false,

  setData: ({ subscription, scores, draws, myResults, mySubmissions, upcoming }) =>
    set({ subscription, scores, draws, myResults, mySubmissions: mySubmissions ?? [], upcoming: upcoming ?? null, loaded: true }),

  clear: () => set({ subscription: null, scores: [], draws: [], myResults: [], mySubmissions: [], upcoming: null, loaded: false }),
}));

export default useDashboardStore;
