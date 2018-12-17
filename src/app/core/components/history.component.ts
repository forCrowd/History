import { Component, OnInit } from "@angular/core";
import { Project, AuthService, ProjectService, NotificationService, Element, ElementItem, ElementField, ElementCell } from "@forcrowd/backbone-client-core";
import { AppProjectService } from "../app-core.module";

@Component({
  selector: "history",
  templateUrl: "history.component.html",
  styleUrls: ["history.component.css"],
})
export class HistoryComponent implements OnInit {

  content: string = "";
  isBusy: boolean;
  project: Project = null;

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

  get selectedElementField(): ElementField {
    return this.fields.selectedElementField;
  }
  set selectedElementField(value: ElementField) {
    if (this.fields.selectedElementField !== value) {
      this.fields.selectedElementField = value;
    }
  }

  get selectedElementCellSet(): ElementCell[] {
    return this.fields.selectedElementCellSet;
  }
  set selectedElementCellSet(value: ElementCell[]) {
    if (this.fields.selectedElementCellSet !== value) {
      this.fields.selectedElementCellSet = value;
    }
  }

  private fields: {
    selectedElementField: ElementField,
    selectedElementCellSet: ElementCell[],
    selectedElement: Element
  } = {
    selectedElementField: null,
    selectedElementCellSet: null,
    selectedElement: null
    }

  constructor(private authService: AuthService,
    private projectService: ProjectService) {
  }

  // Create project
  createProjectHistory(): void {
    console.log(this.project);
    if (this.project === null) {
      this.project = (this.projectService as AppProjectService).createProjectHistory();
      this.projectService.saveChanges().subscribe( () => {
        this.isBusy = false;
      });
    }
  }

  // Create a new entry
  createHistroyContent(): void {
    if (!this.currentUser || !this.currentUser.isAuthenticated()) return;
    this.isBusy = true;

    // New Item
    const elementItem = this.projectService.createElementItem({
      Element: this.selectedElement,
      Name: `History ${this.selectedElement.ElementItemSet.length  + 1}`,
    }) as ElementItem;

    // Cell
    this.projectService.createElementCell({
      ElementField: this.selectedElementField,
      ElementItem: elementItem,
      StringValue: this.content,
    });

    this.projectService.saveChanges().subscribe(() => {
      this.isBusy = false;
    });

    this.content = "";
  }

  // Set project element and field
  loadProject(projectId: number) {
    this.projectService.getProjectExpanded<Project>(projectId)
    .subscribe(project => {

      if (!project) {
        return;
      }

      this.project = project;

      // Selected element
      this.selectedElement = this.project.ElementSet[0];

      // ElementField
      this.selectedElementField = this.selectedElement.ElementFieldSet[0];

      // ElementCellSet
      this.selectedElementCellSet = this.selectedElementField.ElementCellSet as ElementCell[];

      this.isBusy = false;
    });
  }

  ngOnInit(): void {
    this.isBusy = true;

    if (!this.currentUser || !this.currentUser.isAuthenticated()) return;

    this.authService.getUser(this.currentUser.UserName).subscribe(() => {

      for (var i = 0; i < this.currentUser.ProjectSet.length; i++) {

        var project = this.currentUser.ProjectSet[i];

        if (project.Name === "History App") {
          this.project = project;
          this.loadProject(this.project.Id);
          break;
        }
      }

      if (this.project === null) this.createProjectHistory();
    });

  }

 }
