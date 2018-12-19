import { Component, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from "@angular/router";
import { Angulartics2Module } from "angulartics2";
import { CoreModule, ICoreConfig, ProjectService } from "@forcrowd/backbone-client-core";

import { SharedModule } from "../shared/shared.module";

import { settings } from "../../settings/settings";

// Components
import { ContributorsComponent } from "./components/contributors.component";
import { CoreComponent } from "./components/core.component";
import { HomeComponent } from "./components/home.component";
import { LandingPageComponent } from "./components/landing-page.component";
import { ProfileComponent } from "./components/profile.component";
import { ProfileRemoveProjectComponent } from "./components/profile-remove-project.component";
import { SearchComponent } from "./components/search.component";
import { HistoryComponent } from "./components/history.component";
import { ConfirmEditComponent } from "./components/confirm-edit.component";

// Services
import { AppProjectService } from "./app-project.service";
import { AuthGuard } from "./auth-guard.service";
import { CanDeactivateGuard } from "./can-deactivate-guard.service";
import { DynamicTitleResolve } from "./dynamic-title-resolve.service";
import { RemoveHistoryConfirmComponent } from "./components/remove-history.component";

export { AppProjectService, AuthGuard, CanDeactivateGuard, DynamicTitleResolve }

// TODO: Remove! Only here to test appErrorHandler on production
@Component({
  template: ``
})
export class ExComponent {
  constructor() { throw new Error("test"); }
}

const appCoreRoutes: Routes = [

  // Core
  { path: "", component: LandingPageComponent, data: { title: "Home" } },
  { path: "app/home", redirectTo: "", pathMatch: "full" },
  { path: "app/contributors", component: ContributorsComponent, data: { title: "Contributors" } },
  { path: "app/search", component: SearchComponent, data: { title: "Search" } },
  { path: "app/ex", component: ExComponent }, // TODO: Remove! Only here to test appErrorHandler on production

  // Users
  { path: ":username/:timeline", component: ProfileComponent, resolve: { title: DynamicTitleResolve } },
  { path: ":username", component: ProfileComponent, resolve: { title: DynamicTitleResolve } },
];

const coreConfig: ICoreConfig = {
  environment: settings.environment,
  serviceApiUrl: settings.serviceApiUrl,
  serviceODataUrl: settings.serviceODataUrl
};

@NgModule({
  declarations: [
    ContributorsComponent,
    CoreComponent,
    ExComponent,
    HomeComponent,
    LandingPageComponent,
    ProfileComponent,
    ProfileRemoveProjectComponent,
    SearchComponent,
    HistoryComponent,
    RemoveHistoryConfirmComponent,
    ConfirmEditComponent,
  ],
  entryComponents: [
    ProfileRemoveProjectComponent,
    RemoveHistoryConfirmComponent,
    ConfirmEditComponent
  ],
  exports: [
    RouterModule,
    CoreComponent,
  ],
  imports: [
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appCoreRoutes),
    Angulartics2Module.forRoot(),
    CoreModule.configure(coreConfig)
  ],
  providers: [
    AuthGuard,
    CanDeactivateGuard,
    DynamicTitleResolve,
    // Project service
    {
      provide: ProjectService,
      useClass: AppProjectService,
    },
  ]
})
export class AppCoreModule { }
