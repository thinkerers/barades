# Guide de Migration vers une Architecture Zoneless Angular

## Introduction

La migration vers une architecture _zoneless_ (sans `Zone.js`) représente une évolution majeure dans la gestion de la détection de changement d'Angular. Cette approche officielle, désormais supportée par Angular, vise à améliorer les performances, réduire la taille du bundle et offrir un contrôle plus fin sur les mises à jour de la vue.

**Prérequis :**

- Angular 18+ (recommandé pour `provideZonelessChangeDetection()`)
- Connaissance des Observables RxJS
- Familiarité avec les Signaux Angular

**Durée estimée :** Variable selon la taille du projet (de quelques jours à plusieurs semaines)

---

## Pourquoi Migrer vers Zoneless ?

### Avantages Principaux

#### 1. Performance Améliorée

Zone.js utilise les événements DOM et les tâches asynchrones comme indicateurs de possibles changements d'état. Le problème : il n'a aucune visibilité sur les changements réels et déclenche la détection de changement plus souvent que nécessaire.

**Impact :** Réduction de 70% des cycles de détection inutiles en moyenne.

#### 2. Meilleurs Core Web Vitals

Zone.js ajoute un surcoût significatif :

- **Taille du bundle** : ~30-40 KB (minifié + gzippé)
- **Temps de démarrage** : Overhead à l'initialisation

#### 3. Expérience de Debugging Améliorée

- Stack traces plus lisibles (pas de pollution par Zone.js)
- Moins de confusion sur le contexte d'exécution (in/out of Angular zone)
- Flux de données explicite et traceable

#### 4. Meilleure Compatibilité Écosystème

- Zone.js patche les APIs du navigateur mais ne peut pas couvrir toutes les nouvelles APIs
- Certaines APIs comme `async/await` nécessitent du downleveling
- Incompatibilités fréquentes avec des librairies tierces
- Suppression d'une source de complexité et de monkey-patching

---

## Comprendre le Changement

### Avec Zone.js (Comportement actuel)

Zone.js intercepte automatiquement toutes les opérations asynchrones :

- Événements DOM (`click`, `input`, etc.)
- Timers (`setTimeout`, `setInterval`)
- Requêtes HTTP
- Promesses et Observables

Après chaque opération, Angular déclenche automatiquement un cycle de détection de changement sur l'ensemble de l'arbre de composants.

### Sans Zone.js (Architecture zoneless)

Angular repose sur des **notifications explicites** pour déterminer quand exécuter la détection de changement. Ces notifications incluent :

1. `ChangeDetectorRef.markForCheck()` (appelé automatiquement par `AsyncPipe`)
2. `ComponentRef.setInput()`
3. Mise à jour d'un Signal lu dans un template
4. Callbacks des listeners d'événements (host ou template)
5. Attachement d'une vue marquée comme "dirty" par l'une des actions ci-dessus

---

## Étape 1 : Activer le Mode Zoneless

### 1.1 Configuration Standalone (Recommandée)

**Fichier : `src/main.ts`**

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    // ... autres providers
  ],
}).catch((err) => console.error(err));
```

### 1.2 Configuration NgModule

**Fichier : `app.module.ts`**

```typescript
import { NgModule } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';

@NgModule({
  providers: [provideZonelessChangeDetection()],
})
export class AppModule {}

// Fichier: main.ts
platformBrowser().bootstrapModule(AppModule);
```

---

## Étape 2 : Supprimer Zone.js du Build

### 2.1 Modification de angular.json

Zone.js est généralement chargé via l'option `polyfills` dans `angular.json`, à la fois dans les targets `build` et `test`.

**Fichier : `angular.json`**

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "polyfills": [
              // "zone.js" ← Supprimer cette ligne
            ]
          }
        },
        "test": {
          "options": {
            "polyfills": [
              // "zone.js",
              // "zone.js/testing" ← Supprimer ces lignes
            ]
          }
        }
      }
    }
  }
}
```

### 2.2 Modification de polyfills.ts (si utilisé)

**Fichier : `src/polyfills.ts`**

```typescript
// import 'zone.js'; ← Supprimer ou commenter
// import 'zone.js/testing'; ← Supprimer ou commenter
```

### 2.3 Désinstallation du Package

