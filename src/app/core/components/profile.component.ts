import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Project, AuthService, ProjectService, Element, ElementItem, ElementField, ElementFieldDataType, User } from "@forcrowd/backbone-client-core";

// Service
import { AppProjectService } from "../app-core.module";
import { ProfileRemoveProjectComponent } from './profile-remove-project.component';

@Component({
  selector: "profile",
  templateUrl: "profile.component.html",
  styleUrls: ["profile.component.css"],
})
export class ProfileComponent implements OnInit {

  entry: string = "";
  project: Project = null;
  profileUser: User = null;
  isBusy: boolean;

  get currentUser() {
    return this.authService.currentUser;
  }

  get selectedElement(): Element {
    return this.fields.selectedElement;
  }
  set selectedElement(value: Element) {
    if (this.fields.selectedElement !== value) {
      this.fields.selectedElement = value;
    }
  }

  private fields: {
    selectedElement: Element,
  } = {
      selectedElement: null,
    }

  constructor(private authService: AuthService,
    private projectService: ProjectService,
    private dialog: MatDialog) {
  }

  cancelEditing() {
    this.entry = "";
    this.isBusy = false;
  }

  // Create project (only one time)
  createProjectHistory(): void {
    this.isBusy = true;
    this.project = (this.projectService as AppProjectService).createProjectHistory();

    this.projectService.saveChanges().subscribe(() => {
      this.loadProject(this.project.Id);
      this.isBusy = false;
    });
  }

  // Create a new History Timeline
  createNewHistroyTimeline(): void {

    // New Timeline Element
    const element = this.projectService.createElement({
      Project: this.project,
      Name: this.entry
    }) as Element;

    // Field
    const elementField = this.projectService.createElementField({
      Element: element,
      Name: this.entry,
      DataType: ElementFieldDataType.String,
      SortOrder: 1
    }) as ElementField;

    // Item
    const elementItem = this.projectService.createElementItem({
      Element: element,
      Name: this.entry
    }) as ElementItem;

    // Cell
    this.projectService.createElementCell({
      ElementField: elementField,
      ElementItem: elementItem,
      StringValue: "First",
    });

    // Like Dislikes Count
    const elementField2 = this.projectService.createElementField({
      Element: element,
      Name: "likes",
      DataType: ElementFieldDataType.Decimal,
      UseFixedValue: false,
      RatingEnabled: false,
      SortOrder: 0
    }) as ElementField;

    // Item
    const elementItem2 = this.projectService.createElementItem({
      Element: element,
      Name: "likes"
    }) as ElementItem;

    // Cell
    const cell2 = this.projectService.createElementCell({
      ElementField: elementField2,
      ElementItem: elementItem2
    });

    this.projectService.createUserElementCell(cell2, 0);

    this.projectService.saveChanges().subscribe(() => {
      this.entry = "";
      this.isBusy = false;
    });

  }

  // Delete Timeline (history)
  deleteSelectedTimeline(element: Element): void {

    const dialogRef = this.dialog.open(ProfileRemoveProjectComponent);

    dialogRef.afterClosed().subscribe(confirmed => {

      if (!confirmed) {
        return;
      }

      this.projectService.removeElement(element);
      this.projectService.saveChanges().subscribe();
    });
  }

  // Set project element and field
  loadProject(projectId: number) {
    this.projectService.getProjectExpanded<Project>(projectId).subscribe(project => {
      if (!project) return;

      // Project
      this.project = project;
      this.isBusy = false;
    });
  }

  ngOnInit(): void {

    if (!this.currentUser || !this.currentUser.isAuthenticated()) {
      this.createProjectHistory();
      return;
    }

    this.authService.getUser(this.currentUser.UserName).subscribe((user) => {

      this.profileUser = user;

      for (var i = 0; i < this.currentUser.ProjectSet.length; i++) {

        var project = this.currentUser.ProjectSet[i];

        if (project.Name === "History App") {
          this.project = project;
          this.loadProject(this.project.Id);
          break;
        }
      }

    });
  }

}
