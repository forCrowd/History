import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { AuthService, Element, Project, ProjectService } from "@forcrowd/backbone-client-core";

import { ProfileRemoveProjectComponent } from "./profile-remove-project.component";

@Component({
  selector: "profile",
  templateUrl: "profile.component.html",
  styleUrls: ["profile.component.css"]
})
export class ProfileComponent implements OnInit {
  isBusy = false;
  isOwner = false;
  project: Project = null;
  timelineName = "";
  username: string = null;

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
      Project: this.project,
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
    const dialogRef = this.matDialog.open(ProfileRemoveProjectComponent);

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      this.projectService.removeElement(timeline);
      this.projectService.saveChanges().subscribe();
    });
  }

  ngOnInit(): void {
    this.username = this.activatedRoute.snapshot.params["username"];

    if (!this.username) {
      const command = this.authService.currentUser.isAuthenticated() ? this.authService.currentUser.UserName : "";

      this.router.navigate([command]);
      return;
    }

    this.isOwner = this.authService.currentUser.UserName === this.username;

    this.isBusy = true;
    this.projectService.getProjectSet(this.username).subscribe(
      projectSet => {
        for (let i = 0; i < projectSet.length; i++) {
          const project = projectSet[i];
          if (project.Name === "History App") {
            this.projectService.getProjectExpanded(project.Id).subscribe(projectExpanded => {
              this.project = projectExpanded;
            });
          }
        }
      },
      null,
      () => {
        this.isBusy = false;
      }
    );
  }
}