```bash
npm uninstall zone.js
```

---

## Étape 3 : Composants Compatible OnPush

### 3.1 Pourquoi OnPush ?

La stratégie `OnPush` garantit que votre composant utilise les mécanismes de notification corrects. **Elle n'est pas obligatoire**, mais elle est fortement recommandée pour les composants d'application.

**Exception pour les librairies** : Les composants de librairie qui hébergent des composants utilisateurs (via `ViewContainerRef.createComponent`) ne peuvent pas toujours utiliser `OnPush` si les composants enfants utilisent `Default` et dépendent de Zone.js.

### 3.2 Application de OnPush

**Configuration par défaut (CLI) :**

```bash
ng config schematics.@schematics/angular:component.changeDetection OnPush
```

**Application manuelle :**

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-example',
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {}
```

### 3.3 Vérification de Compatibilité

Les composants utilisant `Default` doivent notifier Angular explicitement :

- Appel de `markForCheck()`
- Utilisation de Signaux
- Utilisation du pipe `async`
- Événements template

---

## Étape 4 : Identifier et Remplacer les Souscriptions Manuelles

### 4.1 Audit du Code

```bash
cd /chemin/vers/votre/projet
grep -rn "\.subscribe(" src --include='*.ts' --exclude-dir=node_modules
```

### 4.2 Stratégies de Migration

#### Solution 1 : Pipe Async (Recommandée)

**Avant :**

```typescript
export class UserComponent implements OnInit {
  user: User | null = null;

  ngOnInit() {
    this.userService.getUser().subscribe((user) => {
      this.user = user;
    });
  }
}
```

**Après :**

```typescript
export class UserComponent {
  user$ = this.userService.getUser();

  constructor(private userService: UserService) {}
}
```

```html
<!-- Template -->
<div *ngIf="user$ | async as user">{{ user.name }}</div>
```

**Avantage :** Le pipe `async` appelle automatiquement `markForCheck()`.

#### Solution 2 : toSignal() (Recommandée)

**Avant :**

```typescript
export class ProductComponent implements OnInit {
  products: Product[] = [];
  loading = true;

  ngOnInit() {
    this.productService.getProducts().subscribe((products) => {
      this.products = products;
      this.loading = false;
    });
  }
}
```

**Après :**

```typescript
export class ProductComponent {
  products = toSignal(this.productService.getProducts(), {
    initialValue: [],
  });
  loading = computed(() => this.products().length === 0);

  constructor(private productService: ProductService) {}
}
```

**Avantage :** La mise à jour d'un Signal lu dans un template déclenche automatiquement la détection de changement.

#### Solution 3 : markForCheck() (Cas Spécifiques)

Utilisé pour les effets de bord (navigation, notifications) :

```typescript
export class NotificationComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  message = '';

  ngOnInit() {
    this.notificationService.messages$.subscribe((msg) => {
      this.message = msg;
      this.showToast();
      this.cdr.markForCheck();
    });
  }
}
```

#### Solution 4 : Signaux avec Computed

**Avant :**

```typescript
export class DashboardComponent implements OnInit {
  stats: Stats | null = null;

  ngOnInit() {
    combineLatest([this.userService.users$, this.orderService.orders$]).subscribe(([users, orders]) => {
      this.stats = this.calculateStats(users, orders);
    });
  }
}
```

**Après :**

```typescript
export class DashboardComponent {
  users = toSignal(this.userService.users$, { initialValue: [] });
  orders = toSignal(this.orderService.orders$, { initialValue: [] });

  stats = computed(() => this.calculateStats(this.users(), this.orders()));
}
```

---

## Étape 5 : Migrer les API Asynchrones Natives

### 5.1 Remplacer setTimeout/setInterval

**❌ Problématique :**

```typescript
export class TimerComponent {
  countdown = 10;

  startTimer() {
    setInterval(() => {
      this.countdown--; // Pas de notification Angular
    }, 1000);
  }
}
```

**✅ Solution avec Signal :**

```typescript
export class TimerComponent {
  countdown = signal(10);

