import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Project, AuthService, ProjectService, Element, ElementItem, ElementField, ElementCell } from "@forcrowd/backbone-client-core";
import { RemoveHistoryConfirmComponent } from "./remove-history.component";
import { AppProjectService } from "../app-core.module";
import { finalize } from "rxjs/operators";

@Component({
  selector: "history",
  templateUrl: "history.component.html",
  styleUrls: ["history.component.css"],
})
export class HistoryComponent implements OnInit {

  entry: string = "";
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
  get selectedElementCell(): ElementCell {
    return this.fields.selectedCell;
  }
  set selectedElementCell(value: ElementCell) {
    if (this.fields.selectedCell !== value) {
      this.fields.selectedCell = value;
    }
  }

  private fields: {
    selectedElement: Element,
    selectedElementField: ElementField,
    selectedElementCellSet: ElementCell[],
    selectedCell: ElementCell,
  } = {
    selectedElement: null,
    selectedElementField: null,
    selectedElementCellSet: null,
    selectedCell: null
    }

  constructor(private authService: AuthService,
    private projectService: ProjectService,
    private dialog: MatDialog) {
  }

  cancelEditing() {
    this.entry = "";
    this.selectedElementCell = null
  }

  // Create project
  createProjectHistory(): void {
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

    if (this.selectedElementCell === null) {
      // New Item
      const elementItem = this.projectService.createElementItem({
        Element: this.selectedElement,
        Name: `History ${this.selectedElement.ElementItemSet.length  + 1}`,
      }) as ElementItem;

      // Cell
      this.projectService.createElementCell({
        ElementField: this.selectedElementField,
        ElementItem: elementItem,
        StringValue: this.entry,
      });
    } else {
      // change cell string value
      this.selectedElementCell.StringValue = this.entry;
    }

    this.projectService.saveChanges().subscribe(() => {
      this.selectedElementCell = null;
      this.entry = "";
      this.loadProject(this.project.Id);
      this.isBusy = false;
    });

  }

  edit(elementCell: ElementCell) {
    this.entry = elementCell.StringValue;
    this.selectedElementCell = elementCell;
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

      this.selectedElementCellSet = this.selectedElementCellSet.sort((a, b)=> (b.CreatedOn.getTime() - a.CreatedOn.getTime()));
      this.isBusy = false;
    });
  }

  removeHistoryItem(elementItem: ElementItem) {
    const dialogRef = this.dialog.open(RemoveHistoryConfirmComponent);

    dialogRef.afterClosed().subscribe(confirmed => {

      if (!confirmed) return;

      this.projectService.removeElementItem(elementItem);
      this.projectService.saveChanges().pipe(
        finalize(() => {
          this.loadProject(this.project.Id);
        })).subscribe();
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
