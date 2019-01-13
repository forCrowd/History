import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { AuthService, Element, Project, ProjectService, User } from "@forcrowd/backbone-client-core";
import { flatMap } from "rxjs/operators";

import { Timeline } from "../entities/timeline";
import { RemoveTimelineComponent } from "./remove-timeline.component";

@Component({
  selector: "profile",
  templateUrl: "profile.component.html",
  styleUrls: ["profile.component.css"]
})
export class ProfileComponent implements OnInit {
  activeProject: Project = null;
  activeUser: User = null;
  isBusy = false;
  isOwner = false;
  Timeline = Timeline;
  timelineName = "";

  get timelines() {
    if (!this.activeProject) {
      return [];
    }

    return this.activeProject.ElementSet as Timeline[];
  }

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly matDialog: MatDialog,
    private readonly projectService: ProjectService,
    private readonly router: Router
  ) {}

  create() {
    this.timelineName = this.timelineName.trim();

    if (!this.timelineName) {
      return;
    }

    const timeline = {
      Project: this.activeProject,
      Name: this.timelineName
    };

    this.projectService.createElement(timeline);

    this.isBusy = true;
    this.projectService.saveChanges().subscribe(
      () => {
        this.timelineName = "";
      },
      null,
      () => {
        this.isBusy = false;
      }
    );
  }

  delete(timeline: Element) {
    const dialogRef = this.matDialog.open(RemoveTimelineComponent);

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      this.projectService.removeElement(timeline);
      this.projectService.saveChanges().subscribe();
    });
  }

  ngOnInit(): void {
    const userName = this.activatedRoute.snapshot.params["username"];

    this.isBusy = true;
    this.authService
      .getUser(userName)
      .pipe(
        flatMap(user => {
          if (user === null) {
            const url = window.location.href.replace(window.location.origin, "");
            this.router.navigate(["/app/not-found", { url: url }]);
            return;
          }

          this.activeUser = user;
          this.isOwner = this.authService.currentUser === user;

          this.activeProject = user.ProjectSet.find(e => e.Origin === "http://history.forcrowd.org");

          if (this.activeProject === null) {
            const url = window.location.href.replace(window.location.origin, "");
            this.router.navigate(["/app/not-found", { url: url }]);
            return;
          }

          return this.projectService.getProjectExpanded(this.activeProject.Id);
        })
      )
      .subscribe(null, null, () => {
        this.isBusy = false;
      });
  }
}