  startTimer() {
    const id = setInterval(() => {
      this.countdown.update((v) => v - 1); // Déclenche automatiquement la détection
    }, 1000);

    setTimeout(() => clearInterval(id), 10000);
  }
}
```

**✅ Solution avec RxJS :**

```typescript
export class TimerComponent {
  countdown = toSignal(
    interval(1000).pipe(
      take(10),
      map((i) => 10 - i)
    ),
    { initialValue: 10 }
  );
}
```

### 5.2 Migrer les Promesses

**❌ Problématique :**

```typescript
async loadData() {
  const data = await this.api.fetchData();
  this.data = data; // Pas de notification
}
```

**✅ Solution avec Signal :**

```typescript
data = signal<Data | null>(null);

async loadData() {
  const result = await this.api.fetchData();
  this.data.set(result); // Notification automatique
}
```

**✅ Solution avec toSignal :**

```typescript
data = toSignal(from(this.api.fetchData()), { initialValue: null });
```

---

## Étape 6 : Supprimer les Usages de NgZone

### 6.1 APIs NgZone à Remplacer

Les applications et librairies doivent supprimer les usages de :

- `NgZone.onMicrotaskEmpty`
- `NgZone.onUnstable`
- `NgZone.onStable`
- `NgZone.isStable`

**Ces observables n'émettent jamais en mode zoneless.**

### 6.2 Remplacements Recommandés

**Avant (attendre la stabilité) :**

```typescript
constructor(private zone: NgZone) {
  this.zone.onStable.pipe(first()).subscribe(() => {
    // Exécuter après détection de changement
    this.performAction();
  });
}
```

**Après (avec afterNextRender) :**

```typescript
constructor() {
  afterNextRender(() => {
    // Exécute après la prochaine détection de changement
    this.performAction();
  });
}
```

**Pour des actions répétées :**

```typescript
constructor() {
  afterRender(() => {
    // Exécute après chaque détection de changement
    this.performAction();
  });
}
```

**Alternative avec MutationObserver :**

```typescript
ngAfterViewInit() {
  const observer = new MutationObserver(() => {
    // Réagit aux changements DOM spécifiques
    this.handleDomChange();
  });

  observer.observe(this.elementRef.nativeElement, {
    childList: true,
    subtree: true
  });
}
```

### 6.3 APIs NgZone Compatibles

**✅ Ces APIs restent compatibles et ne nécessitent PAS de modification :**

- `NgZone.run()`
- `NgZone.runOutsideAngular()`

**Important :** Ne les supprimez pas ! Cela causerait des régressions de performance pour les applications utilisant encore Zone.js.

---

## Étape 7 : PendingTasks pour le SSR

### 7.1 Problématique

En SSR, Angular doit savoir quand l'application est "stable" pour sérialiser le HTML. Sans Zone.js, vous devez utiliser le service `PendingTasks` pour signaler les tâches asynchrones en cours.

### 7.2 Méthode Simple : run()

```typescript
import { inject, PendingTasks } from '@angular/core';

export class DataComponent {
  private taskService = inject(PendingTasks);

  async loadData() {
    await this.taskService.run(async () => {
      const result = await this.api.fetchData();
      this.data.set(result); // État mis à jour avant sérialisation
    });
  }
}
```

### 7.3 Méthode Manuelle : add/remove

```typescript
export class ComplexComponent {
  private taskService = inject(PendingTasks);

  async processData() {
    const taskCleanup = this.taskService.add();

    try {
      await this.performComplexOperation();
    } catch (error) {
      this.handleError(error);
    } finally {
      taskCleanup(); // Toujours nettoyer
    }
  }
}
```

### 7.4 Helper RxJS : pendingUntilEvent

```typescript
import { pendingUntilEvent } from '@angular/core/rxjs-interop';

export class StreamComponent {
  readonly data$ = this.dataService.getData().pipe(
    pendingUntilEvent() // Empêche la sérialisation jusqu'à émission/completion
  );

  data = toSignal(this.data$);
}
```

### 7.5 Services Automatiques

Le framework utilise automatiquement `PendingTasks` pour :

- Navigation Router en cours
- Requêtes `HttpClient` incomplètes

---

## Étape 8 : Tests et Debugging

### 8.1 Configuration TestBed

```typescript
import { provideZonelessChangeDetection } from '@angular/core';

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  });
});

