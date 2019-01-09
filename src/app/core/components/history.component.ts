import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Project, ProjectService } from "@forcrowd/backbone-client-core";

@Component({
  selector: "history",
  templateUrl: "history.component.html",
  styleUrls: ["history.component.css"]
})
export class HistoryComponent implements OnInit {
  project: Project = null;
  username: string = null;

  constructor(private activatedRoute: ActivatedRoute, private projectService: ProjectService) {}

  ngOnInit(): void {
    this.username = this.activatedRoute.snapshot.params["username"];

    this.projectService.getProjectSet<Project>(this.username).subscribe(projectSet => {
      for (let i = 0; i < projectSet.length; i++) {
        const project = projectSet[i];
        if (project.Name === "History App") {
          this.projectService.getProjectExpanded(project.Id).subscribe(projectExpanded => {
            this.project = projectExpanded;
          });
        }
      }
    });
  }
}
