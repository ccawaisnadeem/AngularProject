# AI Contributor Instructions

Purpose: Provide just enough context for AI coding agents to make safe, on-style, productive changes in this Angular 20 project.

## 1. Tech Stack & Build
- Angular 20 standalone component architecture (no traditional NgModules).
- Bootstrap 5.3 included globally via `angular.json` styles & scripts arrays.
- SCSS is the styling language (see `schematics` config & `styleUrls`).
- Development build/serve: `npm start` (alias for `ng serve`).
- Production build: `ng build --configuration production`.
- JSON mock API potential via `npm run json-server` (expects a `db.json` at project root or inside `src/`). If adding, coordinate the port (current script uses 3000).

## 2. Project Entry & Configuration
- Bootstrap in `src/main.ts` using `bootstrapApplication(App, appConfig)`.
- Global providers centralised in `app/app.config.ts` (router, HttpClient, zone change detection with event coalescing, global error listeners). Add new global providers there.
- Routes defined in `app/app.routes.ts`. Use lazy loading (dynamic import) for new feature areas (preferred) instead of eager component references when adding sizable pages.

## 3. Component Patterns
- Root component: `app/app.ts` (standalone). Imports RouterOutlet, CommonModule, FormsModule directly.
- Use `standalone: true` for all new components; import required Angular/common modules explicitly in the `imports` array.
- Favor signals or RxJS for reactive state (currently simple class properties; introducing signals is acceptable but keep consistency within a component).
- Template control flow can leverage Angular v17+ microsyntax (`@for`, `@if`) — already used in examples; maintain that style.

## 4. Styling & UI Conventions
- Bootstrap utility classes used heavily; minimal custom SCSS in `app.scss` & `styles.scss` (expand cautiously).
- When overriding Bootstrap button colors in hero/section, scope with a wrapper class (e.g., `.hero-banner .btn-warning { ... }`). Avoid global `.btn` overrides.
- Use spacing utilities (`gap-*`, `me-*`, `mt-*`) before adding custom margins.

## 5. Data & Mock API
- No current real backend integration; if adding data calls, first add `provideHttpClient()` (already present) and create a dedicated service under a new `core/services/` folder (create folder if missing).
- For mock data: add `db.json` at repository root (same level as `package.json`) and reference via JSON Server (`http://localhost:3000/<collection>`). Document any new collections in README.
- Keep product/item interfaces colocated with their primary usage file initially (e.g., `Product` interface in `app.ts`). Promote to `models/` only after >1 consumer.

## 6. Routing Guidelines
- Current routes: `''` -> redirect `/home`, `/home`, `/inventory`, wildcard redirect to `/home`.
- When adding routes use:
  ```ts
  { path: 'feature', loadComponent: () => import('./pages/feature/feature').then(m => m.Feature) }
  ```
  instead of direct component reference for any non-trivial page.
- Keep wildcard at bottom; ensure `pathMatch: 'full'` for root redirect.

## 7. Dependency Management
- Existing dependencies: Angular core packages, Bootstrap, RxJS, esbuild (direct), zone.js.
- Do NOT add large state management libraries (NgRx, Akita, etc.) unless a clear cross-component state emerges. Prefer lightweight signals or simple services first.
- If adding audio or player functionality (per README vision), pick a single focused library (e.g., `howler`) and encapsulate it behind a service.

## 8. Testing
- Karma/Jasmine configured (`ng test`). When adding tests, colocate `*.spec.ts` with the component/service.
- Keep tests fast & isolated (mock HttpClient with `provideHttpClientTesting()` if introduced).

## 9. Performance & Zones
- Zone coalescing is enabled (`provideZoneChangeDetection({ eventCoalescing: true })`). Avoid manual `ChangeDetectorRef` usage unless necessary.
- If migrating to zoneless or signals-heavy patterns later, centralise that change in `app.config.ts`.

## 10. Common Pitfalls / Gotchas
- Avoid duplicate Bootstrap imports; rely on `angular.json` only.
- Ensure new standalone components import `CommonModule` if using structural directives or pipes.
- When adding forms beyond simple `[(ngModel)]`, import `ReactiveFormsModule` explicitly in the component `imports`.
- If JSON Server is added, ensure CORS and port alignment; adjust script if port conflict.

## 11. Code Style
- Prefer explicit return types on exported functions/services.
- Keep interfaces PascalCase; component class names match filename (e.g., `Home` in `home.ts`).
- Use singular component file names (no `.component` suffix currently); follow existing naming (`home.ts`, `inventory.ts`). Stay consistent.

## 12. Extending the App (Examples)
- Adding a new page:
  ```bash
  ng g c pages/profile --standalone --inline-style=false --inline-template=false
  ```
  Then add a lazy route with `loadComponent`.
- Adding a service:
  ```ts
  // src/app/core/services/product.service.ts
  @Injectable({ providedIn: 'root' })
  export class ProductService { constructor(private http: HttpClient) {}
    getProducts() { return this.http.get<Product[]>('/api/products'); }
  }
  ```

## 13. When Unsure
- Examine `app.ts` for current coding tone & simplicity. Match that minimalism.
- Keep changes incremental; update README only when adding significant new feature categories.

(Provide feedback if additional architectural sections—e.g., future audio player or auth module—should be formalized now.)