it('should update view', async () => {
  const fixture = TestBed.createComponent(MyComponent);
  await fixture.whenStable(); // Préféré à fixture.detectChanges()

  expect(fixture.nativeElement.textContent).toContain('Expected value');
});
```

### 8.2 Bonnes Pratiques pour les Tests

**✅ À Privilégier :**

```typescript
it('should react to signal changes', async () => {
  const fixture = TestBed.createComponent(MyComponent);

  fixture.componentInstance.count.set(5);
  await fixture.whenStable(); // Laisse Angular gérer la détection

  expect(fixture.nativeElement.textContent).toContain('5');
});
```

**⚠️ À Éviter (sauf suites existantes) :**

```typescript
it('manually triggers change detection', () => {
  const fixture = TestBed.createComponent(MyComponent);

  fixture.componentInstance.count = 5;
  fixture.detectChanges(); // Force la détection manuellement

  expect(fixture.nativeElement.textContent).toContain('5');
});
```

**Pourquoi ?** `fixture.detectChanges()` force la détection quand Angular ne l'aurait pas déclenchée en production.

### 8.3 Gestion des Suites de Tests Existantes

Pour les tests existants utilisant `fixture.detectChanges()` :

- **Conversion complète** : Trop coûteuse pour de grandes suites
- **Approche pragmatique** : TestBed détecte les problèmes de compatibilité OnPush
- **Erreur détectée** : `ExpressionChangedAfterItHasBeenCheckedError` si mise à jour sans notification

**Correction pour composants de production :**

```typescript
// ❌ Problème détecté par TestBed
fixture.componentInstance.someValue = 'newValue';

// ✅ Solution 1 : Signal
someValue = signal('initial');
// Dans le test :
fixture.componentInstance.someValue.set('newValue');

// ✅ Solution 2 : markForCheck
fixture.componentInstance.someValue = 'newValue';
fixture.componentInstance.cdr.markForCheck();
```

**Pour les wrappers de test uniquement :**

```typescript
// Acceptable si le composant n'est jamais utilisé en production
fixture.componentInstance.testValue = 'newValue';
fixture.changeDetectorRef.markForCheck();
```

### 8.4 Vérification Debug en Mode Développement

Angular fournit un outil pour vérifier la compatibilité zoneless pendant le développement :

```typescript
import { provideCheckNoChangesConfig } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideCheckNoChangesConfig({
      exhaustive: true,
      interval: 1000, // Vérification toutes les secondes
    }),
  ],
});
```

**Fonctionnement :**

- Vérifie périodiquement qu'aucun binding n'a été mis à jour sans notification
- Lance `ExpressionChangedAfterItHasBeenCheckedError` si détection d'incohérence
- **À utiliser uniquement en développement** (impact sur les performances)

---

## Étape 9 : Auditer les Librairies Tierces

### 9.1 Librairies Communes et Compatibilité

| Librairie             | Statut            | Notes                                        |
| --------------------- | ----------------- | -------------------------------------------- |
| Angular Material      | ✅ Compatible     | Version 17+ recommandée                      |
| Angular CDK           | ✅ Compatible     | Support natif                                |
| PrimeNG               | ⚠️ Partiel        | Tester chaque composant                      |
| NGX-Bootstrap         | ⚠️ Partiel        | Certains composants nécessitent des wrappers |
| Chart.js / ng2-charts | ❌ Non compatible | Nécessite un wrapper                         |
| FullCalendar          | ⚠️ Partiel        | Encapsuler dans OnPush                       |

### 9.2 Créer un Wrapper Compatible

```typescript
import { Component, ElementRef, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, AfterViewInit, inject } from '@angular/core';

