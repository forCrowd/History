import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { Project, ProjectService, AuthService } from "@forcrowd/backbone-client-core";

@Component({
  selector: "profile",
  templateUrl: "profile.component.html",
  styleUrls: ["profile.component.css"]
})
export class ProfileComponent implements OnInit {
  isBusy = false;
  project: Project = null;
  timelineName = "";
  username: string = null;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
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

  ngOnInit(): void {
    this.username = this.activatedRoute.snapshot.params["username"];

    if (!this.username) {
      const command = this.authService.currentUser.isAuthenticated() ? this.authService.currentUser.UserName : "";

      this.router.navigate([command]);
      return;
    }

    this.isBusy = true;
    this.projectService.getProjectSet<Project>(this.username).subscribe(
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
