import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from "@angular/router";
import { Angulartics2Module } from "angulartics2";
import { CoreModule, ICoreConfig, ProjectService } from "@forcrowd/backbone-client-core";

import { SharedModule } from "../shared/shared.module";

import { settings } from "../../settings/settings";

// Components
import { CoreComponent } from "./components/core.component";
import { GettingStartedComponent } from "./components/getting-started.component";
import { HistoryOverviewComponent } from "./components/history-overview.component";
import { HomeComponent } from "./components/home.component";
import { LandingPageComponent } from "./components/landing-page.component";
import { ProfileComponent } from "./components/profile.component";
import { ProfileRemoveProjectComponent } from "./components/profile-remove-project.component";
import { RemoveHistoryConfirmComponent } from "./components/remove-history.component";
import { TimelineComponent } from "./components/timeline.component";

// Services
import { AppProjectService } from "./app-project.service";
import { AuthGuard } from "./auth-guard.service";
import { CanDeactivateGuard } from "./can-deactivate-guard.service";
import { DynamicTitleResolve } from "./dynamic-title-resolve.service";

export { AppProjectService, AuthGuard, CanDeactivateGuard, DynamicTitleResolve };

const appCoreRoutes: Routes = [
  // Core
  { path: "", component: LandingPageComponent, data: { title: "Home" } },
  { path: "app/home", redirectTo: "", pathMatch: "full" },
  { path: "app/getting-started", component: GettingStartedComponent, data: { title: "Getting Started" } },

  {
    path: "edit/:timeline-name",
    component: HistoryOverviewComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { title: DynamicTitleResolve }
  },

  {
    path: "history/:timeline-name",
    component: HistoryOverviewComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard],
    resolve: { title: DynamicTitleResolve }
  },

  {
    path: ":username",
    component: ProfileComponent,
    resolve: { title: DynamicTitleResolve }
  },
  {
    path: ":username/:timeline",
    component: TimelineComponent,
    resolve: { title: DynamicTitleResolve }
  }
];

const coreConfig: ICoreConfig = {
  environment: settings.environment,
  serviceApiUrl: settings.serviceApiUrl,
  serviceODataUrl: settings.serviceODataUrl
};

@NgModule({
  declarations: [
    CoreComponent,
    GettingStartedComponent,
    HistoryOverviewComponent,
    HomeComponent,
    LandingPageComponent,
    ProfileComponent,
    ProfileRemoveProjectComponent,
    RemoveHistoryConfirmComponent,
    TimelineComponent
  ],
  entryComponents: [ProfileRemoveProjectComponent, RemoveHistoryConfirmComponent],
  exports: [RouterModule, CoreComponent],
  imports: [BrowserModule, BrowserAnimationsModule, RouterModule.forRoot(appCoreRoutes), Angulartics2Module.forRoot(), CoreModule.configure(coreConfig), SharedModule],
  providers: [
    AuthGuard,
    CanDeactivateGuard,
    DynamicTitleResolve,
    // Project service
    {
      provide: ProjectService,
      useClass: AppProjectService
    }
  ]
})
export class AppCoreModule {}