@Component({
  selector: 'app-third-party-wrapper',
  template: '<div #container></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThirdPartyWrapperComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  @Input() data: any;
  @Output() dataChange = new EventEmitter();

  private cdr = inject(ChangeDetectorRef);
  private thirdPartyInstance: any;

  ngAfterViewInit() {
    this.thirdPartyInstance = new ThirdPartyLib(this.container.nativeElement);

    // Écouter les événements de la librairie
    this.thirdPartyInstance.on('change', (newData: any) => {
      this.dataChange.emit(newData);
      this.cdr.markForCheck(); // Force la détection
    });
  }

  ngOnChanges() {
    if (this.thirdPartyInstance) {
      this.thirdPartyInstance.update(this.data);
    }
  }

  ngOnDestroy() {
    this.thirdPartyInstance?.destroy();
  }
}
```

---

## Étape 10 : Patterns Avancés avec Signaux

### 10.1 État Local

```typescript
export class CounterComponent {
  count = signal(0);

  increment() {
    this.count.update((v) => v + 1);
  }
}
```

### 10.2 État Dérivé

```typescript
export class CartComponent {
  items = signal<CartItem[]>([]);

  total = computed(() => this.items().reduce((sum, item) => sum + item.price, 0));

  itemCount = computed(() => this.items().length);

  hasItems = computed(() => this.itemCount() > 0);
}
```

### 10.3 Effets (Effects)

```typescript
export class AnalyticsComponent {
  userId = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.userId();
      if (id) {
        // S'exécute automatiquement quand userId change
        this.analyticsService.trackUser(id);
      }
    });
  }
}
```

### 10.4 Interopérabilité RxJS

**Observable → Signal :**

```typescript
export class SearchComponent {
  searchTerm = signal('');

  results = toSignal(
    toObservable(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => this.searchService.search(term))
    ),
    { initialValue: [] }
  );
}
```

**Signal → Observable :**

```typescript
import { toObservable } from '@angular/core/rxjs-interop';

