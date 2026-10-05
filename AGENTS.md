<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Rules
- All app pages live under `src/routes/_authenticated/`; only `/auth` is public — the app is personal finance data.
- The Zustand store stays the single source of truth; `useCloudSync` mirrors it as one JSON row per user in `finance_states` — keeps business logic untouched while syncing across devices.
- On sign-out the local store is reset and its localStorage cleared — prevents leaking one user's data to the next.
