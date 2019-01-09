import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { SharedModule } from "../../shared/shared.module";

import { AuthGuard, CanDeactivateGuard, DynamicTitleResolve } from "../../core/app-core.module";
import { HistoryComponent } from "./history.component";
import { RemoveHistoryConfirmComponent } from "./remove-history.component";

const projectRoutes: Routes = [
  { path: ":username", component: HistoryComponent, resolve: { title: DynamicTitleResolve } },
  { path: ":username", component: HistoryComponent, resolve: { title: DynamicTitleResolve }, children: [
    { path: ":timeline", component: HistoryComponent, resolve: { title: DynamicTitleResolve }, },
  ]},
];

@NgModule({
  declarations: [
    HistoryComponent,
    RemoveHistoryConfirmComponent,
  ],
  entryComponents: [
    RemoveHistoryConfirmComponent,
  ],
  exports: [
    RouterModule,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(projectRoutes),
  ]
})
export class HistoryModule { }