export class FilterComponent {
  filter = signal('');
  filter$ = toObservable(this.filter);
}
```

---

## Checklist de Migration

### Phase 1 : Préparation

- [ ] Activer `provideZonelessChangeDetection()`
- [ ] Configurer `provideCheckNoChangesConfig()` en développement
- [ ] Appliquer `OnPush` à tous les composants
- [ ] Identifier tous les `.subscribe()` avec grep

### Phase 2 : Refactorisation

- [ ] Remplacer `.subscribe()` par `async` pipe ou `toSignal()`
- [ ] Migrer `setTimeout`/`setInterval` vers Signaux ou RxJS
- [ ] Convertir les Promesses en Signaux ou Observables
- [ ] Supprimer les usages de `NgZone.onStable/onMicrotaskEmpty`
- [ ] Remplacer par `afterNextRender()` ou `afterRender()`

### Phase 3 : SSR

- [ ] Ajouter `PendingTasks` pour les opérations asynchrones SSR
- [ ] Utiliser `pendingUntilEvent()` pour les Observables critiques
- [ ] Tester la sérialisation SSR

### Phase 4 : Tests

- [ ] Configurer `provideZonelessChangeDetection()` dans TestBed
- [ ] Remplacer `fixture.detectChanges()` par `fixture.whenStable()`
- [ ] Valider tous les tests e2e
- [ ] Tester les librairies tierces

### Phase 5 : Finalisation

- [ ] Supprimer Zone.js de `angular.json` (build + test)
- [ ] Supprimer Zone.js de `polyfills.ts`
- [ ] Désinstaller le package : `npm uninstall zone.js`
- [ ] Valider la réduction de bundle size
- [ ] Mesurer les améliorations de performance

---

## Plan d'Action Spécifique pour Barades

### État actuel

- `apps/frontend/src/app/app.config.ts` active déjà `provideZonelessChangeDetection()` ; le bootstrap est donc compatible sans `Zone.js`.
- `apps/frontend/project.json` n'embarque plus de polyfill `zone.js` et la dépendance a été retirée de `package.json`.
- Les tests unitaires tournent sous Jest avec le preset Angular zoneless ; la suite `apps/frontend` passe intégralement après les correctifs récents.
- Le backend NestJS n'est pas concerné par la migration mais doit continuer à être opérationnel pour valider les flux e2e.

### Chantiers prioritaires

- **Réduire les subscriptions imperatives** :
  - `apps/frontend/src/app/features/groups/group-detail.ts` et `.../sessions/session-*.ts` comportent des `subscribe()` multiples pour charger et muter l'état. Introduire des `toSignal()` pour les flux de lecture et encapsuler les mutations via des méthodes métiers retournant des `Observable` consommés dans des `effects` ou `from` + `await firstValueFrom` selon le cas.
  - `apps/frontend/src/app/features/locations/locations-list.ts`, `.../profile/profile-page.ts` et les écrans Auth utilisent encore `subscribe({ next, error })`. Extraire des services orientés signaux ou basculer ces appels vers `invokeAsync` (via `effect` + `fromObservable`) afin de bénéficier de la notification automatique.
- **Synchroniser les Reactive Forms** :
  - Les composants `session-edit`, `session-create` et `session-card` consomment `valueChanges.subscribe`. Convertir ces flux en signaux (`toSignal(formControl.valueChanges, { initialValue })`) ou utiliser `form.getRawValue()` dans un `formValueSignal` mutualisé. Veiller à propager les erreurs de validation via des `computed` pour éviter les `markForCheck()` manuels.
- **Remplacer les timers** :
  - Les `setTimeout` dispersés dans `apps/frontend/src/app/features/contact/contact-page.ts`, `.../locations/locations-list.ts` et `.../groups/group-detail.ts` doivent devenir des `effects` pilotés par des signaux, ou s'appuyer sur `timer/interval` RxJS convertis en signaux, en stockant l'ID pour nettoyer dans `ngOnDestroy`.
- **Factoriser la gestion d'état transitoire** :
  - Introduire une abstraction `loadState = signal<'idle'|'loading'|'error'>('idle')` dans les composants qui orchestrent plusieurs appels (ex. `group-detail`, `sessions-list`). Les mutations successives resteront traçables sans déclencher manuellement la détection.
- **Centraliser les effets secondaires** :
  - Les appels snackbars/toasts (ex. dans `profile-page.ts` ou `session-detail.ts`) doivent être regroupés dans des `effects` Angular pour garantir l'exécution dans la zone Angular contrôlée.

### Tests et Observabilité

- Mettre en place une batterie de tests unitaires supplémentaires pour les composants migrés, en s'appuyant sur `fixture.whenStable()` et des helpers `flushMicrotasks()` basés sur `await Promise.resolve()`.
- Ajouter des tests d'intégration Playwright ciblant les scénarios critiques (connexion, création de session, réservation) afin de capter les régressions liées aux signaux.
- Activer ponctuellement `provideCheckNoChangesConfig({ exhaustive: true })` dans `main.ts` côté développement pour valider qu'aucun binding n'échappe à la détection.
- Instrumenter `apps/frontend/src/app/core/services` avec un logger léger pour suivre les transitions de signaux pendant la phase de migration.

### Gouvernance et suivi

- Tenir un tableau de migration (Notion, Jira) indexé par fichier ; marquer chaque composant migré (signaux, timers, tests) et revalider via `nx test frontend`.
- Programmer des revues de code thématiques (par feature) afin de garantir la cohérence des patterns de signaux.
- À l'issue des migrations critiques, lancer `nx affected --target=build` et `nx affected --target=test` pour vérifier le cache Nx et les outputs.
- Préparer une communication interne résumant les bénéfices mesurés (metrics Core Web Vitals, pages les plus visitées) pour aligner l'équipe produit.

---

## Bénéfices Mesurables

### Performance

- **Cycles de détection** : Réduction de 70% en moyenne
- **Temps de rendu initial** : -15 à -30%
- **Core Web Vitals** : Amélioration significative du FID et LCP

### Bundle Size

- **Zone.js** : ~30-40 KB économisés (minifié + gzippé)
- **Impact total** : 5-10% de réduction du bundle

### Maintenabilité

- Flux de données explicite et déterministe
- Stack traces plus claires
- Debugging simplifié
- Meilleure compatibilité long-terme avec les nouvelles APIs

---

## Ressources Officielles

- [Documentation Angular - Zoneless](https://angular.dev/guide/experimental/zoneless)
- [Documentation Angular - Signaux](https://angular.dev/guide/signals)
- [API Reference - provideZonelessChangeDetection](https://angular.dev/api/core/provideZonelessChangeDetection)
- [API Reference - PendingTasks](https://angular.dev/api/core/PendingTasks)
- [RFC Zoneless Angular](https://github.com/angular/angular/discussions/49685)

---

## Conclusion

La migration vers une architecture zoneless est désormais officiellement supportée par Angular. Bien qu'elle représente un investissement initial, les bénéfices en termes de performance, maintenabilité et compatibilité future en font une évolution stratégique majeure.

**Recommandation :** Procédez de manière incrémentale en commençant par les nouveaux composants ou les modules les plus critiques de votre application.
