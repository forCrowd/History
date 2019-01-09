import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService, ProjectService } from "@forcrowd/backbone-client-core";

import { AppProjectService } from "../app-core.module";

@Component({
  selector: "getting-started",
  templateUrl: "getting-started.component.html",
  styleUrls: ["getting-started.component.css"]
})
export class GettingStartedComponent implements OnInit {
  constructor(private readonly authService: AuthService, private readonly projectService: ProjectService, private router: Router) {}

  create() {
    const project = (this.projectService as AppProjectService).createProjectHistory();

    console.log("u", this.authService.currentUser.UserName);

    this.projectService.saveChanges().subscribe(() => {
      console.log("saved..");
      console.log("u2", this.authService.currentUser.UserName);
      console.log("p", project.Id);

      this.router.navigate([this.authService.currentUser.UserName]);
    });
  }

  ngOnInit(): void {
    if (this.authService.currentUser.isAuthenticated) {
      this.router.navigate([this.authService.currentUser.UserName]);
    }
  }
}
