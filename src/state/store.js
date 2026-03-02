export const state = {
  mode: "top",
  query: "",
  page: 1,
  loading: false,
  hasNextPage: true,
  items: [],
};

export function resetState(next = {}) {
  state.mode = next.mode ?? "top";
  state.query = next.query ?? "";
  state.page = 1;
  state.loading = false;
  state.hasNextPage = true;
  state.items = [];
}
