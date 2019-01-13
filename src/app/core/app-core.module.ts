import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from "@angular/router";
import { Angulartics2Module } from "angulartics2";
import { CoreModule, ICoreConfig, ProjectService } from "@forcrowd/backbone-client-core";

import { settings } from "../../settings/settings";
import { SharedModule } from "../shared/shared.module";
import { Timeline } from "./entities/timeline";

// Components
import { CoreComponent } from "./components/core.component";
import { GettingStartedComponent } from "./components/getting-started.component";
import { HomeComponent } from "./components/home.component";
import { LandingPageComponent } from "./components/landing-page.component";
import { ProfileComponent } from "./components/profile.component";
import { RemoveItemComponent } from "./components/remove-item.component";
import { RemoveTimelineComponent } from "./components/remove-timeline.component";
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
    path: ":username",
    component: ProfileComponent,
    resolve: { title: DynamicTitleResolve }
  },
  {
    path: ":username/:timeline-key",
    component: TimelineComponent,
    resolve: { title: DynamicTitleResolve }
  }
];

const coreConfig: ICoreConfig = {
  environment: settings.environment,
  serviceApiUrl: settings.serviceApiUrl,
  serviceODataUrl: settings.serviceODataUrl,
  entityManagerConfig: {
    elementType: Timeline
  }
};

@NgModule({
  // tslint:disable-next-line:max-line-length
  declarations: [CoreComponent, GettingStartedComponent, HomeComponent, LandingPageComponent, ProfileComponent, RemoveTimelineComponent, RemoveItemComponent, TimelineComponent],
  entryComponents: [RemoveItemComponent, RemoveTimelineComponent],
  exports: [RouterModule, CoreComponent],
  // tslint:disable-next-line:max-line-length
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
